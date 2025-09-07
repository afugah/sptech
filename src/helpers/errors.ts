/**
 * Utility for consistent error logging with optional throttling
 */

// Track errors to prevent excessive logging
const errorCache = new Map<string, { count: number; lastLogged: number }>();
const ERROR_THROTTLE_MS = 5000; // Only log the same error once per 5 seconds
const MAX_ERRORS_PER_SESSION = 100; // Limit total errors logged per session
let totalErrorsLogged = 0;

/**
 * Log errors with throttling to prevent console spam
 * @param error The error to log
 * @param context Optional context information
 */
export const logError = (error: unknown, context?: string): void => {
  // Skip logging in production if needed
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DISABLE_ERROR_LOGGING === 'true') {
    return;
  }

  // Check if we've hit the max errors per session
  if (totalErrorsLogged >= MAX_ERRORS_PER_SESSION) {
    // Only log this warning once
    if (totalErrorsLogged === MAX_ERRORS_PER_SESSION) {
      console.warn('Maximum error logging limit reached. Some errors will be suppressed.');
      totalErrorsLogged++;
    }
    return;
  }

  // Create a key for this error
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorKey = `${errorMessage}${context ? `-${context}` : ''}`;
  const now = Date.now();

  // Check if we've logged this error recently
  const cachedError = errorCache.get(errorKey);
  if (cachedError) {
    // If we've logged this error recently, just increment the count
    if (now - cachedError.lastLogged < ERROR_THROTTLE_MS) {
      errorCache.set(errorKey, {
        count: cachedError.count + 1,
        lastLogged: cachedError.lastLogged,
      });
      return;
    }

    // If it's been a while, log it again with the count of suppressed instances
    if (cachedError.count > 1) {
      console.error(`${errorMessage} (occurred ${cachedError.count} times)`, context ? { context } : '');
    } else {
      console.error(errorMessage, context ? { context } : '');
    }
  } else {
    // First time seeing this error

    console.error(errorMessage, context ? { context } : '');
  }

  // Update the cache
  errorCache.set(errorKey, { count: 1, lastLogged: now });
  totalErrorsLogged++;
};

/**
 * Log informational messages with optional throttling
 */
export const logInfo = (message: string, throttleMs = 0): void => {
  // Skip logging in production if needed
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DISABLE_INFO_LOGGING === 'true') {
    return;
  }

  if (throttleMs > 0) {
    const key = `info-${message}`;
    const cachedInfo = errorCache.get(key);
    const now = Date.now();

    if (cachedInfo && now - cachedInfo.lastLogged < throttleMs) {
      return;
    }

    errorCache.set(key, { count: 1, lastLogged: now });
  }

  // eslint-disable-next-line no-console
  console.info(message);
};
