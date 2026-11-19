import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  History,
  Loader2,
  MailPlus,
  Search,
  UserCheck,
  XCircle,
} from "lucide-react";
import {
  OrgEmpty,
  OrgHero,
  OrgPage,
  OrgSearch,
  OrgSelect,
  OrgStatus,
  OrgTableFooter,
} from "../components/org-ui/OrgPageKit";
import ReviewDialog, { DetailList } from "../components/enrollment-review/ReviewDialog";
import {
  formatAmount,
  formatDateTime,
  useDebounced,
  usePagedList,
} from "../components/enrollment-review/reviewFormat";
import { enrollmentReviewApi, publicEnrollmentApi, toEnrollmentError } from "@shared/services/publicEnrollmentApi";

const PAGE_SIZE = 20;
const STATUS_OPTIONS = [
  ["PendingApproval", "Waiting for approval"],
  ["Approved", "Approved"],
  ["Rejected", "Rejected"],
  ["all", "All verified enrollments"],
];
const ENROLLMENT_TONE = { PendingApproval: "warn", Approved: "success", Rejected: "danger" };
const ENROLLMENT_LABEL = { PendingApproval: "Pending approval", Approved: "Approved", Rejected: "Rejected" };
const ACCOUNT_LABEL = { NotCreated: "No account yet", PendingSetup: "Waiting for password setup", Active: "Active", ProvisioningFailed: "Provisioning failed — retry" };
const ACCOUNT_TONE = { NotCreated: "muted", PendingSetup: "info", Active: "success", ProvisioningFailed: "danger" };

/**
 * Organization → Student Enrollment Approval. Only enrollments whose UPI
 * payment has already been verified are listed. Approval creates (or links)
 * the student account and emails a one-time password setup link.
 */
export default function EnrollmentApprovals() {
  const [status, setStatus] = useState("PendingApproval");
  const [query, setQuery] = useState("");
  const search = useDebounced(query);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null); // { mode: "approve" | "reject" | "history", item }
  const [resending, setResending] = useState(null);
  // Back to page 1 whenever the filter or search changes.
  const [filterKey, setFilterKey] = useState(`${status}|${search}`);
  if (filterKey !== `${status}|${search}`) {
    setFilterKey(`${status}|${search}`);
    setPage(1);
  }
  const list = usePagedList(enrollmentReviewApi.getApprovals, { status, search: search || undefined, page, pageSize: PAGE_SIZE });
  const result = list;
  const loading = list.loading;
  const error = list.error ? toEnrollmentError(list.error) : null;
  const load = list.reload;

  const resend = async (item) => {
    setResending(item.enrollmentId);
    try {
      const response = await enrollmentReviewApi.resendSetupLink(item.enrollmentId);
      if (response.setupEmailSent) toast.success("A new password setup link was emailed");
      else toast.error(response.message);
      load();
    } catch (err) {
      toast.error(toEnrollmentError(err).message);
    } finally {
      setResending(null);
    }
  };

  const done = () => {
    setDialog(null);
    load();
  };

  return (
    <OrgPage>
      <OrgHero
        icon={ClipboardCheck}
        title="Student Enrollment Approval"
        subtitle="Approve enrollments whose payment has been verified. Approval creates the student account and emails a secure password setup link."
        plain
      />

      <div className="kx-toolbar" role="search">
        <OrgSearch icon={Search} value={query} onChange={setQuery} placeholder="Search name, email, phone or enrollment no." label="Search enrollments" />
        <OrgSelect label="Filter by status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
      </div>

      <section className="kx-panel kx-panel--flush" aria-label="Enrollments">
        {error ? (
          <div className="kx-note kx-note--error" role="alert">
            <AlertTriangle aria-hidden="true" />
            <span>{error.status === 403 ? "You don't have permission to approve enrollments. Ask your organization admin for the “Enrollment Approval” permission." : error.message}</span>
            {error.status !== 403 && <button type="button" className="kx-note__action" onClick={load}>Retry</button>}
          </div>
        ) : (
          <>
            <div className="kx-table-wrap">
              <table className="kx-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course / batch</th>
                    <th className="kx-num">Fee</th>
                    <th>Verified payment</th>
                    <th>Status</th>
                    <th>Account</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, row) => (
                      <tr key={row}>
                        {Array.from({ length: 7 }).map((__, cell) => (
                          <td key={cell}><span className="kx-skel" style={{ display: "block", height: 16, width: "70%" }} /></td>
                        ))}
                      </tr>
                    ))
                  ) : result.data.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <OrgEmpty
                          icon={UserCheck}
                          title={status === "PendingApproval" ? "No enrollments waiting for approval" : "No enrollments found"}
                          text="Enrollments appear here after their payment is verified on the Payment Verification page."
                        />
                      </td>
                    </tr>
                  ) : (
                    result.data.map((item) => (
                      <tr key={item.enrollmentId}>
                        <td>
                          <span className="kx-strong">{item.studentName}</span>
                          <span className="kx-cell-sub">{item.email} · {item.phone}</span>
                        </td>
                        <td>
                          {item.courseName}
                          <span className="kx-cell-sub">{item.batchName || "Batch to assign"} · {item.enrollmentNumber}</span>
                        </td>
                        <td className="kx-num">{formatAmount(item.feeAmount)}</td>
                        <td>
                          <span className="font-mono text-sm">{item.verifiedUtrNumber || "—"}</span>
                          <span className="kx-cell-sub">{formatDateTime(item.paymentVerifiedAt)}</span>
                        </td>
                        <td><OrgStatus tone={ENROLLMENT_TONE[item.enrollmentStatus] ?? "muted"} dot>{ENROLLMENT_LABEL[item.enrollmentStatus] ?? item.enrollmentStatus}</OrgStatus></td>
                        <td>
                          <OrgStatus tone={ACCOUNT_TONE[item.accountStatus] ?? "muted"}>{ACCOUNT_LABEL[item.accountStatus] ?? item.accountStatus}</OrgStatus>
                          {item.existingAccount && item.enrollmentStatus === "PendingApproval" && <span className="kx-cell-sub">Existing account — will be linked</span>}
                          {item.lastProvisioningError && <span className="kx-cell-sub" style={{ color: "#e5484d" }}>{item.lastProvisioningError}</span>}
                        </td>
                        <td>
                          <div className="kx-cell-actions">
                            {item.enrollmentStatus === "PendingApproval" && (
                              <>
                                <button type="button" className="kx-btn kx-btn--primary kx-btn--sm" onClick={() => setDialog({ mode: "approve", item })}>
                                  <CheckCircle2 aria-hidden="true" /> Approve
                                </button>
                                <button type="button" className="kx-btn kx-btn--ghost kx-btn--sm" onClick={() => setDialog({ mode: "reject", item })}>
                                  <XCircle aria-hidden="true" /> Reject
                                </button>
                              </>
                            )}
                            {item.enrollmentStatus === "Approved" && item.accountStatus === "PendingSetup" && (
                              <button type="button" className="kx-btn kx-btn--soft kx-btn--sm" onClick={() => resend(item)} disabled={resending === item.enrollmentId}>
                                {resending === item.enrollmentId ? <Loader2 className="animate-spin" aria-hidden="true" /> : <MailPlus aria-hidden="true" />} Resend setup link
                              </button>
                            )}
                            <button type="button" className="kx-icon-btn" onClick={() => setDialog({ mode: "history", item })} aria-label={`History for ${item.studentName}`} title="History">
                              <History aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loading && result.totalRecords > 0 && (
              <OrgTableFooter page={page} pageSize={PAGE_SIZE} total={result.totalRecords} noun={result.totalRecords === 1 ? "enrollment" : "enrollments"} onPageChange={setPage} />
            )}
          </>
        )}
      </section>

      {dialog?.mode === "approve" && <ApproveDialog item={dialog.item} onClose={() => setDialog(null)} onDone={done} />}
      {dialog?.mode === "reject" && <RejectDialog item={dialog.item} onClose={() => setDialog(null)} onDone={done} />}
      {dialog?.mode === "history" && <HistoryDialog item={dialog.item} onClose={() => setDialog(null)} />}
    </OrgPage>
  );
}

