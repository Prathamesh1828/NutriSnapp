import mongoose, { Schema, Document, models } from 'mongoose';

export interface IClientRelationshipDocument extends Document {
  coachId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  status: 'pending' | 'active' | 'inactive';
  connectedAt: Date;
  goal?: string;
  adherencePercent: number;
  lastActive?: Date;
}

const ClientRelationshipSchema = new Schema<IClientRelationshipDocument>(
  {
    coachId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'inactive'],
      default: 'pending',
    },
    connectedAt: { type: Date, default: Date.now },
    goal: String,
    adherencePercent: { type: Number, default: 0, min: 0, max: 100 },
    lastActive: Date,
  },
  { timestamps: true }
);

ClientRelationshipSchema.index({ coachId: 1, memberId: 1 }, { unique: true });

const ClientRelationship = models.ClientRelationship || mongoose.model<IClientRelationshipDocument>('ClientRelationship', ClientRelationshipSchema);

export default ClientRelationship;
