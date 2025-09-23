'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'use-intl';
import QuoteSvg from '@/src/images/icons/quote.svg';
import { getLocalizedString, type LocalizedString } from '@/src/lib/utils/localization';

interface IProductQuoteProps {
  quote: LocalizedString;
  quoteBy?: LocalizedString;
}

const ProductQuote = ({ quote, quoteBy }: IProductQuoteProps) => {
  const locale = useLocale();
  const t = useTranslations('common');
  const [isExpanded, setIsExpanded] = useState(false);

  const fullQuote = getLocalizedString(quote, locale);
  const shouldTruncate = fullQuote.length > 100;
  const displayQuote = shouldTruncate && !isExpanded ? `${fullQuote.slice(0, 100)}...` : fullQuote;

  return (
    <div className={'relative order-8 my-5 md:order-3 md:my-1'}>
      <QuoteSvg className={'absolute left-0 -ml-4 h-24 w-32 rotate-180'} />
      <div className={'relative z-10 pb-6 pt-6'}>
        <span className={'font-serif text-2xl md:text-3xl'}>
          {displayQuote}
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={'ml-2 font-sans text-sm text-gray-600 hover:text-gray-800'}
            >
              {isExpanded ? '« ' + t('view-less') : t('view-more') + ' »'}
            </button>
          )}
        </span>
        {quoteBy && <p className={'mt-2 text-xs uppercase text-gray-800'}>{getLocalizedString(quoteBy, locale)}</p>}
      </div>
    </div>
  );
};

export default ProductQuote;
