import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, UserCheck } from "lucide-react";
import KiniDialog, { KiniDetailRow } from "@shared/components/KiniDialog";
import { describeApprovalError, describeApprovalResult } from "./studentApproval";

const NOT_REPORTED = "Not reported by the backend";

/**
 * Confirms and performs a live approval for one backend student:
 * PUT /api/v1/organization/students/{studentId}/approve.
 *
 * target: { studentId, name, email, course, demoRequests? }
 * approve(studentId) resolves with { raw, reloadError } from useStudents.
 * onSettled(outcome) runs once the backend has answered ("approved" | "already-approved").
 */
export default function ApproveStudentDialog({ target, approve, onSettled, onClose }) {
  // confirm | working | done | error
  const [phase, setPhase] = useState("confirm");
  const [result, setResult] = useState(null);
  const [failure, setFailure] = useState(null);
  if (!target) return null;

  const demoCourses = (target.demoRequests ?? []).map((request) => request.courseName).filter(Boolean);
  const close = () => { if (phase !== "working") onClose(); };

  const confirm = async () => {
    if (phase === "working") return;
    setPhase("working");
    setFailure(null);
    try {
      const response = await approve(target.studentId);
      setResult({ ...describeApprovalResult(response.raw, target.studentId), httpStatus: response.status, reloadError: response.reloadError });
      setPhase("done");
      await onSettled?.("approved");
    } catch (error) {
      const described = describeApprovalError(error, target.studentId);
      setFailure(described);
      setPhase("error");
      if (described.alreadyApproved) await onSettled?.("already-approved");
    }
  };

  const footer = phase === "done" || (phase === "error" && failure?.alreadyApproved) ? (
    <button type="button" onClick={onClose} className="rounded-xl bg-[#0F55F7] px-4 py-2.5 text-sm font-semibold text-white">Done</button>
  ) : (
    <>
      <button type="button" onClick={close} disabled={phase === "working"} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4b5f78] transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800">
        Cancel
      </button>
      <button
        type="button"
        onClick={confirm}
        disabled={phase === "working"}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {phase === "working" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {phase === "working" ? "Approving…" : phase === "error" ? "Try again" : "Approve student"}
      </button>
    </>
  );

  return (
    <KiniDialog
      open
      onClose={close}
      icon={UserCheck}
      title={phase === "done" ? "Student approved" : `Approve ${target.name}?`}
      subtitle={phase === "done" ? "The backend confirmed this approval." : "This approves the student account in the live backend."}
      closeLabel="Close approval dialog"
      width={560}
      footer={footer}
    >
      <div className="space-y-2.5">
        <KiniDetailRow label="Student ID" tone="blue"><span className="font-mono text-sm">#{target.studentId}</span></KiniDetailRow>
        <KiniDetailRow label="Email" tone="purple">{target.email || "—"}</KiniDetailRow>
        <KiniDetailRow label="Course" tone="green">{target.course || "—"}</KiniDetailRow>
        {demoCourses.length > 0 && (
          <KiniDetailRow label="Paid courses" tone="orange">
            {demoCourses.join(", ")}
            <span className="mt-0.5 block text-xs font-medium text-amber-700 dark:text-amber-300">Demo payment, matched by email</span>
          </KiniDetailRow>
        )}
      </div>

      {phase === "confirm" || phase === "working" ? (
        <p className="mt-4 text-xs leading-5 text-[#5b6f88] dark:text-slate-400">
          Sends PUT /api/v1/organization/students/{target.studentId}/approve. The backend creates or activates the account and emails the student; nothing is emailed from this page.
          {demoCourses.length > 1 && " One approval covers this student's account for every course listed."}
        </p>
      ) : null}

      {phase === "done" && result && <ApprovalResultPanel result={result} />}

      {phase === "error" && failure && (
        <p role="alert" className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm font-medium ${failure.alreadyApproved ? "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200" : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"}`}>
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{failure.message}{failure.status ? ` (HTTP ${failure.status})` : ""}</span>
        </p>
      )}
    </KiniDialog>
  );
}

/** What the backend answered to PUT …/approve; unreported fields say so. */
export function ApprovalResultPanel({ result }) {
  return (
    <section aria-label="Backend response" className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
      <p className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-200">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Backend answered {result.httpStatus}{result.message ? `: ${result.message}` : ""}
      </p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
        {[
          ["Approval status", result.approvalStatus],
          ["Student ID", result.studentId != null ? `#${result.studentId}` : null],
          ["Student email", result.email],
          ["Account", result.accountStatus],
          ["Email notification", result.emailStatus],
        ].map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-[#4b5f78] dark:text-slate-400">{label}</dt>
            <dd className={`font-semibold ${value ? "text-[#0f2a4a] dark:text-white" : "text-slate-400"}`}>{value ?? NOT_REPORTED}</dd>
          </div>
        ))}
      </dl>
      {result.emailFailed && (
        <p className="mt-3 flex items-start gap-2 text-xs font-semibold text-red-700 dark:text-red-300">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          The student is approved, but the backend reports the email was not sent. They have not received their login details.
        </p>
      )}
      {!result.emailStatus && (
        <p className="mt-3 text-xs text-[#5b6f88] dark:text-slate-400">
          The backend didn't say whether the email went out, so delivery isn't confirmed.
        </p>
      )}
      {result.reloadError && (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Couldn't refresh the student list ({result.reloadError}). Reload the page to see the new status.</p>
      )}
    </section>
  );
}
