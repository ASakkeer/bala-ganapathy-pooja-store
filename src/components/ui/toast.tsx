"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "danger";

type ToastItem = {
  id: number;
  tone: ToastTone;
  message: string;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timers = useRef<Map<number, number>>(new Map());

  const push = useCallback((tone: ToastTone, message: string) => {
    const id = idRef.current + 1;
    idRef.current = id;
    setItems((current) => [...current.slice(-2), { id, tone, message }]);
    const previous = timers.current.get(id);
    if (previous) {
      window.clearTimeout(previous);
    }
    timers.current.set(
      id,
      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id));
        timers.current.delete(id);
      }, 4200),
    );
  }, []);

  const value = useMemo(
    () => ({
      success: (message: string) => push("success", message),
      error: (message: string) => push("danger", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[1700] flex flex-col items-center gap-2 px-4">
        {items.map((item) => (
          <p
            key={item.id}
            role={item.tone === "danger" ? "alert" : "status"}
            className={cn(
              "pointer-events-none max-w-md rounded-full px-4 py-2 text-sm text-on-brand shadow-[0_12px_30px_rgb(36_28_24_/_0.18)]",
              item.tone === "danger" ? "bg-danger" : "bg-success",
            )}
          >
            {item.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used inside ToastProvider.");
  }
  return value;
}
