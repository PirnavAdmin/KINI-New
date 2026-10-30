import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { employeeApi, getApiErrorMessage } from "@shared/services/apiServices";

export default function SuperAdminUserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    employeeApi
      .getById(userId)
      .then(setUser)
      .catch((e) =>
        setError(getApiErrorMessage(e, "User could not be loaded")),
      );
  }, [userId]);
  if (error || !user)
    return (
      <State
        message={error || "Loading user details…"}
        onBack={() => navigate(-1)}
      />
    );
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.name ||
    user.email;
  return (
    <div className="space-y-3 p-2 sm:p-3 lg:p-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to users
      </button>
      <section className="rounded-3xl bg-gradient-to-r from-slate-950 to-violet-800 p-6 text-white shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-violet-200">
          Platform user
        </p>
        <h1 className="mt-2 text-3xl font-black">{name}</h1>
        <p className="mt-2 text-violet-100">
          {user.designation ?? user.role ?? "Employee"} · User #
          {user.employeeId ?? user.id ?? userId}
        </p>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Detail icon={Mail} label="Email" value={user.email} />
        <Detail icon={Phone} label="Phone" value={user.phone} />
        <Detail
          icon={Building2}
          label="Organization"
          value={user.organizationName ?? "Organization"}
        />
        <Detail
          icon={UserCheck}
          label="Status"
          value={user.status ?? "Active"}
        />
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-violet-600" />
          <h2 className="font-extrabold">Access governance</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          This account is governed by its assigned organization role. Sensitive
          access changes remain backend-authoritative and auditable.
        </p>
      </section>
    </div>
  );
}
function Detail({ icon: Icon, label, value }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-violet-600" />
      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words font-black text-slate-900">
        {value || "—"}
      </p>
    </section>
  );
}
function State({ message, onBack }) {
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <div className="text-center">
        <Activity className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-3 font-bold text-slate-600">{message}</p>
        <button
          onClick={onBack}
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
