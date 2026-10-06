import type { Request, Response } from "express";
import { getFacilityAuth } from "../auth/auth.authorize";
import { getCurrentFacility, listDepartments } from "./facilities.service";

export async function currentFacilityController(req: Request, res: Response): Promise<void> {
  const { facility } = getFacilityAuth(req);
  res.json({ data: await getCurrentFacility(facility.id) });
}

export async function departmentsController(req: Request, res: Response): Promise<void> {
  const { facility } = getFacilityAuth(req);
  res.json({ data: await listDepartments(facility.id) });
}