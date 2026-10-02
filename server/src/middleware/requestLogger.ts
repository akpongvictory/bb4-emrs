import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

// Logs method, path, status and duration. Never logs bodies or query strings (patient data, passwords).
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (req.path.startsWith("/api/health")) {
    next();
    return;
  }
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const durationMs = Math.round(Number(process.hrtime.bigint() - start) / 1_000_000);
    logger.info("request", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs,
    });
  });
  next();
}