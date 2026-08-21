import { Skeleton } from "@/components/ui/skeleton";

export function ProductPageSkeleton() {
  return (
    <div className="flex flex-col gap-12 py-10 pb-28 md:gap-16 md:py-14 md:pb-14" aria-busy="true" aria-label="Loading product">
      <Skeleton className="h-4 w-64 rounded-sm" />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Skeleton className="aspect-[4/5] rounded-[1.75rem]" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-3 w-28 rounded-sm" />
          <Skeleton className="h-12 w-3/4 rounded-sm" />
          <Skeleton className="h-5 w-1/2 rounded-sm" />
          <Skeleton className="h-20 w-full max-w-lg rounded-sm" />
          <Skeleton className="mt-4 h-12 w-full max-w-sm rounded-full" />
          <Skeleton className="h-12 w-full max-w-sm rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CartPageSkeleton() {
  return (
    <div className="flex flex-col gap-8 py-8 md:py-12" aria-busy="true" aria-label="Loading cart">
      <Skeleton className="h-4 w-32 rounded-sm" />
      <Skeleton className="h-12 w-56 rounded-sm" />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:gap-8">
        <div className="space-y-4 rounded-[1.25rem] bg-surface p-5 ring-1 ring-border/80 sm:p-6">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <div className="rounded-[1.25rem] bg-surface p-5 ring-1 ring-border/80 sm:p-6">
          <Skeleton className="mb-6 h-8 w-28 rounded-sm" />
          <Skeleton className="mb-3 h-4 w-full rounded-sm" />
          <Skeleton className="mb-3 h-4 w-2/3 rounded-sm" />
          <Skeleton className="mt-6 h-8 w-32 rounded-sm" />
          <Skeleton className="mt-6 h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function AccountPageSkeleton() {
  return (
    <div className="grid gap-8 py-10 md:grid-cols-[16rem_minmax(0,1fr)] md:py-14" aria-busy="true" aria-label="Loading account">
      <div className="hidden flex-col gap-3 md:flex">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-11 w-full rounded-full" />
        <Skeleton className="h-11 w-full rounded-full" />
        <Skeleton className="h-11 w-full rounded-full" />
      </div>
      <div className="overflow-hidden rounded-[1.25rem] bg-surface ring-1 ring-border/80">
        <div className="border-b border-border/80 px-5 py-5 sm:px-6">
          <Skeleton className="h-7 w-40 rounded-sm" />
        </div>
        <div className="space-y-4 px-5 py-6 sm:px-6">
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function AdminTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading">
      <div>
        <Skeleton className="h-3 w-20 rounded-sm" />
        <Skeleton className="mt-3 h-10 w-48 rounded-sm" />
      </div>
      <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border/80">
        <div className="space-y-0">
          {Array.from({ length: rows }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b border-border/60 px-4 py-4 last:border-0"
            >
              <Skeleton className="h-5 w-1/3 rounded-sm" />
              <Skeleton className="h-5 w-20 rounded-sm" />
              <Skeleton className="ml-auto h-5 w-16 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContentPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 py-10 md:py-14" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-4 w-40 rounded-sm" />
      <Skeleton className="h-12 w-72 rounded-sm" />
      <Skeleton className="h-5 w-full max-w-xl rounded-sm" />
      <Skeleton className="h-5 w-full max-w-lg rounded-sm" />
      <div className="mt-4 rounded-home border border-outline-variant/30 bg-surface-container-lowest">
        <div className="space-y-3 p-8">
          <Skeleton className="h-4 w-full rounded-sm" />
          <Skeleton className="h-4 w-5/6 rounded-sm" />
          <Skeleton className="h-4 w-2/3 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
