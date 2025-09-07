/**
 * Static Generation Service for Phase 3: ISR Enhancement
 *
 * Handles intelligent static page generation for optimal
 * build-time performance and runtime efficiency.
 */

import { di } from '@/src/lib/di';
import { type IShoplabService } from '@/src/lib/framework/Shoplab/domain/IShoplabService';
import { ShoplabService } from '@/src/lib/framework/Shoplab/services/ShoplabService';
import { StoryblokService } from '@/src/lib/framework/Storyblok/services/StoryblokService';
import { BUILD_TIME_GENERATION, STATIC_GENERATION_LIMITS } from './isr-config';

interface StaticParam {
  locale: string;
  slug: string[];
}

interface PopularProduct {
  id: string;
  slug: string;
  popularity_score?: number;
  lastModified?: string;
}

interface TopCategory {
  id: string;
  slug: string;
  priority?: number;
  lastModified?: string;
}

export class StaticGenerationService {
  private readonly shoplabService: IShoplabService;
  private readonly storyblokService: StoryblokService;

  constructor() {
    this.shoplabService = di.resolve(ShoplabService);
    this.storyblokService = di.resolve(StoryblokService);
  }

  /**
   * Generate static parameters for enhanced ISR
   * This replaces the basic getAllPageSlugs with intelligent selection
   */
  async generateEnhancedStaticParams(): Promise<StaticParam[]> {
    // Skip in development unless explicitly enabled
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' && !BUILD_TIME_GENERATION.ENABLED_IN_DEVELOPMENT) {
      console.warn('⚡ ISR Enhancement: Skipping static generation in development');
      return [];
    }

    console.warn('🚀 ISR Enhancement: Starting intelligent static generation...');
    const startTime = Date.now();

