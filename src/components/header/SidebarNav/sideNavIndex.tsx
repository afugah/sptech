'use client';
import { X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useLocale } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { Button } from '@/src/components/shadcn/button';
import { NavigationMenu, NavigationMenuList } from '@/src/components/shadcn/navigation-menu';
import { ScrollArea } from '@/src/components/shadcn/scroll-area';
import { usePage } from '@/src/context/pageContext';
import { useNavigationState } from '@/src/hooks/useNavigationState';
import { type IShoplab } from '@/src/lib/framework/Shoplab/types/IShoplab';
import { getPayloadNavigationMenu } from './action';
import DesktopSubmenu from './components/DesktopSubmenu';
import MainMenu from './components/MainMenu';
import { type IMenuItems } from './index';
export interface SlidingNavProps {
  direction: 'left' | 'right';
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const followUsItems: IMenuItems[] = [
  // { title: 'Facebook', link: 'https://sv-se.facebook.com/IndiskaSE/' },
  // { title: 'Instagram', link: 'https://www.instagram.com/indiskaofficial/?hl=sv' },
  // { title: 'Pinterest', link: 'https://www.pinterest.se/indiska/' },
  // { title: 'TikTok', link: 'https://www.tiktok.com/@indiskaofficial' },
];

const SlidingNav = ({ direction, isOpen, setIsOpen }: SlidingNavProps) => {
  const { currentLevel, isTransitioning, handleMainItemClick, getMenuAnimationClass } = useNavigationState();
  const { isDesktopMenuOpen, setIsDesktopMenuOpen, desktopMenu } = usePage();
  // const [headerMenu, setHeaderMenu] = useState<IShoplab.NavigationItem[]>();
  const [newHeaderMenu, setNewHeaderMenu] = useState<IShoplab.NewNavigation>([
    {
      navigationItems: [],
      smallerNavigations: [],
      footerNavigations: [],
    },
  ]);

  const slideInClass = direction === 'left' ? 'translate-x-0' : 'translate-x-0';

  const slideOutClass = direction === 'left' ? '-translate-x-full' : 'translate-x-full';

  const menuStartLevel = parseInt(process.env.NEXT_PUBLIC_MENU_START_LEVEL || '0', 10);

  const locale = useLocale();

  useEffect(() => {
    getPayloadNavigationMenu(locale)
      .then((data) => {
        setNewHeaderMenu(data || []);
      })
      .catch((error) => {
        console.error('Failed to load navigation menu:', error);
        setNewHeaderMenu([]);
      });
  }, [locale]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className={'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300'}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sliding Navigation */}
      <NavigationMenu
        className={`fixed top-0 ${direction === 'left' ? 'left-0' : 'right-0'} h-full w-full bg-alabaster   md:w-[28.5rem] lg:border-${direction === 'left' ? 'r' : 'l'} z-50 transform shadow-xl transition-transform duration-500 ease-in-out ${
          isOpen ? slideInClass : slideOutClass
        }`}
      >
        {/* Entire content wrapped in ScrollArea */}
        <ScrollArea className={' h-full'}>
          <div className={' flex min-h-full flex-col'}>
            {/* Header */}
            <Button
              role={'button'}
              type={'button'}
              aria-label={'Close side bar menu'}
              onClick={() => {
                setIsDesktopMenuOpen(false);
                setIsOpen(false);
              }}
              variant={'custom'}
              className={' flex h-full w-full justify-end pr-7 pt-6 [&_svg]:size-8 '}
            >
              {/* <CloseIcon role={'button'} className={'pointer z-50 h-6 w-6 '} onClick={() => setIsOpen(false)} /> */}
              <X strokeWidth={1} className={'pointer  z-50 text-gray-400  '} size={40} />
            </Button>

            {/* Navigation Items */}
            <NavigationMenuList className={'flex-1 p-4 pl-4'}>
              <div className={`transform transition-all duration-300 ease-in-out  ${getMenuAnimationClass()}`}>
                {currentLevel === 'main' ? (
                  <MainMenu
                    isTransitioning={isTransitioning}
                    onItemClick={handleMainItemClick}
                    // headerMenu={headerMenu}
                    followUsItems={followUsItems}
                    startLevel={menuStartLevel}
                    setIsOpen={setIsOpen}
                    newHeaderMenu={newHeaderMenu}
                  />
                ) : null}
              </div>
            </NavigationMenuList>

            {/* Footer */}
          </div>
        </ScrollArea>
      </NavigationMenu>
      <AnimatePresence>
        {isDesktopMenuOpen && isOpen && <DesktopSubmenu desktopSubMenu={desktopMenu} />}
      </AnimatePresence>
    </>
  );
};

export default SlidingNav;
