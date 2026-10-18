import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser } from '@/lib/auth';
import { Student } from '@/models/Student';
import { Unit } from '@/models/Unit';
import { TestEvent } from '@/models/TestEvent';
import { TestRegistration } from '@/models/TestRegistration';
import { TestRegistrationBatch } from '@/models/TestRegistrationBatch';
import { CommissionLedger } from '@/models/CommissionLedger';
import { TestResult } from '@/models/TestResult';
import { Payment } from '@/models/Payment';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const now = new Date();

    if (session.role === 'SUPER_ADMIN') {
      // 1. Overall Totals
      const [
        totalStudents,
        activeStudents,
        totalUnits,
        activeUnits,
        upcomingTests,
        completedTests,
        totalConfirmedRegistrations,
        financeTotals,
        pendingBatchesCount,
      ] = await Promise.all([
        Student.countDocuments({ status: { $ne: 'Archived' } }),
        Student.countDocuments({ status: 'Active' }),
        Unit.countDocuments({}),
        Unit.countDocuments({ status: 'ACTIVE' }),
        TestEvent.countDocuments({ status: { $in: ['Upcoming', 'Registration Open'] } }),
        TestEvent.countDocuments({ status: 'Completed' }),
        TestRegistration.countDocuments({ status: 'CONFIRMED' }),
        CommissionLedger.aggregate([
          {
            $group: {
              _id: null,
              totalGross: { $sum: '$grossAmount' },
              totalCommission: { $sum: '$commissionEarned' },
              totalOrgShare: { $sum: '$organizationShare' },
            },
          },
        ]),
        TestRegistrationBatch.countDocuments({ paymentStatus: 'PENDING' }),
      ]);

      const totalGross = financeTotals[0]?.totalGross || 0;
      const totalCommission = financeTotals[0]?.totalCommission || 0;
      const totalOrgShare = financeTotals[0]?.totalOrgShare || 0;

      // 2. Charts Aggregations
      // A. Student growth by creation month (last 6 months)
      const studentGrowth = await Student.aggregate([
        { $match: { status: { $ne: 'Archived' } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const studentGrowthFormatted = studentGrowth.map((g) => ({
        label: `${months[g._id.month - 1]} ${g._id.year}`,
        students: g.count,
      }));

      // B. Students by Unit
      const studentsByUnit = await Student.aggregate([
        { $match: { status: 'Active' } },
        {
          $group: {
            _id: '$unitId',
            count: { $sum: 1 },
          },
        },
        { $lookup: { from: 'units', localField: '_id', foreignField: '_id', as: 'unit' } },
        { $unwind: '$unit' },
        { $project: { name: '$unit.name', code: '$unit.unitCode', count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]);

      // C. Belt distribution
      const beltDistribution = await Student.aggregate([
        { $match: { status: 'Active' } },
        {
          $group: {
            _id: '$currentBelt',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      // D. Results distribution (Pass, Fail, Absent, Pending)
      const resultsDistribution = await TestResult.aggregate([
        {
          $group: {
            _id: '$resultStatus',
            count: { $sum: 1 },
          },
        },
      ]);

      // E. Revenue & Commission by month
      const monthlyRevenue = await CommissionLedger.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
            gross: { $sum: '$grossAmount' },
            commission: { $sum: '$commissionEarned' },
            orgShare: { $sum: '$organizationShare' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 6 },
      ]);

      const monthlyRevenueFormatted = monthlyRevenue.map((m) => ({
        month: `${months[m._id.month - 1]} ${m._id.year}`,
        gross: m.gross,
        commission: m.commission,
        orgShare: m.orgShare,
      }));

      // F. Recent tests, registrations, and transactions
      const [recentTests, recentBatches, recentPayments] = await Promise.all([
        TestEvent.find().sort({ testDate: -1 }).limit(5),
        TestRegistrationBatch.find().populate('unitId', 'name unitCode').populate('testEventId', 'name code').sort({ createdAt: -1 }).limit(5),
        Payment.find().populate('unitId', 'name unitCode').sort({ createdAt: -1 }).limit(5),
      ]);

      return NextResponse.json({
        role: 'SUPER_ADMIN',
        summary: {
          totalStudents,
          activeStudents,
          totalUnits,
          activeUnits,
          upcomingTests,
          completedTests,
          totalConfirmedRegistrations,
          totalGross,
          totalCommission,
          totalOrgShare,
          pendingBatchesCount,
        },
        charts: {
          studentGrowth: studentGrowthFormatted,
          studentsByUnit,
          beltDistribution: beltDistribution.map((b) => ({ belt: b._id || 'Unknown', count: b.count })),
          resultsDistribution: resultsDistribution.map((r) => ({ status: r._id, count: r.count })),
          monthlyRevenue: monthlyRevenueFormatted,
        },
        recent: {
          tests: recentTests,
          batches: recentBatches,
          payments: recentPayments,
        },
      });
    } else {
      // UNIT ROLE DASHBOARD
      const unitObjectId = new mongoose.Types.ObjectId(session.unitId!);

      const [
        totalStudents,
        activeStudents,
        upcomingTestsAvailable,
        enrolledUpcomingStudents,
        completedTestsAttended,
        financialAgg,
        recentPayments,
        recentBatches,
        unitBeltDistribution,
        unitResultsAgg,
      ] = await Promise.all([
        Student.countDocuments({ unitId: unitObjectId, status: { $ne: 'Archived' } }),
        Student.countDocuments({ unitId: unitObjectId, status: 'Active' }),
        TestEvent.countDocuments({ status: 'Registration Open' }),
        TestRegistration.countDocuments({ unitId: unitObjectId, status: 'CONFIRMED' }),
        TestEvent.countDocuments({ status: 'Completed' }),
        CommissionLedger.aggregate([
          { $match: { unitId: unitObjectId } },
          {
            $group: {
              _id: null,
              totalPaid: { $sum: '$grossAmount' },
              totalCommission: { $sum: '$commissionEarned' },
            },
          },
        ]),
        Payment.find({ unitId: unitObjectId }).sort({ createdAt: -1 }).limit(5),
        TestRegistrationBatch.find({ unitId: unitObjectId }).populate('testEventId', 'name code testDate').sort({ createdAt: -1 }).limit(5),
        Student.aggregate([
          { $match: { unitId: unitObjectId, status: 'Active' } },
          { $group: { _id: '$currentBelt', count: { $sum: 1 } } },
        ]),
        TestResult.aggregate([
          { $match: { unitId: unitObjectId, isPublished: true } },
          { $group: { _id: '$resultStatus', count: { $sum: 1 } } },
        ]),
      ]);

      const totalAmountPaid = financialAgg[0]?.totalPaid || 0;
      const totalCommissionEarned = financialAgg[0]?.totalCommission || 0;

      return NextResponse.json({
        role: 'UNIT',
        summary: {
          totalStudents,
          activeStudents,
          upcomingTestsAvailable,
          enrolledUpcomingStudents,
          completedTestsAttended,
          totalAmountPaid,
          totalCommissionEarned,
        },
        charts: {
          beltDistribution: unitBeltDistribution.map((b) => ({ belt: b._id || 'Unknown', count: b.count })),
          resultsDistribution: unitResultsAgg.map((r) => ({ status: r._id, count: r.count })),
        },
        recent: {
          payments: recentPayments,
          batches: recentBatches,
        },
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch analytics';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
