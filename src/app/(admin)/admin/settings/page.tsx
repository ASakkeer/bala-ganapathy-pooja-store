import { SettingsForm } from "@/components/admin/settings-form";
import { getAdminSettings, listAdminPincodes } from "@/server/admin/settings";

export default async function AdminSettingsPage() {
  const [settings, pincodes] = await Promise.all([getAdminSettings(), listAdminPincodes()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">Store</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">Settings</h1>
        <p className="mt-3 max-w-xl text-muted">
          Contact, announcement, shipping, delivery pins, and login PIN reset. Leave a field empty rather than inventing a value.
        </p>
      </div>
      <SettingsForm settings={settings} pincodes={pincodes} />
    </div>
  );
}
