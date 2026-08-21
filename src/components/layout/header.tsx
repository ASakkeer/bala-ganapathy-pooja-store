import Link from "next/link";
import { Suspense } from "react";
import { StoreLogo } from "@/components/brand/store-logo";
import { CartCountBadge } from "@/components/cart/cart-count-badge";
import { HeaderCategoryNav } from "@/components/layout/header-category-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchField, SearchForm } from "@/components/layout/search-field";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { loginHref } from "@/lib/login-next";
import { STORE_NAME } from "@/lib/constants";
import { whatsappHref } from "@/lib/contact";

const iconLinkClassName =
  "inline-flex size-10 items-center justify-center rounded-full p-2 text-primary transition-all hover:bg-surface-container-highest hover:text-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function Header({
  signedIn = false,
  isAdmin = false,
  whatsapp,
}: {
  signedIn?: boolean;
  isAdmin?: boolean;
  phones?: string[] | null;
  whatsapp?: string | null;
}) {
  const chatHref = whatsappHref(whatsapp);

  return (
    <header className="border-b border-outline-variant bg-surface/95 shadow-sm backdrop-blur-md">
      <Container className="flex flex-col py-4">
        <div className="flex items-center justify-between gap-grid-gutter pb-4">
          <div className="flex min-w-0 items-center gap-2">
            <MobileNav />
            <Link
              href="/"
              aria-label={STORE_NAME}
              className="min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <StoreLogo size="header" decorative />
            </Link>
          </div>
          <Suspense
            fallback={
              <SearchForm id="site-search-desktop" tone="bar" className="hidden min-w-0 max-w-xl flex-1 md:block" />
            }
          >
            <SearchField
              id="site-search-desktop"
              tone="bar"
              className="hidden min-w-0 max-w-xl flex-1 md:block"
            />
          </Suspense>
          <div className="flex items-center gap-2 text-primary md:gap-4">
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
              <Icon name="user" kit="regular" className="text-[1.2rem]" />
            </Link>
            {isAdmin ? (
              <Link href="/admin" aria-label="Admin" className={`${iconLinkClassName} hidden sm:inline-flex`}>
                <Icon name="gear" className="text-[1.1rem]" />
              </Link>
            ) : null}
            <Link href={signedIn ? "/cart" : loginHref("/cart")} className={`${iconLinkClassName} relative`}>
              <Icon name="bag-shopping" className="text-[1.2rem]" />
              <CartCountBadge />
            </Link>
          </div>
        </div>
        <Suspense fallback={<SearchForm id="site-search-mobile" tone="bar" className="pb-3 md:hidden" />}>
          <SearchField id="site-search-mobile" tone="bar" className="pb-3 md:hidden" />
        </Suspense>
        <HeaderCategoryNav />
      </Container>
    </header>
  );
}
