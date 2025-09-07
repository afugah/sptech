# Architecture Documentation

This section contains comprehensive documentation about the technical architecture and design patterns used in the SP Tech e-commerce platform.

## 📋 **Architecture Documentation**

### 🏗️ **System Architecture**
**[SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)**
- Complete technical architecture overview
- Framework stack and technology choices
- Domain-driven design patterns
- Multi-provider architecture
- Dependency injection system
- Security and performance architecture

---

## 🎯 **Key Architecture Concepts**

### **Domain-Driven Design**
The platform is organized around business domains, each with their own:
- **Interfaces**: Domain contracts and abstractions
- **Services**: Business logic implementation  
- **Repositories**: Data access layer
- **Types**: Domain-specific type definitions

### **Dependency Injection**
- **TSyringe** container for loose coupling
- Service registration and resolution
- Token-based dependency management
- Framework-based repositories with factory pattern

### **Multi-Provider Architecture**
- **Search Engines**: Findify, Algolia, Elasticsearch
- **Payment Providers**: Klarna (active), others feature-flagged
- **Shipping**: Ingrid integration
- **Content**: Storyblok CMS
- **Authentication**: NextAuth.js with Firebase

---

## 🔧 **Core Architectural Patterns**

### **Repository Pattern**
```typescript
interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  search(query: SearchQuery): Promise<SearchResult<Product>>;
}
```

### **Service Layer**
```typescript
@injectable()
export class ProductService {
  constructor(
    @inject('ProductRepository') private repository: IProductRepository
  ) {}
}
```

### **Factory Pattern**
```typescript
export class SearchEngineFactory {
  static create(type: SearchEngineType): ISearchEngine {
    switch (type) {
      case 'findify': return new FindifySearchEngine();
      case 'algolia': return new AlgoliaSearchEngine();
    }
  }
}
```

---

## 📊 **Architecture Diagrams**

### **System Overview**
```
User Interface (Next.js)
       ↓
Service Layer (Domain Services)
       ↓
Repository Layer (Data Access)
       ↓
External APIs (Brink, Storyblok, etc.)
```

### **Dependency Flow**
```
Components → Services → Repositories → External APIs
     ↓
Context/Hooks → TanStack Query → Cache Layer
```

---

## 🔗 **Related Documentation**

- **[API Endpoints](../API_ENDPOINTS.md)** - Complete API reference
- **[Integrations](../integrations/)** - External service integrations
- **[Performance](../performance/)** - Performance optimization strategies
- **[Development](../development/)** - Developer guides and standards

---

## 🎓 **Learning Path**

For developers new to the architecture:

1. **Start with [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)** for the complete overview
2. **Review dependency injection setup** in `src/lib/di.ts`
3. **Explore domain frameworks** in `src/lib/framework/`
4. **Study integration patterns** in the integrations documentation
5. **Understand performance patterns** in the performance documentation

---

*This architecture ensures scalability, maintainability, and flexibility for the SP Tech e-commerce platform.*