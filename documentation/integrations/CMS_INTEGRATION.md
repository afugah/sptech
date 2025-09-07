# CMS Integration (Storyblok)

## Overview

The SP Tech platform integrates with **Storyblok** as the primary Content Management System, providing dynamic content management, internationalization support, and real-time preview capabilities.

---

## 🏗️ **Integration Architecture**

### **Storyblok Stack**
- **Storyblok CMS**: Content management and editing
- **Management API**: Content creation and administration
- **Delivery API**: Content retrieval for frontend
- **Webhooks**: Real-time content synchronization
- **Preview Mode**: Live content editing preview

### **Content Flow**
```
Content Editor → Storyblok CMS → Delivery API → Next.js → User Interface
                     ↓
                 Webhooks → Cache Invalidation → Updated Content
```

---

## 🔧 **Technical Implementation**

### **Environment Configuration**
```bash
# Storyblok Configuration
NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN=your-access-token
STORYBLOK_PREVIEW_TOKEN=your-preview-token
STORYBLOK_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_STORYBLOK_VERSION=published # or 'draft' for preview
```

### **Storyblok Client Setup**
```typescript
// src/lib/storyblok/client.ts
import { getStoryblokApi } from '@storyblok/react/rsc';

export const storyblokApi = getStoryblokApi();

export async function fetchStoryblokData(slug: string, locale: string) {
  const version = process.env.NEXT_PUBLIC_STORYBLOK_VERSION as 'published' | 'draft';
  
  try {
    const { data } = await storyblokApi.get(`cdn/stories/${slug}`, {
      version,
      language: locale,
      resolve_links: 'url',
      resolve_relations: ['related_products', 'featured_collections']
    });
    
    return data.story;
  } catch (error) {
    console.error(`Failed to fetch story: ${slug}`, error);
    throw error;
  }
}
```

---

## 📄 **Content Types & Components**

### **Page Content Types**
- **Homepage**: Landing page with hero sections
- **Product Pages**: Product detail pages
- **Category Pages**: Product category listings
- **CMS Pages**: General content pages
- **Navigation**: Header and footer content

### **Component Library**
```typescript
// Storyblok component mapping
const componentMap = {
  'hero-section': HeroSection,
  'product-grid': ProductGrid,
  'featured-collection': FeaturedCollection,
  'text-block': TextBlock,
  'image-gallery': ImageGallery,
  'cta-section': CTASection,
  'newsletter-signup': NewsletterSignup
};
```

### **Rich Text Rendering**
```typescript
// Rich text component rendering
import { render } from 'storyblok-rich-text-react-renderer';

const RichText = ({ content }: { content: any }) => {
  return render(content, {
    nodeResolvers: {
      [NODE_PARAGRAPH]: (children) => <p className="mb-4">{children}</p>,
      [NODE_HEADING]: (children, { level }) => {
        const Tag = `h${level}` as keyof JSX.IntrinsicElements;
        return <Tag className={`text-${6-level}xl font-bold mb-4`}>{children}</Tag>;
      }
    },
    blokResolvers: {
      ['product-card']: (props) => <ProductCard {...props} />,
      ['button']: (props) => <Button {...props} />
    }
  });
};
```

---

## 🌍 **Internationalization**

### **Multi-Language Content**
```typescript
// Language-specific content fetching
async function getLocalizedContent(slug: string, locale: string) {
  const fallbackLocale = 'en'; // Default fallback
  
  try {
    // Try to fetch content in requested locale
    return await fetchStoryblokData(`${locale}/${slug}`, locale);
  } catch (error) {
    // Fallback to default locale if content not found
    console.warn(`Content not found for ${locale}, falling back to ${fallbackLocale}`);
    return await fetchStoryblokData(`${fallbackLocale}/${slug}`, fallbackLocale);
  }
}
```

### **Market-Specific Content**
```typescript
// Market-based content routing
const MARKET_CONTENT_MAP = {
  'se': { locale: 'sv', currency: 'SEK', region: 'nordic' },
  'no': { locale: 'nb', currency: 'NOK', region: 'nordic' },
  'fi': { locale: 'fi', currency: 'EUR', region: 'nordic' },
  'dk': { locale: 'da', currency: 'DKK', region: 'nordic' }
};
```

---

## 🔄 **Real-Time Content Updates**

### **Webhook Integration**
```typescript
// Webhook handler for content updates
export async function POST(request: NextRequest) {
  const body = await request.json();
  const signature = request.headers.get('webhook-signature');
  
  // Verify webhook authenticity
  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const { story, action } = body;
  
  switch (action) {
    case 'published':
      await invalidateContentCache(story.full_slug);
      break;
    case 'unpublished':
      await removeFromCache(story.full_slug);
      break;
    case 'deleted':
      await removeFromCache(story.full_slug);
      break;
  }
  
  return NextResponse.json({ success: true });
}
```

### **Cache Invalidation Strategy**
```typescript
// Content-specific cache invalidation
async function invalidateContentCache(slug: string) {
  const cacheKeys = [
    `content:${slug}`,
    `page:${slug}`,
    'navigation', // Global navigation might be affected
    'homepage'   // Homepage might include dynamic content
  ];
  
  for (const key of cacheKeys) {
    await revalidateTag(key);
  }
}
```

---

## 👁️ **Preview Mode**

### **Preview Implementation**
```typescript
// Preview mode for content editing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  
  // Verify preview secret
  if (secret !== process.env.STORYBLOK_PREVIEW_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
  
  // Enable preview mode
  const response = NextResponse.redirect(new URL(`/${slug}`, request.url));
  response.cookies.set('__prerender_bypass', '1');
  response.cookies.set('__next_preview_data', '1');
  
  return response;
}
```

