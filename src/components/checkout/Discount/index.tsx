import { DialogTitle } from '@radix-ui/react-dialog';
import debounce from 'lodash.debounce';
import { useTranslations } from 'next-intl';
import React, { type ChangeEvent, useCallback, useMemo, useState } from 'react';
import { Button } from '@/src/components/shadcn/button';
import { DialogContent, DialogHeader, DialogTrigger } from '@/src/components/shadcn/dialog';
import { Input } from '@/src/components/shadcn/input';
import { useCheckout } from '@/src/context/checkoutContext';

const DiscountVoucherCode = () => {
  const [discountCode, setDiscountCode] = useState('');
  const [discountCodeError, setDiscountCodeError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { addDiscountCode } = useCheckout();
  const t = useTranslations();
  const getErrorMessage = useCallback(
    (error: string | undefined) => {
      switch (error) {
        case 'EXPIRED_DISCOUNT_CODE':
          return t('discount-code.expired');
        case 'MISSING_DISCOUNT_CODE':
          return t('discount-code.missing');
        case 'INACTIVE_DISCOUNT_CODE':
          return t('discount-code.inactive');
        case 'UPCOMING_DISCOUNT_CODE':
          return t('discount-code.upcoming');
        case 'CONSUMED_DISCOUNT_CODE':
          return t('discount-code.consumed');
        case 'ALREADY_ADDED_DISCOUNT_CODE':
          return t('discount-code.already-added');
        case 'MAX_DISCOUNT_CODES':
          return t('discount-code.max-codes');

        default:
          return t('discount-code.error');
      }
    },
    [t],
  );

  const onAddDiscountCode = useMemo(() => {
    return debounce(async (code: string) => {
      setIsLoading(true);
      await addDiscountCode(code)
        .then(() => {
          setDiscountCodeError(undefined);
        })
        .catch((err) => {
          setDiscountCodeError(err.message);
        })
        .catch((err) => setDiscountCodeError(err))
        .finally(() => {
          setIsLoading(false);
        });
    }, 500);
  }, [addDiscountCode]);

  const handleSetDiscountCode = useCallback(() => {
    onAddDiscountCode(discountCode);
  }, [discountCode, onAddDiscountCode]);

  const handleChangeDiscountCode = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDiscountCode(event.target.value);
    setDiscountCodeError('');
  }, []);

  return (
    <div>
      <form className={''}>
        <DialogTrigger className={' rounded-none'} asChild>
          <Button variant={'custom'} className={'text-xxs uppercase underline'}>
            {t('discount-code.trigger-text')}
          </Button>
        </DialogTrigger>
        <DialogContent className={' bg-white p-0  sm:max-w-[425px]  sm:rounded-none'}>
          <DialogHeader className={' flex items-center justify-center bg-alabaster py-5'}>
            <DialogTitle className={' font-sans text-sm uppercase tracking-wider'}>
              {t('discount-code.dialog-title')}
            </DialogTitle>
          </DialogHeader>
          <div className={'grid gap-4 bg-white px-3 py-4'}>
            <div className={'grid gap-3'}>
              <div className={'border-b border-black/80 '}>
                <Input
                  className={
                    ' px-0  outline-none placeholder:text-xxs placeholder:uppercase  focus:ring-0 focus-visible:ring-0'
                  }
                  id={'discount'}
                  name={'discount-code'}
                  placeholder={t('discount-code.discount-placeholder')}
                  value={discountCode}
                  onChange={handleChangeDiscountCode}
                />
              </div>
              <Button
                onClick={handleSetDiscountCode}
                variant={'custom'}
                disabled={isLoading}
                className={` ${discountCodeError ? 'bg-red-600' : 'bg-gray-800'} rounded-none  py-6 uppercase text-white`}
              >
                {isLoading
                  ? t('discount-code.sending')
                  : discountCodeError
                    ? getErrorMessage(discountCodeError)
                    : t('discount-code.add')}
              </Button>
            </div>
            <div className={'w-full space-y-3 pt-2'}>
              <div className={'border-b border-black/80 '}>
                <Input
                  className={
                    ' px-0 outline-none placeholder:text-xxs placeholder:uppercase   focus:ring-0 focus-visible:ring-0'
                  }
                  id={'name-1'}
                  name={'name'}
                  placeholder={t('discount-code.voucher-placeholder')}
                  defaultValue={''}
                />
              </div>
              <div className={'border-b border-black/80 '}>
                <Input
                  className={
                    ' px-0 outline-none placeholder:text-xxs placeholder:uppercase   focus:ring-0 focus-visible:ring-0'
                  }
                  id={'name-1'}
                  name={'name'}
                  placeholder={t('discount-code.pin-placeholder')}
                  defaultValue={''}
                />
              </div>
              <div className={'bprder w-full'}>
                <Button variant={'custom'} className={'w-full  rounded-none bg-gray-800 py-6 uppercase text-white'}>
                  {t('discount-code.add')}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </form>
    </div>
  );
};

export default DiscountVoucherCode;
