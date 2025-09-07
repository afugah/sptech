# Coding Standards

## Overview

This document outlines the coding standards, conventions, and best practices for the SP Tech e-commerce platform to ensure consistent, maintainable, and high-quality code across the entire team.

---

## 🎯 **Core Principles**

### **Code Quality Standards**
1. **Type Safety**: Strict TypeScript, no `any` types
2. **Zero Warnings**: ESLint must pass with 0 warnings
3. **Test Coverage**: Minimum 80% coverage for critical modules
4. **Performance**: Bundle size impact monitoring
5. **Security**: No secrets in code, secure coding practices

### **Development Philosophy**
- **Domain-Driven Design**: Business logic organized by domain
- **Dependency Injection**: Loose coupling via TSyringe
- **Repository Pattern**: Data access abstraction
- **Clean Architecture**: Separation of concerns
- **Progressive Enhancement**: Works without JavaScript

---

## 📝 **TypeScript Standards**

### **Type Definitions**
```typescript
// ✅ Good: Explicit interface definitions
interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  availability: ProductAvailability;
}

interface ProductAvailability {
  inStock: boolean;
  quantity: number;
  expectedRestockDate?: Date;
}

// ❌ Bad: Using any type
const product: any = fetchProduct();

// ❌ Bad: Missing type annotations
function calculatePrice(product, discount) {
  return product.price * (1 - discount);
}

// ✅ Good: Proper type annotations
function calculatePrice(product: Product, discount: number): number {
  return product.price * (1 - discount);
}
```

### **Generic Types**
```typescript
// ✅ Good: Reusable generic interfaces
interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Usage
const products: APIResponse<Product[]> = await fetchProducts();
const productPage: PaginatedResponse<Product> = await fetchProductsPage(1, 20);
```

### **Union and Literal Types**
```typescript
// ✅ Good: Specific literal types
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
type SupportedLocale = 'se' | 'se-en' | 'no' | 'fi' | 'dk';
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// ✅ Good: Discriminated unions
interface LoadingState {
  status: 'loading';
}

interface SuccessState {
  status: 'success';
  data: Product[];
}

interface ErrorState {
  status: 'error';
  error: string;
}

type ProductState = LoadingState | SuccessState | ErrorState;
```

---

## ⚛️ **React Component Standards**

### **Component Structure**
```typescript
// ✅ Good: Proper component structure
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  className?: string;
  showQuickView?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  className = '',
  showQuickView = false
}) => {
  const handleAddToCart = useCallback(() => {
    onAddToCart(product.id);
  }, [product.id, onAddToCart]);

  return (
    <div className={`product-card ${className}`}>
      <h3>{product.name}</h3>
      <p>{formatPrice(product.price, product.currency)}</p>
      <button onClick={handleAddToCart}>
        Add to Cart
      </button>
      {showQuickView && <QuickViewButton productId={product.id} />}
    </div>
  );
};
```

### **Hook Usage**
```typescript
// ✅ Good: Custom hook with proper typing
interface UseProductQueryResult {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProductQuery(productId: string): UseProductQueryResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getById(productId);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
}
```

### **Event Handlers**
```typescript
// ✅ Good: Typed event handlers
interface FormData {
  email: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    message: ''
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitForm(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleInputChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
};
```

---

## 🏗️ **Architecture Patterns**

### **Dependency Injection**
```typescript
// ✅ Good: Service with dependency injection
import { injectable, inject } from 'tsyringe';

@injectable()
export class OrderService {
  constructor(
    @inject('CommerceRepository') 
    private commerceRepository: ICommerceRepository,
    @inject('PaymentService') 
    private paymentService: IPaymentService,
    @inject('EmailService') 
    private emailService: IEmailService
  ) {}

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    // Validate order data
    this.validateOrderData(orderData);

    // Create order in commerce system
    const order = await this.commerceRepository.createOrder(orderData);

    // Process payment
    const payment = await this.paymentService.processPayment({
      orderId: order.id,
      amount: order.total,
      currency: order.currency
    });

    // Send confirmation email
    await this.emailService.sendOrderConfirmation(order);

    return order;
  }

  private validateOrderData(data: CreateOrderData): void {
    if (!data.items.length) {
      throw new Error('Order must contain at least one item');
    }
    // Additional validation logic
  }
}
```

### **Repository Pattern**
```typescript
// ✅ Good: Repository interface and implementation
interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  search(criteria: SearchCriteria): Promise<SearchResult<Product>>;
  create(product: CreateProductData): Promise<Product>;
  update(id: string, updates: UpdateProductData): Promise<Product>;
  delete(id: string): Promise<void>;
}

@injectable()
export class BrinkProductRepository implements IProductRepository {
  constructor(
    @inject('BrinkAPIClient') 
    private apiClient: IBrinkAPIClient
  ) {}

  async findById(id: string): Promise<Product | null> {
    try {
      const response = await this.apiClient.get(`/products/${id}`);
      return this.mapToProduct(response.data);
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  private mapToProduct(data: any): Product {
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      currency: data.currency,
      availability: {
        inStock: data.inventory > 0,
        quantity: data.inventory,
        expectedRestockDate: data.expectedRestock ? new Date(data.expectedRestock) : undefined
      }
    };
  }
}
```

---

## 🌐 **API Route Standards**

### **Route Structure**
```typescript
// ✅ Good: API route with proper error handling
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Request validation schema
const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  currency: z.string().length(3),
  categoryId: z.string().uuid()
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateProductSchema.parse(body);

    // Get service from DI container
    const productService = di.resolve<IProductService>('ProductService');

    // Create product
    const product = await productService.create(validatedData);

    // Return success response
    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 });

  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }

    // Handle business logic errors
    if (error instanceof BusinessError) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }

    // Handle unexpected errors
    console.error('Unexpected error in POST /api/products:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
```

