'use client';

import { fetchSignInMethodsForEmail } from 'firebase/auth';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/src/components/ui/Button';
import Checkbox from '@/src/components/ui/Checkbox/Checkbox';
import FormErrorMessage from '@/src/components/ui/FormError/FormErrorMessage';
import { SuccessMessage } from '@/src/components/ui/SuccessMessage';
import { useCart } from '@/src/context/cartContext';
import { usePage } from '@/src/context/pageContext';
import { useUserDrawer } from '@/src/context/userDrawerContext';
import { checkVoyadoEmailIsMember } from '@/src/helpers/Identity';
import { usePathname, useRouter } from '@/src/i18n/navigation';
import { Link } from '@/src/i18n/navigation';
import { auth } from '@/src/lib/configuration/auth';
import { UserModalViewEnum } from '@/src/lib/types/common';
import FloatingLabelInput from '../../../ui/Checkbox/Input';

interface IForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const t = useTranslations('account');

  const router = useRouter();
  const pathname = usePathname();

  const { setShowView, showRegistrationMessage, setShowRegistrationMessage } = useUserDrawer();
  const { register, handleSubmit } = useForm<IForm>();
  const [checked, setChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { setUserMigrationEmail } = usePage();
  const { startSessionWithNewMemberLevel, cart } = useCart();
  useEffect(() => {
    return () => {
      setShowRegistrationMessage('');
    };
  }, [setShowRegistrationMessage]);

  const onSubmit = async (formData: IForm) => {
    setLocalError(null);
    setIsLoading(true);
    setShowRegistrationMessage('');

    try {
      const [isVoyadoMember, signInMethods] = await Promise.all([
        checkVoyadoEmailIsMember(formData.email),
        fetchSignInMethodsForEmail(auth, formData.email),
      ]);

      if (!isVoyadoMember) return handleInvalidLogin();

      if (signInMethods.length > 0) return await handleSignIn(formData);

      return handleUserMigration(formData.email);
    } catch {
      setLocalError(t('an-error-occurred-during-sign-in'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (formData: IForm) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) return handleInvalidLogin();

      setShowView(null);
      if (!pathname.startsWith('/checkout')) {
        router.replace('/profile');
      }
    } catch {
      setLocalError(t('an-error-occurred-during-sign-in'));
    } finally {
      await startSessionWithNewMemberLevel(cart);
    }
  };

  const handleUserMigration = (email: string) => {
    setUserMigrationEmail(email);
    setShowView(UserModalViewEnum.FORGOT_PASSWORD);
  };

  const handleInvalidLogin = () => {
    setLocalError(t('invalid-login-credentials'));
  };

  return (
    <div className={'h-full w-full opacity-100'}>
      <Image src={'/images/sign-in.png'} alt={'login'} width={600} height={300} className={'object-cover'} />

      <div className={'flex flex-col justify-between gap-5 p-6'}>
        <h2 className={'text-center text-2xl'}>{t('welcome')}</h2>
        <p className={'text-center'}>{t('login-description')}</p>

        {showRegistrationMessage && <SuccessMessage>{showRegistrationMessage}</SuccessMessage>}
        {localError && <FormErrorMessage className={'mt-5 !justify-start'} message={localError} />}

        <div className={'mt-5 flex flex-col gap-10'}>
          <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-10'}>
            <FloatingLabelInput
              {...register('email', { required: true })}
              label={t('email')}
              type={'email'}
              autoComplete={'email'}
              required
            />

            <FloatingLabelInput
              {...register('password', { required: true })}
              name={'password'}
              label={t('password')}
              type={'password'}
              autoComplete={'current-password'}
              required
            />

            <div className={'flex items-center justify-between'}>
              <Checkbox
                checked={checked}
                handleOnChange={(e) => {
                  setChecked(e.target.checked);
                }}
                label={t('keep-me-signed-in')}
              />
              <button
                type={'button'}
                onClick={() => setShowView(UserModalViewEnum.FORGOT_PASSWORD)}
                className={'font-sans text-sm text-black underline'}
              >
                {t('forgot-your-password')}
              </button>
            </div>

            <Button
              type={'submit'}
              className={'mt-5'}
              loading={isLoading}
              buttonType={Button.Type.Filled}
              buttonColor={Button.Color.Dark}
            >
              {t('login-text')}
            </Button>
          </form>

          <div className={'flex flex-col gap-5'}>
            <Button
              type={'button'}
              onClick={() => setShowView(UserModalViewEnum.SIGN_UP)}
              buttonType={Button.Type.Outline}
              buttonColor={Button.Color.Dark}
            >
              {t('become-a-member')}
            </Button>
          </div>

          <div className={'flex flex-col gap-y-2'}>
            <div className={'text-center'}>
              <Link href={t('info-about-membership-link')} className={'text-black underline'}>
                {t('info-about-membership')}
              </Link>
            </div>

            <div className={'text-center'}>
              <Link href={'/register'} className={'text-black underline'}>
                {t('member-in-store')}
              </Link>
            </div>

            <div className={'text-center'}>
              <span>{t('do-you-only-want-newsletters')}</span>
              <span> </span>
              <button
                type={'button'}
                className={'ml-1 text-black underline'}
                onClick={() => setShowView(UserModalViewEnum.NEWSLETTER_SIGN_UP)}
              >
                {t('sign-up-here')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
