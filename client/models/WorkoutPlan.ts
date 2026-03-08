import mongoose, { Schema, Document, models } from 'mongoose';

interface IExerciseDoc {
  name: string;
  sets: number;
  reps: string;
  rest_s: number;
}

interface IWorkoutDayDoc {
  day: number;
  title: string;
  exercises: IExerciseDoc[];
}

export interface IWorkoutPlanDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  weeks: number;
  days: IWorkoutDayDoc[];
  notes: string;
  createdAt: Date;
}

const ExerciseSchema = new Schema<IExerciseDoc>({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: String, required: true },
  rest_s: { type: Number, default: 60 },
}, { _id: false });

const WorkoutDaySchema = new Schema<IWorkoutDayDoc>({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  exercises: [ExerciseSchema],
}, { _id: false });

const WorkoutPlanSchema = new Schema<IWorkoutPlanDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    weeks: { type: Number, default: 4 },
    days: [WorkoutDaySchema],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const WorkoutPlan = models.WorkoutPlan || mongoose.model<IWorkoutPlanDocument>('WorkoutPlan', WorkoutPlanSchema);

export default WorkoutPlan;
