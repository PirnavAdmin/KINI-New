import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Mail,
  RefreshCw,
  XCircle,
} from "lucide-react";
import EnrollmentShell, { EnrollmentCard, EnrollmentNotice } from "../components/EnrollmentShell";
import { formatRupees, primaryButtonClass, primaryButtonStyle, secondaryButtonClass } from "../utils/enrollmentUi";
import { EnrollmentAccessProblem } from "./UpiPaymentPage";
import useEnrollmentToken from "../hooks/useEnrollmentToken";
import { BRAND } from "../theme";
import { ROUTES } from "@shared/constants/routeConstants";
import {
  enrollmentAccess,
  enrollmentRoutes,
  publicEnrollmentApi,
  toEnrollmentError,
} from "@shared/services/publicEnrollmentApi";

const POLL_MS = 15000;
// Stages that change only when the organization acts: keep polling.
const WAITING_STAGES = new Set(["PaymentSubmitted", "PaymentVerified", "EnrollmentApproved"]);

const STEPS = [
  { key: "enrolled", label: "Enrollment saved" },
  { key: "submitted", label: "Payment submitted" },
  { key: "verified", label: "Payment verified" },
  { key: "approved", label: "Enrollment approved" },
  { key: "active", label: "Account activated" },
];

// How far along the timeline each stage is (index of the last completed step).
const STAGE_PROGRESS = {
  AwaitingPayment: 0,
  PaymentRejected: 0,
  PaymentSubmitted: 1,
  PaymentVerified: 2,
  EnrollmentApproved: 3,
  AccountActive: 4,
  EnrollmentRejected: 2,
  Cancelled: 0,
};

const STAGE_VIEW = {
  AwaitingPayment: { tone: "info", icon: Clock, title: "Payment pending" },
  PaymentSubmitted: { tone: "info", icon: Clock, title: "Payment Submitted – Waiting for Organization Verification" },
  PaymentVerified: { tone: "success", icon: BadgeCheck, title: "Payment Verified – Awaiting Enrollment Approval" },
  PaymentRejected: { tone: "warning", icon: AlertTriangle, title: "Payment rejected — resubmit payment proof" },
  EnrollmentApproved: { tone: "success", icon: Mail, title: "Enrollment approved — check your email for password setup" },
  AccountActive: { tone: "success", icon: CheckCircle2, title: "Account activated — continue to student login" },
  EnrollmentRejected: { tone: "error", icon: XCircle, title: "Enrollment not approved" },
  Cancelled: { tone: "error", icon: XCircle, title: "Enrollment cancelled" },
};

