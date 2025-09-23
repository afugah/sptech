'use client';

import BarsIcon from '@images/icons/bars.svg';
import StoreLogo from '@images/store-logo.svg';
import debounce from 'lodash.debounce';
import { Gift, Heart, Search } from 'lucide-react';
import { AnimatePresence, useMotionValueEvent } from 'motion/react';
import { motion, useScroll } from 'motion/react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Button } from '@/src/components/shadcn/button';
import { Sheet, SheetTrigger } from '@/src/components/shadcn/sheet-custom';
import { useCart } from '@/src/context/cartContext';
import { useNavigationState } from '@/src/hooks/useNavigationState';
import { useWishlist } from '@/src/hooks/useWishlist';
import { Link, usePathname } from '@/src/i18n/navigation';
import { useInlineHeaderMenu } from '@/src/lib/features';
import { type MenuLink } from '@/src/types/framework/storyblok-components';
import Newsletters from '../blocks/newsletters';
import NewsletterModal from '../ui/NewsletterModal';
import { SheetComponent } from '../ui/sheet';
import { CartSheet } from '../ui/sheet/components/cart/Cart';
import CartItems from '../ui/sheet/components/cart/CartItems';
import WishListCount from '../ui/sheet/components/wishlist/components/WishListCount';
import { WishListHeader } from '../ui/sheet/components/wishlist/components/WishlistHeader';
import HeaderInline from './HeaderInline';
import MarketSelector from './MarketSelector';
// import UserSelector from '../ui/UserSelector';
// Removed server action import - using API route instead
import SlidingNav from './SidebarNav/sideNavIndex';
import StaticMenu from './StaticMenu';
// const SearchForm = dynamic(() => import('../search/Search'), { ssr: false });
const SearchForm = dynamic(() => import('../search/dropdown-search/index'), { ssr: false });

interface IProps {
  header_menu?: MenuLink[];
  _uid?: string;
  component?: string;
  hasHeaderFixed?: boolean;
}

