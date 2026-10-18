import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser } from '@/lib/auth';
import { Student } from '@/models/Student';
import { Unit } from '@/models/Unit';
import { TestRegistration } from '@/models/TestRegistration';
import { TestResult } from '@/models/TestResult';
import { Payment } from '@/models/Payment';
import { CommissionLedger } from '@/models/CommissionLedger';

function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'students';
    const testId = searchParams.get('testId');

    let csvContent = '';
    let filename = `${type}_export_${Date.now()}.csv`;

    if (type === 'students') {
      const filter: Record<string, unknown> = { status: { $ne: 'Archived' } };
      if (session.role === 'UNIT') {
        filter.unitId = new mongoose.Types.ObjectId(session.unitId!);
      }

      const students = await Student.find(filter).populate('unitId', 'name unitCode');
      const headers = [
        'Registration Number',
        'Full Name',
        'Discipline',
        'Current Belt',
        'Date of Birth',
        'Gender',
        'Contact Number',
        'Unit Code',
        'Unit Name',
        'Parent Name',
        'Parent Contact',
        'School Name',
        'Status',
      ];

      const rows = students.map((s) => [
        s.registrationNumber,
        s.fullName,
        s.discipline,
        s.currentBelt,
        s.dateOfBirth ? new Date(s.dateOfBirth).toISOString().split('T')[0] : '',
        s.gender,
        s.contactNumber,
        (s.unitId as unknown as { unitCode: string })?.unitCode || '',
        (s.unitId as unknown as { name: string })?.name || '',
        s.parentName,
        s.parentContact,
        s.schoolName,
        s.status,
      ]);

      csvContent = [headers.join(','), ...rows.map((r) => r.map(escapeCsvField).join(','))].join('\n');
      filename = `students_${Date.now()}.csv`;
    } else if (type === 'units' && session.role === 'SUPER_ADMIN') {
      const units = await Unit.find({}).sort({ unitCode: 1 });
      const headers = [
        'Unit Code',
        'Unit Name',
        'Head Person',
        'Contact Number',
        'Email',
        'City',
        'State',
        'Status',
        'Registration Date',
      ];

      const rows = units.map((u) => [
        u.unitCode,
        u.name,
        u.headPerson,
        u.contactNumber,
        u.email,
        u.city,
        u.state,
        u.status,
        u.registrationDate ? new Date(u.registrationDate).toISOString().split('T')[0] : '',
      ]);

      csvContent = [headers.join(','), ...rows.map((r) => r.map(escapeCsvField).join(','))].join('\n');
      filename = `units_${Date.now()}.csv`;
    } else if (type === 'results') {
      const filter: Record<string, unknown> = {};
      if (session.role === 'UNIT') {
        filter.unitId = new mongoose.Types.ObjectId(session.unitId!);
        filter.isPublished = true;
      }
      if (testId && mongoose.Types.ObjectId.isValid(testId)) {
        filter.testEventId = new mongoose.Types.ObjectId(testId);
      }

      const results = await TestResult.find(filter)
        .populate('studentId', 'fullName registrationNumber')
        .populate('unitId', 'name unitCode')
        .populate('testEventId', 'name code testDate');

      const headers = [
        'Test Code',
        'Test Name',
        'Student Reg No',
        'Student Name',
        'Unit Code',
        'Unit Name',
        'Attempted Belt',
        'Result Status',
        'Marks',
        'Awarded Belt',
        'Examiner Master',
      ];

      const rows = results.map((r) => [
        (r.testEventId as unknown as { code: string })?.code || '',
        (r.testEventId as unknown as { name: string })?.name || '',
        (r.studentId as unknown as { registrationNumber: string })?.registrationNumber || '',
        (r.studentId as unknown as { fullName: string })?.fullName || '',
        (r.unitId as unknown as { unitCode: string })?.unitCode || '',
        (r.unitId as unknown as { name: string })?.name || '',
        r.targetBelt,
        r.resultStatus,
        r.marks ?? '',
        r.beltAwarded ?? '',
        r.examinerMaster ?? '',
      ]);

      csvContent = [headers.join(','), ...rows.map((r) => r.map(escapeCsvField).join(','))].join('\n');
      filename = `results_${Date.now()}.csv`;
    } else if (type === 'payments') {
      const filter: Record<string, unknown> = {};
      if (session.role === 'UNIT') {
        filter.unitId = new mongoose.Types.ObjectId(session.unitId!);
      }

      const payments = await Payment.find(filter).populate('unitId', 'name unitCode');
      const headers = [
        'Receipt Number',
        'Payment ID',
        'Unit Code',
        'Unit Name',
        'Amount (INR)',
        'Status',
        'Payment Method',
        'Date',
      ];

      const rows = payments.map((p) => [
        p.receiptNumber,
        p.razorpayPaymentId || '',
        (p.unitId as unknown as { unitCode: string })?.unitCode || '',
        (p.unitId as unknown as { name: string })?.name || '',
        p.amount,
        p.status,
        p.paymentMethod || 'Online',
        p.paidAt ? new Date(p.paidAt).toISOString() : '',
      ]);

      csvContent = [headers.join(','), ...rows.map((r) => r.map(escapeCsvField).join(','))].join('\n');
      filename = `payments_${Date.now()}.csv`;
    } else if (type === 'commissions') {
      const filter: Record<string, unknown> = {};
      if (session.role === 'UNIT') {
        filter.unitId = new mongoose.Types.ObjectId(session.unitId!);
      }

      const ledger = await CommissionLedger.find(filter)
        .populate('unitId', 'name unitCode')
        .populate('testEventId', 'code name');

      const headers = [
        'Date',
        'Unit Code',
        'Unit Name',
        'Test Code',
        'Gross Amount',
        'Commission Rate (%)',
        'Commission Earned',
        'Organization Share',
        'Status',
      ];

      const rows = ledger.map((l) => [
        l.date ? new Date(l.date).toISOString().split('T')[0] : '',
        (l.unitId as unknown as { unitCode: string })?.unitCode || '',
        (l.unitId as unknown as { name: string })?.name || '',
        (l.testEventId as unknown as { code: string })?.code || '',
        l.grossAmount,
        l.commissionRate,
        l.commissionEarned,
        l.organizationShare,
        l.status,
      ]);

      csvContent = [headers.join(','), ...rows.map((r) => r.map(escapeCsvField).join(','))].join('\n');
      filename = `commissions_${Date.now()}.csv`;
    } else {
      return NextResponse.json({ error: 'Invalid export type or unauthorized' }, { status: 400 });
    }

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
