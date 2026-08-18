"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const areaClassName =
  "min-h-24 w-full rounded-2xl bg-brand/[0.04] px-4 py-3 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30";

export function SettingsForm({
  settings,
  pincodes,
}: {
  settings: SettingsValue;
  pincodes: PincodeRow[];
}) {
  const router = useRouter();
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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    const flatShippingPaise = rupeesToPaise(shippingRupees);
    if (flatShippingPaise == null) {
      setError("Enter shipping as rupees, for example 50.00.");
      setPending(false);
      return;
    }

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
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save settings.");
    } finally {
      setPending(false);
    }
  }

  async function addPincode(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/pincodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          pincode: newPin,
          estimatedDays: days ? Number(days) : null,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not add pincode.");
      }
      setNewPin("");
      setDays("");
      router.refresh();
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : "Could not add pincode.");
    } finally {
      setPending(false);
    }
  }

  async function removePincode(pincode: string) {
    setPending(true);
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
      router.refresh();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Could not remove pincode.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <form onSubmit={(event) => void saveSettings(event)} className="flex flex-col gap-5">
        <div>
          <Label htmlFor="address">Address</Label>
          <textarea id="address" className={areaClassName} value={address} onChange={(event) => setAddress(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="hours">Hours</Label>
          <Input id="hours" value={hours} onChange={(event) => setHours(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="phones">Phones (one per line)</Label>
          <textarea id="phones" className={areaClassName} value={phones} onChange={(event) => setPhones(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="mapUrl">Map embed URL (https only)</Label>
          <Input id="mapUrl" value={mapUrl} onChange={(event) => setMapUrl(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="announcement">Announcement bar</Label>
          <Input
            id="announcement"
            value={announcement}
            onChange={(event) => setAnnouncement(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="shippingLabel">Shipping label</Label>
          <Input
            id="shippingLabel"
            value={shippingLabel}
            onChange={(event) => setShippingLabel(event.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="shippingRupees">Flat shipping (₹)</Label>
          <Input
            id="shippingRupees"
            inputMode="decimal"
            value={shippingRupees}
            onChange={(event) => setShippingRupees(event.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {notice ? <p className="text-sm text-success">{notice}</p> : null}
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </form>

      <section>
        <h2 className="font-serif text-2xl">Serviceable pincodes</h2>
        <ul className="mt-4 divide-y divide-border/80">
          {pincodes.map((row) => (
            <li key={row.pincode} className="flex min-h-11 items-center justify-between py-2 text-sm">
              <span>
                {row.pincode}
                {row.estimatedDays ? ` · ${row.estimatedDays} days` : ""}
              </span>
              <button
                type="button"
                className="text-danger"
                disabled={pending}
                onClick={() => void removePincode(row.pincode)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={(event) => void addPincode(event)} className="mt-4 flex flex-wrap gap-3">
          <Input
            id="newPin"
            value={newPin}
            onChange={(event) => setNewPin(event.target.value)}
            placeholder="110001"
            className="max-w-[8rem]"
          />
          <Input
            id="days"
            value={days}
            onChange={(event) => setDays(event.target.value)}
            placeholder="Days"
            className="max-w-[6rem]"
          />
          <Button type="submit" variant="secondary" disabled={pending}>
            Add pin
          </Button>
        </form>
      </section>
    </div>
  );
}
