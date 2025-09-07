import { NextResponse } from 'next/server';
import { fetchDiamondInformationStory } from '@/src/lib/storyblok/fetchers';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const locale = url.searchParams.get('locale') || 'en';

    const { story } = await fetchDiamondInformationStory(locale);

    return NextResponse.json({ story });
  } catch (error) {
    console.error('[API] Error fetching diamond information:', error);
    return NextResponse.json({ story: undefined });
  }
}
