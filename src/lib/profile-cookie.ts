export const PROFILE_COOKIE = "bgps_profile";

export const PLACEHOLDER_PROFILE_NAME = "Customer";

export type StoredProfile = {
  userId: string;
  name: string;
  email: string | null;
};

export function isPlaceholderProfileName(name: string) {
  return !name.trim() || name.trim() === PLACEHOLDER_PROFILE_NAME;
}

export function encodeProfileCookie(profile: StoredProfile) {
  return encodeURIComponent(JSON.stringify(profile));
}

export function decodeProfileCookie(raw: string | undefined): StoredProfile | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as StoredProfile;
    if (parsed?.userId && typeof parsed.name === "string") {
      return {
        userId: parsed.userId,
        name: parsed.name,
        email: parsed.email ?? null,
      };
    }
  } catch {
    try {
      const parsed = JSON.parse(raw) as StoredProfile;
      if (parsed?.userId && typeof parsed.name === "string") {
        return parsed;
      }
    } catch {
      return null;
    }
  }

  return null;
}
