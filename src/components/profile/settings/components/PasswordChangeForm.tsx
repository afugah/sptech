'use client';

import { signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '@/src/components/ui/Button';
import FormErrorMessage from '@/src/components/ui/FormError/FormErrorMessage';
import { Input } from '@/src/components/ui/Input';
import { SuccessMessage } from '@/src/components/ui/SuccessMessage';
import { useUser } from '@/src/context/authContext';
import { validatePasswords } from '@/src/helpers/password';
import { auth } from '@/src/lib/configuration/auth';

interface FormData {
  currentPassword: string;
  newPassword: string;
  repeatNewPassword: string;
}

const PasswordChangeForm: React.FC = () => {
  const methods = useForm<FormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      repeatNewPassword: '',
    },
  });

  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = methods;
  const { user } = useUser();
  const t = useTranslations();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const watchedCurrentPassword = watch('currentPassword');
  const watchedNewPassword = watch('newPassword');
  const watchedRepeatNewPassword = watch('repeatNewPassword');

  const isButtonDisabled = useMemo(() => {
    return !watchedCurrentPassword || !watchedNewPassword || !watchedRepeatNewPassword;
  }, [watchedCurrentPassword, watchedNewPassword, watchedRepeatNewPassword]);

  const onSubmit = async (data: FormData) => {
    setErrorMessage('');
    setIsLoading(true);
    const { currentPassword, newPassword, repeatNewPassword } = data;

    if (!user || !user.email) {
      setErrorMessage(t('account.error-no-user'));
      setIsLoading(false);
      return;
    }

    if (
      validatePasswords(
        newPassword,
        repeatNewPassword,
        {
          notMatch: t('account.password-validation.not-match'),
          requirements: t('account.password-validation.requirements'),
        },
        setErrorMessage,
      )
    ) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, user.email, currentPassword);

        if (userCredential.user) {
          await updatePassword(userCredential.user, newPassword);
          setSuccessMessage(t('account.your-password-has-been-reset'));
          reset();
        }
      } catch {
        setErrorMessage(t('account.password-change-error'));
      } finally {
        setIsLoading(false);
      }
    }
    setIsLoading(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className={'flex w-1/2 flex-col bg-seashell p-6 max-md:w-full'}>
        <h3 className={'mb-4 text-sm text-black'}>{t('account.password-change')}</h3>
        <div className={'flex flex-1 flex-col justify-between max-md:h-full'}>
          {errorMessage && <FormErrorMessage message={errorMessage} />}
          {successMessage && <SuccessMessage className={'mb-0'}> {successMessage}</SuccessMessage>}
          <div className={'flex flex-col gap-y-5'}>
            <Input
              {...register('currentPassword', {
                required: { value: true, message: t('account.validation.current-password-required') },
              })}
              autoComplete={'current-password'}
              label={t('account.current-password')}
              className={'bg-white'}
              type={'password'}
              inputClassName={'text-sm'}
              labelClassName={'text-sm'}
              error={errors.currentPassword?.message}
            />

            <Input
              {...register('newPassword', {
                required: { value: true, message: t('account.validation.new-password-required') },
              })}
              autoComplete={'new-password'}
              label={t('account.new-password')}
              className={'bg-white'}
              type={'password'}
              inputClassName={'text-sm'}
              labelClassName={'text-sm'}
              error={errors.newPassword?.message}
            />

            <Input
              {...register('repeatNewPassword', {
                required: { value: true, message: t('account.validation.repeat-password-required') },
              })}
              autoComplete={'new-password'}
              label={t('account.repeat-new-password')}
              className={'bg-white'}
              type={'password'}
              inputClassName={'text-sm'}
              labelClassName={'text-sm'}
              error={errors.repeatNewPassword?.message}
            />
          </div>
          <Button
            className={'max-md:mt-10'}
            buttonType={Button.Type.Filled}
            buttonColor={Button.Color.Dark}
            disabled={isButtonDisabled}
            type={'submit'}
            loading={isLoading}
          >
            {successMessage ? successMessage : t('common.save')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default PasswordChangeForm;
