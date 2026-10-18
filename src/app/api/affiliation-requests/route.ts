import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser, requireSuperAdmin } from '@/lib/auth';
import { AffiliationRequest } from '@/models/AffiliationRequest';

async function generateNextApplicationNumber(): Promise<string> {
  const latest = await AffiliationRequest.findOne({}, { applicationNumber: 1 }).sort({ applicationNumber: -1 });
  let nextNum = 101;
  if (latest && latest.applicationNumber) {
    const match = latest.applicationNumber.match(/\d+/);
    if (match) {
      nextNum = Math.max(nextNum, parseInt(match[0], 10) + 1);
    }
  }
  return `AIM-AFF-${nextNum}`;
}

// GET: Super Admin views all affiliation requests
export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin(req);
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim();

    const filter: Record<string, unknown> = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { applicationNumber: { $regex: search, $options: 'i' } },
        { unitName: { $regex: search, $options: 'i' } },
        { headPerson: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const [requests, totalCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      AffiliationRequest.find(filter).sort({ createdAt: -1 }),
      AffiliationRequest.countDocuments({}),
      AffiliationRequest.countDocuments({ status: 'PENDING' }),
      AffiliationRequest.countDocuments({ status: 'APPROVED' }),
      AffiliationRequest.countDocuments({ status: 'REJECTED' }),
    ]);

    return NextResponse.json({
      requests,
      counts: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch affiliation requests';
    const status = message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// POST: Public endpoint to submit a new Unit Affiliation Request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      unitName,
      headPerson,
      contactNumber,
      email,
      district,
      city,
      address,
      pincode,
      disciplinesOffered,
      instructorQualifications,
      activeStudentsCount,
      additionalNotes,
    } = body;

    // Strict validation
    if (!unitName || !headPerson || !contactNumber || !email || !district || !city || !address || !pincode || !instructorQualifications) {
      return NextResponse.json(
        { error: 'Please provide all required fields including unit name, head instructor, contact details, location, and qualifications.' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    // Phone validation
    const cleanPhone = String(contactNumber).replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'Please provide a valid 10-digit contact phone number.' }, { status: 400 });
    }

    await connectToDatabase();

    // Check for existing pending request with same phone or email
    const existing = await AffiliationRequest.findOne({
      $or: [{ email: email.toLowerCase() }, { contactNumber: cleanPhone }],
      status: 'PENDING',
    });

    if (existing) {
      return NextResponse.json(
        {
          error: `An active affiliation request with this email or phone is already pending review (Application No: ${existing.applicationNumber}). Please contact helpline: 8943839386 for status updates.`,
        },
        { status: 409 }
      );
    }

    const applicationNumber = await generateNextApplicationNumber();

    const newRequest = await AffiliationRequest.create({
      applicationNumber,
      unitName: unitName.trim(),
      headPerson: headPerson.trim(),
      contactNumber: cleanPhone,
      email: email.toLowerCase().trim(),
      district: district.trim(),
      city: city.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
      country: 'India',
      disciplinesOffered: Array.isArray(disciplinesOffered) ? disciplinesOffered : [],
      instructorQualifications: instructorQualifications.trim(),
      activeStudentsCount: Number(activeStudentsCount) || 0,
      additionalNotes: additionalNotes ? String(additionalNotes).trim() : '',
      status: 'PENDING',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Your unit affiliation application has been submitted successfully. The AIM Academy board will review your credentials and contact you.',
        applicationNumber: newRequest.applicationNumber,
        request: {
          id: newRequest._id,
          applicationNumber: newRequest.applicationNumber,
          unitName: newRequest.unitName,
          headPerson: newRequest.headPerson,
          createdAt: newRequest.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('Affiliation request error:', err);
    const message = err instanceof Error ? err.message : 'Failed to submit unit affiliation request';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
