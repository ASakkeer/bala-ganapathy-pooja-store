import { HomeCopyForm } from "@/components/admin/home-copy-form";
import { HomeImagesForm } from "@/components/admin/home-images-form";
import { listAdminHomeCategories } from "@/server/admin/catalog";
import { getAdminSettings } from "@/server/admin/settings";

export default async function AdminHomeImagesPage() {
  const [settings, categories] = await Promise.all([getAdminSettings(), listAdminHomeCategories()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-muted">Storefront</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">Home</h1>
        <p className="mt-3 max-w-xl text-muted">
          Change the home page wording, banner, and five ritual-tile images here. Product photos
          still go under Products.
        </p>
      </div>
      <HomeCopyForm content={settings.homeContent} />
      <HomeImagesForm heroImage={settings.heroImage} categories={categories} />
    </div>
  );
}
