'use client';

import { useEffect } from 'react';
import { syncUserIds } from '@/src/lib/framework/UserId/shared/syncUserIds';

/**
 * Component that synchronizes user IDs between client and server
 * This is particularly important for features like gift card persistence
 * across session changes (login/logout)
 */
export function UserIdSynchronizer() {
  useEffect(() => {
    // Synchronize IDs on component mount
    syncUserIds();

    // Also synchronize when localStorage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'findify_uid' || event.key === 'findify_sid') {
        syncUserIds();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
