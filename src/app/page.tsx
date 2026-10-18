import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import connectToDatabase from '@/lib/mongodb';
import { PublicWebsiteContent } from '@/models/PublicWebsiteContent';
import { MartialArtDiscipline } from '@/models/MartialArtDiscipline';
import { Master } from '@/models/Master';
import { AimLogo } from '@/components/AimLogo';
import {
  Shield,
  Phone,
  Mail,
  MapPin,
  Award,
  ChevronRight,
  Activity,
  CheckCircle2,
  ExternalLink,
  Flame,
  Trophy,
  Users2,
  Sparkles,
  Building2,
} from 'lucide-react';

export const revalidate = 60; // ISR cache 60s

async function getHomepageData() {
  try {
    await connectToDatabase();
    const [content, disciplines, masters] = await Promise.all([
      PublicWebsiteContent.findOne({}),
      MartialArtDiscipline.find({ status: 'ACTIVE' }).sort({ name: 1 }),
      Master.find({ status: 'ACTIVE' }).sort({ displayOrder: 1 }),
    ]);

    return {
      content: content || getDefaultContent(),
      disciplines: disciplines && disciplines.length > 0 ? disciplines : getDefaultDisciplines(),
      masters: masters && masters.length > 0 ? masters : getDefaultMasters(),
    };
  } catch {
    // Graceful fallback if MongoDB Atlas is awaiting network access/IP whitelist
    return {
      content: getDefaultContent(),
      disciplines: getDefaultDisciplines(),
      masters: getDefaultMasters(),
    };
  }
}

