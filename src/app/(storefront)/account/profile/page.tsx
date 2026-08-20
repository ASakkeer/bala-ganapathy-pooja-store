import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatAccountPhone } from "@/components/account/account-ui";
import { AccountPanel, ProfileDetailRow, ProfileValue } from "@/components/account/account-panel";
import { AccountShell } from "@/components/account/account-shell";
import { ProfileForm } from "@/components/account/profile-form";
import { buttonClassName } from "@/components/ui/button";
import { STORE_NAME } from "@/lib/constants";
import { loginHref } from "@/lib/login-next";
import { isPlaceholderProfileName } from "@/lib/profile-cookie";
import { getSession } from "@/server/auth";
import { getAccountProfile } from "@/server/profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Profile | ${STORE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function AccountProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; saved?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect(loginHref("/account/profile"));
  }

  const query = await searchParams;
  const editing = query.edit === "1";
  const profile = await getAccountProfile();
  const displayName = isPlaceholderProfileName(profile.name) ? null : profile.name;

  return (
    <AccountShell profile={profile} current="profile" isAdmin={session.role === "admin"}>
      {query.saved === "1" && !editing ? (
        <p className="rounded-full bg-success/10 px-4 py-2 text-sm text-success" role="status">
          Profile saved.
        </p>
      ) : null}

      <AccountPanel
        title={editing ? "Edit profile" : "Profile details"}
        action={
          editing ? (
            <Link href="/account/profile" className="text-sm text-muted hover:text-brand">
              Cancel
            </Link>
          ) : null
        }
      >
        {editing ? (
          <ProfileForm name={displayName ?? ""} email={profile.email} phone={profile.phone} />
        ) : (
          <>
            <dl className="px-5 sm:px-6">
              <ProfileDetailRow label="Full name" value={<ProfileValue value={displayName} />} />
              <ProfileDetailRow label="Mobile number" value={formatAccountPhone(profile.phone)} />
              <ProfileDetailRow label="Email" value={<ProfileValue value={profile.email} />} />
            </dl>
            <div className="border-t border-border/80 px-5 py-4 sm:px-6">
              <Link
                href="/account/profile?edit=1"
                className={buttonClassName("primary", "w-full sm:w-auto sm:min-w-40")}
              >
                Edit
              </Link>
            </div>
          </>
        )}
      </AccountPanel>
    </AccountShell>
  );
}
