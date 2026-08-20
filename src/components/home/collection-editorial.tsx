import Image from "next/image";
import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function CollectionEditorial({
  eyebrow,
  title,
  body,
  href,
  cta,
  imageSrc,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  imageSrc?: string;
  imageAlt: string;
}) {
  return (
    <section className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
      <div className="relative min-h-64 overflow-hidden bg-[#efe4d4] md:min-h-80">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(160deg,#efe4d4,#d9c4a8)]" />
        )}
      </div>
      <div>
        <p className="text-[0.7rem] font-medium tracking-[0.18em] uppercase text-muted">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight md:text-4xl">{title}</h2>
        <p className="mt-3 max-w-md text-base leading-relaxed text-muted">{body}</p>
        <Link href={href} className={`${buttonClassName("secondary")} mt-6 w-fit`}>
          {cta}
          <Icon name="arrow-right" className="text-xs" />
        </Link>
      </div>
    </section>
  );
}
