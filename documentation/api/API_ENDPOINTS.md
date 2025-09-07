# API Endpoints Documentation

This document provides comprehensive documentation for all API endpoints in the SP Tech e-commerce application.

## Architecture Overview

The API follows a **Domain-Driven Design** pattern with:
- **Dependency Injection** using TSyringe
- **Multi-provider architecture** (Findify, Algolia, Klarna, etc.)
- **Security-first approach** with validation, IP checking, and authentication
- **Edge Runtime** optimization for critical endpoints
- **Comprehensive error handling** and logging

---

## 🛒 **Session & Cart Management**

### **POST** `/api/session/start-session`
**Purpose**: Initialize a new shopping session or handle logout  
**Authentication**: None required  
**Parameters**:
- `isLogout` (query): Boolean flag for logout functionality
- Request body: Session configuration

**Functionality**:
- Creates a new shopping session using CommerceService
- Handles user logout scenarios
- Returns session data and configuration

**Error Handling**: Returns 500 with error details on failure

---

### **GET** `/api/session/get-session`
**Purpose**: Retrieve current session data  
**Authentication**: Authorization header required  
**Security**: IP forwarding for tracking

**Functionality**:
- Fetches current session from Brink Commerce API
- Includes cart items, totals, and session state

---

### **PUT** `/api/session/update-item`
**Purpose**: Update quantity of items in cart  
**Authentication**: Authorization header required  
**Body**:
```json
{
  "itemId": "string",
  "quantity": number
}
```

**Functionality**:
- Updates specific cart item quantity
- Recalculates cart totals automatically

---

### **DELETE** `/api/session/delete-item`
**Purpose**: Remove items from cart  
**Authentication**: Authorization header required

---

### **PUT** `/api/session/update-session`
**Purpose**: Update session configuration and settings  
**Authentication**: Authorization header required

---

## 🛍️ **Checkout System**

### **POST** `/api/checkout/start-checkout`
**Purpose**: Initialize checkout process with validation  
**Authentication**: Authorization header required  
**Validation**: Comprehensive Zod schema validation

**Request Schema**:
```json
{
  "sessionId": "uuid (optional)",
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid (optional)", 
      "quantity": 1-99
    }
  ],
  "shippingAddress": {
    "country": "2-letter code",
    "postalCode": "string (max 20)"
  },
  "discountCode": "string (optional, max 50)"
}
```

**Security Features**:
- Request body validation with detailed error messages
- IP address tracking
- Out-of-stock error handling

---

### **GET** `/api/checkout/get-checkout`
**Purpose**: Retrieve current checkout state  
**Authentication**: Authorization header required

---

### **POST** `/api/checkout/add-discount-code`
**Purpose**: Apply discount codes to checkout  
**Authentication**: Authorization header required

---

### **DELETE** `/api/checkout/delete-discount-code`
**Purpose**: Remove discount codes from checkout  
**Authentication**: Authorization header required

---

## 💳 **Payment Integration**

### **Klarna Payment System**

#### **POST** `/api/checkout/klarna/create-order`
**Purpose**: Create Klarna checkout order  
**Authentication**: Authorization header required  
**Integration**: Brink Commerce Klarna API (`-kco/orders`)

#### **GET** `/api/checkout/klarna/get-order`
**Purpose**: Retrieve Klarna order status

#### **POST** `/api/checkout/klarna/sync-order`
**Purpose**: Synchronize Klarna order data

---

## 🚚 **Shipping Integration**

### **Ingrid Shipping System**

#### **POST** `/api/checkout/ingrid/create-session`
**Purpose**: Create Ingrid shipping session  

#### **POST** `/api/checkout/ingrid/sync-session`
**Purpose**: Sync shipping data with Ingrid

---

## 🎁 **Gift Cards (Retain24)**

### **Session Gift Cards**

#### **GET** `/api/session/retain24/gift-card`
**Purpose**: Retrieve available gift cards for session

#### **POST** `/api/session/retain24/gift-card`
**Purpose**: Apply gift card to session

#### **GET** `/api/session/retain24/gift-card/[id]`
**Purpose**: Get specific gift card details

### **Checkout Gift Cards**

#### **GET** `/api/checkout/retain24/gift-card`
**Purpose**: Retrieve gift cards for checkout

#### **GET** `/api/checkout/retain24/gift-card/[id]`
**Purpose**: Get specific gift card in checkout context

---

## 🏷️ **Promotions & Loyalty (Voyado)**

