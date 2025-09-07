'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useVoyado } from '@/src/context/voyadoContext';
import Loader from '../../ui/Loader';
import CircularProgress from './components/CircularProgress';
import ProgressBar from './components/ProgressBar';

const Dashboard: React.FC = () => {
  const t = useTranslations();
  const { customer, voyadoLoading } = useVoyado();

  if (!customer) return null;
  if (voyadoLoading && !customer) return <Loader />;
  return (
    <div className={'bg-seashell py-20 pt-14'}>
      <div className={'container flex flex-col flex-wrap items-center md:flex-row'}>
        <div className={'mb-14 w-full'}>
          <h1 className={'text-center text-[40px]'}>
            {t('account.welcome')}, {customer.displayName}
          </h1>
        </div>

        <div className={'flex w-full flex-col flex-wrap gap-[2px] lg:flex-row'}>
          <div className={'bg-white p-10'}>
            <h3 className={'pb-10 font-sans text-sm uppercase text-black'}>{t('member.membership-level')}</h3>
            <div className={'relative max-h-[171px] max-w-[281px]'}>
              <Image
                alt={`card ${customer.memberNumber}`}
                width={281}
                className={'z-10'}
                unoptimized
                height={171}
                src={`/memberCard_${customer.bonusBasedLevel || 'member'}.png`}
              />
              <div
                className={
                  'absolute left-0 top-0 z-10 flex h-full w-full flex-col items-start justify-between px-5 py-6'
                }
              >
                <span className={'font-serif text-lg uppercase text-black'}>{customer.memberNumber}</span>
                <div className={'flex flex-col uppercase'}>
                  <span className={'text-sm text-black'}>{customer.bonusBasedLevel || 'member'}</span>
                  <span className={'text-sm text-black'}>
                    {new Intl.NumberFormat('sv-SE').format(customer.memberLevelsBonusPoints ?? 0)}{' '}
                    {t('member.member-points')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={'flex flex-col justify-between bg-white p-10 md:flex-[2]'}>
            <h3 className={'font-sans text-sm uppercase text-black'}>{t('member.your-bonus-points')}</h3>
            <div className={'mt-4'}>
              <ProgressBar points={customer.memberLevelsBonusPoints ?? 0} />
            </div>
          </div>

          <div className={'bg-white p-10 lg:max-w-80'}>
            <h3 className={'font-sans text-sm uppercase text-black'}>{t('member.remaining-points')}</h3>
            <div className={'mt-4 flex items-center justify-center'}>
              <CircularProgress points={customer.bonusPoints} nextLevel={1000} />
            </div>

            <div className={'mt-4 text-center text-sm text-gray'}>{t('member.points-to-bonus-check')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
