# Third-Party Services Integration

## Overview

The SP Tech platform integrates with multiple third-party services to provide a comprehensive e-commerce experience. This document covers all external service integrations, their configurations, and usage patterns.

---

## 🏗️ **Integration Architecture**

### **Service Categories**
1. **E-commerce Platform**: Brink Commerce (Core)
2. **Content Management**: Storyblok CMS
3. **Payment Processing**: Klarna, Adyen, Walley, Qliro, Svea
4. **Search & Discovery**: Findify, Algolia, Elasticsearch
5. **Authentication**: Firebase
6. **Shipping**: Ingrid
7. **Gift Cards**: Retain24
8. **Customer Loyalty**: Voyado
9. **Analytics**: Google Tag Manager, Findify Analytics
10. **Hosting & CDN**: Vercel

### **Integration Patterns**
- **API-First**: RESTful API integrations
- **Webhook Support**: Real-time event handling
- **Feature Flags**: Enable/disable services dynamically
- **Circuit Breaker**: Fault tolerance for external dependencies
- **Caching**: Reduce API calls and improve performance

---

## 🛒 **E-commerce Platform (Brink Commerce)**

### **Primary Integration**
**Service**: Brink Commerce  
**Type**: Core E-commerce API  
**Status**: ✅ Active  

### **Configuration**
```typescript
// Environment variables
NEXT_PUBLIC_BRINK_API_URL=https://api.brink.com
BRINK_SHOPPER_X_API_KEY=your-api-key

// Service integration
export class BrinkCommerceService {
  private baseUrl = process.env.NEXT_PUBLIC_BRINK_API_URL;
  private apiKey = process.env.BRINK_SHOPPER_X_API_KEY;

  async createSession(data: SessionData): Promise<SessionResponse> {
    return this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}
```

### **Key Features**
- **Session Management**: Shopping cart and user sessions
- **Product Catalog**: Product data and inventory
- **Order Processing**: Checkout and order management
- **Inventory Sync**: Real-time stock updates
- **Multi-market Support**: Different markets and currencies

### **API Endpoints Used**
- `GET /sessions` - Retrieve session data
- `POST /sessions` - Create new session
- `PUT /sessions/items/{id}` - Update cart items
- `POST /sessions/checkout/start` - Initialize checkout
- `GET /sessions/checkout` - Get checkout state

---

## 🔍 **Search & Discovery Services**

### **Primary Search (Findify)**
**Service**: Findify  
**Type**: Search & Personalization  
**Status**: ✅ Active  

```typescript
// Configuration
NEXT_PUBLIC_FINDIFY_API_KEY=your-api-key
NEXT_PUBLIC_FINDIFY_MERCHANT_ID=your-merchant-id

// Usage
export class FindifySearchService {
  async search(query: string, filters: SearchFilters): Promise<SearchResults> {
    const url = `https://api.findify.io/v6/search`;
    return this.request(url, { query, filters });
  }
}
```

### **Alternative Search Engines**
- **Algolia**: Feature-flagged alternative
- **Elasticsearch**: Enterprise option

---

## 🔐 **Authentication (Firebase)**

### **Authentication Provider**
**Service**: Firebase Authentication  
**Type**: User Authentication  
**Status**: ✅ Active  

```typescript
// Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

// NextAuth.js integration
import { FirebaseAdapter } from "@next-auth/firebase-adapter";

