'use client';

import classNames from 'classnames';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getOrCreateContactForRegister } from '@/src/components/profile/settings/auth';
import { Button } from '@/src/components/ui/Button';
import Checkbox from '@/src/components/ui/Checkbox/Checkbox';
import FormErrorMessage from '@/src/components/ui/FormError/FormErrorMessage';
import { SuccessMessage } from '@/src/components/ui/SuccessMessage';
import { useUser } from '@/src/context/authContext';
import { useUserDrawer } from '@/src/context/userDrawerContext';
import { isValidSSN } from '@/src/helpers/Identity';
import { validatePasswords } from '@/src/helpers/password';
import { validatePhoneNumber } from '@/src/helpers/phoneNumbers';
import { Link } from '@/src/i18n/navigation';
import { auth } from '@/src/lib/configuration/auth';
import { type IVoyado } from '@/src/lib/framework/Voyado/types/IVoyado';
import { UserModalViewEnum } from '@/src/lib/types/common';
import FloatingLabelInput from '../../../ui/Checkbox/Input';

interface IRegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  repeatPassword: string;
  personalIdentityNumber?: string;
}

interface IRegister {
  withHeaderImage?: boolean;
  withDescription?: boolean;
  defaultValues?: IVoyado.Contact;
}

const Register: React.FC<IRegister> = ({ withHeaderImage = true, withDescription = true, defaultValues }) => {
  const t = useTranslations('account');

  const { setShowView, setShowRegistrationMessage } = useUserDrawer();
  const { register, handleSubmit, getValues, watch } = useForm<IRegistrationForm>({
    defaultValues: {
      firstName: defaultValues?.attributes?.firstName || '',
      lastName: defaultValues?.attributes?.lastName || '',
      email: defaultValues?.attributes?.email || '',
      phone: defaultValues?.attributes?.mobilePhone || '',
      password: '',
      repeatPassword: '',
      personalIdentityNumber: (defaultValues?.attributes?.socialSecurityNumber as string) || '',
    },
  });

  const [checked, setChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { isLoading } = useUser();
  const locale = useLocale();
  const [isSuccess, setIsSuccess] = useState(false);
  const password = watch('password');
  const repeatPassword = watch('repeatPassword');

  const onSubmit = async (formData: IRegistrationForm) => {
    if (!checked) {
      setErrorMessage(t('validation.accept-terms'));
      return;
    }

    if (!validatePhoneNumber(formData.phone, locale)) {
      setErrorMessage(t('validation.phone'));
      return;
    }

    if (
      locale.toLocaleLowerCase() === 'se' &&
      formData.personalIdentityNumber &&
      !isValidSSN(formData.personalIdentityNumber)
    ) {
      setErrorMessage(t('validation.ssn'));
      return;
    }

    if (
      validatePasswords(
        password,
        repeatPassword,
        {
          notMatch: t('password-validation.not-match'),
          requirements: t('password-validation.requirements'),
        },
        setErrorMessage,
      )
    ) {
      setErrorMessage('');

      const userData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        personalIdentityNumber: formData.personalIdentityNumber,
      };

      try {
        const isFirebaseUser = await fetchSignInMethodsForEmail(auth, userData.email);
        const { success, message } = await getOrCreateContactForRegister({ ...userData }, locale);
        if (success) {
          if (!isFirebaseUser.length) {
            await createUserWithEmailAndPassword(auth, formData.email, formData.password);
          }
          setSuccess();
        } else if (message) {
          setErrorMessage(message);
        } else {
          setErrorMessage(t('failed-to-register-error-message'));
        }
      } catch (error) {
        if (error instanceof FirebaseError) {
          switch (error.code) {
            case 'auth/email-already-in-use':
              console.warn(
                '[Register] Email already in use, but the user was successfully created.',
                'Might require to reset the password.',
              );
              setErrorMessage(t('email-already-in-use-error-message'));
              break;

            default:
              setErrorMessage(t('failed-to-register-error-message'));
          }
        } else {
          setErrorMessage(t('failed-to-register-error-message'));
        }
      }
    }
  };

  const setSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setShowView(UserModalViewEnum.LOGIN);
      setShowRegistrationMessage(t('you-are-now-registered-message'));
    }, 3000);
  };

  return (
    <div className={'h-full w-full opacity-100'}>
      {withHeaderImage && (
        <Image
          src={'/images/sign-up.png'}
          alt={'register'}
          width={600}
          height={300}
          className={'h-auto w-full bg-cover'}
        />
      )}

      <div className={'flex flex-col justify-between gap-5 p-6'}>
        <h2 className={'text-center text-2xl'}>{t('join-us')}</h2>

        {withDescription && <p className={'mb-5 text-center'}>{t('become-a-member-and-enjoy-exclusive-benefits')}</p>}

        {isSuccess && <SuccessMessage>{t('registration-success-message')}</SuccessMessage>}

        {errorMessage && <FormErrorMessage message={errorMessage} />}
        <div className={'mt-10 flex flex-col gap-10'}>
          <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-10'}>
            <FloatingLabelInput
              {...register('firstName', { required: t('validation.first-name-required') })}
              label={t('first-name')}
              type={'text'}
              defaultFocused={!!getValues('firstName')}
              autoComplete={'given-name'}
              required
            />

            <FloatingLabelInput
              {...register('lastName', { required: t('validation.last-name-required') })}
              label={t('last-name')}
              type={'text'}
              defaultFocused={!!getValues('lastName')}
              autoComplete={'family-name'}
              required
            />

            <FloatingLabelInput
              {...register('email', { required: t('validation.email-required') })}
              label={t('email')}
              type={'email'}
              defaultFocused={!!getValues('email')}
              autoComplete={'email'}
              required
            />

            <FloatingLabelInput
              {...register('phone', {
                required: t('validation.phone-number-required'),
              })}
              label={t('phone-number')}
              defaultFocused={!!getValues('phone')}
              placeholder={'+46 70 XXX XX XX'}
              type={'tel'}
              autoComplete={'tel'}
              required
            />

            {locale.toLowerCase() === 'se' && (
              <FloatingLabelInput
                {...register('personalIdentityNumber', { required: t('validation.ssn-required') })}
                label={t('personal-identity-number')}
                placeholder={'AAAAMMDD - NNNN'}
                defaultFocused={!!getValues('personalIdentityNumber')}
                type={'text'}
                required
              />
            )}

            <FloatingLabelInput
              {...register('password', { required: t('validation.password-required') })}
              label={t('password')}
              type={'password'}
              defaultFocused={!!getValues('password')}
              autoComplete={'new-password'}
              required
            />

            <FloatingLabelInput
              {...register('repeatPassword', { required: t('validation.repeat-password') })}
              label={t('repeat-password')}
              type={'password'}
              defaultFocused={!!getValues('repeatPassword')}
              autoComplete={'new-password'}
              required
            />

            <div className={'mt-5 flex items-center justify-between'}>
              <Checkbox
                checked={checked}
                handleOnChange={(e) => {
                  setChecked(e.target.checked);
                }}
                label={t('i-agree-to-the-terms-and-conditions')}
              />
              <Link href={t('need-help-link')}>
                <button type={'button'} className={'font-sans text-sm text-black underline'}>
                  {t('need-help')}
                </button>
              </Link>
            </div>

            <Button
              disabled={isSuccess}
              type={'submit'}
              className={classNames('mt-5', {
                'border-green bg-green': isSuccess,
              })}
              loading={isLoading}
              buttonType={Button.Type.Filled}
              buttonColor={Button.Color.Dark}
            >
              {isSuccess ? t('registration-successful') : t('sign-up')}
            </Button>
          </form>

          <div className={'flex flex-col gap-5'}>
            <Button
              type={'button'}
              onClick={() => setShowView(UserModalViewEnum.LOGIN)}
              buttonType={Button.Type.Outline}
              buttonColor={Button.Color.Dark}
            >
              {t('already-a-member-log-in')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
