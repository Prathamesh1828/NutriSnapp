import mongoose, { Schema, Document, models } from 'mongoose';

interface IMealItemDoc {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  portion_g: number;
  confidence: number;
}

export interface IMealLogDocument extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  food_name: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  items: IMealItemDoc[];
  suggestions: string[];
  imageUrl?: string;
  createdAt: Date;
}

const MealItemSchema = new Schema<IMealItemDoc>({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein_g: { type: Number, default: 0 },
  carbs_g: { type: Number, default: 0 },
  fat_g: { type: Number, default: 0 },
  portion_g: { type: Number, default: 0 },
  confidence: { type: Number, default: 1 },
}, { _id: false });

const MealLogSchema = new Schema<IMealLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    food_name: { type: String, required: true },
    total_calories: { type: Number, required: true },
    total_protein: { type: Number, default: 0 },
    total_carbs: { type: Number, default: 0 },
    total_fat: { type: Number, default: 0 },
    items: [MealItemSchema],
    suggestions: [{ type: String }],
    imageUrl: String,
  },
  { timestamps: true }
);

MealLogSchema.index({ userId: 1, date: -1 });

const MealLog = models.MealLog || mongoose.model<IMealLogDocument>('MealLog', MealLogSchema);

export default MealLog;
