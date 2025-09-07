import React from 'react';
import { cn } from '@/lib/utils';

interface Props {
  title?: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  titleSize?: string;
  hideTitleOnMobile?: boolean;
}

const TitleSubtitle = ({ title, subtitle, titleColor, subtitleColor, titleSize, hideTitleOnMobile }: Props) => {
  return (
    <div className={'relative w-full pb-2'}>
      {!!title && (
        <h2
          style={{
            color: titleColor,
          }}
          className={cn(
            'md:text-x relative z-10 pb-8 pt-11 text-center font-lato text-sm font-bold uppercase sm:pt-14 md:pb-16 md:pt-16',
          )}
        >
          {title}
        </h2>
      )}
      {!!subtitle && (
        <h4
          className={cn(
            `absolute left-0 right-0 top-0 z-0 pb-6 pt-9 text-center  font-didot font-medium uppercase  text-opacity-60 lg:pt-5`,
            titleSize,
            hideTitleOnMobile && 'hidden sm:block',
          )}
          style={{
            color: subtitleColor,
          }}
        >
          {subtitle}
        </h4>
      )}
    </div>
  );
};

export default TitleSubtitle;
