import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { analyzeMealFromImage } from '@/lib/gemini';
import MealLog from '@/models/MealLog';
import { getDateString } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { image, mimeType = 'image/jpeg', imageUrl } = body;

    if (!image) return NextResponse.json({ success: false, error: 'Image data required' }, { status: 400 });

    // Remove base64 prefix if present
    const base64 = image.replace(/^data:image\/[a-z]+;base64,/, '');

    // Call Gemini
    const analysis = await analyzeMealFromImage(base64, mimeType);

    // Save to DB
    await connectDB();
    const log = await MealLog.create({
      userId: session.user.id,
      date: getDateString(),
      imageUrl: imageUrl || null,
      ...analysis,
    });

    return NextResponse.json({ success: true, data: { analysis, logId: log._id } });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 });
  }
}
