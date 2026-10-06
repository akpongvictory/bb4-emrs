import type { SessionInfo } from "../types/auth";
import { apiRequest } from "./apiClient";

export function login(email: string, password: string): Promise<SessionInfo> {
  return apiRequest<SessionInfo>("/auth/login", { method: "POST", body: { email, password } });
}

export function fetchSession(): Promise<SessionInfo> {
  return apiRequest<SessionInfo>("/auth/me");
}

export function selectFacility(facilityId: string): Promise<SessionInfo> {
  return apiRequest<SessionInfo>("/auth/select-facility", { method: "POST", body: { facilityId } });
}

export function logout(): Promise<{ loggedOut: boolean }> {
  return apiRequest<{ loggedOut: boolean }>("/auth/logout", { method: "POST" });
}