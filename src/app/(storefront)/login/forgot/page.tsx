import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPinForm } from "@/components/auth/forgot-pin-form";
import { STORE_NAME } from "@/lib/constants";
import { safeNextPath } from "@/lib/login-next";
import { getSession } from "@/server/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Forgot PIN | ${STORE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function ForgotPinPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  const nextPath = safeNextPath((await searchParams).next);

  if (session) {
    redirect(nextPath);
  }

  return (
    <AuthShell
      heading="Forgot PIN?"
      description="Enter the mobile number on the account. We will tell you how to get back in."
      heroTitle="Reset is handled by the shop."
      heroBody="There is no SMS code. Call the shop with your mobile number so they can clear the PIN."
    >
      <ForgotPinForm nextPath={nextPath} />
    </AuthShell>
  );
}
