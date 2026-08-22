import "server-only";

import { OAuth2Client } from "google-auth-library";
import { env } from "@/server/env";

export type GoogleProfile = {
  sub: string;
  email: string;
  name: string;
};

export function googleClientId() {
  return env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
}

export function isGoogleAuthConfigured() {
  return Boolean(googleClientId());
}

export async function verifyGoogleIdToken(credential: string): Promise<GoogleProfile> {
  const clientId = googleClientId();
  if (!clientId) {
    throw new Error("Google sign-in is not configured.");
  }

  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId,
  });
  const payload = ticket.getPayload();
  const sub = payload?.sub?.trim();
  const email = payload?.email?.trim().toLowerCase();
  const emailVerified = payload?.email_verified === true;
  const name = payload?.name?.trim() || payload?.given_name?.trim() || "";

  if (!sub || !email || !emailVerified) {
    throw new Error("Google did not return a verified email.");
  }

  return { sub, email, name: name.slice(0, 80) };
}
