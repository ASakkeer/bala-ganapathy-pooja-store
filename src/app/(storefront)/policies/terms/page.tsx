import { PolicyPage } from "@/components/policies/policy-page";
import { STORE_NAME } from "@/lib/constants";
import { TERMS_SECTIONS } from "@/lib/policies";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: `Terms | ${STORE_NAME}`,
  description: `Terms of use for shopping at ${STORE_NAME}.`,
  path: "/policies/terms",
});

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms"
      path="/policies/terms"
      intro="These terms cover browsing and buying on this site. They are a starter draft until the owner reviews them."
      sections={TERMS_SECTIONS}
    />
  );
}
