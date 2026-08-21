"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";

export function FieldTip({ text }: { text: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex shrink-0">
      <button
        type="button"
        className="inline-flex size-6 items-center justify-center rounded-full text-muted hover:bg-brand/5 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        aria-label="What to enter here"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        <Icon name="circle-info" className="text-[0.85rem]" />
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="absolute left-0 top-[calc(100%+0.35rem)] z-40 w-60 rounded-[3px] bg-[#241c18] px-3 py-2 text-left text-xs font-normal leading-relaxed text-surface shadow-[0_12px_32px_rgb(36_28_24_/_0.22)]"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

export function FieldLabel({
  htmlFor,
  children,
  tip,
}: {
  htmlFor: string;
  children: React.ReactNode;
  tip: string;
}) {
  return (
    <div className="mb-1.5 flex items-center gap-1">
      <Label htmlFor={htmlFor} className="mb-0">
        {children}
      </Label>
      <FieldTip text={tip} />
    </div>
  );
}
