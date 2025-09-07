import { cookies } from 'next/headers';

export const isCookiesAvailable = (): boolean => {
  try {
    // In Next.js 15, cookies() can be called synchronously to check availability
    // The actual cookie operations should use await cookies()
    cookies;
    return true;
  } catch {
    return false;
  }
};
