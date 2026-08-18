import { PolicyPage } from "@/components/policies/policy-page";
import { STORE_NAME } from "@/lib/constants";
import { PRIVACY_SECTIONS } from "@/lib/policies";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: `Privacy | ${STORE_NAME}`,
  description: `How ${STORE_NAME} uses your phone number, address, and order data.`,
  path: "/policies/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy"
      intro="We keep the phone number you sign in with, addresses you save, and order records needed to pack and track. Payment details stay with Razorpay."
      sections={PRIVACY_SECTIONS}
    />
  );
}
