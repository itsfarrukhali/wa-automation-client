// src/lib/session-cookie.ts
/**
 * Lightweight, non-httpOnly cookie used ONLY as a UX hint for proxy.ts.
 * It carries no secret and is never trusted for authorization — it just lets
 * proxy.ts make a fast redirect decision without calling the backend.
 * Real auth is always re-verified client-side (GET /auth/me) and enforced
 * server-side by the backend's verifyToken/requireVerifiedEmail middleware.
 */
const HINT_COOKIE = "zario_session_hint";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days, matches refresh token lifetime

export function setSessionHint(isEmailVerified: boolean) {
  const value = isEmailVerified ? "verified" : "unverified";
  document.cookie = `${HINT_COOKIE}=${value}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearSessionHint() {
  document.cookie = `${HINT_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export const SESSION_HINT_COOKIE_NAME = HINT_COOKIE;
