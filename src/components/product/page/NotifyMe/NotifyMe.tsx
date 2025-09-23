'use client';

import ErrorIcon from '@images/icons/error.svg';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/src/components/ui/Button';
import Checkbox from '@/src/components/ui/Checkbox/Checkbox';
import { Input, InputVariantEnum } from '@/src/components/ui/Input';
import { Link } from '@/src/i18n/navigation';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { Drawer } from '../../../ui/Drawer';
import { notifyBackInStock } from './actions';
import { NotifyMeCard } from './components/NotifyMeCard';

interface INotifyMe {
  isOpen: boolean;
  product: IProduct;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedVariantSku: string;
}

interface NotifyMeFormValues {
  firstName: string;
  lastName: string;
  email: string;
  agreed: boolean;
}

const NotifyMe: React.FC<INotifyMe> = ({ product, isOpen, setIsOpen, selectedVariantSku }) => {
  const locale = useLocale();

  const t = useTranslations();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<NotifyMeFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      agreed: false,
    },
  });

  const onClose = () => {
    setIsError(false);
    setIsOpen(false);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const onSubmit = async ({ email }: NotifyMeFormValues) => {
    setIsLoading(true);
    setIsError(false);
    const requestData = {
      product_variant: selectedVariantSku,
      sku: product.sku,
      customer_email: email,
    };
    await notifyBackInStock(requestData, locale)
      .then((isSucceed: boolean) => {
        if (isSucceed) {
          setIsOpen(false);
        } else {
          setIsError(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Drawer
      onClose={onClose}
      open={isOpen}
      className={'bg-white'}
      bodyClassName={'bg-white'}
      title={t('product-page.notify-me')}
      subtitle={t('product-page.notify-me-subtitle')}
    >
      <div className={'px-14'}>
        <NotifyMeCard selectedVariantSku={selectedVariantSku} product={product} />

        <form onSubmit={handleSubmit(onSubmit)} className={'mt-5 flex flex-col gap-y-5'}>
          {/* <Input
            {...register('firstName', {
              required: { value: true, message: `${t('account.validation.first-name-required')}` },
            })}
            inputVariant={InputVariantEnum.Underline}
            required
            label={t('account.first-name')}
            error={errors.firstName?.message}
          />

          <Input
            {...register('lastName', {
              required: { value: true, message: `${t('account.validation.last-name-required')}` },
            })}
            inputVariant={InputVariantEnum.Underline}
            required
            label={t('account.last-name')}
            error={errors.lastName?.message}
          /> */}

          <Input
            {...register('email', {
              required: { value: true, message: 'Email is required' },
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: `${t('account.validation.email-required')}` },
            })}
            inputVariant={InputVariantEnum.Underline}
            required
            label={t('account.email')}
            type={'email'}
            error={errors.email?.message}
          />

          <div className={'flex items-center justify-start'}>
            <Checkbox
              {...register('agreed', {
                required: { value: true, message: `${t('gift-card.validation.this-field-is-required')}` },
              })}
              label={
                <div className={'text-sm'}>
                  {t('newsletter.terms-label')}{' '}
                  <Link href={'#'} target={'_blank'} rel={'noopener noreferrer'} className={'text-black underline'}>
                    {t('newsletter.terms-link')}
                  </Link>
                </div>
              }
              error={errors.agreed?.message}
            />
          </div>

          <Button
            type={'submit'}
            className={'mt-5'}
            buttonType={Button.Type.Filled}
            buttonColor={Button.Color.Dark}
            loading={isLoading}
          >
            {t('product-page.notify-me')}
          </Button>
        </form>

        {isError && (
          <div className={'text-input-error mt-2 flex items-center gap-x-2 text-sm'}>
            <ErrorIcon />
            <span>An error occurred</span>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default NotifyMe;
