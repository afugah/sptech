/**
 * Validation schemas using Zod
 * Provides comprehensive input validation for API endpoints and forms
 */

import { z } from 'zod';

/**
 * Common validation patterns
 */
const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(254, 'Email must be less than 254 characters')
  .toLowerCase()
  .transform((email) => email.trim());

const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const uuidSchema = z.string().uuid('Invalid UUID format');

const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
  .min(1)
  .max(200);

/**
 * User registration and authentication schemas
 */
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: phoneSchema,
  acceptTerms: z.boolean().refine((val) => val === true, 'Terms must be accepted'),
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * E-commerce related schemas
 */
export const addToCartSchema = z.object({
  productId: uuidSchema,
  variantId: uuidSchema.optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity cannot exceed 99'),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const updateCartItemSchema = z.object({
  itemId: uuidSchema,
  quantity: z.number().int().min(0, 'Quantity cannot be negative').max(99, 'Quantity cannot exceed 99'),
});

export const applyDiscountSchema = z.object({
  code: z.string().min(1, 'Discount code is required').max(50).trim().toUpperCase(),
  sessionId: uuidSchema.optional(),
});

export const checkoutSchema = z.object({
  email: emailSchema,
  billingAddress: z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    address1: z.string().min(1, 'Address is required').max(100),
    address2: z.string().max(100).optional(),
    city: z.string().min(1, 'City is required').max(50),
    postalCode: z.string().min(1, 'Postal code is required').max(20),
    country: z.string().length(2, 'Country must be 2-letter code'),
    phone: phoneSchema,
  }),
  shippingAddress: z
    .object({
      firstName: z.string().min(1, 'First name is required').max(50),
      lastName: z.string().min(1, 'Last name is required').max(50),
      address1: z.string().min(1, 'Address is required').max(100),
      address2: z.string().max(100).optional(),
      city: z.string().min(1, 'City is required').max(50),
      postalCode: z.string().min(1, 'Postal code is required').max(20),
      country: z.string().length(2, 'Country must be 2-letter code'),
      phone: phoneSchema,
    })
    .optional(),
  paymentMethod: z.enum(['credit_card', 'klarna', 'paypal', 'apple_pay', 'google_pay']),
  newsletter: z.boolean().optional(),
});

/**
 * Search and filtering schemas
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200).trim(),
  category: slugSchema.optional(),
  sort: z.enum(['relevance', 'price_asc', 'price_desc', 'newest', 'popularity']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  size: z.array(z.string()).optional(),
  color: z.array(z.string()).optional(),
  brand: z.array(z.string()).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const productFilterSchema = z.object({
  categoryCode: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  priceRange: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
    })
    .optional(),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'newest', 'popularity']).optional(),
});

/**
 * API request schemas
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).optional(),
});

export const webhookRevalidationSchema = z.object({
  type: z.enum(['path', 'tag']),
  target: z.string().min(1, 'Target is required'),
  targets: z
    .array(
      z.object({
        type: z.enum(['path', 'tag']),
        target: z.string().min(1),
      }),
    )
    .optional(),
});

/**
 * Content management schemas
 */
export const storyblokWebhookSchema = z.object({
  text: z.string(),
  action: z.enum(['published', 'unpublished', 'deleted']),
  space_id: z.number(),
  story_id: z.number(),
  story: z
    .object({
      id: z.number(),
      name: z.string(),
      slug: z.string(),
      full_slug: z.string(),
      content_type: z.string(),
      parent_id: z.number().optional(),
      published_at: z.string(),
      content: z
        .object({
          component: z.string(),
        })
        .passthrough()
        .optional(),
    })
    .optional(),
});

/**
 * Newsletter and contact schemas
 */
export const newsletterSubscriptionSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required').max(50).optional(),
  lastName: z.string().min(1, 'Last name is required').max(50).optional(),
  preferences: z
    .object({
      marketing: z.boolean().default(true),
      productUpdates: z.boolean().default(false),
      salesAlerts: z.boolean().default(false),
    })
    .optional(),
  source: z.string().max(50).optional(),
});

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  category: z.enum(['general', 'support', 'sales', 'returns', 'technical']).optional(),
});

/**
 * Review and rating schemas
 */
export const productReviewSchema = z.object({
  productId: uuidSchema,
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().min(1, 'Review title is required').max(100),
  content: z.string().min(10, 'Review must be at least 10 characters').max(1000),
  recommend: z.boolean(),
  verified: z.boolean().default(false),
  customerName: z.string().max(50).optional(),
  customerEmail: emailSchema.optional(),
});

/**
 * Type exports for TypeScript
 */
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type AddToCart = z.infer<typeof addToCartSchema>;
export type UpdateCartItem = z.infer<typeof updateCartItemSchema>;
export type ApplyDiscount = z.infer<typeof applyDiscountSchema>;
export type Checkout = z.infer<typeof checkoutSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type ProductFilter = z.infer<typeof productFilterSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type WebhookRevalidation = z.infer<typeof webhookRevalidationSchema>;
export type StoryblokWebhook = z.infer<typeof storyblokWebhookSchema>;
export type NewsletterSubscription = z.infer<typeof newsletterSubscriptionSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;
export type ProductReview = z.infer<typeof productReviewSchema>;
