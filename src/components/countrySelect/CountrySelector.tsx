'use client';

import { useTranslations } from 'next-intl';
import React, { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from 'use-intl';
import { getLanguageByLocale, getLanguages, getMarkets } from '@/src/components/countrySelect/actions';
import { useCart } from '@/src/context/cartContext';
import { useCheckout } from '@/src/context/checkoutContext';
import { usePage } from '@/src/context/pageContext';
import { useRouter } from '@/src/i18n/navigation';
import { type IConfiguration } from '@/src/lib/configuration/Configuration';
import { getLanguage, getMarketCode } from '@/src/util/locale';
import { Drawer } from '../ui/Drawer';
import FlagIcon from '../ui/FlagIcon';
import { Select } from '../ui/select';

type ILanguageCodesItem = { code: string; label: string; countryCode: string };
type IMarketCodesItem = { currency: string; label: string; countryCode: string };

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

interface CountrySelectorProps {
  hasHeaderFixed?: boolean;
  bgColor?: boolean;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ hasHeaderFixed: _hasHeaderFixed, bgColor: _bgColor }) => {
  const t = useTranslations();

  const { updateStore } = useCart();
  const { clearCheckout } = useCheckout();
  const { isCountrySelectOpen, setIsCountrySelectOpen } = usePage();

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

  const onClose = useCallback(() => setIsCountrySelectOpen(false), [setIsCountrySelectOpen]);

  const handleMarketSelect = (marketCode: string) => {
    setSelectedMarketCode(marketCode);
  };

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguageCode(languageCode);
  };

  useEffect(() => {
    if (selectedMarket && selectedMarket.code !== market) {
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

      onClose();
    }
  }, [selectedMarket, selectedLanguage, market, router, updateStore, clearCheckout, onClose]);

  return (
    <Drawer
      onClose={onClose}
      open={isCountrySelectOpen}
      title={t('common.language-and-shipping')}
      subtitle={t('common.language-and-shipping-description')}
      bodyClassName={'flex-1'}
    >
      <div className={'mb-14 flex w-full flex-1 flex-col items-center gap-4 px-14'}>
        {!!languages.length && (
          <Select
            emptyElement={t('common.loading')}
            label={t('common.language')}
            selectedItem={selectedLanguage?.code}
            items={languages}
            onSelect={(lang: string) => handleLanguageSelect(lang)}
            renderSelectedItem={(item) => {
              const lang = languageCodes[item];
              return (
                <>
                  <span className={'h-4 w-4'}>
                    <FlagIcon countryCode={lang.countryCode} />
                  </span>
                  <span className={'ml-2'}>{lang.label}</span>
                </>
              );
            }}
            renderItem={(item) => {
              const lang = languageCodes[item];
              return (
                <>
                  <span className={'h-4 w-4'}>
                    <FlagIcon countryCode={lang.countryCode} />
                  </span>

                  <span className={'ml-2'}>{lang.label}</span>
                </>
              );
            }}
            getItemKey={(item) => item}
          />
        )}

        <Select
          disabled={!markets.length}
          emptyElement={t('common.loading')}
          label={t('common.language-and-shipping')}
          selectedItem={selectedMarket}
          items={markets}
          onSelect={(market) => handleMarketSelect(market.code)}
          renderSelectedItem={(item) => {
            const market = marketCodes[item.code];
            return (
              <>
                <span className={'h-4 w-4'}>
                  <FlagIcon countryCode={market.countryCode} />
                </span>
                <span className={'ml-2 text-sm'}>
                  {market.label} ({market.currency})
                </span>
              </>
            );
          }}
          renderItem={(item) => {
            const market = marketCodes[item.code];
            return (
              <>
                <span className={'h-4 w-4'}>
                  <FlagIcon countryCode={market.countryCode} />
                </span>
                <span className={'ml-2 text-sm'}>
                  {market.label} ({market.currency})
                </span>
              </>
            );
          }}
          getItemKey={(item) => item.code}
        />
      </div>
    </Drawer>
  );
};

export default CountrySelector;
