import Image from "next/image";
import Link from "next/link";
import { FullBleed } from "@/components/ui/full-bleed";
import { buttonClassName } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { copy } from "@/content/copy";
import { STORE_NAME } from "@/lib/constants";

export function HeroBanner({
  imageSrc,
  imageAlt = STORE_NAME,
}: {
  imageSrc?: string;
  imageAlt?: string;
}) {
  return (
    <FullBleed>
      <section className="relative isolate min-h-[calc(100svh-12rem)] overflow-hidden bg-[#3d1016] text-on-brand sm:min-h-[36rem] lg:min-h-[42rem]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_30%]"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(36_16_18_/_0.88)_0%,rgb(36_16_18_/_0.55)_42%,rgb(36_16_18_/_0.28)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(36_16_18_/_0.2)_0%,transparent_28%,rgb(36_16_18_/_0.45)_100%)]" />

        <Container className="relative flex min-h-[calc(100svh-12rem)] flex-col justify-end py-10 sm:min-h-[36rem] sm:py-16 lg:min-h-[42rem] lg:justify-center lg:py-24">
          <div className="max-w-2xl">
            <p className="text-[0.7rem] font-medium tracking-[0.22em] uppercase text-accent">
              {copy.storeLocationLine}
            </p>
            <h1 className="mt-4 font-serif text-[2.35rem] font-medium leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
              {copy.storeTagline}
            </h1>
            <p className="font-tamil mt-4 max-w-xl text-sm leading-relaxed text-accent sm:text-base">
              {copy.storeTamilLine}
            </p>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-on-brand/80 md:text-lg">
              {copy.heroBody}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/c/pooja-essentials" className={buttonClassName("inverse")}>
                {copy.shopPooja}
              </Link>
              <Link
                href="/c/ganapathy-homam"
                className="inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium text-on-brand ring-1 ring-on-brand/35 transition-colors hover:bg-on-brand/10"
              >
                {copy.shopHomam}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </FullBleed>
  );
}
