import { type Session } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useVoyado } from '@/src/context/voyadoContext';
import { useRouter } from '@/src/i18n/navigation';
import { useCart } from './cartContext';

export const UserContext = createContext<PageContext>({} as PageContext);

type AuthProviderProps = {
  children: ReactNode;
};

export type PageContext = {
  user: Session['user'] | undefined;
  isSignedIn: boolean;
  isLoading: boolean;
  error: string | null;

  signOut: () => void;
  refresh: () => Promise<void>;
};

const UserProvider = ({ children }: AuthProviderProps) => {
  const [signInError, setSignInError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { init, removeCustomer } = useVoyado();
  const { data: session, status, update } = useSession();

  const user = useMemo<Session['user'] | undefined>(() => session?.user, [session?.user]);
  const isSignedIn = useMemo(() => status === 'authenticated', [status]);
  const { replace } = useRouter();
  /* #region Init Voyado */
  const isVoyadoInitialized = useRef(false);
  const { startSessionWithNewMemberLevel, cart } = useCart();
  useEffect(() => {
    if (isVoyadoInitialized.current || !user?.email) return;

    init(user.email);
    isVoyadoInitialized.current = true;
  }, [init, user]);
  /* #endregion */

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    await update().finally(() => setIsLoading(false));
  }, [update]);

  const signOutUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setSignInError(null);
      //Change storeGroupId
      await startSessionWithNewMemberLevel(cart, true);
      // Sign out user
      await signOut();
      // After sign out
      removeCustomer();

      // Ensure latest cart value is used
      isVoyadoInitialized.current = false;
      setIsLoading(false);

      // Redirect after sign-out (if desired)
      replace('/');
    } catch (error) {
      console.error('Error during sign out process:', error);
      setSignInError('An error occurred during sign-out. Please try again.');
      setIsLoading(false);
    }
  }, [removeCustomer, replace, startSessionWithNewMemberLevel, cart]);

  const contextObject: PageContext = {
    user,
    isSignedIn,
    isLoading,
    error: signInError,
    signOut: signOutUser,
    refresh: refreshSession,
  };

  return <UserContext.Provider value={contextObject}>{children}</UserContext.Provider>;
};

export default UserProvider;

export const useUser = () => useContext(UserContext);
