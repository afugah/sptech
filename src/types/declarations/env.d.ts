namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_STORE_NAME: string;
    NEXT_PUBLIC_ENVIRONMENT: string;
    NEXT_PUBLIC_PREVIEW_ENVIRONMENT: string;

    /* #region PayloadCMS Live Preview */
    NEXT_PUBLIC_ENABLE_LIVE_PREVIEW: string;
    NEXT_PUBLIC_PAYLOAD_SERVER_URL: string;
    PAYLOAD_PREVIEW_TOKEN: string;
    /* #endregion */

    NEXT_PUBLIC_BRINK_ENV: string;
    NEXT_PUBLIC_BRINK_API_URL: string;
    NEXT_PUBLIC_BRINK_STORE_GROUP_ID: string;
    NEXT_PUBLIC_BRINK_STORE_GROUP_INVENTORY: string | undefined | null;
    NEXT_PUBLIC_STORYBLOK_TOKEN: string;
    NEXT_PUBLIC_GTM_ID: string;
    NEXT_PUBLIC_GOOGLE_MAP_API: string;
    NEXT_PUBLIC_RECOMMENDATIONS: string | undefined | null;

    NEXT_PUBLIC_GIFT_CARDS: string | undefined | null;

    DEBUG: string | undefined | null;

    CACHE_INVALIDATION_SECRET: string | undefined | null;

    LANGUAGES: string;
    DEFAULT_LANGUAGE: string;

    /* #region Search Engine */

    SEARCH_ENGINE: 'FINDIFY' | 'ALGOLIA';
    SEARCH_DEFAULT_MARKET: string;

    [`SEARCH_FINDIFY_${string}`]: string | undefined | null;
    [`SEARCH_FINDIFY_${string}_API_URL`]: string | undefined | null;
    [`SEARCH_FINDIFY_${string}_API_KEY`]: string | undefined | null;

    [`SEARCH_ALGOLIA_${string}`]: string | undefined | null;
    [`SEARCH_ALGOLIA_${string}_API_URL`]: string | undefined | null;
    [`SEARCH_ALGOLIA_${string}_API_KEY`]: string | undefined | null;
    [`SEARCH_ALGOLIA_${string}_APP_ID`]: string | undefined | null;
    [`SEARCH_ALGOLIA_${string}_INDEX_NAME`]: string | undefined | null;

    SEARCH_ELASTIC_API_URL: string;
    SEARCH_ELASTIC_WAREHOUSE_API_URL: string;
    SEARCH_ELASTIC_API_KEY: string;
    SEARCH_ELASTIC_DEFAULT_LANGUAGE: string;

    /* #endregion */

    /* #region Reviews */
    REVIEWS_PROVIDER: string | undefined | null;
    REVIEWS_LIPSCORE_API_URL: string | undefined | null;
    REVIEWS_LIPSCORE_API_KEY: string | undefined | null;
    REVIEWS_LIPSCORE_SECRET_KEY: string | undefined | null;
    /* #endregion */

    BRINK_SHOPPER_X_API_KEY: string;
    NEXT_PUBLIC_BRINK_STORE_GROUPS: string | undefined | null;

    RETAIN24_TEMPLATE_ID: string;

    SHOPLAB_API_URL: string;
    SHOPLAB_TOKEN: string;

    VOYADO_ENGAGE_API_URL: string;
    VOYADO_ENGAGE_API_KEY: string;
    VOYADO_ENGAGE_SOFT_KEY: string;

    /* #region Auth */
    AUTH_SECRET: string;
    AUTH_SENDGRID_KEY: string;
    AUTH_SENDGRID_FROM: string;
    AUTH_FIREBASE_CLIENT_EMAIL: string;
    AUTH_FIREBASE_PRIVATE_KEY: string;
    NEXT_PUBLIC_AUTH_FIREBASE_PROJECT_ID: string;
    NEXT_PUBLIC_AUTH_FIREBASE_API_KEY: string;
    NEXT_PUBLIC_AUTH_FIREBASE_DOMAIN: string;
    NEXT_PUBLIC_AUTH_FIREBASE_STORAGE_BUCKET: string;
    NEXT_PUBLIC_AUTH_FIREBASE_MESSAGING_SENDER_ID: string;
    NEXT_PUBLIC_AUTH_FIREBASE_APP_ID: string;
    /* #endregion */
  }
}
