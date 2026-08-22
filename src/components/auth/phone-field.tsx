"use client";

import { digitsOnlyPhoneInput, phoneInputError } from "@/lib/phone";

export function PhoneField({
  id = "phone",
  value,
  disabled,
  locked = false,
  error,
  onChange,
}: {
  id?: string;
  value: string;
  disabled?: boolean;
  locked?: boolean;
  error?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-text">
        Mobile number
      </label>
      <div className="flex h-14 items-center rounded-full bg-brand/[0.04] px-2 ring-1 ring-transparent focus-within:bg-surface focus-within:ring-2 focus-within:ring-brand/30">
        <span className="shrink-0 rounded-full bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand">+91</span>
        <input
          id={id}
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="10-digit number"
          value={value}
          disabled={disabled || locked}
          readOnly={locked}
          onChange={(event) => onChange?.(digitsOnlyPhoneInput(event.target.value))}
          required
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-base tracking-[0.08em] text-text outline-none placeholder:text-muted placeholder:tracking-normal disabled:opacity-70"
        />
      </div>
      {error ? <p className="px-1 text-sm text-danger">{error}</p> : null}
      {locked ? <p className="px-1 text-sm text-muted">This number cannot be changed here.</p> : null}
    </div>
  );
}

export { phoneInputError };
