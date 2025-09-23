'use client';

import 'reflect-metadata';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { Amplify } from 'aws-amplify';
import { SessionProvider } from 'next-auth/react';
import React, { type PropsWithChildren } from 'react';
import MarketAutoDetector from '@/src/components/MarketAutoDetector';
import StoryblokProvider from '@/src/components/storyBlok/StoryblokProvider';
import { UserIdSynchronizer } from '@/src/components/UserIdSynchronizer';
import UserProvider from '@/src/context/authContext';
import CartProvider from '@/src/context/cartContext';
import CheckoutProvider from '@/src/context/checkoutContext';
import FindifyProvider from '@/src/context/findifyAnalytics/findifyAnalyticsContext';
import { IdentificationProvider } from '@/src/context/identificationContext';
import PageProvider from '@/src/context/pageContext';
import PromotionProvider from '@/src/context/voyadoContext';
import AnalyticsProvider from '../context/analytics/analyticsContext';
import FiltersProvider from '../context/filterContext';
import RecommendationsDrawerProvider from '../context/recommendationsDrawerContext';
import SizeGuideDrawerProvider from '../context/sizeGuideDrawer';
import UserDrawerProvider from '../context/userDrawerContext';
import { WishlistProvider } from '../context/wishlistContext';

const queryClient = new QueryClient();
// const amplifyConfig = {
//   Auth: {
//     Cognito: {
//       userPoolClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_APP_CLIENT_ID ?? '',
//       userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID ?? '',
//       loginWith: {
//         username: true,
//       },
//     },
//   },
// };

// Amplify.configure(amplifyConfig, { ssr: true });

export function Providers({ children }: PropsWithChildren) {
  return (
    <div className={'font-sans'}>
      <QueryClientProvider client={queryClient}>
        <StoryblokProvider>
          <SessionProvider>
            <SizeGuideDrawerProvider>
              <FiltersProvider>
                <PageProvider>
                  <UserDrawerProvider>
                    <CartProvider>
                      <CheckoutProvider>
                        <IdentificationProvider>
                          <PromotionProvider>
                            <UserProvider>
                              <AnalyticsProvider>
                                <FindifyProvider>
                                  <WishlistProvider>
                                    <RecommendationsDrawerProvider>
                                      <MarketAutoDetector />
                                      <UserIdSynchronizer />
                                      {children}
                                    </RecommendationsDrawerProvider>
                                  </WishlistProvider>
                                </FindifyProvider>
                              </AnalyticsProvider>
                            </UserProvider>
                          </PromotionProvider>
                        </IdentificationProvider>
                      </CheckoutProvider>
                    </CartProvider>
                  </UserDrawerProvider>
                </PageProvider>
              </FiltersProvider>
            </SizeGuideDrawerProvider>
          </SessionProvider>
        </StoryblokProvider>
      </QueryClientProvider>
    </div>
  );
}
