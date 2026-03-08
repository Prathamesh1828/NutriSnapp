import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateAICoachResponse } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { message, userContext = {} } = body;

    if (!message?.trim()) return NextResponse.json({ success: false, error: 'Message required' }, { status: 400 });

    const response = await generateAICoachResponse(message, userContext);

    return NextResponse.json({ success: true, data: { response } });
  } catch (error) {
    console.error('Coach chat error:', error);
    return NextResponse.json({ success: false, error: 'Chat failed' }, { status: 500 });
  }
}
