import { createContext } from "react";
import type { SessionInfo } from "../types/auth";

export type AuthStatus = "loading" | "ready" | "error";

export interface AuthContextValue {
  status: AuthStatus;
  session: SessionInfo | null;
  errorMessage: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  chooseFacility: (facilityId: string) => Promise<void>;
  signOut: () => Promise<void>;
  // For showing or hiding menu items only. The backend enforces every permission.
  hasPermission: (permission: string) => boolean;
  retry: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);