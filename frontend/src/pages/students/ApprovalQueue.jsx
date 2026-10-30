import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Eye,
  FlaskConical,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { ENROLLMENT_APPROVAL_EVENT } from "@shared/services/enrollmentApprovalStore";
import { demoPaymentApi } from "@shared/services/demoPaymentApi";
import { StudentAvatar } from "./StudentBadges";
import DemoEnrollmentCard from "./DemoEnrollmentCard";
import ApproveStudentDialog from "./ApproveStudentDialog";
import ProvisionStudentDialog from "./ProvisionStudentDialog";
import { buildApprovalQueue } from "./studentApproval";

export default function ApprovalQueue({
  students = [],
  enrollmentApprovals = [],
  onReviewEnrollment,
  notify,
  onView,
  onApprove,
  onReject,
  refreshStudents,
}) {
  const [busyId, setBusyId] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [provisionTarget, setProvisionTarget] = useState(null);

  const { items, demoLinks } = buildApprovalQueue(students, enrollmentApprovals);

  // A demo payment with no backend student: every unlinked demo request of
  // that email is reviewed together, so one backend student is created.
  const unlinkedSiblings = (request) => demoLinks
    .filter((link) => !link.liveStudent && !link.ambiguous)
    .map((link) => link.request)
    .filter((other) => String(other.student?.email).trim().toLowerCase() === String(request.student?.email).trim().toLowerCase());

  // Opens the confirmation dialog for a backend student; the dialog makes the live call.
  const handleApprove = (person) => {
    if (approveTarget) return;
    const studentId = Number(person.studentId ?? person.id);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      notify(`Can't approve ${person.name}: this record has no backend student ID.`);
      return;
    }
    setApproveTarget({ studentId, name: person.name, email: person.email, course: person.course, demoRequests: person.demoRequests ?? [] });
  };

  // After the backend confirms, mark any folded demo payment requests as
  // approved through the live backend (no demo account, no demo email).
  const settleApproval = async (target) => {
    if (!target.demoRequests.length) return;
    const results = await Promise.allSettled(target.demoRequests.map((request) => demoPaymentApi.recordLiveApproval(request.id, target.studentId)));
    if (results.some((result) => result.status === "rejected")) {
      notify(`${target.name} is approved in the backend, but the demo payment record couldn't be updated.`);
    }
    window.dispatchEvent(new CustomEvent(ENROLLMENT_APPROVAL_EVENT));
  };
  const handleReject = async (person) => {
    if (busyId || !onReject) return;
    setBusyId(person.id);
    try {
      await onReject(person.id);
      notify(`${person.name} rejected`);
    } catch (error) {
      notify(error?.message || `Unable to reject ${person.name}`);
    } finally {
      setBusyId(null);
    }
  };
  return (
    <div>
      {items.length === 0 ? (
        <div className="grid min-h-80 place-items-center rounded-[16px] border border-[#E2EAF5] bg-white text-center shadow-[0_4px_18px_rgba(38,83,130,.05)]">
          <div>
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="mt-3 font-semibold text-[#12365B]">All caught up!</p>
            <p className="mt-1 text-sm text-slate-500">
              No registrations need review.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {items.map((person) => person.kind === "demo-enrollment" ? (
            <DemoEnrollmentCard
              key={person.id}
              request={person}
              linkedStudent={person.linkedStudent}
              ambiguousLink={person.ambiguousLink}
              notify={notify}
              onProvision={refreshStudents && onApprove ? () => setProvisionTarget(unlinkedSiblings(person)) : undefined}
            />
          ) : (
            <article
              key={person.id}
              className="rounded-[16px] border border-[#E2EAF5] bg-white p-5 shadow-[0_4px_18px_rgba(38,83,130,.06)]"
            >
              <div className="flex items-start gap-3">
                <StudentAvatar name={person.name} className="h-11 w-11 text-sm" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#12365B]">
                    {person.name}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-[#0877F9]">
                    {person.course}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Registered {person.time || person.registrationDate || "recently"}
                  </p>
                </div>
                {person.payment && (
                  <span
                    className={`ml-auto rounded-full px-2 py-1 text-[10px] font-semibold ${person.payment === "Paid" ? "bg-emerald-50 text-emerald-700" : person.payment === "Pending" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}
                  >
                    {person.payment}
                  </span>
                )}
              </div>
              <div className="mt-4 grid gap-2 rounded bg-slate-50 p-3 text-xs text-slate-600">
                <span className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  {person.email}
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  {person.mobile}
                </span>
              </div>
              {person.demoRequests?.length > 0 && (
                <div className="mt-3 rounded border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                  <p className="flex items-center gap-1.5 font-semibold">
                    <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
                    Demo payment matched by email
                  </p>
                  <ul className="mt-1.5 space-y-0.5">
                    {person.demoRequests.map((request) => (
                      <li key={request.id} className="flex justify-between gap-3">
                        <span>{request.courseName}</span>
                        <span className="font-mono text-[11px]">{request.transactionId}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {person.kind === 'enrollment' && person.requests?.length > 1 && <div className="mt-3 flex flex-wrap gap-2">{person.requests.slice(1).map(request => <button key={request.id} type="button" className="rounded border px-2 py-1 text-xs" onClick={() => onReviewEnrollment?.(request.raw)}>Review {request.course}</button>)}</div>}
              {person.docs && Object.keys(person.docs).length > 0 && <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Documents
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(person.docs || {}).map(([label, valid]) => (
                    <span
                      key={label}
                      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium ${valid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                    >
                      {valid ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      {label}
                    </span>
                  ))}
                </div>
              </div>}
              <div className="mt-5 flex flex-wrap gap-2">
                {person.kind === "enrollment" ? (
                  <button
                    onClick={() => onReviewEnrollment?.(person.raw)}
                    className="inline-flex items-center gap-1 rounded bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Review & approve
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={busyId === person.id || Boolean(approveTarget)}
                      onClick={() => handleApprove(person)}
                      className="inline-flex items-center gap-1 rounded bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {approveTarget?.studentId === Number(person.studentId ?? person.id) ? "Approving…" : "Approve"}
                    </button>
                    {onReject && (
                      <button
                        disabled={busyId === person.id}
                        onClick={() => handleReject(person)}
                        className="inline-flex items-center gap-1 rounded bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <X className="h-3.5 w-3.5" />
                        {busyId === person.id ? "Rejecting…" : "Reject"}
                      </button>
                    )}
                  </>
                )}
                <button
                  aria-label={`View ${person.name}`}
                  onClick={() => person.kind === "enrollment" ? onReviewEnrollment?.(person.raw) : onView(person)}
                  className="ml-auto grid h-8 w-8 place-items-center rounded hover:bg-slate-100"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {provisionTarget && (
        <ProvisionStudentDialog
          key={provisionTarget.map((request) => request.id).join(",")}
          requests={provisionTarget}
          refreshStudents={refreshStudents}
          approve={onApprove}
          onClose={() => setProvisionTarget(null)}
        />
      )}
      {approveTarget && (
        <ApproveStudentDialog
          key={approveTarget.studentId}
          target={approveTarget}
          approve={onApprove}
          onSettled={() => settleApproval(approveTarget)}
          onClose={() => setApproveTarget(null)}
        />
      )}
    </div>
  );
}
