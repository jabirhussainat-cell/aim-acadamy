import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMartialArtDiscipline extends Document {
  name: string;
  code: string;
  description: string;
  beltHierarchy: string[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const MartialArtDisciplineSchema = new Schema<IMartialArtDiscipline>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    description: { type: String, required: true, trim: true },
    beltHierarchy: {
      type: [String],
      default: [
        'White Belt',
        'Yellow Belt',
        'Orange Belt',
        'Green Belt',
        'Blue Belt',
        'Purple Belt',
        'Brown Belt',
        'Black Belt 1st Dan',
      ],
    },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export const MartialArtDiscipline: Model<IMartialArtDiscipline> =
  mongoose.models.MartialArtDiscipline ||
  mongoose.model<IMartialArtDiscipline>('MartialArtDiscipline', MartialArtDisciplineSchema);

export default MartialArtDiscipline;
