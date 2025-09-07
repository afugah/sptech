# Performance Monitoring System

## Overview

This document provides comprehensive instructions for using the performance monitoring and baseline measurement system implemented as part of the SP Tech optimization project. The system provides automated performance tracking, baseline comparisons, and optimization measurement tools.

## System Architecture

The performance monitoring system consists of:

- **Performance Baseline Script** - Establishes baseline metrics before optimization
- **Edge Runtime Performance Tester** - Tests API route performance improvements
- **Automated Result Storage** - JSON-based performance history tracking
- **Comparison Tools** - Compare performance before/after optimizations

## Performance Baseline Script

### Location and Usage

**Script:** `scripts/performance-baseline.js`

**Run baseline measurement:**
```bash
# Run complete baseline measurement
node scripts/performance-baseline.js

# Or use yarn/npm
yarn run:baseline  # (if added to package.json scripts)
```

### Baseline Metrics Measured

#### 1. Build Performance
- **Build Time** - Complete Next.js build duration
- **Bundle Analysis** - Bundle size breakdown
- **Bundle Files** - Individual file sizes (main.js, framework.js, CSS)

#### 2. Source Code Analysis
- **Total Files** - Source file count
- **Components** - React component count (.tsx/.jsx in src/components)
- **Pages** - Page component count (src/app/**/*.tsx)
- **API Routes** - API route count (src/app/api/**/route.ts)
- **Styles** - CSS/SCSS file count
- **Tests** - Test file count (.test/.spec files)
- **Lines of Code** - Total TypeScript/JavaScript lines

#### 3. Dependencies Analysis
- **Package Count** - Production vs development dependencies
- **Node Modules Size** - Total disk usage
- **Heavy Dependencies** - Top 10 largest packages

#### 4. API Route Performance
- **Route Response Times** - All API endpoints tested
- **Cold Start Metrics** - Initial response timing
- **Memory Usage** - Process memory consumption during testing

## Performance Testing and Monitoring

### Core Web Vitals Tracking

```typescript
// Track Core Web Vitals
export function trackWebVitals(metric: any) {
  const { id, name, value, label } = metric;
  
  // Send to analytics
  gtag('event', name, {
    event_category: 'Web Vitals',
    event_label: label === 'web-vital' ? 'WebVital' : 'NextJS',
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    custom_parameter_1: id,
  });
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', name, value, 'ms');
  }
}
```

### API Performance Monitoring

```typescript
// Middleware for API performance tracking
export function withPerformanceMonitoring(handler: any) {
  return async (req: NextRequest) => {
    const startTime = performance.now();
    
    try {
      const response = await handler(req);
      const duration = performance.now() - startTime;
      
      // Log performance metrics
      console.log(`API ${req.method} ${req.url}: ${duration.toFixed(2)}ms`);
      
      // Track slow requests
      if (duration > 1000) {
        console.warn(`Slow API request: ${req.url} took ${duration.toFixed(2)}ms`);
      }
      
      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`API Error ${req.url}: ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  };
}
```

### Bundle Size Monitoring

```typescript
// Monitor bundle size changes
export interface BundleMetrics {
  timestamp: string;
  totalSize: number;
  mainBundle: number;
  frameworkBundle: number;
  cssSize: number;
  staticAssets: number;
  pages: Record<string, number>;
}

// Track bundle size changes
export function trackBundleSize(): BundleMetrics {
  const bundleInfo = analyzeBuildOutput();
  
  return {
    timestamp: new Date().toISOString(),
    totalSize: bundleInfo.total,
    mainBundle: bundleInfo.main,
    frameworkBundle: bundleInfo.framework,
    cssSize: bundleInfo.css,
    staticAssets: bundleInfo.static,
    pages: bundleInfo.pages
  };
}
```

## Performance Benchmarking

### Lighthouse Integration

```bash
# Run Lighthouse performance audit
npx lighthouse https://localhost:3000 --output=json --output-path=./performance/lighthouse-report.json

