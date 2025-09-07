/**
 * Server utilities for Next.js 15 compatibility
 * Handles async headers() and cookies() functions
 */

import { cookies, headers } from 'next/headers';

export async function getHeaderValue(key: string): Promise<string | null> {
  const headerStore = await headers();
  return headerStore.get(key);
}

export async function getCookieValue(key: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(key)?.value;
}

export async function setCookie(key: string, value: string, options?: Record<string, unknown>): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(key, value, options);
}

export async function deleteCookie(key: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(key);
}

export async function getClientIP(_request: Request): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get('x-forwarded-for') ||
    headerStore.get('x-real-ip') ||
    headerStore.get('cf-connecting-ip') ||
    '127.0.0.1'
  );
}
