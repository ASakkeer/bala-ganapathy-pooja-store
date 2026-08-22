import { PolicyPage } from "@/components/policies/policy-page";
import { STORE_NAME } from "@/lib/constants";
import { RETURNS_SECTIONS } from "@/lib/policies";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: `Returns | ${STORE_NAME}`,
  description: "Consumables are not returnable. Damaged parcels need photos within 48 hours.",
  path: "/policies/returns",
});

export default function ReturnsPolicyPage() {
  return (
    <PolicyPage
      title="Returns"
      path="/policies/returns"
      intro="Packed consumables cannot come back. Damaged parcels need photos within 48 hours. Cancel only before the shop packs the order."
      sections={RETURNS_SECTIONS}
    />
  );
}
