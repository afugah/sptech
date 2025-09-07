import React from 'react';
import { type MenuLink } from '@/src/types/framework/storyblok-components';
import StaticMenuLink from './StaticMenuLink';

interface IProps {
  headerMenu: MenuLink[] | undefined;
}

const StaticMenu = ({ headerMenu }: IProps) => (
  <>{headerMenu?.map((menuLink: MenuLink) => <StaticMenuLink menuLink={menuLink} key={menuLink._uid} />)}</>
);

export default StaticMenu;
