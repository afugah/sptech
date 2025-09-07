import { useCallback, useState } from 'react';

type IAsyncFunction<T extends Array<unknown> = unknown[], R = unknown> = (...args: T) => R | Promise<R>;

/**
 * Combines 'loading' state from external or Promise
 *
 * @param fn Function that might be async
 * @param externalLoading Optional external 'loading' state
 */
export const useLoadingFunction = <T extends unknown[], R>(
  fn: IAsyncFunction<T, R>,
  externalLoading = false,
): [boolean, (...args: T) => Promise<R>] => {
  const [isLoading, setIsLoading] = useState(false);

  const triggerFn = useCallback(
    async (...args: T) => {
      setIsLoading(true);

      try {
        return await fn(...args);
      } finally {
        setIsLoading(false);
      }
    },
    [fn],
  );

  const combinedLoading = isLoading || externalLoading;

  return [combinedLoading, triggerFn];
};