# Run for multiple pages
npx lighthouse https://localhost:3000/products --output=json --output-path=./performance/lighthouse-products.json
```

### Custom Performance Tests

```typescript
// Custom performance test suite
export class PerformanceTestSuite {
  async testPageLoadSpeed(url: string): Promise<PageMetrics> {
    const startTime = performance.now();
    
    // Simulate page load
    const response = await fetch(url);
    const content = await response.text();
    
    const endTime = performance.now();
    
    return {
      url,
      loadTime: endTime - startTime,
      contentSize: content.length,
      statusCode: response.status,
      timestamp: new Date().toISOString()
    };
  }
  
  async testAPIEndpoints(): Promise<APIMetrics[]> {
    const endpoints = [
      '/api/health',
      '/api/session/get-session',
      '/api/products/featured',
      '/api/cache/status'
    ];
    
    const results = await Promise.all(
      endpoints.map(endpoint => this.testAPIPerformance(endpoint))
    );
    
    return results;
  }
  
  private async testAPIPerformance(endpoint: string): Promise<APIMetrics> {
    const startTime = performance.now();
    
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`);
      const endTime = performance.now();
      
      return {
        endpoint,
        responseTime: endTime - startTime,
        statusCode: response.status,
        success: response.ok,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const endTime = performance.now();
      
      return {
        endpoint,
        responseTime: endTime - startTime,
        statusCode: 0,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
```

## Performance Data Storage

### Results Storage Format

```typescript
// Performance data structure
export interface PerformanceBaseline {
  timestamp: string;
  version: string;
  environment: 'development' | 'production' | 'staging';
  
  build: {
    duration: number;  // seconds
    bundleSize: number; // bytes
    bundleFiles: Record<string, number>;
  };
  
  codebase: {
    totalFiles: number;
    components: number;
    pages: number;
    apiRoutes: number;
    styles: number;
    tests: number;
    linesOfCode: number;
  };
  
  dependencies: {
    production: number;
    development: number;
    nodeModulesSize: number; // bytes
    heavyDependencies: Array<{
      name: string;
      size: number;
    }>;
  };
  
  performance: {
    apiRoutes: Record<string, {
      averageResponseTime: number;
      minResponseTime: number;
      maxResponseTime: number;
      requestCount: number;
    }>;
    
    webVitals: {
      lcp: number; // Largest Contentful Paint
      fid: number; // First Input Delay
      cls: number; // Cumulative Layout Shift
      fcp: number; // First Contentful Paint
      ttfb: number; // Time to First Byte
    };
  };
}
```

### Historical Data Management

```bash
# Performance results stored in:
performance/
├── baselines/
│   ├── baseline-2024-01-15.json
│   ├── baseline-2024-01-20.json
│   └── baseline-latest.json
├── lighthouse/
│   ├── lighthouse-homepage.json
│   ├── lighthouse-products.json
│   └── lighthouse-checkout.json
└── comparisons/
    ├── optimization-2024-01-20.json
    └── comparison-latest.json
```

## Performance Monitoring Dashboard

### Real-time Metrics

```typescript
// Performance monitoring hook
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>();
  
  useEffect(() => {
    // Monitor Core Web Vitals
    onCLS((metric) => updateMetric('cls', metric));
    onFID((metric) => updateMetric('fid', metric));
    onLCP((metric) => updateMetric('lcp', metric));
    onFCP((metric) => updateMetric('fcp', metric));
    onTTFB((metric) => updateMetric('ttfb', metric));
    
    // Monitor API performance
    monitorAPIPerformance();
  }, []);
  
  const updateMetric = (name: string, metric: any) => {
    setMetrics(prev => ({
      ...prev,
      [name]: {
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now()
      }
    }));
  };
  
  return metrics;
}
```

### Performance Alerts

```typescript
// Performance threshold monitoring
export class PerformanceAlerts {
  private thresholds = {
    lcp: 2500,      // 2.5 seconds
    fid: 100,       // 100 milliseconds
    cls: 0.1,       // 0.1 cumulative layout shift
    apiResponse: 1000, // 1 second
    bundleSize: 1024 * 1024, // 1MB
  };
  
  checkThresholds(metrics: PerformanceMetrics) {
    const alerts = [];
    
    if (metrics.lcp > this.thresholds.lcp) {
      alerts.push({
        type: 'warning',
        metric: 'LCP',
        value: metrics.lcp,
        threshold: this.thresholds.lcp,
        message: 'Largest Contentful Paint is above threshold'
      });
    }
    
    if (metrics.bundleSize > this.thresholds.bundleSize) {
      alerts.push({
        type: 'error',
        metric: 'Bundle Size',
        value: metrics.bundleSize,
        threshold: this.thresholds.bundleSize,
        message: 'Bundle size is too large'
      });
    }
    
    return alerts;
  }
}
```

## Performance Optimization Tracking

### Before/After Comparisons

```typescript
// Compare performance before and after optimizations
export function comparePerformance(
  baseline: PerformanceBaseline,
  current: PerformanceBaseline
): PerformanceComparison {
  return {
    timestamp: new Date().toISOString(),
    baseline: {
      version: baseline.version,
      timestamp: baseline.timestamp
    },
    current: {
      version: current.version,
      timestamp: current.timestamp
    },
    improvements: {
      buildTime: {
        before: baseline.build.duration,
        after: current.build.duration,
        change: current.build.duration - baseline.build.duration,
        percentChange: ((current.build.duration - baseline.build.duration) / baseline.build.duration) * 100
      },
      bundleSize: {
        before: baseline.build.bundleSize,
        after: current.build.bundleSize,
        change: current.build.bundleSize - baseline.build.bundleSize,
        percentChange: ((current.build.bundleSize - baseline.build.bundleSize) / baseline.build.bundleSize) * 100
      },
      apiPerformance: compareAPIPerformance(baseline.performance.apiRoutes, current.performance.apiRoutes)
    }
  };
}
```

### Regression Detection

```typescript
// Detect performance regressions
export function detectRegressions(
  current: PerformanceMetrics,
  baseline: PerformanceMetrics
): PerformanceRegression[] {
  const regressions = [];
  
  // Check bundle size regression
  if (current.bundleSize > baseline.bundleSize * 1.1) { // 10% increase
    regressions.push({
      type: 'bundle_size',
      severity: 'high',
      current: current.bundleSize,
      baseline: baseline.bundleSize,
      increase: current.bundleSize - baseline.bundleSize
    });
  }
  
  // Check API response time regression
  Object.keys(current.apiPerformance).forEach(endpoint => {
    const currentTime = current.apiPerformance[endpoint].averageResponseTime;
    const baselineTime = baseline.apiPerformance[endpoint]?.averageResponseTime;
    
    if (baselineTime && currentTime > baselineTime * 1.2) { // 20% increase
      regressions.push({
        type: 'api_response_time',
        severity: 'medium',
        endpoint,
        current: currentTime,
        baseline: baselineTime,
        increase: currentTime - baselineTime
      });
    }
  });
  
  return regressions;
}
```

## Best Practices

### 1. Continuous Monitoring
- Run performance baselines before major changes
- Monitor Core Web Vitals in production
- Set up automated performance testing in CI/CD
- Track bundle size changes with each deployment

### 2. Performance Budgets
- Set and enforce bundle size limits
- Monitor API response time thresholds
- Track Core Web Vitals targets
- Alert on performance regressions

### 3. Regular Analysis
- Weekly performance reviews
- Monthly baseline comparisons
- Quarterly optimization planning
- Annual performance audits

### 4. Optimization Workflow
1. Establish baseline metrics
2. Implement optimizations
3. Measure improvements
4. Compare before/after results
5. Document optimization impact

## Troubleshooting

### Common Performance Issues

**Slow Build Times:**
- Large dependency count
- Complex TypeScript compilation
- Excessive file processing

**Large Bundle Sizes:**
- Unused dependencies
- Duplicate code
- Unoptimized images/assets

**Poor Web Vitals:**
- Unoptimized images
- Render-blocking resources
- Layout shifts

**Slow API Responses:**
- Database query optimization needed
- External API dependencies
- Inefficient data processing

### Performance Investigation Tools

```bash
# Analyze bundle composition
ANALYZE=true yarn build

# Profile build performance
NODE_OPTIONS="--inspect" yarn build

# Check for memory leaks
node --inspect scripts/performance-baseline.js

# Monitor runtime performance
yarn dev --turbo
```

---

This performance monitoring system provides comprehensive tracking and analysis capabilities to ensure optimal performance of the SP Tech platform.