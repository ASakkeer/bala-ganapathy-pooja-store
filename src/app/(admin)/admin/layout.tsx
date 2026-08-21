import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/admin-header";
import { STORE_NAME } from "@/lib/constants";
import { getSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { loginHref } from "@/lib/login-next";
import { Container } from "@/components/ui/container";
import { getAccountProfile } from "@/server/profile";
import { isPlaceholderProfileName } from "@/lib/profile-cookie";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Admin | ${STORE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect(loginHref("/admin"));
  }
  if (session.role !== "admin") {
    redirect("/");
  }

  const profile = await getAccountProfile();
  const name = isPlaceholderProfileName(profile.name) ? null : profile.name;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-bg">
      <AdminHeader name={name} phone={session.phone} />
      <main className="flex-1">
        <Container className="py-8">{children}</Container>
      </main>
    </div>
  );
}
