import { Skeleton } from '@/components/ui/skeleton';

export function LoadingSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading results">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="rounded-xl border bg-card p-6">
          <Skeleton className="mb-3 h-5 w-1/3" />
          <Skeleton className="mb-2 h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}
