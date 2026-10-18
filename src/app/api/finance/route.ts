import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser } from '@/lib/auth';
import { Payment } from '@/models/Payment';
import { CommissionLedger } from '@/models/CommissionLedger';
import { Unit } from '@/models/Unit';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const isSuperAdmin = session.role === 'SUPER_ADMIN';
    const filter: Record<string, unknown> = {};

    if (!isSuperAdmin) {
      filter.unitId = new mongoose.Types.ObjectId(session.unitId!);
    }

    // Fetch payments
    const payments = await Payment.find(filter)
      .populate('unitId', 'name unitCode headPerson contactNumber')
      .populate({
        path: 'batchId',
        populate: { path: 'testEventId', select: 'name code testDate discipline' },
      })
      .sort({ createdAt: -1 });

    // Fetch commission ledger
    const ledger = await CommissionLedger.find(filter)
      .populate('unitId', 'name unitCode')
      .populate('testEventId', 'name code')
      .populate('paymentId', 'receiptNumber')
      .sort({ date: -1 });

    // Aggregations
    const totals = ledger.reduce(
      (acc, item) => {
        acc.gross += item.grossAmount || 0;
        acc.commission += item.commissionEarned || 0;
        acc.orgShare += item.organizationShare || 0;
        return acc;
      },
      { gross: 0, commission: 0, orgShare: 0 }
    );

    // Unit-wise revenue & commission breakdown (for Super Admin)
    let unitBreakdown: Array<{
      unitId: string;
      unitName: string;
      unitCode: string;
      totalGross: number;
      commissionEarned: number;
      orgShare: number;
      batchesCount: number;
    }> = [];

    if (isSuperAdmin) {
      const grouped = await CommissionLedger.aggregate([
        {
          $group: {
            _id: '$unitId',
            totalGross: { $sum: '$grossAmount' },
            commissionEarned: { $sum: '$commissionEarned' },
            orgShare: { $sum: '$organizationShare' },
            batchesCount: { $sum: 1 },
          },
        },
        { $lookup: { from: 'units', localField: '_id', foreignField: '_id', as: 'unit' } },
        { $unwind: '$unit' },
      ]);

      unitBreakdown = grouped.map((g) => ({
        unitId: g._id.toString(),
        unitName: g.unit.name,
        unitCode: g.unit.unitCode,
        totalGross: g.totalGross,
        commissionEarned: g.commissionEarned,
        orgShare: g.orgShare,
        batchesCount: g.batchesCount,
      }));
    }

    return NextResponse.json({
      totals,
      payments,
      ledger,
      unitBreakdown,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch financial data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
