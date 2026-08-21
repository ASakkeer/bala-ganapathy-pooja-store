"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/components/progress/navigation";
import { useActionProgress } from "@/components/progress/use-action-progress";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { EmptyNotice } from "@/components/ui/empty-notice";
import { FieldLabel } from "@/components/ui/field-tip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { paiseToRupeeInput, rupeesToPaise } from "@/lib/paise-parse";

type SettingsValue = {
  phones: string[];
  whatsapp: string | null;
  address: string | null;
  hours: string | null;
  mapUrl: string | null;
  announcement: string | null;
  shippingRules: { flatShippingPaise: number; label: string } | null;
};

type PincodeRow = {
  pincode: string;
  estimatedDays?: number | null;
};

type SettingsTab = "contact" | "storefront" | "shipping" | "pincodes";

const TABS: Array<{ id: SettingsTab; label: string }> = [
  { id: "contact", label: "Contact" },
  { id: "storefront", label: "Storefront" },
  { id: "shipping", label: "Shipping" },
  { id: "pincodes", label: "Pincodes" },
];

const PIN_PAGE_SIZE = 8;

const areaClassName =
  "min-h-24 w-full rounded-[1rem] bg-brand/[0.04] px-4 py-3 text-sm text-text ring-1 ring-transparent placeholder:text-muted/40 focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30";

function parsePincodes(value: string) {
  return [...new Set(value.split(/[\s,;]+/).map((item) => item.replace(/\D/g, "")).filter((item) => item.length === 6))];
}

