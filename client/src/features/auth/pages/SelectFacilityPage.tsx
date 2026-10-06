import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import { ApiError } from "../../../services/apiClient";

export default function SelectFacilityPage() {
  const { session, chooseFacility, signOut } = useAuth();
  const navigate = useNavigate();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!session || session.facilities.length === 0) {
    return <Navigate to="/" replace />;
  }

  async function handleChoose(facilityId: string) {
    setPendingId(facilityId);
    setError(null);
    try {
      await chooseFacility(facilityId);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPendingId(null);
    }
  }

  const currentId = session.activeFacility?.id;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-medium text-slate-900">Choose a facility</h1>
        <p className="mt-1 text-sm text-slate-600">
          Signed in as {session.user.firstName} {session.user.lastName}.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <ul className="mt-4 space-y-2">
          {session.facilities.map((facility) => (
            <li key={facility.id}>
              <button
                type="button"
                disabled={pendingId !== null}
                onClick={() => void handleChoose(facility.id)}
                className="flex w-full items-center justify-between rounded-md border border-slate-300 px-4 py-3 text-left text-sm hover:border-teal-600 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  <span className="block font-medium text-slate-900">{facility.name}</span>
                  <span className="block text-slate-500">{facility.code}</span>
                </span>
                {facility.id === currentId && (
                  <span className="rounded bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800">
                    Current
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-6 text-sm font-medium text-slate-600 hover:underline"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}