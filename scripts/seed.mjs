import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URL || process.env.MONGODB_URI;

if (!uri) {
  console.error('Error: MONGO_URL or MONGODB_URI not found in environment');
  process.exit(1);
}

const superAdminsConfig = [
  {
    index: 1,
    name: process.env.SUPER_ADMIN_1_NAME || 'Grand Master Chief Admin',
    email: (process.env.SUPER_ADMIN_1_EMAIL || 'superadmin1@aimacademy.org').toLowerCase().trim(),
    password: process.env.SUPER_ADMIN_1_PASSWORD || 'AimAcademy#Super1!',
  },
  {
    index: 2,
    name: process.env.SUPER_ADMIN_2_NAME || 'Technical Director Admin',
    email: (process.env.SUPER_ADMIN_2_EMAIL || 'superadmin2@aimacademy.org').toLowerCase().trim(),
    password: process.env.SUPER_ADMIN_2_PASSWORD || 'AimAcademy#Super2!',
  },
  {
    index: 3,
    name: process.env.SUPER_ADMIN_3_NAME || 'Examinations & Testing Admin',
    email: (process.env.SUPER_ADMIN_3_EMAIL || 'superadmin3@aimacademy.org').toLowerCase().trim(),
    password: process.env.SUPER_ADMIN_3_PASSWORD || 'AimAcademy#Super3!',
  },
  {
    index: 4,
    name: process.env.SUPER_ADMIN_4_NAME || 'Finance & Operations Admin',
    email: (process.env.SUPER_ADMIN_4_EMAIL || 'superadmin4@aimacademy.org').toLowerCase().trim(),
    password: process.env.SUPER_ADMIN_4_PASSWORD || 'AimAcademy#Super4!',
  },
];

