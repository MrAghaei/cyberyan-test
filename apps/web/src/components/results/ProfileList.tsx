import type { PaginationMeta, ProfileDocument } from '@repo/api-types';

import { ProfileCard } from '@/components/results/ProfileCard';
import { Button } from '@/components/ui/button';

interface ProfileListProps {
  profiles: ProfileDocument[];
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function ProfileList({ profiles, meta, onPageChange }: ProfileListProps) {
  const pages = Array.from({ length: meta.totalPages }, (_, index) => index + 1);
  const visiblePages = pages.filter((page) => {
    return (
      page === 1 ||
      page === meta.totalPages ||
      Math.abs(page - meta.page) <= 1
    );
  });

  return (
    <div className="space-y-4">
      <ul className="space-y-3" aria-label="Search results">
        {profiles.map((profile) => (
          <li key={profile.id}>
            <ProfileCard profile={profile} />
          </li>
        ))}
      </ul>

      {meta.totalPages > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-center gap-2"
          aria-label="Pagination"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => onPageChange(meta.page - 1)}
          >
            Previous
          </Button>
          {visiblePages.map((page, index) => {
            const previousPage = visiblePages[index - 1];
            const showEllipsis = previousPage !== undefined && page - previousPage > 1;

            return (
              <span key={page} className="flex items-center gap-2">
                {showEllipsis ? (
                  <span className="px-1 text-muted-foreground">…</span>
                ) : null}
                <Button
                  type="button"
                  variant={page === meta.page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  aria-current={page === meta.page ? 'page' : undefined}
                >
                  {page}
                </Button>
              </span>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={meta.page >= meta.totalPages}
            onClick={() => onPageChange(meta.page + 1)}
          >
            Next
          </Button>
        </nav>
      ) : null}
    </div>
  );
}
