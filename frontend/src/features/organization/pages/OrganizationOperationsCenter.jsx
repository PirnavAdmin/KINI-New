import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileClock,
  Search,
  ShieldCheck,
  TicketCheck,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@shared/hooks/useAuth";
import { readStoredOrganizationId } from "@shared/services/apiServices";
import { studentsApi } from "@/api/students";
import { ensureNextBatchAfterEnrollment } from "@shared/services/batchCapacityService";
import { batchService } from "@shared/services/batchService";
import { studentBatchAssignmentService } from "@shared/services/studentBatchAssignmentService";
import invoiceService from "@shared/services/invoiceService";
import { getApiErrorMessage } from "@shared/services/apiServices";
import {
  ENROLLMENT_APPROVAL_EVENT,
  getEnrollmentApprovalRequests,
  isPendingEnrollmentApproval,
  toDashboardApproval,
  updateEnrollmentApprovalRequest,
} from "@shared/services/enrollmentApprovalStore";

const SEED = [
  {
    id: "student-approval-1",
    area: "Student",
    subject: "Aarav Sharma registration",
    type: "Registration approval",
    status: "Pending",
    priority: "High",
  },
  {
    id: "mentor-approval-1",
    area: "Mentor",
    subject: "Meera Reddy account",
    type: "Mentor activation",
    status: "Pending",
    priority: "Normal",
  },
  {
    id: "academic-approval-1",
    area: "Academic",
    subject: "MERN August Batch",
    type: "Batch approval",
    status: "Pending",
    priority: "Normal",
  },
  {
    id: "certificate-approval-1",
    area: "Certificate",
    subject: "Python Batch PY-09",
    type: "Eligibility review",
    status: "Pending",
    priority: "High",
  },
];

const SUPPORT_SEED = [
  {
    id: "ticket-101",
    area: "Student",
    subject: "Assessment is not opening",
    type: "Technical",
    status: "Open",
    priority: "High",
  },
  {
    id: "ticket-102",
    area: "Mentor",
    subject: "Attendance correction required",
    type: "Academic",
    status: "Open",
    priority: "Normal",
  },
];

const DAILY_ITEMS = [
  "Review new registrations",
  "Clear pending approvals",
  "Verify today's classes",
  "Check mentor availability",
  "Verify attendance updates",
  "Review assessment status",
  "Resolve support tickets",
  "Review certificate requests",
  "Check subscription alerts",
  "Review inactive students",
  "Check mentor issues",
  "Generate daily summary",
];

