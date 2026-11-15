'use client';

import { useQuery } from '@tanstack/react-query';
import { currentUserKey, getCurrentUser } from '../api';

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: () => getCurrentUser(),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: true,
  });
}
