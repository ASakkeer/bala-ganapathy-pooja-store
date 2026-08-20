import { FullBleed } from "@/components/ui/full-bleed";
import { Container } from "@/components/ui/container";

const items = [
  {
    title: "Authentic traditional products",
    body: "Pooja samagri, homam materials, and naattu marundhu from the R.S. Puram counter.",
  },
  {
    title: "Local store",
    body: "Visit the physical shop in R.S. Puram, Coimbatore.",
  },
  {
    title: "Easy ordering",
    body: "Shop online, then track the order with your order number and phone.",
  },
  {
    title: "Secure payments",
    body: "UPI, cards, and netbanking via Razorpay when payments are on. Card numbers are never typed here.",
  },
] as const;

export function TrustStrip() {
  return (
    <FullBleed className="border-y border-border/80 bg-surface">
      <Container>
        <section aria-label="Why shop with us" className="py-12 md:py-14">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {items.map((item) => (
              <li key={item.title}>
                <p className="font-serif text-xl tracking-tight text-text">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </FullBleed>
  );
}
