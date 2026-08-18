const KEY = "bgps.pending-cart";

export type PendingCartAction = {
  variantId: string;
  qty: number;
  redirectTo?: string;
};

export function savePendingCartAction(action: PendingCartAction) {
  sessionStorage.setItem(KEY, JSON.stringify(action));
}

export function readPendingCartAction(): PendingCartAction | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PendingCartAction;
    if (!parsed.variantId || typeof parsed.qty !== "number" || parsed.qty < 1) {
      sessionStorage.removeItem(KEY);
      return null;
    }

    return parsed;
  } catch {
    sessionStorage.removeItem(KEY);
    return null;
  }
}

export function clearPendingCartAction() {
  sessionStorage.removeItem(KEY);
}
