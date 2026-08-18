import Link from "next/link";

const notes = [
  {
    title: "Pooja samagri with pack size",
    body: "Camphor, kumkum, sambrani, and wicks labelled by weight or count — the same counter in R.S. Puram.",
    href: "/c/pooja-essentials",
    association: "Pooja essentials",
  },
  {
    title: "Homam materials, packed as a kit",
    body: "Ganapathy and Navagraha Homam kits for when you do not want to pick each item. Ask the shop to adjust contents.",
    href: "/c/ganapathy-homam",
    association: "Ganapathy Homam",
  },
  {
    title: "Call before kumbabishekam quantities",
    body: "Temple lists vary. The shop is on Thiyagaraya New Street 3 — call if you need bulk samagri or a kalasam.",
    href: "/contact",
    association: "Visit or call",
  },
] as const;

export function HomeStories() {
  return (
    <section aria-labelledby="neighbourhood-notes-heading">
      <p className="text-[0.7rem] font-medium tracking-[0.18em] uppercase text-muted">
        Neighbourhood notes
      </p>
      <h2
        id="neighbourhood-notes-heading"
        className="mt-2 max-w-xl font-serif text-3xl font-medium tracking-tight md:text-4xl"
      >
        Why families come to this counter
      </h2>
      <p className="mt-3 max-w-lg text-base leading-relaxed text-muted">
        Shop notes from a physical store in Coimbatore — not invented star ratings. Reviews from
        paid orders will appear here when they exist.
      </p>

      <ul className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
        {notes.map((note) => (
          <li key={note.title} className="border-t border-accent/40 pt-6">
            <h3 className="font-serif text-2xl font-medium tracking-tight text-text">
              {note.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{note.body}</p>
            <Link
              href={note.href}
              className="mt-5 inline-flex min-h-11 items-center text-sm text-brand hover:underline"
            >
              {note.association}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
