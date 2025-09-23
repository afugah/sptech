'use client';

import { useLocale, useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '@/src/components/ui/Button';
import FormErrorMessage from '@/src/components/ui/FormError/FormErrorMessage';
import { Input } from '@/src/components/ui/Input';
import { SuccessMessage } from '@/src/components/ui/SuccessMessage';
import { useVoyado } from '@/src/context/voyadoContext';
import { validatePhoneNumber } from '@/src/helpers/phoneNumbers';
import { type IVoyado } from '@/src/lib/framework/Voyado/types/IVoyado';
import { setNewPersonalData } from '../action';

interface IPersonalDetailsForm {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  mobilePhone?: string;
}

const PersonalDetailsForm: React.FC<IPersonalDetailsForm> = ({ firstName, lastName, email, mobilePhone }) => {
  const t = useTranslations();

  const { customer, init } = useVoyado();
  const [successMessage, setSuccessMessage] = useState('');
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const locale = useLocale();
  const methods = useForm<IPersonalDetailsForm>({
    values: {
      firstName: firstName || '',
      lastName: lastName || '',
      email,
      mobilePhone: mobilePhone || '',
    },
  });
  const {
    handleSubmit,
    getValues,
    register,
    formState: { errors },
    watch,
  } = methods;
  const watchedFirstName = watch('firstName');
  const watchedLastName = watch('lastName');
  const watchedEmail = watch('email');
  const watchedMobilePhone = watch('mobilePhone');

  const isButtonDisabled = useMemo(() => {
    return (
      firstName === watchedFirstName &&
      lastName === watchedLastName &&
      email === watchedEmail &&
      mobilePhone === watchedMobilePhone
    );
  }, [firstName, lastName, email, mobilePhone, watchedFirstName, watchedLastName, watchedEmail, watchedMobilePhone]);

  const onSubmit = async (data: IPersonalDetailsForm) => {
    setIsLoading(true);
    setSuccessMessage('');
    setLocalError('');

    if (data.mobilePhone && !validatePhoneNumber(data.mobilePhone, locale)) {
      setLocalError(t('account.validation.phone'));
      setIsLoading(false);
      return;
    }
    if (customer?.contactId) {
      await setNewPersonalData(customer.contactId, data as IVoyado.Contact['attributes'])
        .then((res: IVoyado.Contact) => {
          init(res.attributes.email);
          setSuccessMessage(t('account.your-profile-data-has-been-reset'));
        })
        .catch((error) => {
          setLocalError(error.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    setIsLoading(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className={'w-1/2 bg-seashell p-6 max-md:w-full'}>
        <h3 className={'mb-4 text-sm text-black'}>{t('member.personal-settings')}</h3>
        <div className={'flex flex-col gap-y-5'}>
          {successMessage && <SuccessMessage> {successMessage}</SuccessMessage>}
          {localError && <FormErrorMessage className={'mt-5 !justify-start'} message={localError} />}

          <Input
            {...register('firstName', {
              required: { value: true, message: t('account.validation.first-name-required') },
            })}
            label={t('member.first-name')}
            className={'text-sm'}
            inputClassName={'bg-white text-sm'}
            labelClassName={'bg-white text-sm'}
            value={getValues('firstName') || ''}
            error={errors.firstName?.message}
          />

          <Input
            {...register('lastName', {
              required: { value: true, message: t('account.validation.last-name-required') },
            })}
            label={t('member.last-name')}
            className={'text-sm'}
            inputClassName={'text-sm'}
            labelClassName={'bg-white text-sm'}
            value={getValues('lastName') || ''}
            error={errors.lastName?.message}
          />

          <Input
            {...register('email', {
              required: { value: true, message: t('account.validation.email-required') },
            })}
            label={t('account.email')}
            type={'email'}
            className={'text-sm'}
            inputClassName={'bg-white text-sm'}
            labelClassName={'bg-white text-sm'}
            value={getValues('email')}
            error={errors.email?.message}
          />

          <Input
            {...register('mobilePhone', {
              required: { value: true, message: t('account.validation.phone-number-required') },
            })}
            label={t('member.mobile-number')}
            className={'text-sm'}
            inputClassName={'bg-white text-sm'}
            labelClassName={'bg-white text-sm'}
            value={getValues('mobilePhone')}
            error={errors.mobilePhone?.message}
          />

          <Button
            disabled={isButtonDisabled}
            buttonType={Button.Type.Filled}
            loading={isLoading}
            buttonColor={Button.Color.Dark}
            type={'submit'}
          >
            {t('common.save')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default PersonalDetailsForm;
