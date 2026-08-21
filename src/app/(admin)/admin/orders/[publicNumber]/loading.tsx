import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading order">
      <div>
        <Skeleton className="h-11 w-40 rounded-full" />
        <Skeleton className="mt-6 h-3 w-20 rounded-sm" />
        <Skeleton className="mt-3 h-10 w-56 rounded-sm" />
        <Skeleton className="mt-3 h-5 w-40 rounded-sm" />
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
        <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border/80">
          <div className="border-b border-border/80 px-5 py-5 sm:px-8">
            <Skeleton className="h-7 w-24 rounded-sm" />
          </div>
          <div className="space-y-4 px-5 py-5 sm:px-8">
            <Skeleton className="h-12 w-full rounded-sm" />
            <Skeleton className="h-12 w-full rounded-sm" />
            <Skeleton className="h-12 w-2/3 rounded-sm" />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl bg-surface p-5 ring-1 ring-border/80 sm:p-6">
            <Skeleton className="h-7 w-28 rounded-sm" />
            <Skeleton className="mt-5 h-16 w-full rounded-sm" />
          </div>
          <div className="rounded-2xl bg-surface p-5 ring-1 ring-border/80 sm:p-6">
            <Skeleton className="h-7 w-24 rounded-sm" />
            <Skeleton className="mt-5 h-11 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