async function seed() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { dbName: 'aim_academy' });
  console.log('Connected to aim_academy database successfully.');

  const db = mongoose.connection.db;

  // 1. Initialize the 4 Super Admin accounts
  console.log('\n--- Initializing 4 Super Admin Accounts ---');
  const usersCollection = db.collection('users');

  for (const admin of superAdminsConfig) {
    const existing = await usersCollection.findOne({ email: admin.email });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(admin.password, salt);

    if (existing) {
      await usersCollection.updateOne(
        { email: admin.email },
        {
          $set: {
            name: admin.name,
            role: 'SUPER_ADMIN',
            adminIndex: admin.index,
            status: 'ACTIVE',
            updatedAt: new Date(),
          },
        }
      );
      console.log(`[UPDATED] Super Admin ${admin.index}: ${admin.email} (${admin.name})`);
    } else {
      await usersCollection.insertOne({
        name: admin.name,
        email: admin.email,
        passwordHash,
        role: 'SUPER_ADMIN',
        adminIndex: admin.index,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`[CREATED] Super Admin ${admin.index}: ${admin.email} (${admin.name})`);
    }
  }

  // 2. Organization Settings (Initial config: ₹400 fee, 10% commission, phone 8943839386)
  console.log('\n--- Initializing Organization Settings ---');
  const settingsCollection = db.collection('organizationsettings');
  await settingsCollection.updateOne(
    {},
    {
      $set: {
        organizationName: 'Advanced Institute of Martial Arts (AIM Academy)',
        govtRegNo: 'WYD/176/2026',
        tagline: 'Empowering Youth Through Martial Arts & Human Development',
        contactPhone: '8943839386',
        contactEmail: 'info@aimacademy.org',
        address: 'Administrative Operations: Malappuram | Kozhikode | Wayanad',
        city: 'Wayanad',
        state: 'Kerala',
        country: 'India',
        defaultTestFee: 400,
        defaultCommissionRate: 10,
        currency: 'INR',
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
  console.log('[UPDATED/CONFIGURED] Organization settings: Advanced Institute of Martial Arts (AIM Academy), Govt. Reg No: WYD/176/2026, Phone: 8943839386.');

  // 3. Disciplines setup
  console.log('\n--- Initializing Standard Martial Arts Disciplines ---');
  const disciplinesCollection = db.collection('martialartdisciplines');
  const standardDisciplines = [
    {
      name: 'Karate-Do',
      code: 'KARATE',
      description: 'Traditional Japanese striking martial art utilizing punches, kicks, knee strikes, and open-hand techniques with kata and kumite.',
      beltHierarchy: [
        'White Belt',
        'Yellow Belt',
        'Orange Belt',
        'Green Belt',
        'Blue Belt',
        'Purple Belt',
        'Brown Belt',
        'Black Belt 1st Dan',
        'Black Belt 2nd Dan',
      ],
      status: 'ACTIVE',
    },
    {
      name: 'Taekwondo',
      code: 'TKD',
      description: 'Dynamic Korean martial art emphasizing fast, high, spinning kicking techniques and Olympic sparring discipline.',
      beltHierarchy: [
        'White Belt',
        'Yellow Belt',
        'Green Belt',
        'Blue Belt',
        'Red Belt',
        'Black Belt 1st Dan',
      ],
      status: 'ACTIVE',
    },
    {
      name: 'Kung Fu / Wushu',
      code: 'KUNGFU',
      description: 'Traditional Chinese martial arts encompassing animal styles, weapons forms, and internal energy cultivation.',
      beltHierarchy: [
        'Beginner Sash',
        'Yellow Sash',
        'Green Sash',
        'Blue Sash',
        'Brown Sash',
        'Black Sash 1st Degree',
      ],
      status: 'ACTIVE',
    },
    {
      name: 'Kickboxing',
      code: 'KB',
      description: 'Combat sport and martial art combining boxing hand strikes with martial arts kicks for fitness, defense, and competition.',
      beltHierarchy: [
        'White Rank',
        'Yellow Rank',
        'Orange Rank',
        'Green Rank',
        'Blue Rank',
        'Brown Rank',
        'Black Rank',
      ],
      status: 'ACTIVE',
    },
  ];

  for (const disc of standardDisciplines) {
    const existing = await disciplinesCollection.findOne({ code: disc.code });
    if (!existing) {
      await disciplinesCollection.insertOne({
        ...disc,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`[CREATED] Discipline: ${disc.name} (${disc.code})`);
    } else {
      console.log(`[EXISTS] Discipline: ${disc.name}`);
    }
  }

  // 4. Instructional Leadership & Masters
  console.log('\n--- Initializing Official Masters & Leadership ---');
  const mastersCollection = db.collection('masters');
  const leadership = [
    {
      name: 'Naisam Muhammed Yoosef',
      title: 'Founder & Chief Instructor',
      bio: 'Wushu NIS Diploma holder from Patiala. Visionary founder of Advanced Institute of Martial Arts (AIM Academy), spearheading martial arts excellence, youth empowerment, and character development across Kerala.',
      discipline: 'Kung Fu / Wushu',
      experienceYears: 18,
      displayOrder: 1,
      status: 'ACTIVE',
      photoUrl: '/images/home-1-registration.jpg',
    },
    {
      name: 'Khalid M',
      title: 'Chief Examiner & International Arm Wrestler',
      bio: 'Accomplished Chief Examiner, Wushu Sanda Player, and National Police Meet competitor. Selected to represent India at the prestigious World Armwrestling Championship in Delhi (Masters Men 110+ KG, Right Hand).',
      discipline: 'Wushu Sanda / Martial Combat',
      experienceYears: 16,
      displayOrder: 2,
      status: 'ACTIVE',
      photoUrl: '/images/home-3-chief-examiner.jpg',
    },
  ];

  for (const m of leadership) {
    await mastersCollection.updateOne(
      { name: m.name },
      {
        $set: {
          ...m,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    console.log(`[UPDATED/CONFIGURED] Master: ${m.name} (${m.title})`);
  }

  // 5. Public Website Content initialization
  console.log('\n--- Initializing Public Website CMS Content ---');
  const cmsCollection = db.collection('publicwebsitecontents');
  await cmsCollection.updateOne(
    {},
    {
      $set: {
        heroTitle: 'Advanced Institute of Martial Arts (AIM ACADEMY)',
        heroSubtitle:
          'Govt. Reg No: WYD/176/2026 — Empowering Youth Through Martial Arts & Human Development. Standardized Belt Testing, Accredited Dojo Units, and Elite Athletic Leadership across Malappuram, Kozhikode & Wayanad.',
        heroBadge: 'Govt. Reg No: WYD/176/2026 • Official Martial Arts Academy & Grading Board',
        aboutTitle: 'About AIM Academy',
        aboutText:
          'Advanced Institute of Martial Arts (AIM ACADEMY), registered under Govt. Reg No: WYD/176/2026, is dedicated to authentic martial arts education, disciplined athletic progression, and youth human development. Guided by Founder & Chief Instructor Naisam Muhammed Yoosef (NIS Diploma Patiala) and Chief Examiner Khalid M, we unite premier training units across Malappuram, Kozhikode, and Wayanad.',
        philosophyTitle: 'Our Philosophy & Core Pillars',
        philosophyText:
          'Built on the foundational virtues of STRENGTH, DISCIPLINE, and GLORY. True martial mastery is the relentless pursuit of character cultivation, mental fortitude, humility, and community leadership.',
        values: [
          'Strength • Discipline • Glory',
          'Empowering Youth Through Martial Arts & Human Development',
          'Govt. Recognized Certification & Standardized Grading',
          'United for Excellence Across Malappuram, Kozhikode & Wayanad',
          'Integrity, Respect & Indomitable Spirit',
        ],
        benefits: [
          {
            title: 'Physical Strength & Conditioning',
            description: 'Elite conditioning developed by national and international championship athletes.',
            iconName: 'Activity',
          },
          {
            title: 'Practical Combat & Self-Defense',
            description: 'Proven Wushu Sanda, Karate, and defensive combat methods for real-world personal protection.',
            iconName: 'Shield',
          },
          {
            title: 'Youth & Human Development',
            description: 'Holistic character coaching, building high self-esteem, perseverance, and academic focus.',
            iconName: 'Target',
          },
          {
            title: 'Accredited Belt Grading',
            description: 'Rigorous state-standardized evaluations supervised by certified Chief Examiners.',
            iconName: 'Award',
          },
        ],
        beltSystemOverview:
          'Our standardized curriculum spans foundational ranks through advanced Black Belt Dan grades. Each test is conducted under strict examination guidelines, evaluating forms, sparring discipline, physical stamina, and martial ethics.',
        contactPhone: '8943839386',
        contactEmail: 'info@aimacademy.org',
        contactAddress: 'Headquarters & Training Units: Malappuram | Kozhikode | Wayanad, Kerala',
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
  console.log('[UPDATED/CONFIGURED] Public Website CMS content with authentic AIM Academy data.');

  console.log('\n✓ Bootstrap / Seed completed successfully!');
  console.log('NO DUMMY DATA SEEDED: Real database is ready for organic usage.\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
