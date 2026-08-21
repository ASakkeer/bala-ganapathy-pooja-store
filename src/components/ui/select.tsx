"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function Select({
  id,
  value,
  onChange,
  options,
  disabled,
  required,
  placeholder = "Choose",
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-required={required || undefined}
        className={cn(
          "relative flex h-11 w-full items-center rounded-full bg-brand/[0.04] py-2 pl-4 pr-11 text-left text-text",
          "focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !selected && "text-muted/40",
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 flex-1 truncate">{selected?.label ?? placeholder}</span>
        <Icon name="chevron-down" className="pointer-events-none absolute right-3.5 text-[0.75rem] text-muted" />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-40 mt-2 max-h-60 w-full overflow-auto rounded-home bg-surface-container-lowest py-1 shadow-[0_12px_32px_rgb(36_28_24_/_0.16)] ring-1 ring-border/80"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={option.disabled}
                  className={cn(
                    "flex min-h-11 w-full items-center px-4 text-left text-sm text-text",
                    "hover:bg-brand/5 focus-visible:bg-brand/5 focus-visible:outline-none",
                    active && "bg-brand/[0.08] font-medium text-brand",
                    option.disabled && "cursor-not-allowed text-muted/50",
                  )}
                  onClick={() => {
                    if (option.disabled) {
                      return;
                    }
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