export function SettingsForm({
  settings,
  pincodes,
}: {
  settings: SettingsValue;
  pincodes: PincodeRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<SettingsTab>("contact");
  const [phones, setPhones] = useState((settings.phones ?? []).join("\n"));
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp ?? "");
  const [address, setAddress] = useState(settings.address ?? "");
  const [hours, setHours] = useState(settings.hours ?? "");
  const [mapUrl, setMapUrl] = useState(settings.mapUrl ?? "");
  const [announcement, setAnnouncement] = useState(settings.announcement ?? "");
  const [shippingLabel, setShippingLabel] = useState(settings.shippingRules?.label ?? "Shipping");
  const [shippingRupees, setShippingRupees] = useState(
    paiseToRupeeInput(settings.shippingRules?.flatShippingPaise ?? 0),
  );
  const [newPin, setNewPin] = useState("");
  const [days, setDays] = useState("");
  const [pinQuery, setPinQuery] = useState("");
  const [pinPage, setPinPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [removePin, setRemovePin] = useState("");
  const progress = useActionProgress();

  const filteredPins = useMemo(() => {
    const query = pinQuery.replace(/\D/g, "");
    const rows = [...pincodes].sort((left, right) => left.pincode.localeCompare(right.pincode));
    if (!query) {
      return rows;
    }
    return rows.filter((row) => row.pincode.includes(query));
  }, [pincodes, pinQuery]);

  const pinPages = Math.max(1, Math.ceil(filteredPins.length / PIN_PAGE_SIZE));
  const safePage = Math.min(pinPage, pinPages);
  const visiblePins = filteredPins.slice((safePage - 1) * PIN_PAGE_SIZE, safePage * PIN_PAGE_SIZE);

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    const flatShippingPaise = rupeesToPaise(shippingRupees);
    if (flatShippingPaise == null) {
      const message = "Enter shipping as rupees, for example 50.00.";
      setError(message);
      progress.fail(message);
      setPending(false);
      return;
    }

    progress.begin();
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          phones: phones.split(/[\n,]+/).map((value) => value.trim()).filter(Boolean),
          whatsapp: whatsapp.trim() || null,
          address: address.trim() || null,
          hours: hours.trim() || null,
          mapUrl: mapUrl.trim() || null,
          announcement: announcement.trim() || null,
          shippingLabel,
          flatShippingPaise,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not save settings.");
      }
      setNotice("Settings saved.");
      progress.succeed("Settings saved.");
      router.refresh();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Could not save settings. Please try again.";
      setError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  async function addPincodes(event: React.FormEvent) {
    event.preventDefault();
    const pins = parsePincodes(newPin);
    if (pins.length === 0) {
      const message = "Enter a 6-digit pincode, or several separated by commas.";
      setError(message);
      return;
    }

    setPending(true);
    progress.begin();
    setError("");
    try {
      for (const pincode of pins) {
        const response = await fetch("/api/admin/pincodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            pincode,
            estimatedDays: days ? Number(days) : null,
          }),
        });
        const payload = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(payload.error ?? `Could not add ${pincode}.`);
        }
      }
      setNewPin("");
      setDays("");
      setAddOpen(false);
      progress.succeed(pins.length === 1 ? "Pincode added." : `${pins.length} pincodes added.`);
      router.refresh();
    } catch (addError) {
      const message = addError instanceof Error ? addError.message : "Could not add pincode. Please try again.";
      setError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  async function removePincode(pincode: string) {
    setPending(true);
    progress.begin();
    setError("");
    try {
      const response = await fetch(`/api/admin/pincodes?pincode=${pincode}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not remove pincode.");
      }
      setRemovePin("");
      progress.succeed("Pincode removed.");
      router.refresh();
    } catch (removeError) {
      const message = removeError instanceof Error ? removeError.message : "Could not remove pincode. Please try again.";
      setError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  const busy = pending || progress.pending;

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Settings sections" className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm",
              tab === item.id ? "bg-brand text-on-brand" : "text-muted hover:bg-brand/5 hover:text-brand",
            )}
            onClick={() => {
              setTab(item.id);
              setError("");
              setNotice("");
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab !== "pincodes" ? (
        <form
          onSubmit={(event) => void saveSettings(event)}
          className="overflow-hidden rounded-[1.25rem] bg-surface ring-1 ring-border/80"
        >
          <div className="flex flex-col gap-5 p-5 sm:p-6">
            {tab === "contact" ? (
              <>
                <div>
                  <FieldLabel htmlFor="address" tip="Shown on invoices, the contact page, and the footer. Leave blank rather than inventing a line.">
                    Address
                  </FieldLabel>
                  <textarea
                    id="address"
                    className={areaClassName}
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Shop no., street, R.S. Puram, Coimbatore"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="hours" tip="Opening hours on the contact page. Example: Mon–Sat 9:30 am – 8:30 pm.">
                    Hours
                  </FieldLabel>
                  <Input id="hours" value={hours} onChange={(event) => setHours(event.target.value)} />
                </div>
                <div>
                  <FieldLabel htmlFor="phones" tip="One 10-digit number per line. These appear on the invoice and contact page.">
                    Phones
                  </FieldLabel>
                  <textarea
                    id="phones"
                    className={areaClassName}
                    value={phones}
                    onChange={(event) => setPhones(event.target.value)}
                    placeholder={"9876543210\n9123456780"}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="whatsapp" tip="Used for WhatsApp help buttons. Digits only is fine.">
                    WhatsApp
                  </FieldLabel>
                  <Input id="whatsapp" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} />
                </div>
                <div>
                  <FieldLabel htmlFor="mapUrl" tip="Paste a Google Maps share or embed https URL. Shown on contact only if saved.">
                    Map URL
                  </FieldLabel>
                  <Input id="mapUrl" value={mapUrl} onChange={(event) => setMapUrl(event.target.value)} placeholder="https://" />
                </div>
              </>
            ) : null}

            {tab === "storefront" ? (
              <div>
                <FieldLabel htmlFor="announcement" tip="Short line at the top of the shop. Leave empty to hide the bar.">
                  Announcement bar
                </FieldLabel>
                <Input
                  id="announcement"
                  value={announcement}
                  onChange={(event) => setAnnouncement(event.target.value)}
                  maxLength={200}
                />
                <p className="mt-1 px-1 text-xs text-muted">{announcement.trim().length}/200</p>
              </div>
            ) : null}

            {tab === "shipping" ? (
              <>
                <div>
                  <FieldLabel htmlFor="shippingLabel" tip="Label customers see next to the shipping amount, for example Shipping or Delivery.">
                    Shipping label
                  </FieldLabel>
                  <Input
                    id="shippingLabel"
                    value={shippingLabel}
                    onChange={(event) => setShippingLabel(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="shippingRupees" tip="Flat delivery charge in rupees. Use 0 for free shipping.">
                    Flat shipping (₹)
                  </FieldLabel>
                  <Input
                    id="shippingRupees"
                    inputMode="decimal"
                    value={shippingRupees}
                    onChange={(event) => setShippingRupees(event.target.value)}
                    required
                  />
                </div>
              </>
            ) : null}

            {error ? <p className="text-sm text-danger">{error}</p> : null}
            {notice ? <p className="text-sm text-success">{notice}</p> : null}
          </div>
          <div className="border-t border-border/80 px-5 py-4 sm:px-6">
            <Button type="submit" disabled={busy} className="w-fit">
              {pending ? "Saving…" : "Save this section"}
            </Button>
          </div>
        </form>
      ) : (
        <section className="overflow-hidden rounded-[1.25rem] bg-surface ring-1 ring-border/80">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-medium tracking-tight">Serviceable pincodes</h2>
              <p className="mt-1 text-sm text-muted">
                {pincodes.length} saved. Checkout only accepts these 6-digit pins.
              </p>
            </div>
            <Button type="button" variant="secondary" className="w-fit px-4" onClick={() => setAddOpen(true)}>
              Add pincodes
            </Button>
          </header>
          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <Input
              id="pin-search"
              value={pinQuery}
              onChange={(event) => {
                setPinQuery(event.target.value);
                setPinPage(1);
              }}
              placeholder="Search pincode"
            />
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            {visiblePins.length === 0 ? (
              <EmptyNotice
                title="No records"
                description={
                  pincodes.length === 0
                    ? "No serviceable pincodes saved yet."
                    : "No pincode matches that search."
                }
                className="min-h-[8rem] py-8"
              />
            ) : (
              <ul className="divide-y divide-border/80 overflow-hidden rounded-[1rem] ring-1 ring-border/70">
                {visiblePins.map((row) => (
                  <li key={row.pincode} className="flex min-h-12 items-center justify-between gap-3 px-4 py-2 text-sm">
                    <span>
                      {row.pincode}
                      {row.estimatedDays ? ` · ${row.estimatedDays} days` : ""}
                    </span>
                    <button
                      type="button"
                      className="text-danger hover:underline"
                      disabled={busy}
                      onClick={() => setRemovePin(row.pincode)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {pinPages > 1 ? (
              <div className="flex items-center justify-between gap-3 text-sm">
                <p className="text-muted">
                  Page {safePage} of {pinPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-10 px-4"
                    disabled={safePage <= 1}
                    onClick={() => setPinPage((page) => Math.max(1, page - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-10 px-4"
                    disabled={safePage >= pinPages}
                    onClick={() => setPinPage((page) => Math.min(pinPages, page + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}

      <Dialog
        open={addOpen}
        title="Add pincodes"
        description="Enter one 6-digit pin, or several separated by commas or new lines. Optional days is used for all of them."
        pending={busy}
        onClose={() => {
          if (!busy) {
            setAddOpen(false);
            setError("");
          }
        }}
      >
        <form onSubmit={(event) => void addPincodes(event)} className="flex flex-col gap-4">
          <div>
            <FieldLabel htmlFor="newPin" tip="Example: 641002 or 641002, 641011, 600001">
              Pincodes
            </FieldLabel>
            <textarea
              id="newPin"
              className={areaClassName}
              value={newPin}
              onChange={(event) => setNewPin(event.target.value)}
              placeholder={"641002\n641011"}
            />
          </div>
          <div>
            <FieldLabel htmlFor="days" tip="Optional estimated delivery days shown at checkout. Leave blank if you do not quote days.">
              Estimated days
            </FieldLabel>
            <Input id="days" value={days} onChange={(event) => setDays(event.target.value)} placeholder="3" />
          </div>
          {error && tab === "pincodes" ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                if (!busy) {
                  setAddOpen(false);
                }
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {pending ? "Adding…" : "Add"}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(removePin)}
        title="Remove this pincode?"
        description={
          removePin
            ? `${removePin} will no longer be treated as a delivery area on checkout.`
            : "This pincode will no longer be treated as a delivery area."
        }
        confirmLabel="Remove"
        pending={busy}
        onCancel={() => {
          if (!busy) {
            setRemovePin("");
          }
        }}
        onConfirm={() => {
          if (removePin) {
            void removePincode(removePin);
          }
        }}
      />
    </div>
  );
}
