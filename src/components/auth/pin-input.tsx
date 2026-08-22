"use client";

import { useEffect, useRef } from "react";
import { PIN_LENGTH } from "@/lib/pin";

function emptyPin() {
  return Array(PIN_LENGTH).fill("");
}

export function PinInput({
  id,
  digits,
  disabled,
  autoComplete = "off",
  onChange,
}: {
  id: string;
  digits: string[];
  disabled?: boolean;
  autoComplete?: string;
  onChange: (digits: string[]) => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const empty = digits.findIndex((digit) => !digit);
      const index = empty === -1 ? 0 : empty;
      refs.current[index]?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
    // Focus on mount / remount only. Parent remounts with `key` after a reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function focusAt(index: number) {
    const node = refs.current[index];
    node?.focus();
    node?.select();
  }

  function updateDigit(index: number, raw: string) {
    const nextDigit = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = nextDigit;
    onChange(next);

    if (nextDigit && index < PIN_LENGTH - 1) {
      focusAt(index + 1);
    }
  }

  function onKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Backspace") {
      return;
    }

    event.preventDefault();

    if (digits[index]) {
      const next = [...digits];
      next[index] = "";
      onChange(next);
      focusAt(index);
      return;
    }

    if (index > 0) {
      const next = [...digits];
      next[index - 1] = "";
      onChange(next);
      focusAt(index - 1);
    }
  }

  function onPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH);
    if (!pasted) {
      return;
    }

    const next = emptyPin();
    pasted.split("").forEach((digit, index) => {
      next[index] = digit;
    });
    onChange(next);
    focusAt(Math.min(pasted.length, PIN_LENGTH) - 1);
  }

  return (
    <div className="flex justify-center gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          id={index === 0 ? id : undefined}
          ref={(node) => {
            refs.current[index] = node;
          }}
          inputMode="numeric"
          autoComplete={index === 0 ? autoComplete : "off"}
          aria-label={`PIN digit ${index + 1} of ${PIN_LENGTH}`}
          value={digit}
          disabled={disabled}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          onFocus={(event) => event.currentTarget.select()}
          onPaste={index === 0 ? onPaste : undefined}
          className="size-14 shrink-0 rounded-2xl bg-brand/[0.04] text-center font-serif text-2xl tabular-nums text-text ring-1 ring-border/80 transition-shadow focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-70"
        />
      ))}
    </div>
  );
}
