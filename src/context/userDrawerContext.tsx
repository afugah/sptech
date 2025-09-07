'use client';

import React, {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react';
import { type UserModalViewEnum } from '@/src/lib/types/common';

export type UserDrawerProviderContext = {
  isMenuOpen: boolean;
  showView: UserModalViewEnum | null;
  showRegistrationMessage: string;
  setShowView: Dispatch<SetStateAction<UserModalViewEnum | null>>;
  setShowRegistrationMessage: Dispatch<SetStateAction<string>>;
};

const UserDrawerContext = createContext<UserDrawerProviderContext>({} as UserDrawerProviderContext);

type UserDrawerProviderProviderProps = {
  children: ReactNode;
};

const UserDrawerProvider = ({ children }: UserDrawerProviderProviderProps) => {
  const [showView, setShowView] = useState<UserModalViewEnum | null>(null);
  const [showRegistrationMessage, setShowRegistrationMessage] = useState('');
  const isMenuOpen = useMemo(() => showView !== null, [showView]);

  const contextObject = {
    isMenuOpen,
    showView,
    showRegistrationMessage,
    setShowView,
    setShowRegistrationMessage,
  };

  return <UserDrawerContext.Provider value={contextObject}>{children}</UserDrawerContext.Provider>;
};
export default UserDrawerProvider;

export const useUserDrawer = () => useContext(UserDrawerContext);
