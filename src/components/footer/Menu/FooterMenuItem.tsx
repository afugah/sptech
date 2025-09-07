import classNames from 'classnames';
import Image from 'next/image';
import { Link } from '@/src/i18n/navigation';
import { type MenuLink } from '@/src/types/framework/storyblok-components';

interface IFooterMenuItemProps {
  menuLink: MenuLink;
}

export const FooterMenuItem: React.FC<IFooterMenuItemProps> = ({ menuLink }) => (
  <li
    key={menuLink._uid}
    className={classNames(
      'pb-3 pt-1.5 text-center transition-colors last-of-type:pb-5 hover:text-black',
      'lg:pb-1 lg:pt-1 lg:text-left',
    )}
  >
    <Link href={menuLink.link}>
      {menuLink.icon?.filename && <Image height={15} width={15} src={menuLink.icon.filename} alt={menuLink.title} />}
      <span>{menuLink.title}</span>
    </Link>
  </li>
);
