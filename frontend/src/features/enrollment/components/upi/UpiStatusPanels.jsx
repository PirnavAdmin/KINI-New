import { motion, useReducedMotion } from "framer-motion";
import {
  FiAlertTriangle, FiArrowRight, FiCalendar, FiCheck, FiCheckCircle, FiClipboard,
  FiCreditCard, FiGrid, FiHome, FiInfo, FiLoader, FiMail, FiRefreshCw, FiXCircle,
} from "react-icons/fi";
import { GraduationCap, Trophy } from "lucide-react";
import { useThemeContext } from "@shared/context/ThemeContext";
import { BRAND } from "../../theme";
import { CopyButton, UpiCard } from "./upiUi";
import { DANGER, SUCCESS, formatDateTime, upiTheme } from "./upiTokens";

const STAGE_ORDER = ["awaiting-payment", "submitted", "verified", "approved"];
const reached = (stage, target) => STAGE_ORDER.indexOf(stage) >= STAGE_ORDER.indexOf(target);

const STATUS_PILL = {
  submitted: { label: "Under Verification", bg: "#FEF3C7", fg: "#92400E" },
  verified: { label: "Pending Approval", bg: "#DBEAFE", fg: "#1E40AF" },
  approved: { label: "Approved", bg: "#DCFCE7", fg: "#166534" },
  "payment-rejected": { label: "Payment Rejected", bg: "#FEE2E2", fg: "#991B1B" },
  "enrollment-rejected": { label: "Enrollment Rejected", bg: "#FEE2E2", fg: "#991B1B" },
};

export function StatusPill({ stage }) {
  const pill = STATUS_PILL[stage] ?? STATUS_PILL.submitted;
  return <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: pill.bg, color: pill.fg }}>{pill.label}</span>;
}

function Timeline({ stage, createdAt, submittedAt, verifiedAt, approvedAt, theme }) {
  const rejectedPayment = stage === "payment-rejected";
  const rejectedEnrollment = stage === "enrollment-rejected";
  const steps = [
    { label: "Enrollment Submitted", done: true, note: formatDateTime(createdAt) },
    { label: "Payment Submitted", done: true, note: formatDateTime(submittedAt) },
    {
      label: "Payment Verification",
      done: reached(stage, "verified") || rejectedEnrollment,
      failed: rejectedPayment,
      note: rejectedPayment ? "Rejected" : formatDateTime(verifiedAt) || "(By Organization)",
    },
    {
      label: "Enrollment Approval",
      done: stage === "approved",
      failed: rejectedEnrollment,
      note: rejectedEnrollment ? "Rejected" : formatDateTime(approvedAt) || "(By Organization)",
    },
  ];
  return (
    <ol className="grid grid-cols-4 gap-1 rounded-xl px-2 py-5 sm:px-4" style={{ backgroundColor: theme.panel }} aria-label="Enrollment progress">
      {steps.map((step, index) => {
        const color = step.failed ? DANGER : step.done ? SUCCESS : theme.border;
        const nextDone = steps[index + 1]?.done || steps[index + 1]?.failed;
        return (
          <li key={step.label} className="relative flex flex-col items-center text-center">
            {index < steps.length - 1 && (
              <span aria-hidden="true" className="absolute left-1/2 top-[14px] h-[2px] w-full" style={{ backgroundColor: nextDone ? SUCCESS : theme.border }} />
            )}
            <span
              className="relative z-[1] grid h-7 w-7 place-items-center rounded-full"
              style={{ backgroundColor: step.done || step.failed ? color : theme.card, border: `2px solid ${color}`, color: "#fff" }}
            >
              {step.failed ? <FiXCircle className="h-4 w-4" /> : step.done ? <FiCheck className="h-4 w-4" strokeWidth={3} /> : null}
            </span>
            <span className="mt-2 text-[11px] font-bold leading-tight sm:text-xs" style={{ color: theme.heading }}>{step.label}</span>
            {step.note && <span className="mt-1 text-[10px] leading-tight sm:text-[11px]" style={{ color: step.failed ? DANGER : theme.textMuted }}>{step.note}</span>}
          </li>
        );
      })}
    </ol>
  );
}

