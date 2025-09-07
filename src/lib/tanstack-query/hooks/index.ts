/**
 * Strategic TanStack Query hooks with optimized cache timing
 *
 * Re-exports all query hooks with strategic cache configurations
 * based on ARKITECT.md patterns and data characteristics.
 */

// Core configuration
export {
  CACHE_TIMINGS,
  createQueryOptions,
  INVALIDATION_PATTERNS,
  QUERY_CONFIGS,
  QUERY_KEYS,
  withQueryPerformanceLogging,
} from '../queryConfig';

// CMS content hooks
export {
  useGlobalSettings,
  useNavigationContent,
  useProductContent,
  useReferenceContent,
  useStaticContent,
} from './useCMSContent';

// Commerce data hooks
export {
  useAddToCartMutation,
  useCartData,
  useCategories,
  useCollections,
  useInventoryData,
  usePricingData,
  useProductData,
  useProductSearch,
  useRemoveFromCartMutation,
  useSessionData,
  useUpdateCartMutation,
} from './useCommerceData';

// User data hooks
export {
  useAuthSession,
  useUpdateUserPreferencesMutation,
  useUpdateUserProfileMutation,
  useUserPreferences,
  useUserProfile,
} from './useUserData';

/**
 * Migration guide for existing query hooks:
 *
 * Replace generic useQuery calls with specific hooks:
 *
 * Before:
 * const { data } = useQuery({
 *   queryKey: ['products', productId],
 *   queryFn: () => fetchProduct(productId),
 *   staleTime: 1000 * 60,
 * });
 *
 * After:
 * const { data } = useProductData(
 *   productId,
 *   marketCode,
 *   () => fetchProduct(productId)
 * );
 *
 * Benefits:
 * - Automatic cache timing optimization
 * - Consistent query key patterns
 * - Built-in performance monitoring
 * - Strategic invalidation patterns
 * - Background refresh for dynamic content
 */
