"use client";

import { useState } from "react";
import { GoogleSignInButton, submitGoogleCredential } from "@/components/auth/google-sign-in-button";
import { useActionProgress } from "@/components/progress/use-action-progress";
import { safeNextPath } from "@/lib/login-next";

export function LoginGoogleSection({ nextPath }: { nextPath: string }) {
  const progress = useActionProgress();
  const destination = safeNextPath(nextPath);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submitGoogle(credential: string) {
    if (pending || progress.pending) {
      return;
    }

    setPending(true);
    progress.begin();
    setError("");

    try {
      const payload = await submitGoogleCredential(credential);

      if (payload.kind === "session") {
        progress.succeed("Signed in.", { keep: true });
        window.location.replace(destination);
        return;
      }

      progress.succeed("Add your mobile number to finish.");
      window.location.assign(`/register?next=${encodeURIComponent(destination)}`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Google sign-in failed. Please try again.";
      setError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-xs tracking-[0.16em] uppercase text-muted">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleSignInButton
        disabled={pending}
        onCredential={(credential) => void submitGoogle(credential)}
        onError={setError}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
