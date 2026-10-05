export const DEFAULT_ADMIN_PIN = "8888";

export function getClientAdminPin(): string {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PIN;
  try {
    const stored = localStorage.getItem("shoot_suffer_admin_pin");
    return stored && stored.trim().length >= 4 ? stored.trim() : DEFAULT_ADMIN_PIN;
  } catch {
    return DEFAULT_ADMIN_PIN;
  }
}

export function setClientAdminPin(newPin: string): boolean {
  if (typeof window === "undefined") return false;
  if (!newPin || newPin.trim().length < 4) return false;
  try {
    localStorage.setItem("shoot_suffer_admin_pin", newPin.trim());
    return true;
  } catch {
    return false;
  }
}

export function isSessionAdminVerified(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem("shoot_suffer_admin_auth") === "true";
  } catch {
    return false;
  }
}

export function setSessionAdminVerified(verified: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (verified) {
      sessionStorage.setItem("shoot_suffer_admin_auth", "true");
    } else {
      sessionStorage.removeItem("shoot_suffer_admin_auth");
    }
  } catch {
    // Ignore
  }
}
