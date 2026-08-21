import { ProductCardSkeletonGrid } from "@/components/product/product-card-skeleton";
import { Container } from "@/components/ui/container";
import { FullBleed } from "@/components/ui/full-bleed";
import { Skeleton } from "@/components/ui/skeleton";

function HomeSectionHeadingSkeleton() {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div className="w-full max-w-xl">
        <Skeleton className="mb-2 h-3 w-28 rounded-sm" />
        <Skeleton className="mb-2 h-8 w-64 rounded-sm" />
        <Skeleton className="h-5 w-full max-w-md rounded-sm" />
      </div>
      <Skeleton className="h-5 w-32 rounded-sm" />
    </div>
  );
}

export function CategoryBentoSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading categories">
      <HomeSectionHeadingSkeleton />
      <div className="grid grid-cols-1 gap-grid-gutter md:h-[600px] md:grid-cols-4 md:grid-rows-2">
        <Skeleton className="min-h-[16rem] rounded-home md:col-span-2 md:row-span-2 md:min-h-0" />
        <Skeleton className="min-h-[16rem] rounded-home md:min-h-0" />
        <Skeleton className="min-h-[16rem] rounded-home md:min-h-0" />
        <Skeleton className="min-h-[16rem] rounded-home md:min-h-0" />
        <Skeleton className="min-h-[16rem] rounded-home md:min-h-0" />
      </div>
    </div>
  );
}

export function ProductRailSkeleton({ count = 4 }: { count?: number }) {
  return (
    <FullBleed className="bg-surface-container-low/50">
      <Container className="py-8 md:py-[3.75rem]">
        <section aria-busy="true" aria-label="Loading products">
          <HomeSectionHeadingSkeleton />
          <ProductCardSkeletonGrid count={count} tone="home" />
        </section>
      </Container>
    </FullBleed>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="flex flex-col">
      <FullBleed>
        <div className="relative min-h-[28rem] overflow-hidden bg-surface-container sm:min-h-[36rem] lg:h-[80vh] lg:min-h-[600px] lg:max-h-[900px]">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
          <Container className="relative z-10 flex min-h-[28rem] items-center py-16 sm:min-h-[36rem] lg:min-h-[600px]">
            <div className="w-full max-w-2xl space-y-4 rounded-sm border border-white/10 bg-black/10 p-8">
              <Skeleton className="h-3 w-40 bg-white/20" />
              <Skeleton className="h-12 w-full max-w-md bg-white/25" />
              <Skeleton className="h-6 w-3/4 bg-white/20" />
              <Skeleton className="h-12 w-44 rounded-sm bg-white/30" />
            </div>
          </Container>
        </div>
      </FullBleed>
      <div className="py-8 md:py-[3.75rem]">
        <CategoryBentoSkeleton />
      </div>
      <ProductRailSkeleton />
    </div>
  );
}
