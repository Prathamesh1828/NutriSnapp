// app/api/wger/route.ts — debug version
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path') ?? '';

  // Public endpoints — no token needed
  const publicPaths = ['/exercise', '/exercisecategory', '/muscle', '/equipment', '/exerciseimage'];
  const isPublic = publicPaths.some(p => path.startsWith(p));

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  // Only add auth for private endpoints (workouts, days, sets)
  if (!isPublic) {
    const apiKey = process.env.WGER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'WGER_API_KEY missing' }, { status: 500 });
    }
    headers['Authorization'] = `Token ${apiKey}`;
  }

  const res = await fetch(`https://wger.de/api/v2${path}`, {
    headers,
    cache: 'no-store',
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}