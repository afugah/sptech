# Qliro Payment Provider Restoration Guide

This guide explains how to restore Qliro payment functionality that was removed to optimize package size.

## Required Dependencies

No additional npm packages are required for Qliro integration, as it uses the Brink API directly.

## Files to Restore

### 1. Type Definitions

Create file: `src/lib/types/qliro.ts`

```typescript
export interface OrderDetailsResponse {
  id: string;
  status: string;
  merchantReference: string;
  orderReference: string;
  snippet: string;
  // Add other fields as needed based on your implementation
}
```

### 2. Update Types Index

Update `src/lib/types/index.ts` to include Qliro:

```typescript
import type * as Qliro from './qliro';
// ... other imports

export type { Common, Session, KlarnaCheckout, Store, Ingrid, Qliro, Voyado };
```

### 3. API Routes

Create the following API routes:

#### `src/app/api/checkout/qliro/create-order/route.ts`

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

    const result = await fetch(`${baseUrl}-qliro/order/`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization ?? '',
        'x-shopper-api-key': xShopperApiKey,
        'x-forwarded-for': clientIp,
      },
    });
    const order = await result.json();
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ message: err, headers, success: false });
  }
}
```

#### `src/app/api/checkout/qliro/get-order/route.ts`

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
    const result = await fetch(`${baseUrl}-qliro/order/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization ?? '',
        'x-shopper-api-key': xShopperApiKey,
        'x-forwarded-for': clientIp,
      },
    });
    const order = await result.json();
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ message: err, headers, success: false });
  }
}
```

#### `src/app/api/checkout/qliro/sync-order/route.ts`

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
    const result = await fetch(`${baseUrl}-qliro/order/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization ?? '',
        'x-shopper-api-key': xShopperApiKey,
        'x-forwarded-for': clientIp,
      },
    });
    const order = await result.json();
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ message: err, headers, success: false });
  }
}
```

### 4. Components

Create the Qliro component directory and files:

- `src/components/checkout/Qliro/index.tsx`
- `src/components/checkout/Qliro/Payment.tsx`
- `src/components/checkout/Qliro/Confirmation.tsx`

### 5. Update Checkout Context

Add Qliro functionality to `src/context/checkoutContext.tsx`:

```typescript
// Add to imports
import { type OrderDetailsResponse } from '@lib/types/qliro';

// Add to CheckoutContext interface
createQliroOneOrder: (merchantTermsUri: string, merchantConfirmationUrl: string) => Promise<void>;
syncQliroOneOrder: () => Promise<void>;
qliroOneOrder: OrderDetailsResponse | undefined;

// Add to state variables
const [qliroOneOrder, setQliroOneOrder] = useState<OrderDetailsResponse | undefined>(undefined);
const [qliroOneUrl, setQliroOneUrl] = useState<{ merchantTermsUri: string; merchantConfirmationUrl: string }>();

// Add to startCheckout function
setQliroOneOrder(undefined);

// Add the functions
const getQliroOneOrder = async () => {
  await fetch('/api/checkout/qliro/get-order', {
    method: 'GET',
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
      if (res.error) {
        throw new Error(res.error);
      }
      setQliroOneOrder(res);
    })
    .catch((error) => console.error(error));
};

const createQliroOneOrder = async (merchantTermsUri: string, merchantConfirmationUrl: string) => {
  setQliroOneUrl({ merchantTermsUri, merchantConfirmationUrl });
  await fetch('/api/checkout/qliro/create-order', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${shopperCheckout?.token}`,
    },
    body: JSON.stringify({
      qliro: {
        merchantTermsUrl: merchantTermsUri,
        merchantConfirmationUrl: merchantConfirmationUrl,
        primaryColor: '#00AB84',
        callToActionColor: '#47e0c2',
        callToActionHoverColor: '#e5ecf1',
        backgroundColor: '#ffffff',
        cornerRadius: 5,
        buttonCornerRadius: 5,
        customerInformation: {
          PersonalNumber: '790625-5307',
          Email: 'test@brinkcommerce.com',
          MobileNumber: '46101010101',
        },
        askForNewsletterSignup: true,
        askForNewsletterSignupChecked: false,
        askForNewsletterSignupText: `C'mon, sign up please!`,
        merchantProvidedQuestion: {
          text: 'Join our community?',
          checked: true,
        },
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
      getQliroOneOrder();
    })
    .catch((error) => console.error(error));
};

const syncQliroOneOrder = async () => {
  if (qliroOneOrder) {
    await fetch('/api/checkout/qliro/sync-order', {
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
      .then(() => {
        getQliroOneOrder();
      })
      .catch((error) => {
        console.error(error);
        if (qliroOneUrl) {
          createQliroOneOrder(qliroOneUrl.merchantTermsUri, qliroOneUrl.merchantConfirmationUrl);
        }
      });
  }
};

// Add to contextObject
createQliroOneOrder,
syncQliroOneOrder,
qliroOneOrder,
```

## Enable Feature Flag

Update `src/lib/features.ts` to enable Qliro:

```typescript
export const PAYMENT_FEATURES = {
  KLARNA: true,
  QLIRO: true, // Set to true
  // ...
};
```
