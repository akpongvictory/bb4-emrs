import type { Department, FacilityProfile } from "../types/facility";
import { apiRequest } from "./apiClient";

export function fetchCurrentFacility(): Promise<FacilityProfile> {
  return apiRequest<FacilityProfile>("/facilities/current");
}

export function fetchDepartments(): Promise<Department[]> {
  return apiRequest<Department[]>("/facilities/current/departments");
}