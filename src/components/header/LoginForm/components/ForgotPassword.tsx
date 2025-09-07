'use client';

import { useTranslations } from 'next-intl';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/src/components/ui/Button';
import FloatingLabelInput from '@/src/components/ui/Checkbox/Input';
import FormErrorMessage from '@/src/components/ui/FormError/FormErrorMessage';
import { usePage } from '@/src/context/pageContext';

interface IForm {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const t = useTranslations('forgot-password');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { userMigrationEmail, setUserMigrationEmail } = usePage();
  const userMigrationEmailRef = useRef(userMigrationEmail);

  const { handleSubmit, register } = useForm<IForm>({
    defaultValues: {
      email: userMigrationEmailRef.current,
    },
  });

  useEffect(() => {
    setUserMigrationEmail('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [error, setError] = useState('');

  const onFormSubmit = async ({ email }: IForm) => {
    setIsLoading(true);
    setError('');

    fetch(`/api/password/reset?email=${email}`).then(async (response) => {
      const data = await response.json();
      if (data.success) {
        setIsSubscribed(true);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setError(t('failed-to-restore-error-message'));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={`h-full w-full`}>
      <div className={'flex flex-col gap-y-10 p-6'}>
        <h2 className={'text-center font-serif text-2xl'}>{t('title')}</h2>
        <p className={'text-center'}>{userMigrationEmailRef.current ? t('alternative-subtitle') : t('sub-title')}</p>

        {error && <FormErrorMessage message={error} className={'my-5'} />}

        <FloatingLabelInput
          {...register('email', { required: true })}
          label={t('input.placeholder')}
          type={'email'}
          readOnly={!!userMigrationEmailRef.current}
          defaultFocused={!!userMigrationEmailRef.current}
          required
        />

        <Button type={'submit'} className={'w-full'} loading={isLoading} disabled={isSubscribed}>
          {isSubscribed ? t('status.success') : t('button-label')}
        </Button>
      </div>
    </form>
  );
};

export default ForgotPassword;
