import { Icon } from "@/components/ui/icon";

const items = [
  {
    icon: "circle-check",
    title: "Authentic Quality",
    body: "Sourced directly from traditional makers, ensuring the highest purity for your rituals.",
  },
  {
    icon: "truck",
    title: "Fast & Secure Delivery",
    body: "Carefully packed to preserve sanctity, delivered reliably to your doorstep.",
  },
  {
    icon: "hand-holding-heart",
    title: "Rooted in Tradition",
    body: "Decades of heritage serving devotees in R.S. Puram, now available online.",
  },
] as const;

export function TrustStrip() {
  return (
    <section aria-label="Why shop with us" className="py-8 md:py-[3.75rem]">
      <ul className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
        {items.map((item) => (
          <li key={item.title} className="flex flex-col items-center">
            <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              <Icon name={item.icon} className="text-[2rem]" />
            </div>
            <h3 className="mb-3 font-serif text-headline-sm font-semibold text-on-surface">
              {item.title}
            </h3>
            <p className="max-w-sm text-base leading-relaxed text-on-surface-variant">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
