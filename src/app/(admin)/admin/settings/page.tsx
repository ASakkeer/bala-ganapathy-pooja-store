import { SettingsForm } from "@/components/admin/settings-form";
import { getAdminSettings, listAdminPincodes } from "@/server/admin/settings";

export default async function AdminSettingsPage() {
  const [settings, pincodes] = await Promise.all([getAdminSettings(), listAdminPincodes()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-muted">Store</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">Settings</h1>
        <p className="mt-3 max-w-xl text-muted">
          Leave a field empty rather than inventing an address or phone. WhatsApp and map appear on
          the storefront only when saved here.
        </p>
      </div>
      <SettingsForm settings={settings} pincodes={pincodes} />
    </div>
  );
}
