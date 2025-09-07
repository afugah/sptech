import CloseIcon from '@images/icons/xmark.svg';
import classNames from 'classnames';
import { useLocale } from 'next-intl';
import React, { useEffect, useState } from 'react';
import CurrencySelector from '@/src/components/ui/CurrencySelector';
import Overlay from '@/src/components/ui/OverLay';
import { usePage } from '@/src/context/pageContext';
import { usePathname } from '@/src/i18n/navigation';
import { type IShoplab } from '@/src/lib/framework/Shoplab/types/IShoplab';
import { getNavigationMenu } from './action';
import { Menu } from './components/Menu';
import { SubMenu } from './components/SubMenu';

export interface IMenuItems {
  title: string;
  link: string;
}

const followUsItems: IMenuItems[] = [
  // { title: 'Facebook', link: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '' },
  // { title: 'Instagram', link: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '' },
  // { title: 'Pinterest', link: process.env.NEXT_PUBLIC_SOCIAL_PINTEREST || '' },
  // { title: 'TikTok', link: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK || '' },
];

// Get menu start level from environment variable or default to 0
const menuStartLevel = parseInt(process.env.NEXT_PUBLIC_MENU_START_LEVEL || '0', 10);

const MenuModal = () => {
  const { isMenuOpen, setIsMenuOpen } = usePage();
  const [subMenu, setSubMenu] = useState<IShoplab.NavigationItem | null>(null);
  const pathname = usePathname();
  const [headerMenu, setHeaderMenu] = useState<IShoplab.NavigationItem[]>();

  const handleMenuClick = (item: IShoplab.NavigationItem) => {
    setSubMenu(item);
  };

  const handleBackClick = () => {
    setSubMenu(null);
  };
  useEffect(() => {
    if (!isMenuOpen) setSubMenu(null);
  }, [isMenuOpen]);

  const locale = useLocale();

  useEffect(() => {
    getNavigationMenu(locale).then((data) => {
      setHeaderMenu(data);
    });
  }, [locale]);

  useEffect(() => {
    setSubMenu(null);
    setIsMenuOpen(false);
  }, [pathname, setIsMenuOpen]);

  return (
    <>
      <Overlay isVisible={isMenuOpen} setIsVisible={setIsMenuOpen} />

      <div
        className={classNames(
          `fixed bottom-0 left-0 top-0 z-40 m-0 flex w-full max-w-full flex-col overflow-x-auto bg-alabaster text-sm uppercase sm:w-fit`,
          `border-${isMenuOpen ? 'border-color-class' : 'transparent'}  ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-[calc(100%+10rem)]'
          }`,
        )}
      >
        <div className={'flex w-full flex-1 sm:w-fit'}>
          <div className={'mt-14 flex flex-1 flex-col px-14'}>
            <div className={'flex items-center justify-between'}>
              <CloseIcon role={'button'} className={'pointer h-6 w-6'} onClick={() => setIsMenuOpen(false)} />
              <CurrencySelector showOnMobile={true} hasHeaderFixed={true} />
            </div>

            <Menu
              handleMenuClick={handleMenuClick}
              followUsItems={followUsItems}
              headerMenu={headerMenu}
              activeSubMenu={subMenu}
              startLevel={menuStartLevel}
            />
          </div>

          {subMenu && (
            <SubMenu
              key={subMenu.id}
              isSubMenuOpen={Boolean(subMenu)}
              subMenu={subMenu}
              handleMenuClick={handleMenuClick}
              handleBackClick={handleBackClick}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default MenuModal;
