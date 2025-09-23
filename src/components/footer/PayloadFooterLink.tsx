import classNames from 'classnames';
import { Link } from '@/src/i18n/navigation';
import { type IFooterLink } from '@/src/lib/framework/Footer/domain/entities/IFooter';

interface IPayloadFooterLinkProps {
  footerLink: IFooterLink;
}

export const PayloadFooterLink: React.FC<IPayloadFooterLinkProps> = ({ footerLink }) => {
  const LinkComponent = footerLink.newTab ? 'a' : Link;
  const linkProps = footerLink.newTab
    ? { href: footerLink.url, target: '_blank', rel: 'noopener noreferrer' }
    : { href: footerLink.url };

  return (
    <LinkComponent
      {...linkProps}
      className={classNames('block text-center text-sm uppercase transition-opacity hover:opacity-70 lg:text-left')}
    >
      {footerLink.label}
    </LinkComponent>
  );
};
