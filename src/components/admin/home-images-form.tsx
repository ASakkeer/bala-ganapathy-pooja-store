"use client";

import { useState } from "react";
import { useRouter } from "@/components/progress/navigation";
import { useActionProgress } from "@/components/progress/use-action-progress";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyNotice } from "@/components/ui/empty-notice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HOME_RITUAL_TILES, isHomeRitualSlug } from "@/content/home-rituals";
import { cn } from "@/lib/cn";
import type { AdminHomeCategory } from "@/types/admin";

async function uploadImage(file: File) {
  const body = new FormData();
  body.set("file", file);
  const response = await fetch("/api/admin/uploads", {
    method: "POST",
    credentials: "same-origin",
    body,
  });
  const payload = (await response.json()) as { error?: string; url?: string };
  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? "Could not upload the image.");
  }
  return payload.url;
}

export function HomeImagesForm({
  heroImage,
  categories,
}: {
  heroImage: string | null;
  categories: AdminHomeCategory[];
}) {
  const router = useRouter();
  const progress = useActionProgress();
  const [banner, setBanner] = useState(heroImage ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [removeId, setRemoveId] = useState<string | null>(null);

  const extras = categories.filter((category) => !isHomeRitualSlug(category.slug));

  async function saveBanner(next: string | null) {
    setPending(true);
    setError("");
    progress.begin();
    try {
      const response = await fetch("/api/admin/home", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ heroImage: next }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not save the banner.");
      }
      setBanner(next ?? "");
      progress.succeed("Home banner saved.");
      router.refresh();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Could not save the banner.";
      setError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  async function saveTile(slug: string, image: string | null) {
    setPending(true);
    setError("");
    progress.begin();
    try {
      const response = await fetch("/api/admin/home/tiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ slug, image }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not save the tile.");
      }
      progress.succeed(image ? "Tile image saved." : "Tile image removed.");
      router.refresh();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Could not save the tile.";
      setError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  async function removeCategory() {
    if (!removeId) {
      return;
    }
    setPending(true);
    setError("");
    progress.begin();
    try {
      const response = await fetch(`/api/admin/categories/${removeId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not remove the category.");
      }
      setRemoveId(null);
      progress.succeed("Category removed.");
      router.refresh();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Could not remove the category.";
      setError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <section className="rounded-2xl bg-surface p-5 ring-1 ring-border/80 sm:p-6">
        <h2 className="font-serif text-2xl font-medium tracking-tight">Home banner</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          This is the large image at the top of the home page. JPEG, PNG, or WebP, up to 2 MB.
        </p>
        <div className="mt-5 overflow-hidden rounded-home bg-surface-container">
          {banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={banner} alt="Home banner preview" className="h-48 w-full object-cover sm:h-64" />
          ) : (
            <EmptyNotice
              title="No records"
              description="No banner uploaded yet. The live home page shows a skeleton here."
              className="min-h-[12rem] py-10"
            />
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Label htmlFor="hero-file" className="sr-only">
            Upload banner
          </Label>
          <Input
            id="hero-file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={pending || progress.pending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) {
                return;
              }
              void (async () => {
                progress.begin();
                try {
                  const url = await uploadImage(file);
                  await saveBanner(url);
                } catch (uploadError) {
                  const message =
                    uploadError instanceof Error ? uploadError.message : "Upload failed.";
                  setError(message);
                  progress.fail(message);
                }
              })();
            }}
          />
          {banner ? (
            <Button
              type="button"
              variant="secondary"
              disabled={pending || progress.pending}
              onClick={() => void saveBanner(null)}
            >
              Remove banner
            </Button>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-5 ring-1 ring-border/80 sm:p-6">
        <h2 className="font-serif text-2xl font-medium tracking-tight">Shop by ritual tiles</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          The home page uses five tiles in a fixed grid: one large tile on the left, four smaller
          tiles on the right. Upload one image into each slot. JPEG, PNG, or WebP, up to 2 MB.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4 md:grid-rows-2">
          {HOME_RITUAL_TILES.map((tile) => {
            const category = categories.find((item) => item.slug === tile.slug);
            return (
              <RitualTileSlot
                key={tile.slug}
                name={tile.name}
                featured={tile.featured}
                image={category?.image ?? null}
                disabled={pending || progress.pending}
                onUpload={(file) => {
                  void (async () => {
                    progress.begin();
                    try {
                      const url = await uploadImage(file);
                      await saveTile(tile.slug, url);
                    } catch (uploadError) {
                      const message =
                        uploadError instanceof Error ? uploadError.message : "Upload failed.";
                      setError(message);
                      progress.fail(message);
                    }
                  })();
                }}
                onClear={category?.image ? () => void saveTile(tile.slug, null) : undefined}
              />
            );
          })}
        </div>
      </section>

      {extras.length > 0 ? (
        <section className="rounded-2xl bg-surface p-5 ring-1 ring-border/80 sm:p-6">
          <h2 className="font-serif text-2xl font-medium tracking-tight">Other categories</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            These are not part of the five-tile home grid. They can still appear in the shop menu.
          </p>
          <ul className="mt-5 divide-y divide-border/80">
            {extras.map((category) => (
              <li key={category.id} className="flex flex-wrap items-center gap-3 py-3">
                <p className="min-w-0 flex-1 font-medium text-text">{category.name}</p>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={pending || progress.pending}
                  onClick={() => setRemoveId(category.id)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ConfirmDialog
        open={Boolean(removeId)}
        title="Remove this category?"
        description="It is removed from the shop menu. Products in it must be moved first."
        confirmLabel="Remove"
        onCancel={() => setRemoveId(null)}
        onConfirm={() => void removeCategory()}
      />
    </div>
  );
}

function RitualTileSlot({
  name,
  featured,
  image,
  disabled,
  onUpload,
  onClear,
}: {
  name: string;
  featured: boolean;
  image: string | null;
  disabled: boolean;
  onUpload: (file: File) => void;
  onClear?: () => void;
}) {
  const inputId = `tile-${name.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div
      className={cn(
        "relative min-h-[12rem] overflow-hidden rounded-home bg-surface-container ring-1 ring-border/80",
        featured && "md:col-span-2 md:row-span-2 md:min-h-[24rem]",
      )}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-surface-container-high" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
      <div className="relative z-10 flex h-full min-h-[12rem] flex-col justify-end gap-3 p-4 md:min-h-0">
        <div>
          {featured ? <p className="text-xs uppercase tracking-[0.16em] text-white/70">Large tile</p> : null}
          <p className={cn("font-medium text-white", featured ? "font-serif text-xl" : "text-base")}>{name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Label htmlFor={inputId} className="sr-only">
            Upload {name} image
          </Label>
          <Input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled}
            className="max-w-full bg-white/90"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) {
                onUpload(file);
              }
            }}
          />
          {onClear ? (
            <Button type="button" variant="secondary" disabled={disabled} onClick={onClear}>
              Clear
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
