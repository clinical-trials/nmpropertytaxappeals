import { NextRequest } from "next/server";

/**
 * Best-effort client IP from proxy headers. Recorded for the engagement audit
 * trail alongside the provider's own certificate-of-completion IP.
 */
export function getClientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    null
  );
}
