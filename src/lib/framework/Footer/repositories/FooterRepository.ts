import { type IFooter } from '../domain/entities/IFooter';
import { type IFooterRepository } from '../domain/IFooterRepository';
import { type ICMSFooterResponse, type IPayloadResponse } from '../types/ICMS';

interface CacheEntry {
  data: IFooter;
  timestamp: number;
  ttl: number;
}

export class FooterRepository implements IFooterRepository {
  private readonly baseUrl: string;
  private readonly cache: Map<string, CacheEntry> = new Map();
  private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL || 'http://localhost:3500';
  }

  private getCacheKey(locale: string): string {
    return `footer-data-${locale}`;
  }

  private isValidCacheEntry(entry: CacheEntry): boolean {
    const now = Date.now();
    return now - entry.timestamp < entry.ttl;
  }

  private getCachedData(locale: string): IFooter | null {
    const cacheKey = this.getCacheKey(locale);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    if (!this.isValidCacheEntry(entry)) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.data;
  }

  private setCachedData(locale: string, data: IFooter, ttl: number = this.defaultTTL): void {
    const cacheKey = this.getCacheKey(locale);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    this.cache.set(cacheKey, entry);
  }

  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  public clearCache(locale?: string): void {
    if (locale) {
      const cacheKey = this.getCacheKey(locale);
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  public getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  async getFooterData(_marketCode: string = 'en'): Promise<IFooter> {
    // Always use 'en' for caching since we only have English content
    const cacheKey = 'en';
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    this.clearExpiredCache();

    const url = new URL(`${this.baseUrl}/api/footer-navigation`);
    url.searchParams.set('limit', '10');
    url.searchParams.set('depth', '2');
    // Always use 'en' locale since we only have English content
    url.searchParams.set('locale', 'en');

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Footer API returned ${response.status}, using empty footer`);
      // Return empty footer structure instead of throwing
      return {
        id: 'empty',
        title: 'Footer',
        columns: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const data: IPayloadResponse = await response.json();

    // Always fetch the English footer menu since we only have English content
    const footerMenu = this.findEnglishFooter(data.docs);

    if (!footerMenu) {
      console.warn('No footer menu found in CMS, using empty footer');
      // Return empty footer structure instead of throwing
      return {
        id: 'empty',
        title: 'Footer',
        columns: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const transformedData = this.transformFooterData(footerMenu);

    this.setCachedData(cacheKey, transformedData);

    return transformedData;
  }

  private findEnglishFooter(docs: ICMSFooterResponse[]): ICMSFooterResponse | undefined {
    // Look for the English footer menu
    const enMatch = docs.find((doc) => doc.title && doc.title.toUpperCase().includes('FOOTER MENU EN'));

    if (enMatch) {
      return enMatch;
    }

    // Fallback: return first document with content
    return docs.find((doc) => doc.columns && doc.columns.length > 0);
  }

  private transformFooterData(cmsData: ICMSFooterResponse): IFooter {
    return {
      id: cmsData.id,
      title: cmsData.title,
      columns: cmsData.columns.map((column) => ({
        id: column.id,
        columnTitle: column.columnTitle,
        links: column.links.map((link) => ({
          id: link.id,
          label: link.label,
          url: link.url,
          newTab: link.newTab,
        })),
      })),
      createdAt: cmsData.createdAt,
      updatedAt: cmsData.updatedAt,
    };
  }
}
