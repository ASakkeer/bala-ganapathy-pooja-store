import Link from "next/link";

type CategoryChip = {
  name: string;
  slug: string;
};

export function CategoryChips({ categories }: { categories: CategoryChip[] }) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Shop by category" className="overflow-x-auto no-scrollbar md:overflow-visible">
      <ul className="flex gap-2 md:flex-wrap">
        {categories.map((category) => (
          <li key={category.slug} className="shrink-0">
            <Link
              href={`/c/${category.slug}`}
              className="inline-flex min-h-11 items-center rounded-full bg-brand/[0.07] px-4 text-sm text-text transition-colors hover:bg-brand hover:text-on-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
