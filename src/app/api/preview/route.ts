/**
 * PayloadCMS Live Preview API Route
 *
 * Handles live preview data fetching for PayloadCMS integration.
 * Provides real-time content updates in preview mode.
 */

import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface PreviewRequestBody {
  collection: string;
  id: string;
  locale?: string;
}

/**
 * Handle GET requests for live preview data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    const id = searchParams.get('id');
    const locale = searchParams.get('locale') || 'en';
    const draft = searchParams.get('draft') === 'true';

    // Validate required parameters
    if (!collection || !id) {
      return NextResponse.json({ error: 'Missing required parameters: collection and id' }, { status: 400 });
    }

    // Open endpoint - no authentication required

    // Handle different collections
    let data;
    switch (collection) {
      case 'stores':
        data = await fetchStoreData(id, locale, draft);
        break;
      case 'pages':
        data = await fetchPageData(id, locale, draft);
        break;
      default:
        return NextResponse.json({ error: `Unsupported collection: ${collection}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data,
      collection,
      id,
      locale,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Live preview API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch preview data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * Handle POST requests for live preview data updates
 */
export async function POST(request: NextRequest) {
  try {
    const body: PreviewRequestBody = await request.json();
    const { collection, id, locale = 'en' } = body;

    // Validate required fields
    if (!collection || !id) {
      return NextResponse.json({ error: 'Missing required fields: collection and id' }, { status: 400 });
    }

    // Open endpoint - no authentication required

    // Handle real-time data fetching based on collection
    let data;
    switch (collection) {
      case 'stores':
        data = await fetchStoreData(id, locale, true);
        break;
      case 'pages':
        data = await fetchPageData(id, locale, true);
        break;
      default:
        return NextResponse.json({ error: `Unsupported collection: ${collection}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data,
      collection,
      id,
      locale,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Live preview POST API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process preview data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * Fetch store data for live preview
 */
async function fetchStoreData(id: string, _locale: string, _draft: boolean = false) {
  // This would integrate with your actual store data source
  // For now, returning a mock response that matches your store structure

  // If you're using PayloadCMS as your store data source (open endpoint):
  // const payloadResponse = await fetch(`${process.env.PAYLOAD_SERVER_URL}/api/stores/${id}`);
  // return payloadResponse.json();

  // Mock store data that would come from PayloadCMS
  return {
    id,
    name: `Store ${id}`,
    address: '123 Main Street',
    city: 'Stockholm',
    country: 'SE',
    coordinates: {
      lat: 59.3293,
      lng: 18.0686,
    },
    storeType: 'flagship',
    hours: {
      monday: '10:00-19:00',
      tuesday: '10:00-19:00',
      wednesday: '10:00-19:00',
      thursday: '10:00-19:00',
      friday: '10:00-19:00',
      saturday: '10:00-18:00',
      sunday: '12:00-17:00',
    },
    contact: {
      phone: '+46 8 123 456',
      email: 'store@sp.tech',
    },
    services: ['jewelry-repair', 'custom-engraving', 'consultation'],
    // Add any other store fields that your current system uses
  };
}

/**
 * Fetch page data for live preview
 */
async function fetchPageData(id: string, _locale: string, _draft: boolean = false) {
  // Mock page data that would come from PayloadCMS
  return {
    id,
    slug: 'store-locator',
    title: 'Find Our Stores',
    content: {
      hero: {
        title: 'Find SP Tech Stores',
        subtitle: 'Discover our locations across Sweden and beyond',
      },
      settings: {
        defaultZoom: 10,
        mapStyle: 'default',
        showAllStores: true,
      },
    },
    seo: {
      title: 'Store Locator - SP Tech',
      description: 'Find SP Tech jewelry stores near you.',
    },
  };
}