function getDefaultContent() {
  return {
    heroTitle: 'Advanced Institute of Martial Arts (AIM ACADEMY)',
    heroSubtitle:
      'Govt. Reg No: WYD/176/2026 — Empowering Youth Through Martial Arts & Human Development. Standardized Belt Testing, Accredited Dojo Units, and Elite Athletic Leadership across Malappuram, Kozhikode & Wayanad.',
    heroBadge: 'Govt. Reg No: WYD/176/2026 • Official Martial Arts Academy & Grading Board',
    aboutTitle: 'About AIM Academy',
    aboutText:
      'Advanced Institute of Martial Arts (AIM ACADEMY), registered under Govt. Reg No: WYD/176/2026, is an official martial arts organization dedicated to traditional discipline, modern combat sports, youth empowerment, and structured human development. Led by Founder & Chief Instructor Naisam Muhammed Yoosef (NIS Diploma Patiala) and Chief Examiner Khalid M, we unite premier training units across Malappuram, Kozhikode, and Wayanad.',
    philosophyTitle: 'Our Philosophy & Core Pillars',
    philosophyText:
      'Rooted in the eternal principles of STRENGTH, DISCIPLINE, and GLORY. True martial arts mastery is the lifelong pursuit of inner character, physical fitness, humble service, and youth human development.',
    values: [
      'Strength • Discipline • Glory',
      'Empowering Youth Through Martial Arts & Human Development',
      'Govt. Recognized Certification & Standardized Grading',
      'United for Excellence Across Malappuram, Kozhikode & Wayanad',
      'Integrity, Respect & Indomitable Spirit',
    ],
    benefits: [
      {
        title: 'Physical Strength & Agility',
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
      'Our standardized curriculum features a structured multi-stage grading framework moving from White Belt (beginner) through progressive intermediate ranks to Black Belt Dan grades. Each test is conducted under strict examination guidelines, evaluating forms, sparring discipline, physical stamina, and martial ethics at a uniform fee of ₹400 per candidate.',
    contactPhone: '8943839386',
    contactEmail: 'info@aimacademy.org',
    contactAddress: 'Headquarters & Training Units: Malappuram | Kozhikode | Wayanad, Kerala',
  };
}

function getDefaultDisciplines() {
  return [
    {
      name: 'Kung Fu / Wushu',
      code: 'KUNGFU',
      description: 'Traditional Chinese martial arts and contemporary Wushu forms, acrobatics, and weapons mastery.',
      beltHierarchy: ['Beginner Sash', 'Yellow Sash', 'Green Sash', 'Blue Sash', 'Brown Sash', 'Black Sash 1st Degree'],
    },
    {
      name: 'Wushu Sanda & Combat',
      code: 'SANDA',
      description: 'Full-contact Chinese kickboxing and wrestling discipline combining rapid strikes, takedowns, and sweeps.',
      beltHierarchy: ['Level 1 Basic', 'Level 2 Intermediate', 'Level 3 Advanced', 'National Fighter Rank'],
    },
    {
      name: 'Karate-Do',
      code: 'KARATE',
      description: 'Traditional striking martial art emphasizing kata, kumite, mental focus, and explosive kinetic power.',
      beltHierarchy: ['White Belt', 'Yellow Belt', 'Orange Belt', 'Green Belt', 'Blue Belt', 'Brown Belt', 'Black Belt 1st Dan'],
    },
    {
      name: 'Kickboxing',
      code: 'KB',
      description: 'Dynamic stand-up combat sport cultivating high-speed striking, cardiovascular stamina, and defensive reflexes.',
      beltHierarchy: ['White Rank', 'Yellow Rank', 'Orange Rank', 'Green Rank', 'Blue Rank', 'Brown Rank', 'Black Rank'],
    },
  ];
}

function getDefaultMasters() {
  return [
    {
      _id: '1',
      name: 'Naisam Muhammed Yoosef',
      title: 'Founder & Chief Instructor',
      bio: 'Wushu NIS Diploma holder from Patiala. Visionary founder of Advanced Institute of Martial Arts (AIM Academy), spearheading martial arts excellence, youth empowerment, and character development across Kerala.',
      discipline: 'Kung Fu / Wushu',
      experienceYears: 18,
      profilePhoto: '/images/home-1-registration.jpg',
    },
    {
      _id: '2',
      name: 'Khalid M',
      title: 'Chief Examiner & International Arm Wrestler',
      bio: 'Accomplished Chief Examiner, Wushu Sanda Player, and National Police Meet competitor. Selected to represent India at the prestigious World Armwrestling Championship in Delhi (Masters Men 110+ KG, Right Hand).',
      discipline: 'Wushu Sanda / Martial Combat',
      experienceYears: 16,
      profilePhoto: '/images/home-3-chief-examiner.jpg',
    },
  ];
}

export default async function HomePage() {
  const { content, disciplines, masters } = await getHomepageData();

  // The 4 official images in the exact order requested by user:
  const officialShowcase = [
    {
      id: 1,
      image: '/images/home-1-registration.jpg',
      aspectClass: 'aspect-[4/5]',
      isLandscape: false,
      badge: 'Official Recognition',
      title: 'Now Officially Registered!',
      subtitle: 'Advanced Institute of Martial Arts (AIM ACADEMY)',
      regNo: 'Govt. Reg No: WYD/176/2026',
      leader: 'Naisam Muhammed Yoosef',
      role: 'Founder & Chief Instructor',
      credential: 'WUSHU NIS DIPLOMA - Patiala',
      motto: 'Empowering Youth Through Martial Arts & Human Development.',
      description:
        'AIM Academy is formally accredited under Govt. Reg No: WYD/176/2026. Under the visionary direction of Founder & Chief Instructor Naisam Muhammed Yoosef, we cultivate true martial excellence, physical discipline, and life-changing human development for the next generation.',
    },
    {
      id: 2,
      image: '/images/home-2-leadership.jpg',
      aspectClass: 'aspect-[2/3]',
      isLandscape: false,
      badge: 'Executive Command',
      title: 'Proudly Announcing Our Core Leadership',
      subtitle: 'The Pillar of Mastery & Examination Authority',
      regNo: 'Govt. Reg No: WYD/176/2026',
      leader: 'Naisam Muhammed Yoosef & Khalid M',
      role: 'Founder & Chief Instructor (NIS) & Chief Examiner',
      credential: 'International Arm Wrestler • National Police Meet • Wushu Sanda Player',
      motto: 'United by Purpose • Forged by Discipline',
      description:
        'A formidable partnership combining the pedagogical pedagogy of NIS-certified Chief Instructor Naisam Muhammed Yoosef with the heavy-weight competitive prowess and testing authority of Chief Examiner Khalid M.',
    },
    {
      id: 3,
      image: '/images/home-3-chief-examiner.jpg',
      aspectClass: 'aspect-[2/3]',
      isLandscape: false,
      badge: 'World Championship Pride',
      title: 'Proudly Congratulating Our Chief Examiner',
      subtitle: 'Selected for World Armwrestling Championship - Delhi',
      regNo: 'Govt. Reg No: WYD/176/2026',
      leader: 'Khalid M — Indian Team (WAF 1977)',
      role: 'Chief Examiner & International Heavyweight Competitor',
      credential: 'Masters Men 110+ KG | Right Hand',
      motto: 'STRENGTH • DISCIPLINE • GLORY',
      description:
        'Our esteemed Chief Examiner Khalid M has been chosen to represent the nation at the World Armwrestling Championship in Delhi in the Masters Men 110+ KG Right Hand division, proving our highest standard of power, grit, and discipline.',
    },
    {
      id: 4,
      image: '/images/home-4-united.jpg',
      aspectClass: 'aspect-[16/9]',
      isLandscape: true,
      badge: 'Regional Force',
      title: 'United for Excellence',
      subtitle: 'The Force Behind AIM Academy',
      regNo: 'Malappuram | Kozhikode | Wayanad',
      leader: 'Master Faculty & Dojang Instructors',
      role: 'Unified Instructional Body',
      credential: 'Serving Units Across Malappuram, Kozhikode & Wayanad',
      motto: 'Excellence Through Synergy & Mutual Support',
      description:
        'A united fraternity of dedicated martial arts instructors and dojo heads driving youth empowerment, certified test grading, and competitive sports mastery across Malappuram, Kozhikode, and Wayanad.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-600 selection:text-white">
      {/* Top Banner with Govt Reg No & Helpline */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/30 text-amber-200 text-[11px] sm:text-xs py-2 px-4 text-center font-semibold tracking-wider flex items-center justify-center gap-2 sm:gap-6 flex-wrap">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>GOVT. REG NO: <strong className="text-white font-bold">WYD/176/2026</strong></span>
        </span>
        <span className="hidden sm:inline text-amber-500/60">•</span>
        <span>MALAPPURAM | KOZHIKODE | WAYANAD</span>
        <span className="hidden sm:inline text-amber-500/60">•</span>
        <a href="tel:8943839386" className="text-white hover:text-amber-400 font-bold transition flex items-center gap-1">
          <Phone className="h-3 w-3 text-rose-400" />
          <span>Helpline: 8943839386</span>
        </a>
      </div>

      {/* Navigation Bar with Extracted Vector Emblem Logo */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <AimLogo size="md" subtitle="Govt. Reg No: WYD/176/2026" />
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <a href="#showcase" className="hover:text-amber-400 transition">Official Announcements</a>
            <a href="#about" className="hover:text-amber-400 transition">About Academy</a>
            <a href="#leadership" className="hover:text-amber-400 transition">Leadership</a>
            <a href="#disciplines" className="hover:text-amber-400 transition">Disciplines</a>
            <a href="#grading" className="hover:text-amber-400 transition">Belt Grading</a>
            <Link href="/unit-affiliation" className="text-amber-400 hover:text-amber-300 font-bold transition">
              Unit Affiliation
            </Link>
            <a href="#contact" className="hover:text-amber-400 transition">Contact</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/unit-affiliation"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-300 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 rounded-xl transition shadow-sm uppercase tracking-wider"
            >
              <Building2 className="h-3.5 w-3.5 text-amber-400" />
              <span>Affiliate Unit</span>
            </Link>

            <a
              href="tel:8943839386"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition"
            >
              <Phone className="h-3.5 w-3.5 text-rose-400" />
              <span>8943839386</span>
            </a>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition shadow-md shadow-rose-950 uppercase tracking-wider"
            >
              <span>Portal Login</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 1. Hero Section with Prominent Official Logo & Identity */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Official Emblem Centerpiece */}
          <div className="mb-6 flex justify-center">
            <div className="relative p-2 rounded-2xl bg-gradient-to-b from-amber-500/20 to-transparent border border-amber-500/30 shadow-[0_0_40px_rgba(217,119,6,0.25)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/aim-logo.jpg"
                alt="AIM ACADEMY Official Emblem"
                className="h-28 sm:h-36 w-auto object-contain rounded-xl"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-600/50 bg-amber-950/40 text-amber-300 text-xs font-bold tracking-wide mb-6 uppercase shadow-sm">
            <Flame className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
            <span>Govt. Reg No: WYD/176/2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase max-w-5xl mx-auto leading-tight">
            ADVANCED INSTITUTE OF MARTIAL ARTS
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
              (AIM ACADEMY)
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-xl font-medium text-amber-200/90 tracking-wide max-w-3xl mx-auto">
            Empowering Youth Through Martial Arts & Human Development
          </p>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Centralized administration, standardized belt examinations, accredited training dojos, and championship athletic development across Malappuram, Kozhikode, and Wayanad.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/unit-affiliation"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-950 transition-all hover:scale-105"
            >
              <Building2 className="h-4 w-4" />
              <span>Apply for Unit Affiliation</span>
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-rose-950 transition-all hover:scale-105"
            >
              <span>Access Academy Portal</span>
              <ChevronRight className="h-4 w-4" />
            </Link>

            <a
              href="tel:8943839386"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs uppercase tracking-wider transition"
            >
              <Phone className="h-4 w-4 text-amber-400" />
              <span>Call Helpline: 8943839386</span>
            </a>
          </div>

          {/* Key Stat Badges */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl border border-amber-600/30 bg-slate-900/60 backdrop-blur">
              <span className="block text-xl sm:text-2xl font-black text-amber-400">WYD/176/2026</span>
              <span className="text-[11px] text-slate-300 uppercase tracking-wider">Govt. Registration</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur">
              <span className="block text-xl sm:text-2xl font-black text-white">3 Districts</span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">MLP • KKD • WYD</span>
            </div>
            <div className="p-4 rounded-xl border border-rose-900/50 bg-slate-900/60 backdrop-blur">
              <span className="block text-xl sm:text-2xl font-black text-rose-500">₹400 Flat</span>
              <span className="text-[11px] text-slate-300 uppercase tracking-wider">Standard Test Fee</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur">
              <span className="block text-xl sm:text-2xl font-black text-emerald-400">NIS & World</span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">Championship Faculty</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OFFICIAL SHOWCASE: THE 4 IMAGES IN EXACT USER ORDER */}
      <section id="showcase" className="py-20 lg:py-28 bg-slate-900/40 border-b border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 text-amber-400 border border-amber-600/40 text-xs font-bold uppercase tracking-wider mb-3">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>Official Academy Announcements & Leadership</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">
              Milestones & Core Leadership
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-300">
              Review our official government registration, esteemed founders, international championship achievements, and the united instructional force behind AIM Academy.
            </p>
          </div>

          <div className="space-y-16 lg:space-y-24">
            {officialShowcase.map((item, index) =>
              item.isLandscape ? (
                /* Landscape Card (Item 4: United for Excellence) */
                <div
                  key={item.id}
                  className="w-full rounded-3xl border-2 border-amber-500/40 bg-slate-950 p-4 sm:p-8 shadow-2xl shadow-amber-950/30 hover:border-amber-400 transition-all duration-300"
                >
                  {/* Full Landscape 16:9 Image */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black border border-amber-500/30 shadow-inner group">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain sm:object-cover group-hover:scale-[1.01] transition-transform duration-500"
                      sizes="(max-width: 1280px) 100vw, 1200px"
                    />
                    <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md border border-amber-500/50 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                      <Users2 className="h-3.5 w-3.5 text-amber-400" />
                      <span>{item.badge}</span>
                    </div>
                  </div>

                  {/* Content beneath landscape image */}
                  <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-8">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px]">
                          0{index + 1}
                        </span>
                        <span>{item.regNo}</span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight leading-tight">
                        {item.title}
                      </h3>

                      <h4 className="mt-2 text-base sm:text-lg font-bold text-amber-300">
                        {item.subtitle}
                      </h4>

                      <div className="my-4 p-4 rounded-xl border-l-4 border-amber-500 bg-amber-950/20 text-amber-100 text-xs sm:text-sm font-semibold italic">
                        &ldquo;{item.motto}&rdquo;
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                        <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                          Regional Hubs Covered
                        </span>
                        <span className="text-sm font-black text-white">
                          Malappuram • Kozhikode • Wayanad
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                        <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                          Faculty & Instructors
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-rose-400">
                          {item.role}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 pt-1">
                        <Link
                          href="/login"
                          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition"
                        >
                          <span>Join / Enroll Unit</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>

                        <a
                          href="tel:8943839386"
                          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold tracking-wider transition"
                        >
                          <Phone className="h-3.5 w-3.5 text-amber-400" />
                          <span>Inquire: 8943839386</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Portrait Cards (Items 1, 2, 3) */
                <div
                  key={item.id}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Image Container with golden framed styling */}
                  <div
                    className={`lg:col-span-5 ${
                      index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <div className="group relative rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-slate-950 p-2 shadow-2xl shadow-amber-950/30 hover:border-amber-400 transition-all duration-300">
                      <div className={`relative ${item.aspectClass} w-full overflow-hidden rounded-xl bg-slate-900`}>
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 500px"
                          priority={index === 0}
                        />
                      </div>
                      {/* Badge Overlay */}
                      <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md border border-amber-500/50 text-amber-300 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                        <Award className="h-3.5 w-3.5 text-amber-400" />
                        <span>{item.badge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div
                    className={`lg:col-span-7 ${
                      index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px]">
                        0{index + 1}
                      </span>
                      <span>{item.regNo}</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight leading-tight">
                      {item.title}
                    </h3>

                    <h4 className="mt-2 text-base sm:text-lg font-bold text-amber-300">
                      {item.subtitle}
                    </h4>

                    {/* Motto Quote */}
                    <div className="my-5 p-4 rounded-xl border-l-4 border-amber-500 bg-amber-950/20 text-amber-100 text-xs sm:text-sm font-semibold italic">
                      &ldquo;{item.motto}&rdquo;
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                      {item.description}
                    </p>

                    {/* Highlights Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                          Lead Figure
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {item.leader}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                          Designation & Credentials
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-rose-400">
                          {item.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition"
                      >
                        <span>Join / Enroll Unit</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>

                      <a
                        href="tel:8943839386"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold tracking-wider transition"
                      >
                        <Phone className="h-3.5 w-3.5 text-amber-400" />
                        <span>Inquire: 8943839386</span>
                      </a>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* 3. About the Organization */}
      <section id="about" className="py-20 lg:py-28 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                <Shield className="h-4 w-4" />
                <span>Our Heritage & Accreditation</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
                {content.aboutTitle}
              </h2>
              <p className="mt-5 text-xs sm:text-base text-slate-300 leading-relaxed">
                {content.aboutText}
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-300">
                    <strong>Official Government Accreditation:</strong> Registered under Govt. Reg No: WYD/176/2026 ensuring full institutional recognition.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-300">
                    <strong>Elite Instructional Pedagogy:</strong> Led by NIS Diploma in Wushu from Patiala and international arm wrestling champions.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-300">
                    <strong>Standardized ₹400 Examination Fee:</strong> Affordable, accessible, and transparent belt tests for all student athletes.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-300">
                    <strong>Empowering 3 Core Districts:</strong> Active dojos and community dojangs across Malappuram, Kozhikode, and Wayanad.
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-8 shadow-2xl relative">
              <div className="flex justify-center mb-6">
                <AimLogo size="lg" subtitle="Official Govt. Registration" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2 text-center">
                Institutional Credibility
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6 text-center">
                Our organization empowers affiliated dojo units with centralized digital student records, online test enrollment, batch receipts, and certified progression credentials.
              </p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="block text-xl font-bold text-amber-400">WYD/176/2026</span>
                  <span className="text-[11px] text-slate-400">Govt. Registered</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="block text-xl font-bold text-rose-500">3 Hubs</span>
                  <span className="text-[11px] text-slate-400">MLP • KKD • WYD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Leadership & Masters */}
      <section id="leadership" className="py-20 bg-slate-900/60 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Guiding Masters
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
              Instructional Leadership & Chief Examiners
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-400">
              Guided by NIS-certified educators and international champions with decades of competitive and instructional excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {masters.map((m) => (
              <div
                key={m._id.toString()}
                className="rounded-2xl border border-amber-500/30 bg-slate-950 p-6 flex flex-col justify-between shadow-xl hover:border-amber-400 transition"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-amber-500 shrink-0 bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.profilePhoto || '/aim-logo.jpg'}
                        alt={m.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{m.name}</h3>
                      <p className="text-xs text-amber-400 font-semibold">{m.title}</p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-0.5">
                        Discipline: {m.discipline}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {m.bio}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-rose-400 font-medium">AIM ACADEMY Leadership</span>
                  <span className="text-amber-400 font-bold">{m.experienceYears}+ Years Experience</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Martial Arts Disciplines Offered */}
      <section id="disciplines" className="py-20 lg:py-28 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Curriculum & Programs
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
              Martial Arts Disciplines
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-400">
              Comprehensive traditional and modern combat disciplines taught under standardized safety and examination frameworks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {disciplines.map((disc) => (
              <div
                key={disc.code}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-amber-500/50 transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40">
                      {disc.code}
                    </span>
                    <Award className="h-4 w-4 text-slate-600 group-hover:text-amber-400 transition" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-300 transition">
                    {disc.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {disc.description}
                  </p>
                </div>

                <div>
                  <div className="pt-3 border-t border-slate-900">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Ranks & Grades:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {disc.beltHierarchy.slice(0, 4).map((b: string) => (
                        <span
                          key={b}
                          className="text-[10px] px-1.5 py-0.5 bg-slate-950 rounded text-slate-300 border border-slate-800"
                        >
                          {b}
                        </span>
                      ))}
                      {disc.beltHierarchy.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-amber-500">
                          +{disc.beltHierarchy.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Training Philosophy, Values & Benefits */}
      <section id="philosophy" className="py-20 lg:py-28 bg-slate-900/40 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Pillars of Character
              </span>
              <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
                {content.philosophyTitle}
              </h2>
              <p className="mt-5 text-xs sm:text-base text-slate-300 leading-relaxed">
                {content.philosophyText}
              </p>

              <div className="mt-8 space-y-3">
                {content.values.map((val: string) => (
                  <div key={val} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-200 font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {content.benefits.map((b: { title: string; description: string; iconName?: string }) => (
                <div
                  key={b.title}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-5 hover:border-slate-700 transition"
                >
                  <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                    <Activity className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white mb-1.5">{b.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Belt and Grading System Overview */}
      <section id="grading" className="py-20 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Transparent Evaluation
            </span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
              Standardized Belt Grading System
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {content.beltSystemOverview}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 py-4 max-w-4xl mx-auto">
            {['White Belt', 'Yellow Belt', 'Orange Belt', 'Green Belt', 'Blue Belt', 'Purple Belt', 'Brown Belt', 'Black Belt 1st Dan'].map(
              (belt, i) => (
                <div
                  key={belt}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200"
                >
                  <span className="text-amber-400 text-[10px]">Rank {i + 1}:</span>
                  <span>{belt}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* 8. Contact Section with phone 8943839386 */}
      <section id="contact" className="py-20 lg:py-28 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-8 sm:p-14 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Govt. Reg No: WYD/176/2026
                </span>
                <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
                  Connect with AIM Academy
                </h2>
                <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  For dojo unit affiliation, student registrations, test enrollment, or instructor inquiries across Malappuram, Kozhikode, and Wayanad, please call our central administrative helpline.
                </p>

                <div className="mt-8 space-y-4">
                  <a
                    href="tel:8943839386"
                    className="flex items-center gap-3 text-white hover:text-amber-400 transition group"
                  >
                    <div className="h-11 w-11 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                        Official Helpline Number
                      </span>
                      <span className="text-xl font-black text-white tracking-wide">
                        8943839386
                      </span>
                    </div>
                  </a>

                  <div className="flex items-center gap-3 text-white">
                    <div className="h-10 w-10 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                        Official Email
                      </span>
                      <span className="text-sm font-semibold text-slate-200">
                        {content.contactEmail}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-white">
                    <div className="h-10 w-10 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                        Jurisdiction & Headquarters
                      </span>
                      <span className="text-sm font-semibold text-slate-200">
                        Malappuram | Kozhikode | Wayanad, Kerala
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur">
                <div className="flex items-center gap-3 mb-4">
                  <AimLogo size="sm" showText={false} />
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wider">
                      Academy Management Portal
                    </h3>
                    <span className="text-[10px] text-amber-400 font-semibold uppercase">
                      Super Admin & Unit Access
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                  Affiliated unit instructors can log in to register students, enroll candidates into upcoming belt grading sessions, and process batch payments.
                </p>

                <div className="space-y-3">
                  <Link
                    href="/unit-affiliation"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950 transition"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Apply for Unit Affiliation</span>
                  </Link>

                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-950 transition"
                  >
                    <span>Proceed to Portal Login</span>
                    <ExternalLink className="h-4 w-4" />
                  </Link>

                  <a
                    href="tel:8943839386"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold tracking-wider transition"
                  >
                    <Phone className="h-4 w-4 text-amber-400" />
                    <span>Call 8943839386 for Support</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Logo */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <AimLogo size="sm" subtitle="Govt. Reg No: WYD/176/2026" />
          </Link>

          <p className="text-center text-slate-400 text-xs">
            © {new Date().getFullYear()} Advanced Institute of Martial Arts (AIM ACADEMY). Govt. Reg No: WYD/176/2026.
            <br />
            Helpline: 8943839386 | Malappuram • Kozhikode • Wayanad
          </p>

          <div className="flex items-center gap-5">
            <Link href="/unit-affiliation" className="text-slate-300 hover:text-amber-400 transition font-semibold text-xs">
              Apply for Affiliation
            </Link>
            <Link href="/login" className="text-amber-400 hover:text-amber-300 transition font-bold uppercase tracking-wider text-xs">
              Portal Login →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
