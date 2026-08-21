import Image from "next/image";
import Link from "next/link";
import { FullBleed } from "@/components/ui/full-bleed";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import type { HomeContent } from "@/content/home-content";
import { STORE_NAME } from "@/lib/constants";

export function HeroBanner({
  imageSrc,
  imageAlt = STORE_NAME,
  content,
}: {
  imageSrc?: string;
  imageAlt?: string;
  content?: Pick<HomeContent, "heroEyebrow" | "heroTitle" | "heroSubtitle" | "heroCta">;
}) {
  return (
    <FullBleed>
      <section className="relative flex min-h-[28rem] items-center sm:min-h-[36rem] lg:h-[80vh] lg:min-h-[600px] lg:max-h-[900px]">
        <div className="absolute inset-0">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          ) : (
            <div className="size-full animate-pulse bg-surface-container" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
        </div>
        <Container className="relative z-10 py-16">
          <div className="max-w-2xl rounded-sm border border-white/10 bg-black/20 p-8 shadow-2xl backdrop-blur-sm">
            {content?.heroEyebrow ? (
              <span className="font-label-caps mb-4 block tracking-wider text-tertiary-fixed">
                {content.heroEyebrow.toUpperCase()}
              </span>
            ) : null}
            {content?.heroTitle ? (
              <h1 className="mb-6 font-serif text-4xl leading-tight tracking-tight text-surface-container-lowest drop-shadow-md sm:text-5xl lg:text-display-lg">
                {content.heroTitle}
              </h1>
            ) : null}
            {content?.heroSubtitle ? (
              <p className="font-tamil mb-8 max-w-lg text-lg leading-relaxed text-surface-container-lowest/90">
                {content.heroSubtitle}
              </p>
            ) : null}
            {content?.heroCta ? (
              <Link
                href="/shop"
                className="font-label-caps inline-flex items-center gap-2 rounded-sm bg-surface-container-lowest px-8 py-4 text-primary shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-container-high hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-fixed"
              >
                {content.heroCta}
                <Icon name="arrow-right" className="text-[0.9rem]" />
              </Link>
            ) : null}
          </div>
        </Container>
      </section>
    </FullBleed>
  );
}
