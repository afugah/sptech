import { type NextRequest, NextResponse } from 'next/server';
import { di } from '@/src/lib/di';
import { type IShoplabService } from '@/src/lib/framework/Shoplab/domain/IShoplabService';
import { ShoplabService } from '@/src/lib/framework/Shoplab/services/ShoplabService';

export const dynamic = 'force-dynamic';

// Route handler for sitemap.xml
export async function GET(request: NextRequest, { params }: { params: Promise<{ market: string }> }) {
  const { market } = await params;

  try {
    const sitemapXml = await generateSitemapXml(market);
    return new NextResponse(sitemapXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error(`Error generating sitemap for market ${market}:`, error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

// Generate sitemap XML for a specific market
async function generateSitemapXml(market: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000';
  const shoplabService = di.resolve(ShoplabService) as IShoplabService;

  try {
    const collections = await shoplabService.getSitemapCollections(market);

    // Start XML generation
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Check if collections is an array and has items
    if (Array.isArray(collections) && collections.length > 0) {
      // Add entries for each collection
      for (const collection of collections) {
        if (collection && collection.slug) {
          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/${market}${collection.slug}</loc>\n`;
          xml += `    <lastmod>${new Date(collection.lastModified || Date.now()).toISOString()}</lastmod>\n`;
          xml += '    <changefreq>weekly</changefreq>\n';
          xml += '    <priority>0.9</priority>\n';
          xml += '  </url>\n';
        }
      }
    } else {
      console.warn(`No collections found for market ${market} or collections is not an array`);
    }

    xml += '</urlset>';
    return xml;
  } catch (error) {
    console.error(`Error generating category sitemap for market ${market}:`, error);
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
  }
}
