"use client";

import Link from "next/link";
import { useState } from "react";
import { PhoneField } from "@/components/auth/phone-field";
import { useActionProgress } from "@/components/progress/use-action-progress";
import { Button } from "@/components/ui/button";
import { safeNextPath } from "@/lib/login-next";
import { normalizeIndianPhone, phoneInputError } from "@/lib/phone";

export function ForgotPinForm({ nextPath }: { nextPath: string }) {
  const progress = useActionProgress();
  const destination = safeNextPath(nextPath);
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [result, setResult] = useState<{ exists: boolean; hasGoogle: boolean; emailMasked: string | null } | null>(
    null,
  );

  async function lookup() {
    const clientError = phoneInputError(phone);
    if (clientError) {
      setFieldError(clientError);
      return;
    }

    const normalized = normalizeIndianPhone(phone);
    if (!normalized) {
      setFieldError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (pending || progress.pending) {
      return;
    }

    setPending(true);
    progress.begin();
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ phone: normalized }),
      });
      const payload = (await response.json()) as {
        error?: string;
        exists?: boolean;
        hasGoogle?: boolean;
        emailMasked?: string | null;
      };

      if (!response.ok) {
        const message = payload.error ?? "Could not look up that number.";
        setError(message);
        progress.fail(message);
        return;
      }

      setPhone(normalized);
      setResult({
        exists: Boolean(payload.exists),
        hasGoogle: Boolean(payload.hasGoogle),
        emailMasked: payload.emailMasked ?? null,
      });
      progress.succeed("Check the options below.");
    } catch {
      const message = "Could not look up that number. Please try again.";
      setError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void lookup();
      }}
    >
      <PhoneField
        value={phone}
        disabled={pending}
        error={fieldError}
        onChange={(value) => {
          setPhone(value);
          setFieldError("");
          setResult(null);
        }}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={pending || progress.pending || phone.length !== 10} className="h-12 w-full text-base">
        {pending ? "Please wait…" : "Continue"}
      </Button>

      {result ? (
        <div className="rounded-2xl bg-brand/[0.05] px-4 py-4 text-sm leading-relaxed text-muted">
          {result.exists ? (
            <>
              <p>We cannot send an SMS reset. Call the shop with this number and they can help you set a new PIN.</p>
              {result.emailMasked ? <p className="mt-2">This account has email {result.emailMasked} on file.</p> : null}
              {result.hasGoogle ? (
                <p className="mt-2">
                  This number is linked to Google.{" "}
                  <Link href={`/login?next=${encodeURIComponent(destination)}`} className="text-brand hover:underline">
                    Sign in with Google
                  </Link>
                  .
                </p>
              ) : null}
            </>
          ) : (
            <p>
              No account for this number.{" "}
              <Link href={`/login?next=${encodeURIComponent(destination)}`} className="text-brand hover:underline">
                Create one from sign in
              </Link>
              .
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-muted">
          PIN reset is done by the shop, not by SMS. If you linked Google, you can also sign in that way.
        </p>
      )}

      <p className="text-sm text-muted">
        Remembered it?{" "}
        <Link href={`/login?next=${encodeURIComponent(destination)}`} className="text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
