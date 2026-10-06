import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError, setUnauthorizedHandler } from "../services/apiClient";
import * as authService from "../services/authService";
import type { SessionInfo } from "../types/auth";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Ask the server who we are. The browser holds the cookie; this app never sees the token.
  useEffect(() => {
    let cancelled = false;
    authService
      .fetchSession()
      .then((info) => {
        if (cancelled) {
          return;
        }
        setSession(info);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiError && error.status === 401) {
          setSession(null);
          setStatus("ready");
        } else {
          setErrorMessage(error instanceof ApiError ? error.message : "Something went wrong");
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // If any request reports an expired session, drop to the login screen.
  useEffect(() => {
    setUnauthorizedHandler(() => setSession(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const retry = useCallback(() => {
    setStatus("loading");
    setErrorMessage(null);
    setAttempt((count) => count + 1);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setSession(await authService.login(email, password));
  }, []);

  const chooseFacility = useCallback(async (facilityId: string) => {
    setSession(await authService.selectFacility(facilityId));
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setSession(null);
    }
  }, []);

  const hasPermission = useCallback(
    (permission: string) => session?.activeFacility?.permissions.includes(permission) ?? false,
    [session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ status, session, errorMessage, signIn, chooseFacility, signOut, hasPermission, retry }),
    [status, session, errorMessage, signIn, chooseFacility, signOut, hasPermission, retry],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