### **Preview Component**
```typescript
// Preview bar for content editors
const PreviewBar = () => {
  const isPreview = useIsPreview();
  
  if (!isPreview) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-black p-2 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <span>Preview Mode - Content changes are not live</span>
        <button onClick={exitPreview}>Exit Preview</button>
      </div>
    </div>
  );
};
```

---

## 🎨 **Visual Editor Integration**

### **Storyblok Bridge**
```typescript
// Visual editor integration
import { storyblokInit, apiPlugin } from '@storyblok/react/rsc';

storyblokInit({
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN,
  use: [apiPlugin],
  components: {
    'hero-section': HeroSection,
    'product-grid': ProductGrid,
    'text-block': TextBlock
  }
});
```

### **Visual Editor Component**
```typescript
// Component with visual editing support
import { StoryblokComponent } from '@storyblok/react/rsc';

const EditableComponent = ({ blok }: { blok: any }) => {
  return (
    <div data-blok-c={JSON.stringify(blok)} data-blok-uid={blok._uid}>
      <StoryblokComponent blok={blok} />
    </div>
  );
};
```

---

## 📊 **Content Analytics**

### **Content Performance Tracking**
```typescript
// Track content engagement
interface ContentAnalytics {
  pageSlug: string;
  viewCount: number;
  timeOnPage: number;
  bounceRate: number;
  conversionRate: number;
  lastUpdated: string;
}

async function trackContentView(slug: string) {
  await fetch('/api/analytics/content', {
    method: 'POST',
    body: JSON.stringify({
      slug,
      timestamp: Date.now(),
      event: 'page_view'
    })
  });
}
```

### **A/B Testing Support**
```typescript
// Content variant testing
const ContentVariantTest = ({ variants, testId }: {
  variants: ContentVariant[];
  testId: string;
}) => {
  const [selectedVariant] = useABTest(testId, variants);
  
  return <StoryblokComponent blok={selectedVariant.content} />;
};
```

---

## 🔍 **SEO Integration**

### **Meta Data Generation**
```typescript
// Generate meta data from Storyblok content
async function generateMetadata({ params }: {
  params: { slug: string; locale: string }
}): Promise<Metadata> {
  const story = await fetchStoryblokData(params.slug, params.locale);
  
  return {
    title: story.content.meta_title || story.name,
    description: story.content.meta_description,
    keywords: story.content.meta_keywords,
    openGraph: {
      title: story.content.og_title || story.name,
      description: story.content.og_description,
      images: story.content.og_image?.filename ? [
        {
          url: story.content.og_image.filename,
          width: story.content.og_image.width,
          height: story.content.og_image.height,
        }
      ] : []
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/${params.locale}/${params.slug}`
    }
  };
}
```

### **Structured Data**
```typescript
// Generate JSON-LD structured data
function generateStructuredData(story: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: story.name,
    description: story.content.meta_description,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/${story.full_slug}`,
    datePublished: story.published_at,
    dateModified: story.content.updated_at
  };
}
```

---

## 🛠️ **Development Tools**

### **Type Generation**
```bash
# Generate TypeScript types from Storyblok
npx storyblok pull-components --space=YOUR_SPACE_ID
npx storyblok generate-types --source=./storyblok-types.json
```

### **Local Development**
```typescript
// Local development with mock data
const mockStoryblokData = {
  story: {
    content: {
      component: 'page',
      body: [
        {
          component: 'hero-section',
          title: 'Welcome to SP Tech',
          subtitle: 'Discover our latest collection'
        }
      ]
    }
  }
};

// Use mock data in development
const story = process.env.NODE_ENV === 'development' 
  ? mockStoryblokData.story 
  : await fetchStoryblokData(slug, locale);
```

---

## 🔐 **Security & Access Control**

### **API Token Management**
- **Public Token**: Read-only access for published content
- **Preview Token**: Access to draft content
- **Management Token**: Content creation and editing (server-side only)

### **Content Validation**
```typescript
// Validate content before rendering
function validateStoryblokContent(story: any): boolean {
  const requiredFields = ['content', 'name', 'slug'];
  
  return requiredFields.every(field => {
    if (!story[field]) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
    return true;
  });
}
```

---

## 📋 **Content Management Best Practices**

### **Content Structure Guidelines**
- **Consistent Naming**: Use clear, descriptive component names
- **Modular Design**: Create reusable content blocks
- **SEO Optimization**: Include meta fields for all content types
- **Image Optimization**: Use Storyblok's image service with transformations
- **Content Validation**: Implement field validation rules

### **Editor Training**
- **Component Usage**: Document how to use each component
- **SEO Guidelines**: Train editors on meta data best practices
- **Preview Testing**: Always preview content before publishing
- **Multi-language**: Understand translation workflows

---

## 🚀 **Performance Optimization**

### **Content Caching**
```typescript
// Aggressive caching for published content
const CACHE_STRATEGY = {
  published: {
    revalidate: 3600, // 1 hour
    tags: ['storyblok-content']
  },
  draft: {
    revalidate: 0, // No caching for drafts
    tags: ['storyblok-preview']
  }
};
```

### **Image Optimization**
```typescript
// Optimized image loading from Storyblok
const OptimizedImage = ({ src, alt, ...props }: ImageProps) => {
  const optimizedSrc = `${src}/m/800x600/filters:format(webp):quality(80)`;
  
  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      loading="lazy"
      {...props}
    />
  );
};
```

---

This CMS integration provides a robust, scalable content management solution for the SP Tech platform with real-time updates, multi-language support, and optimal performance.