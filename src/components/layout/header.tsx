import Link from "next/link";
import { Suspense } from "react";
import { StoreLogo } from "@/components/brand/store-logo";
import { CartCountBadge } from "@/components/cart/cart-count-badge";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchField, SearchForm } from "@/components/layout/search-field";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { firstPhone, whatsappHref } from "@/lib/contact";
import { loginHref } from "@/lib/login-next";
import {
  CATEGORIES,
  STORE_NAME,
} from "@/lib/constants";

const iconLinkClassName =
  "inline-flex size-11 items-center justify-center text-text transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const categoryLinkClassName =
  "inline-flex min-h-11 items-center px-3 text-[0.72rem] font-medium tracking-[0.14em] uppercase text-muted transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function Header({
  signedIn = false,
  isAdmin = false,
  phones,
  whatsapp,
}: {
  signedIn?: boolean;
  isAdmin?: boolean;
  phones?: string[] | null;
  whatsapp?: string | null;
}) {
  const phone = firstPhone(phones);
  const chatHref = whatsappHref(whatsapp);

  return (
    <header className="relative border-b border-border/80 bg-bg/90 backdrop-blur-xl">
      <div className="hidden border-b border-border/60 md:block">
        <Container className="flex h-9 items-center justify-between gap-4 text-[0.7rem] tracking-[0.12em] uppercase text-muted">
          <p className="inline-flex items-center gap-2">
            <Icon name="location-dot" className="text-[0.65rem] text-brand" />
            R.S. Puram, Coimbatore
          </p>
          <nav aria-label="Help" className="flex items-center gap-5">
            <Link href="/track" className="inline-flex items-center gap-2 hover:text-brand">
              <Icon name="truck" className="text-[0.65rem]" />
              Track order
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 hover:text-brand">
              <Icon name="headset" className="text-[0.65rem]" />
              Contact
            </Link>
            {phone ? (
              <a href={`tel:${phone}`} className="inline-flex items-center gap-2 hover:text-brand">
                <Icon name="phone" className="text-[0.65rem]" />
                {phone}
              </a>
            ) : null}
          </nav>
        </Container>
      </div>
      <Container>
        <div className="flex items-center gap-2 py-3 md:gap-4 md:py-4">
          <MobileNav />
          <Link
            href="/"
            aria-label={STORE_NAME}
            className="min-w-0 flex-1 md:flex-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <StoreLogo size="header" decorative />
          </Link>
          <Suspense fallback={<SearchForm id="site-search-desktop" className="hidden min-w-0 flex-1 md:block" />}>
            <SearchField id="site-search-desktop" className="hidden min-w-0 flex-1 md:block" />
          </Suspense>
          {chatHref ? (
            <a href={chatHref} className={`${iconLinkClassName} hidden lg:inline-flex`}>
              <Icon name="whatsapp" kit="brands" className="text-[1.15rem]" />
              <span className="sr-only">WhatsApp</span>
            </a>
          ) : null}
          <Link
            href={signedIn ? "/account" : loginHref("/account")}
            aria-label={signedIn ? "Account" : "Sign in"}
            className={iconLinkClassName}
          >
            <Icon name="user" kit="regular" className="text-[1.15rem]" />
          </Link>
          {isAdmin ? (
            <Link href="/admin" aria-label="Admin" className={`${iconLinkClassName} hidden sm:inline-flex`}>
              <Icon name="gear" className="text-[1.1rem]" />
            </Link>
          ) : null}
          <Link href={signedIn ? "/cart" : loginHref("/cart")} className={`${iconLinkClassName} relative`}>
            <Icon name="bag-shopping" className="text-[1.15rem]" />
            <CartCountBadge />
          </Link>
        </div>
        <Suspense fallback={<SearchForm id="site-search-mobile" className="pb-3 md:hidden" />}>
          <SearchField id="site-search-mobile" className="pb-3 md:hidden" />
        </Suspense>
        <nav
          aria-label="Product categories"
          className="hidden flex-wrap items-center gap-x-1 border-t border-border/60 md:flex"
        >
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/c/${category.slug}`}
              className={categoryLinkClassName}
            >
              {category.shortName}
            </Link>
          ))}
          <Link href="/shop" className={categoryLinkClassName}>
            All products
          </Link>
        </nav>
      </Container>
    </header>
  );
}
