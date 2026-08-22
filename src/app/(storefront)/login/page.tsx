import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { STORE_NAME } from "@/lib/constants";
import { returnCopy, safeNextPath } from "@/lib/login-next";
import { getSession, readAuthIntent } from "@/server/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Sign in | ${STORE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function LoginPage({
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
  const pinReady = intent?.stage === "pin" && Boolean(intent.phone);

  return (
    <AuthShell
      heading="Continue with your phone"
      description={returnCopy(nextPath)}
      heroTitle="Sign in to add items, save your address, and order."
      heroBody="You can browse the catalog without an account. Use your mobile number and a 4-digit PIN, or Google if you have linked it."
    >
      <LoginForm
        nextPath={nextPath}
        initialPhone={pinReady ? intent.phone ?? "" : ""}
        initialStep={pinReady ? "pin" : "phone"}
      />
    </AuthShell>
  );
}
