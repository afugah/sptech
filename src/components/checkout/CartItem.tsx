'use client';

import classNames from 'classnames';
import debounce from 'lodash.debounce';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'use-intl';
import { StockDot } from '@/src/components/product/StockDot';
import { Amount } from '@/src/components/ui/Amount';
import { useAnalytics } from '@/src/context/analytics/analyticsContext';
import { useCart } from '@/src/context/cartContext';
import { useFindifyAnalytics } from '@/src/context/findifyAnalytics/findifyAnalyticsContext';
import { getAmount } from '@/src/helpers/money';
import { useRouter } from '@/src/i18n/navigation';
import { Link } from '@/src/i18n/navigation';
import { fetchProductStock } from '@/src/lib/api/clientApi';
import { type ShopperCartItem } from '@/src/lib/types/session';
import { evaluateStockRulesForBrinkShort } from '@/src/util/stockRulesSimplified';
import { Button } from '../shadcn/button';
import { Popover, PopoverContent, PopoverTrigger } from '../shadcn/popover';

interface ICheckoutCartItemProps {
  item: ShopperCartItem;
}

export const CheckoutCartItem: React.FC<ICheckoutCartItemProps> = ({ item }) => {
  const { cart, deleteItemFromCart, updateItemInCart, giftCardProducts } = useCart();
  const [currentStock, setCurrentStock] = useState<number | undefined>(undefined);
  const [validateStock, setValidateStock] = useState<boolean>(true);
  const { replace } = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const { emit } = useAnalytics();
  const { emitFeedback } = useFindifyAnalytics();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setIsOpen] = useState<boolean>(false);

  const hasSalePrice = useMemo(
    () => item.salePriceAmount < item.basePriceAmount,
    [item.basePriceAmount, item.salePriceAmount],
  );

  const onUpdate = useMemo(() => {
    return debounce((item: ShopperCartItem, qty: number) => {
      setIsLoading(true);
      const existingItem = cart?.items?.find((cartItem) => cartItem.id === item.id);

      if (qty === 0 || (existingItem && qty < existingItem.quantity)) {
        emit({ type: 'remove_from_cart', item: { ...item, quantity: 1 } });
      }
      if (qty === 0) {
        return deleteItemFromCart(item.id)
          .then(() => {
            if ((cart?.items.length ?? 0) - 1 <= 0 && !giftCardProducts.length) {
              replace('/');
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
      if (existingItem && qty > existingItem.quantity) {
        emit({
          type: 'add_to_cart',
          item: { ...item, quantity: 1, sku: item.productVariantId },
          item_list_name: 'Checkout',
        });
      }

      if (cart?.items) {
        emitFeedback({
          type: 'update-cart',
          properties: {
            line_items: cart.items.map((cartItem) => ({
              item_id: cartItem.customAttributes?.findify_id || '',
              variant_item_id: cartItem.customAttributes?.findify_variant_id || '',
              unit_price: ((cartItem.salePriceAmount || cartItem.basePriceAmount) / 100) as number,
              quantity: cartItem.quantity,
            })),
          },
        });
      }
      return updateItemInCart({ itemId: item.id, quantity: qty })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => setIsLoading(false));
    }, 500);
  }, [updateItemInCart, emit, emitFeedback, deleteItemFromCart, giftCardProducts, replace, cart]);

  const onDelete = async (item: ShopperCartItem) => {
    try {
      setIsLoading(true);
      await deleteItemFromCart(item.id);
    } finally {
      setIsLoading(false);
    }
  };

  const slug = useMemo(() => {
    const selectedSlug = `fullSlug_${locale === 'se' ? 'sv' : locale === 'no' ? 'nb' : locale}`;
    return item.customAttributes[selectedSlug];
  }, [locale, item]);

  const material = useMemo(() => {
    const materialKey = `material_${locale === 'se' ? 'sv' : locale === 'no' ? 'nb' : locale}`;
    return item.customAttributes[materialKey] || item.customAttributes.material;
  }, [locale, item]);

  // const color = useMemo(() => {
  //   const color = `color_${locale === 'se' ? 'sv' : locale === 'no' ? 'nb' : locale}`;
  //   return item.customAttributes[color];
  // }, [locale, item]);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const stockData = await fetchProductStock(item.productParentId, 'SE');
        const variantStock = stockData.find((stock: { id: string }) => stock.id === item.productVariantId);
        if (variantStock) {
          const totalStock = variantStock.inventories.reduce(
            (sum: number, inv: { quantity: number }) => sum + inv.quantity,
            0,
          );
          setCurrentStock(totalStock);
          setValidateStock(variantStock.validateStock ?? true);
        }
      } catch (error) {
        console.error('Error fetching stock:', error);
      }
    };

    fetchStock();
  }, [item.productParentId, item.productVariantId, item.quantity]);

  const outOfStock = useMemo(() => {
    // If validateStock is false, the product can be purchased even when stock is 0
    return currentStock === 0 && validateStock;
  }, [currentStock, validateStock]);

  // Evaluate stock rules for display
  const stockResult = useMemo(() => {
    if (currentStock === undefined) return null;

    // Try to get stockType from customAttributes if available
    const stockType = item.customAttributes?.stockType as string | undefined;

    return evaluateStockRulesForBrinkShort(currentStock, validateStock, stockType, t);
  }, [currentStock, validateStock, item.customAttributes, t]);

  return (
    <div
      className={'grid grid-cols-1 border-b border-gray-300 py-4 lg:grid-cols-[350px_1fr_1fr_1fr_1fr_1fr_80px] lg:py-3'}
    >
      <div className={'mt-0 flex flex-row items-start gap-3 sm:gap-4'}>
        <div className={'block lg:hidden'}>
          <div className={' flex items-start gap-x-3 sm:gap-x-4'}>
            <Link href={slug} className={' border border-gray-300'}>
              <Image
                src={item.imageUrl}
                alt={item.displayName}
                unoptimized
                width={100}
                height={100}
                className={classNames(' h-20 w-20 object-cover sm:h-16 sm:w-16', outOfStock ? 'opacity-40' : '')}
              />
            </Link>
            <div className={'flex min-w-0 flex-1 flex-col items-start justify-start gap-y-2 text-xxs'}>
              <div>
                <p className={'truncate break-words text-sm font-semibold uppercase leading-tight sm:text-xxs'}>
                  {item.displayName}
                </p>
                <p className={'mt-1.5 text-sm text-gray-600 sm:text-xxs'}>
                  {t('cart-item.art-no')}: {item.productVariantId}
                </p>
                {stockResult?.status && (
                  <div className={'mb-2 mt-1.5 flex items-center gap-1'}>
                    <StockDot dotColor={stockResult.dotColor} size={'small'} />
                    <span className={'text-sm text-gray-600 sm:text-xxs'}>{stockResult.status}</span>
                  </div>
                )}
              </div>
              <div className={'space-y-1.5 uppercase sm:space-y-1'}>
                <div className={'flex flex-wrap gap-x-1'}>
                  <span className={' text-sm font-semibold uppercase text-black sm:text-xxs'}>
                    {t('cart-item.size-label')}
                  </span>
                  <span className={'text-sm sm:text-xxs'}>{item.customAttributes.size}</span>
                </div>
                <div className={'flex flex-wrap gap-x-1'}>
                  <span className={' text-sm font-semibold uppercase text-black sm:text-xxs'}>
                    {t('cart-item.material-label')}
                  </span>
                  <span className={'break-words text-sm sm:text-xxs'}>{material}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={' hidden border border-gray-300 lg:block'}>
          <Link href={slug}>
            <Image
              src={item.imageUrl}
              alt={item.displayName}
              unoptimized
              width={100}
              height={100}
              className={classNames(' h-16 w-16', outOfStock ? 'opacity-40' : '')}
            />
          </Link>
        </div>
        <div className={'hidden flex-col items-start justify-center gap-y-1 text-xxs lg:flex'}>
          <p className={'truncate  font-semibold uppercase'}>{item.displayName}</p>
          <p className={'text-xxs text-gray-600'}>
            {t('cart-item.art-no')}: {item.productVariantId}
          </p>
          {/* Stock status display for desktop */}
          {stockResult?.status && (
            <div className={'mt-0.5 flex items-center gap-1.5'}>
              <StockDot dotColor={stockResult.dotColor} size={'small'} />
              <span className={'text-xxs italic text-gray-600'}>{stockResult.status}</span>
            </div>
          )}
        </div>
      </div>
      <div className={' hidden items-center justify-center text-sm font-medium lg:flex'}>
        <span> {material}</span>
      </div>
      <div className={' hidden items-center justify-center text-sm font-medium lg:flex'}>
        {item.customAttributes.size}
      </div>
      <div className={' hidden items-center justify-center text-sm font-medium lg:flex'}>
        <span className={'text-sm uppercase text-black/80 lg:text-sm'}>
          {getAmount(item.salePriceAmount * 1, cart?.currencyCode ?? '', locale)}
        </span>
      </div>
      <div className={' hidden items-center justify-center text-sm font-medium lg:flex'}>
        {outOfStock ? (
          <div className={'uppercase text-red'}>{t('common.out-of-stock')}</div>
        ) : (
          <Amount
            loading={isLoading}
            className={'max-w-36 bg-white'}
            amount={item.quantity}
            setAmount={(qty) => onUpdate(item, qty)}
            max={currentStock}
          />
        )}
      </div>
      <div
        className={classNames(
          ' hidden items-center justify-center text-sm font-medium lg:flex',
          outOfStock ? 'opacity-40' : '',
        )}
      >
        <span className={classNames('', { 'text-red': hasSalePrice })}>
          <span className={'text-sm uppercase text-black/80 lg:text-sm'}>
            {getAmount(item.salePriceAmount * item.quantity, cart?.currencyCode ?? '', locale)}
          </span>
        </span>

        {hasSalePrice && (
          <span className={'uppercase text-gray line-through'}>
            <span>{getAmount(item.basePriceAmount * item.quantity, cart?.currencyCode ?? '', locale)}</span>
          </span>
        )}
      </div>
      <div className={' hidden items-center justify-center text-sm lg:flex'}>
        {' '}
        <Button
          variant={'custom'}
          disabled={isLoading}
          className={' px-1 [_&>svg]:size-5'}
          onClick={() => onDelete(item)}
        >
          <Trash2 strokeWidth={1} />
        </Button>
      </div>
      <div
        className={'mt-4 flex items-center justify-between rounded-sm bg-alabaster px-3 py-3 sm:px-2 sm:py-2 lg:hidden'}
      >
        <div className={' flex items-center'}>
          {!open && (
            <div className={' flex gap-1'}>
              <p className={' text-sm font-semibold uppercase tracking-wide sm:text-xxs'}>
                {t('cart-item.quantity-label')}
              </p>
              <p className={' text-sm font-semibold sm:text-xxs'}>{item?.quantity}</p>
            </div>
          )}
          {/* <div className={' flex gap-1'}>
            <p className={' text-xxs font-semibold'}>Quantity:</p>
            <p className={' text-xxs font-semibold'}>{item?.quantity}</p>
          </div> */}
          <div>
            <Popover open={open} onOpenChange={() => setIsOpen((p) => !p)}>
              <PopoverTrigger asChild>
                {open ? (
                  <div></div>
                ) : (
                  <div>
                    <Button className={' py-0 text-sm uppercase underline sm:text-xxs'} variant={'custom'}>
                      {t('cart-item.change-button')}
                    </Button>
                  </div>
                )}
              </PopoverTrigger>

              <PopoverContent side={'left'} className={'w-fit rounded-none border-none p-0 shadow-none'}>
                {open ? (
                  <div className={' flex items-center gap-x-2 '}>
                    {' '}
                    <Amount
                      loading={isLoading}
                      className={'max-w-32 bg-white'}
                      amount={item.quantity}
                      setAmount={(qty) => onUpdate(item, qty)}
                      max={currentStock}
                    />
                    <div className={' '}>
                      {' '}
                      <Button
                        variant={'custom'}
                        disabled={isLoading}
                        className={' px-1 [_&>svg]:size-5'}
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 strokeWidth={1} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  ''
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <span className={'text-sm font-medium uppercase'}>
            {getAmount(item.salePriceAmount * item.quantity, cart?.currencyCode ?? '', locale)}
          </span>
        </div>
      </div>
    </div>
  );
};