function HeroIcon({ tone, children }) {
  return (
    <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full" style={{ backgroundColor: `${tone}18` }}>
      {children}
    </div>
  );
}

/**
 * Screen after the UTR and screenshot are submitted: verification timeline,
 * and a resubmit path when the organization rejects the payment.
 */
export function UpiSubmittedPanel({ stage, record, refreshing, lastChecked, onRefresh, onResubmit, onHome, rejectionReason, statusError }) {
  const { isDark } = useThemeContext();
  const theme = upiTheme(isDark);
  const reduceMotion = useReducedMotion();
  const paymentRejected = stage === "payment-rejected";
  const enrollmentRejected = stage === "enrollment-rejected";
  const failed = paymentRejected || enrollmentRejected;

  const title = paymentRejected ? "Payment Could Not Be Verified"
    : enrollmentRejected ? "Enrollment Not Approved"
      : stage === "verified" ? "Payment Verified!" : "Payment Submitted Successfully!";
  const subtitle = paymentRejected ? "The organization couldn't match your payment details. Check the reason below and submit the correct UTR and screenshot."
    : enrollmentRejected ? "The organization did not approve this enrollment. Contact the institute if you think this is a mistake."
      : stage === "verified" ? "Payment verified. Waiting for enrollment approval."
        : "Payment proof submitted. Waiting for the organization to verify your payment.";

  return (
    <UpiCard theme={theme} className="p-5 text-center sm:p-8">
      <motion.div initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
        <HeroIcon tone={failed ? DANGER : SUCCESS}>
          {failed
            ? <FiAlertTriangle aria-hidden="true" className="h-11 w-11" style={{ color: DANGER }} />
            : (
              <>
                <FiClipboard aria-hidden="true" className="h-12 w-12" style={{ color: SUCCESS }} />
                <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full text-white ring-4" style={{ backgroundColor: SUCCESS, "--tw-ring-color": theme.card }}>
                  <FiCheck className="h-5 w-5" strokeWidth={3} />
                </span>
              </>
            )}
        </HeroIcon>
      </motion.div>
      <h2 className="mt-5 text-2xl font-bold sm:text-[28px]" style={{ color: theme.heading }}>{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed" style={{ color: theme.textSecondary }}>{subtitle}</p>
      {statusError && <p role="alert" className="mt-3 text-sm" style={{ color: DANGER }}>{statusError}</p>}

      {failed && rejectionReason && (
        <p className="mx-auto mt-4 max-w-lg rounded-xl px-4 py-3 text-left text-sm" style={{ backgroundColor: `${DANGER}10`, color: theme.textSecondary }}>
          <span className="font-semibold" style={{ color: DANGER }}>Reason: </span>{rejectionReason}
        </p>
      )}

      <div className="mt-6 text-left">
        <Timeline
          stage={stage}
          createdAt={record?.createdAt}
          submittedAt={record?.submittedAt}
          verifiedAt={record?.verifiedAt}
          approvedAt={record?.approvedAt}
          theme={theme}
        />
      </div>

      {!failed && (
        <div className="mt-5 rounded-xl p-4 text-left" style={{ backgroundColor: theme.panelStrong }}>
          <p className="flex items-center gap-2 text-sm font-bold" style={{ color: theme.heading }}>
            <FiInfo aria-hidden="true" className="h-4 w-4" style={{ color: theme.link }} /> What Happens Next?
          </p>
          <ul className="mt-2.5 space-y-2">
            {[
              "The organization will verify your UPI payment (usually within 4–8 working hours).",
              "Once the payment is verified, your enrollment will move to “Pending Approval”.",
              "After the organization approves your enrollment, you will get full access to the course.",
            ].map((line) => (
              <li key={line} className="flex gap-2 text-[13px] leading-snug" style={{ color: theme.textSecondary }}>
                <FiCheckCircle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: SUCCESS }} /> {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onHome}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
          style={{ border: `1px solid ${theme.border}`, color: theme.heading, backgroundColor: theme.card }}
        >
          <FiHome aria-hidden="true" className="h-4 w-4" /> Back to Home
        </button>
        <button
          type="button"
          onClick={paymentRejected ? onResubmit : onRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
          style={{ backgroundColor: BRAND.accent, boxShadow: "0 10px 22px -10px rgba(243,153,36,0.8)" }}
        >
          {paymentRejected
            ? <><FiRefreshCw aria-hidden="true" className="h-4 w-4" /> Resubmit Payment</>
            : refreshing
              ? <><FiLoader aria-hidden="true" className="h-4 w-4 animate-spin" /> Checking status…</>
              : <><FiGrid aria-hidden="true" className="h-4 w-4" /> View Enrollment Status <FiArrowRight aria-hidden="true" className="h-4 w-4" /></>}
        </button>
      </div>
      {lastChecked && !paymentRejected && (
        <p className="mt-3 text-right text-[11px]" style={{ color: theme.textMuted }} aria-live="polite">
          Status checked {lastChecked.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · updates automatically
        </p>
      )}
    </UpiCard>
  );
}

/** Screen once the organization approves the enrollment. */
export function UpiApprovedPanel({ approvedAt, primaryLabel, onPrimary, onHome, accountReady = false }) {
  const { isDark } = useThemeContext();
  const theme = upiTheme(isDark);
  const reduceMotion = useReducedMotion();
  const confetti = ["#F39924", "#2D6A9F", "#16A34A", "#E11D48", "#8B5CF6", "#06B6D4"];
  return (
    <UpiCard theme={theme} className="relative overflow-hidden p-5 text-center sm:p-8">
      <div className="relative mx-auto h-28 w-40">
        {!reduceMotion && confetti.flatMap((color, i) => [0, 1].map((k) => (
          <motion.span
            key={`${color}-${k}`}
            aria-hidden="true"
            className="absolute h-2 w-1 rounded-sm"
            style={{ backgroundColor: color, left: `${8 + ((i * 2 + k) * 7.5)}%`, top: `${k ? 10 : 30}%` }}
            initial={{ opacity: 0, y: 10, rotate: 0 }}
            animate={{ opacity: [0, 1, 1], y: [10, -6, 0], rotate: (i + k) % 2 ? 35 : -35 }}
            transition={{ duration: 0.9, delay: 0.05 * (i + k) }}
          />
        )))}
        <motion.div
          initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          className="absolute inset-x-0 bottom-0 mx-auto grid h-24 w-24 place-items-center rounded-full"
          style={{ backgroundColor: `${SUCCESS}18` }}
        >
          <GraduationCap aria-hidden="true" className="h-12 w-12" style={{ color: BRAND.primary }} />
          <span className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full text-white" style={{ backgroundColor: SUCCESS }}>
            <FiCheck className="h-4 w-4" strokeWidth={3} />
          </span>
        </motion.div>
      </div>

      <h2 className="mt-4 text-3xl font-bold" style={{ color: theme.heading }}>Congratulations!</h2>
      <p className="mt-1 text-lg font-semibold" style={{ color: theme.heading }}>{accountReady ? "Payment complete. Your enrollment is approved." : "Enrollment approved. Check your email to set your password."}</p>
      <p className="mt-1 text-sm" style={{ color: theme.textSecondary }}>{accountReady ? "Your account is ready. Sign in to access your course." : "Use the secure account activation link sent to your registered email address."}</p>

      <div className="mt-6 grid gap-3 rounded-xl px-4 py-4 text-left sm:grid-cols-2 sm:divide-x" style={{ backgroundColor: theme.panel, borderColor: theme.divider }}>
        <div className="flex items-center gap-3">
          <FiCheckCircle aria-hidden="true" className="h-8 w-8 shrink-0" style={{ color: SUCCESS }} />
          <div>
            <p className="text-xs" style={{ color: theme.textMuted }}>Enrollment Status</p>
            <p className="text-lg font-bold" style={{ color: SUCCESS }}>Approved</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:pl-5" style={{ borderColor: theme.divider }}>
          <FiCalendar aria-hidden="true" className="h-7 w-7 shrink-0" style={{ color: theme.link }} />
          <div>
            <p className="text-xs" style={{ color: theme.textMuted }}>Approval Date</p>
            <p className="text-sm font-bold" style={{ color: theme.heading }}>{formatDateTime(approvedAt) || "Today"}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-xl p-4 text-left" style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.panelStrong }}>
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${BRAND.secondary}, ${BRAND.primary})` }}>
          <FiMail aria-hidden="true" className="h-7 w-7" />
        </span>
        <div>
          <p className="text-base font-bold" style={{ color: theme.heading }}>Check Your Email</p>
          <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: theme.textSecondary }}>
            {accountReady ? "Sign in using your existing password. Your password has not been changed." : "Check your inbox and spam folder for the expiring password setup link. Your password is never sent by email."}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onPrimary}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold text-white transition-transform hover:-translate-y-0.5"
        style={{ background: `linear-gradient(90deg, ${BRAND.accent}, #F7B24A)`, boxShadow: "0 10px 22px -10px rgba(243,153,36,0.8)" }}
      >
        <FiMail aria-hidden="true" className="h-4 w-4" /> {primaryLabel} <FiArrowRight aria-hidden="true" className="h-4 w-4" />
      </button>
      <button type="button" onClick={onHome} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color: theme.link }}>
        <FiHome aria-hidden="true" className="h-4 w-4" /> Back to Home
      </button>
    </UpiCard>
  );
}

/** Right column on the submitted screen. */
export function UpiPaymentDetailsCard({ stage, utrNumber, submittedAt, method = "UPI" }) {
  const { isDark } = useThemeContext();
  const theme = upiTheme(isDark);
  const rows = [
    ["Payment Method", <span key="m" className="font-semibold">{method}</span>],
    ["UTR / Transaction ID", (
      <span key="u" className="inline-flex items-center gap-1 font-semibold">
        <span className="max-w-[140px] truncate" title={utrNumber}>{utrNumber || "—"}</span>
        <CopyButton value={utrNumber} label="UTR" theme={theme} />
      </span>
    )],
    ["Submitted On", <span key="s">{formatDateTime(submittedAt) || "—"}</span>],
    ["Status", <StatusPill key="p" stage={stage} />],
  ];
  return (
    <UpiCard theme={theme} className="overflow-hidden">
      <h3 className="flex items-center gap-2 px-5 py-3.5 text-base font-bold" style={{ color: theme.heading, borderBottom: `1px solid ${theme.divider}`, backgroundColor: theme.panel }}>
        <FiCreditCard aria-hidden="true" className="h-4 w-4" style={{ color: theme.link }} /> Payment Details
      </h3>
      <dl className="divide-y px-5 text-[13px]" style={{ borderColor: theme.divider }}>
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 py-2.5" style={{ borderColor: theme.divider }}>
            <dt style={{ color: theme.textSecondary }}>{label}</dt>
            <dd className="text-right" style={{ color: theme.text }}>{value}</dd>
          </div>
        ))}
      </dl>
    </UpiCard>
  );
}

/** Right column on the approved screen. */
export function UpiApprovedAside() {
  const { isDark } = useThemeContext();
  const theme = upiTheme(isDark);
  return (
    <div className="space-y-3">
      <UpiCard theme={theme} className="space-y-2.5 px-5 py-4">
        {["Payment Verified", "Enrollment Approved"].map((label) => (
          <p key={label} className="flex items-center gap-2.5 text-sm font-semibold" style={{ color: theme.heading }}>
            <FiCheckCircle aria-hidden="true" className="h-5 w-5" style={{ color: SUCCESS }} /> {label}
          </p>
        ))}
      </UpiCard>
      <UpiCard theme={theme} className="flex items-center gap-4 px-5 py-4" style={{ border: `1px solid ${theme.border}`, background: isDark ? theme.card : "linear-gradient(135deg, #FFF7EB, #FFFFFF)", boxShadow: theme.shadow }}>
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${BRAND.accent}22` }}>
          <Trophy aria-hidden="true" className="h-8 w-8" style={{ color: BRAND.accent }} />
        </span>
        <div>
          <p className="text-base font-bold" style={{ color: theme.heading }}>Keep Learning!</p>
          <p className="text-[13px]" style={{ color: theme.textSecondary }}>Your journey towards better skills starts now.</p>
        </div>
      </UpiCard>
    </div>
  );
}
