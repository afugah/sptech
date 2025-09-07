/**
 * Validation middleware for API routes
 * Provides reusable validation middleware for Next.js API routes
 */

import { type NextRequest, NextResponse } from 'next/server';
import { ZodError, type ZodType } from 'zod';

/**
 * Validation error response type
 */
interface ValidationErrorResponse {
  success: false;
  error: string;
  details: Array<{
    field: string;
    message: string;
  }>;
  timestamp: string;
}

/**
 * Generic validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: ValidationErrorResponse;
}

/**
 * Validate request body against a Zod schema
 * @param request - Next.js request object
 * @param schema - Zod schema for validation
 * @returns Validation result with parsed data or errors
 */
export async function validateRequestBody<T>(request: NextRequest, schema: ZodType<T>): Promise<ValidationResult<T>> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);

    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: formatZodError(error),
      };
    }

    return {
      success: false,
      error: {
        success: false,
        error: 'Invalid JSON in request body',
        details: [],
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Validate URL search parameters against a Zod schema
 * @param request - Next.js request object
 * @param schema - Zod schema for validation
 * @returns Validation result with parsed data or errors
 */
export function validateSearchParams<T>(request: NextRequest, schema: ZodType<T>): ValidationResult<T> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, unknown> = {};

    // Convert URLSearchParams to object
    for (const [key, value] of searchParams.entries()) {
      // Handle array parameters (e.g., ?colors=red&colors=blue)
      if (params[key]) {
        if (Array.isArray(params[key])) {
          params[key].push(value);
        } else {
          params[key] = [params[key], value];
        }
      } else {
        // Try to parse numbers and booleans
        if (value === 'true') {
          params[key] = true;
        } else if (value === 'false') {
          params[key] = false;
        } else if (!isNaN(Number(value)) && value !== '') {
          params[key] = Number(value);
        } else {
          params[key] = value;
        }
      }
    }

    const validatedData = schema.parse(params);

    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: formatZodError(error),
      };
    }

    return {
      success: false,
      error: {
        success: false,
        error: 'Invalid search parameters',
        details: [],
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Validate form data against a Zod schema
 * @param request - Next.js request object
 * @param schema - Zod schema for validation
 * @returns Validation result with parsed data or errors
 */
export async function validateFormData<T>(request: NextRequest, schema: ZodType<T>): Promise<ValidationResult<T>> {
  try {
    const formData = await request.formData();
    const data: Record<string, unknown> = {};

    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }

    const validatedData = schema.parse(data);

    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: formatZodError(error),
      };
    }

    return {
      success: false,
      error: {
        success: false,
        error: 'Invalid form data',
        details: [],
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Create a validation middleware function for API routes
 * @param schema - Zod schema for validation
 * @param source - Source of data to validate ('body', 'searchParams', 'formData')
 * @returns Middleware function
 */
export function createValidationMiddleware<T>(
  schema: ZodType<T>,
  source: 'body' | 'searchParams' | 'formData' = 'body',
) {
  return async (request: NextRequest): Promise<ValidationResult<T>> => {
    switch (source) {
      case 'body':
        return validateRequestBody(request, schema);
      case 'searchParams':
        return validateSearchParams(request, schema);
      case 'formData':
        return validateFormData(request, schema);
      default:
        throw new Error(`Invalid validation source: ${source}`);
    }
  };
}

/**
 * Helper function to create a validation error response
 * @param validationResult - Failed validation result
 * @returns NextResponse with validation errors
 */
export function createValidationErrorResponse(validationResult: ValidationResult<unknown>): NextResponse {
  if (validationResult.success || !validationResult.error) {
    throw new Error('Cannot create error response from successful validation');
  }

  return NextResponse.json(validationResult.error, { status: 400 });
}

/**
 * Format Zod validation errors into a consistent format
 * @param error - Zod validation error
 * @returns Formatted error response
 */
function formatZodError(error: ZodError): ValidationErrorResponse {
  const details = error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

  return {
    success: false,
    error: 'Validation failed',
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Higher-order function to wrap API route handlers with validation
 * @param schema - Zod schema for validation
 * @param handler - API route handler function
 * @param source - Source of data to validate
 * @returns Wrapped handler with validation
 */
export function withValidation<T>(
  schema: ZodType<T>,
  handler: (request: NextRequest, data: T) => Promise<NextResponse>,
  source: 'body' | 'searchParams' | 'formData' = 'body',
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const validation = await createValidationMiddleware(schema, source)(request);

    if (!validation.success) {
      return createValidationErrorResponse(validation);
    }

    return handler(request, validation.data!);
  };
}

/**
 * Sanitize string input to prevent injection attacks
 * @param input - String to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

/**
 * Validate and sanitize email addresses
 * @param email - Email to validate
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const sanitized = email.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized) || sanitized.length > 254) {
    return null;
  }

  return sanitized;
}

/**
 * Validate numeric input with bounds
 * @param value - Value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Validated number or null if invalid
 */
export function validateNumber(
  value: unknown,
  min: number = Number.MIN_SAFE_INTEGER,
  max: number = Number.MAX_SAFE_INTEGER,
): number | null {
  const num = Number(value);

  if (isNaN(num) || !isFinite(num) || num < min || num > max) {
    return null;
  }

  return num;
}
