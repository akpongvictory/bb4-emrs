import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Blocks cross-site form posts and scripts from other origins that try to use the session cookie.
export function originCheck(req: Request, _res: Response, next: NextFunction): void {
  const origin = req.get("origin");
  if (!SAFE_METHODS.has(req.method) && origin && origin !== env.CLIENT_ORIGIN) {
    next(new AppError(403, "FORBIDDEN_ORIGIN", "Request origin is not allowed"));
    return;
  }
  next();
}