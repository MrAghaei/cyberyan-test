import type {
  ProfileFacetsResponse,
  ProfileSearchResponse,
  SearchParams,
} from '@repo/api-types';

import { apiClient } from '@/api/client';

function toFacetParams(params: SearchParams): Record<string, string | number | string[]> {
  const query: Record<string, string | number | string[]> = {};

  if (params.q) {
    query.q = params.q;
  }

  for (const key of ['industry', 'jobTitle'] as const) {
    const values = params[key];
    if (values?.length) {
      query[key] = values;
    }
  }

  return query;
}

export async function searchProfiles(
  params: SearchParams,
): Promise<ProfileSearchResponse> {
  const { data } = await apiClient.post<ProfileSearchResponse>(
    '/profiles/search',
    params,
  );
  return data;
}

export async function getFacets(
  params: SearchParams = {},
): Promise<ProfileFacetsResponse> {
  const { data } = await apiClient.get<ProfileFacetsResponse>(
    '/profiles/facets',
    { params: toFacetParams(params) },
  );
  return data;
}
