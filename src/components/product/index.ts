// Product Card - Single source of truth for all product cards
export type { ProductCardProps } from './ProductCard';
export { default as ProductCard } from './ProductCard';

// Legacy exports for backward compatibility (if still needed)
// These components are deprecated and should not be used
// export { default as InitialSearchProductCard } from './InitialSearchProductCard';
// export { default as StoryblokProductCard } from './StoryblokProductCard';
// export { default as WishlistProductCard } from './WishlistProductCard';

// Shared components
export { ColorSelector } from './ColorSelector';
export { ProductTag } from './ProductTag';

// Shared utilities
export * from './shared';
