'use client';

import classNames from 'classnames';
import { useLocale } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SocialMediaLinks } from '@/src/components/footer/SocialMediaLinks';
import { useUser } from '@/src/context/authContext';
import { useIdentification } from '@/src/context/identificationContext';
import { onNewsletterFormSubmit } from '@/src/lib/actions/newsletter';
import { type ISocialMedia } from '@/src/lib/framework/SocialMedia/domain/entities/ISocialMedia';
import { Button } from '../../shadcn/button';

interface ICtaNewsletter {
  title: string;
  subtitle: string;
  socialMediaLinks?: ISocialMedia[];
  className?: string;
}

interface IForm {
  email: string;
}

export const CtaNewsletter: React.FC<ICtaNewsletter> = (props) => {
  const { isSignedIn } = useUser();
  const { getTokenPayload } = useIdentification();
  const { identifyWithEmail } = useIdentification();
  const { title, subtitle, socialMediaLinks, className } = props;

  const contact = getTokenPayload();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showComponent, setShowComponent] = useState(false);
  const { handleSubmit, register } = useForm<IForm>();

  const locale = useLocale();

  useEffect(() => {
    if (!isSignedIn && !contact?.contactId) {
      setShowComponent(true);
    }
  }, [isSignedIn, contact?.contactId]);

  const onFormSubmit = ({ email }: IForm) => {
    setIsLoading(true);
    onNewsletterFormSubmit(email, locale)
      .then((result) => setIsSubscribed(result))
      .then(() => identifyWithEmail(email))
      .finally(() => setIsLoading(false));
  };
  const isShow = useMemo(
    () => isSignedIn || !showComponent || contact?.contactId,
    [isSignedIn, showComponent, contact?.contactId],
  );

  if (isShow) return null;

  return (
    <div className={classNames('px-5 py-10 text-center text-white', className)}>
      <div className={'mx-auto max-w-3xl'}>
        <h4 className={'mb-4 font-serif text-4xl leading-tight lg:text-5xl'}>{title}</h4>
        <p className={'mx-auto mb-6 max-w-2xl text-sm font-light'}>{subtitle}</p>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className={
            'mx-auto mb-16 flex w-full flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center md:max-w-lg'
          }
        >
          <div className={'w-full flex-1'}>
            <input
              {...register('email', { required: true })}
              name={'email'}
              type={'email'}
              placeholder={'EMAIL'}
              required
              autoComplete={'off'}
              className={
                'h-10 w-full bg-white px-2 py-1.5 text-xs uppercase tracking-wider text-black placeholder:text-gray-500 focus:outline-none md:px-4 md:py-2'
              }
            />
          </div>

          <Button
            type={'submit'}
            loading={isLoading}
            size={'lg'}
            disabled={isSubscribed}
            className={'w-full bg-creme font-medium uppercase tracking-wider text-black hover:bg-creme sm:w-auto'}
          >
            {isSubscribed ? 'SUBSCRIBED!' : 'SUBSCRIBE'}
          </Button>
        </form>

        <SocialMediaLinks socialMediaLinks={socialMediaLinks} />
      </div>
    </div>
  );
};
