'use client';
import classNames from 'classnames';
import debounce from 'lodash.debounce';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'use-intl';
import { useAnalytics } from '@/src/context/analytics/analyticsContext';
import { useCart } from '@/src/context/cartContext';
import { useFindifyAnalytics } from '@/src/context/findifyAnalytics/findifyAnalyticsContext';
import { logError } from '@/src/helpers/errors';
import { getAmount } from '@/src/helpers/money';
import { Link } from '@/src/i18n/navigation';
import { fetchProductStock } from '@/src/lib/api/clientApi';
import { type ShopperCartItem } from '@/src/lib/types/session';
import { evaluateStockRulesForBrinkShort } from '@/src/util/stockRulesSimplified';
import { StockDot } from '../product/StockDot';
import { Amount } from '../ui/Amount';
import { Button } from '../ui/Button';

type Props = {
  item: ShopperCartItem;
  isOpen?: boolean;
};

const CartItem = ({ item, isOpen = false }: Props) => {
  const { updateItemInCart, deleteItemFromCart, cart } = useCart();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStock, setCurrentStock] = useState<number | undefined>(undefined);
  const [validateStock, setValidateStock] = useState<boolean>(true);
  const locale = useLocale();
  const { emit } = useAnalytics();
  const { emitFeedback } = useFindifyAnalytics();
  const t = useTranslations();

  const onUpdate = useMemo(() => {
    return debounce((item: ShopperCartItem, qty: number) => {
      setIsLoading(true);
      const existingItem = cart?.items?.find((cartItem) => cartItem.id === item.id);

      if (qty === 0 || (existingItem && qty < existingItem.quantity)) {
        emit({ type: 'remove_from_cart', item: { ...item, quantity: 1 } });
      }
      if (qty === 0) {
        return deleteItemFromCart(item.id)
          .then(() => setIsLoading(false))
          .catch((error) => {
            logError(error, 'deleteItemFromCart');
          });
      }
      if (existingItem && qty > existingItem.quantity) {
        emit({
          type: 'add_to_cart',
          item: { ...item, quantity: 1, sku: item.productVariantId },
          item_list_name: 'Mini cart',
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
        .then(() => setIsLoading(false))
        .catch((error) => {
          logError(error, 'updateItemInCart');
        });
    }, 500);
  }, [updateItemInCart, cart, emitFeedback, emit, deleteItemFromCart]);

  const onDelete = async (item: ShopperCartItem) => {
    try {
      setIsLoading(true);
      await deleteItemFromCart(item.id);
    } catch (error) {
      logError(error, 'onDelete');
    } finally {
      setIsLoading(false);
    }
  };

  const hasSalePrice = useMemo(
    () => item.salePriceAmount < item.basePriceAmount,
    [item.basePriceAmount, item.salePriceAmount],
  );
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
        logError(error, 'fetchStock');
      }
    };

    // Only fetch stock when the cart drawer is open
    if (isOpen) {
      fetchStock();
    }
  }, [item.productParentId, item.productVariantId, updateItemInCart, isOpen]);

  const outOfStock = useMemo(() => {
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
    <div className={'border-b border-gray-300 pb-5 text-xs sm:gap-5'}>
      <div className={'mt-5 flex flex-row items-start gap-4'}>
        <div className={'w-1/4'}>
          <Link href={slug}>
            <Image
              src={item.imageUrl}
              alt={item.displayName}
              unoptimized
              width={100}
              height={150}
              className={classNames('', outOfStock ? 'opacity-40' : '')}
            />
          </Link>
        </div>

        <div className={'flex w-3/4 flex-1 flex-col gap-5 pt-3'}>
          <Link href={slug}>
            <div className={classNames('flex flex-col gap-1', outOfStock ? 'opacity-40' : 'truncate')}>
              <span className={'mb-2 truncate text-sm font-semibold uppercase'}>{item.displayName}</span>
              <span className={classNames('', outOfStock ? 'opacity-40' : '')}>
                <span className={'font-semibold uppercase'}>{t('product-page.size')}</span>:{' '}
                {item.customAttributes.size}
              </span>
              <span className={classNames('text-xs', outOfStock ? 'opacity-40' : '')}>
                <span className={'font-semibold uppercase'}>{t('product-page.info.material')}</span>: {material}
              </span>
              {/* Stock status display */}
              {stockResult?.status && (
                <div className={'mt-1 flex items-center gap-1.5 text-xs'}>
                  <StockDot dotColor={stockResult.dotColor} />
                  <span className={classNames('text-xs', outOfStock ? 'opacity-40' : '')}>{stockResult.status}</span>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
      <div className={'flex flex-row items-center justify-between gap-1 pt-3'}>
        {outOfStock && <div className={'uppercase text-red'}>{t('common.out-of-stock')}</div>}
        {outOfStock ? (
          <Button
            color={Button.Color.Light}
            buttonType={Button.Type.Outline}
            buttonSize={Button.Size.Small}
            className={'max-w-36'}
            onClick={() => onDelete(item)}
          >
            Ta bort
          </Button>
        ) : (
          <Amount
            loading={isLoading}
            className={'max-w-36 bg-white'}
            amount={item.quantity}
            setAmount={(qty) => onUpdate(item, qty)}
            max={currentStock}
          />
        )}
        <div className={classNames('', outOfStock ? 'opacity-40' : '')}>
          <span className={classNames('', { 'text-red': hasSalePrice })}>
            <span className={'pr-2 text-gray'}>x</span>
            <span className={'uppercase'}>
              {getAmount(item.salePriceAmount * item.quantity, cart?.currencyCode ?? '', locale)}
            </span>
          </span>

          {hasSalePrice && (
            <span className={'uppercase text-gray line-through'}>
              <span className={'pr-2 text-gray'}>x</span>
              <span>{getAmount(item.basePriceAmount * item.quantity, cart?.currencyCode ?? '', locale)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
