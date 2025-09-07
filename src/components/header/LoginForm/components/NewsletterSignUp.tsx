'use client';

import { getStoryblokApi } from '@storyblok/react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/src/components/ui/Button';
import FloatingLabelInput from '@/src/components/ui/Checkbox/Input';
import { useIdentification } from '@/src/context/identificationContext';
import { onNewsletterFormSubmit } from '@/src/lib/actions/newsletter';
import { type Newsletter } from '@/src/types/framework/storyblok-components';
import { renderRichContent } from '@/src/utils/storyblok/renderRichContent';

interface IForm {
  email: string;
}

const NewsletterSignUp: React.FC = () => {
  const t = useTranslations();
  const [storyData, setStoryData] = useState<Newsletter | null>(null);

  const { identifyWithEmail } = useIdentification();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { handleSubmit, register } = useForm<IForm>();

  const locale = useLocale();

  useEffect(() => {
    const fetchStoryblokData = async () => {
      const storyblok = getStoryblokApi();
      try {
        const { data } = await storyblok.get(`cdn/stories/content/newsletter`, {
          version: 'published',
          language: locale,
        });
        setStoryData(data.story.content as Newsletter);
      } catch (error) {
        console.error('Error fetching newsletter data:', error);
      }
    };

    fetchStoryblokData();
  }, [locale]);

  const onFormSubmit = ({ email }: IForm) => {
    setIsLoading(true);
    onNewsletterFormSubmit(email, locale)
      .then((result) => setIsSubscribed(result))
      .then(() => identifyWithEmail(email))
      .finally(() => setIsLoading(false));
  };

  const RenderContent = storyData?.description.content?.[0]?.content
    ? renderRichContent(storyData.description, {
        paragraphClass: 'm-0',
      })
    : null;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={`h-full w-full`}>
      <Image
        src={storyData?.mainImage?.filename || '/images/sign-up.png'}
        alt={storyData?.mainImage?.alt || 'login'}
        width={600}
        height={300}
        className={'h-auto w-full bg-cover'}
      />

      <div className={'flex flex-col gap-y-10 p-8'}>
        <h2 className={'text-center font-serif text-2xl'}>{storyData?.title || t('newsletter.title')}</h2>
        <div className={'text-center text-sm'}>{RenderContent || t('newsletter.sub-title')}</div>

        <FloatingLabelInput
          {...register('email', { required: true })}
          label={t('newsletter.input.placeholder')}
          type={'email'}
          onChange={() => {}}
          required
        />

        <Button type={'submit'} className={'w-full'} loading={isLoading} disabled={isSubscribed}>
          {isSubscribed ? t('newsletter.status.success') : storyData?.buttonText || t('newsletter.button-label')}
        </Button>
      </div>
    </form>
  );
};

export default NewsletterSignUp;
