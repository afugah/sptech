import React from 'react';
import { Link } from '@/src/i18n/navigation';
import { type MenuLink } from '@/src/types/framework/storyblok-components';

interface IProps {
  menuLink: MenuLink;
}

const StaticMenuLink = ({ menuLink: { link, title } }: IProps) => {
  return <Link href={`/${link}`}>{title}</Link>;
};

export default StaticMenuLink;
