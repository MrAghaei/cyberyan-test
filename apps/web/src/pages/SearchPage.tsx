import { startTransition, useCallback, useDeferredValue, useMemo } from 'react';

import { getApiErrorMessage } from '@/api/client';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppShell } from '@/components/layout/AppShell';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { SearchBar } from '@/components/search/SearchBar';
import { EmptyState } from '@/components/results/EmptyState';
import { LoadingSkeleton } from '@/components/results/LoadingSkeleton';
import { ProfileList } from '@/components/results/ProfileList';
import { ResultsMeta } from '@/components/results/ResultsMeta';
import { useProfileFacets } from '@/hooks/use-profile-facets';
import { useProfileSearch } from '@/hooks/use-profile-search';
import { useSearchParamsState } from '@/hooks/use-search-params-state';

export function SearchPage() {
  const { params, updateParams, clearFilters, hasActiveFilters } =
    useSearchParamsState();

  const deferredParams = useDeferredValue(params);
  const isStale = deferredParams !== params;

  const facetScope = useMemo(
    () => ({ q: deferredParams.q }),
    [deferredParams.q],
  );

  const facetsQuery = useProfileFacets(facetScope);
  const searchQuery = useProfileSearch(deferredParams);

  const handleSearchChange = useCallback(
    (value: string) => {
      startTransition(() => {
        updateParams({ q: value });
      });
    },
    [updateParams],
  );

  const handleIndustryChange = useCallback(
    (industry: string[]) => {
      updateParams({ industry });
    },
    [updateParams],
  );

  const handleJobTitleChange = useCallback(
    (jobTitle: string[]) => {
      updateParams({ jobTitle });
    },
    [updateParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page }, false);
    },
    [updateParams],
  );

  const handleClear = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const industries = facetsQuery.data?.industries ?? [];
  const jobTitles = facetsQuery.data?.jobTitles ?? [];
  const profiles = searchQuery.data?.data ?? [];
  const meta = searchQuery.data?.meta;
  const isInitialLoading = searchQuery.isPending && !searchQuery.data;
  const showEmptyState =
    !isInitialLoading &&
    !searchQuery.isError &&
    profiles.length === 0 &&
    meta?.total === 0;

  return (
    <>
      <AppHeader />
      <AppShell>
        <section className="space-y-4">
          <SearchBar
            value={params.q ?? ''}
            onChange={handleSearchChange}
            isFetching={searchQuery.isFetching || isStale}
          />
          <FilterPanel
            industries={industries}
            jobTitles={jobTitles}
            industry={params.industry ?? []}
            jobTitle={params.jobTitle ?? []}
            onIndustryChange={handleIndustryChange}
            onJobTitleChange={handleJobTitleChange}
            onClear={handleClear}
            hasActiveFilters={hasActiveFilters}
            isLoading={facetsQuery.isPending}
          />
        </section>

        <section className="space-y-4">
          {searchQuery.isError ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {getApiErrorMessage(searchQuery.error)}
            </div>
          ) : null}

          {isInitialLoading ? (
            <LoadingSkeleton />
          ) : showEmptyState ? (
            <EmptyState onClear={hasActiveFilters ? handleClear : undefined} />
          ) : meta ? (
            <>
              <ResultsMeta meta={meta} />
              <ProfileList
                profiles={profiles}
                meta={meta}
                onPageChange={handlePageChange}
              />
            </>
          ) : null}
        </section>
      </AppShell>
    </>
  );
}