### **Contact Management**

#### **GET** `/api/voyado/get-contact`
**Purpose**: Retrieve customer contact by email  
**Parameters**: `email` (required)  
**Service**: VoyadoService integration

#### **GET** `/api/voyado/get-contact-by-id`
**Purpose**: Get contact by Voyado ID

#### **GET** `/api/voyado/get-contact-overview`
**Purpose**: Get comprehensive contact overview

### **Promotions**

#### **GET** `/api/voyado/get-promotions`
**Purpose**: Retrieve available promotions

#### **POST** `/api/voyado/add-promotion`
**Purpose**: Add promotion to customer

#### **DELETE** `/api/voyado/delete-promotion`
**Purpose**: Remove promotion from customer

### **Vouchers**

#### **GET** `/api/voyado/get-vouchers`
**Purpose**: Get available vouchers

#### **POST** `/api/voyado/add-voucher`
**Purpose**: Add voucher to customer

#### **POST** `/api/voyado/redeem-voucher`
**Purpose**: Redeem customer voucher

#### **DELETE** `/api/voyado/delete-voucher`
**Purpose**: Remove voucher

### **Cookie Management**

#### **POST** `/api/voyado/set-cookie`
**Purpose**: Set Voyado tracking cookies

#### **POST** `/api/voyado/voyado-start`
**Purpose**: Initialize Voyado tracking session

---

## 📦 **Product & Inventory**

### **GET** `/api/products/[...slug]`
**Purpose**: Retrieve product by slug or ID  
**Parameters**: 
- `slug[]`: Product slug path
- `locale`: Language/market code

**Functionality**:
- Primary lookup by slug
- Fallback to ID lookup if slug fails
- Returns redirect URL for canonical slug
- Supports internationalization

**Service**: ProductService via dependency injection

---

### **GET** `/api/stock/get-product-stock`
**Purpose**: Get stock levels for specific product  
**Authentication**: Internal API only  
**Security**: 
- Internal request validation
- Referer checking
- Custom header authentication

**Parameters**:
- `productId` (required)
- `countryCode` (required)

---

### **GET** `/api/stock/get-store-stock`
**Purpose**: Retrieve stock levels for physical stores

---

## 🏪 **Store & Location**

### **GET** `/api/stores`
**Purpose**: List all physical store locations

### **GET** `/api/store-group`
**Purpose**: Retrieve store group information

### **GET** `/api/warehouse/get-warehouse`
**Purpose**: Get warehouse information and locations

---

## 📊 **Analytics & Tracking**

### **Findify Analytics**

#### **GET** `/api/findify-analytics/get-cookie-and-apikey`
**Purpose**: Retrieve Findify tracking configuration

#### **POST** `/api/findify-analytics/post-feedback`
**Purpose**: Send user behavior feedback to Findify

---

## 🗂️ **Content Management (Storyblok)**

### **GET** `/api/storyblok/diamond-information`
**Purpose**: Retrieve diamond information content  
**Parameters**: `locale` (optional, defaults to 'en')

**Functionality**:
- Fetches diamond information stories from Storyblok
- Supports internationalization
- Graceful error handling

### **GET** `/api/storyblok/size-guide`
**Purpose**: Retrieve size guide content from Storyblok

---

## 🔐 **Authentication**

### **GET/POST** `/api/auth/[...nextauth]`
**Purpose**: NextAuth.js authentication endpoints  
**Integration**: Firebase adapter  
**Features**:
- OAuth providers
- Session management
- JWT token handling

---

## 🔄 **Cache Management**

### **POST** `/api/cache/revalidate`
**Purpose**: On-demand ISR revalidation  
**Runtime**: Edge  
**Authentication**: Secret token required

**Request Body**:
```json
{
  "type": "path" | "tag",
  "value": "string",
  "secret": "string"
}
```

**Features**:
- Path-based revalidation
- Tag-based revalidation
- Security with secret verification
- Global cache control headers

### **GET** `/api/cache/revalidate`
**Purpose**: Query parameter-based revalidation  
**Parameters**: `type`, `value`, `secret`

### **POST** `/api/cache/warm`
**Purpose**: Pre-warm critical cache entries

### **GET** `/api/cache/products`
**Purpose**: Cache product data

### **POST** `/api/cache/invalidate`
**Purpose**: Invalidate specific cache entries

---

## 🔔 **Webhooks**

### **POST** `/api/webhooks/revalidate`
**Purpose**: Handle webhooks for automatic cache revalidation  
**Runtime**: Edge  
**Authentication**: Webhook secret verification

