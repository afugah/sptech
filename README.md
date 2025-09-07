## Getting Started

To be able to start demo shop retail locally it requires .env.local file, env.example specifies requried credentials.

Store group, store market(s) and providers needs to be configured in Brink Merchant Portal.

## Providers handled in demo shop retail:

Shipping providers:

- Klarna Shipping

Payment providers:

- Klarna Payment (active)
- Adyen (disabled)
- Walley (disabled)
- Qliro (disabled)
- Svea (disabled)

Gift card providers:

- Retain24

Promotion providers:

- Voyado

## Available Scripts

In the project directory, you can run:

### `yarn`

Installs dependencies.

### `yarn generate-bloom-filter`

Generates bloom filters for redirects.

### `yarn dev`

Runs the app in the development mode.\
Open [https://localhost:3000](https://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn lint`

Run lint rules on source code.

### `next build`

Builds the app for production.

### `next start`

Start the app from build.

## Storyblok Sync CLI [https://github.com/storyblok/storyblok-cli]

# Sync components and stories from `00001` space to `00002` space

storyblok sync --type components,stories --source 00001 --target 00002

## Storyblok type generation

First you need to fetch components from Storyblok.

### `npx storyblok pull-components --space=XXXXXX`

Then double-check if the your `XXXXXX` is correct in `scripts/generate-storyblok-types.mjs` import.

Then generate component types in `src/types/framework/storyblok-components.ts` with:

### `yarn storyblok`

## Payment Provider Feature Flags

This project uses a feature flags system to manage payment providers. This approach optimizes package size and Fast Data Transfer metrics while maintaining the flexibility to add payment providers when needed.

### Currently Active Payment Providers

- **Klarna**: The primary payment provider used in this project.

### How to Enable Additional Payment Providers

To enable a previously disabled payment provider, follow these steps:

1. **Update Feature Flags**

   Edit the feature flags in `src/lib/features.ts` to enable the desired provider:

   ```typescript
   export const PAYMENT_FEATURES = {
     KLARNA: true,
     ADYEN: true, // Set to true to enable
     // ...
   };
   ```

2. **Install Required Dependencies**

   Add the required dependencies to your package.json and install them with Yarn.
   For example, for Adyen:

   ```bash
   yarn add @adyen/adyen-web @adyen/api-library
   ```

3. **Restore Code**

   Follow the restoration guide in the appropriate file in the `src/backup/payment-providers/` directory:

   - `ADYEN_RESTORE.md`
   - `WALLEY_RESTORE.md`
   - `QLIRO_RESTORE.md`

   These guides contain all the code and steps needed to restore each payment provider.

### Analyzing Bundle Size

To analyze your bundle size and see the impact of your optimizations, run:

```bash
ANALYZE=true yarn build
```
