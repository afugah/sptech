'use client';

import React, { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useState } from 'react';
import { type IShoplab } from '@/src/lib/framework/Shoplab/types/IShoplab';

export type PageContext = {
  isMenuOpen: boolean;
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
  isDesktopMenuOpen: boolean;
  setIsDesktopMenuOpen: Dispatch<SetStateAction<boolean>>;
  isCountrySelectOpen: boolean;
  setIsCountrySelectOpen: Dispatch<SetStateAction<boolean>>;
  userMigrationEmail: string;
  setUserMigrationEmail: Dispatch<SetStateAction<string>>;
  desktopMenu: IShoplab.Children | null | undefined;
  setDesktopMenu: Dispatch<SetStateAction<IShoplab.Children | null | undefined>>;
};

const PageContext = createContext<PageContext>({} as PageContext);

type PageProviderProps = {
  children: ReactNode;
};

const PageProvider = ({ children }: PageProviderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isCountrySelectOpen, setIsCountrySelectOpen] = useState<boolean>(false);
  const [userMigrationEmail, setUserMigrationEmail] = useState('');
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [desktopMenu, setDesktopMenu] = useState<IShoplab.Children | null | undefined>(null);

  const contextObject = {
    isMenuOpen,
    setDesktopMenu,
    desktopMenu,
    setIsMenuOpen,
    isDesktopMenuOpen,
    setIsDesktopMenuOpen,
    isCountrySelectOpen,
    setIsCountrySelectOpen,
    userMigrationEmail,
    setUserMigrationEmail,
  };

  return <PageContext.Provider value={contextObject}>{children}</PageContext.Provider>;
};
export default PageProvider;

export const usePage = () => useContext(PageContext);
