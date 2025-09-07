# Walley Payment Provider Restoration Guide

This guide explains how to restore Walley payment functionality that was removed to optimize package size.

## Required Dependencies

No additional npm packages are required for Walley integration, as it uses the Brink API directly.

## Files to Restore

### 1. API Routes

Create the following API routes:

#### `src/app/api/checkout/walley/create-checkout/route.ts`

```typescript
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BRINK_API_URL;
  const xShopperApiKey = process.env.BRINK_SHOPPER_X_API_KEY ?? '';
  const headersList = headers();
  const authorization = headersList.get('authorization');

  try {
    const body = await req.json();

    const clientIp = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    const result = await fetch(`${baseUrl}-walley/checkout/`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization ?? '',
        'x-shopper-api-key': xShopperApiKey,
        'x-forwarded-for': clientIp,
      },
    });
    const session = await result.json();
    return NextResponse.json(session);
  } catch (err) {
    return NextResponse.json({ message: err, headers, success: false });
  }
}
```

#### `src/app/api/checkout/walley/get-checkout/route.ts`

```typescript
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BRINK_API_URL;
  const xShopperApiKey = process.env.BRINK_SHOPPER_X_API_KEY ?? '';
  const headersList = headers();
  const authorization = headersList.get('authorization');

  try {
    const clientIp = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
    const result = await fetch(`${baseUrl}-walley/checkout/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization ?? '',
        'x-shopper-api-key': xShopperApiKey,
        'x-forwarded-for': clientIp,
      },
    });
    const session = await result.json();
    return NextResponse.json(session);
  } catch (err) {
    return NextResponse.json({ message: err, headers, success: false });
  }
}
```

#### `src/app/api/checkout/walley/sync-checkout/route.ts`

```typescript
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BRINK_API_URL;
  const xShopperApiKey = process.env.BRINK_SHOPPER_X_API_KEY ?? '';
  const headersList = headers();
  const authorization = headersList.get('authorization');

  try {
    const clientIp = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
    const result = await fetch(`${baseUrl}-walley/checkout/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization ?? '',
        'x-shopper-api-key': xShopperApiKey,
        'x-forwarded-for': clientIp,
      },
    });
    const session = await result.json();
    return NextResponse.json(session);
  } catch (err) {
    return NextResponse.json({ message: err, headers, success: false });
  }
}
```

### 2. Components

Create the Walley component directory and files:

- `src/components/checkout/Walley/index.tsx`
- `src/components/checkout/Walley/Payment.tsx`
- `src/components/checkout/Walley/Confirmation.tsx`

### 3. Update Checkout Context

Add Walley functionality to `src/context/checkoutContext.tsx`:

```typescript
// Add to CheckoutContext interface
createWalleyCheckout: (merchantTermsUri: string, redirectPageUri: string) => Promise<void>;
syncWalleyCheckout: () => Promise<void>;
walleyCheckoutToken: string | undefined;

// Add to state variables
const [walleyCheckoutToken, setWalleyCheckoutToken] = useLocalStorage<string | undefined>(
  'walley-checkout-token',
  undefined,
);

// Add to clearCheckout function
setWalleyCheckoutToken(undefined);

// Add the functions
const createWalleyCheckout = async (merchantTermsUri: string, redirectPageUri: string) => {
  await fetch('/api/checkout/walley/create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${shopperCheckout?.token}`,
    },
    body: JSON.stringify({
      walley: {
        merchantTermsUri: merchantTermsUri,
        redirectPageUri: redirectPageUri,
      },
    }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    })
    .then((res) => {
      if (res.error) {
        throw new Error(res.error);
      }
      setWalleyCheckoutToken(res.walley.publicToken);
    })
    .catch((error) => console.error(error));
};

const syncWalleyCheckout = async () => {
  if (walleyCheckoutToken) {
    await fetch('/api/checkout/walley/sync-checkout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${shopperCheckout?.token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((res) => {
        setWalleyCheckoutToken(res.walley.publicToken);
      })
      .catch((error) => {
        console.error(error);
      });
  }
};

// Add to contextObject
createWalleyCheckout,
syncWalleyCheckout,
walleyCheckoutToken,
```

## Enable Feature Flag

Update `src/lib/features.ts` to enable Walley:

```typescript
export const PAYMENT_FEATURES = {
  KLARNA: true,
  WALLEY: true, // Set to true
  // ...
};
```
