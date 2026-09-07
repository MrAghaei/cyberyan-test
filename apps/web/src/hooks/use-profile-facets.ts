import type { SearchParams } from '@repo/api-types';
import { useQuery } from '@tanstack/react-query';

import { getFacets } from '@/api/profiles';

export function useProfileFacets(scopedParams: Pick<SearchParams, 'q'>) {
  return useQuery({
    queryKey: ['profiles', 'facets', scopedParams],
    queryFn: () => getFacets(scopedParams),
    staleTime: 5 * 60_000,
  });
}
