// app/api/exercisedb/route.ts
// Proxies requests to ExerciseDB on RapidAPI
// Keeps RAPIDAPI_KEY server-side only

import { NextRequest, NextResponse } from 'next/server';

const EXERCISEDB_BASE = 'https://exercisedb.p.rapidapi.com';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Missing ?path= parameter' }, { status: 400 });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'RAPIDAPI_KEY is not set in environment variables' }, { status: 500 });
  }

  try {
    const url = `${EXERCISEDB_BASE}${path.startsWith('/') ? path : `/${path}`}`;

    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[exercisedb proxy] ${res.status} for path=${path}`, body);
      return NextResponse.json({ error: `ExerciseDB returned ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[exercisedb proxy] error:', err);
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}