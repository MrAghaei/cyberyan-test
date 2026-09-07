import type { PaginationMeta } from '@repo/api-types';

interface ResultsMetaProps {
  meta: PaginationMeta;
}

export function ResultsMeta({ meta }: ResultsMetaProps) {
  const start = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);

  return (
    <p className="text-sm text-muted-foreground" aria-live="polite">
      Showing {start}–{end} of {meta.total} results
    </p>
  );
}
