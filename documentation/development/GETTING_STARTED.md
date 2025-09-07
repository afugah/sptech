# Getting Started Guide

## Overview

This guide will help you set up and start developing on the SP Tech e-commerce platform. The project uses Next.js 14, TypeScript, and a modern tech stack with dependency injection patterns.

---

## 🚀 **Quick Start**

### **Prerequisites**

- **Node.js 18+** (recommended: latest LTS)
- **Yarn package manager**
- **Git** for version control
- **Code editor** (VS Code recommended)

### **Environment Setup**

```bash
# 1. Clone the repository
git clone [repository-url]
cd efva-attling

# 2. Install dependencies
yarn install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys and configuration

# 4. Start development server
yarn dev
```

The application will be available at `https://localhost:3000` (note: uses experimental HTTPS)

---

## 🔧 **Development Commands**

### **Essential Commands**

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Run linting (must pass with 0 warnings) - Now with caching for speed!
yarn lint

# Auto-fix linting issues - Also uses cache
yarn lint:fix

# Run full project lint without cache (when needed)
yarn lint:full

# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Type checking
yarn tsc --noEmit

# Emergency commits (use sparingly!)
yarn commit:quick  # Bypasses pre-commit hooks
yarn push:force    # Bypasses pre-push hooks
```

### **Content Management**

```bash
# Generate Storyblok types
yarn storyblok

# Pull content from Storyblok
yarn pull-storyblok

# Fetch components from Storyblok
npx storyblok pull-components --space=XXXXXX
```

### **Analysis & Optimization**

```bash
# Build with bundle analyzer
ANALYZE=true yarn build

# Performance analysis
yarn analyze
```

---

## 📁 **Project Structure**

### **Key Directories**

```
src/
├── app/                     # Next.js App Router
│   ├── [locale]/           # Internationalized routes
│   ├── api/                # API routes (50+ endpoints)
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── checkout/           # Checkout flow
│   ├── product/            # Product components
│   └── ui/                 # Reusable UI components
├── context/                # React Context providers
├── lib/                    # Core business logic
│   ├── di.ts              # Dependency injection
│   ├── framework/         # Domain frameworks
│   └── types/             # TypeScript definitions
└── styles/                 # Styling files
```

### **Configuration Files**

- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Testing configuration
- `package.json` - Dependencies and scripts

---

## 🔑 **Environment Configuration**

### **Required Environment Variables**

```bash
# Core Commerce API
NEXT_PUBLIC_BRINK_API_URL=https://api.brink.com/[your-domain]
BRINK_SHOPPER_X_API_KEY=your-brink-api-key

# Content Management
NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN=your-storyblok-token
STORYBLOK_WEBHOOK_SECRET=your-webhook-secret

# Authentication
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://localhost:3000

# Cache & Revalidation
REVALIDATE_SECRET=your-revalidate-secret
WEBHOOK_REVALIDATION_SECRET=your-webhook-secret
INTERNAL_API_SECRET=your-internal-secret

# Base URLs
NEXT_PUBLIC_BASE_DOMAIN=localhost:3000
NEXT_PUBLIC_BASE_URL=https://localhost:3000
```

### **Optional Configuration**

```bash
# Search Services
NEXT_PUBLIC_FINDIFY_API_KEY=your-findify-key
NEXT_PUBLIC_FINDIFY_MERCHANT_ID=your-merchant-id

# Payment Providers
KLARNA_API_KEY=your-klarna-key
# (Other payment providers disabled by feature flags)

# Analytics
NEXT_PUBLIC_GTM_ID=your-gtm-id
```

---

## ⚡ **Optimized Development Workflow**

### **90% Faster Commits**

The project uses an optimized linting workflow that dramatically speeds up development:

- **Lint-staged** - Only lints files you're actually committing (not the entire project)
- **ESLint Caching** - Skips unchanged files on subsequent runs
- **Parallel Execution** - Runs lint and security checks simultaneously
- **Smart Ignores** - Excludes generated files, docs, and build artifacts

### **Pre-commit Performance**

```bash
# Before optimization: 30-60 seconds per commit
# After optimization: 5-10 seconds per commit

# The pre-commit hook automatically:
1. Lints only staged files
2. Runs security checks in parallel
3. Auto-fixes issues when possible
4. Provides clear error messages
```

### **Cache Management**

```bash
# ESLint cache is stored in .eslintcache (gitignored)
# If you encounter stale lint results:
rm .eslintcache

# To run a full project lint without cache:
yarn lint:full
```

### **Emergency Workflows**

When you need to bypass checks in urgent situations:

```bash
# Commit without running hooks
yarn commit:quick
# or
git commit --no-verify

# Push without verification
yarn push:force
# or
git push --no-verify
```

**Note:** Use these sparingly - they bypass quality checks!

---

## 🏗️ **Architecture Overview**

### **Core Concepts**

1. **Domain-Driven Design** - Business domains as separate modules
2. **Dependency Injection** - Service registration with TSyringe
3. **Multi-Provider Architecture** - Configurable external services
4. **Feature Flags** - Control feature availability

### **Dependency Injection Example**

```typescript
// Service registration (src/lib/di.ts)
import { container } from 'tsyringe';

