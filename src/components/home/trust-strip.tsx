import Link from "next/link";
import { FullBleed } from "@/components/ui/full-bleed";
import { Container } from "@/components/ui/container";

const items = [
  {
    title: "A Coimbatore counter",
    body: "Bala Ganapathy Pooja Store at R.S. Puram. Pooja samagri, homam materials, kumbabishekam requirements, and naattu marundhu.",
    href: "/contact",
    link: "Visit or call",
  },
  {
    title: "Listed as it is",
    body: "Pack size, price, and stock on every product. Featured items are in stock — we do not hero empty shelves.",
  },
  {
    title: "Delivery, not guesses",
    body: "Pincodes and shipping charges come from store settings and show before you pay.",
    href: "/policies/shipping",
    link: "Shipping policy",
  },
  {
    title: "Pay on Razorpay",
    body: "UPI, cards, and netbanking when payments are on. Card numbers are never typed on this site.",
  },
] as const;

export function TrustStrip() {
  return (
    <FullBleed className="border-y border-border/80 bg-surface">
      <Container>
        <section aria-label="Why shop with us" className="py-12 md:py-16">
          <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {items.map((item) => (
              <li key={item.title}>
                <p className="font-serif text-xl tracking-tight text-text">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                {"href" in item && item.href ? (
                  <Link
                    href={item.href}
                    className="mt-3 inline-flex min-h-11 items-center text-sm text-brand hover:underline"
                  >
                    {item.link}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </FullBleed>
  );
}
