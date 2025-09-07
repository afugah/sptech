import { cookies } from 'next/headers';
import { singleton } from 'tsyringe';
import { v4 as uuid } from 'uuid';
import { type IUserIdService } from '@/src/lib/framework/UserId/domain/IUserIdService';
import { setCookie } from '@/src/lib/framework/UserId/shared/setCookieAction';
import { isCookiesAvailable } from '@/src/util/isCookiesAvailable';

@singleton()
export class UserIdService implements IUserIdService {
  // Use the same names for cookies as localStorage to ensure consistency
  private readonly _uidCookieName = 'findify_uid';
  private readonly _findifyUidLocalStorageKey = 'findify_uid';
  private readonly _staticUid = '00000000-0000-0000-0000-000000000001';

  private readonly _sidCookieName = 'findify_sid';
  private readonly _findifySidLocalStorageKey = 'findify_sid';
  private readonly _sidExpirationMs = 30 * 60 * 1000;
  private readonly _staticSid = '00000000-0000-0000-0000-000000000002';

  /* #region UID */

  public async getUid(): Promise<string> {
    // First check if we're on the server and cookies are not available
    if (!this.isCookiesAvailable) {
      // Try to get the ID from localStorage if we're on the client
      if (this.isLocalStorageAvailable()) {
        const localStorageUid = localStorage.getItem(this._findifyUidLocalStorageKey);
        if (localStorageUid) return localStorageUid;
      }
      return this._staticUid;
    }

    // Check for cookie first
    const cookieStore = await cookies();
    const cookie = cookieStore.get(this._uidCookieName)?.value || null;
    if (cookie) {
      // If we have a cookie and we're on the client, sync it to localStorage
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(this._findifyUidLocalStorageKey, cookie);
      }
      return cookie;
    }

    // Check localStorage as fallback if we're on the client
    if (this.isLocalStorageAvailable()) {
      const localStorageUid = localStorage.getItem(this._findifyUidLocalStorageKey);
      if (localStorageUid) {
        // Sync back to cookie
        this.setUid(localStorageUid);
        return localStorageUid;
      }
    }

    // Generate a new ID if none exists
    const newUid = UserIdService.generateIdentifier();
    await this.setUid(newUid);

    return newUid;
  }

  public get uid(): string {
    // Synchronous getter for backward compatibility - only use when cookies aren't needed
    if (!this.isCookiesAvailable) {
      if (this.isLocalStorageAvailable()) {
        const localStorageUid = localStorage.getItem(this._findifyUidLocalStorageKey);
        if (localStorageUid) return localStorageUid;
      }
      return this._staticUid;
    }

    // For server-side usage, return static ID to avoid async issues
    return this._staticUid;
  }

  public async setUid(uid: string): Promise<void> {
    // Set cookie if available
    if (this.isCookiesAvailable) {
      // Clear old cookie if it exists (for migration)
      try {
        // Always try to clear the old cookie name
        const cookieStore = await cookies();
        cookieStore.delete('uid');
      } catch {
        // Ignore errors when trying to delete old cookies or during static generation
      }
      setCookie(this._uidCookieName, uid);
    }

    // Also set in localStorage if available
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(this._findifyUidLocalStorageKey, uid);
    }
  }

  /* #endregion */

  /* #region SID */

  public async getSid(): Promise<string> {
    // First check if we're on the server and cookies are not available
    if (!this.isCookiesAvailable) {
      // Try to get the ID from localStorage if we're on the client
      if (this.isLocalStorageAvailable()) {
        const localStorageSid = localStorage.getItem(this._findifySidLocalStorageKey);
        if (localStorageSid) return localStorageSid;
      }
      return this._staticSid;
    }

    // Check for cookie first
    const cookieStore = await cookies();
    const cookie = cookieStore.get(this._sidCookieName)?.value || null;
    if (cookie) {
      // If we have a cookie and we're on the client, sync it to localStorage
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(this._findifySidLocalStorageKey, cookie);
      }
      return cookie;
    }

    // Check localStorage as fallback if we're on the client
    if (this.isLocalStorageAvailable()) {
      const localStorageSid = localStorage.getItem(this._findifySidLocalStorageKey);
      if (localStorageSid) {
        // Sync back to cookie
        this.setSid(localStorageSid);
        return localStorageSid;
      }
    }

    // Generate a new ID if none exists
    const newSid = UserIdService.generateIdentifier();
    await this.setSid(newSid);

    return newSid;
  }

  public get sid(): string {
    // Synchronous getter for backward compatibility - only use when cookies aren't needed
    if (!this.isCookiesAvailable) {
      if (this.isLocalStorageAvailable()) {
        const localStorageSid = localStorage.getItem(this._findifySidLocalStorageKey);
        if (localStorageSid) return localStorageSid;
      }
      return this._staticSid;
    }

    // For server-side usage, return static ID to avoid async issues
    return this._staticSid;
  }

  protected async setSid(sid: string): Promise<void> {
    // Set cookie if available
    if (this.isCookiesAvailable) {
      // Clear old cookie if it exists (for migration)
      try {
        // Always try to clear the old cookie name
        const cookieStore = await cookies();
        cookieStore.delete('sid');
      } catch {
        // Ignore errors when trying to delete old cookies or during static generation
      }
      setCookie(this._sidCookieName, sid, { expires: new Date(Date.now() + this._sidExpirationMs) });
    }

    // Also set in localStorage if available
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(this._findifySidLocalStorageKey, sid);
    }
  }

  /* #endregion */

  /* #region Internals */
  protected static generateIdentifier(): string {
    return uuid();
  }

  private get isCookiesAvailable(): boolean {
    return isCookiesAvailable();
  }

  private isLocalStorageAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && window.localStorage !== undefined;
    } catch {
      return false;
    }
  }
  /* #endregion */
}
