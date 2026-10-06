import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { navItems } from "./navigation";

export default function AppLayout() {
  const { session, signOut, hasPermission } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (!session?.activeFacility) {
    return null;
  }
  const { user, facilities, activeFacility } = session;
  const visibleItems = navItems.filter((item) => !item.permission || hasPermission(item.permission));

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-teal-800">BB4 EMRs</p>
            <p className="text-sm text-slate-700">
              {activeFacility.name} <span className="text-slate-400">({activeFacility.code})</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="text-right">
              <p className="font-medium text-slate-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-slate-500">{activeFacility.roles.map((role) => role.name).join(", ")}</p>
            </div>
            {facilities.length > 1 && (
              <Link to="/select-facility" className="font-medium text-teal-700 hover:underline">
                Switch facility
              </Link>
            )}
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
              className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>

        <nav aria-label="Main" className="border-t border-slate-100">
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "border-teal-700 text-teal-800"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}