'use client';

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from '@/src/i18n/navigation';
import { getCurrentCountry } from '@/src/lib/constants/markets';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type IElasticSearch } from '@/src/lib/framework/Product/types/IElasticSearch';
import ProductPage from '@/src/templates/product/productPage';
import { type CmsPage } from '@/src/types/framework/storyblok-components';

interface ProductPageClientProps {
  locale: string;
  slug: string;
}

export default function ProductPageClient({ locale, slug }: ProductPageClientProps) {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [elasticData, setElasticData] = useState<IElasticSearch.Item | undefined>(undefined);
  const [diamondInformationStory, setDiamondInformationStory] = useState<{ content: CmsPage } | undefined>(undefined);
  const [sizeGuideStory, setSizeGuideStory] = useState<{ content: CmsPage } | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchAllData() {
      try {
        // Fetch product data via proxy that handles bypass on server-side
        const productResponse = await fetch(`/api/proxy/products/${slug}?locale=${locale}`, {
          credentials: 'same-origin', // Include cookies as fallback
        });
        const productData = await productResponse.json();

        if (!productResponse.ok) {
          notFound();
        }

        if (productData.redirectUrl) {
          router.push(`/${locale}${productData.redirectUrl}`);
          return;
        }

        setProduct(productData.product);

        // Fetch elastic data for MTO product support
        if (productData.product?.id) {
          const country = getCurrentCountry();
          const elasticUrl = `/api/product/elastic/${productData.product.id}?locale=${locale}&country=${encodeURIComponent(country)}`;

          fetch(elasticUrl)
            .then((res) => {
              if (!res.ok) {
                return null;
              }
              return res.json();
            })
            .then((data) => {
              if (data) {
                setElasticData(data);
              }
            })
            .catch(() => {
              // Silently handle error - elastic data is optional
            });
        }

        // Fetch diamond information (non-blocking)
        fetch(`/api/storyblok/diamond-information?locale=${locale}`, {
          credentials: 'same-origin', // Include cookies as fallback
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.story) {
              setDiamondInformationStory(data.story);
            }
          })
          .catch(() => {
            // Silently handle error - diamond info is optional
          });

        // Fetch size guide if product has category (non-blocking)
        if (productData.product?.sanity_category) {
          fetch(`/api/storyblok/size-guide?locale=${locale}&category=${productData.product.sanity_category}`, {
            credentials: 'same-origin', // Include cookies as fallback
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.story) {
                setSizeGuideStory(data.story);
              }
            })
            .catch(() => {
              // Silently handle error - size guide is optional
            });
        }
      } catch {
        notFound();
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [locale, slug, router]);

  if (loading) {
    return (
      <div className={'flex min-h-screen items-center justify-center'}>
        <div className={'text-center'}>
          <h1 className={'text-2xl font-semibold'}>Loading...</h1>
          <p className={'mt-2 text-gray-600'}>Fetching product information</p>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  return (
    <ProductPage
      diamondInformationStory={diamondInformationStory}
      sizeGuideStory={sizeGuideStory}
      product={product}
      language={locale}
      elasticData={elasticData}
    />
  );
}
