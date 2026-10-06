import type { NextFunction, Request, Response } from "express";
import { authorize } from "../modules/auth/auth.authorize";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { getAuth } from "./authenticate";

// Place after authenticate: router.get("/", authenticate, requirePermission("patients.view"), handler)
export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const auth = getAuth(req);

    if (!auth.facility) {
      throw new AppError(403, "FACILITY_NOT_SELECTED", "Select a facility to continue");
    }
    if (!authorize(auth, permission)) {
      logger.warn("Permission denied", {
        userId: auth.user.id,
        facilityId: auth.facility.id,
        permission,
        method: req.method,
        path: req.path,
      });
      throw new AppError(403, "PERMISSION_DENIED", "You do not have permission to do this");
    }
    next();
  };
}