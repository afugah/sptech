import { StoryblokComponent } from '@storyblok/react';
import React, { type ReactNode } from 'react';
import { IntroModalBlock } from '@/src/components/blocks/IntroModalBlock';
import { Footer } from '@/src/components/footer/Footer';
import { di } from '@/src/lib/di';
import { FooterService } from '@/src/lib/framework/Footer/services/FooterService';
import { SocialMediaService } from '@/src/lib/framework/SocialMedia/services/SocialMediaService';
import { type Config } from '@/src/types/framework/storyblok-components';
import InfoBar from '../blocks/Header/InfoBar';
import CountrySelector from '../countrySelect/CountrySelector';
import LoginForm from '../header/LoginForm';

interface IProps {
  children: ReactNode;
  isCtaNewsletterShow?: boolean;
  locale?: string;
  config?: {
    name: string;
    content: Config;
  } | null;
}

const DefaultLayout: React.FC<IProps> = async ({ children, config, locale, isCtaNewsletterShow = true }) => {
  // Allow layout to render even without config - just skip config-dependent features

  // Fetch footer data from PayloadCMS
  let footerData = null;
  try {
    const footerService = di.resolve(FooterService);
    footerData = await footerService.getFooterData(locale);
  } catch (error) {
    console.error('Error fetching footer data:', error);
    // Continue with null footerData - footer will handle gracefully
  }

  // Fetch social media links from PayloadCMS
  let socialMediaLinks = null;
  try {
    const socialMediaService = di.resolve(SocialMediaService);
    socialMediaLinks = await socialMediaService.getSocialMediaLinks(locale);
  } catch (error) {
    console.error('Error fetching social media links:', error);
    // Continue with null socialMediaLinks - footer will handle gracefully
  }

  // TODO: remove this when infobar is implemented correctly. We might need to move this so that the fixed header works
  const showInfobar = false;

  return (
    <div>
      {config && !!config.content.infoBar?.length && showInfobar && (
        <div className={'relative'}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <InfoBar blok={config.content.infoBar[0] as any} />
        </div>
      )}

      {config && !!config.content.intro_modal?.[0] && showInfobar && (
        <div className={'relative'}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <IntroModalBlock blok={config.content.intro_modal[0] as any} />
        </div>
      )}

      {config && !!config.content.infoBarUnder?.length && showInfobar && (
        <div className={'relative'}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <InfoBar blok={config.content.infoBarUnder[0] as any} />
        </div>
      )}

      <CountrySelector />
      <LoginForm />
      {children}
      <div className={'relative'}>
        {config && !!config.content.usp && config.content.usp.length > 0 && (
          <StoryblokComponent blok={config.content.usp[0]} key={config.content.usp[0]._uid} />
        )}
      </div>
      <Footer
        isCtaNewsletterShow={isCtaNewsletterShow}
        footerData={footerData}
        socialMediaLinks={socialMediaLinks ?? undefined}
        logos={config?.content.logos}
      />
    </div>
  );
};

export default DefaultLayout;
