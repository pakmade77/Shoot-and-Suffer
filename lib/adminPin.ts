import type { NextRequest } from "next/server";

// Server-side admin PIN. Never rendered in the UI.
const ADMIN_PIN = "8989";

/**
 * Returns true only when the PIN supplied in the request body or the
 * `x-admin-pin` header exactly matches the admin PIN.
 */
export function verifyAdminPin(req: NextRequest, bodyPin?: string): boolean {
  const provided = (bodyPin || req.headers.get("x-admin-pin") || "").trim();
  return provided === ADMIN_PIN;
}
