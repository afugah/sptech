import { type MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3100';
  const markets = (process.env.NEXT_PUBLIC_MARKETS || '').split(',').map((m) => m.toLowerCase());

  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const market of markets) {
    sitemapEntries.push({
      url: `${baseUrl}/sitemaps/${market}/product/sitemap.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });

    sitemapEntries.push({
      url: `${baseUrl}/sitemaps/${market}/category/sitemap.xml`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  }

  return sitemapEntries;
}
