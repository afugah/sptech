/**
 * Webhook Revalidation API Route
 *
 * Handles on-demand revalidation for ISR pages when content
 * is updated in Storyblok CMS or other external systems.
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { ISR_TAGS } from '@/src/lib/isr';
import { verifyWebhookSecret } from '@/src/lib/security/webhookAuth';
import { STORYBLOK_CACHE_TAGS } from '@/src/lib/storyblok/cachedStoryblokFetcher';

// Use Edge Runtime for faster webhook processing
export const runtime = 'edge';

interface StoryblokWebhook {
  text: string;
  action: 'published' | 'unpublished' | 'deleted';
  space_id: number;
  story_id: number;
  story?: {
    id: number;
    name: string;
    slug: string;
    full_slug: string;
    content_type: string;
    parent_id?: number;
    published_at: string;
    content?: {
      component: string;
      [key: string]: unknown;
    };
  };
}

interface BrinkWebhook {
  event: 'product.updated' | 'product.created' | 'product.deleted' | 'inventory.updated';
  data: {
    id: string;
    slug?: string;
    category?: string;
    inventory?: {
      available: boolean;
      quantity: number;
    };
  };
}

const WEBHOOK_SECRET = process.env.WEBHOOK_REVALIDATION_SECRET || 'dev-webhook-secret';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook authentication using timing-safe comparison
    if (!verifyWebhookSecret(request, WEBHOOK_SECRET)) {
      console.warn('⚠️  Webhook revalidation: Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const webhookSource = detectWebhookSource(request, body);

    console.warn(`🔄 Webhook revalidation triggered from ${webhookSource}`);

    let revalidationResults: RevalidationResult[] = [];

    switch (webhookSource) {
      case 'storyblok':
        revalidationResults = await handleStoryblokWebhook(body as StoryblokWebhook);
        break;
      case 'brink':
        revalidationResults = await handleBrinkWebhook(body as BrinkWebhook);
        break;
      case 'manual':
        revalidationResults = await handleManualRevalidation(body);
        break;
      default:
        console.warn('⚠️  Unknown webhook source, attempting manual handling...');
        revalidationResults = await handleManualRevalidation(body);
    }

    const successful = revalidationResults.filter((r) => r.success).length;
    const failed = revalidationResults.filter((r) => !r.success).length;

    console.warn(`✅ Webhook revalidation completed: ${successful} successful, ${failed} failed`);

    return NextResponse.json(
      {
        success: true,
        source: webhookSource,
        revalidated: successful,
        failed,
        results: revalidationResults,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    );
  } catch (error) {
    console.error('❌ Webhook revalidation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during revalidation',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

interface RevalidationResult {
  type: 'path' | 'tag';
  target: string;
  success: boolean;
  error?: string;
}

/**
 * Detect the source of the webhook based on headers and body structure
 */
function detectWebhookSource(request: NextRequest, body: Record<string, unknown>): string {
  const userAgent = request.headers.get('user-agent') || '';

  if (userAgent.includes('Storyblok') || body.story_id || body.space_id) {
    return 'storyblok';
  }

  if (
    body.event &&
    typeof body.event === 'string' &&
    body.event.includes('product.') &&
    body.data &&
    typeof body.data === 'object' &&
    body.data !== null &&
    'id' in body.data
  ) {
    return 'brink';
  }

  if (body.type && body.target) {
    return 'manual';
  }

  return 'unknown';
}

/**
 * Handle Storyblok CMS webhooks
 */
