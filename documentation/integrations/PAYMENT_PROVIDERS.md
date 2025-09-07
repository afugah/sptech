# Payment Providers Integration

## Overview

The SP Tech platform uses a **multi-provider payment architecture** with feature flag controls, allowing for flexible payment method management and easy provider switching.

---

## 🏗️ **Architecture Overview**

### **Current Payment Ecosystem**
- **Primary Provider**: Klarna (Active)
- **Alternative Providers**: Adyen, Walley, Qliro, Svea (Feature-flagged)
- **Architecture**: Plugin-based with dependency injection
- **Control**: Feature flag system in `src/lib/features.ts`

### **Payment Flow Architecture**
```
User Checkout → Feature Flag Check → Provider Selection → Payment Processing → Order Completion
```

---

## ✅ **Active Payment Providers**

### **Klarna**
**Status**: ✅ Active (Primary)  
**Integration**: Full implementation  
**Components**: 
- `src/components/checkout/KlarnaCheckout/`
- `src/app/api/checkout/klarna/`
- `src/lib/types/klarnacheckout.ts`

**API Endpoints**:
- `POST /api/checkout/klarna/create-order` - Create Klarna order
- `GET /api/checkout/klarna/get-order` - Get order status
- `POST /api/checkout/klarna/sync-order` - Sync order data

**Features**:
- Klarna Checkout Widget integration
- Order confirmation handling
- Real-time order synchronization
- Multi-market support

---

## 🚫 **Disabled Payment Providers**

The following providers are disabled via feature flags but can be enabled when needed:

### **Adyen**
**Status**: 🚫 Disabled  
**Feature Flag**: `PAYMENT_FEATURES.ADYEN = false`

### **Walley**
**Status**: 🚫 Disabled  
**Feature Flag**: `PAYMENT_FEATURES.WALLEY = false`

### **Qliro**
**Status**: 🚫 Disabled  
**Feature Flag**: `PAYMENT_FEATURES.QLIRO = false`

### **Svea**
**Status**: 🚫 Disabled  
**Feature Flag**: `PAYMENT_FEATURES.SVEA = false`

---

## 🔧 **Feature Flag System**

### **Configuration Location**
```typescript
// src/lib/features.ts
export const PAYMENT_FEATURES = {
  KLARNA: true,        // ✅ Active
  ADYEN: false,        // 🚫 Disabled
  WALLEY: false,       // 🚫 Disabled
  QLIRO: false,        // 🚫 Disabled
  SVEA: false          // 🚫 Disabled
};
```

### **Feature Flag Usage**
```typescript
// Component usage example
import { PAYMENT_FEATURES } from '@/src/lib/features';

const PaymentSelector = () => {
  return (
    <div>
      {PAYMENT_FEATURES.KLARNA && <KlarnaCheckout />}
      {PAYMENT_FEATURES.ADYEN && <AdyenCheckout />}
      {PAYMENT_FEATURES.WALLEY && <WalleyCheckout />}
    </div>
  );
};
```

---

## 🚀 **Enabling a Disabled Payment Provider**

Follow these steps to enable a previously disabled payment provider:

### **Step 1: Update Feature Flags**
```typescript
// src/lib/features.ts
export const PAYMENT_FEATURES = {
  KLARNA: true,
  ADYEN: true,        // ✅ Set to true to enable
  WALLEY: false,
  QLIRO: false,
  SVEA: false
};
```

### **Step 2: Install Required Dependencies**
```bash
# For Adyen
yarn add @adyen/adyen-web @adyen/api-library

# For Walley (example)
yarn add walley-checkout-sdk

# For Qliro (example)
yarn add qliro-one-sdk

# For Svea (example)
yarn add svea-checkout-api
```

### **Step 3: Restore Provider Code**
If code was previously removed, restore these components:

**API Routes**:
```
src/app/api/checkout/adyen/
├── create-session/route.ts
├── complete-payment/route.ts
└── webhook/route.ts
```

**Components**:
```
src/components/checkout/AdyenCheckout/
├── index.tsx
├── Checkout.tsx
├── Confirmation.tsx
└── types.ts
```

**Types**:
```typescript
// src/lib/types/adyen.ts
export interface AdyenCheckoutSession {
  sessionId: string;
  sessionData: string;
  environment: 'test' | 'live';
}
```

### **Step 4: Update Type Exports**
```typescript
// src/lib/types/index.ts
export * from './adyen';
export * from './klarnacheckout';
// ... other exports
```

---

## 🔄 **Provider Implementation Pattern**

### **Standard Provider Structure**
Each payment provider follows this structure:

