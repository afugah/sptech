export interface IUserIdService {
  /**
   * Get the user unique id. If it doesn't exist, generate a new one
   * @returns {string} the user unique id
   */
  uid: string;

  /**
   * Get the session unique id. If it doesn't exist, generate a new one
   * Lasts for 30 minutes
   * @returns {string} the session unique id
   */
  sid: string;

  /**
   * Set the user unique id from database after successful login
   * @param uid the user unique id
   */
  setUid(uid: string): void;
}
