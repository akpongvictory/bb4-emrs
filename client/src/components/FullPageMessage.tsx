import type { ReactNode } from "react";

export default function FullPageMessage({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-sm space-y-3 text-center text-slate-700">{children}</div>
    </main>
  );
}