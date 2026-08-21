import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

export function ProductCardSkeleton({
  tone = "catalog",
}: {
  tone?: "catalog" | "home";
}) {
  if (tone === "home") {
    return (
      <div className="flex flex-col rounded-home border border-outline-variant/30 bg-surface-container-lowest p-4">
        <Skeleton className="mb-4 aspect-square rounded-lg" />
        <Skeleton className="h-5 w-3/4 rounded-sm" />
        <Skeleton className="mt-2 h-4 w-1/2 rounded-sm" />
        <Skeleton className="mt-6 mb-4 h-6 w-24 rounded-sm" />
        <Skeleton className="h-11 w-full rounded-sm" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="bg-[#efe4d4] p-3 sm:p-4">
        <Skeleton className="aspect-[4/5] bg-surface-container-high/80" />
      </div>
      <div className="flex flex-col gap-2 px-3 pt-3 sm:px-4">
        <Skeleton className="h-4 w-full rounded-sm" />
        <Skeleton className="h-4 w-2/3 rounded-sm" />
        <Skeleton className="h-5 w-20 rounded-sm" />
      </div>
      <div className="mt-3 px-3 sm:px-4">
        <Skeleton className="h-11 w-full rounded-full" />
      </div>
    </div>
  );
}

export function ProductCardSkeletonGrid({
  count = 8,
  tone = "catalog",
  className,
}: {
  count?: number;
  tone?: "catalog" | "home";
  className?: string;
}) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading products"
      className={cn(
        tone === "home"
          ? "grid grid-cols-1 gap-grid-gutter sm:grid-cols-2 lg:grid-cols-4"
          : "grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
        className,
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} tone={tone} />
      ))}
    </div>
  );
}
