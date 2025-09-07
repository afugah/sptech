import { isNil } from 'lodash';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

const isServer = typeof window === 'undefined';
type SetValue<T> = Dispatch<SetStateAction<T>>;

/**
 * Hook signature: useLocalStorage(key, initialValue)
 *
 * Returns: [storedValue, setValue, isLoading?]
 *    - storedValue: T
 *    - setValue: (value: T | ((prevValue: T) => T)) => void
 *    - isLoading?: boolean (optional if you want to check hydration status)
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>, boolean?] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  const initialize = () => {
    if (isServer) {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  useEffect(() => {
    if (!isServer) {
      setStoredValue(initialize());
    }
    // Mark loading as complete
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setValue: SetValue<T> = (valueOrFn) => {
    try {
      const valueToStore = valueOrFn instanceof Function ? valueOrFn(storedValue) : valueOrFn;
      setStoredValue(valueToStore);

      if (!isServer) {
        if (isNil(valueToStore)) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // isLoading is returned last and is optional in the return type
  return [storedValue, setValue, isLoading] as [T, SetValue<T>, boolean?];
}

export default useLocalStorage;
