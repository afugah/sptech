'use client';

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
import { useWishlist } from '@/src/hooks/useWishlist';
import { Link, usePathname } from '@/src/i18n/navigation';
import { type MenuLink } from '@/src/types/framework/storyblok-components';
import Newsletters from '../blocks/newsletters';
import NewsletterModal from '../ui/NewsletterModal';
import { SheetComponent } from '../ui/sheet';
import { CartSheet } from '../ui/sheet/components/cart/Cart';
import CartItems from '../ui/sheet/components/cart/CartItems';
import WishListCount from '../ui/sheet/components/wishlist/components/WishListCount';
import { WishListHeader } from '../ui/sheet/components/wishlist/components/WishlistHeader';
import MarketSelector from './MarketSelector';
import StaticMenu from './StaticMenu';

const SearchForm = dynamic(() => import('../search/dropdown-search/index'), { ssr: false });

interface IProps {
  header_menu?: MenuLink[];
  _uid?: string;
  component?: string;
  hasHeaderFixed?: boolean;
}

const HeaderInlineComponent = ({ header_menu, hasHeaderFixed = true }: IProps) => {
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
      <motion.header
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { y: '-100%' },
        }}
        animate={navHide ? 'visible' : 'hidden'}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        role={'banner'}
        className={`fixed top-0 z-40 w-full py-2 lg:py-3 ${bgColor ? 'bg-transparent' : 'bg-white/90 shadow-sm backdrop-blur-sm'}`}
      >
        <div className={'relative mx-auto flex w-full max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8'}>
          {/* Logo - Left aligned */}
          <div className={'flex items-center lg:basis-1/4'}>
            <Link href={'/'} aria-label={'Home'} className={'flex items-center'}>
              <StoreLogo className={`h-8 w-auto fill-black xs:h-10 sm:h-12 lg:h-14`} />
            </Link>
          </div>

          {/* Centered Menu - Hidden on mobile */}
          <nav className={'hidden flex-1 justify-center lg:flex'}>
            <div className={'flex items-center gap-8 text-sm font-medium uppercase tracking-wider'}>
              <StaticMenu headerMenu={header_menu} />
            </div>
          </nav>

          {/* Right side - Search, Wishlist, Cart */}
          <div className={'ml-auto flex items-center justify-end space-x-2 sm:space-x-4 lg:basis-1/4'}>
            {/* Market Selector - Hidden on mobile */}
            <div className={'hidden lg:flex lg:items-center lg:gap-2'}>
              <MarketSelector hasHeaderFixed={hasHeaderFixed} bgColor={bgColor} />
            </div>

            {/* Actions */}
            <div className={'flex items-center space-x-2 sm:space-x-3'}>
              {/* Search */}
              <Button
                variant={'custom'}
                aria-label={'Open search'}
                className={'px-0 py-0 [&_svg]:size-6'}
                onClick={() => {
                  setOpenSearchForm((prev) => !prev);
                }}
              >
                <Search size={24} strokeWidth={1.5} className={'h-5 w-5 stroke-black sm:h-6 sm:w-6'} />
              </Button>

              {/* Wishlist */}
              <div className={'relative flex cursor-pointer items-center'}>
                <Sheet open={openWishListSheet} onOpenChange={setOpenWishListSheet}>
                  <SheetTrigger asChild>
                    <Button variant={'custom'} className={'hidden px-0 py-0 sm:block [&_svg]:size-6'}>
                      <Heart
                        size={24}
                        aria-label={'Toggle Wishlist'}
                        strokeWidth={1.5}
                        className={'h-5 w-5 stroke-black sm:h-6 sm:w-6'}
                      />
                      <WishListCount numberOfCartItems={wishlistCount ?? 0} style={'round'} />
                    </Button>
                  </SheetTrigger>
                  <SheetComponent setOpenSheet={setOpenWishListSheet} title={t('wishlist.headerTitle')}>
                    <WishListHeader />
                  </SheetComponent>
                </Sheet>
              </div>

              {/* Cart */}
              {!isCheckoutPage && (
                <div className={'relative flex cursor-pointer items-center'}>
                  <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
                    <SheetTrigger asChild>
                      <Button
                        variant={'custom'}
                        aria-label={'Toggle Cart'}
                        className={'px-0 py-0 [&_svg]:size-6'}
                        tabIndex={0}
                      >
                        <Gift size={24} strokeWidth={1.5} className={'h-5 w-5 stroke-black sm:h-6 sm:w-6'} />
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

        {/* Mobile Menu - Simple horizontal scroll */}
        <div className={`mt-2 border-t px-4 py-2 lg:hidden ${bgColor ? 'border-white/20' : 'border-gray-200'}`}>
          <div className={'flex gap-4 overflow-x-auto text-xs font-medium uppercase tracking-wider'}>
            <StaticMenu headerMenu={header_menu} />
          </div>
        </div>
      </motion.header>

      {/* Search overlay */}
      <AnimatePresence>{openSearchForm && <SearchForm />}</AnimatePresence>

      {/* Newsletter Modal */}
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

const HeaderInline = ({ header_menu, hasHeaderFixed = true }: IProps) => {
  return (
    <Suspense fallback={<div className={'h-16 animate-pulse bg-white'} />}>
      <HeaderInlineComponent header_menu={header_menu} hasHeaderFixed={hasHeaderFixed} />
    </Suspense>
  );
};

export default HeaderInline;
