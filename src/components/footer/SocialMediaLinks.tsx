import FacebookIcon from '@/src/images/icons/facebook.svg';
import InstagramIcon from '@/src/images/icons/instagram.svg';
import LinkedInIcon from '@/src/images/icons/linkedin-in.svg';
import TwitterIcon from '@/src/images/icons/twitter.svg';
import { type ISocialMedia } from '@/src/lib/framework/SocialMedia/domain/entities/ISocialMedia';

interface SocialMediaLinksProps {
  socialMediaLinks?: ISocialMedia[];
}

// Fallback icon mapping using existing SVG files
const getPlatformIcon = (platform: string) => {
  const platformLower = platform.toLowerCase();

  switch (platformLower) {
    case 'facebook':
      return <FacebookIcon className={'fill-current h-5 w-5'} />;
    case 'instagram':
      return <InstagramIcon className={'fill-current h-5 w-5'} />;
    case 'twitter':
    case 'x':
      return <TwitterIcon className={'fill-current h-5 w-5'} />;
    case 'linkedin':
      return <LinkedInIcon className={'fill-current h-5 w-5'} />;
    default:
      return <span className={'text-xs font-bold'}>{platform.substring(0, 2).toUpperCase()}</span>;
  }
};

export const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({ socialMediaLinks = [] }) => {
  if (!socialMediaLinks || socialMediaLinks.length === 0) return null;

  return (
    <div className={'mt-0 flex justify-center gap-2'}>
      {socialMediaLinks.map((socialMedia) => (
        <a
          key={socialMedia.id}
          href={socialMedia.url}
          target={'_blank'}
          rel={'noopener noreferrer'}
          className={
            'flex items-center justify-center text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:bg-opacity-30'
          }
          aria-label={`Visit us on ${socialMedia.platform}`}
        >
          {socialMedia.icon ? (
            <div className={'fill-current h-5 w-5'} dangerouslySetInnerHTML={{ __html: socialMedia.icon }} />
          ) : (
            getPlatformIcon(socialMedia.platform)
          )}
        </a>
      ))}
    </div>
  );
};
