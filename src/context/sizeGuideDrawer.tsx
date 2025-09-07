'use client';

import React, { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useState } from 'react';

export type SizeGuideDrawerProviderContext = {
  isSizeGuideOpen: boolean;
  setIsSizeGuideOpen: Dispatch<SetStateAction<boolean>>;
};

const SizeGuideDrawerContext = createContext<SizeGuideDrawerProviderContext>({} as SizeGuideDrawerProviderContext);

type SizeGuideDrawerProviderProviderProps = {
  children: ReactNode;
};

const SizeGuideDrawerProvider = ({ children }: SizeGuideDrawerProviderProviderProps) => {
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);

  const contextObject = {
    isSizeGuideOpen,
    setIsSizeGuideOpen,
  };

  return <SizeGuideDrawerContext.Provider value={contextObject}>{children}</SizeGuideDrawerContext.Provider>;
};
export default SizeGuideDrawerProvider;

export const useSizeGuideDrawer = () => useContext(SizeGuideDrawerContext);
