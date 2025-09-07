import { NextResponse } from 'next/server';
import { fetchSizeGuideStoryByCategory } from '@/src/lib/storyblok/fetchers';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const locale = url.searchParams.get('locale') || 'en';
    const category = url.searchParams.get('category');

    if (!category) {
      return NextResponse.json({ story: undefined });
    }

    const { story } = await fetchSizeGuideStoryByCategory(locale, category);

    return NextResponse.json({ story });
  } catch (error) {
    console.error('[API] Error fetching size guide:', error);
    return NextResponse.json({ story: undefined });
  }
}
