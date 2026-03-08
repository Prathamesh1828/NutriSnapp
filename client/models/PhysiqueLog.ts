import mongoose, { Schema, Document, models } from 'mongoose';

export interface IPhysiqueLogDocument extends Document {
  userId: mongoose.Types.ObjectId;
  imageUrl: string;
  goal: string;
  timeframe: string;
  analysis: {
    assessment: string;
    strengths: string[];
    focus_areas: string[];
    recommendations: Array<{ category: string; tip: string }>;
    projected_progress: string;
  };
  createdAt: Date;
}

const PhysiqueLogSchema = new Schema<IPhysiqueLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: true },
    goal: { type: String, required: true },
    timeframe: { type: String, required: true },
    analysis: {
      assessment: { type: String, default: '' },
      strengths: [{ type: String }],
      focus_areas: [{ type: String }],
      recommendations: [{
        category: { type: String },
        tip: { type: String },
        _id: false,
      }],
      projected_progress: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

const PhysiqueLog = models.PhysiqueLog || mongoose.model<IPhysiqueLogDocument>('PhysiqueLog', PhysiqueLogSchema);

export default PhysiqueLog;
