'use client';

import React from 'react';
import { type MenuLink } from '@/src/types/framework/storyblok-components';
import Header from './Header';

interface PageHeaderProps {
  header_menu?: MenuLink[];
  _uid?: string;
  component?: string;
  hasHeaderFixed: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ header_menu, _uid, component, hasHeaderFixed }) => {
  return <Header header_menu={header_menu} _uid={_uid} component={component} hasHeaderFixed={hasHeaderFixed} />;
};

export default PageHeader;
