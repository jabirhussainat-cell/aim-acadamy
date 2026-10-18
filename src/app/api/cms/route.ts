import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getSessionUser, requireSuperAdmin, logAudit } from '@/lib/auth';
import { PublicWebsiteContent } from '@/models/PublicWebsiteContent';
import { MartialArtDiscipline } from '@/models/MartialArtDiscipline';
import { Master } from '@/models/Master';

export async function GET() {
  try {
    await connectToDatabase();

    const [content, disciplines, masters] = await Promise.all([
      PublicWebsiteContent.findOne({}),
      MartialArtDiscipline.find({ status: 'ACTIVE' }).sort({ name: 1 }),
      Master.find({ status: 'ACTIVE' }).sort({ displayOrder: 1 }),
    ]);

    return NextResponse.json({
      content,
      disciplines,
      masters,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch website content';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireSuperAdmin(req);
    const body = await req.json();

    await connectToDatabase();

    const { type, content, discipline, master } = body;

    if (type === 'CONTENT' && content) {
      let doc = await PublicWebsiteContent.findOne({});
      if (!doc) doc = new PublicWebsiteContent();

      if (content.heroTitle) doc.heroTitle = content.heroTitle.trim();
      if (content.heroSubtitle) doc.heroSubtitle = content.heroSubtitle.trim();
      if (content.heroBadge) doc.heroBadge = content.heroBadge.trim();
      if (content.aboutTitle) doc.aboutTitle = content.aboutTitle.trim();
      if (content.aboutText) doc.aboutText = content.aboutText.trim();
      if (content.philosophyTitle) doc.philosophyTitle = content.philosophyTitle.trim();
      if (content.philosophyText) doc.philosophyText = content.philosophyText.trim();
      if (Array.isArray(content.values)) doc.values = content.values;
      if (Array.isArray(content.benefits)) doc.benefits = content.benefits;
      if (content.beltSystemOverview) doc.beltSystemOverview = content.beltSystemOverview.trim();
      if (content.contactPhone) doc.contactPhone = content.contactPhone.trim();
      if (content.contactEmail) doc.contactEmail = content.contactEmail.trim();
      if (content.contactAddress) doc.contactAddress = content.contactAddress.trim();

      await doc.save();

      await logAudit({
        action: 'UPDATE_WEBSITE_CMS_CONTENT',
        resourceType: 'PublicWebsiteContent',
        resourceId: doc._id.toString(),
        user: session,
      });

      return NextResponse.json({ success: true, message: 'Website content updated', content: doc });
    }

    if (type === 'DISCIPLINE' && discipline) {
      let disc;
      if (discipline._id) {
        disc = await MartialArtDiscipline.findById(discipline._id);
        if (disc) {
          if (discipline.name) disc.name = discipline.name.trim();
          if (discipline.description) disc.description = discipline.description.trim();
          if (Array.isArray(discipline.beltHierarchy)) disc.beltHierarchy = discipline.beltHierarchy;
          if (discipline.status) disc.status = discipline.status;
          await disc.save();
        }
      } else {
        disc = await MartialArtDiscipline.create({
          name: discipline.name.trim(),
          code: discipline.code.trim().toUpperCase(),
          description: discipline.description.trim(),
          beltHierarchy: discipline.beltHierarchy,
          status: 'ACTIVE',
        });
      }
      return NextResponse.json({ success: true, message: 'Discipline saved', discipline: disc });
    }

    if (type === 'MASTER' && master) {
      let m;
      if (master._id) {
        m = await Master.findById(master._id);
        if (m) {
          if (master.name) m.name = master.name.trim();
          if (master.title) m.title = master.title.trim();
          if (master.discipline) m.discipline = master.discipline.trim();
          if (master.experienceYears !== undefined) m.experienceYears = Number(master.experienceYears);
          if (master.bio) m.bio = master.bio.trim();
          if (master.contactNumber !== undefined) m.contactNumber = master.contactNumber;
          if (master.email !== undefined) m.email = master.email;
          if (master.profilePhoto !== undefined) m.profilePhoto = master.profilePhoto;
          if (master.status) m.status = master.status;
          await m.save();
        }
      } else {
        m = await Master.create({
          name: master.name.trim(),
          title: master.title.trim(),
          discipline: master.discipline.trim(),
          experienceYears: Number(master.experienceYears || 10),
          bio: master.bio.trim(),
          contactNumber: master.contactNumber,
          email: master.email,
          profilePhoto: master.profilePhoto,
          status: 'ACTIVE',
        });
      }
      return NextResponse.json({ success: true, message: 'Master saved', master: m });
    }

    return NextResponse.json({ error: 'Invalid update type' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update CMS';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
