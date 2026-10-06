export const DEFAULT_ADMIN_PIN = "8989";

export function getClientAdminPin(): string {
  return DEFAULT_ADMIN_PIN;
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
