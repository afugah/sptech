import React from 'react';
import { type MenuLink } from '@/src/types/framework/storyblok-components';
import StaticMenuLink from './StaticMenuLink';

interface IProps {
  headerMenu: MenuLink[] | undefined;
  className?: string;
}

const StaticMenu = ({ headerMenu, className }: IProps) => (
  <>
    {headerMenu?.map((menuLink: MenuLink) => (
      <StaticMenuLink menuLink={menuLink} className={className} key={menuLink._uid} />
    ))}
  </>
);

export default StaticMenu;
