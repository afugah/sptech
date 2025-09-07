'use client';

import { confirmPasswordReset } from 'firebase/auth';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/src/components/ui/Button';
import FloatingLabelInput from '@/src/components/ui/Checkbox/Input';
import FormErrorMessage from '@/src/components/ui/FormError/FormErrorMessage';
import { validatePasswords } from '@/src/helpers/password';
import { Link } from '@/src/i18n/navigation';
import { auth } from '@/src/lib/configuration/auth';

interface IResetPasswordForm {
  password: string;
  repeatPassword: string;
}

const ResetPassword: React.FC<{ oobCode: string | null }> = ({ oobCode }) => {
  const t = useTranslations('account');

  const { register, handleSubmit, watch } = useForm<IResetPasswordForm>();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const password = watch('password');
  const repeatPassword = watch('repeatPassword');

  const onSubmit = async (formData: IResetPasswordForm) => {
    setIsLoading(true);
    if (
      validatePasswords(
        password,
        repeatPassword,
        {
          notMatch: t('password-validation.not-match'),
          requirements: t('password-validation.requirements'),
        },
        setErrorMessage,
      ) &&
      oobCode
    ) {
      try {
        await confirmPasswordReset(auth, oobCode, formData.password);
        setSuccessMessage(t('your-password-has-been-reset'));
        setIsLoading(false);
      } catch (error) {
        const firebaseError = error as { code?: string };
        if (firebaseError.code === 'auth/invalid-action-code') {
          setErrorMessage(t('please-try-to-get-a-new-password-reset-link'));
        }
      }
    }
  };

  return (
    <div className={'container mb-60 mt-5 flex flex-col items-center gap-10 text-center'}>
      <h2 className={'text-2xl'}>{t('reset-your-password')}</h2>
      {errorMessage && <FormErrorMessage message={errorMessage} />}
      {successMessage && <div className={'text-green-500'}>{successMessage}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className={'flex w-full flex-col gap-10 lg:w-1/3'}>
        <FloatingLabelInput
          {...register('password', { required: t('validation.password-required') })}
          label={t('new-password')}
          autoComplete={'new-password'}
          type={'password'}
          required
        />
        <FloatingLabelInput
          {...register('repeatPassword', { required: t('validation.repeat-password') })}
          label={t('repeat-new-password')}
          autoComplete={'new-password'}
          type={'password'}
          required
        />

        {!successMessage && (
          <Button type={'submit'} className={'mt-5'} buttonType={Button.Type.Filled} buttonColor={Button.Color.Dark}>
            {t('update-password')}
          </Button>
        )}

        <Link href={'/'}>
          <Button className={`w-full ${isLoading ? 'pointer-events-none' : 'pointer-events-auto'}`}>
            {t('take-me-back-home')}
          </Button>
        </Link>
      </form>
    </div>
  );
};

export default ResetPassword;
