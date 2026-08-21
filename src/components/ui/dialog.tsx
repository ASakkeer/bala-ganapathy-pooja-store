"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function Dialog({
  open,
  title,
  description,
  children,
  pending = false,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  pending?: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const pendingRef = useRef(pending);
  onCloseRef.current = onClose;
  pendingRef.current = pending;

  useEffect(() => {
    if (!open) {
      return;
    }

    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      const focusable = panelRef.current?.querySelector<HTMLElement>("input, textarea, button");
      focusable?.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pendingRef.current) {
        event.preventDefault();
        onCloseRef.current();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus();
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Dismiss"
        className="absolute inset-0 bg-[#241c18]/40 backdrop-blur-[2px]"
        disabled={pending}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative w-full max-w-[28rem] overflow-hidden rounded-[1.25rem] bg-surface p-6 shadow-[0_24px_80px_rgb(36_28_24_/_0.22)] ring-1 ring-border/80 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-medium tracking-tight text-text">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            className="size-10 min-h-10 shrink-0 px-0"
            disabled={pending}
            aria-label="Close"
            onClick={onClose}
          >
            <Icon name="xmark" className="text-base" />
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
