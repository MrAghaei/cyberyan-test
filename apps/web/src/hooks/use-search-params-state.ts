import type { SearchParams } from '@repo/api-types';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

const ARRAY_KEYS = ['industry', 'jobTitle'] as const;
const DEFAULT_LIMIT = 20;

function subscribe(onStoreChange: () => void) {
  window.addEventListener('popstate', onStoreChange);
  return () => window.removeEventListener('popstate', onStoreChange);
}

function getSearchSnapshot() {
  return window.location.search;
}

function parseArrayParam(searchParams: URLSearchParams, key: string): string[] {
  return searchParams
    .getAll(key)
    .map((item) => item.trim())
    .filter(Boolean);
}

function writeArrayParam(
  params: URLSearchParams,
  key: string,
  values: string[] | undefined,
) {
  params.delete(key);
  for (const value of values ?? []) {
    const trimmed = value.trim();
    if (trimmed) {
      params.append(key, trimmed);
    }
  }
}

function parseParams(search: string): SearchParams {
  const searchParams = new URLSearchParams(search);
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(DEFAULT_LIMIT));
  const q = searchParams.get('q') ?? undefined;

  return {
    q: q || undefined,
    industry: parseArrayParam(searchParams, 'industry'),
    jobTitle: parseArrayParam(searchParams, 'jobTitle'),
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_LIMIT,
  };
}

function replaceSearchParams(mutate: (params: URLSearchParams) => void) {
  const next = new URLSearchParams(window.location.search);
  mutate(next);
  const query = next.toString();
  const nextUrl = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;
  window.history.replaceState(null, '', nextUrl);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function useSearchParamsState() {
  const search = useSyncExternalStore(subscribe, getSearchSnapshot, () => '');

  const params = useMemo(() => parseParams(search), [search]);

  const updateParams = useCallback(
    (updates: Partial<SearchParams>, resetPage = true) => {
      replaceSearchParams((next) => {
        if ('q' in updates) {
          const value = updates.q?.trim();
          if (value) {
            next.set('q', value);
          } else {
            next.delete('q');
          }
        }

        for (const key of ARRAY_KEYS) {
          if (key in updates) {
            writeArrayParam(next, key, updates[key]);
          }
        }

        if ('page' in updates && updates.page) {
          next.set('page', String(updates.page));
        } else if (resetPage) {
          next.delete('page');
        }

        if ('limit' in updates && updates.limit) {
          next.set('limit', String(updates.limit));
        }
      });
    },
    [],
  );

  const clearFilters = useCallback(() => {
    replaceSearchParams((next) => {
      const q = next.get('q');
      for (const key of [...next.keys()]) {
        next.delete(key);
      }
      if (q) {
        next.set('q', q);
      }
    });
  }, []);

  const hasActiveFilters =
    (params.industry?.length ?? 0) > 0 || (params.jobTitle?.length ?? 0) > 0;

  return {
    params,
    updateParams,
    clearFilters,
    hasActiveFilters,
  };
}
