'use server';

import { type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';

export const setCookie = async (name: string, value: string, options?: Partial<ResponseCookie>): Promise<void> => {
  try {
    const cookieStore = await cookies();
    cookieStore.set(name, value, { ...options, httpOnly: true });
  } catch {
    // Ignore cookies error in static
  }
};
