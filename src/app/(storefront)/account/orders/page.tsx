import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountOrderList } from "@/components/account/account-order-list";
import { AccountPanel } from "@/components/account/account-panel";
import { AccountShell } from "@/components/account/account-shell";
import { STORE_NAME } from "@/lib/constants";
import { loginHref } from "@/lib/login-next";
import { orderIsPayable } from "@/server/checkout";
import { getSession } from "@/server/auth";
import { listAccountOrders } from "@/server/orders";
import { getAccountProfile } from "@/server/profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Your orders | ${STORE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function AccountOrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect(loginHref("/account/orders"));
  }

  const [profile, orders] = await Promise.all([getAccountProfile(), listAccountOrders()]);

  return (
    <AccountShell profile={profile} current="orders" isAdmin={session.role === "admin"}>
      <AccountPanel
        title="Your orders"
        action={
          orders.length > 0 ? (
            <span className="text-sm text-muted">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          ) : null
        }
      >
        <AccountOrderList
          orders={orders.map((order) => ({
            publicNumber: order.publicNumber,
            status: order.status,
            createdAt: order.createdAt,
            payable: orderIsPayable(order),
            items: order.items,
            grandTotalPaise: order.grandTotalPaise,
            city: order.address.city,
          }))}
        />
      </AccountPanel>
    </AccountShell>
  );
}
