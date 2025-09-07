import { StoryblokComponent } from '@storyblok/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React from 'react';
import { type StoryblokRichtext } from '@/.storyblok/types/storyblok';
import { type CmsPage } from '@/src/types/framework/storyblok-components';
import { type StoryblokImage } from '@/src/types/framework/storyblok-helpers';
import { renderRichContent, richContentPresets } from '@/src/utils/storyblok/renderRichContent';
import ProductModal from './ProductModal';

interface SizeGuideModalProps {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  sizeGuideStory?: {
    content: CmsPage;
  };
}

const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isVisible, setIsVisible, sizeGuideStory }) => {
  const t = useTranslations();

  if (!sizeGuideStory) {
    return null;
  }

  const {
    title,
    tipsTitle,
    tips,
    sectionTitle,
    guides,
    image,
    supportMessage,
    image2,
    textBelowImage,
    introText,
    sectionText,
  } = sizeGuideStory.content;

  return (
    <ProductModal isVisible={isVisible} setIsVisible={setIsVisible} title={t('view-size-guide')}>
      <div className={'mb-6 text-center lg:px-12'}>
        <h2 className={'text-center font-sans text-3xl font-bold'}>{title}</h2>
        {typeof introText === 'string' && introText && <p className={'mt-3 font-light'}>{introText}</p>}
        {typeof tipsTitle === 'string' && tipsTitle && <h6 className={'my-5 font-sans font-light'}>{tipsTitle}</h6>}
        {Array.isArray(tips) && tips && (
          <ul className={'list-disc pl-6'}>
            {tips?.map((tip: string, index: number) => (
              <li key={index} className={'mb-2 font-sans font-light'}>
                {tip}
              </li>
            ))}
          </ul>
        )}
        {typeof sectionTitle === 'string' && sectionTitle && (
          <h3 className={'mt-6 font-sans text-xl font-bold'}>{sectionTitle}</h3>
        )}
        {typeof sectionText === 'string' && sectionText && <p className={'mt-3 font-light'}>{sectionText}</p>}
        {Array.isArray(guides) && guides && (
          <div className={'mt-3'}>{guides?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}</div>
        )}
        {!!(image as StoryblokImage)?.filename && (
          <Image
            src={(image as StoryblokImage).filename || ''}
            height={500}
            width={500}
            alt={(image as StoryblokImage).name || ''}
            className={'mx-auto mt-6 max-w-full'}
          />
        )}
        {typeof textBelowImage === 'string' && textBelowImage && <p className={'mt-1 font-light'}>{textBelowImage}</p>}
        {!!(image2 as StoryblokImage)?.filename && (
          <Image
            src={(image2 as StoryblokImage).filename || ''}
            height={500}
            width={500}
            alt={(image2 as StoryblokImage).name || ''}
            className={'mx-auto mt-6 max-w-full'}
          />
        )}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {supportMessage && (supportMessage as any)?.content && (
          <div className={'mt-4 text-center font-light'}>
            {renderRichContent(supportMessage as StoryblokRichtext, richContentPresets.modal) as React.ReactNode}
          </div>
        )}
      </div>
    </ProductModal>
  );
};

export default SizeGuideModal;