### **Error Handling**
```typescript
// ✅ Good: Centralized error handling
export class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

// Error handler middleware
export function handleAPIError(error: unknown): NextResponse {
  if (error instanceof APIError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: error.statusCode });
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      details: error.errors
    }, { status: 400 });
  }

  console.error('Unexpected API error:', error);
  return NextResponse.json({
    success: false,
    error: 'Internal server error'
  }, { status: 500 });
}
```

---

## 🎨 **Styling Standards**

### **Tailwind CSS Usage**
```tsx
// ✅ Good: Semantic class composition
const Button: React.FC<ButtonProps> = ({ variant, size, children, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const className = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;

  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
};

// ✅ Good: Responsive design
const ProductGrid: React.FC = ({ products }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {products.map(product => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
);
```

### **CSS Custom Properties**
```css
/* ✅ Good: CSS custom properties for theming */
:root {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-secondary: #64748b;
  --color-success: #059669;
  --color-error: #dc2626;
  
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 3rem;
  
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
}

/* ✅ Good: Component-specific styles */
.product-card {
  @apply relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md;
}

.product-card__image {
  @apply aspect-square w-full object-cover;
}

.product-card__content {
  @apply p-4;
}
```

---

## 📊 **Testing Standards**

### **Unit Tests**
```typescript
// ✅ Good: Comprehensive unit test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductCard } from './ProductCard';

const mockProduct: Product = {
  id: 'product-1',
  name: 'Test Product',
  price: 99.99,
  currency: 'SEK',
  availability: {
    inStock: true,
    quantity: 10
  }
};

describe('ProductCard', () => {
  const mockOnAddToCart = jest.fn();

  beforeEach(() => {
    mockOnAddToCart.mockClear();
  });

  it('renders product information correctly', () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockOnAddToCart} 
      />
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('99.99 SEK')).toBeInTheDocument();
  });

  it('calls onAddToCart when add to cart button is clicked', async () => {
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockOnAddToCart} 
      />
    );

    const addButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockOnAddToCart).toHaveBeenCalledWith('product-1');
    });
  });

  it('shows out of stock state when product is not available', () => {
    const outOfStockProduct = {
      ...mockProduct,
      availability: { inStock: false, quantity: 0 }
    };

    render(
      <ProductCard 
        product={outOfStockProduct} 
        onAddToCart={mockOnAddToCart} 
      />
    );

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDisabled();
  });
});
```

### **Integration Tests**
```typescript
// ✅ Good: API integration test
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock external dependencies
jest.mock('@/src/lib/di', () => ({
  di: {
    resolve: jest.fn()
  }
}));

describe('/api/products POST', () => {
  const mockProductService = {
    create: jest.fn()
  };

  beforeEach(() => {
    (di.resolve as jest.Mock).mockReturnValue(mockProductService);
    mockProductService.create.mockClear();
  });

  it('creates product successfully with valid data', async () => {
    const productData = {
      name: 'Test Product',
      price: 99.99,
      currency: 'SEK',
      categoryId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const mockCreatedProduct = { id: 'product-1', ...productData };
    mockProductService.create.mockResolvedValue(mockCreatedProduct);

    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockCreatedProduct);
    expect(mockProductService.create).toHaveBeenCalledWith(productData);
  });

  it('returns validation error for invalid data', async () => {
    const invalidData = {
      name: '', // Invalid: empty name
      price: -10, // Invalid: negative price
      currency: 'INVALID' // Invalid: not 3 characters
    };

    const request = new NextRequest('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify(invalidData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });
});
```

---

## 📋 **Code Review Guidelines**

### **Review Checklist**
- [ ] **Type Safety**: No `any` types, proper interfaces
- [ ] **Error Handling**: Comprehensive error handling
- [ ] **Performance**: No unnecessary re-renders, efficient algorithms
- [ ] **Security**: No hardcoded secrets, input validation
- [ ] **Testing**: Tests cover new functionality
- [ ] **Documentation**: Code is self-documenting with clear names
- [ ] **Accessibility**: Components are accessible
- [ ] **Responsiveness**: Works on all screen sizes

### **Review Process**
1. **Automated Checks**: ESLint, TypeScript, tests must pass
2. **Code Review**: At least one team member review
3. **Testing**: Manual testing of functionality
4. **Performance**: Check bundle size impact
5. **Security**: Security review for sensitive changes

---

## 🔧 **Development Tools**

### **ESLint Configuration**
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "react-hooks/exhaustive-deps": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### **Prettier Configuration**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

---

## 📚 **Documentation Standards**

### **Code Comments**
```typescript
// ✅ Good: Meaningful comments
/**
 * Calculates the total price including tax and discounts
 * @param basePrice - The base price before modifications
 * @param taxRate - Tax rate as decimal (e.g., 0.25 for 25%)
 * @param discountCode - Optional discount code to apply
 * @returns The final price including all modifications
 */
export function calculateTotalPrice(
  basePrice: number,
  taxRate: number,
  discountCode?: string
): number {
  let total = basePrice;
  
  // Apply discount if provided
  if (discountCode) {
    const discount = getDiscountAmount(discountCode, basePrice);
    total -= discount;
  }
  
  // Add tax to the discounted price
  total += total * taxRate;
  
  return Math.round(total * 100) / 100; // Round to 2 decimal places
}
```

### **README Updates**
- Keep README.md current with setup instructions
- Document new environment variables
- Update API documentation for new endpoints
- Include troubleshooting sections

---

These coding standards ensure consistency, maintainability, and high quality across the SP Tech codebase. All team members should follow these guidelines and use them during code reviews.