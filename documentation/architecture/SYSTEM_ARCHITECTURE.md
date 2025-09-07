# System Architecture

## Overview

The SP Tech e-commerce platform is built on a modern, scalable architecture using **Next.js 14**, **TypeScript**, and **Dependency Injection** patterns. The system follows **Domain-Driven Design** principles with a **multi-provider architecture** for maximum flexibility and maintainability.

---

## 🏗️ **Core Architecture Patterns**

### **Framework Stack**
- **Next.js 14** with App Router and experimental HTTPS
- **TypeScript** with strict configuration
- **React 18** with Server Components
- **TanStack Query** for API state management
- **NextAuth.js v5** for authentication with Firebase adapter

### **Architectural Principles**
1. **Domain-Driven Design** - Business domains as first-class citizens
2. **Dependency Injection** - Loose coupling via TSyringe container
3. **Repository Pattern** - Data access abstraction
4. **Factory Pattern** - Multi-provider instantiation
5. **Strategy Pattern** - Pluggable provider implementations

---

## 📁 **Project Structure**

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Internationalized routes
│   ├── api/                      # API routes (50+ endpoints)
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── checkout/                 # Checkout flow components
│   ├── checkout2/                # Alternative checkout implementation
│   ├── product/                  # Product display components
│   └── ui/                       # Reusable UI components
├── context/                      # React Context providers
│   ├── authContext.tsx          # Authentication state
│   ├── cartContext.tsx          # Shopping cart state
│   └── checkoutContext.tsx      # Checkout flow state
├── lib/                         # Core business logic
│   ├── di.ts                    # Dependency injection container
│   ├── diTokens.ts              # DI tokens and interfaces
│   ├── framework/               # Domain frameworks
│   │   ├── Collection/          # Product collections
│   │   ├── Commerce/            # Core commerce operations
│   │   ├── Product/             # Product management
│   │   ├── Reviews/             # Review system
│   │   └── Voyado/              # Loyalty integration
│   ├── auth/                    # Authentication logic
│   ├── configuration/           # App configuration
│   └── types/                   # TypeScript definitions
└── styles/                      # Styling
```

---

## 🔧 **Dependency Injection System**

### **Container Setup**
```typescript
// src/lib/di.ts
import { container } from 'tsyringe';
import { CommerceService } from './framework/Commerce/services/CommerceService';
import { ProductService } from './framework/Product/services/ProductService';

// Service registration
container.register(CommerceService, { useClass: CommerceService });
container.register(ProductService, { useClass: ProductService });
```

### **Service Resolution**
```typescript
// Usage in API routes
import { di } from '@/src/lib/di';
import { CommerceService } from '@/src/lib/framework/Commerce/services/CommerceService';

export async function POST(req: NextRequest) {
  const commerceService = di.resolve(CommerceService);
  return await commerceService.startSession(body);
}
```

### **Token-Based Injection**
```typescript
// src/lib/diTokens.ts
export const DI_TOKENS = {
  COMMERCE_SERVICE: 'CommerceService',
  PRODUCT_SERVICE: 'ProductService',
  SEARCH_ENGINE: 'SearchEngine'
};
```

---

## 🏢 **Domain Framework Architecture**

### **Domain Structure**
Each business domain follows this pattern:
```
framework/[Domain]/
├── interfaces/          # Domain interfaces
├── repositories/        # Data access layer
├── services/           # Business logic
└── types/              # Domain-specific types
```

### **Commerce Domain Example**
```typescript
// Commerce service with repository injection
@injectable()
export class CommerceService {
  constructor(
    @inject(DI_TOKENS.COMMERCE_REPOSITORY) 
    private repository: ICommerceRepository
  ) {}

