import { NextResponse } from 'next/server';
import { di } from '@/src/lib/di';
import { ProductService } from '@/src/lib/framework/Product/services/ProductService';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  try {
    // Await params first to ensure it's resolved
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const url = new URL(request.url);
    const locale = url.searchParams.get('locale') || 'en';
    const joinedSlug = slug.join('/');

    const productService = di.resolve(ProductService);

    try {
      const product = await productService.getItemBySlug(locale, joinedSlug);
      return NextResponse.json({ product });
    } catch (error) {
      // Try to get by ID if slug fails
      const idMatch = joinedSlug.match(/-(\d+)$/);
      if (idMatch) {
        const id = idMatch[1];
        const product = await productService.getItemByID(locale, id);
        return NextResponse.json({
          product,
          redirectUrl: product?.slug,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('[API] Error fetching product:', error);
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
}
