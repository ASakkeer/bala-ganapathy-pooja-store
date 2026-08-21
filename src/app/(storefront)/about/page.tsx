import Link from "next/link";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { buttonClassName } from "@/components/ui/button";
import { EmptyNotice } from "@/components/ui/empty-notice";
import { STORE_NAME } from "@/lib/constants";
import { pageMetadata } from "@/lib/site";
import { listCategories } from "@/server/queries/products";

export const metadata = pageMetadata({
  title: `About | ${STORE_NAME}`,
  description: `A physical pooja shop with an online catalog — ${STORE_NAME}.`,
  path: "/about",
});

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const categories = await listCategories();

  return (
    <div className="flex flex-col gap-10 py-10 md:py-14">
      <div>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
        <p className="mt-8 text-xs tracking-[0.18em] uppercase text-muted">The shop</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight md:text-5xl">About</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          {STORE_NAME} is a physical shop in R.S. Puram, Coimbatore. This site is the same
          counter on your phone — pooja samagri, Ganapathy and Navagraha Homam materials,
          kumbabishekam requirements, and traditional naattu marundhu, listed with pack size,
          price, and stock.
        </p>
        <p className="font-tamil mt-3 max-w-2xl text-base leading-relaxed text-muted">
          நாட்டு மருந்துகள், கும்பாபிஷேகம், கணபதி ஹோமம், நவக்கிரக ஹோமம் மற்றும் அனைத்து பூஜை
          சாமான்களும் கிடைக்கும்.
        </p>
      </div>

      <section className="max-w-2xl">
        <h2 className="font-serif text-2xl font-medium tracking-tight">What we sell</h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          We sell pooja and homam materials from the shop at Thiyagaraya New Street 3. We do not
          invent a founding year or medical claims. Naattu marundhu listings are traditional herbal
          products, not medicines.
        </p>
        {categories.length === 0 ? (
          <div className="mt-6 rounded-home border border-outline-variant/30 bg-surface-container-lowest">
            <EmptyNotice
              title="No records"
              description="Categories will appear here after they are added in admin."
              className="min-h-[10rem] py-8"
            />
          </div>
        ) : (
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/c/${category.slug}`}
                  className="inline-flex min-h-11 items-center text-sm text-brand hover:underline"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="max-w-2xl">
        <h2 className="font-serif text-2xl font-medium tracking-tight">How buying works</h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          You can browse without an account. Adding to cart, saving an address, and checkout need
          a phone OTP login. Payment, when enabled, is through Razorpay — we never take card
          numbers on this site.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/shop" className={buttonClassName("primary")}>
          Shop the catalog
        </Link>
        <Link href="/contact" className={buttonClassName("secondary")}>
          Contact the shop
        </Link>
      </div>
    </div>
  );
}