function ApproveDialog({ item, onClose, onDone }) {
  const [batches, setBatches] = useState(null);
  const [batchId, setBatchId] = useState(item.batchId ? String(item.batchId) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Open batches of this course (same list the student chose from).
  useEffect(() => {
    let active = true;
    publicEnrollmentApi.getCourse(item.courseId)
      .then((course) => active && setBatches(course?.openBatches ?? []))
      .catch(() => active && setBatches([]));
    return () => { active = false; };
  }, [item.courseId]);

  const options = [
    ...(item.batchId && !(batches ?? []).some((b) => b.batchId === item.batchId)
      ? [{ batchId: item.batchId, batchName: `${item.batchName ?? `Batch #${item.batchId}`} (student's choice)` }]
      : []),
    ...(batches ?? []),
  ];

  const approve = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await enrollmentReviewApi.approve(item.enrollmentId, batchId || undefined);
      if (response.alreadyApproved) toast("This enrollment was already approved");
      else if (response.linkedExistingAccount || response.setupEmailSent) toast.success(response.message);
      else toast.error(response.message);
      onDone();
    } catch (err) {
      const normalized = toEnrollmentError(err);
      setError(normalized.status === 403 ? "You don't have permission to approve enrollments." : normalized.message);
      if (["ALREADY_APPROVED", "ALREADY_PROCESSED"].includes(normalized.code)) onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ReviewDialog
      open
      busy={busy}
      onClose={onClose}
      title={`Approve ${item.studentName}`}
      subtitle={`${item.enrollmentNumber} · ${item.courseName}`}
      footer={(
        <>
          <button type="button" className="kx-btn kx-btn--ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="kx-btn kx-btn--primary" onClick={approve} disabled={busy || !batchId || batches === null}>
            {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />} Approve enrollment
          </button>
        </>
      )}
    >
      <DetailList items={[
        ["Student", item.studentName],
        ["Email (login)", item.email],
        ["Phone", item.phone],
        ["Qualification", [item.highestQualification, item.institutionName, item.yearOfPassing].filter(Boolean).join(" · ")],
        ["Verified UTR", <span key="utr" className="font-mono">{item.verifiedUtrNumber}</span>],
        ["Fee", formatAmount(item.feeAmount)],
      ]} />

      <label className="mt-5 block text-sm">
        <span className="mb-1 block font-semibold">Batch <span className="text-rose-500">*</span></span>
        {batches === null ? (
          <span className="flex items-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading batches…</span>
        ) : options.length === 0 ? (
          <span className="block text-rose-600">This course has no open batch with free seats. Create or open a batch first.</span>
        ) : (
          <select className="kx-input" style={{ width: "100%" }} value={batchId} onChange={(e) => setBatchId(e.target.value)}>
            <option value="">Select a batch</option>
            {options.map((batch) => (
              <option key={batch.batchId} value={String(batch.batchId)}>
                {batch.batchName}{batch.seatsAvailable !== undefined ? ` · ${batch.seatsAvailable} seats left` : ""}
              </option>
            ))}
          </select>
        )}
      </label>

      <div className="kx-note kx-note--info" style={{ marginTop: 16 }}>
        <span>
          {item.existingAccount
            ? "An account already exists for this email. The course is added to it and the student is notified — their password is not changed."
            : "A student account is created in “waiting for setup” state and a one-time password setup link is emailed. No password is ever sent by email."}
        </span>
      </div>

      {error && <p role="alert" className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
    </ReviewDialog>
  );
}

function RejectDialog({ item, onClose, onDone }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const reject = async () => {
    setBusy(true);
    setError(null);
    try {
      await enrollmentReviewApi.reject(item.enrollmentId, reason.trim());
      toast.success("Enrollment rejected");
      onDone();
    } catch (err) {
      const normalized = toEnrollmentError(err);
      setError(normalized.fieldErrors.reason || normalized.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ReviewDialog
      open
      busy={busy}
      onClose={onClose}
      title={`Reject ${item.studentName}'s enrollment`}
      subtitle={`${item.enrollmentNumber} · ${item.courseName}`}
      footer={(
        <>
          <button type="button" className="kx-btn kx-btn--ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="kx-btn kx-btn--primary" style={{ background: "#e5484d", borderColor: "#e5484d" }} onClick={reject} disabled={busy || reason.trim().length < 5}>
            {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <XCircle aria-hidden="true" />} Reject enrollment
          </button>
        </>
      )}
    >
      <div className="kx-note kx-note--warn">
        <span>The payment of {formatAmount(item.feeAmount)} stays verified. Arrange any refund with the student directly.</span>
      </div>
      <label className="mt-4 block text-sm">
        <span className="mb-1 block font-semibold">Reason <span className="text-rose-500">*</span></span>
        <textarea
          className="kx-input"
          style={{ width: "100%", minHeight: 96, paddingTop: 8 }}
          value={reason}
          maxLength={500}
          onChange={(e) => setReason(e.target.value)}
          placeholder="The student sees this reason."
          autoFocus
        />
      </label>
      {error && <p role="alert" className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
    </ReviewDialog>
  );
}

function HistoryDialog({ item, onClose }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    enrollmentReviewApi.getHistory(item.enrollmentId)
      .then((data) => active && setRows(data ?? []))
      .catch((err) => active && setError(toEnrollmentError(err).message));
    return () => { active = false; };
  }, [item.enrollmentId]);

  return (
    <ReviewDialog open onClose={onClose} title="Enrollment history" subtitle={`${item.studentName} · ${item.enrollmentNumber}`}>
      {error ? (
        <p role="alert" className="text-sm text-rose-600">{error}</p>
      ) : rows === null ? (
        <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading…</p>
      ) : (
        <ol className="space-y-3 text-sm">
          {rows.map((row, index) => (
            <li key={`${row.createdAt}-${index}`} className="border-l-2 border-slate-200 pl-3 dark:border-white/10">
              <p className="font-semibold">{row.action.replace(/([a-z])([A-Z])/g, "$1 $2")}</p>
              <p className="text-xs text-slate-500">{formatDateTime(row.createdAt)} · {row.actor}</p>
              {row.fromEnrollmentStatus !== row.toEnrollmentStatus && (
                <p className="text-xs text-slate-500">Enrollment: {row.fromEnrollmentStatus ?? "—"} → {row.toEnrollmentStatus}</p>
              )}
              {row.fromPaymentStatus !== row.toPaymentStatus && (
                <p className="text-xs text-slate-500">Payment: {row.fromPaymentStatus ?? "—"} → {row.toPaymentStatus}</p>
              )}
              {row.reason && <p className="mt-0.5 text-xs">“{row.reason}”</p>}
            </li>
          ))}
        </ol>
      )}
    </ReviewDialog>
  );
}
