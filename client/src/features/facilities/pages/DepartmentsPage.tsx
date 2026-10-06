import { useAsyncData } from "../../../hooks/useAsyncData";
import { fetchDepartments } from "../../../services/facilityService";

export default function DepartmentsPage() {
  const { state, reload } = useAsyncData(fetchDepartments);

  if (state.status === "loading") {
    return <p className="text-sm text-slate-600">Loading…</p>;
  }
  if (state.status === "error") {
    return (
      <div role="alert" className="space-y-3 rounded-lg bg-red-50 p-4 text-sm text-red-700">
        <p>{state.message}</p>
        <button type="button" onClick={reload} className="font-medium underline">
          Try again
        </button>
      </div>
    );
  }

  const departments = state.data;

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Departments</h1>
      {departments.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          No departments are set up for this facility yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">
                  Department
                </th>
                <th scope="col" className="px-4 py-2 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((department) => (
                <tr key={department.id}>
                  <td className="px-4 py-2 text-slate-900">{department.name}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        department.isActive
                          ? "rounded bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800"
                          : "rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700"
                      }
                    >
                      {department.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}