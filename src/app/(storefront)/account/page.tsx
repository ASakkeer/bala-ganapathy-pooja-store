import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountLinkList, AccountLinkRow } from "@/components/account/account-ui";
import { AccountPanel } from "@/components/account/account-panel";
import { AccountShell } from "@/components/account/account-shell";
import { STORE_NAME } from "@/lib/constants";
import { loginHref } from "@/lib/login-next";
import { isPlaceholderProfileName } from "@/lib/profile-cookie";
import { listAddresses } from "@/server/addresses";
import { getSession } from "@/server/auth";
import { listAccountOrders } from "@/server/orders";
import { getAccountProfile } from "@/server/profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Account | ${STORE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; saved?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect(loginHref("/account"));
  }

  const query = await searchParams;

  if (query.edit === "1") {
    redirect("/account/profile?edit=1");
  }

  if (query.saved === "1") {
    redirect("/account/profile?saved=1");
  }

  const [profile, orders, addresses] = await Promise.all([
    getAccountProfile(),
    listAccountOrders(),
    listAddresses(),
  ]);

  const displayName = isPlaceholderProfileName(profile.name) ? null : profile.name;
  const defaultAddress = addresses.find((item) => item.isDefault) ?? addresses[0];
  const latestOrder = orders[0];

  return (
    <AccountShell profile={profile} current="overview" isAdmin={session.role === "admin"}>
      <AccountPanel title="Your account" titleId="account-hub">
        <AccountLinkList labelledBy="account-hub" className="px-5 sm:px-6">
          <AccountLinkRow
            href="/account/profile"
            title="Profile"
            hint={displayName ?? "Add your name"}
          />
          <AccountLinkRow
            href="/account/orders"
            title="Orders"
            hint={
              orders.length === 0
                ? "No orders yet"
                : `${orders.length} ${orders.length === 1 ? "order" : "orders"}${
                    latestOrder ? ` · latest ${latestOrder.publicNumber}` : ""
                  }`
            }
          />
          <AccountLinkRow
            href="/account/addresses"
            title="Addresses"
            hint={
              addresses.length === 0
                ? "Add a delivery address"
                : `${addresses.length} saved${defaultAddress ? ` · ${defaultAddress.city}` : ""}`
            }
          />
        </AccountLinkList>
      </AccountPanel>
    </AccountShell>
  );
}
