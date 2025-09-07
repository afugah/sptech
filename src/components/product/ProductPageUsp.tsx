import KlarnaIcon from '@images/icons/klarna-usp.svg';
import EasyReturnsIcon from '@images/icons/return-usp.svg';
import FreeShippingIcon from '@images/icons/shipping-usp.svg';
import { useTranslations } from 'next-intl';
import React from 'react';

const ProductPageUsp: React.FC = () => {
  const t = useTranslations();

  return (
    <ul className={'order-last flex h-max w-full flex-row items-start gap-5 py-4 md:py-8'}>
      {[
        {
          icon: EasyReturnsIcon,
          title: t('product-page.usp.easy-returns'),
          description: t('product-page.usp.30-days-guaranteed-purchase-on-approval-14-days-when-buying-sale'),
        },
        {
          icon: FreeShippingIcon,
          title: t('product-page.usp.free-shipping'),
          description: t('product-page.usp.free-shipping-over', { price: t('product-page.usp.free-shipping-price') }),
        },

        {
          icon: KlarnaIcon,
          title: t('product-page.usp.pay-safe'),
          description: t('product-page.usp.pay-safe-with'),
        },
      ].map((usp, index) => (
        <li key={index} className={'flex w-28 flex-col items-center justify-center gap-3'}>
          <div className={'flex h-16 w-16 items-center justify-center rounded-full bg-creme bg-opacity-40'}>
            <usp.icon className={''} />
          </div>

          <div className={'flex flex-col items-center justify-center'}>
            <div className={'text-center text-xs font-normal uppercase text-gray-800'}>{usp.title}</div>
            <p className={'mt-1 text-center text-xs text-gray-700'}>{usp.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ProductPageUsp;
