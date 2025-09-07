import Image from 'next/image';
import { type LogoItem } from '@/src/types/framework/storyblok-components';
import { type StoryblokImage } from '@/src/types/framework/storyblok-helpers';

interface FooterLogosProps {
  logos?: LogoItem[];
}

export const FooterLogos: React.FC<FooterLogosProps> = ({ logos = [] }) => {
  if (!logos || logos.length === 0) return null;

  const [firstLogo, ...remainingLogos] = logos;

  return (
    <div className={'flex flex-col items-center gap-8'}>
      {firstLogo && (firstLogo.logo as StoryblokImage)?.filename && (
        <div className={'mb-20'}>
          <Image
            src={(firstLogo.logo as StoryblokImage).filename || ''}
            alt={(firstLogo.logo as StoryblokImage).alt || 'Logo'}
            width={180}
            height={180}
            className={'inline-block align-middle'}
          />
        </div>
      )}

      {remainingLogos.length > 0 && (
        <div className={'grid max-w-4xl grid-cols-3 items-center justify-center gap-6 md:flex md:flex-wrap md:gap-16'}>
          {remainingLogos.map((logo: LogoItem) =>
            (logo.logo as StoryblokImage)?.filename ? (
              <div key={logo._uid} className={'flex justify-center'}>
                <Image
                  src={(logo.logo as StoryblokImage).filename || ''}
                  alt={(logo.logo as StoryblokImage).alt || 'Logo'}
                  width={130}
                  height={40}
                  className={'inline-block align-middle'}
                />
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
};
export default FooterLogos;
