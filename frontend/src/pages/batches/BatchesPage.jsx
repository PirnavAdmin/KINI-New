import { useEffect, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Plus,
  Users,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useBatches from "@/hooks/useBatches";
import BatchList from "./BatchList";
import BatchForm from "./BatchForm";
export default function BatchesPage() {
  const navigate = useNavigate();
  const { batches, loading, stats, saveBatch, cancelBatch, addStudents } =
    useBatches();
  const [form, setForm] = useState({ open: false, batch: null });
  const [cancel, setCancel] = useState(null);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState("");
  const [add, setAdd] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2300);
    return () => clearTimeout(timer);
  }, [toast]);
  const cards = [
    ["Total", stats.total, Users, "bg-blue-50 text-blue-600"],
    ["Active", stats.active, Activity, "bg-emerald-50 text-emerald-600"],
    ["Planned", stats.planned, CalendarDays, "bg-amber-50 text-amber-600"],
    [
      "Completed",
      stats.completed,
      CheckCircle2,
      "bg-violet-50 text-violet-600",
    ],
    ["Cancelled", stats.cancelled, XCircle, "bg-red-50 text-red-600"],
  ];
  const action = (name, batch) => {
    if (name === "Add Students") setAdd(batch);
    else if (name === "Schedule" || name === "Attendance")
      navigate(`/organization/batches/${batch.id}/details`);
    else if (name === "Change Mentor") setForm({ open: true, batch });
    else if (name === "Manage Batch") navigate(`/organization/batches/${batch.id}/details`);
    else setToast(`${name} opened for ${batch.name}`);
  };
  return (
    <main className="min-h-full bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-[1600px] space-y-4">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Academic · Delivery operations
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Batch Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Plan cohorts, mentors, schedules, capacity and student
              enrollment.
            </p>
          </div>
          <button
            data-page-new
            onClick={() => setForm({ open: true, batch: null })}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Create Batch
          </button>
        </header>
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {cards.map(([label, value, Icon, tone]) => (
            <div
              key={label}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 font-mono text-2xl font-semibold">
                    {value}
                  </p>
                </div>
                <span className={`rounded-lg p-2 ${tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
            </div>
          ))}
        </section>
        {loading ? (
          <div className="h-[520px] animate-pulse rounded-xl bg-slate-200" />
        ) : (
          <BatchList
            batches={batches}
            onView={(batch) =>
              navigate(`/organization/batches/${batch.id}/details`)
            }
            onEdit={(batch) => setForm({ open: true, batch })}
            onAction={action}
            onCancel={setCancel}
          />
        )}
      </div>
      <BatchForm
        open={form.open}
        batch={form.batch}
        onClose={() => setForm({ open: false, batch: null })}
        onSave={async (values, id) => {
          saveBatch(values, id);
          setToast(id ? "Batch updated" : "Batch created");
        }}
      />
      {cancel && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const result = cancelBatch(cancel.id, reason);
              if (result.ok) {
                setCancel(null);
                setReason("");
                setToast("Batch cancelled");
              }
            }}
            className="w-full max-w-md rounded-xl bg-white p-5"
          >
            <h2 className="font-semibold">Cancel {cancel.name}?</h2>
            <p className="mt-2 text-sm text-slate-600">
              This batch has {cancel.students} enrolled students. Their
              schedules will be removed and they must be reassigned.
            </p>
            <label className="mt-4 block text-xs font-semibold">
              Cancellation reason <span className="text-red-500">*</span>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="3"
                className="mt-1.5 w-full rounded-lg border p-3 text-sm"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancel(null)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Keep batch
              </button>
              <button className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">
                Cancel batch
              </button>
            </div>
          </form>
        </div>
      )}
      {add && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5">
            <h2 className="font-semibold">Add students</h2>
            <p className="mt-1 text-sm text-slate-500">
              {add.capacity - add.students} seats available in {add.name}.
            </p>
            <div className="mt-4 space-y-2">
              {["Neha Kulkarni", "Aditya Joshi", "Ishita Bose"].map((name) => (
                <label
                  key={name}
                  className="flex items-center gap-2 rounded-lg border p-3 text-sm"
                >
                  <input type="checkbox" className="accent-blue-600" />
                  {name}
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setAdd(null)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={add.students >= add.capacity}
                onClick={() => {
                  const result = addStudents(add.id, 1);
                  if (result.ok) {
                    setAdd(null);
                    setToast("Student added to batch");
                  } else setToast(result.reason);
                }}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                Add selected
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[90] rounded-lg bg-slate-900 px-4 py-3 text-sm text-white">
          {toast}
        </div>
      )}
    </main>
  );
}
