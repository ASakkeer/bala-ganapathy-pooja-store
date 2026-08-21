"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { CATEGORIES } from "@/lib/constants";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="relative z-50 inline-flex size-11 items-center justify-center text-primary hover:text-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        {open ? <Icon name="xmark" className="text-[1.2rem]" /> : <Icon name="bars" className="text-[1.2rem]" />}
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-text/20"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-8rem)] overflow-y-auto border-b border-outline-variant bg-surface"
          >
            <nav aria-label="Product categories" className="flex flex-col px-4 py-6 sm:px-6">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  href={`/c/${category.slug}`}
                  className="flex min-h-12 items-center font-serif text-xl text-text"
                  onClick={() => setOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link
                href="/shop"
                className="flex min-h-12 items-center font-serif text-xl text-text"
                onClick={() => setOpen(false)}
              >
                All products
              </Link>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
