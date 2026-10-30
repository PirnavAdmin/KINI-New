import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import CreateAssignment from "./CreateAssignment";
import ReviewSubmissions from "./ReviewSubmissions";
import { useAssignments } from "../../hooks/useAssignments";
import MentorPageHeader from "@features/mentor/components/MentorPageHeader";

const tabs = ["All", "Active", "Pending Review", "Overdue", "Completed"];
const badge = (status) =>
  status === "Active"
    ? "bg-emerald-50 text-emerald-700"
    : status === "Overdue"
      ? "bg-rose-50 text-rose-700"
      : status === "Completed"
        ? "bg-blue-50 text-blue-700"
        : "bg-slate-100 text-slate-600";
export default function AssignmentsPage() {
  const {
    assignments,
    setAssignments,
    stats,
    getBatch,
    createAssignment,
    mentorBatches,
    auditLog,
    setAuditLog,
  } = useAssignments();
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [batch, setBatch] = useState("All");
  const [dateRange, setDateRange] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [review, setReview] = useState(null);
  const visible = useMemo(
    () =>
      assignments.filter((item) => {
        const batchItem = getBatch(item.batchId);
        return (
          (tab === "All" ||
            (tab === "Pending Review"
              ? item.pending > 0
              : item.status === tab)) &&
          (batch === "All" || item.batchId === batch) &&
          (!search ||
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            batchItem.name.toLowerCase().includes(search.toLowerCase())) &&
          (!dateRange || item.deadline.startsWith(dateRange))
        );
      }),
    [assignments, tab, batch, search, dateRange],
  );
  const closeAssignment = (id) => {
    setAssignments((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: "Completed" } : item,
      ),
    );
    toast.success("Assignment closed");
  };
  return (
    <div className="mx-auto max-w-[1500px] space-y-3 px-3 py-3 sm:px-4 lg:px-5">
      <MentorPageHeader
        title="Assignments"
        subtitle="Create, publish and review work for your assigned batches."
        actions={
          <button
            onClick={() => setDrawer(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#f39924] px-4 py-2 text-xs font-bold text-[#133b5d] shadow-sm transition hover:bg-[#d97f0d]"
          >
            <Plus size={16} /> Create assignment
          </button>
        }
      />
      <section className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
        {[
          ["Total", stats.total, "All assignments"],
          ["Active", stats.active, "Open now"],
          ["Pending review", stats.pending, "Need grading"],
          ["Overdue", stats.overdue, "Needs action"],
          ["Average score", stats.avg, "Reviewed work"],
        ].map(([label, value, note]) => (
          <button
            key={label}
            onClick={() =>
              label === "Pending review" && setTab("Pending Review")
            }
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left shadow-sm transition hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">
              {label}
            </p>
            <p className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
              {value}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{note}</p>
          </button>
        ))}
      </section>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 px-3 pt-1.5 dark:border-slate-700">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`border-b-2 px-3 py-2.5 text-sm font-semibold ${tab === item ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 p-2.5 lg:flex-row">
          <label className="relative flex-1">
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={17}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assignments..."
              className="w-full rounded-lg bg-slate-50 py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800"
            />
          </label>
          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option>All</option>
            {mentorBatches.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1030px] text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[.1em] text-slate-500 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th>Batch</th>
                <th>Total marks</th>
                <th>Deadline</th>
                <th>Submitted</th>
                <th>Pending</th>
                <th>Avg score</th>
                <th>Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => {
                const batchInfo = getBatch(item.batchId);
                return (
                  <tr
                    key={item.id}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </td>
                    <td>{batchInfo?.name}</td>
                    <td>{item.totalMarks}</td>
                    <td>{new Date(item.deadline).toLocaleString()}</td>
                    <td>
                      {item.submitted}/
                      {item.batchId === "react-morning" ? 28 : 22}
                    </td>
                    <td>{item.pending}</td>
                    <td>{item.average}</td>
                    <td>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${badge(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setReview({ ...item, batch: batchInfo?.name })
                          }
                          className="rounded-lg border border-blue-200 px-2.5 py-1.5 text-xs font-bold text-blue-700"
                        >
                          View submissions
                        </button>
                        <button
                          onClick={() =>
                            toast("Edit opens the assignment drawer.")
                          }
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold"
                        >
                          Edit
                        </button>
                        {item.status !== "Completed" && (
                          <button
                            onClick={() => closeAssignment(item.id)}
                            className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-bold text-rose-600"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-500">
              No assignments match these filters.
            </div>
          )}
        </div>
      </section>
      {auditLog.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex items-center justify-between">
            <b>Grade audit log</b>
            <button onClick={() => setAuditLog([])}>
              <X size={16} />
            </button>
          </div>
          {auditLog.map((entry, index) => (
            <p key={index} className="mt-1">
              {entry.student}: {entry.oldValue} → {entry.newValue}; “
              {entry.reason}” · {entry.timestamp}
            </p>
          ))}
        </section>
      )}
      <CreateAssignment
        open={drawer}
        onClose={() => setDrawer(false)}
        batches={mentorBatches}
        onSave={createAssignment}
      />
      <ReviewSubmissions
        assignment={review}
        onClose={() => setReview(null)}
        onAudit={(entry) => setAuditLog((items) => [entry, ...items])}
      />
    </div>
  );
}
