'use client';

import Bonus from '@components/profile/bonus';
import GiftCardBalance from '@components/profile/bonus/components/GiftCardBalance';
import { type VoyadoVoucherItem } from '@lib/types/voyado';
import { StoryblokComponent } from '@storyblok/react';
import React, { useEffect } from 'react';
import { useLocale } from 'use-intl';
// import Bonus from '@/src/components/profile/bonus';
import Dashboard from '@/src/components/profile/dashboard';
// import GiftCard from '@/src/components/profile/giftCard';
import { useCart } from '@/src/context/cartContext';
import { useVoyado } from '@/src/context/voyadoContext';
import { type Profile } from '@/src/types/framework/storyblok-components';
import { formatNumberToShortForm } from '@/src/util/formatNumberToShortForm';

interface IProps {
  story: {
    name: string;
    content: Profile;
  } | null;
}

const ProfilePage: React.FC<IProps> = ({ story }) => {
  const { capabilities, startSession } = useCart();
  const { customer } = useVoyado();
  useEffect(() => {
    if (!capabilities) startSession();
  }, [capabilities, startSession]);
  const locale = useLocale();
  const currency = locale === 'sv' ? 'SEK' : locale === 'no' ? 'NOK' : locale === 'fi' ? 'EUR' : 'EUR';

  function getBonusCheckTotalAmount(bonusChecks: VoyadoVoucherItem[] | undefined): number {
    const totalAmount =
      bonusChecks
        ?.filter((check) => {
          if (check.localValues?.some((local) => local.currency === currency)) return true;
          return check.value.currency === currency;
        })
        .reduce((total, check) => {
          const matchingLocal = check.localValues?.find((local) => local.currency === currency);
          if (matchingLocal) {
            return total + matchingLocal.amount;
          }
          return total + check.value.amount;
        }, 0) || 0;

    return Math.round(totalAmount);
  }

  return (
    <div className={'flex flex-col gap-20'}>
      <Dashboard />
      {/* FEATURE: BONUS CHECK */}
      {customer && customer?.vouchers?.items?.length > 0 && (
        <Bonus bonusAmount={formatNumberToShortForm(getBonusCheckTotalAmount(customer.vouchers.items))} />
      )}
      {/* END FEATURE: BONUS CHECK */}

      {/* FEATURE: GITCARD */}
      {process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production' && <GiftCardBalance />}
      {/* END FEATURE: GITCARD */}

      {/* FEATURE: BONUS INFO */}
      {process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production' && (
        <div className={'container flex flex-col gap-20'}>
          {story && story?.content.blocks?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
        </div>
      )}
      {/* END FEATURE: BONUS INFO */}
    </div>
  );
};

export default ProfilePage;
