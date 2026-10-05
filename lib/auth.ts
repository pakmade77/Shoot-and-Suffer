export const DEFAULT_ADMIN_PIN = "8888";

export function getClientAdminPin(): string {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PIN;
  const stored = localStorage.getItem("shoot_suffer_admin_pin");
  return stored && stored.trim().length >= 4 ? stored.trim() : DEFAULT_ADMIN_PIN;
}

export function setClientAdminPin(newPin: string): boolean {
  if (typeof window === "undefined") return false;
  if (!newPin || newPin.trim().length < 4) return false;
  localStorage.setItem("shoot_suffer_admin_pin", newPin.trim());
  return true;
}

export function isSessionAdminVerified(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("shoot_suffer_admin_auth") === "true";
}

export function setSessionAdminVerified(verified: boolean): void {
  if (typeof window === "undefined") return;
  if (verified) {
    sessionStorage.setItem("shoot_suffer_admin_auth", "true");
  } else {
    sessionStorage.removeItem("shoot_suffer_admin_auth");
  }
}
