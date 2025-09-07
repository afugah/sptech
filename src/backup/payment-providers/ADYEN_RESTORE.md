# Adyen Payment Provider Restoration Guide

This guide explains how to restore Adyen payment functionality that was removed to optimize package size.

## Required Dependencies

Add these dependencies to your package.json:

```json
{
  "dependencies": {
    "@adyen/adyen-web": "^5.47.0",
    "@adyen/api-library": "^13.1.3"
  }
}
```

Then run `yarn` to install them.

## Files to Restore

### 1. Type Definitions

Create file: `src/lib/types/adyen.ts`

```typescript
export interface AdyenSessionsRequest {
  adyen: {
    returnUrl: string;
    shopperLocale?: string;
    countryCode: string;
    shopperName: AdyenName;
    deliveryAddress: AdyenAddress;
    billingAddress: AdyenAddress;
  };
}

export interface AdyenName {
  firstName: string;
  lastName: string;
}

export interface AdyenAddress {
  city: string;
  country: string;
  houseNumberOrName: string;
  postalCode: string;
  street: string;
}

export interface AdyenSessionsResponse {
  id: string;
  sessionData: string;
  amount: {
    currency: string;
    value: number;
  };
  countryCode: string;
  expiresAt: string;
  merchantAccount: string;
  returnUrl: string;
  shopperLocale: string;
}

export interface ConfirmationResponse {
  resultCode: string;
}
```

### 2. Update Types Index

Update `src/lib/types/index.ts` to include Adyen:

```typescript
import type * as Adyen from './adyen';
// ... other imports

export type { Common, Session, Adyen, KlarnaCheckout, Store, Ingrid, Voyado };
```

### 3. API Routes

Create API route: `src/app/api/checkout/adyen/start-session/route.ts`

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

    const result = await fetch(`${baseUrl}-adyen/sessions/`, {
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

### 4. Components

Create the following component files:

- `src/components/checkout/Adyen/index.tsx`
- `src/components/checkout/Adyen/Payment.tsx`
- `src/components/checkout/Adyen/Confirmation.tsx`

### 5. Update Checkout Context

Add Adyen functionality to `src/context/checkoutContext.tsx`:

```typescript
// Add to imports
import { type AdyenSessionsRequest, type AdyenSessionsResponse } from '@lib/types/adyen';

// Add to CheckoutContext interface
startAdyenSession: (adyenOptions: AdyenSessionsRequest) => void;
adyenSession: AdyenSessionsResponse | undefined;

// Add to state variables
const [adyenSession, setAdyenSession] = useState<AdyenSessionsResponse>();

// Add the function
const startAdyenSession = async (adyenOptions: AdyenSessionsRequest) => {
  setAdyenSession(undefined);
  await fetch('/api/checkout/adyen/start-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${shopperCheckout?.token}`,
    },
    body: JSON.stringify({
      adyen: adyenOptions.adyen,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    })
    .then((res) => {
      setAdyenSession(res);
    })
    .catch((error) => console.error(error));
};

// Add to contextObject
startAdyenSession,
adyenSession,
```

## Enable Feature Flag

Update `src/lib/features.ts` to enable Adyen:

```typescript
export const PAYMENT_FEATURES = {
  KLARNA: true,
  ADYEN: true, // Set to true
  // ...
};
```
