import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Button } from '@/components/shadcn/button';
import { type CmsPage } from '@/src/types/framework/storyblok-components';
import { type StoryblokImage } from '@/src/types/framework/storyblok-helpers';
import ProductModal from './ProductModal';

interface ProductFactsModalProps {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  story?: {
    content: CmsPage;
  };
}

const ProductFactsModal: React.FC<ProductFactsModalProps> = ({ isVisible, setIsVisible, story }) => {
  const t = useTranslations('');
  if (!story) return null;
  const { title, subtitle, summary, summaryTitle, image } = story.content;

  return (
    <ProductModal isVisible={isVisible} setIsVisible={setIsVisible} title={t('product-page.info.diamond-facts')}>
      <div className={'relative'}>
        {!!subtitle && (
          <h4
            className={'absolute left-0 right-0 top-0 z-0 text-center font-serif text-8xl text-creme text-opacity-60'}
          >
            {subtitle as string}
          </h4>
        )}

        {!!title && <h2 className={'relative z-10 pb-10 pt-6 text-center font-sans text-2xl'}>{title}</h2>}
      </div>
      <div className={'relative mb-64 mt-5'}>
        {!!image && (
          <Image
            src={(image as StoryblokImage)?.filename || ''}
            alt={'diamond-information'}
            width={400}
            height={250}
            className={'mx-auto mb-6 h-[250px]'}
          />
        )}
        <div className={'absolute top-52 mx-6 flex flex-col items-center justify-center bg-[#f0e7e2] p-3 md:mx-20'}>
          {!!summaryTitle && (
            <h3 className={'mb-2 font-serif text-lg font-bold md:text-xl'}>{summaryTitle as string}</h3>
          )}
          {!!summary && (
            <p className={'px-6 text-center font-sans text-sm leading-5 text-gray-800'}>{summary as string}</p>
          )}
          <Button className={'mt-4 px-12 uppercase'} variant={'default'} onClick={() => setIsVisible(false)}>
            {t('common.read-more')}
          </Button>
        </div>
      </div>
    </ProductModal>
  );
};

export default ProductFactsModal;
