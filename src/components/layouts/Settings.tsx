import { StoryblokComponent } from '@storyblok/react';
import React, { type ReactNode } from 'react';
import { Footer } from '@/src/components/footer/Footer';
import { di } from '@/src/lib/di';
import { FooterService } from '@/src/lib/framework/Footer/services/FooterService';
import { type Config } from '@/src/types/framework/storyblok-components';
import InfoBar from '../blocks/Header/InfoBar';
import CountrySelector from '../countrySelect/CountrySelector';
import Header from '../header/Header';
import ProfileHeader from '../profile/profileHeader';

interface IProps {
  children: ReactNode;
  isCtaNewsletterShow?: boolean;
  locale?: string;
  config: {
    name: string;
    content: Config;
  };
}

const SettingsLayout: React.FC<IProps> = async ({ children, config, locale, isCtaNewsletterShow = true }) => {
  if (!config) return null;

  // Fetch footer data from PayloadCMS
  let footerData = null;
  try {
    const footerService = di.resolve(FooterService);
    footerData = await footerService.getFooterData(locale);
  } catch (error) {
    console.error('Error fetching footer data:', error);
    // Continue with null footerData - footer will handle gracefully
  }

  return (
    <div>
      {!!config.content.infoBar && (
        <>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <InfoBar blok={config.content.infoBar[0] as any} />
        </>
      )}

      <Header header_menu={config.content.header_menu} _uid={config.content._uid} component={'config'} />
      <CountrySelector />
      <ProfileHeader />
      {children}

      {!!config.content.usp && config.content.usp.length > 0 && (
        <StoryblokComponent blok={config.content.usp[0]} key={config.content.usp[0]._uid} />
      )}
      <Footer isCtaNewsletterShow={isCtaNewsletterShow} footerData={footerData} logos={config.content.logos} />
    </div>
  );
};

export default SettingsLayout;
