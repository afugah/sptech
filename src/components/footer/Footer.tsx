import { getTranslations } from 'next-intl/server';
import React from 'react';
// import { FooterLogos } from '@/src/components/footer/FooterLogos'; // Keeping old component for reference
import { PayloadFooterLogos } from '@/src/components/footer/PayloadFooterLogos';
import { PayloadFooterMenu } from '@/src/components/footer/PayloadFooterMenu';
import { type IFooter } from '@/src/lib/framework/Footer/domain/entities/IFooter';
import { type ISocialMedia } from '@/src/lib/framework/SocialMedia/domain/entities/ISocialMedia';
import { type LogoItem, type Menu } from '@/src/types/framework/storyblok-components';
import { CtaNewsletter } from '../ui/CtaNewsletter';

interface IFooterProps {
  logos?: LogoItem[]; // @deprecated - Now using PayloadFooterLogos which fetches data directly
  footerData?: IFooter | null;
  socialMediaLinks?: ISocialMedia[];
  isCtaNewsletterShow?: boolean;
  footer_menu?: Menu[] | undefined;
  _uid?: string;
  component?: string;
}

export const Footer: React.FC<IFooterProps> = async ({ footerData, socialMediaLinks, isCtaNewsletterShow }) => {
  const t = await getTranslations('newsletter');

  return (
    <footer className={'bg-gray-800 p-10 text-white md:p-20'}>
      {isCtaNewsletterShow && (
        <CtaNewsletter title={t('title')} subtitle={t('sub-title')} socialMediaLinks={socialMediaLinks} />
      )}
      <div className={'px-5'}>
        <div className={'mb-5 flex flex-col gap-y-16 text-sm uppercase'}>
          <PayloadFooterMenu footerData={footerData ?? null} />

          <div className={'flex flex-row flex-wrap items-center justify-center gap-8 lg:flex-row'}>
            <PayloadFooterLogos />
          </div>
        </div>
      </div>
    </footer>
  );
};
