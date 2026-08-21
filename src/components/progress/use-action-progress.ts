"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTopLoader } from "nextjs-toploader";
import { useToast } from "@/components/ui/toast";

/**
 * Shared async-action progress: disable the control first, then start the bar.
 * Call fail() on errors so the bar clears and a toast appears.
 * Call succeed({ keep: true }) when navigating away so the bar stays until unload.
 */
export function useActionProgress() {
  const loader = useTopLoader();
  const toast = useToast();
  const loaderRef = useRef(loader);
  const toastRef = useRef(toast);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    loaderRef.current = loader;
    toastRef.current = toast;
  }, [loader, toast]);

  const begin = useCallback(() => {
    setPending(true);
    loaderRef.current.start();
  }, []);

  const succeed = useCallback((message?: string, options?: { keep?: boolean }) => {
    if (message) {
      toastRef.current.success(message);
    }
    if (options?.keep) {
      return;
    }
    loaderRef.current.done(true);
    setPending(false);
  }, []);

  const fail = useCallback((message: string) => {
    loaderRef.current.done(true);
    setPending(false);
    toastRef.current.error(message);
  }, []);

  return { pending, begin, succeed, fail };
}
