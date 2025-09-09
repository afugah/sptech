interface IConfigurationRawSearchEngine {
  apiUrl?: string | null;
  apiKey?: string | null;
  apiWarehouseUrl?: string | null;
  defaultLanguage?: string | null;
}
interface IConfigurationRawSearchEngineWithMarket extends IConfigurationRawSearchEngine {
  shoplabId?: number | undefined | null;
}

interface IConfigurationRaw {
  search: {
    engine: string | null | undefined;
    defaultMarket: string | null | undefined;
    findify: { [key: string]: IConfigurationRawSearchEngineWithMarket } | null | undefined;
    algolia: { [key: string]: IConfigurationRawSearchEngineWithMarket } | null | undefined;
    elasticSearch: IConfigurationRawSearchEngine | null | undefined;
    typesense:
      | {
          host: string | null | undefined;
          port: number | null | undefined;
          protocol: string | null | undefined;
          apiKey: string | null | undefined;
          collection: string | null | undefined;
          defaultLanguage: string | null | undefined;
        }
      | null
      | undefined;
  };
  reviews: {
    apiUrl: string | null | undefined;
    apiKey: string | null | undefined;
    secretKey: string | null | undefined;
    provider: string | null | undefined;
  } | null;
  shoplab: {
    apiUrl: string | null | undefined;
    apiKey: string | null | undefined;
  };
  languages: string[] | null | undefined;
  defaultLanguage: string | null | undefined;
  debug: boolean;
}

export const appConfig: IConfigurationRaw = {
  search: {
    engine: process.env.SEARCH_ENGINE,
    defaultMarket: process.env.SEARCH_DEFAULT_MARKET,
    findify: null,
    algolia: null,
    elasticSearch: {
      apiUrl: process.env.SEARCH_ELASTIC_API_URL,
      apiKey: process.env.SEARCH_ELASTIC_API_KEY,
      apiWarehouseUrl: process.env.SEARCH_ELASTIC_WAREHOUSE_API_URL,
      defaultLanguage: process.env.SEARCH_ELASTIC_DEFAULT_LANGUAGE,
    },
    typesense: {
      host: process.env.SEARCH_TYPESENSE_HOST,
      port: process.env.SEARCH_TYPESENSE_PORT ? parseInt(process.env.SEARCH_TYPESENSE_PORT, 10) : null,
      protocol: process.env.SEARCH_TYPESENSE_PROTOCOL,
      apiKey: process.env.SEARCH_TYPESENSE_API_KEY,
      collection: process.env.SEARCH_TYPESENSE_COLLECTION,
      defaultLanguage: process.env.SEARCH_TYPESENSE_DEFAULT_LANGUAGE,
    },
  },
  reviews: process.env.REVIEWS_PROVIDER
    ? {
        provider: process.env.REVIEWS_PROVIDER,
        apiUrl: process.env.REVIEWS_LIPSCORE_API_URL,
        apiKey: process.env.REVIEWS_LIPSCORE_API_KEY,
        secretKey: process.env.REVIEWS_LIPSCORE_SECRET_KEY,
      }
    : null,
  shoplab: {
    apiUrl: process.env.SHOPLAB_API_URL,
    apiKey: process.env.SHOPLAB_TOKEN,
  },
  languages: process.env.LANGUAGES?.split(',').map((lang) => lang.toLowerCase()) ?? [],
  defaultLanguage: process.env.DEFAULT_LANGUAGE,
  debug: process.env.DEBUG === 'true',
};

const updateConfig = (provider: string, lang: string, key: string, value: string | undefined) => {
  if (provider !== 'findify' && provider !== 'algolia') return;

  if (!appConfig.search[provider]) appConfig.search[provider] = {};
  const providerBlock = appConfig.search[provider]!;

  if (!providerBlock[lang]) providerBlock[lang] = { defaultLanguage: lang };
  const langBlock = providerBlock[lang]!;

  if (key.endsWith(`_${lang}`.toUpperCase())) langBlock.defaultLanguage = value;
  else if (key.endsWith('_API_URL')) langBlock.apiUrl = value;
  else if (key.endsWith('_API_KEY')) langBlock.apiKey = value;
  else if (key.endsWith('_SHOPLAB_ID'))
    langBlock.shoplabId = typeof value === 'string' && !isNaN(+value) ? +value : null;
};

const searchEngineEnvs = Object.entries(process.env).filter(
  ([key]) => key.startsWith('SEARCH_FINDIFY_') || key.startsWith('SEARCH_ALGOLIA_'),
);

searchEngineEnvs.forEach(([key, value]) => {
  const providerMatch = key.match(/^SEARCH_(FINDIFY|ALGOLIA)_/);
  const languageMatch = key.match(/_(\w{2})($|_)/);

  if (providerMatch && languageMatch) {
    const provider = providerMatch[1].toLowerCase();
    const lang = languageMatch[1].toLowerCase();

    updateConfig(provider, lang, key, value);
  }
});

/**
 * Only for middleware since it doesn't support `reflect-metadata`
 *
 * Doesn't have any validation.
 */
export const getMarketAndLanguageListDangerously = (): [string[], string] => {
  // Handle Typesense separately as it uses a single language configuration
  if (appConfig.search.engine === 'TYPESENSE') {
    const locales = ['en']; // Single English locale for Typesense
    const defaultLocale = 'en';
    return [locales, defaultLocale];
  }

  const activeMarket = appConfig.search.engine === 'FINDIFY' ? appConfig.search.findify : appConfig.search.algolia;

  const languages: string[] = appConfig.languages!;

  const defaultMarket = appConfig.search.defaultMarket;

  const locales = Object.entries(activeMarket ?? {})
    .sort(([code]) => (defaultMarket ? (code === defaultMarket ? -1 : 0) : 0))
    .flatMap(([code, market]) => {
      if (!languages.length) return [code.toLowerCase()];

      return languages.map((lang) =>
        !!market && typeof market === 'object' && 'defaultLanguage' in market && market.defaultLanguage === lang
          ? code.toLowerCase()
          : `${code}-${lang}`.toLowerCase(),
      );
    });

  const defaultLocale =
    locales.find((locale) => locale === appConfig.defaultLanguage) || locales.find(() => true) || 'sv';

  if (!defaultLocale) {
    console.error('Default locale could not be resolved. Check appConfig and locales.');
  }

  return [locales, defaultLocale];
};
