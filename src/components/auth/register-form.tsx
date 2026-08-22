"use client";

import Link from "next/link";
import { useState } from "react";
import { GoogleSignInButton, googleSignInEnabled } from "@/components/auth/google-sign-in-button";
import { PhoneField } from "@/components/auth/phone-field";
import { PinSetupStep } from "@/components/auth/pin-setup-step";
import { useActionProgress } from "@/components/progress/use-action-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { safeNextPath } from "@/lib/login-next";
import { normalizeIndianPhone, phoneInputError } from "@/lib/phone";

export function RegisterForm({
  nextPath,
  initialPhone,
  initialName,
  initialEmail,
  phoneLocked,
  emailLocked,
  startOnPin = false,
}: {
  nextPath: string;
  initialPhone: string;
  initialName: string;
  initialEmail: string;
  phoneLocked: boolean;
  emailLocked: boolean;
  startOnPin?: boolean;
}) {
  const progress = useActionProgress();
  const destination = safeNextPath(nextPath);
  const [phone, setPhone] = useState(initialPhone);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");
  const [step, setStep] = useState<"details" | "pin">(startOnPin ? "pin" : "details");
  const [pinError, setPinError] = useState("");

  function validate(): boolean {
    let ok = true;
    const nextPhoneError = phoneLocked ? "" : phoneInputError(phone);
    const trimmedName = name.trim();
    setPhoneError(nextPhoneError ?? "");
    if (!trimmedName || trimmedName.length < 2) {
      setNameError("Enter your name.");
      ok = false;
    } else {
      setNameError("");
    }
    if (nextPhoneError) {
      ok = false;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email, or leave it blank.");
      ok = false;
    }
    return ok;
  }

  async function saveDetails() {
    if (!validate() || pending || progress.pending) {
      return;
    }

    const normalized = normalizeIndianPhone(phone);
    if (!normalized) {
      setPhoneError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setPending(true);
    progress.begin();
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ phone: normalized, name: name.trim(), email: email.trim() }),
      });
      const payload = (await response.json()) as { error?: string; needsPinLogin?: boolean; phone?: string };

      if (!response.ok) {
        const message = payload.error ?? "Could not save your details.";
        setError(message);
        progress.fail(message);
        return;
      }

      if (payload.phone) {
        setPhone(payload.phone);
      }

      if (payload.needsPinLogin) {
        progress.succeed("This number already has a PIN.");
        window.location.assign(`/login?next=${encodeURIComponent(destination)}`);
        return;
      }

      progress.succeed("Now create your PIN.");
      setPinError("");
      setStep("pin");
    } catch {
      const message = "Could not save your details. Please try again.";
      setError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  async function savePin(pin: string, confirmPin: string) {
    if (pending || progress.pending) {
      return;
    }

    setPending(true);
    progress.begin();
    setPinError("");

    try {
      const response = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ pin, confirmPin }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Could not save your PIN.";
        setPinError(message);
        progress.fail(message);
        return;
      }

      progress.succeed("Account ready.", { keep: true });
      window.location.replace(destination);
    } catch {
      const message = "Could not save your PIN. Please try again.";
      setPinError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  async function submitGoogle(credential: string) {
    if (pending || progress.pending) {
      return;
    }

    setPending(true);
    progress.begin();
    setError("");

    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ credential }),
      });
      const payload = (await response.json()) as {
        error?: string;
        kind?: string;
      };

      if (!response.ok) {
        const message = payload.error ?? "Google sign-in failed.";
        setError(message);
        progress.fail(message);
        return;
      }

      if (payload.kind === "session") {
        progress.succeed("Signed in.", { keep: true });
        window.location.replace(destination);
        return;
      }

      if (payload.kind === "link-pin") {
        progress.succeed("Enter your PIN to finish.");
        window.location.assign(`/login?next=${encodeURIComponent(destination)}`);
        return;
      }

      window.location.reload();
    } catch {
      const message = "Google sign-in failed. Please try again.";
      setError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  if (step === "pin") {
    return (
      <PinSetupStep
        pending={pending}
        error={pinError}
        onBack={() => {
          setStep("details");
          setPinError("");
        }}
        onSubmit={(pin, confirmPin) => void savePin(pin, confirmPin)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-muted">Step 1 of 2</p>
        <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight">Create your account</h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Name is required. Email is optional. Next you will choose a 4-digit PIN to sign in.
        </p>
      </div>
      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          void saveDetails();
        }}
      >
        <PhoneField
          value={phone}
          locked={phoneLocked}
          disabled={pending}
          error={phoneError}
          onChange={(value) => {
            setPhone(value);
            setPhoneError("");
          }}
        />
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text">Full name</span>
          <Input
            id="register-name"
            name="name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setNameError("");
            }}
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            placeholder="Your name"
            error={nameError}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text">Email {emailLocked ? "" : "(optional)"}</span>
          <Input
            id="register-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            inputMode="email"
            placeholder="Optional"
            disabled={emailLocked}
            readOnly={emailLocked}
          />
        </label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" disabled={pending || progress.pending} className="h-12 w-full text-base">
          {pending ? "Please wait…" : "Continue"}
        </Button>
      </form>

      {googleSignInEnabled() && !emailLocked ? (
        <>
          <div className="flex items-center gap-3 text-xs tracking-[0.16em] uppercase text-muted">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <GoogleSignInButton disabled={pending} onCredential={(credential) => void submitGoogle(credential)} />
        </>
      ) : null}

      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(destination)}`} className="text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
