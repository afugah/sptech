/**
 * Utility to synchronize user and session IDs between client and server
 * This is particularly important for features like gift card persistence
 * across session changes (login/logout)
 */

export async function syncUserIds() {
  if (typeof window === 'undefined') {
    return; // Only run on client side
  }

  // Get IDs from localStorage
  const findifyUid = localStorage.getItem('findify_uid');
  const findifySid = localStorage.getItem('findify_sid');

  // If we have IDs in localStorage, sync them to server cookies
  if (findifyUid || findifySid) {
    try {
      await fetch('/api/user-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          findifyUid,
          findifySid,
        }),
      });
      // Synchronization complete
    } catch (error) {
      console.error('Failed to sync user IDs with server:', error);
    }
  } else {
    // If we don't have IDs in localStorage, try to get them from server
    try {
      const response = await fetch('/api/user-id');
      const data = await response.json();
      if (data.findifyUid) {
        localStorage.setItem('findify_uid', data.findifyUid);
      }
      if (data.findifySid) {
        localStorage.setItem('findify_sid', data.findifySid);
      }
    } catch (error) {
      console.error('Failed to fetch user IDs from server:', error);
    }
  }
}
