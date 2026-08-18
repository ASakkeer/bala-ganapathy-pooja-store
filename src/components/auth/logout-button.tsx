"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    window.location.replace("/");
  }

  return (
    <Button type="button" variant="secondary" disabled={pending} onClick={() => void logout()}>
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
