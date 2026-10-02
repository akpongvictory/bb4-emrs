import { createApp } from "./app";
import { prisma } from "./config/db";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info("BB4 EMRs server started", { port: env.PORT, environment: env.NODE_ENV });
});

// Let in-flight requests finish and close the database cleanly on deploys and Ctrl+C.
function shutdown(signal: string): void {
  logger.info("Shutting down", { signal });
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));