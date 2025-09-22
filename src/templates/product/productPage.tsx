'use client';

import classNames from 'classnames';
import { ChevronRight, Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'use-intl';
import PageHeader from '@/src/components/header/PageHeader';
import { MaterialSelector } from '@/src/components/product/MaterialSelector';
import { AddToCart } from '@/src/components/product/page/AddToCart';
import AvailabilityInStore from '@/src/components/product/page/AvailabilityInStore/AvailabilityInStore';
import Breadcrumbs from '@/src/components/product/page/Breadcrumbs';
import { ImageGallery, ImageGalleryTypeEnum } from '@/src/components/product/page/ImageGallery/ImageGallery';
import NotifyMe from '@/src/components/product/page/NotifyMe/NotifyMe';
import SizeGuideModal from '@/src/components/product/page/SizeGuideModal';
import SizeSelector from '@/src/components/product/page/SizeSelector';
import ProductEngagement from '@/src/components/product/ProductEngagement';
import ProductFacts from '@/src/components/product/ProductFacts';
import { ProductInfoData } from '@/src/components/product/ProductInfo';
import ProductQuote from '@/src/components/product/ProductQuote';
import StockStatus from '@/src/components/product/StockStatus';
import RecommendationsDrawer from '@/src/components/recommendationsDrawer';
import { RecommendedList } from '@/src/components/recommendedList';
import { SizeSelectorHorizontal } from '@/src/components/sizeSelector/SizeSelectorHorizontal';
import SizeSelectorLabel from '@/src/components/sizeSelector/SizeSelectorLabel';
import { Toast } from '@/src/components/toast/toast';
import { Button } from '@/src/components/ui/Button';
import { useAnalytics } from '@/src/context/analytics/analyticsContext';
import { useCart } from '@/src/context/cartContext';
import { useFindifyAnalytics } from '@/src/context/findifyAnalytics/findifyAnalyticsContext';
import { useRecommendationsDrawer } from '@/src/context/recommendationsDrawerContext';
import { getAmount } from '@/src/helpers/money';
import { useClipboardWithToast } from '@/src/hooks/useClipboardWithToast';
import { useRecommendationIds } from '@/src/hooks/useRecommendationIds';
import useWindowWidthAndHeight from '@/src/hooks/useWindowWidthAndHeight';
import { useWishlist } from '@/src/hooks/useWishlist';
import { Link } from '@/src/i18n/navigation';
import {
  isDiamondFactsEnabled,
  isDropAHintEnabled,
  isStoreAvailabilityEnabled,
  isWishlistEnabled,
} from '@/src/lib/features';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type IElasticSearch } from '@/src/lib/framework/Product/types/IElasticSearch';
import { getLocalizedString } from '@/src/lib/utils/localization';
import { type CmsPage, type SizeGuide } from '@/src/types/framework/storyblok-components';
import { type LocalizedValue } from '@/src/types/product';
import { evaluateStockRules } from '@/src/util/stockRulesSimplified';

interface IProductPageProps {
  product: IProduct;
  story?: {
    content: SizeGuide;
  };
  language?: string;
  sizeGuideStory?: {
    content: CmsPage;
  };
  diamondInformationStory?: {
    content: CmsPage;
  };
  elasticData?: IElasticSearch.Item;
}

