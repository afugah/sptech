import { type NextRequest, NextResponse } from 'next/server';

// Use Edge Runtime for fast geolocation detection
export const runtime = 'edge';

/**
 * Enhanced geolocation service using Edge Runtime
 * Provides fast geographic information and market routing for personalization
 */
export function GET(request: NextRequest) {
  // Extract geographic information from Vercel's edge headers
  const country = request.headers.get('x-vercel-ip-country') || 'unknown';
  const region = request.headers.get('x-vercel-ip-country-region') || 'unknown';
  const city = request.headers.get('x-vercel-ip-city') || 'unknown';
  const latitude = request.headers.get('x-vercel-ip-latitude') || null;
  const longitude = request.headers.get('x-vercel-ip-longitude') || null;
  const timezone = request.headers.get('x-vercel-ip-timezone') || 'UTC';

  // Determine region for API routing and market information
  const apiRegion = getApiRegion(country);
  const currency = getCurrencyFromCountry(country);
  const language = getLanguageFromCountry(country);
  const marketInfo = getMarketInfo(country);

  const geoData = {
    location: {
      country,
      region,
      city,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      timezone,
    },
    market: {
      code: marketInfo.market,
      language,
      currency,
      isSupported: marketInfo.isSupported,
      apiRegion,
    },
    routing: {
      suggestedLocale: marketInfo.market, // Just use market code, no language suffix
      shouldRedirect: marketInfo.shouldRedirect,
      targetUrl: marketInfo.targetUrl,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '2.0.0',
    },
  };

  return NextResponse.json(geoData, {
    headers: {
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes (more dynamic)
      Vary: 'x-vercel-ip-country',
    },
  });
}

/**
 * Determine the optimal API region based on country
 */
function getApiRegion(country: string): string {
  const nordics = ['SE', 'NO', 'FI', 'DK'];
  const europe = ['DE', 'FR', 'GB', 'NL', 'ES', 'IT', 'AT', 'CH', 'BE'];

  if (nordics.includes(country)) {
    return 'nordic';
  } else if (europe.includes(country)) {
    return 'eu';
  } else {
    return 'global';
  }
}

/**
 * Get default currency based on country
 * Matches the currency mapping in src/lib/constants/markets.ts
 */
function getCurrencyFromCountry(country: string): string {
  const currencyMap: Record<string, string> = {
    SE: 'SEK', // Sweden
    NO: 'NOK', // Norway

    // EUR countries
    DK: 'EUR', // Denmark
    FI: 'EUR', // Finland
    EE: 'EUR', // Estonia
    LV: 'EUR', // Latvia
    LT: 'EUR', // Lithuania
    AT: 'EUR', // Austria
    BE: 'EUR', // Belgium
    HR: 'EUR', // Croatia
    CY: 'EUR', // Cyprus
    CZ: 'EUR', // Czech Republic
    FR: 'EUR', // France
    DE: 'EUR', // Germany
    GR: 'EUR', // Greece
    IE: 'EUR', // Ireland
    IT: 'EUR', // Italy
    LU: 'EUR', // Luxembourg
    MT: 'EUR', // Malta
    MC: 'EUR', // Monaco
    NL: 'EUR', // Netherlands
    PL: 'EUR', // Poland
    PT: 'EUR', // Portugal
    SM: 'EUR', // San Marino
    ES: 'EUR', // Spain

    // USD for all other countries
    GB: 'USD', // UK now uses USD
    US: 'USD',
  };

  return currencyMap[country] || 'USD';
}

/**
 * Get default language based on country
 * Only SV, FI, and EN are supported
 */
function getLanguageFromCountry(country: string): string {
  const languageMap: Record<string, string> = {
    SE: 'sv', // Sweden uses Swedish
    FI: 'fi', // Finland uses Finnish
    // All other countries use English
  };

  return languageMap[country] || 'en';
}

/**
 * Get market information and routing logic based on country
 * Only 'sv', 'fi', and 'en' markets are supported
 * 'en' is the default and uses root path (no URL prefix)
 */
function getMarketInfo(country: string) {
  const marketMap: Record<
    string,
    {
      market: string;
      isSupported: boolean;
      shouldRedirect: boolean;
      targetUrl?: string;
    }
  > = {
    // Swedish market (gets /sv/ URL prefix)
    SE: { market: 'sv', isSupported: true, shouldRedirect: false },

    // Finnish market (gets /fi/ URL prefix)
    FI: { market: 'fi', isSupported: true, shouldRedirect: false },

    // All other countries use English market (root URL, no prefix)
    DK: { market: 'en', isSupported: true, shouldRedirect: false },
    NO: { market: 'en', isSupported: true, shouldRedirect: false },
    EE: { market: 'en', isSupported: true, shouldRedirect: false },
    LV: { market: 'en', isSupported: true, shouldRedirect: false },
    LT: { market: 'en', isSupported: true, shouldRedirect: false },
    DE: { market: 'en', isSupported: true, shouldRedirect: false },
    AT: { market: 'en', isSupported: true, shouldRedirect: false },
    CH: { market: 'en', isSupported: true, shouldRedirect: false },
    NL: { market: 'en', isSupported: true, shouldRedirect: false },
    BE: { market: 'en', isSupported: true, shouldRedirect: false },
    FR: { market: 'en', isSupported: true, shouldRedirect: false },
    IT: { market: 'en', isSupported: true, shouldRedirect: false },
    ES: { market: 'en', isSupported: true, shouldRedirect: false },
    PT: { market: 'en', isSupported: true, shouldRedirect: false },
    GB: { market: 'en', isSupported: true, shouldRedirect: false },
    IE: { market: 'en', isSupported: true, shouldRedirect: false },

    // Non-European markets
    US: { market: 'en', isSupported: true, shouldRedirect: false },
    CA: { market: 'en', isSupported: true, shouldRedirect: false },
    AU: { market: 'en', isSupported: true, shouldRedirect: false },
  };

  return (
    marketMap[country] || {
      market: 'en', // Default to English market
      isSupported: true,
      shouldRedirect: false,
    }
  );
}
