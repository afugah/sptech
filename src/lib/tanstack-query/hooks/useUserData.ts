/**
 * Strategic user data hooks with optimized cache timing
 */

import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { INVALIDATION_PATTERNS, QUERY_CONFIGS, QUERY_KEYS } from '../queryConfig';

/**
 * Hook for user profile data
 * Uses user-specific cache timing
 */
export function useUserProfile<T>(
  userId: string,
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    ...QUERY_CONFIGS.userSpecific([QUERY_KEYS.USER_PROFILE, userId], fetcher),
    enabled: enabled && !!userId,
  }) as UseQueryResult<T, Error>;
}

/**
 * Hook for user preferences
 * Uses user-specific cache timing
 */
export function useUserPreferences<T>(
  userId: string,
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    ...QUERY_CONFIGS.userSpecific([QUERY_KEYS.USER_PREFERENCES, userId], fetcher),
    enabled: enabled && !!userId,
  }) as UseQueryResult<T, Error>;
}

/**
 * Hook for authentication session
 * Uses real-time cache timing for session validation
 */
export function useAuthSession<T>(
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    ...QUERY_CONFIGS.realTime([QUERY_KEYS.SESSION, 'auth'], fetcher),
    enabled,
  }) as UseQueryResult<T, Error>;
}

/**
 * Mutation for updating user profile
 */
export function useUpdateUserProfileMutation<_TData, TVariables>() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_variables: TVariables) => {
      // This will be implemented by the consumer
      throw new Error('mutationFn must be provided');
    },
    onSuccess: () => {
      // Invalidate user-related queries
      INVALIDATION_PATTERNS.user.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
    },
    onError: (error) => {
      console.error('[User] Update profile failed:', error);
    },
  });
}

/**
 * Mutation for updating user preferences
 */
export function useUpdateUserPreferencesMutation<_TData, TVariables>() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_variables: TVariables) => {
      // This will be implemented by the consumer
      throw new Error('mutationFn must be provided');
    },
    onSuccess: () => {
      // Invalidate user preference queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_PREFERENCES] });
    },
    onError: (error) => {
      console.error('[User] Update preferences failed:', error);
    },
  });
}