const HeaderComponent = ({ header_menu, hasHeaderFixed = true }: IProps) => {
  const { isOpen, setIsOpen } = useNavigationState();
  const [openNewsletterModal, setOpenNewsletterModal] = useState(false);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [openWishListSheet, setOpenWishListSheet] = useState(false);
  const [openSearchForm, setOpenSearchForm] = useState(false);
  const [navHide, setNavHide] = React.useState(false);
  const pathname = usePathname();
  const isCheckoutPage = pathname.includes('/checkout');

  const searchParams = useSearchParams().get('q');
  const { wishlistCount } = useWishlist();
  const {
    startSession,
    numberOfCartItems,
    cart,
    isSessionLoaded,
    startSessionWithNewMemberLevel,
    getStoreGroupIdFromLocalStorage,
  } = useCart();
  const [bgColor, setBgColor] = useState(false);

  const { scrollY } = useScroll();

  const debouncedScrollHandler = debounce((latestScrollY: number, previousScrollY: number | undefined) => {
    if (latestScrollY < 10) {
      setBgColor(true);
      setNavHide(true);
    } else if (previousScrollY !== undefined && latestScrollY > previousScrollY && latestScrollY > 5) {
      setNavHide(false);
    } else {
      setNavHide(true);
      if (latestScrollY > 30) {
        setBgColor(false);
      }
    }
  }, 10);

  useEffect(() => {
    setNavHide(true);
    setBgColor(true);
  }, []);
  useEffect(() => {
    setOpenSearchForm(false);
  }, [pathname, searchParams]);

  useMotionValueEvent(scrollY, 'change', (latestScrollY) => {
    const previous = scrollY.getPrevious();
    debouncedScrollHandler(latestScrollY, previous);
  });

  const t = useTranslations();

  const getStoreGroupID = useCallback(async () => {
    try {
      const response = await fetch('/api/store-group');
      const data = await response.json();
      const storeGroupId = data.storeGroupId;
      const storeGroupLocalStorageId = getStoreGroupIdFromLocalStorage();
      if (!cart?.id && !isSessionLoaded) {
        startSession();
      }
      if (storeGroupId !== storeGroupLocalStorageId && !isSessionLoaded) {
        startSessionWithNewMemberLevel(cart);
      }
    } catch (error) {
      console.error('Failed to fetch store group ID:', error);
      // Continue with default behavior on error
      if (!cart?.id && !isSessionLoaded) {
        startSession();
      }
    }
  }, [cart, isSessionLoaded, getStoreGroupIdFromLocalStorage, startSession, startSessionWithNewMemberLevel]);

  useEffect(() => {
    getStoreGroupID();
  }, [getStoreGroupID]);

  return (
    <>
      <SlidingNav direction={'left'} isOpen={isOpen} setIsOpen={setIsOpen} />

      <motion.header
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { y: '-100%' },
        }}
        animate={navHide ? 'visible' : 'hidden'}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        role={'banner'}
        className={`fixed top-0 z-40 w-full  py-0  lg:py-2 ${bgColor ? ' ' : 'bg-white'} `}
      >
        <div
          className={
            'relative mx-auto flex w-full max-w-screen-2xl items-center px-2 py-2 sm:px-4 sm:py-4 lg:grid-cols-3'
          }
        >
          <div className={'bottom-0 flex items-center lg:basis-2/5'}>
            {isOpen ? null : (
              <Button
                aria-label={'Open side navigation'}
                variant={'custom'}
                className={'ml-1 px-0 py-0 sm:ml-7 [&_svg]:size-6'}
                onClick={() => setIsOpen(true)}
              >
                <BarsIcon
                  role={'button'}
                  className={`pointer h-6 w-6  fill-${hasHeaderFixed && bgColor ? 'white' : 'black'}`}
                />
              </Button>
            )}
            <div className={'ml-5 hidden gap-5 text-sm uppercase lg:flex'}>
              <StaticMenu headerMenu={header_menu} />
            </div>
          </div>

          <div
            className={
              'absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform lg:static lg:flex lg:grow-0 lg:basis-1/5 lg:translate-x-0 lg:translate-y-0 lg:justify-center'
            }
          >
            <Link href={'/'} aria-label={'Home'} className={'flex items-center space-x-4 md:space-x-6'}>
              <StoreLogo
                className={`h-8 w-auto fill-${hasHeaderFixed && bgColor ? 'white' : 'black'} xs:h-10 sm:h-14 lg:h-16`}
              />
            </Link>
          </div>
          <div className={'ml-auto flex items-center justify-end space-x-1 sm:space-x-4 lg:grow lg:basis-1/5'}>
            {/* <CurrencySelector showOnMobile={false} hasHeaderFixed={hasHeaderFixed} /> */}
            {/* <div className={'hidden lg:flex lg:items-center lg:space-x-4'}>
              <LanguageSelect />
              <CountrySelector />
            </div> */}
            <div className={'hidden lg:flex lg:items-center lg:gap-2'}>
              <MarketSelector hasHeaderFixed={hasHeaderFixed} bgColor={bgColor} />
            </div>
            <div className={'flex items-center space-x-1 sm:space-x-2 lg:space-x-5'}>
              <Button
                variant={'custom'}
                aria-label={'Open search'}
                className={'px-0 py-0  [&_svg]:size-7'}
                onClick={() => {
                  setOpenSearchForm((prev) => !prev);
                }}
              >
                {/* <SearchIcon
                className={`h-8 w-8 ${hasHeaderFixed && lastScrollY < 5 ? 'stroke-white' : 'stroke-black'}`}
              /> */}
                <Search
                  size={34}
                  strokeWidth={1}
                  className={`h-6 w-6 sm:h-8 sm:w-8 ${hasHeaderFixed && bgColor ? 'stroke-white' : 'stroke-black'}`}
                />
              </Button>
              {/* <SearchForm searchPanelRef={searchPanelRef} externalButton={true} /> */}

              {/* <UserSelector /> */}
              <div className={'relative flex cursor-pointer items-center'}>
                <Sheet open={openWishListSheet} onOpenChange={setOpenWishListSheet}>
                  <SheetTrigger asChild>
                    <Button variant={'custom'} className={'hidden px-0 py-0 sm:block [&_svg]:size-7'}>
                      <Heart
                        size={40}
                        aria-label={'Toggle Wishlist'}
                        strokeWidth={1}
                        color={''}
                        className={
                          'inline-block h-6 w-6 bg-transparent sm:h-8 sm:w-8 ' +
                          (hasHeaderFixed && bgColor ? ' stroke-white' : ' stroke-black')
                        }
                      />
                      <WishListCount numberOfCartItems={wishlistCount ?? 0} style={'round'} />
                    </Button>
                  </SheetTrigger>
                  <SheetComponent setOpenSheet={setOpenWishListSheet} title={t('wishlist.headerTitle')}>
                    <WishListHeader />
                  </SheetComponent>
                </Sheet>
              </div>

              {!isCheckoutPage && (
                <div className={'relative flex cursor-pointer items-center'}>
                  <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
                    <SheetTrigger asChild>
                      <Button
                        variant={'custom'}
                        aria-label={'Toggle Cart'}
                        className={'px-0 py-0  [&_svg]:size-7'}
                        tabIndex={0}
                      >
                        <Gift
                          size={36}
                          strokeWidth={1}
                          className={`h-6 w-6 sm:h-8 sm:w-8 ${hasHeaderFixed && bgColor ? 'stroke-white' : 'stroke-black'}`}
                        />
                        <CartItems numberOfCartItems={numberOfCartItems ?? 0} style={'round'} />
                      </Button>
                    </SheetTrigger>
                    <SheetComponent setOpenSheet={setOpenCartSheet} title={t('cart.shopping_cart')}>
                      <CartSheet />
                    </SheetComponent>
                  </Sheet>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* <div ref={searchPanelRef} className={'w-full'} /> */}
        {/* <AvailableOffers /> */}
      </motion.header>
      {/* <Cart /> */}
      <AnimatePresence>{openSearchForm && <SearchForm />}</AnimatePresence>
      {openNewsletterModal && (
        <NewsletterModal
          className={'max-w-[45rem]'}
          modalState={openNewsletterModal}
          setOpenModal={setOpenNewsletterModal}
        >
          <Newsletters />
        </NewsletterModal>
      )}
    </>
  );
};

const Header = ({ header_menu, hasHeaderFixed = true }: IProps) => {
  const useInlineMenu = useInlineHeaderMenu();

  // Use inline header menu if feature flag is enabled
  if (useInlineMenu) {
    return <HeaderInline header_menu={header_menu} hasHeaderFixed={hasHeaderFixed} />;
  }

  // Use traditional slide-in menu header
  return (
    <Suspense fallback={<div className={'h-16 animate-pulse bg-white'} />}>
      <HeaderComponent header_menu={header_menu} hasHeaderFixed={hasHeaderFixed} />
    </Suspense>
  );
};

export default Header;
