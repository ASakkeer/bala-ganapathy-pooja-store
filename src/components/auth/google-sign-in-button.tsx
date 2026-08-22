"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function GoogleSignInButton({
  disabled,
  onCredential,
}: {
  disabled?: boolean;
  onCredential: (credential: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    function render() {
      const node = containerRef.current;
      if (!node || !window.google?.accounts.id) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) {
            callbackRef.current(response.credential);
          }
        },
      });
      node.innerHTML = "";
      window.google.accounts.id.renderButton(node, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: Math.min(Math.max(node.offsetWidth, 240), 400),
      });
    }

    if (window.google?.accounts.id) {
      render();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-google-gsi]");
    if (existing) {
      existing.addEventListener("load", render);
      return () => existing.removeEventListener("load", render);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleGsi = "true";
    script.addEventListener("load", render);
    document.head.appendChild(script);
    return () => script.removeEventListener("load", render);
  }, []);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div className={disabled ? "pointer-events-none opacity-50" : undefined}>
      <div ref={containerRef} className="flex min-h-11 justify-center overflow-hidden" />
    </div>
  );
}

export function googleSignInEnabled() {
  return Boolean(GOOGLE_CLIENT_ID);
}
