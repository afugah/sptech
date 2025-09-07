import { type MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const markets = (process.env.NEXT_PUBLIC_MARKETS || '').split(',').map((m) => m.toLowerCase());
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  return {
    rules: [
      ...markets.map((market) => ({
        userAgent: '*',
        allow: `/${market}/`,
      })),
      // Static disallow rules
      { userAgent: '*', disallow: '/*/checkout' },
      { userAgent: '*', disallow: '/*/cart' },
      { userAgent: '*', disallow: '/*/account' },
      { userAgent: '*', disallow: '/*/wishlist' },
      { userAgent: '*', disallow: '/*/search' },
      { userAgent: '*', disallow: '/*/success' },
    ],
    sitemap: [
      // Main sitemap that references all other sitemaps
      `${baseUrl}/sitemap.xml`,
      // Individual market sitemaps for products and categories
      ...markets.flatMap((market) => [
        `${baseUrl}/sitemaps/${market}/product/sitemap.xml`,
        `${baseUrl}/sitemaps/${market}/category/sitemap.xml`,
      ]),
    ],
  };
}
