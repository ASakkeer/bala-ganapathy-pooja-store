"use client";

import { useEffect, useRef, useState } from "react";
import { buttonClassName } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            ux_mode?: string;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (callback?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            isDismissedMoment: () => boolean;
            getNotDisplayedReason?: () => string;
          }) => void) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export type GoogleAuthKind = "session" | "register";

export async function submitGoogleCredential(credential: string) {
  const response = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ credential }),
  });
  const payload = (await response.json()) as {
    error?: string;
    kind?: GoogleAuthKind;
    phone?: string;
    name?: string;
    email?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Google sign-in failed.");
  }

  return payload;
}

function loadGoogleScript() {
  const existing = document.querySelector<HTMLScriptElement>("script[data-google-gsi]");
  if (existing) {
    return existing;
  }

  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.dataset.googleGsi = "true";
  document.head.appendChild(script);
  return script;
}

export function GoogleSignInButton({
  disabled,
  onCredential,
  onError,
  label = "Continue with Google",
}: {
  disabled?: boolean;
  onCredential: (credential: string) => void;
  onError?: (message: string) => void;
  label?: string;
}) {
  const callbackRef = useRef(onCredential);
  const errorRef = useRef(onError);
  callbackRef.current = onCredential;
  errorRef.current = onError;
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    function init() {
      if (!window.google?.accounts.id) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        ux_mode: "popup",
        auto_select: false,
        cancel_on_tap_outside: true,
        callback: (response) => {
          if (response.credential) {
            callbackRef.current(response.credential);
          }
        },
      });
      setScriptReady(true);
    }

    const script = loadGoogleScript();
    if (window.google?.accounts.id) {
      init();
      return;
    }

    script.addEventListener("load", init);
    return () => script.removeEventListener("load", init);
  }, []);

  function handleClick() {
    if (disabled) {
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      errorRef.current?.(
        "Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local and restart the app.",
      );
      return;
    }

    if (!scriptReady || !window.google?.accounts.id) {
      errorRef.current?.("Google is still loading. Try again in a moment.");
      return;
    }

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        errorRef.current?.(
          "Google did not open the account picker. Allow popups for this site, then try again.",
        );
      }
    });
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={buttonClassName("secondary", "h-12 w-full text-base")}
    >
      <Icon name="google" kit="brands" className="text-lg text-[#4285F4]" />
      {label}
    </button>
  );
}

export function googleSignInEnabled() {
  return Boolean(GOOGLE_CLIENT_ID);
}
