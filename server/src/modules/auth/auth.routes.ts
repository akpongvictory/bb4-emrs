import type { Request } from "express";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../../middleware/authenticate";
import { AppError } from "../../utils/AppError";
import {
  loginController,
  logoutController,
  meController,
  selectFacilityController,
} from "./auth.controller";

const tooManyAttempts = (_req: Request, _res: unknown, next: (error: unknown) => void) =>
  next(new AppError(429, "TOO_MANY_ATTEMPTS", "Too many login attempts. Try again later."));

// Per account: 10 failed attempts per 15 minutes.
const loginPerEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email: unknown = req.body?.email;
    return typeof email === "string" ? email.trim().toLowerCase() : "unknown";
  },
  handler: tooManyAttempts,
});

// Per IP: 100 attempts per 15 minutes (clinics often share one address).
const loginPerIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyAttempts,
});

export const authRouter = Router();

authRouter.post("/login", loginPerIpLimiter, loginPerEmailLimiter, loginController);
authRouter.get("/me", authenticate, meController);
authRouter.post("/select-facility", authenticate, selectFacilityController);
authRouter.post("/logout", logoutController);