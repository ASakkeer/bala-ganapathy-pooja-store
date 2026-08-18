import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";

export function CatalogEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="py-20 text-center">
      <h2 className="font-serif text-3xl font-medium tracking-tight">{title}</h2>
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
