import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from 'use-intl';
import Loader from '@/src/components/ui/Loader';
import { useCart } from '@/src/context/cartContext';
import { useVoyado } from '@/src/context/voyadoContext';
import { getAmount } from '@/src/helpers/money';

const BonusVoucherOptions = () => {
  const t = useTranslations();
  const locale = useLocale();
  const currency = locale === 'se' ? 'SEK' : locale === 'no' ? 'NOK' : locale === 'fi' ? 'EUR' : 'EUR';
  const { cart } = useCart();
  const {
    addVoucher: addVoucherVoyado,
    deleteVoucher: deleteVoucherVoyado,
    customer,
    startVoyado,
    refreshVouchers,
  } = useVoyado();
  const [loading, setLoading] = useState(true);
  const [removingVoucher, setRemovingVoucher] = useState<string | null>(null); // Track voucher being removed
  const [processingVoucher, setProcessingVoucher] = useState<string | null>(null); // Track voucher being processed (either added or removed)

  useEffect(() => {
    if (customer?.contactId && refreshVouchers) {
      setLoading(true);
      refreshVouchers();
      startVoyado(customer.contactId).finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startVoyado]);

  const handleToggleVoucher = useCallback(
    async (voucherId: string, checkNumber: string, isApplied: boolean) => {
      setProcessingVoucher(voucherId); // Set the voucher as being processed
      if (isApplied) {
        setRemovingVoucher(voucherId);
        try {
          await deleteVoucherVoyado(voucherId);
        } catch (error) {
          console.error('Error deleting voucher:', error);
        } finally {
          setTimeout(() => {
            setRemovingVoucher(null);
            setProcessingVoucher(null);
          }, 500); // Clear processing state after completion
        }
      } else {
        try {
          await addVoucherVoyado(checkNumber);
        } catch (error) {
          console.error('Error adding voucher:', error);
        } finally {
          setTimeout(() => {
            setProcessingVoucher(null);
          }, 500); // Clear processing state after completion
        }
      }
    },
    [addVoucherVoyado, deleteVoucherVoyado],
  );

  const renderVouchers = useMemo(() => {
    if (!customer?.vouchers?.items) return null;

    return customer.vouchers.items.map((voucher, index) => {
      const isApplied = cart?.discountExternals?.some((v) => v.reference === voucher.id) ?? false;
      const isRemoving = removingVoucher === voucher.id;
      const isProcessing = processingVoucher === voucher.id;

      // Get the localized amount if available, otherwise fall back to base value
      const matchingLocal = voucher.localValues?.find((local) => local.currency === currency);
      const amount = matchingLocal ? matchingLocal.amount : voucher.value.amount;
      const voucherCurrency = matchingLocal ? matchingLocal.currency : voucher.value.currency;

      return (
        <div key={voucher.id} className={'contents'}>
          <div
            className={classNames('flex items-center text-secondary-800', { 'opacity-50': isRemoving || isProcessing })}
          >
            <span className={'mr-1 text-left'}>{t('member.bonus-check', { index: index + 1 })} </span>

            <span className={classNames({ 'opacity-50': isRemoving || isProcessing })}>
              {voucherCurrency === 'EUR' ? `${amount} €` : getAmount(Math.round(amount * 100), voucherCurrency)}
            </span>
          </div>
          <label className={'inline-flex cursor-pointer items-center justify-end'}>
            <input
              type={'checkbox'}
              checked={isApplied}
              onChange={() => handleToggleVoucher(voucher.id, voucher.checkNumber, isApplied)}
              value={''}
              className={'peer sr-only focus:outline-none'}
              disabled={!!removingVoucher || !!processingVoucher}
            />
            <div
              className={classNames(
                'relative h-6 w-11 rounded-full after:absolute after:start-[1px] after:top-[1px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[""] peer-checked:bg-seashell peer-checked:after:translate-x-full dark:bg-gray-200 dark:peer-checked:bg-green-900',
                {
                  'border border-gray-300 after:border after:border-gray-300 dark:peer-checked:border-green-900':
                    !isProcessing && !isRemoving,
                  'border !border-gray-500 after:border after:!border-gray-500': isProcessing || isRemoving,
                },
              )}
            ></div>
          </label>
        </div>
      );
    });
  }, [
    cart?.discountExternals,
    customer?.vouchers?.items,
    handleToggleVoucher,
    removingVoucher,
    processingVoucher,
    t,
    currency,
  ]);

  return loading ? <Loader inverted /> : <>{renderVouchers}</>;
};

export default BonusVoucherOptions;
