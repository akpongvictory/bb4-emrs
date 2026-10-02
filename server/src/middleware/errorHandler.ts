import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "../utils/AppError";
import { logger, serializeError } from "../utils/logger";

function send(res: Response, status: number, code: string, message: string, details?: unknown): void {
  res.status(status).json({
    error: { code, message, ...(details !== undefined ? { details } : {}) },
  });
}

function isMalformedJson(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.parse.failed"
  );
}

// Express recognises an error handler by its four parameters.
export function errorHandler(error: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    send(res, error.status, error.code, error.message, error.details);
    return;
  }

  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    send(res, 400, "VALIDATION_ERROR", "Invalid request data", details);
    return;
  }

  if (isMalformedJson(error)) {
    send(res, 400, "VALIDATION_ERROR", "Request body is not valid JSON");
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      send(res, 409, "CONFLICT", "A record with these details already exists");
      return;
    }
    if (error.code === "P2025") {
      send(res, 404, "NOT_FOUND", "Record not found");
      return;
    }
  }

  logger.error("Unhandled error", { err: serializeError(error) });
  send(res, 500, "INTERNAL_ERROR", "Something went wrong");
}