const ProductPage: React.FC<IProductPageProps> = (props) => {
  const t = useTranslations('product-page');

  const { product, language, story, sizeGuideStory, diamondInformationStory, elasticData } = props;

  const {
    id,
    title,
    images,
    variants,
    display_name,
    primaryCollection,
    product_flag,
    breadcrumbs,
    comingSoonPublishDate,
    baseColorCode,
    quote,
    quoteBy,
  } = product;
  const { emit } = useAnalytics();
  const { emitFeedback } = useFindifyAnalytics();
  const { width, height } = useWindowWidthAndHeight();
  const locale = useLocale();
  const { drawerId, listId } = useRecommendationIds();
  const firstVariant = product.variants.sort((a, b) => a.order - b.order)[0]?.id || product.id;

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && isMounted) {
      emit({ type: 'view_item', item: product });
      emitFeedback({
        type: 'view-page',
        properties: {
          url: window.location.href,
          ref: document.referrer,
          width,
          height,
          item_id: product.id,
          variant_item_id: currentVariant?.id || firstVariant,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  const { store } = useCart();
  const { currencyCode } = store || {};
  // Only auto-select a variant if there's only one size available
  const [selectedVariantSku, setSelectedVariantSku] = useState<string | undefined>(
    variants.length === 1 ? variants[0]?.sku : undefined,
  );
  const [selectedVariantByUser, setSelectedVariantByUser] = useState<string | undefined>(
    variants.length === 1 ? variants[0]?.sku : undefined,
  );

  const { setIsRecMenuOpen } = useRecommendationsDrawer();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenNotifyMe, setIsOpenNotifyMe] = useState(false);
  const [isAddToCartPressed, setIsAddToCartPressed] = useState(false);
  const [showSizeGuideModal, setShowSizeGuideModal] = useState<boolean>(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isAddToCartPressed && !selectedVariantByUser) {
      timeoutId = setTimeout(() => {
        setIsAddToCartPressed(false);
      }, 3000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isAddToCartPressed, selectedVariantByUser]);

  const currentVariant = useMemo(
    () => variants.find((variant) => variant.sku === selectedVariantSku),
    [selectedVariantSku, variants],
  );

  // Get the first variant for price display fallback
  const firstVariantData = useMemo(() => variants.sort((a, b) => a.order - b.order)[0], [variants]);

  // Use current variant price if selected, otherwise show first variant price
  // Also handle case where variants might not have price property
  const variantPrice = useMemo(() => {
    // First try to get price from selected variant
    if (currentVariant?.price) {
      return currentVariant.price;
    }
    // Fallback to first variant price
    if (firstVariantData?.price) {
      return firstVariantData.price;
    }
    // If no variant has price, check if product has a default price
    // Some products might have price at product level instead of variant level
    if (variants.length === 1 && variants[0]) {
      // For single variant, the variant might not have separate pricing
      return variants[0].price;
    }
    return null;
  }, [currentVariant, firstVariantData, variants]);

  // const singleLowStock =
  //   variants.length === 1 &&
  //   currentVariant?.stock?.quantity &&
  //   currentVariant?.stock?.quantity >= 6 &&
  //   currentVariant?.stock?.quantity <= 10;
  // const singleLowStockNumber =
  //   variants.length === 1 && currentVariant?.stock?.quantity && currentVariant?.stock?.quantity < 5;
  const anyVariantStock = variants.some((variant) => variant.stock?.quantity);

  // const hasMultipleSizes = variants.length > 1 && variants.some((variant) => variant.size);
  // const shouldShowSizeSelector = hasMultipleSizes; // Show size selectors for all products with multiple sizes

  // Show size selectors for all products
  const shouldShowSizeSelector = true;

  const isComingSoon = comingSoonPublishDate && new Date(comingSoonPublishDate) > new Date();

  const { copiedText, isVisible } = useClipboardWithToast({
    productId: product.sku,
    variationId: selectedVariantSku || '',
    productName: product.display_name,
  });

  const { isInWishlist, toggleWishlist } = useWishlist();

  const formatDate = (date: string | undefined) => {
    if (!date) return '';
    // Ensure consistent date formatting between server and client
    const dateObj = new Date(date);
    // Use a more predictable date format that won't vary by locale
    return new Intl.DateTimeFormat(language || 'en', { month: 'long' }).format(dateObj);
  };

  const getComingSoonPeriod = (date: Date) => {
    if (typeof window === 'undefined') return null;
    const day = date.getDate();
    if (day >= 1 && day <= 10) {
      return (
        <span>
          {t('coming-beginning')} {formatDate(comingSoonPublishDate)}
        </span>
      );
    } else if (day >= 11 && day <= 20) {
      return (
        <span>
          {t('coming-middle')} {formatDate(comingSoonPublishDate)}
        </span>
      );
    } else {
      return (
        <span>
          {t('coming-end')} {formatDate(comingSoonPublishDate)}
        </span>
      );
    }
  };

  const comingSoonPeriod = comingSoonPublishDate ? getComingSoonPeriod(new Date(comingSoonPublishDate)) : null;

  // Evaluate stock rules for the current variant
  const currentStockResult = useMemo(() => {
    if (!currentVariant) return null;
    // Find the elastic variant that matches the current variant
    const elasticVariant = elasticData?.productVariants?.find((v) => v.sku === currentVariant.sku);
    const result = evaluateStockRules(currentVariant, product, t, elasticVariant, elasticData);

    return result;
  }, [currentVariant, product, t, elasticData]);

  // Check if ANY variant is purchasable
  const anyVariantPurchasable = useMemo(() => {
    return variants.some((variant) => {
      const elasticVariant = elasticData?.productVariants?.find((v) => v.sku === variant.sku);
      const stockResult = evaluateStockRules(variant, product, t, elasticVariant, elasticData);
      return stockResult.allowPurchase;
    });
  }, [variants, product, t, elasticData]);

  const isNotifyButtonActive = useMemo(() => {
    // Only show notify me button if NO variants are purchasable
    return !anyVariantPurchasable;
  }, [anyVariantPurchasable]);

  return (
    <>
      <PageHeader hasHeaderFixed={false} />

      <div className={'mt-20'}>
        {typeof window !== 'undefined' && <Toast message={copiedText} isVisible={isVisible} />}
        <div className={'mx-auto w-full'}>
          <Breadcrumbs>
            {breadcrumbs?.length ? (
              breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <Link
                    href={crumb.full_slug}
                    className={`duration-800 font-bold uppercase tracking-wider decoration-0 transition-all ${
                      idx === 0 ? 'text-gray-800 hover:text-black' : 'text-gray-900 hover:text-black'
                    }`}
                  >
                    {getLocalizedString(crumb.title, locale)}
                  </Link>
                  {idx < breadcrumbs.length - 1 && (
                    <>
                      <span className={'md:hidden'}>/</span>
                      <span className={'hidden md:flex'}>{'>'}</span>
                    </>
                  )}
                </React.Fragment>
              ))
            ) : (
              <span>
                {primaryCollection && <Link href={`${primaryCollection.slug}`}>{primaryCollection.title}</Link>}
              </span>
            )}
          </Breadcrumbs>

          <div className={'justify-center lg:flex'}>
            <div className={'mb-0 block flex-shrink-0 gap-8 lg:mb-0 lg:w-1/2'}>
              <ImageGallery
                className={'block md:hidden'}
                galleryType={ImageGalleryTypeEnum.Horizontal}
                slides={images}
                product_flag={product_flag}
                productName={`${title.split(' ')[0]} ${display_name} - ${baseColorCode?.title} NO - ${process.env.NEXT_PUBLIC_STORE_NAME || ''}`}
              />
              <ImageGallery
                className={'hidden md:flex'}
                galleryType={ImageGalleryTypeEnum.Grid}
                withArrows={false}
                images={images.map((img) => img.src)}
                product_flag={product_flag}
                productName={`${title.split(' ')[0]} ${display_name} - ${baseColorCode?.title} NO - ${process.env.NEXT_PUBLIC_STORE_NAME || ''}`}
              />
            </div>

            <div className={'mt-4 flex w-full flex-col md:mt-0 lg:p-16 lg:py-10'}>
              <div className={'space-between mb-4 flex flex-col'}>
                <h1 className={'order-1 mb-2 flex flex-col'}>
                  <span className={'font-serif text-4xl'}>{title}</span>
                </h1>

                {!!variants.length && !!variantPrice && (
                  <>
                    <div className={'order-3 text-lg uppercase tracking-wider md:order-2'}>
                      {!!variantPrice?.discountAmount && (
                        <span className={'mr-5 text-red'}>
                          {getAmount(variantPrice.salePriceAmount, currencyCode, locale)}
                        </span>
                      )}
                      <span className={classNames({ 'text-gray-500 line-through': variantPrice?.discountAmount })}>
                        {getAmount(variantPrice.basePriceAmount, currencyCode, locale)}
                      </span>
                    </div>

                    <div>
                      {/* {Number(variantPrice?.salePriceAmount) !== variantPrice?.basePriceAmount && (
                      <div className="flex flex-row gap-1 mt-2 text-gray-400 text-[11px]">
                        <span>{t('last-lowest-price')} </span>
                        <span className="line-through uppercase">
                          {getAmount(variantPrice.salePriceAmount, currencyCode, locale)}
                        </span>
                      </div>
                    )} */}
                      {!!variantPrice?.discountAmount && (
                        <div
                          className={
                            'order-3 mt-1 inline-block rounded-md bg-red px-2 py-0.5 text-[11px] text-white md:order-2'
                          }
                        >
                          <span>{t('save-money')} </span>
                          <span className={'uppercase'}>
                            {getAmount(variantPrice.discountAmount, currencyCode, locale)}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              {!!quote && <ProductQuote quote={quote} quoteBy={quoteBy} />}

              {/* Only show size guide section if story exists */}
              {sizeGuideStory && (
                <div className={'order-9 md:order-6'}>
                  <SizeGuideModal
                    isVisible={showSizeGuideModal}
                    setIsVisible={setShowSizeGuideModal}
                    sizeGuideStory={sizeGuideStory}
                  />
                  <div
                    className={
                      'flex items-center justify-between border-t border-gray-400 pt-2 md:mb-0 md:border-none md:pb-0'
                    }
                  >
                    <span
                      className={'w-full cursor-pointer text-xs uppercase md:underline'}
                      onClick={() => setShowSizeGuideModal(true)}
                    >
                      {t('view-size-guide')}
                    </span>
                    <ChevronRight className={'h-3 w-3 md:hidden'} />
                  </div>
                </div>
              )}
              {/* Material Selector - Show for all products with multiple materials */}
              {product.productGroupProducts && product.productGroupProducts.length > 1 && (
                <div className={'order-4 mt-4'}>
                  <MaterialSelector
                    currentProduct={{
                      id: parseInt(product.id, 10) || 0,
                      product_sku: product.sku,
                      material: {
                        value: { [locale]: product.attributes?.material_main || 'Silver' },
                        external_id: product.sku || '',
                      },
                    }}
                    productGroupProducts={product.productGroupProducts}
                    locale={locale as keyof LocalizedValue}
                    className={'mb-4'}
                  />
                </div>
              )}

              {shouldShowSizeSelector && (
                <>
                  <div className={'order-5 mt-4 flex'}>
                    {story && (
                      <>
                        <SizeSelector
                          selectedVariantId={selectedVariantSku}
                          variants={variants}
                          setSelectedVariantId={setSelectedVariantSku}
                        />
                      </>
                    )}
                  </div>
                  <SizeSelectorLabel
                    variants={variants}
                    selectedVariantSku={selectedVariantSku}
                    setSelectedVariantSku={setSelectedVariantSku}
                    selectedVariantByUser={selectedVariantByUser}
                    setSelectedVariantByUser={setSelectedVariantByUser}
                    product={product}
                    elasticData={elasticData}
                  />
                  <SizeSelectorHorizontal
                    variants={variants}
                    selectedVariantSku={selectedVariantSku}
                    setSelectedVariantSku={setSelectedVariantSku}
                    selectedVariantByUser={selectedVariantByUser}
                    setSelectedVariantByUser={setSelectedVariantByUser}
                    sizeGuideStory={sizeGuideStory}
                    product={product}
                    elasticData={elasticData}
                  />
                </>
              )}
              <div className={'order-7 mt-4 flex flex-col md:flex-row md:items-start md:justify-between'}>
                {/* Stock Status Display - Only show after user selects a size */}
                {currentVariant && selectedVariantByUser && (
                  <StockStatus
                    selectedVariant={currentVariant}
                    product={product}
                    elasticData={elasticData}
                    className={'mb-2 border-t border-t-gray-400 text-xs uppercase md:border-0'}
                  />
                )}
                {isStoreAvailabilityEnabled() && (
                  <button
                    onClick={() => setIsOpen(true)}
                    className={
                      'whitespace-nowrap border-y border-y-gray-400 py-2 text-left text-xs uppercase md:ml-auto md:border-0 md:py-0 md:text-right md:underline'
                    }
                  >
                    {t('see-availability-in-store')}
                  </button>
                )}
              </div>

              <div
                className={
                  'relative mb-2 mt-4 flex flex-row flex-wrap items-center gap-x-10 gap-y-4 text-center md:order-8'
                }
              >
                <AddToCart
                  setIsRecMenuOpen={setIsRecMenuOpen}
                  className={'flex-1 flex-shrink-0 whitespace-nowrap'}
                  variantId={selectedVariantSku}
                  variantTrackingId={currentVariant?.id}
                  userSelected={selectedVariantByUser}
                  product={product}
                  stock={currentVariant?.stock?.quantity}
                  setIsAddToCartPressed={setIsAddToCartPressed}
                  allowPurchase={anyVariantPurchasable ? currentStockResult?.allowPurchase : false}
                  anyVariantPurchasable={anyVariantPurchasable}
                  elasticData={elasticData}
                />
                {isNotifyButtonActive && (
                  <Button
                    className={'flex-1 flex-shrink-0 whitespace-nowrap'}
                    onClick={() => setIsOpenNotifyMe(true)}
                    buttonType={Button.Type.Filled}
                  >
                    {t('notify-me')}
                  </Button>
                )}
              </div>
              {/* {anyVariantStock && singleLowStock && (
                <div className={'w-1/2 text-xs text-center text-gray'}>{t('low-stock-warning')}</div>
              )}
              {anyVariantStock && singleLowStockNumber && (
                <div className={'w-1/2 text-xs text-center text-gray'}>
                  {t('low-stock-only') + ' ' + currentVariant?.stock?.quantity + ' ' + t('low-stock-left')}
                </div>
              )} */}

              {isComingSoon && !anyVariantStock && (
                <div className={'mb-5 flex flex-col items-center'}>
                  <Button
                    className={'mb-2 w-2/3 whitespace-nowrap'}
                    onClick={() => setIsOpenNotifyMe(true)}
                    buttonType={Button.Type.Filled}
                  >
                    {t('notify-me')}
                  </Button>
                  <div className={'text-sm'}>{comingSoonPeriod}</div>
                </div>
              )}
              <ProductInfoData product={product} />
              {isDiamondFactsEnabled() && <ProductFacts product={product} story={diamondInformationStory} />}
              {isDropAHintEnabled() ? (
                <ProductEngagement product={product} />
              ) : (
                isWishlistEnabled() && (
                  <div className={'order-8 my-3 -ml-4 flex flex-row justify-between md:mb-0 md:flex-col'}>
                    <div>
                      <Button
                        onClick={() =>
                          toggleWishlist({
                            sku: product.sku,
                            id: product.id,
                            title: product.title,
                            display_name: product.display_name,
                            thumbnail: {
                              url: product.thumbnail.url,
                              hoverUrl: product.images[1]?.src || product.images[3]?.src,
                            },
                            description: product.description,
                            slug: product.slug,
                            price: product.variants[0].price?.basePriceAmount,
                            tags: [''],
                          })
                        }
                        aria-label={'Add to wishlist'}
                        type={'button'}
                        className={'flex [&_svg]:size-5'}
                      >
                        <Heart
                          className={`mr-1 ${isInWishlist(product.sku) ? ' fill-backgroundAlternative stroke-backgroundAlternative ' : 'stroke-backgroundAlternative'}`}
                          size={16}
                          strokeWidth={1}
                        />
                        <span className={'text-xs uppercase text-gray-800'}>
                          {t('product-page.info.add-to-wishlist')}
                        </span>
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
        {isStoreAvailabilityEnabled() && (locale === 'sv' || locale === 'fi') && (
          <AvailabilityInStore product={product} isOpen={isOpen} setIsOpen={setIsOpen} />
        )}

        {selectedVariantSku && (
          <NotifyMe
            product={product}
            isOpen={isOpenNotifyMe}
            setIsOpen={setIsOpenNotifyMe}
            selectedVariantSku={selectedVariantSku}
          />
        )}
        {!!drawerId && <RecommendationsDrawer itemId={id} slot={drawerId} />}

        {!!listId && <RecommendedList title={t('recommended-for-you')} itemId={id} slot={listId} take={8} />}
        {/* Toast is now conditionally rendered at the top of the component */}
      </div>
    </>
  );
};

export default ProductPage;
