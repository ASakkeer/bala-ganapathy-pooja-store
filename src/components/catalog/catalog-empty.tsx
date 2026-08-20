import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function CatalogEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="py-20 text-center">
      <span
        aria-hidden
        className="inline-flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand"
      >
        <Icon name="box-open" className="text-xl" />
      </span>
      <h2 className="mt-5 font-serif text-3xl font-medium tracking-tight">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">{description}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/c/pooja-essentials" className={buttonClassName("primary")}>
          Shop pooja essentials
        </Link>
        <Link href="/contact" className={buttonClassName("secondary")}>
          Contact
        </Link>
      </div>
    </div>
  );
}
