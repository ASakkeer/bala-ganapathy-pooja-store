import { PolicyPage } from "@/components/policies/policy-page";
import { STORE_NAME } from "@/lib/constants";
import { formatPaise } from "@/lib/money";
import { SHIPPING_SECTIONS } from "@/lib/policies";
import { pageMetadata } from "@/lib/site";
import { getStoreSettings } from "@/server/queries/store";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: `Shipping | ${STORE_NAME}`,
  description: "Where we deliver and how shipping is charged — from store settings, not invented rates.",
  path: "/policies/shipping",
});

export default async function ShippingPolicyPage() {
  const settings = await getStoreSettings();
  const rules = settings?.shippingRules;

  return (
    <PolicyPage
      title="Shipping"
      intro="Coverage and charges come from store settings and are checked with your pincode at checkout."
      sections={SHIPPING_SECTIONS}
    >
      <section className="max-w-2xl rounded-2xl bg-surface px-5 py-5 ring-1 ring-border/80">
        <h2 className="font-serif text-2xl font-medium tracking-tight">Current settings</h2>
        {rules ? (
          <>
            <p className="mt-3 text-base leading-relaxed text-muted">{rules.label}</p>
            <p className="mt-2 text-base tabular-nums text-text">
              Listed charge: {formatPaise(rules.flatShippingPaise)}
            </p>
          </>
        ) : (
          <p className="mt-3 text-base leading-relaxed text-muted">
            No shipping rule is saved yet. The charge will show in the cart once the owner adds it.
          </p>
        )}
      </section>
    </PolicyPage>
  );
}
