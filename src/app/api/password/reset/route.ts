import { sendPasswordResetEmail } from 'firebase/auth';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/lib/configuration/auth';
import { di } from '@/src/lib/di';
import { LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { VoyadoService } from '@/src/lib/framework/Voyado/services/VoyadoService';
import {
  generatePasswordResetToken,
  hashEmailForLogging,
  isPasswordResetRateLimited,
  recordPasswordResetAttempt,
} from '@/src/lib/security/passwordReset';

export async function GET(req: NextRequest) {
  const _logger = di.resolve(LoggerService);
  _logger.setServiceName('API.password/reset');

  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get('email');

  let message = '';

  try {
    if (!email) {
      _logger.warn('Password reset attempted without email');
      return NextResponse.json(
        {
          message: 'Email address is required',
          success: false,
        },
        { status: 400 },
      );
    }

    const emailHash = hashEmailForLogging(email);
    _logger.debug('Request to reset password', { emailHash });

    // Check rate limiting
    if (isPasswordResetRateLimited(email)) {
      _logger.warn('Password reset rate limited', { emailHash });
      recordPasswordResetAttempt(email);

      return NextResponse.json(
        {
          message: 'Too many reset attempts. Please try again later.',
          success: false,
        },
        { status: 429 },
      );
    }

    // Record attempt for rate limiting
    recordPasswordResetAttempt(email);

    let user;
    try {
      user = await di.resolve(VoyadoService).getContactByEmail(email);
    } catch (err) {
      _logger.warn('Failed to get user by email', { emailHash }, err);
      // Don't reveal whether user exists - return success message anyway
      return NextResponse.json({
        message: 'If an account with that email exists, a reset link has been sent.',
        success: true,
      });
    }

    // Generate secure token
    const token = generatePasswordResetToken(user.id, email);

    try {
      await sendPasswordResetEmail(auth, email);
      message = 'If an account with that email exists, a reset link has been sent.';
    } catch (err) {
      _logger.error('Failed to send password reset email', { emailHash }, err);

      // Don't expose internal errors - return generic message
      return NextResponse.json({
        message: 'If an account with that email exists, a reset link has been sent.',
        success: true,
      });
    }

    _logger.debug('Password reset email sent', { emailHash, tokenGenerated: !!token });
    return NextResponse.json({
      message,
      success: true,
    });
  } catch (err) {
    const emailHash = email ? hashEmailForLogging(email) : 'unknown';
    _logger.error('Failed to process password reset request', { emailHash }, err);

    // Don't expose internal errors
    return NextResponse.json(
      {
        message: 'An error occurred processing your request. Please try again later.',
        success: false,
      },
      { status: 500 },
    );
  }
}
