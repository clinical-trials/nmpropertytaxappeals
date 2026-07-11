// Minimal single-operator auth for the v1 back office: one shared password
// (OPERATOR_PASSWORD) exchanged for a short-lived signed session cookie.
// A real multi-user system with per-operator accounts is a later slice.

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "nmta_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12h

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET is missing or too short (set it in .env).");
  }
  return new TextEncoder().encode(secret);
}

export function checkPassword(password: string): boolean {
  const expected = process.env.OPERATOR_PASSWORD ?? "";
  // constant-ish comparison; fine for a single shared secret
  if (!expected) return false;
  return password === expected;
}

export async function createSession(): Promise<void> {
  const token = await new SignJWT({ role: "operator" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}
