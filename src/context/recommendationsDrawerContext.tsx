'use client';

import React, { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useState } from 'react';

export type RecommendationsDrawerProviderContext = {
  isRecMenuOpen: boolean;
  setIsRecMenuOpen: Dispatch<SetStateAction<boolean>>;
};

const RecommendationsDrawerContext = createContext<RecommendationsDrawerProviderContext>(
  {} as RecommendationsDrawerProviderContext,
);

type RecommendationsDrawerProviderProviderProps = {
  children: ReactNode;
};

const RecommendationsDrawerProvider = ({ children }: RecommendationsDrawerProviderProviderProps) => {
  const [isRecMenuOpen, setIsRecMenuOpen] = useState<boolean>(false);

  const contextObject = {
    isRecMenuOpen,
    setIsRecMenuOpen,
  };

  return (
    <RecommendationsDrawerContext.Provider value={contextObject}>{children}</RecommendationsDrawerContext.Provider>
  );
};
export default RecommendationsDrawerProvider;

export const useRecommendationsDrawer = () => useContext(RecommendationsDrawerContext);
