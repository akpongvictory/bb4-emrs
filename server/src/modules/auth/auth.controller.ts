import type { Request, Response } from "express";
import { getAuth } from "../../middleware/authenticate";
import { clearSessionCookie, SESSION_COOKIE, setSessionCookie } from "./auth.cookies";
import { loginSchema, selectFacilitySchema } from "./auth.schemas";
import { getSessionInfo, login, logout, selectFacility } from "./auth.service";
import { readSessionToken } from "./auth.tokens";

export async function loginController(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body);
  const result = await login(input);
  setSessionCookie(res, result.token, result.expiresAt);
  res.json({ data: result.info });
}

export async function meController(req: Request, res: Response): Promise<void> {
  res.json({ data: await getSessionInfo(getAuth(req)) });
}

export async function selectFacilityController(req: Request, res: Response): Promise<void> {
  const { facilityId } = selectFacilitySchema.parse(req.body);
  res.json({ data: await selectFacility(getAuth(req), facilityId) });
}

export async function logoutController(req: Request, res: Response): Promise<void> {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  const sessionId = typeof token === "string" ? readSessionToken(token) : null;
  if (sessionId) {
    await logout(sessionId);
  }
  clearSessionCookie(res);
  res.json({ data: { loggedOut: true } });
}