export const authOptions = {
  adapter: FirebaseAdapter(firebaseConfig),
  providers: [
    // OAuth providers
  ]
};
```

---

## 🚚 **Shipping (Ingrid)**

### **Shipping Integration**
**Service**: Ingrid  
**Type**: Shipping & Delivery  
**Status**: ✅ Active  

```typescript
// API integration
export class IngridShippingService {
  async createSession(orderData: OrderData): Promise<IngridSession> {
    return this.request('/shipping/sessions', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getDeliveryOptions(postalCode: string): Promise<DeliveryOption[]> {
    return this.request(`/delivery-options?postal_code=${postalCode}`);
  }
}
```

---

## 🎁 **Gift Cards (Retain24)**

### **Gift Card Management**
**Service**: Retain24  
**Type**: Gift Card Platform  
**Status**: ✅ Active  

```typescript
// Gift card integration
export class Retain24Service {
  async getGiftCards(sessionId: string): Promise<GiftCard[]> {
    return this.request(`/gift-cards?session_id=${sessionId}`);
  }

  async applyGiftCard(cardNumber: string, sessionId: string): Promise<GiftCardApplication> {
    return this.request('/gift-cards/apply', {
      method: 'POST',
      body: JSON.stringify({ cardNumber, sessionId })
    });
  }
}
```

---

## 🏆 **Customer Loyalty (Voyado)**

### **Loyalty Platform**
**Service**: Voyado  
**Type**: Customer Loyalty & CRM  
**Status**: ✅ Active  

```typescript
// Voyado integration
export class VoyadoService {
  async getContact(email: string): Promise<VoyadoContact> {
    return this.request(`/contacts?email=${email}`);
  }

  async getPromotions(contactId: string): Promise<Promotion[]> {
    return this.request(`/contacts/${contactId}/promotions`);
  }

  async addVoucher(contactId: string, voucherId: string): Promise<VoucherResult> {
    return this.request(`/contacts/${contactId}/vouchers`, {
      method: 'POST',
      body: JSON.stringify({ voucherId })
    });
  }
}
```

---

## 📊 **Analytics & Tracking**

### **Google Tag Manager**
**Service**: Google Tag Manager  
**Type**: Analytics & Tracking  
**Status**: ✅ Active  

```typescript
// GTM configuration
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

// Implementation
import { GoogleTagManager } from '@next/third-parties/google';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        {children}
      </body>
    </html>
  );
}
```

### **Findify Analytics**
**Service**: Findify Analytics  
**Type**: Search Analytics  
**Status**: ✅ Active  

```typescript
// Analytics tracking
export function trackSearchEvent(event: SearchEvent) {
  findifyAnalytics.send('search', {
    query: event.query,
    results: event.results.length,
    filters: event.filters
  });
}
```

---

## 🌐 **Hosting & Infrastructure (Vercel)**

### **Deployment Platform**
**Service**: Vercel  
**Type**: Hosting, CDN, Edge Functions  
**Status**: ✅ Active  

```json
// vercel.json configuration
{
  "framework": "nextjs",
  "buildCommand": "yarn build",
  "regions": ["arn1", "fra1", "iad1"],
  "functions": {
    "src/app/api/edge/**/*.ts": {
      "runtime": "edge"
    }
  }
}
```

### **Key Features**
- **Global CDN**: Fast content delivery
- **Edge Functions**: Low-latency API responses
- **Automatic Scaling**: Handle traffic spikes
- **Preview Deployments**: Feature branch testing
- **Analytics**: Performance monitoring

---

## 🔧 **Service Management**

### **Health Monitoring**
```typescript
// Service health check
export class ServiceHealthMonitor {
  private services = [
    { name: 'Brink Commerce', url: '/api/health/brink' },
    { name: 'Storyblok', url: '/api/health/storyblok' },
    { name: 'Findify', url: '/api/health/findify' },
    { name: 'Firebase', url: '/api/health/firebase' }
  ];

  async checkAllServices(): Promise<ServiceStatus[]> {
    const results = await Promise.allSettled(
      this.services.map(service => this.checkService(service))
    );

    return results.map((result, index) => ({
      name: this.services[index].name,
      status: result.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      error: result.status === 'rejected' ? result.reason : null
    }));
  }
}
```

### **Circuit Breaker Pattern**
```typescript
// Circuit breaker for external services
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

---

## 🚨 **Error Handling & Fallbacks**

### **Service Fallback Strategy**
```typescript
// Graceful degradation for search services
export class SearchServiceManager {
  private primaryService = new FindifySearchService();
  private fallbackService = new AlgoliaSearchService();

  async search(query: string): Promise<SearchResults> {
    try {
      return await this.primaryService.search(query);
    } catch (error) {
      console.warn('Primary search service failed, using fallback:', error);
      
      try {
        return await this.fallbackService.search(query);
      } catch (fallbackError) {
        console.error('All search services failed:', fallbackError);
        return this.getDefaultResults();
      }
    }
  }

  private getDefaultResults(): SearchResults {
    return {
      products: [],
      totalCount: 0,
      message: 'Search temporarily unavailable'
    };
  }
}
```

### **Retry Logic**
```typescript
// Exponential backoff retry
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

---

## 📊 **Performance Optimization**

### **Request Batching**
```typescript
// Batch multiple API requests
export class RequestBatcher {
  private batch: BatchRequest[] = [];
  private timeout: NodeJS.Timeout | null = null;

  addRequest(request: BatchRequest) {
    this.batch.push(request);
    
    if (!this.timeout) {
      this.timeout = setTimeout(() => this.processBatch(), 50);
    }
  }

  private async processBatch() {
    const requests = [...this.batch];
    this.batch = [];
    this.timeout = null;

    // Group by endpoint and execute
    const grouped = this.groupByEndpoint(requests);
    await Promise.all(
      Object.entries(grouped).map(([endpoint, reqs]) =>
        this.executeBatchRequest(endpoint, reqs)
      )
    );
  }
}
```

### **Response Caching**
```typescript
// Cache external API responses
export class APICache {
  private cache = new Map<string, CacheEntry>();

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300000 // 5 minutes
  ): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });

    return data;
  }
}
```

---

## 🔐 **Security & Authentication**

### **API Key Management**
```typescript
// Secure API key handling
export class APIKeyManager {
  private keys = new Map<string, string>();

  constructor() {
    // Load from environment variables
    this.keys.set('brink', process.env.BRINK_SHOPPER_X_API_KEY!);
    this.keys.set('findify', process.env.NEXT_PUBLIC_FINDIFY_API_KEY!);
    this.keys.set('storyblok', process.env.NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN!);
  }

  getKey(service: string): string {
    const key = this.keys.get(service);
    if (!key) {
      throw new Error(`API key not found for service: ${service}`);
    }
    return key;
  }
}
```

### **Request Signing**
```typescript
// Webhook signature verification
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

This comprehensive third-party service integration provides a robust, scalable, and fault-tolerant foundation for the SP Tech e-commerce platform.