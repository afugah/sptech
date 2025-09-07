'use client';

import React, { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorage from '@/src/hooks/useLocalStorage';
import { type ICollectionWishlistItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';

const WISHLIST_KEY = 'efva-attling-wishlist';

interface WishlistContextType {
  wishlistItems: ICollectionWishlistItem[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: ICollectionWishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: ICollectionWishlistItem) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

interface WishlistProviderProps {
  children: React.ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useLocalStorage<ICollectionWishlistItem[]>(WISHLIST_KEY, []);

  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return wishlistItems.some((item) => item.sku === productId);
    },
    [wishlistItems],
  );

  const addToWishlist = useCallback(
    (product: ICollectionWishlistItem): void => {
      setWishlistItems((prevItems) => {
        if (prevItems.some((item) => item.sku === product.sku)) {
          return prevItems;
        }
        return [...prevItems, product];
      });
    },
    [setWishlistItems],
  );

  const removeFromWishlist = useCallback(
    (productId: string): void => {
      setWishlistItems((prevItems) => prevItems.filter((item) => item.sku !== productId));
    },
    [setWishlistItems],
  );

  const toggleWishlist = useCallback(
    (product: ICollectionWishlistItem): void => {
      if (isInWishlist(product.sku)) {
        removeFromWishlist(product.sku);
      } else {
        addToWishlist(product);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist],
  );

  const clearWishlist = useCallback((): void => {
    setWishlistItems([]);
  }, [setWishlistItems]);

  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);

  const value: WishlistContextType = {
    wishlistItems,
    wishlistCount,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlistContext = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
};
