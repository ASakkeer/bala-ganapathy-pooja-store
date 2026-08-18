"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { paiseToRupeeInput, rupeesToPaise } from "@/lib/paise-parse";
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

const fieldClassName =
  "h-11 w-full rounded-full bg-brand/[0.04] px-4 text-text ring-1 ring-transparent placeholder:text-muted focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30";

const areaClassName =
  "min-h-28 w-full rounded-2xl bg-brand/[0.04] px-4 py-3 text-text ring-1 ring-transparent placeholder:text-muted focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30";

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
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [images, setImages] = useState<ImageRow[]>(
    product?.images.length
      ? product.images.map((src) => ({ src, alt: product.name }))
      : [],
  );
  const [variants, setVariants] = useState<VariantRow[]>(toVariantRows(product));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function onName(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function uploadFile(file: File, index: number) {
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
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const parsedVariants = variants.map((variant) => {
        const pricePaise = rupeesToPaise(variant.price);
        const mrpPaise = variant.mrp.trim() ? rupeesToPaise(variant.mrp) : null;
        if (pricePaise == null) {
          throw new Error("Enter variant prices as rupees, for example 129.00.");
        }
        if (variant.mrp.trim() && mrpPaise == null) {
          throw new Error("Enter MRP as rupees, or leave it blank.");
        }
        const stockQty = Number(variant.stockQty);
        const weightGrams = variant.weightGrams.trim() ? Number(variant.weightGrams) : null;
        if (!Number.isInteger(stockQty) || stockQty < 0) {
          throw new Error("Stock must be a whole number.");
        }
        if (weightGrams != null && (!Number.isInteger(weightGrams) || weightGrams <= 0)) {
          throw new Error("Weight must be a whole number of grams.");
        }
        return {
          id: variant.id,
          sku: variant.sku,
          name: variant.name,
          pricePaise,
          mrpPaise,
          weightGrams,
          stockQty,
          isActive: variant.isActive,
        };
      });

      const payload = {
        name,
        slug,
        description: description.trim() || null,
        howToUse: howToUse.trim() || null,
        categoryId,
        status,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
        images: images.map((image) => image.src).filter(Boolean),
        imageAlts: images.filter((image) => image.src).map((image) => image.alt),
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
      router.push("/admin/products");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the product.");
    } finally {
      setPending(false);
    }
  }

  async function archive() {
    if (!product || pending) {
      return;
    }
    setPending(true);
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
      router.push("/admin/products");
      router.refresh();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Could not archive.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="flex max-w-3xl flex-col gap-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(event) => onName(event.target.value)} required />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className={fieldClassName}
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className={fieldClassName}
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(event) => setIsFeatured(event.target.checked)}
          />
          Featured on the homepage rails
        </label>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          className={areaClassName}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="howToUse">How to use</Label>
        <textarea
          id="howToUse"
          className={areaClassName}
          value={howToUse}
          onChange={(event) => setHowToUse(event.target.value)}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="seoTitle">SEO title</Label>
          <Input id="seoTitle" value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="seoDescription">SEO description</Label>
          <Input
            id="seoDescription"
            value={seoDescription}
            onChange={(event) => setSeoDescription(event.target.value)}
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-serif text-2xl">Images</legend>
        <p className="text-sm text-muted">JPEG, PNG, or WebP up to 2 MB. Alt text is required.</p>
        {images.map((image, index) => (
          <div key={`image-${index}`} className="grid gap-3 rounded-2xl bg-surface p-4 ring-1 ring-border/80 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <Label htmlFor={`image-src-${index}`}>URL or upload</Label>
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
              <Label htmlFor={`image-alt-${index}`}>Alt text</Label>
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
                required={Boolean(image.src)}
              />
            </div>
            <button
              type="button"
              className="self-end text-sm text-danger"
              onClick={() => setImages((current) => current.filter((_, rowIndex) => rowIndex !== index))}
            >
              Remove
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() => setImages((current) => [...current, { src: "", alt: name || "Product photo" }])}
        >
          Add image
        </Button>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-serif text-2xl">Variants</legend>
        {variants.map((variant, index) => (
          <div key={variant.id ?? `new-${index}`} className="grid gap-3 rounded-2xl bg-surface p-4 ring-1 ring-border/80 sm:grid-cols-3">
            <div>
              <Label htmlFor={`sku-${index}`}>SKU</Label>
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
                required
              />
            </div>
            <div>
              <Label htmlFor={`variant-name-${index}`}>Pack name</Label>
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
                required
              />
            </div>
            <div>
              <Label htmlFor={`price-${index}`}>Price (₹)</Label>
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
                required
              />
            </div>
            <div>
              <Label htmlFor={`mrp-${index}`}>MRP (₹)</Label>
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
              />
            </div>
            <div>
              <Label htmlFor={`stock-${index}`}>Stock</Label>
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
                required
              />
            </div>
            <div>
              <Label htmlFor={`weight-${index}`}>Weight (g)</Label>
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
              />
            </div>
            <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
              <input
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
              Active
            </label>
            {variants.length > 1 ? (
              <button
                type="button"
                className="text-left text-sm text-danger"
                onClick={() => setVariants((current) => current.filter((_, rowIndex) => rowIndex !== index))}
              >
                Remove variant
              </button>
            ) : null}
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
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
          Add variant
        </Button>
      </fieldset>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save product"}
        </Button>
        {product ? (
          <Button type="button" variant="secondary" disabled={pending} onClick={() => void archive()}>
            Archive
          </Button>
        ) : null}
      </div>
    </form>
  );
}
