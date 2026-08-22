import Image from "next/image";
import Link from "next/link";
import { StoreLogo } from "@/components/brand/store-logo";

const AUTH_IMAGE =
  "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=80";

export function AuthShell({
  heading,
  description,
  heroTitle,
  heroBody,
  after,
  children,
}: {
  heading?: string;
  description?: string;
  heroTitle: string;
  heroBody: string;
  after?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-4 flex min-h-[calc(100dvh-9rem)] flex-1 flex-col sm:-mx-6 lg:-mx-8 xl:-mx-10 2xl:-mx-12">
      <div className="grid min-h-0 w-full flex-1 overflow-hidden bg-surface md:grid-cols-[minmax(0,1.15fr)_minmax(22rem,32rem)]">
        <aside className="relative isolate min-h-52 overflow-hidden md:min-h-full">
          <Image
            src={AUTH_IMAGE}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 52vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3a1218]/92 via-[#7a1f2b]/55 to-[#7a1f2b]/20" />
          <div className="relative flex h-full min-h-52 flex-col justify-end gap-4 p-6 text-on-brand sm:p-10">
            <p className="text-xs tracking-[0.22em] uppercase text-accent">Welcome</p>
            <h1 className="max-w-sm font-serif text-3xl font-medium leading-tight tracking-tight sm:text-4xl md:text-5xl">
              {heroTitle}
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-on-brand/85 sm:text-base">{heroBody}</p>
          </div>
        </aside>

        <div className="mx-auto flex w-full max-w-md flex-col justify-center gap-8 overflow-y-auto px-5 py-8 sm:px-10 sm:py-12">
          <StoreLogo size="login" />
          {heading || description ? (
            <div>
              {heading ? (
                <h2 className="font-serif text-3xl font-medium tracking-tight">{heading}</h2>
              ) : null}
              {description ? (
                <p className={`${heading ? "mt-3" : ""} text-base leading-relaxed text-muted`}>{description}</p>
              ) : null}
            </div>
          ) : null}
          {children}
          {after}
          <Link href="/shop" className="text-sm text-muted hover:text-brand">
            Keep browsing the catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
