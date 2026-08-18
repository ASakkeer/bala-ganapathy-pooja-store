import Link from "next/link";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { POLICY_LINKS } from "@/lib/constants";

export type PolicySection = {
  heading: string;
  paragraphs: string[];
};

export function PolicyPage({
  title,
  intro,
  sections,
  children,
}: {
  title: string;
  intro: string;
  sections: PolicySection[];
  children?: React.ReactNode;
}) {
  return (
    <article className="flex flex-col gap-10 py-10 md:py-14">
      <div>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Policies", href: "/policies/shipping" },
            { label: title },
          ]}
        />
        <p className="mt-8 text-xs tracking-[0.18em] uppercase text-muted">Policies</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{intro}</p>
        <p className="mt-4 max-w-2xl rounded-2xl bg-brand/[0.06] px-4 py-3 text-sm leading-relaxed text-text">
          Owner must review — this is a starter draft for an Indian pooja shop, not legal advice and
          not the shop’s final policy.
        </p>
      </div>

      {children}

      <div className="flex max-w-2xl flex-col gap-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-serif text-2xl font-medium tracking-tight">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-base leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <nav aria-label="Other policies" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {POLICY_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="min-h-11 inline-flex items-center text-brand">
            {link.name}
          </Link>
        ))}
      </nav>
    </article>
  );
}
