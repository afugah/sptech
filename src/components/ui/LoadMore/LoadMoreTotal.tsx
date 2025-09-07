import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import React from 'react';

interface ILoadMoreTotalProps {
  current: number;
  total: number;

  className?: string;
}

export const LoadMoreTotal: React.FC<ILoadMoreTotalProps> = (props) => {
  const { current, total, className } = props;
  const t = useTranslations('product.list');
  return (
    <div className={classNames('mx-auto mt-10 flex flex-col items-center', className)}>
      <div className={'h-0.5 w-[200px] rounded-full bg-secondary-200'}>
        <span className={'block h-0.5 rounded-full bg-black'} style={{ width: `${(current / total) * 100}%` }}></span>
      </div>

      <div className={'mt-7 text-xs uppercase tracking-widest text-secondary'}>
        {t('showing')} {current} {t('oaut_of')} {total} {t('products')}
      </div>
    </div>
  );
};
