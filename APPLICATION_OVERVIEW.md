# SP Tech - Complete Application Overview

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Framework Stack](#framework-stack)
4. [Application Structure](#application-structure)
5. [Domain-Driven Architecture](#domain-driven-architecture)
6. [Dependency Injection System](#dependency-injection-system)
7. [Multi-Provider System](#multi-provider-system)
8. [Internationalization](#internationalization)
9. [State Management](#state-management)
10. [Content Management](#content-management)
11. [Authentication & Authorization](#authentication--authorization)
12. [API Architecture](#api-architecture)
13. [Performance & Optimization](#performance--optimization)
14. [Development Workflow](#development-workflow)
15. [Deployment Strategy](#deployment-strategy)
16. [Environment Configuration](#environment-configuration)

---

## Project Overview

**SP Tech** is a sophisticated e-commerce platform built for a Swedish jewelry brand. The application is a **Next.js 15** based e-commerce solution with **React 19**, implementing modern web technologies and architectural patterns to deliver a premium shopping experience.

### Key Features
- **Multi-language support** (Swedish, Norwegian, Finnish, English)
- **Multi-market operations** with region-specific configurations
- **Advanced search and filtering** with multiple search engine providers
- **Complete e-commerce functionality** (cart, checkout, payments, orders)
- **Content management system** integration with Storyblok
- **User accounts and profiles** with Firebase authentication
- **Store locator** with Google Maps integration
- **Gift cards and vouchers** system
- **Review and rating system**
- **Member benefits program**

---

## Technical Architecture

### Core Technologies
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Styled Components, CSS Modules
- **State Management**: React Context API, TanStack Query
- **Authentication**: NextAuth.js v5 with Firebase Adapter
- **Database**: Firebase (authentication), Brink Commerce (e-commerce data)
- **CMS**: Storyblok for content management
- **Deployment**: Vercel with Edge Functions
- **Package Manager**: Yarn

### Architecture Patterns
- **Domain-Driven Design (DDD)** with clean architecture principles
- **Dependency Injection** using TSyringe
- **Repository Pattern** for data access abstraction
- **Factory Pattern** for service instantiation
- **Event-driven architecture** with analytics tracking
- **Component-based architecture** with reusable UI components

---

## Framework Stack

### Next.js 15 Configuration
```javascript
// Key Next.js features enabled:
- App Router with experimental HTTPS
- Image optimization with WebP/AVIF formats
- Bundle optimization with tree shaking
- Edge Runtime support
- Internationalization (next-intl)
- Content Security Policy (CSP)
- Source map disabled in production
```

### React 19 Features
- **Server Components** for improved performance
- **Concurrent Features** for better UX
- **Automatic batching** for state updates
- **Error boundaries** for graceful error handling

### TypeScript Configuration
- **Strict mode enabled** with comprehensive type checking
- **Path aliases** for clean imports (`@/src/...`)
- **Type-safe environment variables**
- **Generated types** for Storyblok components

---

## Application Structure

### Directory Organization
```
src/
├── app/                    # Next.js App Router pages
│   ├── [locale]/          # Internationalized routes
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (checkout)/    # Checkout flow
│   │   ├── (pages)/       # Main content pages
│   │   └── (success)/     # Success pages
│   └── api/               # API routes and endpoints
├── components/            # React components
│   ├── blocks/           # Storyblok CMS blocks
│   ├── cart/             # Shopping cart components
│   ├── checkout/         # Checkout process components
│   ├── product/          # Product-related components
│   ├── ui/               # Reusable UI components
│   └── shadcn/           # Shadcn/ui components
├── context/              # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Core business logic
│   ├── framework/        # Domain-driven modules
│   ├── configuration/    # App configuration
│   ├── cache/           # Caching system
│   └── storyblok/       # CMS integration
├── templates/            # Page templates
├── types/                # TypeScript type definitions
└── styles/               # Global styles and themes
```

### Route Structure
- **Dynamic locale routing**: `/[locale]/...` for internationalization
- **Route groups**: Organization without affecting URL structure
- **Nested layouts**: Shared layouts for different page types
- **API routes**: RESTful endpoints for various services

---

## Domain-Driven Architecture

The application implements **Domain-Driven Design** with clear separation of concerns across multiple domains:

### Core Domains

#### 1. **Collection Domain** (`src/lib/framework/Collection/`)
- **Purpose**: Product search, filtering, and collection management
- **Repositories**: Algolia, Findify (search engines)
- **Services**: CollectionService, AnalyticsService
- **Entities**: ICollectionItem, ICollectionResponse

#### 2. **Commerce Domain** (`src/lib/framework/Commerce/`)
- **Purpose**: E-commerce operations (pricing, stock, orders)
- **Repositories**: BrinkCommerceRepository
- **Services**: CommerceService
- **Entities**: ICommercePrice, ICommerceStock

#### 3. **Product Domain** (`src/lib/framework/Product/`)
- **Purpose**: Product data management and search
- **Repositories**: ElasticSearchRepository
- **Services**: ProductService
- **Entities**: IProduct, IProductVariant, IProductColorVariant

#### 4. **Reviews Domain** (`src/lib/framework/Reviews/`)
- **Purpose**: Product reviews and ratings
- **Repositories**: LipScoreRepository, MockReviewRepository
- **Services**: ReviewService
- **Entities**: IReview, IReviewScore

#### 5. **Store Domain** (`src/lib/framework/Store/`)
- **Purpose**: Physical store management and locator
- **Repositories**: StoreRepository
- **Services**: StoreService
- **Entities**: IStore

#### 6. **Voyado Domain** (`src/lib/framework/Voyado/`)
- **Purpose**: Customer loyalty and membership program
- **Services**: VoyadoService
- **Features**: Promotions, vouchers, member benefits

### Domain Structure Pattern
Each domain follows a consistent structure:
```
Domain/
├── domain/
│   ├── entities/          # Domain entities (interfaces)
│   ├── IRepository.ts     # Repository interface
│   └── IService.ts        # Service interface
├── repositories/
│   ├── Implementation.ts  # Concrete repository
│   ├── Factory.ts         # Repository factory
│   └── mappers/          # Data transformation
├── services/
│   └── Service.ts        # Business logic implementation
└── types/
    └── External.ts       # External API types
```

---

## Dependency Injection System

### TSyringe Implementation
The application uses **TSyringe** for dependency injection, providing loose coupling and testability.

```typescript
// Core DI container (src/lib/di.ts)
import { container } from 'tsyringe';
import { Tokens } from '@/src/lib/diTokens';

container.register(Tokens.Configuration, { useValue: initConfig() });
container.register(Tokens.LoggerService, loggerServiceFactory);

export const di = Object.assign(container, { Tokens });
```

### Token-based Registration
```typescript
// Dependency tokens (src/lib/diTokens.ts)
export const Tokens = {
  Configuration: 'IConfiguration' as InjectionToken<IConfiguration>,
  LoggerService: 'LoggerService' as InjectionToken<LoggerService>,
} as const;
```

### Factory Pattern Usage
Services are instantiated using factories that resolve dependencies:
```typescript
// Example: Repository Factory
export const CollectionRepositoryFactory = {
  useFactory: (container: DependencyContainer) => {
    const config = container.resolve(Tokens.Configuration);
    // Return appropriate implementation based on configuration
  }
};
```

---

## Multi-Provider System

The application supports multiple providers for different services, configurable via environment variables and feature flags.

### Search Engines
- **Findify**: Default search provider with analytics
- **Algolia**: Alternative search with advanced filtering
- **ElasticSearch**: Enterprise search solution
- **Configuration**: Environment-driven selection

### Payment Providers
```typescript
// Feature flags (src/lib/features.ts)
export const PAYMENT_FEATURES = {
  KLARNA: true,    // Currently active
  ADYEN: false,    // Disabled - can be restored
  WALLEY: false,   // Disabled - can be restored
  QLIRO: false,    // Disabled - can be restored
  SVEA: false,     // Disabled - can be restored
};
```

### External Integrations
- **Storyblok**: Content Management System
- **Firebase**: Authentication and user management
- **Brink Commerce**: E-commerce backend
- **LipScore**: Review and rating system
- **Ingrid**: Shipping and delivery
- **Retain24**: Gift card management
- **Google Maps**: Store locator
- **Zendesk**: Customer support chat

---

## Internationalization

### Multi-language Support
- **Supported Languages**: Swedish (default), Norwegian, Finnish, English
- **Framework**: next-intl for internationalization
- **Translation Files**: JSON-based translations in `/translations/`

### Dynamic Locale Routing
```typescript
// Locale configuration
const locales = ['se', 'no-nb', 'no', 'fi', 'en'];
const defaultLocale = 'se';

// Route patterns:
// - /se (Swedish - default)
// - /no-nb (Norwegian Bokmål)
// - /fi (Finnish)  
// - /en (English)
```

### Market-based Configuration
Different markets can have:
- **Different search engine configurations**
- **Market-specific product catalogs**
- **Localized pricing and currency**
- **Regional payment methods**

---

## State Management

### Context-based Architecture
The application uses **React Context API** for global state management:

#### Core Contexts
1. **AuthContext**: User authentication state
2. **CartContext**: Shopping cart management
3. **CheckoutContext**: Checkout process state
4. **FilterContext**: Product filtering state
5. **WishlistContext**: User wishlist management
6. **VoyadoContext**: Loyalty program integration

#### Optimized Context Patterns
```typescript
// Optimized context composition (src/context/optimized/)
- CartStateContext: Read-only cart state
- CartActionsContext: Cart modification actions
- ContextComposer: High-order component for context composition
```

### Server State Management
- **TanStack Query** (React Query) for server state
- **Automatic caching** and background refetching
- **Optimistic updates** for better UX
- **Error handling** with retry mechanisms

---

## Content Management

### Storyblok Integration
- **Headless CMS** for content management
- **Visual editor** for non-technical content creators
- **Rich text rendering** with custom components
- **Preview mode** for content review

### Content Types
- **Pages**: Landing pages, category pages
- **Blocks**: Reusable content components
- **Product information**: Enhanced product descriptions
- **SEO content**: Meta descriptions, structured data

### Content Delivery
- **Static generation** for better performance
- **Incremental Static Regeneration (ISR)** for dynamic content
- **Edge caching** via Vercel CDN
- **Cache warming** for critical content

---

## Authentication & Authorization

### NextAuth.js v5 Implementation
- **Firebase Adapter** for user storage
- **Session management** with JWT tokens
- **Social login** support (configured for extensions)
- **Password reset** functionality

### User Roles & Permissions
- **Guest users**: Browse and basic cart functionality
- **Members**: Full account features, order history, wishlist
- **VIP members**: Exclusive access to special offers

### Security Features
- **CSRF protection** built-in with NextAuth
- **Secure session cookies** with httpOnly flag
- **Password hashing** handled by Firebase
- **Input validation** using Yup schemas

---

## API Architecture

### RESTful Endpoints
The application provides comprehensive API endpoints organized by functionality:

#### Core API Routes
- **Authentication**: `/api/auth/*` (NextAuth.js handlers)
- **Cart & Session**: `/api/session/*` (cart management)
- **Checkout**: `/api/checkout/*` (payment processing)
- **Products**: `/api/products/*` (product data)
- **Search**: Search integrated into product endpoints
- **User Management**: `/api/voyado/*` (member services)

#### Edge Functions
- **Feature Flags**: `/api/edge/feature-flags` (runtime configuration)
- **Geolocation**: `/api/edge/geolocation` (region detection)

#### Specialized Endpoints
- **Cache Management**: `/api/cache/*` (cache invalidation, warming)
- **Webhooks**: `/api/webhooks/*` (external integrations)
- **Analytics**: `/api/findify-analytics/*` (search analytics)

### API Design Patterns
- **Consistent error handling** across all endpoints
- **Request validation** using Zod/Yup schemas
- **Rate limiting** for public endpoints
- **Caching strategies** per endpoint type

---

## Performance & Optimization

### Next.js 15 Optimizations
- **App Router** for improved performance
- **Server Components** reduce client-side JavaScript
- **Streaming** for faster page loads
- **Image optimization** with WebP/AVIF formats
- **Font optimization** with next/font

### Caching Strategy
```typescript
// Multi-layer caching approach:
1. Browser Cache: Static assets (1 year)
2. CDN Cache: Dynamic content (5 minutes)
3. Server Cache: API responses (configurable)
4. Database Cache: Search results (Redis-like)
```

### Bundle Optimization
- **Tree shaking** to eliminate unused code
- **Code splitting** for optimal chunk sizes
- **Dynamic imports** for component lazy loading
- **Bundle analysis** via webpack-bundle-analyzer

### Performance Monitoring
- **Web Vitals** tracking and optimization
- **Lighthouse** performance scoring
- **Real User Monitoring (RUM)** via analytics
- **Error tracking** with comprehensive logging

---

## Development Workflow

### Code Quality
```json
{
  "lint": "eslint src --max-warnings 0",
  "test": "jest",
  "typecheck": "tsc --noEmit"
}
```

### Development Commands
- **`yarn dev`**: Start development server with HTTPS
- **`yarn build`**: Production build with optimizations
- **`yarn storyblok`**: Generate CMS types and fix linting
- **`yarn test`**: Run Jest test suite

### Git Workflow
- **Husky** for git hooks
- **Conventional commits** for clear history
- **Branch protection** rules
- **Automated testing** on pull requests

### Code Standards
- **ESLint** with strict rules (0 warnings policy)
- **Prettier** for consistent formatting
- **TypeScript strict mode** enabled
- **Import organization** with eslint-plugin-simple-import-sort

---

## Deployment Strategy

### Vercel Platform
```json
{
  "regions": ["fra1", "arn1"],
  "framework": "nextjs",
  "buildCommand": "yarn build"
}
```

### Environment-Specific Configurations
- **Preview deployments** for feature branches
- **Production deployment** from main branch
- **Environment variables** managed via Vercel dashboard
- **Custom domains** with SSL certificates

### Performance Optimizations
- **Edge Functions** for dynamic content
- **Static generation** for marketing pages
- **ISR (Incremental Static Regeneration)** for product pages
- **CDN distribution** via Vercel Edge Network

---

## Environment Configuration

### Required Environment Variables
```bash
# Search Configuration
SEARCH_ENGINE=FINDIFY|ALGOLIA|ELASTICSEARCH
SEARCH_DEFAULT_MARKET=se

# Commerce Backend
SHOPLAB_API_URL=https://api.shoplab.io
SHOPLAB_TOKEN=your_token

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secret

# Firebase
FIREBASE_PROJECT_ID=your_project
FIREBASE_CLIENT_EMAIL=your_email
FIREBASE_PRIVATE_KEY=your_key

# Content Management
STORYBLOK_TOKEN=your_storyblok_token

# Payment Providers
KLARNA_USERNAME=your_klarna_user
KLARNA_PASSWORD=your_klarna_pass

# Reviews
REVIEWS_PROVIDER=LIPSCORE
REVIEWS_LIPSCORE_API_KEY=your_key

# Languages
LANGUAGES=sv,no,fi,en
DEFAULT_LANGUAGE=se
```

### Configuration Management
- **Type-safe configuration** with validation
- **Environment-based provider selection**
- **Runtime feature flags** for A/B testing
- **Secure secret management** via Vercel

---

## Security Considerations

### Data Protection
- **GDPR compliance** for European markets
- **Secure cookie handling** with SameSite and Secure flags
- **Content Security Policy (CSP)** implementation
- **Input validation** and sanitization

### Performance Security
- **Rate limiting** on API endpoints
- **DDoS protection** via Vercel Edge
- **Secure headers** configuration
- **Source map disabled** in production

---

## Future Considerations

### Scalability
- **Microservices architecture** consideration for high traffic
- **Database sharding** for multi-region support
- **Event-driven architecture** for real-time updates
- **GraphQL** implementation for flexible data fetching

### Technology Upgrades
- **React Compiler** integration (currently disabled)
- **Turbopack** adoption for faster builds
- **Edge Runtime** expansion for more dynamic features
- **WebAssembly** for performance-critical operations

This comprehensive overview provides a complete understanding of the SP Tech e-commerce platform, its architecture, and implementation details. The application demonstrates modern web development practices with a focus on performance, scalability, and maintainability.