const readJson = (key, fallback) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    if (Array.isArray(fallback)) {
      return Array.isArray(parsed)
        ? parsed.filter((item) => item && typeof item === "object" && !Array.isArray(item))
        : fallback;
    }
    if (fallback && typeof fallback === "object") {
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : fallback;
    }
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};
const createAuditEntry = (details) => {
  const timestamp = new Date().toISOString();
  return {
    ...details,
    id: `audit-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp,
  };
};
const shiftFromBatch = (batch = {}) => {
  const explicit = String(batch.shift ?? batch.batchShift ?? batch.session ?? "").trim();
  if (explicit) return explicit[0].toUpperCase() + explicit.slice(1).toLowerCase();
  const text = `${batch.batchName ?? batch.name ?? ""} ${batch.startTime ?? batch.time ?? ""}`.toLowerCase();
  if (text.includes("evening") || text.includes("pm")) return "Evening";
  if (text.includes("afternoon")) return "Afternoon";
  return "Morning";
};

export default function OrganizationOperationsCenter({ view = "approvals" }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const organizationId = readStoredOrganizationId();
  const prefix = `kini:org:${organizationId || "unknown"}`;
  const [approvals, setApprovals] = useState(() =>
    readJson(`${prefix}:approvals`, SEED),
  );
  const [tickets, setTickets] = useState(() =>
    readJson(`${prefix}:support`, SUPPORT_SEED),
  );
  const [checks, setChecks] = useState(() =>
    readJson(`${prefix}:daily-review`, {}),
  );
  const [audit, setAudit] = useState(() => readJson(`${prefix}:audit`, []));
  const [query, setQuery] = useState("");
  const [processing, setProcessing] = useState(false);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState(() =>
    getEnrollmentApprovalRequests({ includeResolved: true }),
  );
  useEffect(() => {
    const syncEnrollmentRequests = () => {
      setEnrollmentRequests(getEnrollmentApprovalRequests({ includeResolved: true }));
    };
    const syncWhenVisible = () => {
      if (document.visibilityState === "visible") syncEnrollmentRequests();
    };
    window.addEventListener(ENROLLMENT_APPROVAL_EVENT, syncEnrollmentRequests);
    window.addEventListener("storage", syncEnrollmentRequests);
    window.addEventListener("focus", syncEnrollmentRequests);
    document.addEventListener("visibilitychange", syncWhenVisible);
    return () => {
      window.removeEventListener(ENROLLMENT_APPROVAL_EVENT, syncEnrollmentRequests);
      window.removeEventListener("storage", syncEnrollmentRequests);
      window.removeEventListener("focus", syncEnrollmentRequests);
      document.removeEventListener("visibilitychange", syncWhenVisible);
    };
  }, []);
  const studentApprovals = useMemo(() => [
    ...enrollmentRequests.filter(isPendingEnrollmentApproval).map(toDashboardApproval),
  ], [enrollmentRequests]);
  const selectedStudent =
    view === "approvals"
      ? studentApprovals.find(
          (student) => String(student.id) === searchParams.get("student"),
        )
      : null;
  const selectedHasIssues = selectedStudent?.docs.some(
    ([, verified]) => !verified,
  );
  useEffect(() => {
    if (!selectedStudent?.courseId) {
      return undefined;
    }
    let active = true;
    batchService.getAll({ pageNumber: 1, pageSize: 1000 })
      .then((response) => {
        if (!active) return;
        const rows = Array.isArray(response?.data) ? response.data : [];
        setAvailableBatches(rows.filter((batch) =>
          String(batch.courseId ?? batch.course?.courseId ?? batch.course?.id) === String(selectedStudent.courseId)
          && !["completed", "cancelled", "archived"].includes(String(batch.status ?? "active").toLowerCase())
          && Number(batch.enrolledStudents ?? batch.studentsCount ?? batch.studentCount ?? 0) < Number(batch.capacity ?? batch.maxStudents ?? Number.MAX_SAFE_INTEGER)
        ));
      })
      .catch(() => active && setAvailableBatches([]));
    return () => { active = false; };
  }, [selectedStudent?.courseId]);

  const changeStudentBatch = (batchId) => {
    const batch = availableBatches.find((item) => String(item.batchId ?? item.id) === String(batchId));
    const request = enrollmentRequests.find((item) => String(item.id) === String(selectedStudent?.id));
    if (!batch || !request) return;
    const nextStudent = { ...request.student, batchId: batch.batchId ?? batch.id };
    updateEnrollmentApprovalRequest(request.id, { student: nextStudent, batch });
    setEnrollmentRequests(getEnrollmentApprovalRequests({ includeResolved: true }));
    toast.success(`Batch changed to ${batch.batchName ?? batch.name}.`);
  };

  const changePreferredShift = (preferredShift) => {
    const request = enrollmentRequests.find((item) => String(item.id) === String(selectedStudent?.id));
    if (!request) return;
    updateEnrollmentApprovalRequest(request.id, {
      student: { ...request.student, preferredShift },
      preferredShift,
    });
    setEnrollmentRequests(getEnrollmentApprovalRequests({ includeResolved: true }));
    toast.success(`Preferred shift changed to ${preferredShift}.`);
  };

  const actor =
    user?.userId ||
    user?.id ||
    localStorage.getItem("userId") ||
    "organization-admin";
  const recordAudit = (
    action,
    target,
    previousStatus,
    nextStatus,
    reason = "",
  ) => {
    const entry = createAuditEntry({
      organizationId,
      responsibleUserId: actor,
      action,
      target,
      previousStatus,
      status: nextStatus,
      reason,
    });
    const next = [entry, ...audit].slice(0, 250);
    setAudit(next);
    localStorage.setItem(`${prefix}:audit`, JSON.stringify(next));
  };

  const updateQueue = (kind, id, nextStatus) => {
    const source = kind === "approval" ? approvals : tickets;
    const item = source.find((row) => row.id === id);
    const next = source.map((row) =>
      row.id === id
        ? {
            ...row,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
            updatedBy: actor,
            organizationId,
          }
        : row,
    );
    if (kind === "approval") {
      setApprovals(next);
      localStorage.setItem(`${prefix}:approvals`, JSON.stringify(next));
    } else {
      setTickets(next);
      localStorage.setItem(`${prefix}:support`, JSON.stringify(next));
    }
    recordAudit(
      `${kind}.${nextStatus.toLowerCase()}`,
      item?.subject || id,
      item?.status,
      nextStatus,
    );
    toast.success(`Status updated to ${nextStatus}.`);
  };

  const toggleCheck = (label) => {
    const nextValue = !checks[label];
    const next = { ...checks, [label]: nextValue };
    setChecks(next);
    localStorage.setItem(`${prefix}:daily-review`, JSON.stringify(next));
    recordAudit(
      "daily-review.update",
      label,
      checks[label] ? "Complete" : "Pending",
      nextValue ? "Complete" : "Pending",
    );
  };

  const data = view === "support" ? tickets : approvals;
  const visible = useMemo(
    () =>
      data.filter((row) =>
        Object.values(row)
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [data, query],
  );
  const visibleStudentApprovals = useMemo(
    () =>
      studentApprovals.filter((student) =>
        `${student.name} ${student.course} ${student.docs.map(([document]) => document).join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, studentApprovals],
  );
  const titles = {
    approvals: [
      "Approvals",
      "Review sensitive student, mentor, academic and certificate actions.",
      ShieldCheck,
    ],
    support: [
      "Support Issues",
      "Track and resolve institute support requests.",
      TicketCheck,
    ],
    daily: [
      "Daily Operations Review",
      "Complete morning and end-of-day organization checks.",
      ClipboardCheck,
    ],
    audit: [
      "Audit Trail",
      "Trace organization actions, responsible users, status changes and timestamps.",
      FileClock,
    ],
  };
  const [title, subtitle, Icon] = titles[view] || titles.approvals;

  const completeStudentReview = async (status) => {
    const enrollmentRequest = enrollmentRequests.find(
      (request) => String(request.id) === String(selectedStudent.id),
    );
    let credentialEmailSent = false;
    setProcessing(true);
    try {
      if (enrollmentRequest && status === "Approved") {
        if (enrollmentRequest.payment?.status !== "Successful") {
          throw new Error("Payment is not verified. This enrollment cannot be approved.");
        }
        const courseId = Number(enrollmentRequest.student?.courseId);
        const batchId = Number(enrollmentRequest.student?.batchId);
        if (!Number.isInteger(courseId) || courseId <= 0 || !Number.isInteger(batchId) || batchId <= 0) {
          throw new Error("A valid course and batch must be assigned before approving this student.");
        }
        // Older checkout requests may contain only one name. The API requires
        // a non-empty lastName, so keep those legacy approvals actionable.
        const studentNameParts = String(
          enrollmentRequest.student?.fullName
            ?? enrollmentRequest.student?.name
            ?? [enrollmentRequest.student?.firstName, enrollmentRequest.student?.lastName].filter(Boolean).join(" "),
        ).trim().split(/\s+/).filter(Boolean);
        const studentPayload = {
          ...enrollmentRequest.student,
          firstName: String(enrollmentRequest.student?.firstName ?? studentNameParts[0] ?? "Student").trim(),
          lastName: String(enrollmentRequest.student?.lastName ?? (studentNameParts.slice(1).join(" ") || "Student")).trim(),
          courseId,
          batchId,
          status: "Active",
        };
        let studentId = enrollmentRequest.studentId;
        if (!studentId) {
          const created = await studentsApi.create(studentPayload);
          studentId = created.data?.studentId ?? created.data?.id;
          if (!studentId) throw new Error("Student was created but no student ID was returned.");
          updateEnrollmentApprovalRequest(enrollmentRequest.id, { studentId, student: studentPayload });
        }
        let backendInvoice = null;
        try {
          backendInvoice = await invoiceService.create({
            studentId: Number(studentId),
            courseId,
            batchId,
            subTotal: Number(enrollmentRequest.payment.amount || 0),
            discountAmount: 0,
            taxPercentage: 0,
            invoiceDate: enrollmentRequest.payment.paidAt || new Date().toISOString(),
            dueDate: enrollmentRequest.payment.paidAt || new Date().toISOString(),
            notes: `Paid enrollment invoice for ${selectedStudent.name} - ${selectedStudent.course}`,
            transactionId: enrollmentRequest.payment.transactionId,
            paymentStatus: "Paid",
          });
        } catch (invoiceError) {
          console.error("Unable to create backend invoice", invoiceError);
        }
        let batchRollover = null;
        try {
          batchRollover = await ensureNextBatchAfterEnrollment(batchId, studentId);
        } catch (rolloverError) {
          console.error("Unable to check/create the next batch", rolloverError);
        }
        let credentialsGenerated = false;
        let credentialEmailError = "";
        try {
          await studentBatchAssignmentService.generateCredentials(studentId);
          credentialsGenerated = true;
          await studentBatchAssignmentService.sendCredentials(studentId);
          credentialEmailSent = true;
        } catch (credentialsError) {
          credentialEmailError = credentialsError?.response?.data?.message
            || credentialsError?.message
            || "Credentials email could not be sent.";
          console.error("Unable to generate/send student credentials", credentialsError);
        }
        const next = updateEnrollmentApprovalRequest(enrollmentRequest.id, {
          studentId,
          status: "Approved",
          approvedAt: new Date().toISOString(),
          approvedBy: actor,
          accountCreated: true,
          credentialsGenerated,
          credentialEmailSent,
          credentialEmailError,
          nextBatchCreated: Boolean(batchRollover?.created),
          nextBatchName: batchRollover?.nextBatch?.batchName ?? batchRollover?.nextBatch?.name,
          invoiceId: backendInvoice?.invoiceId ?? backendInvoice?.id,
          invoiceNumber: backendInvoice?.invoiceNumber ?? backendInvoice?.invoiceNo,
        });
        setEnrollmentRequests((requests) => requests.map((request) => request.id === next.id ? next : request));
      } else if (enrollmentRequest) {
        const next = updateEnrollmentApprovalRequest(enrollmentRequest.id, {
          status: "Rejected",
          rejectedAt: new Date().toISOString(),
          updatedBy: actor,
        });
        setEnrollmentRequests((requests) => requests.map((request) => request.id === next.id ? next : request));
      }
    recordAudit(
      `student-documents.${status.toLowerCase().replaceAll(" ", "-")}`,
      selectedStudent.name,
      "Pending review",
      status,
      selectedHasIssues
        ? "Document verification issues found"
        : "All documents verified",
    );
    toast.success(
      status === "Approved"
        ? credentialEmailSent
          ? `${selectedStudent.name} approved. Login credentials were emailed successfully.`
          : `${selectedStudent.name} approved and added to ${selectedStudent.batchName}. Credentials email is pending.`
        : `Resubmission requested from ${selectedStudent.name}.`,
    );
    setSearchParams({});
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to complete enrollment approval."));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="w-full space-y-3 p-3 sm:p-4">
      <header className="flex items-center gap-3 px-1 py-1">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
          <Icon size={20} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
            {title}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        </div>
      </header>

      {selectedStudent && (
        <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-900 dark:bg-slate-900">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800/60">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <FileCheck2 size={23} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Student document review
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {selectedStudent.name}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedStudent.course} · Submitted {selectedStudent.time}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSearchParams({})}
              className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <ArrowLeft size={16} /> All approvals
            </button>
          </div>
          <div className="p-5">
            {selectedStudent.payment && (
              <div className="mb-5 grid gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div><p className="text-xs text-slate-500">Email</p><p className="mt-1 font-semibold text-slate-900">{selectedStudent.student?.email}</p></div>
                <div><p className="text-xs text-slate-500">Course</p><p className="mt-1 font-semibold text-slate-900">{selectedStudent.courseName} <span className="text-xs text-slate-500">(ID: {selectedStudent.courseId})</span></p></div>
                <div><label htmlFor="approval-preferred-shift" className="text-xs text-slate-500">Preferred shift</label><select id="approval-preferred-shift" value={selectedStudent.preferredShift === "Not specified" ? "" : selectedStudent.preferredShift} onChange={(event) => changePreferredShift(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-violet-200 bg-white px-2 text-sm font-semibold text-violet-700"><option value="" disabled>Select shift</option>{["Morning", "Afternoon", "Evening"].map((shift) => <option key={shift} value={shift}>{shift}</option>)}</select></div>
                <div><label htmlFor="approval-batch" className="text-xs text-slate-500">Allocated batch</label><select id="approval-batch" value={selectedStudent.batchId ?? ""} onChange={(event) => changeStudentBatch(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-blue-200 bg-white px-2 text-sm font-semibold text-blue-700"><option value={selectedStudent.batchId ?? ""}>{selectedStudent.batchName}</option>{availableBatches.filter((batch) => String(batch.batchId ?? batch.id) !== String(selectedStudent.batchId)).map((batch) => { const id = batch.batchId ?? batch.id; const shift = shiftFromBatch(batch); return <option key={id} value={id}>{batch.batchName ?? batch.name} · {shift}{shift === selectedStudent.preferredShift ? " · preferred" : ""}</option>; })}</select></div>
                <div><p className="text-xs text-slate-500">Payment status</p><p className="mt-1 font-semibold text-emerald-700">{selectedStudent.payment.status}</p></div>
                <div><p className="text-xs text-slate-500">Amount</p><p className="mt-1 font-semibold text-slate-900">₹{Number(selectedStudent.payment.amount || 0).toLocaleString("en-IN")}</p></div>
                <div><p className="text-xs text-slate-500">Transaction ID</p><p className="mt-1 break-all font-semibold text-slate-900">{selectedStudent.payment.transactionId}</p></div>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              {selectedStudent.docs.map(([document, verified]) => (
                <div
                  key={document}
                  className={`rounded-xl border p-4 ${verified ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20" : "border-rose-200 bg-rose-50/70 dark:border-rose-900 dark:bg-rose-950/20"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-slate-800 dark:text-white">
                      {document}
                    </span>
                    {verified ? (
                      <CheckCircle2 className="text-emerald-600" size={20} />
                    ) : (
                      <AlertTriangle className="text-rose-600" size={20} />
                    )}
                  </div>
                  <p
                    className={`mt-2 text-sm font-semibold ${verified ? "text-emerald-700" : "text-rose-700"}`}
                  >
                    {verified ? "Verified" : "Missing or rejected"}
                  </p>
                  {!verified && (
                    <p className="mt-1 text-xs text-slate-500">
                      Ask the student to upload a valid document.
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
              <p className="text-sm text-slate-500">
                {selectedHasIssues
                  ? `${selectedStudent.docs.filter(([, verified]) => !verified).length} document issue${selectedStudent.docs.filter(([, verified]) => !verified).length > 1 ? "s" : ""} must be resolved before approval.`
                  : "All required documents are verified. This application is ready to approve."}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={processing}
                  onClick={() => completeStudentReview("Rejected")}
                  className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reject
                </button>
                {selectedHasIssues ? (
                  <button
                    disabled={processing}
                    onClick={() =>
                      completeStudentReview("Resubmission requested")
                    }
                    className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Request resubmission
                  </button>
                ) : (
                  <button
                    disabled={processing}
                    onClick={() => completeStudentReview("Approved")}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processing ? "Creating account & emailing credentials..." : "Approve & email credentials"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "approvals" && !selectedStudent && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                Student approvals
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Verify student information and successful payment before approving.
              </p>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search students or courses..."
                className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleStudentApprovals.map((student) => {
              const issueCount = student.docs.filter(
                ([, verified]) => !verified,
              ).length;
              return (
                <div
                  key={student.id}
                  className="flex flex-col gap-3 px-4 py-3 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-slate-800/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {student.name}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${issueCount ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}
                      >
                        {issueCount
                          ? `${issueCount} issue${issueCount > 1 ? "s" : ""}`
                          : "Ready to approve"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                      {student.course} · Submitted {student.time}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {student.docs.map(([document, verified]) => (
                        <span
                          key={document}
                          className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${verified ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                        >
                          {document} ·{" "}
                          {verified ? "Verified" : "Missing / rejected"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setSearchParams({
                        student: String(student.id),
                        ...(issueCount ? {} : { action: "approve" }),
                      })
                    }
                    className={`h-9 shrink-0 rounded-lg px-3.5 text-xs font-bold ${issueCount ? "border border-amber-300 bg-white text-amber-800 hover:bg-amber-50" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                  >
                    {issueCount ? "Review issues" : "Review & approve"}
                  </button>
                </div>
              );
            })}
            {!visibleStudentApprovals.length && (
              <p className="p-10 text-center text-sm text-slate-500">
                No student approvals match your search.
              </p>
            )}
          </div>
        </div>
      )}

      {view === "support" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-4 dark:border-slate-700">
            <label className="relative block max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Request</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-4 py-3 font-bold">{row.area}</td>
                    <td className="px-4 py-3">{row.subject}</td>
                    <td className="px-4 py-3 text-slate-500">{row.type}</td>
                    <td className="px-4 py-3">{row.priority}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            updateQueue(
                              view === "support" ? "support" : "approval",
                              row.id,
                              view === "support" ? "Resolved" : "Approved",
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                        >
                          <CheckCircle2 size={14} />{" "}
                          {view === "support" ? "Resolve" : "Approve"}
                        </button>
                        <button
                          onClick={() =>
                            updateQueue(
                              view === "support" ? "support" : "approval",
                              row.id,
                              view === "support" ? "Escalated" : "Rejected",
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700"
                        >
                          <XCircle size={14} />{" "}
                          {view === "support" ? "Escalate" : "Reject"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "daily" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {DAILY_ITEMS.map((label) => (
            <button
              key={label}
              onClick={() => toggleCheck(label)}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${checks[label] ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"}`}
            >
              <span>
                <span className="block font-semibold text-slate-800 dark:text-white">
                  {label}
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  {checks[label] ? "Completed and logged" : "Pending action"}
                </span>
              </span>
              {checks[label] ? (
                <CheckCircle2 className="text-emerald-600" />
              ) : (
                <Clock3 className="text-amber-500" />
              )}
            </button>
          ))}
        </div>
      )}

      {view === "audit" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Status change</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-bold">{entry.action}</td>
                    <td className="px-4 py-3">{entry.target}</td>
                    <td className="px-4 py-3">{entry.responsibleUserId}</td>
                    <td className="px-4 py-3">
                      {entry.previousStatus} → {entry.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!audit.length && (
            <p className="p-10 text-center text-sm text-slate-400">
              No audited actions yet. Approval, support and daily-review changes
              appear here.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
