import { type NextRequest, NextResponse } from 'next/server';

// Use Edge Runtime for faster global response times
export const runtime = 'edge';

/**
 * API endpoint to synchronize user and session IDs between client and server
 * This helps ensure consistent IDs for features like gift card persistence
 * Migrated to Edge Runtime for better performance
 */
export async function GET(request: NextRequest) {
  // Use request.cookies for Edge Runtime compatibility
  const findifyUid = request.cookies.get('findify_uid')?.value;
  const findifySid = request.cookies.get('findify_sid')?.value;

  return NextResponse.json({ findifyUid, findifySid });
}

export async function POST(request: NextRequest) {
  const { findifyUid, findifySid } = await request.json();

  // Create response with cookies for Edge Runtime compatibility
  const response = NextResponse.json({ success: true });

  if (findifyUid) {
    response.cookies.set('findify_uid', findifyUid, {
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  if (findifySid) {
    response.cookies.set('findify_sid', findifySid, {
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 60, // 30 minutes
    });
  }

  return response;
}
