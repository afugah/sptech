import React from 'react';
import { Link } from '@/src/i18n/navigation';
import { type MenuLink } from '@/src/types/framework/storyblok-components';

interface IProps {
  menuLink: MenuLink;
  className?: string;
}

const StaticMenuLink = ({ menuLink: { link, title }, className }: IProps) => {
  return (
    <Link href={`/${link}`} className={className}>
      {title}
    </Link>
  );
};

export default StaticMenuLink;