**Supported Sources**:
- **Storyblok CMS**: Content updates
- **Brink Commerce**: Product/inventory changes  
- **Manual**: Direct revalidation requests

**Storyblok Webhook**:
```json
{
  "action": "published" | "unpublished" | "deleted",
  "story": {
    "full_slug": "string",
    "content": {
      "component": "string"
    }
  }
}
```

**Brink Webhook**:
```json
{
  "event": "product.updated" | "inventory.updated",
  "data": {
    "id": "string",
    "slug": "string"
  }
}
```

**Features**:
- Component-based tag mapping
- Slug pattern recognition
- Global content detection
- Comprehensive error handling

---

## 🌍 **Edge Services**

### **GET** `/api/edge/geolocation`
**Purpose**: Geolocation detection and routing  
**Runtime**: Edge  
**Caching**: 1 hour

**Response**:
```json
{
  "country": "string",
  "region": "string", 
  "city": "string",
  "latitude": number,
  "longitude": number,
  "apiRegion": "nordic" | "eu" | "global",
  "currency": "SEK" | "EUR" | "USD",
  "language": "sv" | "en" | "de"
}
```

**Features**:
- Vercel edge header integration
- Regional API routing
- Currency/language detection
- Nordic market focus

### **GET** `/api/edge/feature-flags`
**Purpose**: Dynamic feature flag management  
**Runtime**: Edge

---

## 🏥 **Health & Monitoring**

### **GET** `/api/health`
**Purpose**: Health check endpoint  
**Runtime**: Edge  
**Caching**: Disabled

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "ISO-8601",
  "runtime": "edge", 
  "version": "string",
  "environment": "development" | "production"
}
```

---

## 🔧 **Utility & Internal**

### **POST** `/api/internal/invalidate-cache`
**Purpose**: Internal cache invalidation

### **GET** `/api/user-id`
**Purpose**: Generate or retrieve user identifier

### **GET** `/api/redirects`
**Purpose**: Handle URL redirects and canonical URLs

### **POST** `/api/password/reset`
**Purpose**: Password reset functionality

### **GET** `/api/barcode`
**Purpose**: Barcode generation and validation

---

## 🛡️ **Security Features**

### **Authentication Methods**
- NextAuth.js integration
- API key authentication (`x-shopper-api-key`)
- Authorization header validation
- Internal API secret verification

### **Request Validation**
- Zod schema validation
- Input sanitization
- Type checking
- Length limits

### **IP Security**
- Client IP forwarding
- Geolocation tracking
- Internal request verification
- Rate limiting preparation

### **Error Handling**
- Structured error responses
- Secure error messages
- Comprehensive logging
- Graceful degradation

---

## 📝 **Environment Configuration**

### **Required Environment Variables**
```bash
NEXT_PUBLIC_BRINK_API_URL=        # Brink Commerce API
BRINK_SHOPPER_X_API_KEY=          # Brink API authentication
REVALIDATE_SECRET=                # Cache revalidation secret
WEBHOOK_REVALIDATION_SECRET=      # Webhook authentication
INTERNAL_API_SECRET=              # Internal API access
NEXT_PUBLIC_BASE_DOMAIN=          # Application domain
```

### **Optional Configuration**
```bash
NODE_ENV=                         # Environment mode
npm_package_version=              # Application version
```

---

## 🔍 **Error Response Format**

All API endpoints follow a consistent error response format:

```json
{
  "message": "Error description",
  "success": false,
  "headers": "Headers object",
  "details": "Additional error context"
}
```

**HTTP Status Codes**:
- `200`: Success
- `400`: Bad Request / Validation Error
- `401`: Unauthorized 
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## 📈 **Performance Optimizations**

### **Edge Runtime Usage**
- `/api/health` - Global health checks
- `/api/edge/geolocation` - Geographic detection  
- `/api/edge/feature-flags` - Feature management
- `/api/cache/revalidate` - Cache operations
- `/api/webhooks/revalidate` - Webhook processing

### **Caching Strategy**
- ISR with on-demand revalidation
- Component-based cache tags
- Geographic cache optimization
- CDN integration

### **API Design Patterns**
- Dependency injection for services
- Repository pattern for data access
- Factory pattern for multi-provider support
- Strategy pattern for payment providers

---

*This documentation covers all 50+ API endpoints in the SP Tech e-commerce platform, providing a comprehensive reference for developers working with the system.*