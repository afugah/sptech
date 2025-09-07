'use strict';

import { JsBloom } from '@getkoala/js-bloom';
import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { existsSync } from 'fs';

if (existsSync('.env')) {
  config({ path: '.env' });
} else if (existsSync('.env.local')) {
  config({ path: '.env.local' });
} else {
  config();
}

async function fetchAndProcessRedirects() {
  const storefronts = await fetchStorefronts();
  const allRedirects = {};

  if (!storefronts || storefronts.length === 0) {
    console.warn('No storefronts found - generating empty bloom filter');
    return allRedirects;
  }

  for (const storefront of storefronts) {
    const marketId = storefront.market_id;
    let page = 1;
    let hasMoreData = true;

    while (hasMoreData) {
      const response = await getRedirects(marketId, page);
      const redirectsData = response.data;

      if (!Array.isArray(redirectsData)) {
        throw new Error(`Invalid API response: expected an array, got ${typeof redirectsData}`);
      }

      hasMoreData = redirectsData.length === 1000;

      redirectsData.forEach((item) => {
        if (typeof item.from !== 'string' || typeof item.to !== 'string' || typeof item.type !== 'string') {
          throw new Error(`Invalid redirect item: ${JSON.stringify(item)}`);
        }
        allRedirects[item.from] = {
          target: item.to,
          permanent: true,
        };
      });

      page++;
    }
  }

  writeFileSync(`./src/redirects/redirects.json`, JSON.stringify(allRedirects, null, 2));

  const numItems = Object.keys(allRedirects).length;
  const desiredFalsePositiveRate = 0.0000001;

  // Ensure we have at least 1 item to prevent division by zero and null hashes
  const effectiveNumItems = Math.max(numItems, 1);
  const optimalSize = Math.ceil((-effectiveNumItems * Math.log(desiredFalsePositiveRate)) / Math.pow(Math.log(2), 2));
  const optimalHashes = Math.ceil((optimalSize / effectiveNumItems) * Math.log(2));

  const filter = new JsBloom({
    size: optimalSize,
    hashes: optimalHashes,
    seed: Math.random() * Number.MAX_SAFE_INTEGER,
  });

  for (const key in allRedirects) {
    const path = `^${key}$`;
    filter.add(path);
  }

  writeFileSync(`./src/redirects/redirects-bloom-filter.json`, filter.toJson());
}

async function fetchStorefronts() {
  if (!process.env.SHOPLAB_API_URL) {
    console.warn('SHOPLAB_API_URL environment variable is not defined - returning empty array');
    return [];
  }

  if (!process.env.SHOPLAB_TOKEN) {
    console.warn('SHOPLAB_TOKEN environment variable is not defined - returning empty array');
    return [];
  }

  const response = await fetch(`${process.env.SHOPLAB_API_URL}/storefronts`, {
    headers: {
      Authorization: `Bearer ${process.env.SHOPLAB_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch storefronts: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

async function getRedirects(marketId, page) {
  if (!process.env.SHOPLAB_API_URL) {
    throw new Error('SHOPLAB_API_URL environment variable is not defined');
  }

  if (!process.env.SHOPLAB_TOKEN) {
    throw new Error('SHOPLAB_TOKEN environment variable is not defined');
  }

  const response = await fetch(
    `${process.env.SHOPLAB_API_URL}/storefronts/${marketId}/redirects?per_page=1000&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.SHOPLAB_TOKEN}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data) {
    throw new Error(`Invalid API response: ${JSON.stringify(data)}`);
  }

  if (!data.data) {
    // No redirects available, return empty data structure
    return { data: [] };
  }

  return data;
}

fetchAndProcessRedirects().catch(console.error);
