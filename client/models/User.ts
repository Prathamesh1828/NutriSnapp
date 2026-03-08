import mongoose, { Schema, Document, models } from 'mongoose';

export interface IUserDocument extends Document {
  email: string;
  password: string;
  role: 'member' | 'coach';
  isVerified: boolean;
  onboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    role: {
      type: String,
      enum: ['member', 'coach'],
      required: [true, 'Role is required'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
