import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateWorkoutPlan } from '@/lib/gemini';
import connectDB from '@/lib/mongodb';
import WorkoutPlan from '@/models/WorkoutPlan';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { goal, experience, daysPerWeek, equipment, age, weight } = body;

    const plan = await generateWorkoutPlan({ goal, experience, daysPerWeek, equipment, age, weight });

    await connectDB();
    const saved = await WorkoutPlan.create({ ...plan, userId: session.user.id });

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error('Workout gen error:', error);
    return NextResponse.json({ success: false, error: 'Generation failed' }, { status: 500 });
  }
}
