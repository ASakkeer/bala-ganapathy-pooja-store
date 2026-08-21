import { CartProvider } from "@/components/cart/cart-provider";
import { MiniCartOverlay } from "@/components/cart/mini-cart-overlay";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Container } from "@/components/ui/container";
import { ANNOUNCEMENT_MESSAGE } from "@/lib/constants";
import { getCart } from "@/server/cart";
import { getSession } from "@/server/auth";
import { getStoreSettings } from "@/server/queries/store";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, cart, session] = await Promise.all([
    getStoreSettings(),
    getCart(),
    getSession(),
  ]);
  const announcement = settings?.announcement?.trim() || ANNOUNCEMENT_MESSAGE;

  return (
    <CartProvider
      initialCount={cart.itemCount}
      initialLines={cart.items.map((item) => ({
        variantId: item.variantId,
        qty: item.qty,
        stockQty: item.stockQty,
      }))}
      signedIn={Boolean(session)}
    >
      <div id="top" className="flex min-h-full flex-1 flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-on-primary"
        >
          Skip to content
        </a>
        <div className="sticky top-0 z-40">
          <AnnouncementBar message={announcement} />
          <Header
            signedIn={Boolean(session)}
            isAdmin={session?.role === "admin"}
            phones={settings?.phones}
            whatsapp={settings?.whatsapp}
          />
        </div>
        <main id="main-content" className="flex flex-1 flex-col overflow-x-clip">
          <Container className="flex flex-1 flex-col">{children}</Container>
        </main>
        <Footer
          address={settings?.address}
          hours={settings?.hours}
          phones={settings?.phones}
          whatsapp={settings?.whatsapp}
          mapUrl={settings?.mapUrl}
        />
        <MiniCartOverlay />
      </div>
    </CartProvider>
  );
}
