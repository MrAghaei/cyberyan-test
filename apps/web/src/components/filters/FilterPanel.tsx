import { startTransition } from 'react';

import { FacetMultiSelect } from '@/components/filters/FacetMultiSelect';
import { Button } from '@/components/ui/button';

interface FilterPanelProps {
  industries: string[];
  jobTitles: string[];
  industry: string[];
  jobTitle: string[];
  onIndustryChange: (value: string[]) => void;
  onJobTitleChange: (value: string[]) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  isLoading?: boolean;
}

export function FilterPanel({
  industries,
  jobTitles,
  industry,
  jobTitle,
  onIndustryChange,
  onJobTitleChange,
  onClear,
  hasActiveFilters,
  isLoading,
}: FilterPanelProps) {
  const handleIndustryChange = (value: string[]) => {
    startTransition(() => {
      onIndustryChange(value);
    });
  };

  const handleJobTitleChange = (value: string[]) => {
    startTransition(() => {
      onJobTitleChange(value);
    });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
      <div className="grid flex-1 gap-4 sm:grid-cols-2">
        <FacetMultiSelect
          id="industry-filter"
          label="Industry"
          options={industries}
          value={industry}
          onChange={handleIndustryChange}
          placeholder={isLoading ? 'Loading industries...' : 'All industries'}
        />
        <FacetMultiSelect
          id="job-title-filter"
          label="Job Title"
          options={jobTitles}
          value={jobTitle}
          onChange={handleJobTitleChange}
          placeholder={isLoading ? 'Loading job titles...' : 'All job titles'}
        />
      </div>
      {hasActiveFilters ? (
        <Button type="button" variant="outline" onClick={onClear}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
