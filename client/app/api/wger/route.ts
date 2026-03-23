// app/api/wger/route.ts — debug version
import { NextRequest, NextResponse } from 'next/server';

async function handleRequest(req: NextRequest, method: string) {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path') ?? '';

    // Public endpoints — no token needed
    const publicPaths = ['/exercise', '/exercisecategory', '/muscle', '/equipment', '/exerciseimage', '/exercisestyle'];
    const isPublic = publicPaths.some(p => path.startsWith(p));

    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'NutriSnap/1.0 (Next.js Proxy)',
    };

    if (!isPublic) {
        const apiKey = process.env.WGER_API_KEY;
        if (!apiKey) {
            console.error('[proxy] WGER_API_KEY missing');
            return NextResponse.json({ error: 'WGER_API_KEY missing' }, { status: 500 });
        }
        headers['Authorization'] = `Token ${apiKey}`;
    }

    try {
        const fetchOptions: RequestInit = {
            method,
            headers,
            cache: 'no-store',
        };

        if (['POST', 'PATCH', 'PUT'].includes(method)) {
            const body = await req.json().catch(() => ({}));
            fetchOptions.body = JSON.stringify(body);
        }

        // Ensure we don't have double slashes and correctly construct the URL
        const basePath = 'https://wger.de/api/v2';
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        const url = `${basePath}${normalizedPath}`;
        
        // Log sanitized headers for debugging
        const sanitizedHeaders = { ...headers };
        if (sanitizedHeaders['Authorization']) {
            sanitizedHeaders['Authorization'] = sanitizedHeaders['Authorization'].substring(0, 10) + '...';
        }
        console.log(`[proxy] Fetching: ${method} ${url}`, sanitizedHeaders);

        const res = await fetch(url, fetchOptions);
        console.log(`[proxy] WGER Status: ${res.status}`);
        // console.log(`[proxy] WGER Headers:`, Object.fromEntries(res.headers.entries()));

        const contentType = res.headers.get('content-type');
        let data;

        if (res.status === 204) {
            data = {};
        } else if (contentType && contentType.includes('application/json')) {
            try {
                data = await res.json();
            } catch {
                data = { error: 'Failed to parse JSON' };
            }
        } else {
            data = { text: await res.text() };
        }

        if (!res.ok) {
            console.error(`[proxy] WGER ${res.status} for ${url}`, data);
        }

        return NextResponse.json(data, { status: res.status });
    } catch (err: any) {
        console.error(`[proxy] Error fetching ${path}:`, err);
        return NextResponse.json({ error: err.message || 'Internal Proxy Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return handleRequest(req, 'GET');
}

export async function POST(req: NextRequest) {
    return handleRequest(req, 'POST');
}

export async function DELETE(req: NextRequest) {
    return handleRequest(req, 'DELETE');
}

export async function PATCH(req: NextRequest) {
    return handleRequest(req, 'PATCH');
}