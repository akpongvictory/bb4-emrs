import { Navigate, Outlet, useLocation } from "react-router";
import FullPageMessage from "../../components/FullPageMessage";
import { useAuth } from "../../hooks/useAuth";
import AccessDenied from "../../components/AccessDenied";

const buttonClass =
  "rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800";

// Requires a permission in the active facility. Convenience only: the server enforces it too.
export function RequirePermission({ permission }: { permission: string }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return <AccessDenied />;
  }
  return <Outlet />;
}

// Requires a signed-in user.
export function RequireAuth() {
  const { status, session, errorMessage, retry } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <FullPageMessage>Loading…</FullPageMessage>;
  }
  if (status === "error") {
    return (
      <FullPageMessage>
        <p role="alert">{errorMessage}</p>
        <button type="button" onClick={retry} className={buttonClass}>
          Try again
        </button>
      </FullPageMessage>
    );
  }
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

// Requires a signed-in user who has chosen a facility.
export function RequireFacility() {
  const { session, signOut } = useAuth();

  if (!session) {
    return null;
  }
  if (session.activeFacility) {
    return <Outlet />;
  }
  if (session.facilities.length > 0) {
    return <Navigate to="/select-facility" replace />;
  }
  return (
    <FullPageMessage>
      <h1 className="text-xl font-semibold text-slate-900">No facility access</h1>
      <p className="text-sm">
        This account is not assigned to a facility. Platform administration screens are not available yet.
      </p>
      <button type="button" onClick={() => void signOut()} className={buttonClass}>
        Sign out
      </button>
    </FullPageMessage>
  );
}