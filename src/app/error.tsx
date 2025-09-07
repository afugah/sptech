'use client';

import { useEffect, useRef } from 'react';
import { logError } from '@/src/helpers/errors';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const hasLogged = useRef(false);

  useEffect(() => {
    if (!hasLogged.current) {
      try {
        // Handle case where error might be a JSON string instead of an Error object
        // This should be rare now that we've fixed RSC serialization issues
        if (typeof error === 'string') {
          try {
            // Try to parse if it's a JSON string
            const parsedError = JSON.parse(error);
            logError(parsedError, 'NextJsErrorBoundary-ParsedString-RSC');
            console.warn('RSC serialization issue detected - error came as JSON string:', error);
          } catch {
            // If parsing fails, just log the string
            logError(error, 'NextJsErrorBoundary-String');
          }
        } else if (error instanceof Error) {
          // Normal error object handling
          logError(error, 'NextJsErrorBoundary');
        } else {
          // For any other type of error
          logError(String(error), 'NextJsErrorBoundary-Unknown');
        }
        hasLogged.current = true;
      } catch (loggingError) {
        // Prevent error loop in the error handler itself
        console.warn('Error while handling error:', String(loggingError));
        hasLogged.current = true;
      }
    }
  }, [error]);

  return (
    <main className={'flex min-h-[400px] flex-col items-center justify-center gap-4'}>
      <h2 className={'text-2xl font-semibold'}>Something went wrong!</h2>
      <p className={'text-gray-600'}>We apologize for the inconvenience.</p>
      <button
        className={'mt-4 rounded-md bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800'}
        onClick={() => {
          hasLogged.current = false;
          reset();
        }}
      >
        Try again!
      </button>
    </main>
  );
}
