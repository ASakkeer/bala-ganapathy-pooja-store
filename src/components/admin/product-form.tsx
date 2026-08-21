"use client";

import { useState } from "react";
import { useRouter } from "@/components/progress/navigation";
import { useActionProgress } from "@/components/progress/use-action-progress";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FieldLabel, FieldTip } from "@/components/ui/field-tip";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { paiseToRupeeInput, rupeesToPaise } from "@/lib/paise-parse";
import { parseSearchKeywords } from "@/lib/search";
import { slugify } from "@/lib/slug";
import type { AdminProduct } from "@/types/admin";

type CategoryOption = { id: string; name: string };

type ImageRow = { src: string; alt: string };

type VariantRow = {
  id?: string;
  sku: string;
  name: string;
  price: string;
  mrp: string;
  weightGrams: string;
  stockQty: string;
  isActive: boolean;
};

function toVariantRows(product?: AdminProduct | null): VariantRow[] {
  if (!product?.variants.length) {
    return [
      {
        sku: "",
        name: "",
        price: "",
        mrp: "",
        weightGrams: "",
        stockQty: "0",
        isActive: true,
      },
    ];
  }

  return product.variants.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    name: variant.name,
    price: paiseToRupeeInput(variant.pricePaise),
    mrp: variant.mrpPaise != null ? paiseToRupeeInput(variant.mrpPaise) : "",
    weightGrams: variant.weightGrams != null ? String(variant.weightGrams) : "",
    stockQty: String(variant.stockQty),
    isActive: variant.isActive,
  }));
}

const areaClassName =
  "min-h-28 w-full rounded-2xl bg-brand/[0.04] px-4 py-3 text-text ring-1 ring-transparent placeholder:text-muted/40 focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30";

