'use client';

// import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import { Button } from '@/src/components/ui/Button';
// import { Amount } from '@/src/components/ui/ProductPageAmount';
import { useAnalytics } from '@/src/context/analytics/analyticsContext';
import { useCart } from '@/src/context/cartContext';
import { useFindifyAnalytics } from '@/src/context/findifyAnalytics/findifyAnalyticsContext';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type IElasticSearch } from '@/src/lib/framework/Product/types/IElasticSearch';
import { getVariantSelectionKey } from '@/src/util/pdpTemplate';

interface IAddToCartProps {
  variantId: string | undefined;
  variantTrackingId: string | undefined;
  product: IProduct;
  stock: number | undefined;
  userSelected?: string | undefined;
  className?: string;
  setIsRecMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAddToCartPressed: React.Dispatch<React.SetStateAction<boolean>>;
  allowPurchase?: boolean;
  anyVariantPurchasable?: boolean;
  elasticData?: IElasticSearch.Item;
}

export const AddToCart: React.FC<IAddToCartProps> = (props) => {
  const t = useTranslations();
  const {
    variantId = undefined,
    variantTrackingId = undefined,
    product,
    // stock = 0,
    // className,
    setIsRecMenuOpen,
    userSelected,
    setIsAddToCartPressed,
    allowPurchase,
    anyVariantPurchasable = true,
    elasticData,
  } = props;

  const { emit } = useAnalytics();
  const { emitFeedback } = useFindifyAnalytics();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const { addToCart, updateItemInCart, deleteItemFromCart, cart } = useCart();

  const isDisabled = useMemo(() => {
    // If ANY variant is purchasable, don't disable the button
    // Let the user select a size first
    if (anyVariantPurchasable) {
      // Only disable if user has selected a variant that's not purchasable
      if (userSelected && allowPurchase === false) return true;
      // Otherwise keep it enabled so they can select a size
      return false;
    }
    // If NO variants are purchasable, always disable
    return true;
  }, [anyVariantPurchasable, userSelected, allowPurchase]);

  const productInCart = useMemo(
    () => cart?.items?.find((i) => i.productVariantId === variantId) ?? null,
    [cart?.items, variantId],
  );

  const ean = useMemo(() => product.variants.find((i) => i.sku === variantId)?.ean, [product?.variants, variantId]);
  const inCartCount = useMemo(() => productInCart?.quantity ?? 0, [productInCart]);
  // const isInCart = useMemo(() => inCartCount > 0, [inCartCount]);
  const [quantity, setQuantity] = useState(inCartCount);
  const [debouncedQuantity] = useDebounceValue(quantity, 750);

  const productVariantId = useMemo(() => variantId?.replace('/', ''), [variantId]);

  const currentVariant = useMemo(
    () => product.variants.find((variant) => variant.sku === variantId),
    [product.variants, variantId],
  );

  const onAddToCart = useCallback(async () => {
    setIsAddToCartPressed(true);

    if (isDisabled || !productVariantId || !userSelected) return;

    if (!currentVariant) return;

    setIsLoading(true);
    await addToCart({
      productVariantId,
      quantity: 1,
    }).then(() => {
      setIsLoading(false);
      setQuantity(1);
      setIsRecMenuOpen(true);
      emit({ type: 'add_to_cart', item: { ...product, sku: productVariantId ?? ean }, item_list_name: 'Product page' });

      emitFeedback({
        type: 'add-to-cart',
        properties: {
          item_id: product.id,
          variant_item_id: variantTrackingId || product.id,
          quantity: 1,
        },
      });
    });

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
  }, [
    isDisabled,
    productVariantId,
    emit,
    product,
    ean,
    emitFeedback,
    addToCart,
    setIsRecMenuOpen,
    cart,
    setIsAddToCartPressed,
    variantTrackingId,
    userSelected,
    currentVariant,
  ]);

  const onUpdate = useCallback(
    async (quantity: number) => {
      if (!productInCart || inCartCount === quantity) return;

      setIsLoading(true);

      try {
        if (!quantity || quantity <= 0) {
          emit({ type: 'remove_from_cart', item: { ...productInCart, quantity: 1 } });

          await deleteItemFromCart(productInCart.id);
          setQuantity(0);
        } else {
          await updateItemInCart({ itemId: productInCart.id, quantity }).then(() => {
            if (inCartCount > quantity) {
              emit({ type: 'remove_from_cart', item: { ...product, quantity: 1 } });
            } else {
              if (productVariantId) {
                emit({
                  type: 'add_to_cart',
                  item: { ...product, sku: productVariantId ?? ean },
                  item_list_name: 'Product page',
                });
              }
              emitFeedback({
                type: 'add-to-cart',
                properties: {
                  item_id: product.id,
                  variant_item_id: variantTrackingId || product.id,
                  quantity: 1,
                },
              });
            }
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
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      productInCart,
      inCartCount,
      cart?.items,
      emit,
      deleteItemFromCart,
      updateItemInCart,
      product,
      productVariantId,
      variantTrackingId,
      emitFeedback,
      ean,
    ],
  );

  useEffect(() => {
    setQuantity(inCartCount);
  }, [inCartCount]);

  useEffect(() => {
    onUpdate(debouncedQuantity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuantity]);

  // const updateQuantity = useCallback(
  //   (value: number | string) => {
  //     const quantity = typeof value === 'number' ? value : parseInt(value, 10);

  //     setQuantity(isNaN(quantity) ? 0 : Math.min(Math.max(quantity, 0), stock));
  //   },
  //   [stock],
  // );

  // Determine button text based on state
  const getButtonText = () => {
    if (isDisabled && allowPurchase === false && !anyVariantPurchasable) {
      return t('common.out-of-stock');
    }
    if (isLoading) {
      return t('common.loading');
    }
    // Show dynamic selection text based on template configuration
    if (!userSelected && isHovered && anyVariantPurchasable) {
      const selectionKey = getVariantSelectionKey(elasticData, 'select');
      return t(`product-page.${selectionKey}`);
    }
    return t('common.add-to-cart');
  };

  return (
    <>
      {/* Always show regular add to cart button, even when item is in cart */}
      {/* {!isInCart || isDisabled ? ( */}
      <Button
        buttonType={Button.Type.Filled}
        className={'flex-1 flex-shrink-0 whitespace-nowrap'}
        onClick={() => {
          // Only try to add to cart if user has selected a size
          if (userSelected) {
            setIsAddToCartPressed(true);
            onAddToCart();
          }
          // Do nothing if no size is selected
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isDisabled || isLoading}
      >
        {getButtonText()}
      </Button>
      {/* ) : (
        <div className={'flex w-full items-center gap-x-7'}>
          <Amount
            className={classNames('h-[50px]', className)}
            amount={quantity}
            setAmount={updateQuantity}
            min={0}
            max={stock}
            loading={isLoading}
          />
          <span className={'text-sm uppercase text-black/80 lg:text-2xl'}>
            {getAmount(productInCart?.salePriceAmount!, cart?.currencyCode ?? '', locale)}
          </span>
        </div>
      )} */}
    </>
  );
};
