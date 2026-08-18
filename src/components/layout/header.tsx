import Link from "next/link";
import { Suspense } from "react";
import { StoreLogo } from "@/components/brand/store-logo";
import { CartCountBadge } from "@/components/cart/cart-count-badge";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchField, SearchForm } from "@/components/layout/search-field";
import { Container } from "@/components/ui/container";
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
          <p>R.S. Puram, Coimbatore</p>
          <nav aria-label="Help" className="flex items-center gap-5">
            <Link href="/track" className="hover:text-brand">
              Track order
            </Link>
            <Link href="/contact" className="hover:text-brand">
              Contact
            </Link>
            {phone ? (
              <a href={`tel:${phone}`} className="hover:text-brand">
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
              <WhatsAppIcon />
              <span className="sr-only">WhatsApp</span>
            </a>
          ) : null}
          <Link href={signedIn ? "/account" : loginHref("/account")} className={iconLinkClassName}>
            <AccountIcon />
            <span className="sr-only">{signedIn ? "Account" : "Sign in"}</span>
          </Link>
          {isAdmin ? (
            <Link href="/admin" className={`${iconLinkClassName} hidden sm:inline-flex`}>
              <span className="sr-only">Admin</span>
              <span aria-hidden className="text-[0.65rem] font-medium tracking-[0.12em] uppercase">
                Admin
              </span>
            </Link>
          ) : null}
          <Link href={signedIn ? "/cart" : loginHref("/cart")} className={`${iconLinkClassName} relative`}>
            <CartIcon />
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

function AccountIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5.5 19.2c1.4-2.8 3.8-4.2 6.5-4.2s5.1 1.4 6.5 4.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 7.5h12.5l-1.1 8.2a1.8 1.8 0 0 1-1.8 1.6H9.2a1.8 1.8 0 0 1-1.8-1.6L6.2 5.2H4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4.5a7.5 7.5 0 0 0-6.4 11.4L4.5 19.5l3.7-1a7.5 7.5 0 1 0 3.8-14Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.6 9.6c.3 1.6 1.6 3 3.2 3.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