    try {
      const params = await Promise.allSettled([
        this.generateTopProductParams(),
        this.generateCategoryParams(),
        this.generateKeyLandingParams(),
        this.generatePopularSearchParams(),
      ]);

      const results = params
        .filter((result): result is PromiseFulfilledResult<StaticParam[]> => result.status === 'fulfilled')
        .flatMap((result) => result.value);

      const buildTime = (Date.now() - startTime) / 1000;
      console.warn(`✅ ISR Enhancement: Generated ${results.length} static params in ${buildTime.toFixed(2)}s`);

      // Log generation summary
      this.logGenerationSummary(results);

      return results;
    } catch (error) {
      console.error('❌ ISR Enhancement: Error during static generation:', error);

      if (BUILD_TIME_GENERATION.CONTINUE_ON_ERROR) {
        console.warn('⚠️  ISR Enhancement: Continuing build with fallback generation...');
        return this.generateFallbackParams();
      }

      throw error;
    }
  }

  /**
   * Generate parameters for top products per locale
   */
  private async generateTopProductParams(): Promise<StaticParam[]> {
    console.warn('📦 Generating top product parameters...');

    try {
      // Get all locales from configuration
      const locales = this.getAvailableLocales();
      const params: StaticParam[] = [];

      for (const locale of locales) {
        try {
          const products = await this.getTopProductsForLocale(locale);
          const limitedProducts = products.slice(0, STATIC_GENERATION_LIMITS.TOP_PRODUCTS_PER_LOCALE);

          for (const product of limitedProducts) {
            params.push({
              locale,
              slug: this.parseProductSlug(product.slug),
            });
          }

          console.warn(`  ✓ ${locale}: ${limitedProducts.length} product params`);
        } catch (error) {
          console.warn(`  ⚠️  ${locale}: Failed to generate product params:`, error);
        }
      }

      return params;
    } catch (error) {
      console.error('❌ Error generating product parameters:', error);
      return [];
    }
  }

  /**
   * Generate parameters for all category pages
   */
  private async generateCategoryParams(): Promise<StaticParam[]> {
    if (!STATIC_GENERATION_LIMITS.ALL_CATEGORY_PAGES) {
      return [];
    }

    console.warn('📂 Generating category parameters...');

    try {
      const locales = this.getAvailableLocales();
      const params: StaticParam[] = [];

      for (const locale of locales) {
        try {
          const categories = await this.getCategoriesForLocale(locale);

          for (const category of categories) {
            params.push({
              locale,
              slug: this.parseCategorySlug(category.slug),
            });
          }

          console.warn(`  ✓ ${locale}: ${categories.length} category params`);
        } catch (error) {
          console.warn(`  ⚠️  ${locale}: Failed to generate category params:`, error);
        }
      }

      return params;
    } catch (error) {
      console.error('❌ Error generating category parameters:', error);
      return [];
    }
  }

  /**
   * Generate parameters for key landing pages
   */
  private async generateKeyLandingParams(): Promise<StaticParam[]> {
    console.warn('🏠 Generating key landing page parameters...');

    try {
      const locales = this.getAvailableLocales();
      const params: StaticParam[] = [];

      for (const locale of locales) {
        for (const landingPage of STATIC_GENERATION_LIMITS.KEY_LANDING_PAGES) {
          params.push({
            locale,
            slug: landingPage === '' ? [] : [landingPage],
          });
        }
      }

      console.warn(`  ✓ Generated ${params.length} landing page params`);
      return params;
    } catch (error) {
      console.error('❌ Error generating landing page parameters:', error);
      return [];
    }
  }

  /**
   * Generate parameters for popular search terms
   */
  private async generatePopularSearchParams(): Promise<StaticParam[]> {
    console.warn('🔍 Generating popular search parameters...');

    try {
      const locales = this.getAvailableLocales();
      const params: StaticParam[] = [];

      for (const locale of locales) {
        try {
          const searchTerms = await this.getPopularSearchTerms(locale);
          const limitedTerms = searchTerms.slice(0, STATIC_GENERATION_LIMITS.POPULAR_SEARCH_TERMS);

          for (const _term of limitedTerms) {
            params.push({
              locale,
              slug: ['search'],
            });
          }

          console.warn(`  ✓ ${locale}: ${limitedTerms.length} search params`);
        } catch (error) {
          console.warn(`  ⚠️  ${locale}: Failed to generate search params:`, error);
        }
      }

      return params;
    } catch (error) {
      console.error('❌ Error generating search parameters:', error);
      return [];
    }
  }

  /**
   * Fallback generation for when enhanced generation fails
   */
  private async generateFallbackParams(): Promise<StaticParam[]> {
    console.warn('🔄 Using fallback static generation...');

    try {
      // Use the original getAllPageSlugs as fallback
      const slugs = await this.shoplabService.getAllPageSlugs();

      return slugs
        .filter((item) => item.locale && item.slug)
        .map((item) => ({
          locale: item.locale!,
          slug: Array.isArray(item.slug) ? item.slug : [item.slug],
        }));
    } catch (error) {
      console.error('❌ Fallback generation also failed:', error);
      return [];
    }
  }

  /**
   * Get available locales from configuration
   */
  private getAvailableLocales(): string[] {
    // This should come from your app configuration
    // For now, using common SP Tech locales
    return ['se', 'no', 'fi', 'dk'];
  }

  /**
   * Get top products for a specific locale
   * This is a mock implementation - replace with actual data fetching
   */
  private async getTopProductsForLocale(locale: string): Promise<PopularProduct[]> {
    // Mock implementation - in reality, this would:
    // 1. Fetch from analytics data
    // 2. Query product popularity scores
    // 3. Consider sales data, views, etc.

    console.warn(`  📊 Fetching top products for ${locale}...`);

    // Return mock data for now
    return Array.from({ length: STATIC_GENERATION_LIMITS.TOP_PRODUCTS_PER_LOCALE }, (_, index) => ({
      id: `top-product-${locale}-${index + 1}`,
      slug: `jewelry/popular-item-${index + 1}`,
      popularity_score: 100 - index,
    }));
  }

  /**
   * Get categories for a specific locale
   */
  private async getCategoriesForLocale(locale: string): Promise<TopCategory[]> {
    console.warn(`  📁 Fetching categories for ${locale}...`);

    // Mock implementation - replace with actual category fetching
    const mockCategories = [
      'jewelry/rings',
      'jewelry/necklaces',
      'jewelry/earrings',
      'jewelry/bracelets',
      'accessories/watches',
      'accessories/bags',
    ];

    return mockCategories.map((slug, index) => ({
      id: `category-${locale}-${index + 1}`,
      slug,
      priority: index + 1,
    }));
  }

  /**
   * Get popular search terms for a locale
   */
  private async getPopularSearchTerms(locale: string): Promise<string[]> {
    console.warn(`  🔎 Fetching popular search terms for ${locale}...`);

    // Mock implementation - replace with actual search analytics
    return ['diamond ring', 'gold necklace', 'silver earrings', 'wedding rings', 'engagement ring'];
  }

  /**
   * Parse product slug into array format
   */
  private parseProductSlug(slug: string): string[] {
    return slug.split('/').filter(Boolean);
  }

  /**
   * Parse category slug into array format
   */
  private parseCategorySlug(slug: string): string[] {
    return slug.split('/').filter(Boolean);
  }

  /**
   * Log generation summary for debugging
   */
  private logGenerationSummary(params: StaticParam[]): void {
    const byLocale = params.reduce(
      (acc, param) => {
        acc[param.locale] = (acc[param.locale] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.warn('📊 ISR Enhancement Generation Summary:');
    Object.entries(byLocale).forEach(([locale, count]) => {
      console.warn(`  ${locale}: ${count} pages`);
    });
  }
}