async function handleStoryblokWebhook(webhook: StoryblokWebhook): Promise<RevalidationResult[]> {
  const results: RevalidationResult[] = [];

  if (!webhook.story?.full_slug) {
    console.warn('⚠️  Storyblok webhook missing story slug');
    return results;
  }

  const { story, action: _action } = webhook;
  const fullSlug = story.full_slug;

  // Revalidate the specific page
  try {
    revalidatePath(`/${fullSlug}`);
    results.push({
      type: 'path',
      target: `/${fullSlug}`,
      success: true,
    });
    console.warn(`✓ Revalidated path: /${fullSlug}`);
  } catch (error) {
    results.push({
      type: 'path',
      target: `/${fullSlug}`,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Revalidate related content based on component type and slug pattern
  const relatedTags = new Set<string>();

  // Add tags based on component type
  if (story.content?.component) {
    const componentTags = getRelatedTagsForComponent(story.content.component);
    componentTags.forEach((tag) => relatedTags.add(tag));
  }

  // Add tags based on slug pattern
  const slugTags = getTagsForSlugPattern(fullSlug);
  slugTags.forEach((tag) => relatedTags.add(tag));

  // Revalidate all identified tags
  for (const tag of relatedTags) {
    try {
      revalidateTag(tag);
      results.push({
        type: 'tag',
        target: tag,
        success: true,
      });
      console.warn(`✓ Revalidated tag: ${tag}`);
    } catch (error) {
      results.push({
        type: 'tag',
        target: tag,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // If this is a navigation or global content change, revalidate homepage
  if (isGlobalContent(story.content?.component)) {
    try {
      revalidatePath('/');
      results.push({
        type: 'path',
        target: '/',
        success: true,
      });
      console.warn('✓ Revalidated homepage for global content change');
    } catch (error) {
      results.push({
        type: 'path',
        target: '/',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Handle Brink Commerce webhooks for product/inventory updates
 */
async function handleBrinkWebhook(webhook: BrinkWebhook): Promise<RevalidationResult[]> {
  const results: RevalidationResult[] = [];
  const { event, data } = webhook;

  // Revalidate product-related tags based on event type
  if (event.startsWith('product.')) {
    const tagsToRevalidate: string[] = [ISR_TAGS.PRODUCTS];

    if (event === 'product.updated' && data.category) {
      tagsToRevalidate.push(ISR_TAGS.CATEGORIES);
    }

    for (const tag of tagsToRevalidate) {
      try {
        revalidateTag(tag);
        results.push({
          type: 'tag',
          target: tag,
          success: true,
        });
        console.warn(`✓ Revalidated tag: ${tag} for ${event}`);
      } catch (error) {
        results.push({
          type: 'tag',
          target: tag,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  // Handle inventory updates
  if (event === 'inventory.updated') {
    try {
      revalidateTag(ISR_TAGS.INVENTORY);
      results.push({
        type: 'tag',
        target: ISR_TAGS.INVENTORY,
        success: true,
      });
      console.warn(`✓ Revalidated inventory tag for product ${data.id}`);
    } catch (error) {
      results.push({
        type: 'tag',
        target: ISR_TAGS.INVENTORY,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // If we have a specific product slug, revalidate that page
  if (data.slug) {
    try {
      revalidatePath(`/${data.slug}`);
      results.push({
        type: 'path',
        target: `/${data.slug}`,
        success: true,
      });
      console.warn(`✓ Revalidated product page: /${data.slug}`);
    } catch (error) {
      results.push({
        type: 'path',
        target: `/${data.slug}`,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Handle manual revalidation requests
 */
async function handleManualRevalidation(body: Record<string, unknown>): Promise<RevalidationResult[]> {
  const results: RevalidationResult[] = [];
  const { type, target, targets } = body;

  // Handle single target
  if (type && typeof type === 'string' && target && typeof target === 'string') {
    const result = await performRevalidation(type, target);
    results.push(result);
  }

  // Handle multiple targets
  if (Array.isArray(targets)) {
    for (const targetItem of targets) {
      if (targetItem.type && targetItem.target) {
        const result = await performRevalidation(targetItem.type, targetItem.target);
        results.push(result);
      }
    }
  }

  return results;
}

/**
 * Perform individual revalidation action
 */
async function performRevalidation(type: string, target: string): Promise<RevalidationResult> {
  try {
    if (type === 'path') {
      revalidatePath(target);
    } else if (type === 'tag') {
      revalidateTag(target);
    } else {
      throw new Error(`Invalid revalidation type: ${type}`);
    }

    console.warn(`✓ Manual revalidation: ${type} ${target}`);
    return { type: type as 'path' | 'tag', target, success: true };
  } catch (error) {
    return {
      type: type as 'path' | 'tag',
      target,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get related cache tags for Storyblok component types
 * Uses both ISR tags (legacy) and new granular Storyblok cache tags
 */
function getRelatedTagsForComponent(component: string): string[] {
  const tagMap: Record<string, string[]> = {
    // Navigation components
    navigation: [ISR_TAGS.NAVIGATION, STORYBLOK_CACHE_TAGS.CMS_NAVIGATION],
    menu: [ISR_TAGS.NAVIGATION, STORYBLOK_CACHE_TAGS.CMS_NAVIGATION],
    header: [ISR_TAGS.NAVIGATION, STORYBLOK_CACHE_TAGS.CMS_NAVIGATION],
    footer: [ISR_TAGS.NAVIGATION, STORYBLOK_CACHE_TAGS.CMS_NAVIGATION],

    // Product components
    product: [ISR_TAGS.PRODUCTS, STORYBLOK_CACHE_TAGS.CMS_PRODUCTS, STORYBLOK_CACHE_TAGS.CMS_CONTENT],
    categoryPage: [ISR_TAGS.CATEGORIES, ISR_TAGS.PRODUCTS, STORYBLOK_CACHE_TAGS.CMS_PRODUCTS],
    collectionPage: [ISR_TAGS.COLLECTIONS, ISR_TAGS.PRODUCTS, STORYBLOK_CACHE_TAGS.CMS_PRODUCTS],

    // Global settings
    globalSettings: [ISR_TAGS.CMS_CONTENT, STORYBLOK_CACHE_TAGS.CMS_GLOBAL],
    global: [ISR_TAGS.CMS_CONTENT, STORYBLOK_CACHE_TAGS.CMS_GLOBAL],
    settings: [ISR_TAGS.CMS_CONTENT, STORYBLOK_CACHE_TAGS.CMS_GLOBAL],

    // Reference content
    'size-guide': [ISR_TAGS.CMS_CONTENT, STORYBLOK_CACHE_TAGS.CMS_REFERENCE],
    'diamond-information': [ISR_TAGS.CMS_CONTENT, STORYBLOK_CACHE_TAGS.CMS_REFERENCE],
    reference: [ISR_TAGS.CMS_CONTENT, STORYBLOK_CACHE_TAGS.CMS_REFERENCE],

    // Default CMS content
    cmsPage: [ISR_TAGS.CMS_CONTENT, STORYBLOK_CACHE_TAGS.CMS_CONTENT],
    homepage: [
      ISR_TAGS.CMS_CONTENT,
      ISR_TAGS.NAVIGATION,
      STORYBLOK_CACHE_TAGS.CMS_CONTENT,
      STORYBLOK_CACHE_TAGS.CMS_NAVIGATION,
    ],
  };

  return tagMap[component] || [ISR_TAGS.CMS_CONTENT, STORYBLOK_CACHE_TAGS.CMS_CONTENT];
}

/**
 * Get cache tags based on Storyblok story slug pattern
 */
function getTagsForSlugPattern(slug: string): string[] {
  const tags: string[] = [];

  // Navigation and menu content
  if (slug.includes('navigation') || slug.includes('menu') || slug.includes('header') || slug.includes('footer')) {
    tags.push(ISR_TAGS.NAVIGATION, STORYBLOK_CACHE_TAGS.CMS_NAVIGATION);
  }

  // Product-related content
  if (slug.includes('product') || slug.includes('category')) {
    tags.push(ISR_TAGS.PRODUCTS, STORYBLOK_CACHE_TAGS.CMS_PRODUCTS);
  }

  // Reference content
  if (slug.includes('size-guide') || slug.includes('diamond-information')) {
    tags.push(ISR_TAGS.CMS_CONTENT, STORYBLOK_CACHE_TAGS.CMS_REFERENCE);
  }

  // Global settings
  if (slug.includes('global') || slug.includes('settings') || slug.includes('config')) {
    tags.push(ISR_TAGS.CMS_CONTENT, STORYBLOK_CACHE_TAGS.CMS_GLOBAL);
  }

  // Default to general content if no specific pattern matches
  if (tags.length === 0) {
    tags.push(ISR_TAGS.CMS_CONTENT, STORYBLOK_CACHE_TAGS.CMS_CONTENT);
  }

  return tags;
}

/**
 * Check if content type affects global elements
 */
function isGlobalContent(component: string | undefined): boolean {
  const globalComponents = ['navigation', 'footer', 'header', 'globalSettings', 'global', 'settings', 'menu'];
  return globalComponents.includes(component || '');
}
