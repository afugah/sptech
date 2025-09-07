'use client';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useState } from 'react';
import { useIntersectionObserver } from 'usehooks-ts';
import { Button } from '@/src/components/ui/Button';
import { useLoadingFunction } from '@/src/hooks/useLoadingFunction';

interface ILoadMoreProps {
  /**
   * @default false
   */
  autoLoad?: boolean;
  loading?: boolean;
  title?: string;

  className?: string;
  buttonClassName?: string;

  onLoadMore: () => void | Promise<void>;
}

export const LoadMore: React.FC<ILoadMoreProps> = (props) => {
  const t = useTranslations('');
  const {
    autoLoad = false,
    loading: externalLoading,
    title = `${t('product.list.load-more')}`,
    className,
    buttonClassName,
    onLoadMore: externalLoadMore,
  } = props;

  const [isLoading, onLoadMore] = useLoadingFunction(externalLoadMore, externalLoading);

  const [isAutoLoad, setIsAutoLoad] = useState(autoLoad);
  const [ref, isIntersecting] = useIntersectionObserver({
    initialIsIntersecting: false,
    // root: null,
    // rootMargin: '0px',
    threshold: 0.5,
  });

  useEffect(() => {
    if (!isAutoLoad || !isIntersecting || isLoading) return;

    setIsAutoLoad(false);
    onLoadMore().then(() => {
      // Small timeout to wait for items to render and expand the page size so the intersection resets
      setTimeout(() => setIsAutoLoad(true), 300);
    });
  }, [isAutoLoad, isIntersecting, isLoading, onLoadMore]);

  const onLoadMorePress = useCallback(() => {
    setIsAutoLoad(true);
    onLoadMore();
  }, [onLoadMore]);

  return (
    <div ref={ref} className={classNames('flex items-center justify-center', className)}>
      <Button
        className={buttonClassName}
        disabled={isLoading}
        onClick={onLoadMorePress}
        buttonType={Button.Type.Outline}
      >
        {title}
      </Button>
    </div>
  );
};
