import React from 'react';
import { cn } from '@/lib/utils';

interface Props {
  title?: string;
  titleColor?: string;
  titleSize?: string;
}

const TitleSubtitle = ({ title, titleColor, titleSize }: Props) => {
  return (
    <div className={'w-full px-8'}>
      {!!title && (
        <h2
          style={{
            color: titleColor,
          }}
          className={cn('pb-6', titleSize)}
        >
          {title}
        </h2>
      )}
    </div>
  );
};

export default TitleSubtitle;
