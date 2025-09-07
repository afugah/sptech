'use client';

import ArrowLeft from '@images/icons/arrow-left.svg';
import ArrowRight from '@images/icons/arrow-right.svg';
import classNames from 'classnames';
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

interface IHorizontalGridProps {
  title?: string;
  children: React.ReactNode;

  height?: number;
  elementWidth?: number;
  /**
   * Percentage of the scrollable width to scroll by clicking the button
   * @default 0.3
   */
  scrollPercentage?: number;

  className?: string;
}

export const HorizontalScrollGrid: React.FC<IHorizontalGridProps> = ({
  title,
  children,
  height = 600,
  elementWidth = 400,
  scrollPercentage = 0.3,
  className,
}) => {
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const isValidScrollPercentage = useMemo(() => scrollPercentage > 0 || scrollPercentage <= 1, [scrollPercentage]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft + clientWidth < scrollWidth);
  }, []);

  const scrollByAmount = (amount: number) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth * amount, behavior: 'smooth' });
  };

  const scrollLeft = () => scrollByAmount(-scrollPercentage);
  const scrollRight = () => scrollByAmount(scrollPercentage);

  useLayoutEffect(() => {
    if (!scrollRef.current) return;

    const currentScrollRef = scrollRef.current;

    currentScrollRef.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      currentScrollRef.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  /* #endregion */

  const iterateOverChildren = (children: React.ReactNode) =>
    React.Children.map(children, (child): React.ReactNode => {
      if (!React.isValidElement(child)) return child;

      return (
        <div style={{ width: elementWidth, height }} className={'relative flex-none overflow-hidden'}>
          {child}
        </div>
      );
    });

  return (
    <div className={classNames('relative', className)}>
      {!!title && <h2 className={'pb-6 pt-8 text-center font-serif text-3xl'}>{title}</h2>}

      <div className={'relative flex items-center justify-center'}>
        {isValidScrollPercentage && showLeftButton && (
          <button
            className={
              'absolute left-0 z-20 ml-3 rounded-full bg-seashell px-5 py-2 opacity-60 shadow-lg hover:bg-seashell-700 hover:opacity-80'
            }
            onClick={scrollLeft}
          >
            <ArrowLeft className={'w-5'} />
          </button>
        )}

        <div
          className={classNames('hide-scrollbar relative flex gap-x-3 overflow-x-scroll scroll-smooth')}
          ref={scrollRef}
        >
          {iterateOverChildren(children)}
        </div>

        {isValidScrollPercentage && showRightButton && (
          <button
            className={
              'absolute right-0 mr-3 rounded-full bg-seashell px-5 py-2 opacity-60 shadow-lg hover:bg-seashell-700 hover:opacity-80'
            }
            onClick={scrollRight}
          >
            <ArrowRight className={'w-5'} />
          </button>
        )}
      </div>
    </div>
  );
};
