import { Router } from "express";
import { prisma } from "../../config/db";
import { AppError } from "../../utils/AppError";
import { logger, serializeError } from "../../utils/logger";

export const healthRouter = Router();

// Liveness: is the process running? Hosting platforms poll this.
healthRouter.get("/", (_req, res) => {
  res.json({
    data: {
      status: "ok",
      service: "bb4-emrs-server",
      timestamp: new Date().toISOString(),
    },
  });
});

// Readiness: can the app reach its database?
healthRouter.get("/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    logger.error("Database readiness check failed", { err: serializeError(error) });
    throw new AppError(503, "SERVICE_UNAVAILABLE", "Database is not reachable");
  }
  res.json({ data: { status: "ready", database: "ok" } });
});