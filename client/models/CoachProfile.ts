import mongoose, { Schema, Document, models } from 'mongoose';

export interface ICoachProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  avatar?: string;
  bio: string;
  experience: string;
  certification: string;
  specialties: string[];
  primaryFocus: string;
  coachingStyle: string;
  clientVolume: string;
  workspaceName: string;
  location?: string;
  defaultProgramStyle: string;
  checkInFrequency: string;
  notificationPrefs: {
    onMealLog: boolean;
    onWorkoutComplete: boolean;
    onMissedCheckin: boolean;
    weeklyDigest: boolean;
  };
}

const CoachProfileSchema = new Schema<ICoachProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    avatar: String,
    bio: { type: String, default: '' },
    experience: { type: String, required: true },
    certification: { type: String, required: true },
    specialties: [{ type: String }],
    primaryFocus: { type: String, default: '' },
    coachingStyle: { type: String, default: '' },
    clientVolume: { type: String, default: '' },
    workspaceName: { type: String, default: '' },
    location: String,
    defaultProgramStyle: { type: String, default: '' },
    checkInFrequency: { type: String, default: 'weekly' },
    notificationPrefs: {
      onMealLog: { type: Boolean, default: true },
      onWorkoutComplete: { type: Boolean, default: true },
      onMissedCheckin: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const CoachProfile = models.CoachProfile || mongoose.model<ICoachProfileDocument>('CoachProfile', CoachProfileSchema);

export default CoachProfile;
