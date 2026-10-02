export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isPlatformAdmin: boolean;
}

export interface FacilitySummary {
  id: string;
  name: string;
  code: string;
}

export interface ActiveFacility extends FacilitySummary {
  membershipId: string;
  roles: { key: string; name: string }[];
  permissions: string[];
}

// Attached to req.auth by the authenticate middleware.
export interface AuthContext {
  sessionId: string;
  user: AuthUser;
  facility: ActiveFacility | null;
}

// What the frontend receives from login, /me and select-facility.
export interface SessionInfo {
  user: AuthUser;
  facilities: FacilitySummary[];
  activeFacility: ActiveFacility | null;
}