export default function EnrollmentStatusPage() {
  const { enrollmentId } = useParams();
  const token = useEnrollmentToken(enrollmentId);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const inFlight = useRef(false);

  // Fetches and applies the status; state is only set from the promise.
  const fetchStatus = useCallback(() => {
    if (!token || inFlight.current) return Promise.resolve();
    inFlight.current = true;
    return publicEnrollmentApi.getStatus(enrollmentId, token)
      .then((data) => {
        setStatus(data);
        setError(null);
        setLastChecked(new Date());
        enrollmentAccess.save(enrollmentId, { enrollmentNumber: data.enrollmentNumber, courseName: data.courseName, stage: data.stage });
      })
      // A transient network error keeps the last known status on screen.
      .catch((err) => setError(toEnrollmentError(err)))
      .finally(() => { inFlight.current = false; });
  }, [enrollmentId, token]);

  const load = useCallback(() => {
    setRefreshing(true);
    fetchStatus().finally(() => setRefreshing(false));
  }, [fetchStatus]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Secure polling: only while waiting on the organization and the tab is visible.
  const waiting = status ? WAITING_STAGES.has(status.stage) : false;
  useEffect(() => {
    if (!waiting) return undefined;
    const tick = () => { if (document.visibilityState === "visible") fetchStatus(); };
    const timer = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [waiting, fetchStatus]);

  const fatal = error && !error.network && !status;
  if (!token || fatal) return <EnrollmentAccessProblem error={error} />;

  if (!status) {
    return (
      <EnrollmentShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-sm text-slate-500" role="status">
          {error?.network ? (
            <>
              <AlertTriangle className="h-6 w-6 text-amber-500" aria-hidden="true" />
              <p>{error.message}</p>
              <button type="button" onClick={load} className={secondaryButtonClass}>Try again</button>
            </>
          ) : (
            <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading enrollment status…</>
          )}
        </div>
      </EnrollmentShell>
    );
  }

  const view = STAGE_VIEW[status.stage] ?? STAGE_VIEW.AwaitingPayment;
  const progress = STAGE_PROGRESS[status.stage] ?? 0;
  const rejected = status.stage === "EnrollmentRejected";
  const others = enrollmentAccess.list().filter((entry) => String(entry.enrollmentId) !== String(enrollmentId));

  return (
    <EnrollmentShell width="max-w-4xl">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Enrollment {status.enrollmentNumber}
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          <span style={{ color: BRAND.primary }} className="dark:!text-white">Enrollment status</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {status.courseName} · {status.organizationName}
        </p>
      </header>

      <EnrollmentNotice
        tone={view.tone}
        icon={view.icon}
        title={view.title}
        action={<StageAction status={status} enrollmentId={enrollmentId} />}
      >
        <p>{status.message}</p>
        {status.paymentRejectionReason && <p className="mt-1"><strong>Reason:</strong> {status.paymentRejectionReason}</p>}
        {status.enrollmentRejectionReason && <p className="mt-1"><strong>Reason:</strong> {status.enrollmentRejectionReason}</p>}
      </EnrollmentNotice>

      {error?.network && (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-300" role="status">
          Couldn't refresh just now — showing the last known status. {error.message}
        </p>
      )}

      <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <EnrollmentCard aria-labelledby="progress-heading">
          <div className="flex items-center justify-between gap-2">
            <h2 id="progress-heading" className="text-base font-bold">Progress</h2>
            <button
              type="button"
              onClick={load}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-60 dark:hover:bg-white/10"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" /> Check status
            </button>
          </div>
          <ol className="mt-4 space-y-3">
            {STEPS.map((step, index) => {
              const done = index <= progress && !(rejected && index > 2);
              const failed = rejected && index === 3;
              const Icon = failed ? XCircle : done ? CheckCircle2 : Circle;
              return (
                <li key={step.key} className="flex items-center gap-3 text-sm">
                  <Icon
                    className={`h-5 w-5 shrink-0 ${failed ? "text-rose-500" : done ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"}`}
                    aria-hidden="true"
                  />
                  <span className={done || failed ? "font-semibold" : "text-slate-500"}>
                    {failed ? "Enrollment not approved" : step.label}
                  </span>
                  <span className="sr-only">{failed ? "(not approved)" : done ? "(done)" : "(pending)"}</span>
                </li>
              );
            })}
          </ol>
          {waiting && (
            <p className="mt-4 text-xs text-slate-500">
              This page checks for updates automatically{lastChecked ? ` · last checked ${lastChecked.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}.
            </p>
          )}
        </EnrollmentCard>

        <EnrollmentCard aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="text-base font-bold">Summary</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <Row label="Student" value={status.studentName} />
            <Row label="Course" value={status.courseName} />
            <Row label="Organization" value={status.organizationName} />
            <Row label="Course fee" value={formatRupees(status.feeAmount)} />
            {status.latestPayment && (
              <>
                <Row label="UTR" value={<span className="font-mono">{status.latestPayment.utrNumber}</span>} />
                <Row label="Payment date" value={new Date(status.latestPayment.paymentDate).toLocaleDateString("en-IN")} />
                <Row label="Payment status" value={status.latestPayment.status} />
              </>
            )}
          </dl>
        </EnrollmentCard>
      </div>

      {others.length > 0 && (
        <EnrollmentCard className="mt-5" aria-labelledby="others-heading">
          <h2 id="others-heading" className="text-base font-bold">Your other enrollments</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-white/10">
            {others.map((entry) => (
              <li key={entry.enrollmentId} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="min-w-0">
                  <span className="font-semibold">{entry.courseName || `Enrollment ${entry.enrollmentNumber || entry.enrollmentId}`}</span>
                  {entry.enrollmentNumber && <span className="ml-2 text-xs text-slate-500">{entry.enrollmentNumber}</span>}
                </span>
                <span className="flex gap-3 text-xs font-semibold">
                  <Link to={enrollmentRoutes.payment(entry.enrollmentId)} className="text-sky-700 hover:underline dark:text-sky-300">Pay</Link>
                  <Link to={enrollmentRoutes.status(entry.enrollmentId)} className="text-sky-700 hover:underline dark:text-sky-300">Status</Link>
                </span>
              </li>
            ))}
          </ul>
        </EnrollmentCard>
      )}
    </EnrollmentShell>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function StageAction({ status, enrollmentId }) {
  switch (status.stage) {
    case "AwaitingPayment":
    case "PaymentRejected":
      return status.canSubmitPayment ? (
        <Link to={enrollmentRoutes.payment(enrollmentId)} className={primaryButtonClass} style={primaryButtonStyle}>
          {status.stage === "PaymentRejected" ? "Resubmit payment proof" : "Pay now"}
        </Link>
      ) : null;
    case "EnrollmentApproved":
      return (
        <p className="text-xs">
          We emailed a one-time password setup link to your address. It expires after a while — if it has, ask {status.organizationName} to resend it.
        </p>
      );
    case "AccountActive":
      return (
        <Link to={ROUTES.AUTH.LOGIN} className={primaryButtonClass} style={primaryButtonStyle}>
          Continue to student login
        </Link>
      );
    default:
      return null;
  }
}
