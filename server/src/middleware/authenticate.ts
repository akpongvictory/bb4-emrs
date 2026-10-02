import type { NextFunction, Request, Response } from "express";
import { SESSION_COOKIE } from "../modules/auth/auth.cookies";
import { loadAuthContext } from "../modules/auth/auth.service";
import { readSessionToken } from "../modules/auth/auth.tokens";
import type { AuthContext } from "../modules/auth/auth.types";
import { AppError } from "../utils/AppError";

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  const sessionId = typeof token === "string" ? readSessionToken(token) : null;
  const context = sessionId ? await loadAuthContext(sessionId) : null;

  if (!context) {
    throw new AppError(401, "UNAUTHENTICATED", "Please sign in");
  }
  req.auth = context;
  next();
}

// Use inside controllers behind authenticate.
export function getAuth(req: Request): AuthContext {
  if (!req.auth) {
    throw new AppError(401, "UNAUTHENTICATED", "Please sign in");
  }
  return req.auth;
}