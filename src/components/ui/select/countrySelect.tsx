'use client';

import { useLocale } from 'next-intl';
import React, { startTransition, useEffect, useMemo, useState } from 'react';
import { getLanguageByLocale, getLanguages, getMarkets } from '@/src/components/countrySelect/actions';
import { useCart } from '@/src/context/cartContext';
import { useCheckout } from '@/src/context/checkoutContext';
import { useRouter } from '@/src/i18n/navigation';
import { type IConfiguration } from '@/src/lib/configuration/Configuration';
import { getLanguage, getMarketCode } from '@/src/util/locale';

type ILanguageCodesItem = { code: string; label: string; countryCode: string };
type IMarketCodesItem = { currency: string; label: string; countryCode: string };
type ILanguageCodesItem1 = { code: string; label: string; countryCode: string }[];

const languageCodes1: ILanguageCodesItem1 = [
  { code: 'en', label: 'English', countryCode: 'gb' },
  { code: 'sv', label: 'Svenska', countryCode: 'se' },
  { code: 'no', label: 'Norsk', countryCode: 'no' },
  { code: 'fi', label: 'Suomi', countryCode: 'fi' },
];

const languageCodes: Record<string, ILanguageCodesItem> = {
  en: { code: 'en', label: 'English', countryCode: 'gb' },
  sv: { code: 'sv', label: 'Svenska', countryCode: 'se' },
  no: { code: 'no', label: 'Norsk', countryCode: 'no' },
  fi: { code: 'fi', label: 'Suomi', countryCode: 'fi' },
};

const marketCodes: Record<string, IMarketCodesItem> = {
  sv: { label: 'Sweden', countryCode: 'se', currency: 'SEK' },
  no: { label: 'Norway', countryCode: 'no', currency: 'NOK' },
  fi: { label: 'Finland', countryCode: 'fi', currency: 'EUR' },
  en: { label: 'Development', countryCode: 'gb', currency: 'EUR' },
};

const CountrySelector = ({ hasHeaderFixed, bgColor }: { hasHeaderFixed?: boolean; bgColor: boolean }) => {
  const { updateStore } = useCart();
  const { clearCheckout } = useCheckout();

  const router = useRouter();

  const locale = useLocale();
  const market = getMarketCode(locale);

  const [languages, setLanguages] = useState<IConfiguration['Languages']>([]);
  const [markets, setMarkets] = useState<IConfiguration['Search']['Markets']>([]);

  useEffect(() => {
    Promise.all([getMarkets(), getLanguages()]).then(([markets, languages]) => {
      setMarkets(markets);
      setLanguages(languages);
    });
  }, []);

  const [selectedMarketCode, setSelectedMarketCode] = useState<string>(market);
  const selectedMarket = useMemo<
    (IConfiguration['Search']['Markets'][0] & (typeof marketCodes)[string]) | undefined
  >(() => {
    const foundMarket = markets.find((c) => c.code === selectedMarketCode);
    if (!foundMarket) return undefined;

    return {
      ...foundMarket,
      ...marketCodes[selectedMarketCode],
    };
  }, [markets, selectedMarketCode]);

  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string | undefined>(getLanguage(locale));
  useEffect(() => {
    if (!languages.length) return;

    getLanguageByLocale(locale).then(setSelectedLanguageCode);
  }, [languages.length, locale]);

  const selectedLanguage = useMemo<(typeof languageCodes)[string] | undefined>(
    () => (selectedLanguageCode ? languageCodes[selectedLanguageCode] : undefined),
    [selectedLanguageCode],
  );
  // const onClose = useCallback(() => setIsCountrySelectOpen(false), [setIsCountrySelectOpen]);

  const handleMarketSelect = (marketCode: string) => {
    setSelectedMarketCode(marketCode);
  };

  // const handleLanguageSelect = (languageCode: string) => {
  //   setSelectedLanguageCode(languageCode);
  //   handleMarketSelect(languageCode as string);
  // };

  useEffect(() => {
    if (selectedMarket && selectedMarket.code !== market) {
      // let nextLocale = '';
      // if (selectedLanguage && selectedMarket.defaultLanguage === selectedLanguage.code) {
      //   nextLocale = `${selectedMarket.code}`;
      // } else if (!selectedLanguage || selectedMarket.defaultLanguage === selectedLanguage.code) {
      //   nextLocale = `${selectedMarket.code}`;
      // }
      const nextLocale =
        !selectedLanguage || selectedMarket.defaultLanguage === selectedLanguage.code
          ? selectedMarket.code
          : `${selectedMarket.code}-${selectedLanguage.code}`;

      startTransition(() => {
        router.replace('/', { locale: nextLocale });
      });

      const selectedCountryObj = marketCodes[selectedMarket.code];
      if (selectedCountryObj && market !== selectedMarket.code) {
        updateStore(selectedCountryObj.countryCode);
        clearCheckout();
      }
    }
  }, [selectedMarket, selectedLanguage, router, market, updateStore, clearCheckout]);

  function mergeCountryData(
    markets: { code: string; defaultLanguage: string; shoplabId: number }[],
    marketCodes: Record<string, IMarketCodesItem>,
  ) {
    return markets?.map((config) => {
      const details = marketCodes[config.code];
      return {
        ...config,
        ...details,
      };
    });
  }

  const mergedMarkets = useMemo(() => mergeCountryData(markets, marketCodes), [markets]);

  return (
    <div className={'hidden text-[0.8rem] lg:flex lg:items-center lg:space-x-2'}>
      <select
        className={`${hasHeaderFixed && bgColor ? 'bg-transparent text-white' : 'bg-white text-black'} w-[90px] rounded border border-gray-300 px-3 py-1 text-[0.8rem]`}
        value={selectedLanguage?.code || ''}
        onChange={() => {
          // Handle language change
        }}
      >
        {languageCodes1.map((lang) => (
          <option key={lang.code} value={lang.code} className={'text-black'}>
            {lang.code.toUpperCase()}
          </option>
        ))}
      </select>
      <select
        className={`${hasHeaderFixed && bgColor ? 'bg-transparent text-white' : 'bg-white text-black'} w-[100px] rounded border border-gray-300 px-3 py-1 text-[0.8rem]`}
        value={selectedMarketCode}
        onChange={(e) => {
          handleMarketSelect(e.target.value);
        }}
      >
        {mergedMarkets?.map((market) => (
          <option key={market.code} value={market.code} className={'text-black'}>
            {market.currency}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountrySelector;