  async startSession(data: SessionData): Promise<SessionResponse> {
    return this.repository.createSession(data);
  }
}
```

---

## 🔄 **Multi-Provider Architecture**

### **Search Engine Providers**
- **Findify** (Primary)
- **Algolia** (Alternative)
- **Elasticsearch** (Enterprise)

### **Payment Providers**
- **Klarna** (Active)
- **Adyen** (Feature-flagged)
- **Walley** (Feature-flagged)
- **Qliro** (Feature-flagged)
- **Svea** (Feature-flagged)

### **Provider Factory Pattern**
```typescript
// Provider factory implementation
export class SearchEngineFactory {
  static create(type: SearchEngineType): ISearchEngine {
    switch (type) {
      case 'findify': return new FindifySearchEngine();
      case 'algolia': return new AlgoliaSearchEngine();
      case 'elasticsearch': return new ElasticsearchEngine();
      default: throw new Error(`Unknown search engine: ${type}`);
    }
  }
}
```

---

## 🌍 **Internationalization Architecture**

### **Locale Routing**
- Dynamic routes: `[locale]/(pages)/`
- Market-language combinations: `{market}-{language}`
- Fallback to market default language

### **Configuration**
```typescript
// src/lib/configuration/appConfig.ts
export const LOCALE_CONFIG = {
  markets: ['se', 'no', 'fi', 'dk'],
  languages: ['sv', 'en', 'no', 'fi', 'da'],
  defaultLocale: 'se',
  locales: ['se', 'se-en', 'no', 'fi', 'dk']
};
```

---

## 🗄️ **Data Flow Architecture**

### **Client-Side Data Flow**
1. **TanStack Query** - Server state management
2. **React Context** - Global client state
3. **Local Storage** - Persistence layer
4. **API Routes** - Server communication

### **Server-Side Data Flow**
1. **API Routes** - Request handling
2. **Services** - Business logic
3. **Repositories** - Data access
4. **External APIs** - Third-party integration

### **Cache Layers**
1. **TanStack Query Cache** - Client-side caching
2. **Next.js ISR** - Static generation cache
3. **Vercel Edge Cache** - CDN caching
4. **API Response Cache** - Server-side caching

---

## 🔐 **Security Architecture**

### **Authentication Flow**
1. **NextAuth.js** - Authentication provider
2. **Firebase Adapter** - User data storage
3. **JWT Tokens** - Session management
4. **API Authorization** - Endpoint protection

### **API Security Layers**
1. **Request Validation** - Zod schema validation
2. **IP Tracking** - Client IP forwarding
3. **Rate Limiting** - Request throttling (prepared)
4. **CORS Protection** - Cross-origin controls

### **Environment Security**
- Environment variable validation
- Secret key management
- Webhook signature verification
- Internal API protection

---

## ⚡ **Performance Architecture**

### **Runtime Optimization**
- **Edge Runtime** for critical APIs
- **Server Components** for reduced JavaScript
- **Static Generation** for content pages
- **Dynamic Imports** for code splitting

### **Caching Strategy**
- **ISR with On-Demand Revalidation**
- **Component-Level Caching**
- **API Response Caching**
- **CDN Integration**

### **Bundle Optimization**
- **Tree Shaking** for unused code elimination
- **Code Splitting** by route and component
- **Image Optimization** with WebP format
- **Font Optimization** with display swap

---

## 🔄 **State Management Architecture**

### **Server State (TanStack Query)**
```typescript
// Strategic cache timing by data type
const CACHE_TIMINGS = {
  STATIC_CONTENT: { staleTime: 30 * 60 * 1000 },    // 30 minutes
  PRODUCT_DATA: { staleTime: 5 * 60 * 1000 },       // 5 minutes
  CART_SESSION: { staleTime: 1 * 60 * 1000 },       // 1 minute
  REAL_TIME: { staleTime: 30 * 1000 }               // 30 seconds
};
```

### **Client State (React Context)**
- **AuthContext** - User authentication state
- **CartContext** - Shopping cart state
- **CheckoutContext** - Checkout flow state
- **FilterContext** - Product filtering state

### **Persistence Layer**
- **Local Storage** - Client-side persistence
- **Session Storage** - Temporary data
- **Cookies** - Authentication tokens
- **External APIs** - Server-side persistence

---

## 🧪 **Testing Architecture**

### **Testing Stack**
- **Jest** - Test runner
- **Testing Library** - React component testing
- **jsdom** - Browser simulation
- **MSW** - API mocking (prepared)

### **Testing Patterns**
- **Unit Tests** - Service and utility functions
- **Integration Tests** - API endpoints
- **Component Tests** - React components
- **E2E Tests** - Critical user flows (prepared)

---

## 📊 **Monitoring & Observability**

### **Performance Monitoring**
- **Core Web Vitals** tracking
- **API Response Time** monitoring
- **Bundle Size** analysis
- **Error Tracking** (prepared)

### **Analytics Integration**
- **Google Tag Manager** - Event tracking
- **Findify Analytics** - Search analytics
- **Custom Metrics** - Business KPIs

---

## 🚀 **Deployment Architecture**

### **Vercel Integration**
- **Preview Deployments** - Feature branch testing
- **Production Deployment** - Main branch
- **Edge Functions** - Global performance
- **Analytics** - Performance insights

### **Branch Strategy**
- **main** - Production code
- **dev** - Development integration
- **feature/** - Feature development
- **hotfix/** - Critical fixes

---

## 🔄 **Data Synchronization**

### **Real-Time Updates**
- **Webhooks** - Content management updates
- **Cache Invalidation** - On-demand revalidation
- **Event-Driven** - State synchronization

### **External Integrations**
- **Brink Commerce** - E-commerce API
- **Storyblok** - Content management
- **Voyado** - Customer loyalty
- **Multiple Payment Providers**
- **Shipping Providers** (Ingrid)

---

This architecture provides a scalable, maintainable, and performant foundation for the SP Tech e-commerce platform, supporting multiple markets, providers, and growth requirements.