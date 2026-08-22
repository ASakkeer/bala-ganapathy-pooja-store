export function safeNextPath(raw?: string | null) {
  if (
    !raw ||
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    raw.startsWith("/login") ||
    raw.startsWith("/register")
  ) {
    return "/shop";
  }

  return raw;
}

export function loginHref(nextPath: string) {
  return `/login?next=${encodeURIComponent(safeNextPath(nextPath))}`;
}

export function returnCopy(nextPath: string) {
  if (nextPath.startsWith("/p/")) {
    return "You'll come back to this product after signing in.";
  }

  if (nextPath.startsWith("/cart")) {
    return "You'll open your cart after signing in.";
  }

  if (nextPath.startsWith("/checkout")) {
    return "You'll continue to checkout after signing in.";
  }

  if (nextPath.startsWith("/account")) {
    return "You'll open your account after signing in.";
  }

  return "You'll return to where you left off after signing in.";
}
