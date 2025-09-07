import crypto from 'crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { supportedMarkets } from '@/src/lib/constants/markets';

// Configuration interface for multi-language support
interface WebhookConfig {
  locales: string[];
  marketLanguageMap: Record<string, string>;
}

// Webhook payload interface
interface WebhookPayload {
  action?: string;
  story_id?: number;
  full_slug?: string;
  slug?: string;
  space_id?: number;
  text?: string;
  [key: string]: string | number | undefined; // Allow for i18n slug properties
}

// Logger interface (using console for now, can be replaced with proper logger)
interface Logger {
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, error?: unknown): void;
}

// Console logger implementation
const logger: Logger = {
  info: (message: string, data?: unknown) => {
    // Using console.warn for info logs to comply with lint rules

    console.warn(`[Storyblok Webhook INFO] ${message}`, data || '');
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[Storyblok Webhook WARN] ${message}`, data || '');
  },
  error: (message: string, error?: unknown) => {
    console.error(`[Storyblok Webhook ERROR] ${message}`, error || '');
  },
};

// Get configuration matching the app's locale structure
function getWebhookConfig(): WebhookConfig {
  // Build all possible locale combinations from markets
  const locales: string[] = [];
  const marketLanguageMap: Record<string, string> = {};

  // Main market locales
  supportedMarkets.forEach((market) => {
    locales.push(market);

    // Map market to its default language
    switch (market) {
      case 'sv':
        marketLanguageMap[market] = 'sv'; // Swedish market uses Swedish language
        break;
      case 'fi':
        marketLanguageMap[market] = 'fi'; // Finnish market uses Finnish language
        break;
      case 'en':
        marketLanguageMap[market] = 'en'; // English market uses English language
        break;
    }
  });

  // Combined market-language locales (from routing.ts)
  const combinedLocales = [
    'sv-en',
    'sv-fi',
    'sv-no',
    'fi-en',
    'fi-no',
    'fi-sv',
    'no-en',
    'no-fi',
    'no-sv',
    'en-fi',
    'en-no',
    'en-sv',
  ];

  combinedLocales.forEach((locale) => {
    locales.push(locale);
    const [_market, lang] = locale.split('-');
    // Map combined locales to their language
    marketLanguageMap[locale] = lang;
  });

  // Add Norwegian market mapping (special case)
  locales.push('no');
  marketLanguageMap['no'] = 'nb'; // Norwegian market uses Norwegian Bokmål

  return {
    locales,
    marketLanguageMap,
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  // Read the raw body for signature verification
  const rawBody = await req.text();
  let body: WebhookPayload;

  try {
    body = JSON.parse(rawBody);
  } catch (error) {
    logger.error('Failed to parse webhook body', error);
    return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  // Verify the webhook secret if configured
  const webhookSecret = process.env.STORYBLOK_WEBHOOK_SECRET;
  const skipSignatureVerification = process.env.STORYBLOK_SKIP_SIGNATURE_VERIFICATION === 'true';

  if (webhookSecret && !skipSignatureVerification) {
    // Storyblok sends the signature in the 'webhook-signature' header
    const headersList = await headers();
    const receivedSignature = headersList.get('webhook-signature');

    // Generate HMAC signature using SHA1 (Storyblok uses SHA1 for webhook signatures)
    const expectedSignature = crypto.createHmac('sha1', webhookSecret).update(rawBody).digest('hex');

    // Log the signature comparison for debugging
    logger.info('Webhook signature verification', {
      hasSignature: !!receivedSignature,
      receivedSignature: receivedSignature ? receivedSignature.substring(0, 10) + '...' : null,
      expectedSignature: expectedSignature.substring(0, 10) + '...',
      secretConfigured: !!webhookSecret,
    });

    if (!receivedSignature || receivedSignature !== expectedSignature) {
      logger.warn('Unauthorized Storyblok webhook request - signature mismatch');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Webhook signature verified successfully');
  } else if (skipSignatureVerification) {
    logger.warn('Webhook signature verification skipped - THIS SHOULD ONLY BE USED FOR TESTING');
  }

  try {
    logger.info('Storyblok webhook received', {
      action: body.action,
      story_id: body.story_id,
      full_slug: body.full_slug,
      space_id: body.space_id,
    });

    // Handle different webhook actions
    if (body.action === 'published' || body.action === 'unpublished') {
      const revalidatedPaths: string[] = [];
      const config = getWebhookConfig();

      // Check if this is the new format with internationalized slugs
      const hasI18nSlugs = Object.keys(body).some((key) => key.startsWith('full_slug__i18n__'));

      if (hasI18nSlugs) {
        // NEW FORMAT: Handle internationalized slugs
        const mainSlug = body.full_slug || body.slug;
        const i18nSlugs: Record<string, string> = {};

        // Extract all i18n slugs from the payload
        Object.keys(body).forEach((key) => {
          const match = key.match(/^full_slug__i18n__(.+)$/);
          if (match) {
            const lang = match[1];
            const value = body[key];
            if (typeof value === 'string') {
              i18nSlugs[lang] = value;
            }
          }
        });

        if (mainSlug === 'home') {
          // For home page, revalidate all locale roots
          for (const locale of config.locales) {
            const path = `/${locale}`;
            revalidatePath(path, 'page');
            revalidatedPaths.push(path);
            logger.info(`Revalidated home page path: ${path}`);
          }
          revalidatePath('/', 'page');
          revalidatedPaths.push('/');
        } else if (mainSlug === 'config' || mainSlug === 'global-config') {
          // Config changes affect the entire site - invalidate all cache
          logger.info('Config story updated - invalidating ALL cache');

          // Revalidate the entire layout (affects all pages)
          revalidatePath('/', 'layout');
          revalidatedPaths.push('/ (layout - all pages)');

          // Also revalidate all page types explicitly
          for (const locale of config.locales) {
            // Revalidate all pages under each locale
            revalidatePath(`/${locale}`, 'layout');
            revalidatedPaths.push(`/${locale} (layout)`);
          }

          logger.info('Full site cache invalidation triggered due to config change');
        } else {
          // Use the provided i18n slugs
          for (const [lang, slug] of Object.entries(i18nSlugs)) {
            // Find the appropriate market for this language
            const matchingLocales = Object.entries(config.marketLanguageMap)
              .filter(([_, langCode]) => langCode === lang)
              .map(([locale]) => locale);

            matchingLocales.forEach((locale) => {
              let path: string;

              // Handle content paths (e.g., content/size-guide/category)
              if (slug.startsWith('content/')) {
                // Remove 'content/' prefix and create proper path
                const contentPath = slug.replace('content/', '');
                path = `/${locale}/${contentPath}`;
              } else if (slug.startsWith(`${lang}/`)) {
                // Remove language prefix if present
                path = `/${locale}/${slug.substring(lang.length + 1)}`;
              } else {
                path = `/${locale}/${slug}`;
              }

              revalidatePath(path, 'page');
              revalidatedPaths.push(path);
              logger.info(`Revalidated path: ${path}`);
            });
          }
        }

        logger.info('Cache invalidation completed (new format)', {
          action: body.action,
          slug: mainSlug,
          revalidatedPaths,
          i18nSlugs,
          processing_time_ms: Date.now() - startTime,
        });
      } else {
        // OLD FORMAT: Original implementation for backward compatibility
        const slug = body.slug;

        if (slug === 'home') {
          // Revalidate all home page paths for all locales
          for (const locale of config.locales) {
            const path = `/${locale}`;
            revalidatePath(path, 'page');
            revalidatedPaths.push(path);
            logger.info(`Revalidated home page path: ${path}`);
          }

          // Also revalidate the root path
          revalidatePath('/', 'page');
          revalidatedPaths.push('/');

          logger.info('Home page cache invalidated for all locales - ISR cache will be refreshed');
        } else if (slug === 'config' || slug === 'global-config') {
          // Config changes affect the entire site - invalidate all cache
          logger.info('Config story updated - invalidating ALL cache');

          // Revalidate the entire layout (affects all pages)
          revalidatePath('/', 'layout');
          revalidatedPaths.push('/ (layout - all pages)');

          // Also revalidate all page types explicitly
          for (const locale of config.locales) {
            // Revalidate all pages under each locale
            revalidatePath(`/${locale}`, 'layout');
            revalidatedPaths.push(`/${locale} (layout)`);
          }

          logger.info('Full site cache invalidation triggered due to config change');
        } else if (slug) {
          // For other pages, revalidate specific paths
          for (const locale of config.locales) {
            const path = `/${locale}/${slug}`;
            revalidatePath(path);
            revalidatedPaths.push(path);
            logger.info(`Revalidated path: ${path}`);
          }
        }

        logger.info('Cache invalidation completed (old format)', {
          action: body.action,
          slug,
          revalidatedPaths,
          processing_time_ms: Date.now() - startTime,
        });
      }

      // Revalidate by tags for more thorough cache clearing
      revalidateTag('storyblok');
      const slugToTag = body.full_slug || body.slug;
      if (slugToTag) {
        revalidateTag(slugToTag);

        // If config was updated, also revalidate all config-related tags
        if (slugToTag === 'config' || slugToTag === 'global-config') {
          revalidateTag('config');
          revalidateTag('navigation');
          revalidateTag('footer');
          revalidateTag('header');
          logger.info('Config-related tags invalidated: config, navigation, footer, header');
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Cache invalidated successfully',
        action: body.action,
        slug: body.full_slug || body.slug,
        revalidatedPaths,
        timestamp: new Date().toISOString(),
        processing_time_ms: Date.now() - startTime,
      });
    }

    // For other actions, just log and return success
    return NextResponse.json({
      success: true,
      message: 'Webhook received',
      action: body.action,
      processing_time_ms: Date.now() - startTime,
    });
  } catch (error) {
    logger.error('Failed to process Storyblok webhook', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process webhook',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
