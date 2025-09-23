import MenuArrow from '@images/icons/menu-arrow.svg';
import { Gift, Heart, Home, MoveRight, Search } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { NavigationMenuItem, NavigationMenuTrigger } from '@/src/components/shadcn/navigation-menu';
import { Sheet, SheetTrigger } from '@/src/components/shadcn/sheet-custom';
import { SheetComponent } from '@/src/components/ui/sheet';
import { CartSheet } from '@/src/components/ui/sheet/components/cart/Cart';
import { useCart } from '@/src/context/cartContext';
import { usePage } from '@/src/context/pageContext';
import { useWishlist } from '@/src/hooks/useWishlist';
import { Link } from '@/src/i18n/navigation';
import { type IShoplab } from '@/src/lib/framework/Shoplab/types/IShoplab';
import { type IMenuItems } from '../index';
// import SubMenu from './SubMenu';

interface MainMenuProps {
  isTransitioning: boolean;
  onItemClick: (key: string) => void;
  followUsItems?: IMenuItems[];
  headerMenu?: IShoplab.NavigationItem[];
  newHeaderMenu?: IShoplab.NewNavigation;
  startLevel?: number;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SubMenu = dynamic(() => import('./SubMenu'), {
  ssr: false,
});

const MainMenu = ({ newHeaderMenu, followUsItems }: MainMenuProps) => {
  const [title, setTitle] = useState<{ url: string; title: string } | null>(null);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [openCartSheet, setOpenCartSheet] = useState(false);

  const [subMenu, setSubMenu] = useState<IShoplab.Child[] | null>(null);
  const { setIsDesktopMenuOpen, setDesktopMenu } = usePage();
  const { wishlistCount } = useWishlist();
  const { numberOfCartItems } = useCart();

  const { navigationItems, smallerNavigations, footerNavigations } =
    newHeaderMenu?.length! > 0
      ? newHeaderMenu![0]
      : {
          navigationItems: [],
          smallerNavigations: [],
          footerNavigations: [],
        };
  const t = useTranslations();

  // const [categories, links] = useMemo(() => {
  //   // If startLevel is 0, use the original menu structure
  //   if (startLevel === 0) {
  //     return (
  //       headerMenu?.reduce<[IShoplab.NavigationItem[], IShoplab.NavigationItem[]]>(
  //         (result, item) => {
  //           if (item.children?.length) {
  //             result[0].push(item);
  //           } else {
  //             result[1].push(item);
  //           }
  //           return result;
  //         },
  //         [[], []],
  //       ) ?? [[], []]
  //     );
  //   }
  //   // For startLevel > 0, we need to navigate down the hierarchy
  //   let currentItems = headerMenu;
  //   let currentLevel = 0;

  //   // Navigate down to the desired level
  //   while (currentLevel < startLevel && currentItems?.length) {
  //     // Find the first item with children at the current level
  //     const itemWithChildren = currentItems.find((item) => item.children?.length > 0);

  //     // If we can't go deeper, break out
  //     if (!itemWithChildren?.children?.length) {
  //       break;
  //     }

  //     // Go one level deeper
  //     currentItems = itemWithChildren.children;
  //     currentLevel++;
  //   }

  //   // Now process the items at the current level
  //   return (
  //     currentItems?.reduce<[IShoplab.NavigationItem[], IShoplab.NavigationItem[]]>(
  //       (result, item) => {
  //         if (item.children?.length) {
  //           result[0].push(item);
  //         } else {
  //           result[1].push(item);
  //         }
  //         return result;
  //       },
  //       [[], []],
  //     ) ?? [[], []]
  //   );
  // }, [headerMenu, startLevel]);

  return (
    <>
      <div className={'flex flex-col gap-y-6 lg:hidden'}>
        {!!newHeaderMenu?.length && (
          <div className={'m-0 flex flex-col gap-y-5 text-2xl lg:relative lg:top-0 lg:flex lg:p-0 xl:text-xl'}>
            {navigationItems?.map((item) => (
              <NavigationMenuItem
                key={item.id}
                className={
                  'group flex cursor-pointer justify-between font-serif text-black transition-colors duration-300 hover:text-gray-900 '
                }
              >
                <NavigationMenuTrigger
                  onClick={() => {
                    setSubMenu(item?.children || []);
                    setTitle({
                      url: item?.url as string,
                      title: item?.title,
                    });
                    setShowSubMenu(true);
                  }}
                  className={''}
                >
                  <span className={'uppercase'}> {item.title}</span>
                </NavigationMenuTrigger>
                <span className={'mr-4'}>
                  <MenuArrow
                    className={
                      'my-auto hidden transform transition-transform duration-300 lg:block lg:opacity-0 lg:group-hover:translate-x-4 lg:group-hover:opacity-100'
                    }
                  />
                </span>
              </NavigationMenuItem>
            ))}
          </div>
        )}
        <div>
          {!!smallerNavigations?.length && <hr className={'w-full border-gray-300 pt-3'} />}
          {!!smallerNavigations?.length && (
            <div className={'m-0 flex flex-col gap-y-3 '}>
              {smallerNavigations?.map((menuItem) => (
                <div key={menuItem.id} className={''}>
                  <Link href={menuItem.url.toLowerCase()} className={' font-sans text-md font-medium uppercase'}>
                    {menuItem.label}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {!!footerNavigations?.length && <hr className={'w-full border-gray-300 pt-3'} />}
          {!!footerNavigations?.length && (
            <div className={'m-0 flex flex-col gap-y-5 lg:relative lg:top-0 lg:flex lg:p-0'}>
              {footerNavigations?.map((menuItem) => (
                <NavigationMenuItem key={menuItem.id} className={'text-black '}>
                  <Link
                    href={menuItem?.url?.toLowerCase()}
                    className={'block cursor-pointer text-md font-light uppercase'}
                  >
                    {menuItem.label}
                  </Link>
                </NavigationMenuItem>
              ))}
            </div>
          )}
        </div>
        <div className={' block lg:hidden'}>
          <hr className={'w-full border-gray-300 pt-3 lg:hidden'} />

          <div className={'m-0 flex flex-col gap-y-5 lg:relative lg:top-0 lg:flex lg:p-0'}>
            <Link href={'/'} className={'flex items-center text-xs font-light uppercase'}>
              <Home strokeWidth={0.5} size={17} className={' mr-1 inline-block '} />
              Home
            </Link>
            <Link href={'/search'} className={' flex cursor-pointer items-center  text-xs font-light uppercase'}>
              <Search strokeWidth={0.5} size={18} className={' mr-1 inline-block'} />
              Search
            </Link>
            <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
              <SheetTrigger asChild className={' my-0 flex flex-row justify-start py-0 text-left'}>
                <div className={' flex cursor-pointer items-center  text-xs font-light uppercase'}>
                  <Gift strokeWidth={0.5} size={18} className={' mr-1 inline-block'} />
                  <p className={' flex items-center'}>
                    Cart<span className={`ml-1 ${!numberOfCartItems ? 'hidden' : 'block'}`}>({numberOfCartItems})</span>
                  </p>
                </div>
              </SheetTrigger>
              <SheetComponent setOpenSheet={setOpenCartSheet} title={t('cart.shopping_cart')}>
                <CartSheet />
              </SheetComponent>
            </Sheet>
            <Link href={'/wishlist'} className={' flex cursor-pointer items-center  text-xs font-light uppercase'}>
              <Heart strokeWidth={0.5} size={18} className={' mr-1 inline-block'} />
              <p className={' flex items-center'}>
                Wishlist<span className={`ml-1 ${!wishlistCount ? 'hidden' : 'block'}`}>({wishlistCount})</span>
              </p>
            </Link>
          </div>
        </div>
      </div>
      <div className={'hidden flex-col gap-y-6 lg:flex'}>
        {!!newHeaderMenu?.length && (
          <div className={'m-0 flex flex-col gap-y-5  md:text-2xl lg:relative lg:top-0 lg:flex lg:p-0 xl:text-2xl'}>
            {newHeaderMenu[0]?.navigationItems?.map((item) => (
              <NavigationMenuItem
                key={item.id}
                className={
                  'group flex cursor-pointer  justify-between  font-serif text-black transition-colors duration-300 hover:text-gray-900'
                }
                onClick={() => {
                  setDesktopMenu(item || []);
                  setTitle({
                    url: item?.url as string,
                    title: item?.title,
                  });
                  setIsDesktopMenuOpen(true);
                }}
              >
                <NavigationMenuTrigger className={''}>
                  <span className={'uppercase'}> {item?.title}</span>
                </NavigationMenuTrigger>
                <span className={'mr-4'}>
                  <MoveRight
                    size={32}
                    className={
                      'my-auto hidden h-8 w-8 transform   text-[#D9C2B6] transition-transform duration-300 lg:block lg:opacity-0 lg:group-hover:translate-x-4 lg:group-hover:opacity-100'
                    }
                  />
                  {/* <MenuArrow
                    className={
                      'my-auto hidden  transform transition-transform duration-300 lg:block lg:opacity-0 lg:group-hover:translate-x-4 lg:group-hover:opacity-100'
                    }
                  /> */}
                </span>
              </NavigationMenuItem>
            ))}
          </div>
        )}
        <div>
          {!!smallerNavigations?.length && <hr className={'w-full border-gray-300 pt-3'} />}
          {!!smallerNavigations?.length && (
            <div className={'m-0 flex flex-col gap-y-3 '}>
              {smallerNavigations?.map((menuItem) => (
                <div key={menuItem.id} className={''}>
                  <Link href={menuItem?.url?.toLowerCase()} className={' font-sans text-md font-medium uppercase'}>
                    {menuItem.label}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {!!footerNavigations?.length && <hr className={'w-full border-gray-300 pt-3'} />}
          {!!footerNavigations?.length && (
            <div className={'m-0 flex flex-col gap-y-5 lg:relative lg:top-0 lg:flex lg:p-0'}>
              {footerNavigations?.map((menuItem) => (
                <NavigationMenuItem key={menuItem.id} className={'text-black '}>
                  <Link
                    href={menuItem?.url?.toLowerCase()}
                    className={'block cursor-pointer text-md font-light uppercase'}
                  >
                    {menuItem.label}
                  </Link>
                </NavigationMenuItem>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* <div className={'mb-6 border-b border-gray-300'} /> */}
      <ul className={'m-0 flex flex-col gap-y-6 lg:relative lg:top-0 lg:flex lg:p-0'}>
        {/* <li className={'text-black transition-colors duration-300 hover:text-gray-700 hover:underline'}>
              <a className={'block'}>Follow Us</a>
            </li> */}

        {followUsItems?.length === 0
          ? null
          : followUsItems?.map((menuItem) => (
              <li
                key={menuItem.link}
                className={'text-gray transition-colors duration-300 hover:text-gray-700 hover:underline'}
              >
                <a href={menuItem?.link} target={'_blank'} className={'block'}>
                  {menuItem.title}
                </a>
              </li>
            ))}
      </ul>

      <AnimatePresence>
        {showSubMenu && <SubMenu title={title} subMenu={subMenu} setShowSubMenu={setShowSubMenu} />}
      </AnimatePresence>
      {/* <AnimatePresence>{showDesktopSubMenu && <DesktopSubmenu />}</AnimatePresence> */}
    </>
  );
};

export default MainMenu;
