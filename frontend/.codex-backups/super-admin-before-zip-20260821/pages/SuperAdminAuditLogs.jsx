import { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Download,
  Search,
  ShieldCheck,
} from "lucide-react";

const INITIAL_LOGS = [
  {
    id: 1,
    action: "Organization records viewed",
    module: "Organizations",
    actor: "Super Admin",
    status: "Success",
    time: "Today",
  },
  {
    id: 2,
    action: "Subscription workspace opened",
    module: "Subscriptions",
    actor: "Super Admin",
    status: "Success",
    time: "Today",
  },
  {
    id: 3,
    action: "Platform access reviewed",
    module: "Governance",
    actor: "Super Admin",
    status: "Success",
    time: "Today",
  },
];
export default function SuperAdminAuditLogs() {
  const [query, setQuery] = useState("");
  const logs = useMemo(
    () =>
      INITIAL_LOGS.filter((x) =>
        `${x.action} ${x.module} ${x.actor}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );
  const download = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "super-admin-audit-logs.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-3 p-2 sm:p-3 lg:p-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-blue-600">
            Security · Read only
          </p>
          <h1 className="mt-1 text-3xl font-black">Audit Logs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tamper-resistant visibility into platform administration activity.
          </p>
        </div>
        <button
          onClick={download}
          className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-bold"
        >
          <Download className="h-4 w-4" /> Export
        </button>
      </header>
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="font-extrabold text-emerald-900">
              Audit trail protected
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              Logs are read-only in this workspace. No delete or clear action is
              exposed.
            </p>
          </div>
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="m-4 flex items-center gap-3 rounded-xl border px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search audit events…"
            className="w-full outline-none"
          />
        </div>
        <div className="divide-y divide-slate-100">
          {logs.map((log) => (
            <article key={log.id} className="flex items-center gap-4 px-5 py-4">
              <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Activity className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">{log.action}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {log.actor} · {log.module} · {log.time}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                {log.status}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
