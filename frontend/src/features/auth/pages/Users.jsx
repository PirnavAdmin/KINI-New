import { useCallback, useEffect, useMemo, useState } from "react";
import { authService } from "@shared/services/authService";
import getApiErrorMessage from "@/utils/getApiErrorMessage";

const getUserList = (payload) => {
  if (Array.isArray(payload)) return payload;
  const candidates = [payload?.items, payload?.users, payload?.data, payload?.data?.items, payload?.data?.users];
  return candidates.find(Array.isArray) || [];
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(getUserList(await authService.getUsers()));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  }, []);

  // The callback is stable and this is the page's single data owner.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return users;
    return users.filter((user) => [user.firstName, user.lastName, user.fullName, user.email, user.role]
      .filter(Boolean).some((field) => String(field).toLowerCase().includes(value)));
  }, [query, users]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1><p className="text-sm text-slate-500">Authorized KiniEdxHub accounts</p></div>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </div>
        {loading && <p className="py-12 text-center text-slate-500">Loading users...</p>}
        {!loading && error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button onClick={loadUsers} className="mt-2 font-semibold underline">Retry</button></div>}
        {!loading && !error && !filteredUsers.length && <p className="py-12 text-center text-slate-500">No users found.</p>}
        {!loading && !error && filteredUsers.length > 0 && (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Phone</th></tr></thead><tbody>{filteredUsers.map((user, index) => <tr key={user.userId || user.id || `${user.email}-${index}`} className="border-b border-slate-100 dark:border-slate-800"><td className="p-3 font-medium text-slate-900 dark:text-white">{user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}</td><td className="p-3 text-slate-600 dark:text-slate-300">{user.email || "—"}</td><td className="p-3 text-slate-600 dark:text-slate-300">{user.role || "—"}</td><td className="p-3 text-slate-600 dark:text-slate-300">{user.phone || user.phoneNumber || "—"}</td></tr>)}</tbody></table></div>
        )}
      </div>
    </main>
  );
}
