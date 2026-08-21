import { EmptyNotice } from "@/components/ui/empty-notice";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

export function CatalogPageSkeleton() {
  return (
    <div className="flex flex-col gap-8 py-10 md:py-14" aria-busy="true" aria-label="Loading catalog">
      <Skeleton className="h-4 w-48 rounded-sm" />
      <div className="flex max-w-2xl flex-col gap-3">
        <Skeleton className="h-10 w-64 rounded-sm" />
        <Skeleton className="h-5 w-full max-w-md rounded-sm" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-20 rounded-sm" />
        <Skeleton className="hidden h-11 w-72 rounded-full md:block" />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex flex-col">
            <div className="bg-[#efe4d4] p-3 sm:p-4">
              <Skeleton className="aspect-[4/5]" />
            </div>
            <div className="flex flex-col gap-2 px-3 pt-3 sm:px-4">
              <Skeleton className="h-4 w-full rounded-sm" />
              <Skeleton className="h-5 w-20 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CatalogGridEmpty({
  title = "No records",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-home border border-outline-variant/30 bg-surface-container-lowest",
      )}
    >
      <EmptyNotice title={title} description={description} className="min-h-[18rem] py-16" />
    </div>
  );
}
