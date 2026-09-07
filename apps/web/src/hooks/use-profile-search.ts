import type { SearchParams } from '@repo/api-types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { searchProfiles } from '@/api/profiles';

export function useProfileSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['profiles', 'search', params],
    queryFn: () => searchProfiles(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
