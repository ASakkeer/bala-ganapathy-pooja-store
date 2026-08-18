"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginHref } from "@/lib/login-next";

export function AddressForm({
  initialPhone,
  nextPath,
}: {
  initialPhone?: string;
  nextPath?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [pincodeNote, setPincodeNote] = useState("");
  const [pincodeOk, setPincodeOk] = useState<boolean | null>(null);
  const [values, setValues] = useState({
    name: "",
    phone: initialPhone ?? "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  function setField(name: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function checkPincode(pincode: string) {
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeOk(null);
      setPincodeNote("");
      return;
    }

    const response = await fetch(`/api/pincode?pincode=${pincode}`, { cache: "no-store" });
    const payload = (await response.json()) as { serviceable?: boolean; message?: string };
    setPincodeOk(Boolean(payload.serviceable));
    setPincodeNote(payload.message ?? "");
  }

  async function submit() {
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          ...values,
          line2: values.line2.trim() || undefined,
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (response.status === 401) {
        router.push(loginHref(nextPath ?? "/account/addresses"));
        return;
      }

      if (!response.ok) {
        setError(payload.error ?? "Could not save the address.");
        return;
      }

      setValues({
        name: "",
        phone: initialPhone ?? "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
      });
      setPincodeOk(null);
      setPincodeNote("");

      if (nextPath) {
        window.location.assign(nextPath);
        return;
      }

      router.refresh();
    } catch {
      setError("Could not save the address.");
    } finally {
      setPending(false);
    }
  }

  const canSubmit =
    values.name.trim().length >= 2 &&
    values.phone.trim().length >= 10 &&
    values.line1.trim().length >= 3 &&
    values.city.trim().length >= 2 &&
    values.state.trim().length >= 2 &&
    /^\d{6}$/.test(values.pincode) &&
    pincodeOk === true &&
    !pending;

  return (
    <form
      className="flex w-full max-w-xl flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div>
        <Label htmlFor="address-name">Name</Label>
        <Input
          id="address-name"
          value={values.name}
          onChange={(event) => setField("name", event.target.value)}
          autoComplete="name"
          required
        />
      </div>
      <div>
        <Label htmlFor="address-phone">Mobile number</Label>
        <Input
          id="address-phone"
          value={values.phone}
          onChange={(event) => setField("phone", event.target.value)}
          inputMode="numeric"
          autoComplete="tel"
          required
        />
      </div>
      <div>
        <Label htmlFor="address-line1">Address line 1</Label>
        <Input
          id="address-line1"
          value={values.line1}
          onChange={(event) => setField("line1", event.target.value)}
          autoComplete="address-line1"
          required
        />
      </div>
      <div>
        <Label htmlFor="address-line2">Address line 2</Label>
        <Input
          id="address-line2"
          value={values.line2}
          onChange={(event) => setField("line2", event.target.value)}
          autoComplete="address-line2"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="address-city">City</Label>
          <Input
            id="address-city"
            value={values.city}
            onChange={(event) => setField("city", event.target.value)}
            autoComplete="address-level2"
            required
          />
        </div>
        <div>
          <Label htmlFor="address-state">State</Label>
          <Input
            id="address-state"
            value={values.state}
            onChange={(event) => setField("state", event.target.value)}
            autoComplete="address-level1"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="address-pincode">Pincode</Label>
        <Input
          id="address-pincode"
          value={values.pincode}
          onChange={(event) => {
            const next = event.target.value.replace(/\D/g, "").slice(0, 6);
            setField("pincode", next);
            if (next.length === 6) {
              void checkPincode(next);
            } else {
              setPincodeOk(null);
              setPincodeNote("");
            }
          }}
          inputMode="numeric"
          autoComplete="postal-code"
          aria-describedby={pincodeNote ? "pincode-note" : undefined}
          required
        />
        {pincodeNote ? (
          <p id="pincode-note" className={`mt-2 text-sm ${pincodeOk ? "text-success" : "text-danger"}`}>
            {pincodeNote}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">
            Demo coverage: 110001, 400001, 560001. Delivery dates are confirmed after payment.
          </p>
        )}
      </div>
      {error ? (
        <p id="address-error" role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={!canSubmit}>
        {pending ? "Saving…" : "Save address"}
      </Button>
    </form>
  );
}
