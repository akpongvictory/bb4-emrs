import type { Request } from "express";
import { getAuth } from "../../middleware/authenticate";
import { AppError } from "../../utils/AppError";
import type { ActiveFacility, AuthContext } from "./auth.types";

// Reserved for finer scopes later (department, assigned patient, specialty). Unused in the MVP.
export interface ResourceScope {
  departmentId?: string;
  patientId?: string;
}

export interface FacilityAuthContext extends AuthContext {
  facility: ActiveFacility;
}

// The one place that answers "may this user do this?".
// MVP scope: anything inside the active facility. isPlatformAdmin grants nothing here.
export function authorize(auth: AuthContext, permission: string, _resource?: ResourceScope): boolean {
  return auth.facility?.permissions.includes(permission) ?? false;
}

// Use inside controllers behind authenticate + requirePermission.
export function getFacilityAuth(req: Request): FacilityAuthContext {
  const auth = getAuth(req);
  if (!auth.facility) {
    throw new AppError(403, "FACILITY_NOT_SELECTED", "Select a facility to continue");
  }
  return { ...auth, facility: auth.facility };
}