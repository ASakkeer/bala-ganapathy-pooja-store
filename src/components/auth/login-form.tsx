"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { safeNextPath } from "@/lib/login-next";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export function LoginForm({
  nextPath,
  showDevHint,
}: {
  nextPath: string;
  showDevHint: boolean;
}) {
  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join("");
  const phoneReady = phone.length === 10;

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (sent) {
      otpRefs.current[0]?.focus();
    }
  }, [sent]);

  async function sendCode() {
    if (!phoneReady || pending) {
      return;
    }

    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ phone }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Could not send the code.");
        return;
      }

      setSent(true);
      setDigits(Array(OTP_LENGTH).fill(""));
      setCooldown(RESEND_SECONDS);
    } catch {
      setError("Could not send the code.");
    } finally {
      setPending(false);
    }
  }

  async function verifyCode(value = code) {
    if (value.length !== OTP_LENGTH || pending) {
      return;
    }

    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ phone, code: value }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Could not verify the code.");
        setDigits(Array(OTP_LENGTH).fill(""));
        otpRefs.current[0]?.focus();
        return;
      }

      window.location.replace(safeNextPath(nextPath));
      return;
    } catch {
      setError("Could not verify the code.");
    } finally {
      if (document.visibilityState !== "hidden") {
        setPending(false);
      }
    }
  }

  function updateDigit(index: number, raw: string) {
    const nextDigit = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = nextDigit;
    setDigits(next);

    if (nextDigit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }

    const joined = next.join("");
    if (joined.length === OTP_LENGTH) {
      void verifyCode(joined);
    }
  }

  function onOtpKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function onOtpPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) {
      return;
    }

    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((digit, index) => {
      next[index] = digit;
    });
    setDigits(next);

    if (pasted.length === OTP_LENGTH) {
      void verifyCode(pasted);
    } else {
      otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    }
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (sent) {
          void verifyCode();
        } else {
          void sendCode();
        }
      }}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="text-sm font-medium text-text">
          Mobile number
        </label>
        <div className="flex h-14 items-center rounded-full bg-brand/[0.04] px-2 ring-1 ring-transparent focus-within:bg-surface focus-within:ring-2 focus-within:ring-brand/30">
          <span className="shrink-0 rounded-full bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand">
            +91
          </span>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="10-digit number"
            value={phone}
            disabled={sent}
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
            required
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-base tracking-[0.08em] text-text outline-none placeholder:text-muted placeholder:tracking-normal disabled:opacity-70"
          />
        </div>
      </div>

      {sent ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-3">
            <label htmlFor="otp-0" className="text-sm font-medium text-text">
              One-time code
            </label>
            <button
              type="button"
              className="text-sm text-brand hover:underline"
              onClick={() => {
                setSent(false);
                setDigits(Array(OTP_LENGTH).fill(""));
                setError("");
              }}
            >
              Change number
            </button>
          </div>
          <p className="text-sm text-muted">
            Enter the 6-digit code sent to +91 {phone.slice(0, 5)} {phone.slice(5)}.
          </p>
          <div className="flex justify-between gap-2">
            {digits.map((digit, index) => (
              <input
                key={index}
                id={index === 0 ? "otp-0" : undefined}
                ref={(node) => {
                  otpRefs.current[index] = node;
                }}
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                value={digit}
                onChange={(event) => updateDigit(index, event.target.value)}
                onKeyDown={(event) => onOtpKeyDown(index, event)}
                onPaste={index === 0 ? onOtpPaste : undefined}
                className="h-14 w-full max-w-12 rounded-2xl bg-brand/[0.04] text-center font-serif text-2xl text-text ring-1 ring-border/80 transition-shadow focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              />
            ))}
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" disabled={pending || (!sent && !phoneReady) || (sent && code.length !== OTP_LENGTH)} className="h-12 w-full text-base">
        {pending ? "Please wait…" : sent ? "Verify and continue" : "Send one-time code"}
      </Button>

      {sent ? (
        <button
          type="button"
          className="text-sm text-muted hover:text-brand disabled:opacity-50"
          disabled={pending || cooldown > 0}
          onClick={() => void sendCode()}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      ) : (
        <p className="text-sm leading-relaxed text-muted">
          No password. We only use your number to protect your cart and orders.
        </p>
      )}

      {showDevHint && sent ? (
        <p className="rounded-2xl bg-brand/[0.05] px-4 py-3 text-sm leading-relaxed text-muted">
          In local development the code is printed in the server terminal, not on this screen.
        </p>
      ) : null}
    </form>
  );
}
