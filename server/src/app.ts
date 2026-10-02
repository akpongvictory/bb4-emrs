import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { requestLogger } from "./middleware/requestLogger";
import { healthRouter } from "./modules/health/health.routes";
import cookieParser from "cookie-parser";
import { originCheck } from "./middleware/originCheck";
import { authRouter } from "./modules/auth/auth.routes";

export function createApp() {
  const app = express();

  if (env.isProduction) {
    app.set("trust proxy", 1);
  }

  app.use(requestLogger);
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(originCheck);

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
