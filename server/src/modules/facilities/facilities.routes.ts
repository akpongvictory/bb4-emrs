import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { requirePermission } from "../../middleware/requirePermission";
import { currentFacilityController, departmentsController } from "./facilities.controller";

export const facilitiesRouter = Router();

facilitiesRouter.get("/current", authenticate, requirePermission("facility.view"), currentFacilityController);
facilitiesRouter.get(
  "/current/departments",
  authenticate,
  requirePermission("departments.view"),
  departmentsController,
);