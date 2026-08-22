"use client";

import Link from "next/link";
import { useState } from "react";
import { PhoneField } from "@/components/auth/phone-field";
import { PinInput } from "@/components/auth/pin-input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useActionProgress } from "@/components/progress/use-action-progress";
import { safeNextPath } from "@/lib/login-next";
import { normalizeIndianPhone, phoneInputError } from "@/lib/phone";
import { PIN_LENGTH } from "@/lib/pin";

type Step = "phone" | "pin";

export function LoginForm({
  nextPath,
  initialPhone = "",
  initialStep = "phone",
}: {
  nextPath: string;
  initialPhone?: string;
  initialStep?: Step;
}) {
  const progress = useActionProgress();
  const [step, setStep] = useState<Step>(initialStep);
  const [phone, setPhone] = useState(initialPhone);
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");

  const pinValue = pin.join("");
  const destination = safeNextPath(nextPath);

  function finish(path = destination) {
    progress.succeed("Signed in.", { keep: true });
    window.location.replace(path);
  }

  async function lookupNumber() {
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
    setFieldError("");

    try {
      const response = await fetch("/api/auth/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ phone: normalized }),
      });
      const payload = (await response.json()) as {
        error?: string;
        exists?: boolean;
        hasPin?: boolean;
        phone?: string;
      };

      if (!response.ok) {
        const message = payload.error ?? "Could not check that number.";
        setError(message);
        progress.fail(message);
        return;
      }

      const confirmed = payload.phone ?? normalized;
      setPhone(confirmed);

      if (payload.exists && payload.hasPin) {
        setStep("pin");
        setPin(Array(PIN_LENGTH).fill(""));
        progress.succeed("Enter your PIN.");
        return;
      }

      progress.succeed(
        payload.exists ? "This number has no PIN yet. Create one to continue." : "New number. Create your account.",
      );
      window.location.assign(`/register?next=${encodeURIComponent(destination)}`);
    } catch {
      const message = "Could not check that number. Please try again.";
      setError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  async function submitPin(value = pinValue) {
    if (value.length !== PIN_LENGTH || pending || progress.pending) {
      return;
    }

    setPending(true);
    progress.begin();
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ phone, pin: value }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        const message = payload.error ?? "That PIN did not match.";
        setError(message);
        progress.fail(message);
        setPin(Array(PIN_LENGTH).fill(""));
        return;
      }

      finish();
    } catch {
      const message = "Could not sign in. Please try again.";
      setError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (step === "pin") {
            void submitPin();
          } else {
            void lookupNumber();
          }
        }}
      >
        {step === "phone" ? (
          <PhoneField
            value={phone}
            disabled={pending}
            error={fieldError}
            onChange={(value) => {
              setPhone(value);
              setFieldError("");
              setError("");
            }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-3">
              <label htmlFor="login-pin" className="text-sm font-medium text-text">
                4-digit PIN
              </label>
              <button
                type="button"
                className="text-sm text-brand hover:underline"
                onClick={() => {
                  setStep("phone");
                  setPin(Array(PIN_LENGTH).fill(""));
                  setError("");
                }}
              >
                Change number
              </button>
            </div>
            <p className="text-sm text-muted">Enter the PIN for +91 {phone.slice(0, 5)} {phone.slice(5)}.</p>
            <PinInput
              id="login-pin"
              digits={pin}
              disabled={pending}
              autoComplete="current-password"
              onChange={(next) => {
                setPin(next);
                const joined = next.join("");
                if (joined.length === PIN_LENGTH) {
                  void submitPin(joined);
                }
              }}
            />
            <Link href={`/login/forgot?next=${encodeURIComponent(destination)}`} className="text-sm text-brand hover:underline">
              Forgot PIN?
            </Link>
          </div>
        )}

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button
          type="submit"
          disabled={pending || progress.pending || (step === "phone" && phone.length !== 10) || (step === "pin" && pinValue.length !== PIN_LENGTH)}
          className="h-12 w-full text-base"
        >
          {pending ? "Please wait…" : step === "pin" ? (
            <>
              <Icon name="lock" className="text-sm" />
              Sign in
            </>
          ) : (
            <>
              <Icon name="arrow-right" className="text-sm" />
              Continue
            </>
          )}
        </Button>
      </form>

      {step === "phone" ? (
        <p className="text-sm leading-relaxed text-muted">
          New here? Enter your number — we&apos;ll open registration if it is not on file.{" "}
          <Link href={`/login/forgot?next=${encodeURIComponent(destination)}`} className="text-brand hover:underline">
            Forgot PIN?
          </Link>
        </p>
      ) : null}
    </div>
  );
}
