'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Product page error:', error);
  }, [error]);

  return (
    <div className={'flex min-h-[400px] flex-col items-center justify-center'}>
      <h2 className={'text-xl font-semibold'}>Something went wrong!</h2>
      <p className={'mt-2 text-gray-600'}>
        {error.digest === 'DYNAMIC_SERVER_USAGE'
          ? 'This page requires dynamic rendering.'
          : 'Failed to load product information.'}
      </p>
      <button onClick={() => reset()} className={'mt-4 rounded bg-black px-4 py-2 text-white hover:bg-gray-800'}>
        Try again
      </button>
    </div>
  );
}
