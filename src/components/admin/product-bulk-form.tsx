"use client";

import { useEffect, useMemo, useState } from "react";
import JSZip from "jszip";
import { useRouter } from "@/components/progress/navigation";
import { useActionProgress } from "@/components/progress/use-action-progress";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FieldTip } from "@/components/ui/field-tip";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { formatPaise } from "@/lib/money";
import { sheetBasename, type BulkPreviewProduct, type ProductSheetError } from "@/lib/product-sheet";

const IMAGE_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGES = 80;

type PhotoItem = { name: string; file: File; previewUrl: string };

function extensionOf(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function isAllowedImage(file: File, filename: string) {
  const type = file.type || IMAGE_TYPES[extensionOf(filename)] || "";
  return Boolean(IMAGE_TYPES[extensionOf(filename)]) && (type.startsWith("image/") || IMAGE_TYPES[extensionOf(filename)]);
}

async function filesFromZip(file: File) {
  const zip = await JSZip.loadAsync(file);
  const photos: File[] = [];
  const entries = Object.values(zip.files);
  for (const entry of entries) {
    if (entry.dir || entry.name.includes("__MACOSX") || entry.name.startsWith(".")) {
      continue;
    }
    const name = sheetBasename(entry.name);
    if (!IMAGE_TYPES[extensionOf(name)]) {
      continue;
    }
    const blob = await entry.async("blob");
    const type = IMAGE_TYPES[extensionOf(name)];
    photos.push(new File([blob], name, { type }));
  }
  return photos;
}

async function uploadPhoto(file: File) {
  const body = new FormData();
  body.set("file", file);
  const response = await fetch("/api/admin/uploads", {
    method: "POST",
    credentials: "same-origin",
    body,
  });
  const payload = (await response.json()) as { error?: string; url?: string };
  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? `Could not upload ${file.name}.`);
  }
  return payload.url;
}

