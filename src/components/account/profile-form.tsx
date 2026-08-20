"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatAccountPhone } from "@/components/account/account-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginHref } from "@/lib/login-next";

export function ProfileForm({
  name,
  email,
  phone,
}: {
  name: string;
  email: string | null;
  phone: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState({
    name,
    email: email ?? "",
  });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) {
      return;
    }

    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          name: values.name,
          email: values.email,
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (response.status === 401) {
        router.push(loginHref("/account/profile"));
        return;
      }

      if (!response.ok) {
        setError(payload.error ?? "Could not save your profile.");
        setPending(false);
        return;
      }

      window.location.assign("/account/profile?saved=1");
    } catch {
      setError("Could not save your profile.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)}>
      <div className="px-5 sm:px-6">
        <label className="grid grid-cols-1 items-center gap-2 border-b border-border/70 py-3.5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6">
          <span className="text-sm text-muted">Full name</span>
          <Input
            id="profile-name"
            name="name"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            placeholder="Your name"
          />
        </label>
        <div className="grid grid-cols-1 items-baseline gap-1 border-b border-border/70 py-3.5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6">
          <span className="text-sm text-muted">Mobile number</span>
          <p className="text-sm font-medium sm:text-right">{formatAccountPhone(phone)}</p>
        </div>
        <label className="grid grid-cols-1 items-center gap-2 py-3.5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6">
          <span className="text-sm text-muted">Email</span>
          <Input
            id="profile-email"
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            autoComplete="email"
            inputMode="email"
            placeholder="Optional"
          />
        </label>
        <p className="pb-2 text-sm text-muted">The mobile number is used to sign in and cannot be changed here.</p>
        {error ? <p className="pb-3 text-sm text-danger">{error}</p> : null}
      </div>
      <div className="flex flex-col gap-3 border-t border-border/80 px-5 py-4 sm:flex-row sm:px-6">
        <Button type="submit" disabled={pending} className="w-full sm:min-w-40 sm:w-auto">
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          className="w-full sm:w-auto"
          onClick={() => router.push("/account/profile")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
