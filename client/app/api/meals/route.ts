import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import MealLog from '@/models/MealLog';
import { getDateString } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || getDateString();
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectDB();
    const logs = await MealLog.find({ userId: session.user.id, date })
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ success: true, data: logs });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    await connectDB();

    const log = await MealLog.create({
      ...body,
      userId: session.user.id,
      date: body.date || getDateString(),
    });

    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    await connectDB();
    await MealLog.findOneAndDelete({ _id: id, userId: session.user.id });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
