import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser, requireSuperAdmin, logAudit } from '@/lib/auth';
import { OrganizationSettings } from '@/models/OrganizationSettings';

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await OrganizationSettings.findOne({});
    if (!settings) {
      settings = await OrganizationSettings.create({
        organizationName: 'AIM Martial Arts Academy',
        tagline: 'Excellence, Discipline, Mastery',
        contactPhone: '8943839386',
        contactEmail: 'info@aimacademy.org',
        defaultTestFee: 400,
        defaultCommissionRate: 10,
        currency: 'INR',
      });
    }
    return NextResponse.json({ settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireSuperAdmin(req);
    const body = await req.json();

    await connectToDatabase();
    let settings = await OrganizationSettings.findOne({});
    if (!settings) {
      settings = new OrganizationSettings();
    }

    if (body.organizationName) settings.organizationName = body.organizationName.trim();
    if (body.tagline) settings.tagline = body.tagline.trim();
    if (body.contactPhone) settings.contactPhone = body.contactPhone.trim();
    if (body.contactEmail) settings.contactEmail = body.contactEmail.trim();
    if (body.address) settings.address = body.address.trim();
    if (body.city) settings.city = body.city.trim();
    if (body.state) settings.state = body.state.trim();
    if (body.pincode) settings.pincode = body.pincode.trim();
    if (body.defaultTestFee !== undefined) settings.defaultTestFee = Number(body.defaultTestFee);
    if (body.defaultCommissionRate !== undefined) settings.defaultCommissionRate = Number(body.defaultCommissionRate);
    if (body.currency) settings.currency = body.currency.trim();

    await settings.save();

    await logAudit({
      action: 'UPDATE_ORGANIZATION_SETTINGS',
      resourceType: 'OrganizationSettings',
      resourceId: settings._id.toString(),
      details: {
        defaultTestFee: settings.defaultTestFee,
        defaultCommissionRate: settings.defaultCommissionRate,
      },
      user: session,
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
