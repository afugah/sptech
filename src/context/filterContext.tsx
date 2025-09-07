'use client';

import React, { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useState } from 'react';

export type IFiltersContext = {
  isFiltersSelectOpen: boolean;
  setIsFiltersSelectOpen: Dispatch<SetStateAction<boolean>>;
};

const FiltersContext = createContext<IFiltersContext>({} as IFiltersContext);

type FiltersProviderProps = {
  children: ReactNode;
};

const FiltersProvider = ({ children }: FiltersProviderProps) => {
  const [isFiltersSelectOpen, setIsFiltersSelectOpen] = useState<boolean>(false);

  const contextObject = {
    isFiltersSelectOpen,
    setIsFiltersSelectOpen,
  };

  return <FiltersContext.Provider value={contextObject}>{children}</FiltersContext.Provider>;
};
export default FiltersProvider;

export const useFilters = () => useContext(FiltersContext);