export function ProductForm({
  product,
  categories,
}: {
  product?: AdminProduct | null;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.slug));
  const [description, setDescription] = useState(product?.description ?? "");
  const [howToUse, setHowToUse] = useState(product?.howToUse ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [status, setStatus] = useState(product?.status ?? "active");
  const [seoTitle, setSeoTitle] = useState(product?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(product?.seoDescription ?? "");
  const [searchKeywords, setSearchKeywords] = useState((product?.searchKeywords ?? []).join(", "));
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [images, setImages] = useState<ImageRow[]>(
    product?.images.length
      ? product.images.map((src) => ({ src, alt: product.name }))
      : [],
  );
  const [variants, setVariants] = useState<VariantRow[]>(toVariantRows(product));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const progress = useActionProgress();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [removeImageIndex, setRemoveImageIndex] = useState<number | null>(null);
  const [removeVariantIndex, setRemoveVariantIndex] = useState<number | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  function onName(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function uploadFile(file: File, index: number) {
    progress.begin();
    try {
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
      setImages((current) =>
        current.map((row, rowIndex) => (rowIndex === index ? { ...row, src: payload.url! } : row)),
      );
      progress.succeed("Image uploaded.");
    } catch (uploadError) {
      progress.fail(uploadError instanceof Error ? uploadError.message : "Upload failed. Please try again.");
      throw uploadError;
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    progress.begin();
    setError("");

    try {
      const productName = name.trim();
      if (!productName) {
        throw new Error("Enter the product name.");
      }
      if (!categoryId) {
        throw new Error("Choose a category. Add ritual tiles under Home first if this list is empty.");
      }

      const nextSlug = slugify(slug.trim() || productName);
      if (!nextSlug) {
        throw new Error("Enter a product name so a URL can be created.");
      }

      const filledVariants = variants.filter(
        (variant) => variant.sku.trim() || variant.name.trim() || variant.price.trim(),
      );
      const sourceVariants = filledVariants.length > 0 ? filledVariants : variants.slice(0, 1);

      const parsedVariants = sourceVariants.map((variant, index) => {
        const pricePaise = variant.price.trim() ? rupeesToPaise(variant.price) : 0;
        const mrpPaise = variant.mrp.trim() ? rupeesToPaise(variant.mrp) : null;
        if (variant.price.trim() && pricePaise == null) {
          throw new Error("Enter selling price as rupees, for example 129.00, or leave it blank.");
        }
        if (variant.mrp.trim() && mrpPaise == null) {
          throw new Error("Enter MRP as rupees, or leave it blank.");
        }
        const stockQty = variant.stockQty.trim() ? Number(variant.stockQty) : 0;
        const weightGrams = variant.weightGrams.trim() ? Number(variant.weightGrams) : null;
        if (!Number.isInteger(stockQty) || stockQty < 0) {
          throw new Error("Stock must be a whole number, or leave it blank.");
        }
        if (weightGrams != null && (!Number.isInteger(weightGrams) || weightGrams <= 0)) {
          throw new Error("Weight must be a whole number of grams, or leave it blank.");
        }
        const packName = variant.name.trim() || "1 pack";
        const sku =
          variant.sku.trim() ||
          `BG-${slugify(productName).replace(/-/g, "").slice(0, 12).toUpperCase() || "ITEM"}-${index + 1}`;
        return {
          id: variant.id,
          sku,
          name: packName,
          pricePaise: pricePaise ?? 0,
          mrpPaise,
          weightGrams,
          stockQty,
          isActive: variant.isActive,
        };
      });

      if (parsedVariants.length === 0) {
        throw new Error("Add at least one pack.");
      }

      const savedImages = images.filter((image) => image.src.trim());
      const payload = {
        name: productName,
        slug: nextSlug,
        description: description.trim() || null,
        howToUse: howToUse.trim() || null,
        categoryId,
        status,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
        searchKeywords: parseSearchKeywords(searchKeywords),
        images: savedImages.map((image) => image.src.trim()),
        imageAlts: savedImages.map((image) => image.alt.trim() || productName),
        isFeatured,
        variants: parsedVariants,
      };

      const path = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const response = await fetch(path, {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string; id?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Could not save the product.");
      }
      progress.succeed(product ? "Product updated successfully." : "Product added successfully.");
      router.push("/admin/products");
      router.refresh();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Could not save the product. Please try again.";
      setError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  async function archive() {
    if (!product || pending || progress.pending) {
      return;
    }
    setPending(true);
    progress.begin();
    setError("");
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Could not archive the product.");
      }
      progress.succeed("Product archived.", { keep: true });
      router.push("/admin/products");
      router.refresh();
    } catch (archiveError) {
      const message = archiveError instanceof Error ? archiveError.message : "Could not archive. Please try again.";
      setError(message);
      progress.fail(message);
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="mx-auto w-full max-w-3xl">
      <div className="divide-y divide-border/70 rounded-2xl bg-surface ring-1 ring-border/80">
        <section className="px-5 py-6 sm:px-8 sm:py-8">
          <h2 className="font-serif text-2xl font-medium tracking-tight">Product details</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Name, aisle, and whether this item is for sale.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldLabel
                htmlFor="name"
                tip="The name customers see in the shop. Example: Karpooram or Camphor."
              >
                Name
                <span className="text-danger"> *</span>
              </FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(event) => onName(event.target.value)}
                placeholder="Karpooram"
                required
              />
            </div>
            <div>
              <FieldLabel
                htmlFor="slug"
                tip="Optional. This becomes the product link, like /p/karpooram. It fills in from the name. Leave it unless you need a shorter URL."
              >
                URL name
              </FieldLabel>
              <Input
                id="slug"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
                placeholder="karpooram"
              />
            </div>
            <div>
              <FieldLabel
                htmlFor="category"
                tip="Which home-page ritual tile this product belongs to, such as Ganapathy Homam or Daily Pooja. Create tiles under Home first if this list is empty."
              >
                Category
                <span className="text-danger"> *</span>
              </FieldLabel>
              <Select
                id="category"
                value={categoryId}
                required
                placeholder="Choose a category"
                onChange={setCategoryId}
                options={
                  categories.length === 0
                    ? [{ value: "", label: "No records", disabled: true }]
                    : categories.map((category) => ({ value: category.id, label: category.name }))
                }
              />
            </div>
            <div>
              <FieldLabel
                htmlFor="status"
                tip="Draft stays hidden. Active is for sale in the shop. Archived is taken off the shop without deleting orders."
              >
                Status
              </FieldLabel>
              <Select
                id="status"
                value={status}
                onChange={(value) => setStatus(value as typeof status)}
                options={[
                  { value: "draft", label: "Draft — hidden" },
                  { value: "active", label: "Active — for sale" },
                  { value: "archived", label: "Archived — off the shop" },
                ]}
              />
            </div>
            <div className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
              <label htmlFor="featured" className="flex min-h-11 items-center gap-2">
                <input
                  id="featured"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(event) => setIsFeatured(event.target.checked)}
                />
                Featured on the homepage product row
              </label>
              <FieldTip text="Tick this if this item should appear in the Most loved products row on the home page." />
            </div>
          </div>
        </section>

        <section className="px-5 py-6 sm:px-8 sm:py-8">
          <h2 className="font-serif text-2xl font-medium tracking-tight">Description</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Shown on the product page. Leave How to use blank if it is not needed.
          </p>
          <div className="mt-6 grid gap-5">
            <div>
              <FieldLabel
                htmlFor="description"
                tip="A short explanation of what this item is. Customers read this on the product page."
              >
                Description
              </FieldLabel>
              <textarea
                id="description"
                className={areaClassName}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Camphor tablets for daily pooja and homam."
              />
            </div>
            <div>
              <FieldLabel
                htmlFor="howToUse"
                tip="Optional. How the customer uses it at home. Skip this if the pack already explains it."
              >
                How to use
              </FieldLabel>
              <textarea
                id="howToUse"
                className={areaClassName}
                value={howToUse}
                onChange={(event) => setHowToUse(event.target.value)}
                placeholder="Light a small piece during pooja. Keep away from children."
              />
            </div>
            <div>
              <FieldLabel
                htmlFor="searchKeywords"
                tip="Optional. Separate words with commas. Shop search already uses the name and description — add extra spellings people might type."
              >
                Search words
              </FieldLabel>
              <textarea
                id="searchKeywords"
                className={areaClassName}
                value={searchKeywords}
                onChange={(event) => setSearchKeywords(event.target.value)}
                placeholder="camphor, karpooram, கற்பூரம், kapoor"
              />
              <p className="mt-2 text-xs leading-relaxed text-muted">
                English, Tamil, and other names. Example: camphor, karpooram, கற்பூரம்.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-6 sm:px-8 sm:py-8">
          <h2 className="font-serif text-2xl font-medium tracking-tight">Google listing</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Optional. Shown on Google, not used as extra shop-search words. Leave blank to use the product name.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel
                htmlFor="seoTitle"
                tip="Optional Google title. Leave blank if you are unsure — the product name is used instead."
              >
                Google title
              </FieldLabel>
              <Input
                id="seoTitle"
                value={seoTitle}
                onChange={(event) => setSeoTitle(event.target.value)}
                placeholder="Karpooram (Camphor) 50g"
              />
            </div>
            <div>
              <FieldLabel
                htmlFor="seoDescription"
                tip="Optional one-line Google snippet. Leave blank if you are unsure."
              >
                Google description
              </FieldLabel>
              <Input
                id="seoDescription"
                value={seoDescription}
                onChange={(event) => setSeoDescription(event.target.value)}
                placeholder="Camphor for daily pooja from Bala Ganapathy Pooja Store."
              />
            </div>
          </div>
        </section>

        <section className="px-5 py-6 sm:px-8 sm:py-8">
          <h2 className="font-serif text-2xl font-medium tracking-tight">Photos</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            JPEG, PNG, or WebP up to 2 MB. Add at least one photo so the product does not look empty.
          </p>
          <div className="mt-6 flex flex-col gap-4">
            {images.map((image, index) => (
              <div
                key={`image-${index}`}
                className="grid gap-3 rounded-2xl bg-brand/[0.03] p-4 ring-1 ring-border/60 sm:grid-cols-[1fr_1fr_auto]"
              >
                <div>
                  <FieldLabel
                    htmlFor={`image-src-${index}`}
                    tip="Upload a photo from your computer, or paste a link that starts with /uploads or https."
                  >
                    Photo
                  </FieldLabel>
                  <Input
                    id={`image-src-${index}`}
                    value={image.src}
                    onChange={(event) =>
                      setImages((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, src: event.target.value } : row,
                        ),
                      )
                    }
                    placeholder="/uploads/camphor.jpg"
                  />
                  <input
                    className="mt-2 block w-full text-sm"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void uploadFile(file, index).catch((uploadError: unknown) => {
                          setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
                        });
                      }
                    }}
                  />
                </div>
                <div>
                  <FieldLabel
                    htmlFor={`image-alt-${index}`}
                    tip="A short line describing the photo, for people who cannot see it. Example: Packet of camphor."
                  >
                    Photo description
                  </FieldLabel>
                  <Input
                    id={`image-alt-${index}`}
                    value={image.alt}
                    onChange={(event) =>
                      setImages((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, alt: event.target.value } : row,
                        ),
                      )
                    }
                    placeholder="Packet of camphor"
                  />
                </div>
                <button
                  type="button"
                  className="self-end text-sm text-danger"
                  onClick={() => setRemoveImageIndex(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              className="w-fit"
              onClick={() => setImages((current) => [...current, { src: "", alt: name || "Product photo" }])}
            >
              Add photo
            </Button>
          </div>
        </section>

        <section className="px-5 py-6 sm:px-8 sm:py-8">
          <h2 className="font-serif text-2xl font-medium tracking-tight">Packs and price</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            One row is one pack the customer can buy. If you only sell one size, fill one row. Add
            another row for a second size, such as 50g and 100g.
          </p>
          <div className="mt-6 flex flex-col gap-4">
            {variants.map((variant, index) => (
              <div
                key={variant.id ?? `new-${index}`}
                className="grid gap-3 rounded-2xl bg-brand/[0.03] p-4 ring-1 ring-border/60 sm:grid-cols-3"
              >
                <div>
                  <FieldLabel
                    htmlFor={`sku-${index}`}
                    tip="Optional. Your own code for this pack. Leave blank and we will create one, such as BG-CAMPHOR-1. Customers can see this on the product page."
                  >
                    SKU (stock code)
                  </FieldLabel>
                  <Input
                    id={`sku-${index}`}
                    value={variant.sku}
                    onChange={(event) =>
                      setVariants((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, sku: event.target.value } : row,
                        ),
                      )
                    }
                    placeholder="BG-CAMPHOR-50"
                  />
                </div>
                <div>
                  <FieldLabel
                    htmlFor={`variant-name-${index}`}
                    tip="Optional. The pack size the customer chooses, such as 50g or 1 kit. Leave blank to use “1 pack”."
                  >
                    Pack size
                  </FieldLabel>
                  <Input
                    id={`variant-name-${index}`}
                    value={variant.name}
                    onChange={(event) =>
                      setVariants((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, name: event.target.value } : row,
                        ),
                      )
                    }
                    placeholder="50g"
                  />
                </div>
                <div>
                  <FieldLabel
                    htmlFor={`price-${index}`}
                    tip="Optional selling price in rupees. Example: 129 or 129.00. Leave blank if the price is not ready yet."
                  >
                    Selling price (₹)
                  </FieldLabel>
                  <Input
                    id={`price-${index}`}
                    inputMode="decimal"
                    value={variant.price}
                    onChange={(event) =>
                      setVariants((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, price: event.target.value } : row,
                        ),
                      )
                    }
                    placeholder="129.00"
                  />
                </div>
                <div>
                  <FieldLabel
                    htmlFor={`mrp-${index}`}
                    tip="Printed MRP on the pack, if it is higher than the selling price. Leave blank if there is no separate MRP."
                  >
                    MRP (₹)
                  </FieldLabel>
                  <Input
                    id={`mrp-${index}`}
                    inputMode="decimal"
                    value={variant.mrp}
                    onChange={(event) =>
                      setVariants((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, mrp: event.target.value } : row,
                        ),
                      )
                    }
                    placeholder="149.00"
                  />
                </div>
                <div>
                  <FieldLabel
                    htmlFor={`stock-${index}`}
                    tip="How many of this pack you have now. Use 0 if it is out of stock."
                  >
                    Stock quantity
                  </FieldLabel>
                  <Input
                    id={`stock-${index}`}
                    inputMode="numeric"
                    value={variant.stockQty}
                    onChange={(event) =>
                      setVariants((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, stockQty: event.target.value } : row,
                        ),
                      )
                    }
                  />
                </div>
                <div>
                  <FieldLabel
                    htmlFor={`weight-${index}`}
                    tip="Optional pack weight in grams. Example: 50 for a 50g pack. Leave blank for kits or pieces if you are unsure."
                  >
                    Weight (grams)
                  </FieldLabel>
                  <Input
                    id={`weight-${index}`}
                    inputMode="numeric"
                    value={variant.weightGrams}
                    onChange={(event) =>
                      setVariants((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, weightGrams: event.target.value } : row,
                        ),
                      )
                    }
                    placeholder="50"
                  />
                </div>
                <div className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
                  <label
                    htmlFor={`variant-active-${index}`}
                    className="flex min-h-11 items-center gap-2"
                  >
                    <input
                      id={`variant-active-${index}`}
                      type="checkbox"
                      checked={variant.isActive}
                      onChange={(event) =>
                        setVariants((current) =>
                          current.map((row, rowIndex) =>
                            rowIndex === index ? { ...row, isActive: event.target.checked } : row,
                          ),
                        )
                      }
                    />
                    This pack is for sale
                  </label>
                  <FieldTip text="Untick to hide only this pack. The product can stay on the shop with other packs." />
                </div>
                {variants.length > 1 ? (
                  <button
                    type="button"
                    className="text-left text-sm text-danger"
                    onClick={() => setRemoveVariantIndex(index)}
                  >
                    Remove pack
                  </button>
                ) : null}
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              className="w-fit"
              onClick={() =>
                setVariants((current) => [
                  ...current,
                  {
                    sku: "",
                    name: "",
                    price: "",
                    mrp: "",
                    weightGrams: "",
                    stockQty: "0",
                    isActive: true,
                  },
                ])
              }
            >
              Add another pack
            </Button>
          </div>
        </section>

        <section className="px-5 py-6 sm:px-8 sm:py-8">
          {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={pending || progress.pending}>
              {pending || progress.pending ? "Saving…" : "Save product"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={pending || progress.pending}
              onClick={() => setCancelOpen(true)}
            >
              Cancel
            </Button>
            {product ? (
              <Button
                type="button"
                variant="secondary"
                disabled={pending || progress.pending}
                onClick={() => setArchiveOpen(true)}
              >
                Archive
              </Button>
            ) : null}
          </div>
        </section>
      </div>
      <ConfirmDialog
        open={cancelOpen}
        title="Leave without saving?"
        description="This product will not be saved. You will go back to the product list."
        confirmLabel="Leave"
        pending={pending || progress.pending}
        onCancel={() => {
          if (!pending && !progress.pending) {
            setCancelOpen(false);
          }
        }}
        onConfirm={() => {
          setCancelOpen(false);
          router.push("/admin/products");
        }}
      />
      <ConfirmDialog
        open={archiveOpen}
        title="Archive this product?"
        description={`${product?.name ?? "This product"} will leave the shop until you restore it. Orders already placed are not changed.`}
        confirmLabel="Archive"
        pending={pending || progress.pending}
        onCancel={() => {
          if (!pending && !progress.pending) {
            setArchiveOpen(false);
          }
        }}
        onConfirm={() => void archive()}
      />
      <ConfirmDialog
        open={removeImageIndex !== null}
        title="Remove this image?"
        description="The image will be dropped from this product when you save."
        confirmLabel="Remove"
        onCancel={() => setRemoveImageIndex(null)}
        onConfirm={() => {
          if (removeImageIndex !== null) {
            setImages((current) => current.filter((_, rowIndex) => rowIndex !== removeImageIndex));
            setRemoveImageIndex(null);
          }
        }}
      />
      <ConfirmDialog
        open={removeVariantIndex !== null}
        title="Remove this variant?"
        description={
          removeVariantIndex !== null
            ? `${variants[removeVariantIndex]?.name || "This pack"} will be deleted from the form. Save the product to apply it.`
            : "This pack will be deleted from the form."
        }
        confirmLabel="Remove variant"
        onCancel={() => setRemoveVariantIndex(null)}
        onConfirm={() => {
          if (removeVariantIndex !== null) {
            setVariants((current) => current.filter((_, rowIndex) => rowIndex !== removeVariantIndex));
            setRemoveVariantIndex(null);
          }
        }}
      />
    </form>
  );
}
