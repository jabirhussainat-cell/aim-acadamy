import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { requireSuperAdmin, logAudit } from '@/lib/auth';
import { AffiliationRequest } from '@/models/AffiliationRequest';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSuperAdmin(req);
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { rejectionReason } = body;

    await connectToDatabase();

    const request = await AffiliationRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: 'Affiliation request not found' }, { status: 404 });
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json(
        { error: `This application has already been ${request.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    request.status = 'REJECTED';
    request.rejectionReason = rejectionReason ? String(rejectionReason).trim() : 'Does not meet current affiliation criteria';
    request.reviewedBy = new mongoose.Types.ObjectId(session.userId);
    request.reviewedByName = session.name;
    request.reviewedAt = new Date();
    await request.save();

    await logAudit({
      action: 'REJECT_UNIT_AFFILIATION',
      resourceType: 'AffiliationRequest',
      resourceId: request._id.toString(),
      details: {
        applicationNumber: request.applicationNumber,
        unitName: request.unitName,
        reason: request.rejectionReason,
      },
      user: session,
    });

    return NextResponse.json({
      success: true,
      message: `Affiliation request ${request.applicationNumber} has been rejected.`,
      request: {
        id: request._id,
        applicationNumber: request.applicationNumber,
        status: request.status,
        rejectionReason: request.rejectionReason,
      },
    });
  } catch (err: unknown) {
    console.error('Reject affiliation error:', err);
    const message = err instanceof Error ? err.message : 'Failed to reject affiliation request';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
