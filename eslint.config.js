const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const typescript = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const next = require('@next/eslint-plugin-next');
const prettier = require('eslint-plugin-prettier');
const importPlugin = require('eslint-plugin-import');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const unusedImports = require('eslint-plugin-unused-imports');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  js.configs.recommended,
  // Include Next.js ESLint config for proper detection
  ...compat.extends('next/core-web-vitals'),
  
  // TypeScript and React configuration
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        crypto: 'readonly',
        google: 'readonly',
        // Node.js globals
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'writable',
        // TypeScript globals
        NodeJS: 'readonly',
        string: 'readonly',
        // Browser storage
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        // Google/external globals
        Gtag: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      '@next/next': next,
      'prettier': prettier,
      'import': importPlugin,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
      },
    },
    rules: {
      // Core ESLint rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'eqeqeq': 'error',
      'linebreak-style': ['warn', 'unix'],
      'semi': ['error', 'always'],
      'no-constant-binary-expression': 'off', // Temporarily disabled - too strict
      'no-redeclare': 'off', // Temporarily disabled for context issues
      'no-empty': 'warn', // Changed from error to warning
      'no-dupe-class-members': 'off', // Disabled for TypeScript method overloads

      // TypeScript rules
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { fixStyle: 'inline-type-imports', prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn', // Changed from error to warning
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-namespace': 'off',

      // React rules (updated for React 19)
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/jsx-uses-react': 'off', // Not needed in React 17+
      'react/jsx-curly-brace-presence': [
        'warn',
        {
          props: 'always',
          propElementValues: 'always',
        },
      ],
      'react/jsx-key': 'error',
      'react/prop-types': 'off', // We use TypeScript
      'react/display-name': 'off',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import rules
      'import/consistent-type-specifier-style': ['warn', 'prefer-inline'],
      'import/no-unresolved': [
        'error',
        {
          ignore: ['styled-components', 'lodash'],
        },
      ],
      'import/named': 'off', // Temporarily disabled for lodash issues
      'import/default': 'error',
      'import/namespace': 'error',

      // Simple import sort
      'simple-import-sort/imports': [
        'error',
        { groups: [['^\\u0000', '^node:', '^@?\\w', '^', '^\\.']] },
      ],
      'simple-import-sort/exports': 'error',

      // Unused imports
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // Prettier
      'prettier/prettier': 'warn',

      // Next.js specific rules
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'error',
      '@next/next/no-unwanted-polyfillio': 'error',
      '@next/next/no-page-custom-font': 'error',

      // Restricted imports (i18n routing)
      'no-restricted-imports': [
        'error',
        {
          name: 'next/link',
          message: 'Please import from `@/i18n/routing` instead.',
        },
        {
          name: 'next/navigation',
          importNames: ['redirect', 'useRouter', 'usePathname'],
          message: 'Please import from `@/i18n/routing` instead.',
        },
      ],
    },
  },

  // Shadcn components override
  {
    files: ['components/shadcn/**/*.{ts,tsx}'],
    rules: {
      'simple-import-sort/imports': 'off',
      'semi': 'off',
      'prettier/prettier': 'off',
    },
  },

  // Test files
  {
    files: ['**/*.test.{js,ts,jsx,tsx}', '**/*.spec.{js,ts,jsx,tsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Config files
  {
    files: ['*.config.{js,ts}', '*.config.*.{js,ts}'],
    languageOptions: {
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Ignore patterns (migrated from .eslintignore)
  {
    ignores: [
      // Dependencies
      'node_modules/**',
      '.pnp/**',
      '.pnp.js',
      
      // Testing
      'coverage/**',
      'tests/**',
      
      // Next.js
      '.next/**',
      'out/**',
      'public/**',
      'next-env.d.ts',
      
      // Production
      'build/**',
      'dist/**',
      
      // Misc
      '.DS_Store',
      '*.pem',
      
      // Debug
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      
      // Local env files
      '.env*.local',
      
      // Vercel
      '.vercel/**',
      
      // TypeScript
      '*.tsbuildinfo',
      
      // Storyblok generated files
      '.storyblok/**',
      
      // Bloom filters
      'src/redirects/bloom-filters.json',
      
      // Cache files
      '.eslintcache',
      '*.cache',
      
      // Generated files
      '*.generated.*',
      '*.gen.ts',
      
      // Backup files
      'src/backup/**',
      
      // Documentation
      'docs/**',
      'documentation/**',
      '*.md',
      
      // Config files
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
      '*.config.ts',
      
      // Bundle optimization scripts (previously added)
      'src/lib/bundle-analysis.js',
      'src/lib/optimization/**',
      'package-optimization.sh',
      
      // Git
      '.git/**',
      
      // Minified files
      '*.min.js',
    ],
  },
];