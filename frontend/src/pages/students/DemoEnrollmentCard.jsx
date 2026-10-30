import { useState } from "react";
import { Check, CreditCard, FlaskConical, Layers, Mail, Phone, Receipt, X } from "lucide-react";
import { ENROLLMENT_APPROVAL_EVENT } from "@shared/services/enrollmentApprovalStore";
import { demoPaymentApi } from "@shared/services/demoPaymentApi";
import { StudentAvatar } from "./StudentBadges";

const formatInr = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "recently" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

/**
 * A Demo Payment Mode enrollment request in the Pending Approval queue.
 *
 * linkedStudent: the live backend student this payment maps to (by stored
 * id or a unique email), if any; a pending one is shown on that student's
 * own card instead. Without a link, Approve opens onProvision, which creates
 * the student in the live backend and approves them there. Reject stays in
 * the demo backend because no backend record exists yet.
 */
const ACTIVE_STATUSES = ["active", "approved", "enrolled"];

export default function DemoEnrollmentCard({ request, linkedStudent = null, ambiguousLink = false, notify, onProvision }) {
  const [busy, setBusy] = useState(null);
  const [confirmReject, setConfirmReject] = useState(false);
  const others = (request.orderCourseCount ?? 1) - 1;
  const liveStatus = String(linkedStudent?.status ?? "");
  const liveActive = Boolean(linkedStudent) && ACTIVE_STATUSES.includes(liveStatus.trim().toLowerCase());
  const approveBlocked = ambiguousLink || (Boolean(linkedStudent) && !liveActive) || (!linkedStudent && !onProvision);

  const act = async (action) => {
    if (busy) return;
    if (action === "approve" && !linkedStudent) {
      onProvision?.();
      return;
    }
    setBusy(action);
    try {
      if (action === "approve" && liveActive) {
        // Already approved in the live backend: record it, send nothing new.
        for (const entry of request.requests ?? [request]) await demoPaymentApi.recordLiveApproval(entry.id, linkedStudent.id);
        notify(`Recorded ${request.course} as approved for backend student #${linkedStudent.id}. No new email was sent.`);
      } else if (action === "approve") {
        const result = await demoPaymentApi.approveEnrollmentRequest(request.id);
        notify(result.account?.status === "Active"
          ? `${request.name} approved. They were notified that ${request.course} is ready.`
          : `${request.name} approved. Activation email queued for ${request.student.email}.`);
      } else {
        for (const entry of request.requests ?? [request]) await demoPaymentApi.rejectEnrollmentRequest(entry.id);
        notify(`${request.name}'s enrollment in ${request.course} was rejected`);
      }
      window.dispatchEvent(new CustomEvent(ENROLLMENT_APPROVAL_EVENT));
    } catch (error) {
      notify(error?.message || `Unable to ${action} ${request.name}`);
    } finally {
      setBusy(null);
      setConfirmReject(false);
    }
  };

  const facts = [
    [Receipt, "Amount", formatInr(request.amount)],
    [Layers, "Batch", request.batch?.name ?? "Assign on approval"],
    [CreditCard, "Payment method", request.paymentMethod],
    [Receipt, "Demo transaction", request.transactionId],
  ];

  return (
    <article className="rounded-[16px] border border-amber-200 bg-white p-5 shadow-[0_4px_18px_rgba(38,83,130,.06)]">
      <div className="flex items-start gap-3">
        <StudentAvatar name={request.name} className="h-11 w-11 text-sm" />
        <div className="min-w-0">
          <h3 className="font-semibold text-[#12365B]">{request.name}</h3>
          <p className="mt-0.5 text-xs font-medium text-[#0877F9]">
            {request.course}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Paid {formatDate(request.createdAt)}
            {others > 0 && `, together with ${others} other course${others > 1 ? "s" : ""}`}
          </p>
        </div>
        <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800">
          <FlaskConical className="h-3 w-3" aria-hidden="true" />
          Demo payment
        </span>
      </div>

      <div className="mt-4 grid gap-2 rounded bg-slate-50 p-3 text-xs text-slate-600">
        <span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{request.student.email}</span>
        <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{request.student.phone}</span>
      </div>

      <dl className="mt-3 grid gap-1.5 text-xs">
        {facts.map(([Icon, label, value]) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <dt className="text-slate-500">{label}</dt>
            <dd className="ml-auto truncate font-medium text-[#12365B]">{value}</dd>
          </div>
        ))}
      </dl>

      <p className={`mt-3 rounded px-2.5 py-2 text-[11px] leading-4 ${linkedStudent || ambiguousLink ? "bg-sky-50 text-sky-900" : "bg-amber-50 text-amber-900"}`}>
        {ambiguousLink
          ? "Several backend students share this email, so this payment can't be matched to one. Approve the right student from the Student List."
          : linkedStudent
            ? liveActive
              ? `Backend student #${linkedStudent.id} with this email is already ${liveStatus}. Approving records this course against that student; no new email is sent.`
              : `Backend student #${linkedStudent.id} with this email is ${liveStatus || "in an unknown state"}. Resolve it in the Student List first.`
            : "No backend student has this email yet. Approve creates the student in the backend, then approves them there."}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded px-2 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700">Payment: Demo success</span>
        <span className="rounded px-2 py-1 text-[11px] font-medium bg-amber-50 text-amber-800">Enrollment: Pending approval</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={Boolean(busy) || approveBlocked}
          onClick={() => act("approve")}
          className="inline-flex items-center gap-1 rounded bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Check className="h-3.5 w-3.5" />
          {busy === "approve" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => (confirmReject ? act("reject") : setConfirmReject(true))}
          onBlur={() => setConfirmReject(false)}
          className="inline-flex items-center gap-1 rounded bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X className="h-3.5 w-3.5" />
          {busy === "reject" ? "Rejecting…" : confirmReject ? "Confirm reject" : "Reject"}
        </button>
      </div>
    </article>
  );
}
