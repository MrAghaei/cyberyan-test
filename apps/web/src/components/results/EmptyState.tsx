import { SearchX } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onClear?: () => void;
}

export function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card px-6 py-12 text-center">
      <SearchX className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <h2 className="text-lg font-medium">No profiles match your search</h2>
        <p className="text-sm text-muted-foreground">
          Try different keywords or clear your filters.
        </p>
      </div>
      {onClear ? (
        <Button type="button" variant="outline" onClick={onClear}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
