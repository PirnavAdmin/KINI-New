import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

export default function EligibilityReview({
  record,
  onClose,
  onVerify,
  onApprove,
  onReject,
}) {
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(record.identityVerified);

  const checks = useMemo(
    () => [
      {
        label: "Course Completion",
        value: `${record.completion}%`,
        detail: "min: 80%",
        pass: record.completion >= 80,
      },
      {
        label: "Attendance",
        value: `${record.attendance}%`,
        detail: "min: 75%",
        pass: record.attendance >= 75,
      },
      {
        label: "All Assignments",
        value: record.assignments,
        detail: "submitted",
        pass: record.assignments === "15/15",
      },
      {
        label: "Final Assessment",
        value: `Passed (${record.score}%)`,
        detail: "",
        pass: record.assessmentPassed,
      },
      {
        label: "Fee Payment",
        value: "Paid in full",
        detail: "",
        pass: record.feePaid,
      },
      {
        label: "Identity Verified",
        value: verified ? "Verified" : "Pending",
        detail: verified ? "" : "BLOCKED",
        pass: verified,
      },
    ],
    [record, verified],
  );
  const passed = checks.filter((item) => item.pass).length;
  const eligible = passed === checks.length;

  const verify = () => {
    onVerify(record.id);
    setVerified(true);
  };

  const approve = () => {
    const result = onApprove(record.id);
    if (!result.ok) setError(result.error);
  };

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Eligibility review
            </p>
            <h2 className="mt-1 text-xl font-semibold">Certificate request</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="grid gap-6 p-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-xl border bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                {record.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <div>
                <h3 className="font-semibold">{record.name}</h3>
                <p className="mt-0.5 font-mono text-xs text-slate-500">
                  {record.studentId}
                </p>
              </div>
            </div>
            <dl className="mt-6 space-y-4 text-sm">
              {[
                ["Course", record.course],
                ["Batch", record.batch],
                ["Mentor", record.trainer],
                ["Enrolled", record.enrolledDate],
                ["Completed", record.completionDate],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="mt-1 font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </aside>
          <div className="rounded-xl border p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold tracking-wide">
                CERTIFICATE ELIGIBILITY
              </h3>
            </div>
            <div className="mt-5 divide-y">
              {checks.map((item) => (
                <div key={item.label} className="flex items-center gap-3 py-3">
                  {item.pass ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                  )}
                  <span className="min-w-0 flex-1 text-sm font-medium">
                    {item.label}
                  </span>
                  <span
                    className={`text-right text-sm font-semibold ${item.pass ? "text-slate-800" : "text-red-600"}`}
                  >
                    {item.value}{" "}
                    {item.detail && (
                      <small className="ml-1 font-medium text-slate-500">
                        ({item.detail})
                      </small>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div
              className={`mt-5 rounded-lg border p-4 ${eligible ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}
            >
              <p className="font-semibold">{passed} of 6 conditions met</p>
              <p
                className={`mt-1 flex items-center gap-2 text-sm ${eligible ? "text-emerald-700" : "text-amber-800"}`}
              >
                {eligible ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                {eligible
                  ? "All requirements are complete. This certificate can be approved."
                  : "Cannot issue — identity not verified"}
              </p>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              {!verified && (
                <button
                  onClick={verify}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Verify Identity
                </button>
              )}
              <button
                onClick={() => setRejecting(true)}
                className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600"
              >
                Reject Request
              </button>
              {eligible && (
                <button
                  onClick={approve}
                  className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Approve & Generate Certificate
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      {rejecting && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-slate-950/35 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="font-semibold">Reject certificate request?</h3>
            <p className="mt-1 text-sm text-slate-500">
              Give the student a clear reason for this decision.
            </p>
            <textarea
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="3"
              className="mt-4 w-full rounded-lg border p-3 text-sm"
              placeholder="Rejection reason (required)"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setRejecting(false)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={!reason.trim()}
                onClick={() => {
                  onReject(record.id, reason.trim());
                  onClose();
                }}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                Reject request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
