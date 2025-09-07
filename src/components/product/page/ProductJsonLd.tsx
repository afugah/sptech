'use server';

import Script from 'next/script';
import { type Product, type WithContext } from 'schema-dts';

interface ProductJsonLdProps {
  title: string;
  description?: string;
  thumbnailUrl: string;
  price: number;
  currency: string;
  canonicalUrl: string;
  hasStock: boolean;
}

export async function ProductJsonLd({
  title,
  description,
  thumbnailUrl,
  price,
  currency,
  canonicalUrl,
  hasStock,
}: ProductJsonLdProps) {
  const jsonLd: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description,
    image: thumbnailUrl,
    brand: {
      '@type': 'Brand',
      name: process.env.NEXT_PUBLIC_STORE_NAME || '',
    },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: canonicalUrl,
    },
  };

  return (
    <Script
      id={'product-jsonld'}
      type={'application/ld+json'}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
