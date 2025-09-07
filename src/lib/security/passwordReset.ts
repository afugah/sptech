/**
 * Secure password reset utilities
 * Provides secure token-based password reset functionality
 */

import { createHash } from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * Password reset token configuration
 */
const TOKEN_CONFIG = {
  // Token expiration time in minutes
  EXPIRATION_MINUTES: 15,
  // Maximum reset attempts per email per hour
  MAX_ATTEMPTS_PER_HOUR: 3,
  // Token length for secure generation
  TOKEN_LENGTH: 32,
};

/**
 * In-memory store for rate limiting (use Redis in production)
 */
const resetAttempts = new Map<string, { count: number; lastAttempt: number }>();

/**
 * Blacklisted tokens (use Redis/database in production)
 */
const blacklistedTokens = new Set<string>();

/**
 * Interface for password reset token payload
 */
interface ResetTokenPayload {
  contactId: string;
  email: string;
  issued: number;
  purpose: 'password_reset';
}

/**
 * Interface for reset attempt tracking
 */
interface _ResetAttempt {
  count: number;
  lastAttempt: number;
}

/**
 * Generate a secure password reset token
 * @param contactId - User contact ID
 * @param email - User email address
 * @returns Generated token string
 */
export function generatePasswordResetToken(contactId: string, email: string): string {
  const secretKey = process.env.AUTH_SECRET;

  if (!secretKey) {
    throw new Error('AUTH_SECRET environment variable is required');
  }

  if (!isValidEmail(email)) {
    throw new Error('Invalid email address format');
  }

  const payload: ResetTokenPayload = {
    contactId,
    email: email.toLowerCase(),
    issued: Date.now(),
    purpose: 'password_reset',
  };

  const token = jwt.sign(payload, secretKey, {
    expiresIn: `${TOKEN_CONFIG.EXPIRATION_MINUTES}m`,
    algorithm: 'HS256',
    issuer: 'efva-attling-auth',
    audience: 'password-reset',
  });

  return token;
}

/**
 * Verify and decode password reset token
 * @param token - Token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyPasswordResetToken(token: string): ResetTokenPayload | null {
  const secretKey = process.env.AUTH_SECRET;

  if (!secretKey) {
    throw new Error('AUTH_SECRET environment variable is required');
  }

  if (!token || typeof token !== 'string') {
    return null;
  }

  // Check if token is blacklisted
  if (blacklistedTokens.has(token)) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, secretKey, {
      algorithms: ['HS256'],
      issuer: 'efva-attling-auth',
      audience: 'password-reset',
    }) as ResetTokenPayload;

    // Validate token purpose
    if (decoded.purpose !== 'password_reset') {
      return null;
    }

    // Validate token age (additional check beyond JWT expiration)
    const tokenAge = Date.now() - decoded.issued;
    const maxAge = TOKEN_CONFIG.EXPIRATION_MINUTES * 60 * 1000;

    if (tokenAge > maxAge) {
      return null;
    }

    return decoded;
  } catch {
    // Token is invalid, expired, or malformed
    return null;
  }
}

/**
 * Invalidate a password reset token (add to blacklist)
 * @param token - Token to invalidate
 */
export function invalidatePasswordResetToken(token: string): void {
  if (token && typeof token === 'string') {
    blacklistedTokens.add(token);

    // Clean up old tokens periodically (basic implementation)
    if (blacklistedTokens.size > 1000) {
      cleanupBlacklistedTokens();
    }
  }
}

/**
 * Check if password reset is rate limited for an email
 * @param email - Email address to check
 * @returns True if rate limited
 */
export function isPasswordResetRateLimited(email: string): boolean {
  if (!isValidEmail(email)) {
    return true; // Block invalid emails
  }

  const normalizedEmail = email.toLowerCase();
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;

  const attempt = resetAttempts.get(normalizedEmail);

  if (!attempt) {
    return false;
  }

  // Reset counter if last attempt was more than an hour ago
  if (attempt.lastAttempt < hourAgo) {
    resetAttempts.delete(normalizedEmail);
    return false;
  }

  return attempt.count >= TOKEN_CONFIG.MAX_ATTEMPTS_PER_HOUR;
}

/**
 * Record a password reset attempt
 * @param email - Email address for the attempt
 */
export function recordPasswordResetAttempt(email: string): void {
  if (!isValidEmail(email)) {
    return;
  }

  const normalizedEmail = email.toLowerCase();
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;

  const attempt = resetAttempts.get(normalizedEmail);

  if (!attempt || attempt.lastAttempt < hourAgo) {
    // First attempt or reset counter
    resetAttempts.set(normalizedEmail, { count: 1, lastAttempt: now });
  } else {
    // Increment counter
    resetAttempts.set(normalizedEmail, {
      count: attempt.count + 1,
      lastAttempt: now,
    });
  }

  // Cleanup old entries periodically
  if (resetAttempts.size > 1000) {
    cleanupResetAttempts();
  }
}

/**
 * Generate a secure random password for temporary use
 * @param length - Password length (minimum 12)
 * @returns Generated password
 */
export function generateSecureTemporaryPassword(length: number = 16): string {
  if (length < 12) {
    throw new Error('Password length must be at least 12 characters');
  }

  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + numbers + symbols;

  let password = '';

  // Ensure at least one character from each category
  password += getRandomChar(lowercase);
  password += getRandomChar(uppercase);
  password += getRandomChar(numbers);
  password += getRandomChar(symbols);

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += getRandomChar(allChars);
  }

  // Shuffle the password
  return shuffleString(password);
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Get random character from a string
 * @param chars - String to pick from
 * @returns Random character
 */
function getRandomChar(chars: string): string {
  const randomIndex = Math.floor(Math.random() * chars.length);
  return chars[randomIndex];
}

/**
 * Shuffle string characters randomly
 * @param str - String to shuffle
 * @returns Shuffled string
 */
function shuffleString(str: string): string {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

/**
 * Clean up old blacklisted tokens
 */
function cleanupBlacklistedTokens(): void {
  // Simple cleanup - remove half of the tokens
  // In production, implement proper TTL-based cleanup
  const tokens = Array.from(blacklistedTokens);
  const tokensToRemove = tokens.slice(0, Math.floor(tokens.length / 2));

  tokensToRemove.forEach((token) => blacklistedTokens.delete(token));
}

/**
 * Clean up old reset attempts
 */
function cleanupResetAttempts(): void {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;

  for (const [email, attempt] of resetAttempts.entries()) {
    if (attempt.lastAttempt < hourAgo) {
      resetAttempts.delete(email);
    }
  }
}

/**
 * Hash email for logging purposes (privacy-safe)
 * @param email - Email to hash
 * @returns Hashed email
 */
export function hashEmailForLogging(email: string): string {
  if (!email) return 'invalid-email';

  const hash = createHash('sha256').update(email.toLowerCase()).digest('hex');

  return hash.substring(0, 8); // Use first 8 characters for logging
}
