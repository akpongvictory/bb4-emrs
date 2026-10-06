import { useAsyncData } from "../../../hooks/useAsyncData";
import { fetchCurrentFacility } from "../../../services/facilityService";

export default function FacilityProfilePage() {
  const { state, reload } = useAsyncData(fetchCurrentFacility);

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

  const facility = state.data;
  const rows: [string, string | null][] = [
    ["Name", facility.name],
    ["Code", facility.code],
    ["Email", facility.email],
    ["Phone", facility.phone],
    ["Address", facility.address],
    ["Currency", facility.currencyCode],
  ];

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Facility profile</h1>
      <dl className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="font-medium text-slate-500">{label}</dt>
            <dd className="mt-0.5 text-slate-900">{value ?? "Not set"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}