import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { STORE_NAME } from "@/lib/constants";
import { safeNextPath } from "@/lib/login-next";
import { isPlaceholderProfileName } from "@/lib/profile-cookie";
import { getSession, readAuthIntent } from "@/server/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Create account | ${STORE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  const nextPath = safeNextPath((await searchParams).next);

  if (session) {
    redirect(nextPath);
  }

  const intent = await readAuthIntent();
  if (!intent || (intent.stage !== "register" && intent.stage !== "set-pin" && intent.stage !== "google")) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return (
    <AuthShell
      heroTitle="A few details, then your PIN."
      heroBody="The mobile number is how we find your orders. Address and pincode are collected at checkout, not here."
    >
      <RegisterForm
        nextPath={nextPath}
        initialPhone={intent.phone ?? ""}
        initialName={isPlaceholderProfileName(intent.name ?? "") ? "" : (intent.name ?? "")}
        initialEmail={intent.email ?? intent.googleEmail ?? ""}
        phoneLocked={Boolean(intent.phone)}
        emailLocked={Boolean(intent.googleEmail)}
        startOnPin={intent.stage === "set-pin"}
      />
    </AuthShell>
  );
}
