import { useAuth } from "../../hooks/useAuth";

// Temporary home screen. Role dashboards arrive with their modules.
export default function HomePage() {
  const { session } = useAuth();
  if (!session?.activeFacility) {
    return null;
  }
  const { user, activeFacility } = session;

  const byModule = new Map<string, string[]>();
  for (const key of activeFacility.permissions) {
    const [module = key, action = ""] = key.split(".");
    byModule.set(module, [...(byModule.get(module) ?? []), action]);
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Welcome, {user.firstName}</h1>
        <p className="mt-1 text-sm text-slate-600">
          You are working in {activeFacility.name} as{" "}
          {activeFacility.roles.map((role) => role.name).join(", ")}.
        </p>
      </div>

      <details className="rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-medium text-slate-900">
          Your permissions in this facility ({activeFacility.permissions.length})
        </summary>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {Array.from(byModule.entries()).map(([module, actions]) => (
            <div key={module}>
              <dt className="font-medium text-slate-800">{module}</dt>
              <dd className="text-slate-600">{actions.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}