```
Provider/
├── index.tsx                 # Main export component
├── Checkout.tsx             # Checkout implementation
├── Confirmation.tsx         # Order confirmation
├── types.ts                 # Provider-specific types
└── utils.ts                 # Provider utilities
```

### **API Route Structure**
```
api/checkout/[provider]/
├── create-session/route.ts  # Initialize payment session
├── get-session/route.ts     # Retrieve session status
├── complete-payment/route.ts # Finalize payment
└── webhook/route.ts         # Handle provider webhooks
```

### **Required Implementation Interface**
```typescript
interface PaymentProvider {
  createSession(data: CheckoutData): Promise<SessionResponse>;
  getSession(sessionId: string): Promise<SessionStatus>;
  completePayment(sessionId: string): Promise<PaymentResult>;
  handleWebhook(payload: WebhookPayload): Promise<WebhookResponse>;
}
```

---

## 🔐 **Security & Authentication**

### **API Key Management**
```typescript
// Environment variables per provider
const KLARNA_API_KEY = process.env.KLARNA_API_KEY;
const ADYEN_API_KEY = process.env.ADYEN_API_KEY;
const WALLEY_API_KEY = process.env.WALLEY_API_KEY;
```

### **Webhook Security**
- **Signature Verification**: All webhooks verify provider signatures
- **IP Whitelisting**: Provider IP validation
- **Secret Management**: Webhook secrets in environment variables

### **PCI Compliance**
- **No Card Data Storage**: All card data handled by providers
- **Tokenization**: Payment tokens for recurring payments
- **Secure Communication**: HTTPS-only communication

---

## 🌍 **Multi-Market Support**

### **Market-Specific Configuration**
```typescript
const MARKET_PAYMENT_CONFIG = {
  'se': ['klarna', 'adyen'],      // Sweden
  'no': ['klarna', 'walley'],     // Norway
  'fi': ['klarna', 'adyen'],      // Finland
  'dk': ['klarna', 'qliro']       // Denmark
};
```

### **Currency Handling**
- **SEK**: Swedish Krona (Klarna, Adyen)
- **NOK**: Norwegian Krone (Walley)
- **EUR**: Euro (Adyen, multiple markets)
- **DKK**: Danish Krone (Qliro)

---

## 📊 **Testing & Monitoring**

### **Test Environments**
- **Klarna**: Playground environment
- **Adyen**: Test environment
- **Provider Simulators**: Mock payment flows

### **Payment Analytics**
```typescript
// Payment provider performance tracking
interface PaymentMetrics {
  provider: string;
  successRate: number;
  averageProcessingTime: number;
  errorRate: number;
  conversionRate: number;
}
```

### **Error Handling**
```typescript
// Standardized payment error handling
interface PaymentError {
  code: string;
  message: string;
  provider: string;
  retryable: boolean;
  userMessage: string;
}
```

---

## 🔄 **Migration Between Providers**

### **Provider Switching Strategy**
1. **Feature Flag Toggle**: Enable new provider
2. **A/B Testing**: Split traffic between providers
3. **Gradual Migration**: Increase new provider percentage
4. **Full Cutover**: Disable old provider

### **Rollback Procedures**
1. **Immediate Rollback**: Feature flag toggle
2. **Data Consistency**: Order status synchronization
3. **User Communication**: Payment method notifications

---

## 📋 **Provider Comparison Matrix**

| Feature | Klarna | Adyen | Walley | Qliro | Svea |
|---------|--------|-------|---------|-------|------|
| **Markets** | Nordic | Global | Nordic | Nordic | Nordic |
| **Payment Methods** | Multiple | Multiple | BNPL | Multiple | Multiple |
| **Integration Complexity** | Medium | High | Medium | Medium | Medium |
| **Fees** | Variable | Competitive | Variable | Variable | Variable |
| **Support** | Excellent | Excellent | Good | Good | Good |
| **Documentation** | Excellent | Excellent | Good | Good | Good |

---

## 📞 **Support & Troubleshooting**

### **Provider Support Contacts**
- **Klarna**: Technical support via partner portal
- **Adyen**: 24/7 technical support
- **Walley**: Business hours support
- **Qliro**: Business hours support
- **Svea**: Business hours support

### **Common Issues & Solutions**

**Session Timeout**:
```typescript
// Handle session expiration
if (error.code === 'SESSION_EXPIRED') {
  await createNewSession();
  return retryPayment();
}
```

**Currency Mismatch**:
```typescript
// Validate currency before payment
const validCurrencies = getProviderCurrencies(provider);
if (!validCurrencies.includes(order.currency)) {
  throw new PaymentError('CURRENCY_NOT_SUPPORTED');
}
```

---

This payment provider integration system provides flexibility, security, and scalability for the SP Tech e-commerce platform across multiple markets and payment methods.