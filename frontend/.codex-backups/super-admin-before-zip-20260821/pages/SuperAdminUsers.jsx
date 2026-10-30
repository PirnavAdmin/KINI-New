import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { employeeApi, getApiErrorMessage } from "@shared/services/apiServices";

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    setError("");
    employeeApi
      .list()
      .then((rows) =>
        setUsers(
          (Array.isArray(rows) ? rows : []).map((u) => ({
            ...u,
            id: u.employeeId ?? u.id,
            name:
              [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email,
            role: u.designation ?? u.role ?? "Employee",
            organization: u.organizationName ?? "Organization",
            status: u.status ?? "Active",
          })),
        ),
      )
      .catch((e) =>
        setError(getApiErrorMessage(e, "Platform users could not be loaded")),
      )
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const filtered = useMemo(
    () =>
      users.filter((u) =>
        `${u.name} ${u.email} ${u.role}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [users, query],
  );
  return (
    <div className="space-y-3 p-2 sm:p-3 lg:p-4">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-blue-600">
            Administration · Access
          </p>
          <h1 className="mt-1 text-3xl font-black">Platform Users</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review organization employee accounts and access status.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-bold"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{" "}
          Refresh
        </button>
      </header>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={Users} label="Total Users" value={users.length} />
        <Metric
          icon={UserCheck}
          label="Active"
          value={
            users.filter((u) => String(u.status).toLowerCase() === "active")
              .length
          }
        />
        <Metric
          icon={ShieldCheck}
          label="Managed Access"
          value={users.length}
        />
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="m-4 flex items-center gap-3 rounded-xl border px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users…"
            className="w-full outline-none"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Organization</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-t border-slate-100 text-sm">
                  <td className="px-5 py-4">
                    <p className="font-bold">{user.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{user.role}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <Building2 className="h-4 w-4" />
                      {user.organization}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700">
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
function Metric({ icon: Icon, label, value }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-blue-600" />
      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </section>
  );
}
