import mongoose, { Schema, Document, models } from 'mongoose';

export interface IMemberProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  avatar?: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  bodyType?: string;
  goal: 'cut' | 'bulk' | 'maintain';
  experience: string;
  activityLevel: string;
  targets: {
    calories: number;
    protein: number;
    water: number;
    aiAdaptive: boolean;
  };
}

const MemberProfileSchema = new Schema<IMemberProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    avatar: String,
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    bodyType: String,
    goal: { type: String, enum: ['cut', 'bulk', 'maintain'], required: true },
    experience: { type: String, required: true },
    activityLevel: { type: String, required: true },
    targets: {
      calories: { type: Number, default: 2000 },
      protein: { type: Number, default: 150 },
      water: { type: Number, default: 2500 },
      aiAdaptive: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const MemberProfile = models.MemberProfile || mongoose.model<IMemberProfileDocument>('MemberProfile', MemberProfileSchema);

export default MemberProfile;
