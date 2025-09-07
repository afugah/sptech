/** @type {import('next').NextConfig} */

const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

const { headers } = require('./next.csp');
const { redirects } = require('./next.redirects');
const path = require('path');

const nextConfig = {
  headers,
  redirects,
  // External packages for server components
  serverExternalPackages: ['firebase-admin', 'jsonwebtoken', 'class-validator', 'class-transformer'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'a.storyblok.com' },
      { protocol: 'https', hostname: 'd13fz3ub690kw1.cloudfront.net' },
      { protocol: 'https', hostname: 'cdn.shoplab.io' },
      { protocol: 'https', hostname: 'shoplab.b-cdn.net' },
      { protocol: 'https', hostname: 's3.amazonaws.com' },
      { protocol: 'https', hostname: 'www.wp.tech' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'cms.sp.tech', pathname: '/api/**' },
      { protocol: 'http', hostname: 'localhost', port: '3200', pathname: '/api/**' },
      { protocol: 'http', hostname: 'localhost', port: '3500', pathname: '/api/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/api/**' },
    ],
    // Phase 4: Enhanced image optimization for Vercel Edge Network
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [25, 50, 60, 75, 80, 100],
    minimumCacheTTL: 31536000, // 1 year for better Edge Network caching
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'log', 'warn', 'debug', 'info'],
          }
        : false,
  },
  reactStrictMode: false,
  // Disable source maps in production to prevent missing source map errors
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  // Next.js 15 optimizations
  compress: true,
  generateEtags: true,
  httpAgentOptions: {
    keepAlive: true,
  },
  typedRoutes: false, // Can be enabled for better type safety (moved from experimental)
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
    // Disable the Next.js plugin detection warning since we use flat config
    dirs: ['src', 'app', 'pages', 'components', 'lib', 'utils'],
  },
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', '@storyblok/react', 'next-intl'],
    optimizeCss: true,
    reactCompiler: true, // React Compiler enabled for automatic memoization
    // Phase 4: Bundle Optimization
    webVitalsAttribution: ['CLS', 'LCP'],
    // Enhanced caching for Vercel optimization
    cpus: 1, // Optimize for Vercel Edge Functions
  },
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const configWithWebpack = {
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.('.svg'));

    if (process.env.NODE_ENV === 'production') {
      // Disable source maps in production
      config.devtool = false;

      // Phase 4: Conservative bundle optimization for production
      // Keep Next.js default splitting behavior to avoid SSR issues
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // Only add CSS optimization
            styles: {
              name: 'styles',
              test: /\.css$/,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };
    }

    // SVG handling
    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
    );
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
  ...nextConfig,
};

module.exports = withNextIntl(withBundleAnalyzer(configWithWebpack));
