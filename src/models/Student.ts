import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBeltRecord {
  belt: string;
  awardedDate: Date;
  testEventId?: mongoose.Types.ObjectId;
  testName?: string;
  remarks?: string;
}

export interface IStudent extends Document {
  registrationNumber: string;
  fullName: string;
  profilePhoto?: string;
  dateOfBirth: Date;
  age?: number;
  gender: 'Male' | 'Female' | 'Other';
  height?: string;
  weight?: string;
  bloodGroup?: string;
  contactNumber: string;
  email?: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;

  // Parent/Guardian Info
  parentName: string;
  relationship: string;
  parentContact: string;
  parentAltContact?: string;
  parentEmail?: string;
  parentAddress: string;
  useStudentAddress: boolean;

  // Academic and Martial Arts Info
  schoolName: string;
  schoolClass?: string;
  educationalQualification?: string;
  discipline: string;
  currentBelt: string;
  unitId: mongoose.Types.ObjectId;
  instructor?: string;
  dateOfJoining: Date;
  status: 'Active' | 'Inactive' | 'Archived';
  notes?: string;

  beltHistory: IBeltRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const BeltRecordSchema = new Schema<IBeltRecord>({
  belt: { type: String, required: true },
  awardedDate: { type: Date, default: Date.now },
  testEventId: { type: Schema.Types.ObjectId, ref: 'TestEvent' },
  testName: { type: String },
  remarks: { type: String },
});

const StudentSchema = new Schema<IStudent>(
  {
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    profilePhoto: { type: String },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    height: { type: String, trim: true },
    weight: { type: String, trim: true },
    bloodGroup: { type: String, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, default: 'India', trim: true },

    parentName: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    parentContact: { type: String, required: true, trim: true },
    parentAltContact: { type: String, trim: true },
    parentEmail: { type: String, lowercase: true, trim: true },
    parentAddress: { type: String, required: true, trim: true },
    useStudentAddress: { type: Boolean, default: true },

    schoolName: { type: String, required: true, trim: true },
    schoolClass: { type: String, trim: true },
    educationalQualification: { type: String, trim: true },
    discipline: { type: String, required: true, trim: true },
    currentBelt: { type: String, required: true, trim: true, default: 'White' },
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
    instructor: { type: String, trim: true },
    dateOfJoining: { type: Date, default: Date.now },
    status: { type: String, enum: ['Active', 'Inactive', 'Archived'], default: 'Active', index: true },
    notes: { type: String },

    beltHistory: { type: [BeltRecordSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property to calculate age from Date of Birth dynamically
StudentSchema.virtual('age').get(function (this: IStudent) {
  if (!this.dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

StudentSchema.index({ registrationNumber: 1 });
StudentSchema.index({ unitId: 1, status: 1 });
StudentSchema.index({ fullName: 'text', contactNumber: 1 });

export const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

export default Student;
