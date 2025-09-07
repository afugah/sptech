import { type NextRequest, NextResponse } from 'next/server';
import { getStoryblokProductData } from '@/src/components/product/services/StoryblokProductDataResolver';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const locale = request.nextUrl.searchParams.get('locale') || 'se-sv';

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Resolve missing product data for Storyblok components
    const productData = await getStoryblokProductData(locale, id);

    return NextResponse.json({
      id,
      slug: productData.slug,
      sku: productData.sku,
    });
  } catch (error) {
    console.error('Error fetching Storyblok product data:', error);
    return NextResponse.json({ error: 'Failed to fetch product data' }, { status: 500 });
  }
}
