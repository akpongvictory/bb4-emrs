import type { CookieOptions, Response } from "express";
import { env } from "../../config/env";

export const SESSION_COOKIE = "bb4_session";

function baseOptions(): CookieOptions {
  return { httpOnly: true, secure: env.isProduction, sameSite: "lax", path: "/" };
}

export function setSessionCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(SESSION_COOKIE, token, { ...baseOptions(), expires: expiresAt });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, baseOptions());
}