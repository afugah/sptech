/**
 * Cache Revalidation API Route
 *
 * Provides on-demand ISR revalidation for specific pages and tags.
 * Optimized for Vercel's Edge Network with secure access control.
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

// Use Edge Runtime for faster global revalidation
export const runtime = 'edge';

interface RevalidateRequest {
  type: 'path' | 'tag';
  value: string;
  secret?: string;
}

// Secure revalidation with secret token
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'dev-secret';

export async function POST(request: NextRequest) {
  try {
    const body: RevalidateRequest = await request.json();
    const { type, value, secret } = body;

    // Verify secret token for security
    if (secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid revalidation secret' }, { status: 401 });
    }

    if (!type || !value) {
      return NextResponse.json({ error: 'Missing required fields: type and value' }, { status: 400 });
    }

    let result: { revalidated: boolean; type: string; value: string };

    if (type === 'path') {
      // Revalidate specific path
      revalidatePath(value);
      result = { revalidated: true, type: 'path', value };

      console.warn(`Revalidated path: ${value}`);
    } else if (type === 'tag') {
      // Revalidate by cache tag
      revalidateTag(value);
      result = { revalidated: true, type: 'tag', value };

      console.warn(`Revalidated tag: ${value}`);
    } else {
      return NextResponse.json({ error: 'Invalid type. Must be "path" or "tag"' }, { status: 400 });
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Revalidation error:', error);

    return NextResponse.json({ error: 'Internal server error during revalidation' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const value = searchParams.get('value');
  const secret = searchParams.get('secret');

  if (!type || !value || secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
  }

  try {
    if (type === 'path') {
      revalidatePath(value);
    } else if (type === 'tag') {
      revalidateTag(value);
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json(
      { revalidated: true, type, value },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    );
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
