import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "internal_portal_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

type Session = {
  email: string;
  expiresAt: number;
};

function secret() {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) throw new Error("SESSION_SECRET is required.");
  return sessionSecret;
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function validateCredentials(email: string, password: string) {
  const expectedEmail = process.env.PORTAL_DEMO_EMAIL ?? "team@acme.test";
  const expectedPassword = process.env.PORTAL_DEMO_PASSWORD ?? "welcome123";
  return email.trim().toLowerCase() === expectedEmail.toLowerCase() && password === expectedPassword;
}

export function createSessionToken(email: string) {
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ email, expiresAt })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function readSessionToken(token?: string): Session | null {
  if (!token) return null;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return null;

  const expectedSignature = signature(payload);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;
    return typeof session.email === "string" && typeof session.expiresAt === "number" && session.expiresAt > Date.now()
      ? session
      : null;
  } catch {
    return null;
  }
}

export async function currentUser() {
  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
