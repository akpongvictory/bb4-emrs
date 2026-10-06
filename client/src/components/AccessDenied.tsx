export default function AccessDenied() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="text-lg font-semibold text-slate-900">You do not have access to this page</h1>
      <p className="mt-1 text-sm text-slate-600">
        Your role in this facility does not include it. Ask your Facility Admin if you need access.
      </p>
    </section>
  );
}