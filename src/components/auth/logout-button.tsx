"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { useActionProgress } from "@/components/progress/use-action-progress";

export function LogoutButton({
  className,
  variant = "secondary",
}: {
  className?: string;
  variant?: ButtonProps["variant"];
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const progress = useActionProgress();

  async function logout() {
    setPending(true);
    progress.begin();
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      progress.succeed("Signed out.", { keep: true });
      window.location.replace("/");
    } catch {
      progress.fail("Could not sign out. Please try again.");
      setPending(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        className={className}
        disabled={pending || progress.pending}
        onClick={() => setOpen(true)}
      >
        {pending ? "Signing out…" : (
          <>
            <Icon name="right-from-bracket" className="text-sm" />
            Sign out
          </>
        )}
      </Button>
      <ConfirmDialog
        open={open}
        title="Sign out?"
        description="You'll need your mobile number and PIN to sign in again. Your cart stays on this device after you return."
        confirmLabel="Sign out"
        tone="brand"
        pending={pending || progress.pending}
        onCancel={() => {
          if (!pending) {
            setOpen(false);
          }
        }}
        onConfirm={() => void logout()}
      />
    </>
  );
}
