import type { Metadata } from "next";
import Link from "next/link";
import { StoreLogo } from "@/components/brand/store-logo";
import { STORE_NAME } from "@/lib/constants";
import { getSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { loginHref } from "@/lib/login-next";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Admin | ${STORE_NAME}`,
  robots: { index: false, follow: false },
};

const links = [
  { href: "/admin", name: "Overview" },
  { href: "/admin/products", name: "Products" },
  { href: "/admin/orders", name: "Orders" },
  { href: "/admin/settings", name: "Settings" },
];

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

  return (
    <div className="flex min-h-full flex-1 flex-col bg-bg">
      <header className="border-b border-border/80 bg-surface">
        <Container className="flex flex-wrap items-center gap-3 py-4">
          <Link href="/" aria-label={STORE_NAME} className="shrink-0">
            <StoreLogo size="admin" decorative />
          </Link>
          <p className="text-xs tracking-[0.16em] uppercase text-muted">Admin</p>
          <nav aria-label="Admin" className="flex flex-wrap gap-1 sm:ml-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-text hover:bg-brand/5 hover:text-brand"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-muted">{session.phone}</span>
            <Link href="/" className="text-brand hover:underline">
              Storefront
            </Link>
          </div>
        </Container>
      </header>
      <main className="flex-1">
        <Container className="py-8">{children}</Container>
      </main>
    </div>
  );
}