container.register('CommerceService', { useClass: CommerceService });
container.register('ProductService', { useClass: ProductService });

// Service usage
import { di } from '@/src/lib/di';
const commerceService = di.resolve('CommerceService');
```

### **Feature Flag Usage**

```typescript
// Feature flags (src/lib/features.ts)
export const PAYMENT_FEATURES = {
  KLARNA: true,        // ✅ Active
  ADYEN: false,        // 🚫 Disabled
  WALLEY: false,       // 🚫 Disabled
};

// Usage in components
{PAYMENT_FEATURES.KLARNA && <KlarnaCheckout />}
```

---

## 🌍 **Internationalization**

### **Locale Configuration**

The platform supports multiple markets with dynamic routing:

- `se` - Sweden (Swedish)
- `se-en` - Sweden (English)
- `no` - Norway (Norwegian)
- `fi` - Finland (Finnish)
- `dk` - Denmark (Danish)

### **Market-Specific Development**

```typescript
// Access current locale in components
import { useParams } from 'next/navigation';

const { locale } = useParams();
// locale will be 'se', 'se-en', 'no', etc.
```

---

## 🧪 **Testing Strategy**

### **Testing Stack**

- **Jest** - Test runner
- **Testing Library** - React component testing
- **jsdom** - Browser simulation
- **MSW** - API mocking (prepared)

### **Running Tests**

```bash
# Run all tests
yarn test

# Watch mode
yarn test:watch

# Coverage report
yarn test --coverage

# Specific test file
yarn test src/components/Button.test.tsx
```

### **Writing Tests**

```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

---

## 🎨 **Styling & Design System**

### **Tailwind CSS Usage**

- **Utility-first** styling approach
- **Responsive design** with mobile-first approach
- **Custom design tokens** in `tailwind.config.js`
- **Component variants** using class composition

### **Styling Example**

```tsx
// Responsive button component
const Button = ({ children, variant = 'primary' }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  };

  return <button className={`${baseClasses} ${variantClasses[variant]}`}>{children}</button>;
};
```

---

## 🔄 **API Development**

### **API Route Structure**

```
src/app/api/
├── session/           # Cart and session management
├── checkout/          # Checkout process
├── products/          # Product data
├── cache/            # Cache management
└── webhooks/         # External webhooks
```

### **Creating API Routes**

```typescript
// Example API route (src/app/api/example/route.ts)
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Handle POST request
}
```

---

## 📦 **Component Development**

### **Component Structure**

```typescript
// Example component structure
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={getButtonClasses(variant, disabled)}
    >
      {children}
    </button>
  );
};
```

### **Context Usage**

```typescript
// Using React Context for state management
import { useContext } from 'react';
import { CartContext } from '@/src/context/cartContext';

const CartButton = () => {
  const { items, addItem } = useContext(CartContext);

  return (
    <button onClick={() => addItem(product)}>
      Add to Cart ({items.length})
    </button>
  );
};
```

---

## 🛠️ **Development Tools**

### **VS Code Extensions (Recommended)**

- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Tailwind CSS IntelliSense**
- **Auto Rename Tag**
- **GitLens**
- **ESLint**
- **Prettier**

### **Browser Extensions**

- **React Developer Tools**
- **TanStack Query DevTools**
- **Redux DevTools** (if using Redux)

---

## 🚨 **Common Issues & Solutions**

### **Development Server Issues**

```bash
# Port already in use
lsof -ti:3000 | xargs kill -9

# Clear Next.js cache
rm -rf .next

# Clear node modules and reinstall
rm -rf node_modules yarn.lock
yarn install
```

### **TypeScript Errors**

```bash
# Generate fresh types
yarn storyblok

# Clear TypeScript cache
rm -rf .next/types
```

### **Environment Variables Not Loading**

- Ensure `.env.local` exists and has correct format
- Restart development server after changing environment variables
- Check that variable names start with `NEXT_PUBLIC_` for client-side access

---

## 📋 **Development Checklist**

### **Before Starting Development**

- [ ] Environment variables configured
- [ ] Development server running without errors
- [ ] Linting passes with 0 warnings
- [ ] TypeScript compilation successful
- [ ] Test suite passing

### **Before Committing**

- [ ] Code follows project conventions
- [ ] All TypeScript errors resolved
- [ ] Linting passes with 0 warnings
- [ ] Tests written for new features
- [ ] Documentation updated if needed

---

## 🔗 **Related Documentation**

- **[System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)** - Technical architecture overview
- **[API Endpoints](../API_ENDPOINTS.md)** - Complete API reference
- **[Coding Standards](./CODING_STANDARDS.md)** - Code style guidelines
- **[Testing Guide](./TESTING_GUIDE.md)** - Testing best practices

---

Welcome to the SP Tech development team! This guide should get you up and running quickly. For questions, check the documentation or reach out to the team.
