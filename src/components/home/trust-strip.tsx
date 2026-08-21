import { Icon } from "@/components/ui/icon";
import type { HomeTrustCopy } from "@/content/home-content";

const icons = ["circle-check", "truck", "hand-holding-heart"] as const;

export function TrustStrip({ items }: { items: HomeTrustCopy[] }) {
  return (
    <section aria-label="Why shop with us" className="py-8 md:py-[3.75rem]">
      <ul className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`} className="flex flex-col items-center">
            <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              <Icon name={icons[index] ?? "circle-check"} className="text-[2rem]" />
            </div>
            {item.title ? (
              <h3 className="mb-3 font-serif text-headline-sm font-semibold text-on-surface">
                {item.title}
              </h3>
            ) : null}
            {item.body ? (
              <p className="max-w-sm text-base leading-relaxed text-on-surface-variant">{item.body}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
