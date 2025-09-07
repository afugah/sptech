import ArrowShortDown from '@images/icons/arrow-short-down.svg';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { SafeHTML } from '@/src/components/ui/SafeHTML';

interface IProductInfoDescriptionProps {
  description: string;
}

export const ProductInfoDescription: React.FC<IProductInfoDescriptionProps> = ({ description }) => {
  const t = useTranslations('');

  const [isExpanded, setIsExpanded] = useState(false);

  const isShort = useMemo(() => (description || '').length < 300, [description]);

  if (!description) return <p className={'text-xs text-gray-700'}></p>;

  return (
    <div>
      <div className={'relative text-xs'}>
        <SafeHTML
          html={description}
          tag={'p'}
          className={classNames('whitespace-pre-wrap transition-all', { 'line-clamp-3': !isShort && !isExpanded })}
        />

        {!isShort && !isExpanded && (
          <div
            onClick={() => setIsExpanded(true)}
            className={'absolute bottom-0 left-0 h-12 w-full cursor-pointer bg-gradient-to-t from-white to-transparent'}
          />
        )}
      </div>

      {!isShort && (
        <button
          onClick={() => setIsExpanded((s) => !s)}
          className={'flex w-full flex-row items-center justify-center pt-4 text-center text-xs uppercase'}
        >
          {isExpanded ? t('common.view-less') : t('common.view-more')}

          <ArrowShortDown
            className={'ml-2 h-5 transition-transform duration-300'}
            style={{ transform: `rotate(${isExpanded ? -180 : 0}deg)` }}
          />
        </button>
      )}
    </div>
  );
};
