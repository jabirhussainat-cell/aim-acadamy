import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBenefitItem {
  title: string;
  description: string;
  iconName: string;
}

export interface IPublicWebsiteContent extends Document {
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  aboutTitle: string;
  aboutText: string;
  philosophyTitle: string;
  philosophyText: string;
  values: string[];
  benefits: IBenefitItem[];
  beltSystemOverview: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  updatedAt: Date;
}

const BenefitItemSchema = new Schema<IBenefitItem>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  iconName: { type: String, default: 'Shield' },
});

const PublicWebsiteContentSchema = new Schema<IPublicWebsiteContent>(
  {
    heroTitle: {
      type: String,
      default: 'Forging Character, Strength & Authentic Martial Mastery',
    },
    heroSubtitle: {
      type: String,
      default:
        'A premier martial arts organization dedicated to traditional discipline, modern athletic excellence, standardized belt testing, and empowering students across our nationwide training units.',
    },
    heroBadge: {
      type: String,
      default: 'Official Martial Arts Academy & Grading Board',
    },
    aboutTitle: {
      type: String,
      default: 'About AIM Martial Arts Academy',
    },
    aboutText: {
      type: String,
      default:
        'AIM Martial Arts Academy was established to preserve the purest traditions of martial arts while maintaining the highest competitive and educational standards. We operate affiliated units led by certified instructors, providing standardized belt examinations, physical fitness development, self-defense empowerment, and leadership training.',
    },
    philosophyTitle: {
      type: String,
      default: 'Our Philosophy & Core Values',
    },
    philosophyText: {
      type: String,
      default:
        'True martial arts training transcends physical combat. It is the pursuit of inner mastery, respect, patience, indomitable spirit, and humble service to the community. Every belt earned is a testament to perseverance and unwavering dedication.',
    },
    values: {
      type: [String],
      default: [
        'Integrity & Respect in every action',
        'Physical & Mental Discipline',
        'Transparent & Standardized Grading',
        'Safety & Mutual Welfare',
        'Continuous Self-Overcoming',
      ],
    },
    benefits: {
      type: [BenefitItemSchema],
      default: [
        {
          title: 'Physical Fitness & Agility',
          description: 'Build functional strength, flexibility, cardiovascular endurance, and coordination.',
          iconName: 'Activity',
        },
        {
          title: 'Practical Self-Defense',
          description: 'Acquire situational awareness, effective defense techniques, and personal safety skills.',
          iconName: 'Shield',
        },
        {
          title: 'Mental Focus & Confidence',
          description: 'Develop laser-sharp focus, stress resilience, academic discipline, and self-esteem.',
          iconName: 'Target',
        },
        {
          title: 'Certified Rank Recognition',
          description: 'Receive verified belt progression, official certificates, and standardized tournament eligibility.',
          iconName: 'Award',
        },
      ],
    },
    beltSystemOverview: {
      type: String,
      default:
        'Our curriculum features a rigorous multi-stage grading system moving from White Belt (beginner) through progressive intermediate ranks to Black Belt Dan grades. Each examination assesses fundamental techniques, forms (katas/poomsae), sparring proficiency, discipline, and theory under the supervision of accredited examiners.',
    },
    contactPhone: {
      type: String,
      default: '8943839386',
    },
    contactEmail: {
      type: String,
      default: 'info@aimacademy.org',
    },
    contactAddress: {
      type: String,
      default: 'Central Training & Administrative Headquarters, India',
    },
  },
  { timestamps: true }
);

export const PublicWebsiteContent: Model<IPublicWebsiteContent> =
  mongoose.models.PublicWebsiteContent ||
  mongoose.model<IPublicWebsiteContent>('PublicWebsiteContent', PublicWebsiteContentSchema);

export default PublicWebsiteContent;