function FilePickCard({
  id,
  label,
  tip,
  accept,
  multiple = false,
  icon,
  buttonLabel,
  helper,
  selectedLabel,
  disabled,
  onFiles,
  onClear,
}: {
  id: string;
  label: string;
  tip: string;
  accept: string;
  multiple?: boolean;
  icon: string;
  buttonLabel: string;
  helper: string;
  selectedLabel: string | null;
  disabled?: boolean;
  onFiles: (files: FileList) => void;
  onClear?: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  function takeFiles(files: FileList | null) {
    if (!files?.length) {
      return;
    }
    onFiles(files);
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1">
        <span className="text-sm font-medium text-text">{label}</span>
        <FieldTip text={tip} />
      </div>
      <label
        htmlFor={id}
        className={cn(
          "flex min-h-[8.5rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl px-4 py-5 text-center ring-1 transition-colors",
          dragging
            ? "bg-brand/10 ring-brand/40"
            : "bg-brand/[0.04] ring-border/80 hover:bg-brand/[0.07] hover:ring-brand/25",
          disabled && "pointer-events-none opacity-50",
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          takeFiles(event.dataTransfer.files);
        }}
      >
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Icon name={icon} className="text-lg" />
        </span>
        <span className="text-sm font-medium text-brand">{buttonLabel}</span>
        <span className="max-w-[16rem] text-xs leading-relaxed text-muted">
          {selectedLabel ?? helper}
        </span>
        <input
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            takeFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>
      {selectedLabel && onClear ? (
        <button
          type="button"
          className="mt-2 text-sm text-danger hover:underline"
          disabled={disabled}
          onClick={onClear}
        >
          Remove
        </button>
      ) : null}
    </div>
  );
}

export function ProductBulkForm() {
  const router = useRouter();
  const progress = useActionProgress();
  const [sheet, setSheet] = useState<File | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [errors, setErrors] = useState<ProductSheetError[]>([]);
  const [preview, setPreview] = useState<BulkPreviewProduct[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [packCount, setPackCount] = useState(0);
  const [formError, setFormError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, [photos]);

  const photoMap = useMemo(() => {
    const map = new Map<string, PhotoItem>();
    for (const photo of photos) {
      map.set(photo.name.toLowerCase(), photo);
    }
    return map;
  }, [photos]);

  async function addPhotos(fileList: FileList | File[]) {
    const next = [...photos];
    const names = new Set(next.map((item) => item.name.toLowerCase()));
    const incoming = [...fileList];

    for (const file of incoming) {
      const filename = file.name.toLowerCase();
      if (filename.endsWith(".zip") || file.type === "application/zip" || file.type === "application/x-zip-compressed") {
        const extracted = await filesFromZip(file);
        incoming.push(...extracted);
        continue;
      }
      const name = sheetBasename(file.name);
      if (!isAllowedImage(file, name)) {
        throw new Error(`${name} must be a JPEG, PNG, or WebP image.`);
      }
      if (file.size > MAX_IMAGE_BYTES) {
        throw new Error(`${name} must be 2 MB or smaller.`);
      }
      if (names.has(name.toLowerCase())) {
        const index = next.findIndex((item) => item.name.toLowerCase() === name.toLowerCase());
        if (index >= 0) {
          URL.revokeObjectURL(next[index].previewUrl);
          next[index] = { name, file, previewUrl: URL.createObjectURL(file) };
        }
        continue;
      }
      if (next.length >= MAX_IMAGES) {
        throw new Error(`Upload at most ${MAX_IMAGES} photos at a time.`);
      }
      names.add(name.toLowerCase());
      next.push({ name, file, previewUrl: URL.createObjectURL(file) });
    }

    setPhotos(next);
    setErrors([]);
    setPreview([]);
  }

  async function downloadTemplate() {
    if (pending || progress.pending) {
      return;
    }
    setPending(true);
    progress.begin();
    setFormError("");
    try {
      const response = await fetch("/api/admin/products/bulk/template", { credentials: "same-origin" });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Could not download the template.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bgps-products-template.xlsx";
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      progress.succeed("Template downloaded.");
    } catch (downloadError) {
      const message = downloadError instanceof Error ? downloadError.message : "Could not download the template.";
      setFormError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  async function checkSheet() {
    if (pending || progress.pending) {
      return;
    }
    if (!sheet) {
      setFormError("Choose the filled Excel file first, then check.");
      return;
    }
    setPending(true);
    progress.begin();
    setFormError("");
    setErrors([]);
    setPreview([]);
    try {
      const body = new FormData();
      body.set("mode", "check");
      body.set("sheet", sheet);
      body.set("imageNames", JSON.stringify(photos.map((photo) => photo.name)));
      const response = await fetch("/api/admin/products/bulk", {
        method: "POST",
        credentials: "same-origin",
        body,
      });
      const payload = (await response.json()) as {
        error?: string;
        errors?: ProductSheetError[];
        preview?: BulkPreviewProduct[];
        productCount?: number;
        packCount?: number;
      };
      if (!response.ok && !payload.errors) {
        throw new Error(payload.error ?? "Could not read the sheet.");
      }
      const nextErrors = payload.errors ?? [];
      setErrors(nextErrors);
      setPreview(payload.preview ?? []);
      setProductCount(payload.productCount ?? 0);
      setPackCount(payload.packCount ?? 0);
      if (nextErrors.length > 0) {
        progress.fail(`Fix ${nextErrors.length} ${nextErrors.length === 1 ? "issue" : "issues"} in the sheet, then check again.`);
        return;
      }
      progress.succeed("Sheet looks good. Check the preview, then import.");
    } catch (checkError) {
      const message = checkError instanceof Error ? checkError.message : "Could not read the sheet.";
      setFormError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  async function importSheet() {
    if (!sheet || pending || progress.pending || errors.length > 0 || preview.length === 0) {
      return;
    }
    setConfirmOpen(false);
    setPending(true);
    progress.begin();
    setFormError("");
    try {
      const needed = new Set(
        preview.flatMap((product) =>
          product.imageRefs.filter((ref) => !ref.startsWith("https://") && !ref.startsWith("/uploads/")),
        ).map((name) => name.toLowerCase()),
      );
      const imageUrls: Record<string, string> = {};
      for (const photo of photos) {
        if (!needed.has(photo.name.toLowerCase())) {
          continue;
        }
        imageUrls[photo.name.toLowerCase()] = await uploadPhoto(photo.file);
      }
      const body = new FormData();
      body.set("mode", "import");
      body.set("sheet", sheet);
      body.set("imageUrls", JSON.stringify(imageUrls));
      const response = await fetch("/api/admin/products/bulk", {
        method: "POST",
        credentials: "same-origin",
        body,
      });
      const payload = (await response.json()) as {
        error?: string;
        ok?: boolean;
        imported?: number;
        errors?: ProductSheetError[];
      };
      if (payload.errors?.length) {
        setErrors(payload.errors);
        setPreview([]);
        throw new Error("The sheet has issues. Fix them and check again.");
      }
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Could not import the products.");
      }
      progress.succeed(
        payload.imported === 1 ? "1 product imported as draft." : `${payload.imported} products imported as drafts.`,
      );
      router.push("/admin/products");
      router.refresh();
    } catch (importError) {
      const message = importError instanceof Error ? importError.message : "Could not import the products.";
      setFormError(message);
      progress.fail(message);
      setPending(false);
    }
  }

  const ready = errors.length === 0 && preview.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl bg-surface p-5 ring-1 ring-border/80 sm:p-8">
        <h2 className="font-serif text-2xl font-medium tracking-tight">1. Sheet and photos</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Download the template, fill it in Excel, then choose that file here. Leave URL name blank
          — the shop creates it from the product name, for example Karpooram becomes karpooram.
          Photos are optional; put the file name in the Image column if you add them.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="secondary" disabled={pending} onClick={() => void downloadTemplate()}>
            Download template
          </Button>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <FilePickCard
            id="sheet"
            label="Product sheet"
            tip="Choose the filled Excel .xlsx file, or a CSV UTF-8 export. Keep the header row from the template."
            accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            icon="file-arrow-up"
            buttonLabel="Choose Excel file"
            helper="Drop the .xlsx file here, or click to browse."
            selectedLabel={sheet ? sheet.name : null}
            disabled={pending}
            onFiles={(files) => {
              const file = files[0];
              if (!file) {
                return;
              }
              setSheet(file);
              setFormError("");
              setErrors([]);
              setPreview([]);
            }}
            onClear={() => {
              setSheet(null);
              setErrors([]);
              setPreview([]);
            }}
          />
          <FilePickCard
            id="photos"
            label="Product photos"
            tip="Optional. Select several photos, or one zip. File names must match the Image column, for example karpooram.jpg."
            accept="image/jpeg,image/png,image/webp,.zip,application/zip"
            multiple
            icon="image"
            buttonLabel="Choose photos"
            helper="Drop JPEG, PNG, WebP, or a zip here. Optional if Image cells are empty."
            selectedLabel={
              photos.length > 0
                ? `${photos.length} photo${photos.length === 1 ? "" : "s"} selected`
                : null
            }
            disabled={pending}
            onFiles={(files) => {
              void addPhotos(files).catch((photoError: unknown) => {
                const message = photoError instanceof Error ? photoError.message : "Could not add photos.";
                setFormError(message);
                progress.fail(message);
              });
            }}
            onClear={() => {
              photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
              setPhotos([]);
              setErrors([]);
              setPreview([]);
            }}
          />
        </div>
        {photos.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {photos.map((photo) => (
              <li key={photo.name} className="inline-flex items-center gap-2 rounded-full bg-brand/[0.06] px-3 py-1 text-xs">
                {photo.name}
                <button
                  type="button"
                  className="text-danger"
                  disabled={pending}
                  onClick={() => {
                    URL.revokeObjectURL(photo.previewUrl);
                    setPhotos((current) => current.filter((item) => item.name !== photo.name));
                    setErrors([]);
                    setPreview([]);
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {formError ? <p className="mt-4 text-sm text-danger">{formError}</p> : null}
        <div className="mt-6">
          <Button type="button" disabled={pending} onClick={() => void checkSheet()}>
            {pending ? "Checking…" : "Check sheet"}
          </Button>
          {!sheet ? (
            <p className="mt-2 text-xs text-muted">Choose the filled Excel file above, then check.</p>
          ) : null}
        </div>
      </section>

      {errors.length > 0 ? (
        <section className="rounded-2xl bg-surface p-5 ring-1 ring-border/80 sm:p-8">
          <h2 className="font-serif text-2xl font-medium tracking-tight">Fix these rows</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Nothing was saved. Change the sheet or add the missing photos, then check again.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-border/80 text-xs uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="px-3 py-3 font-medium">Row</th>
                  <th className="px-3 py-3 font-medium">Column</th>
                  <th className="px-3 py-3 font-medium">Problem</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((error, index) => (
                  <tr key={`${error.row}-${error.column}-${index}`} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-3 tabular-nums text-muted">{error.row ?? "—"}</td>
                    <td className="px-3 py-3">{error.column ?? "—"}</td>
                    <td className="px-3 py-3">{error.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {ready ? (
        <section className="rounded-2xl bg-surface p-5 ring-1 ring-border/80 sm:p-8">
          <h2 className="font-serif text-2xl font-medium tracking-tight">2. Preview</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {productCount} {productCount === 1 ? "product" : "products"}, {packCount}{" "}
            {packCount === 1 ? "pack" : "packs"}. They import as drafts unless the sheet says active.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="border-b border-border/80 text-xs uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="px-3 py-3 font-medium">Photo</th>
                  <th className="px-3 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Pack</th>
                  <th className="px-3 py-3 font-medium">Price</th>
                  <th className="px-3 py-3 font-medium">Stock</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.flatMap((product) =>
                  product.packs.map((pack, packIndex) => {
                    const imageRef = product.imageRefs[0];
                    const local = imageRef ? photoMap.get(imageRef.toLowerCase()) : undefined;
                    const remote = imageRef?.startsWith("/") || imageRef?.startsWith("https://") ? imageRef : null;
                    return (
                      <tr key={`${product.slug}-${pack.sku}-${pack.rowNumber}`} className="border-b border-border/60 last:border-0">
                        <td className="px-3 py-3">
                          {packIndex === 0 && (local || remote) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={local?.previewUrl ?? remote ?? ""}
                              alt=""
                              className="size-12 rounded-[3px] object-cover ring-1 ring-border/70"
                            />
                          ) : packIndex === 0 ? (
                            <span className="text-xs text-muted">No photo</span>
                          ) : null}
                        </td>
                        <td className="px-3 py-3">
                          {packIndex === 0 ? (
                            <>
                              <p className="font-medium text-text">{product.name}</p>
                              <p className="text-muted">{product.categoryName}</p>
                            </>
                          ) : (
                            <span className="text-muted"> </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {pack.packName}
                          <span className="block text-xs text-muted">{pack.sku}</span>
                        </td>
                        <td className="px-3 py-3 tabular-nums">{formatPaise(pack.pricePaise)}</td>
                        <td className="px-3 py-3 tabular-nums">{pack.stockQty}</td>
                        <td className="px-3 py-3 capitalize text-muted">{packIndex === 0 ? product.status : ""}</td>
                      </tr>
                    );
                  }),
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <Button type="button" disabled={pending} onClick={() => setConfirmOpen(true)}>
              Import products
            </Button>
          </div>
        </section>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title={`Import ${productCount} ${productCount === 1 ? "product" : "products"}?`}
        description="This adds new listings only. It does not change products already in the shop. Drafts stay hidden until you set them active."
        confirmLabel="Import"
        cancelLabel="Back"
        tone="brand"
        pending={pending}
        onConfirm={() => void importSheet()}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
