import { useEffect, useMemo, useState } from "react";
import { KPI_ACCENTS as KPI_TONES } from "@/components/common/kpiAccents";
import { createPortal } from "react-dom";
import { useLocation, useSearchParams, useParams, useNavigate } from "react-router-dom";
import { AlertCircle, Download, Plus, RefreshCw, Users, UserCheck, Clock3, ShieldAlert, ShieldCheck, XCircle, BarChart3, Layers3, Sparkles } from "lucide-react";
import useStudents from "@/hooks/useStudents";
import usePendingEnrollmentApprovals from "@/hooks/usePendingEnrollmentApprovals";
import { getApiErrorMessage } from "@shared/services/apiServices";
import { invoiceService } from "@shared/services/invoiceService";
import StudentList from "./StudentList";
import ApprovalQueue from "./ApprovalQueue";
import { buildApprovalQueue } from "./studentApproval";
import StudentForm from "./StudentForm";
import OrgShowcaseHero from "@features/organization/components/showcase/OrgShowcaseHero";
import { ORG_BANNERS } from "@features/organization/constants/orgBanners";
import KpiWaveCard from "@shared/components/KpiWaveCard";
import "./students-page.css";

// Card palettes: accent bar + wave, icon tile background, icon color, wave opacity.

const sharePercent = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

// Mirrors the loaded layout (filters, then table rows) so nothing jumps.
function LoadingState() {
  return (
    <div aria-busy="true" className="students-skeleton">
      <div className="students-skeleton__filters">
        {[0, 1, 2, 3, 4].map((index) => <span key={index} />)}
      </div>
      <div className="students-skeleton__table">
        <span className="students-skeleton__head" />
        {Array.from({ length: 8 }, (_, index) => <span key={index} className="students-skeleton__row" />)}
      </div>
      <span className="sr-only">Loading student records</span>
    </div>
  );
}

export default function StudentsPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { studentId } = useParams();
  const navigate = useNavigate();
  const initialStatus = ["at-risk", "high"].includes(String(searchParams.get("risk") || "").toLowerCase())
    ? "At Risk"
    : ["active", "inactive", "pending", "rejected"].includes(String(searchParams.get("status") || "").toLowerCase())
      ? String(searchParams.get("status")).replace(/^./, (letter) => letter.toUpperCase())
      : "All";
  const {
    students,
    loading,
    error,
    retry,
    removeStudent,
    saveStudent,
    deactivateStudent,
    approveStudent,
    rejectStudent,
    refreshStudents,
    patchStudents,
  } = useStudents();
  // Checkout enrollment requests awaiting review (same list the dashboard's
  // Pending Approvals widget shows). They are not student records yet, so they
  // are counted for "Pending" but never for "Total students".
  const enrollmentApprovals = usePendingEnrollmentApprovals();
  const [tab, setTab] = useState(searchParams.get("tab") === "approvals" ? "approvals" : "students");
  const [studentStatus, setStudentStatus] = useState(initialStatus);
  const [form, setForm] = useState({ open: false, student: null });
  const [toast, setToast] = useState("");
  const [listRows, setListRows] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const stats = useMemo(() => {
    const statusCount = (wanted) => students.filter((student) =>
      wanted.includes(String(student.status || "").trim().toLowerCase()),
    ).length;
    const total = students.length;
    const active = statusCount(["active"]);
    const pending = buildApprovalQueue(students, enrollmentApprovals).items.length;
    const atRisk = statusCount(["at risk", "at-risk", "high risk"]);
    const rejected = statusCount(["rejected"]);
    // Captions are derived from the same roster (no invented trends).
    return [
      { key: "total", label: "Total Students", value: total, caption: "Registered students", icon: Users, tone: KPI_TONES.blue },
      { key: "active", label: "Active Students", value: active, caption: `${sharePercent(active, total)}% of total`, icon: UserCheck, tone: KPI_TONES.green },
      { key: "pending", label: "Pending Approval", value: pending, caption: pending ? "Awaiting review" : "All caught up", icon: Clock3, tone: KPI_TONES.orange },
      { key: "atRisk", label: "At Risk", value: atRisk, caption: atRisk ? "Need intervention" : "None flagged", icon: ShieldAlert, tone: KPI_TONES.red },
      { key: "rejected", label: "Rejected", value: rejected, caption: `${sharePercent(rejected, total)}% of total`, icon: XCircle, tone: KPI_TONES.red },
    ];
  }, [students, enrollmentApprovals]);
  const visibleCount = tab === "students" && listRows ? listRows.length : students.length;
  const pendingCount = stats.find((stat) => stat.key === "pending").value;
  const handleKpiClick = (key) => {
    if (key === "pending") {
      setTab("approvals");
      return;
    }
    setTab("students");
    setStudentStatus({ total: "All", active: "Active", atRisk: "At Risk", rejected: "Rejected" }[key] || "All");
  };
  useEffect(() => {
    if (location.pathname.endsWith("/add") || searchParams.get("create") === "true") {
      setForm({ open: true, student: null });
    }
  }, [location.pathname, searchParams]);
  // Edit deep links: /organization/students?edit=<id> (the profile page's Edit
  // button) and /organization/students/:studentId/edit. Each target opens the
  // form once, so saving (which refreshes the list) does not reopen it.
  const editTargetId = location.pathname.endsWith("/edit") ? studentId : searchParams.get("edit");
  const [openedEditId, setOpenedEditId] = useState("");
  const editTarget = editTargetId && !loading && openedEditId !== String(editTargetId)
    ? students.find((item) => String(item.id) === String(editTargetId))
    : null;
  if (editTarget) {
    setOpenedEditId(String(editTargetId));
    setForm({ open: true, student: editTarget });
  }
  // /organization/students/:studentId/assign used to open the old in-page
  // profile; it now goes to the canonical profile page.
  useEffect(() => {
    if (studentId && location.pathname.endsWith("/assign")) {
      navigate(`/organization/students/${encodeURIComponent(studentId)}`, { replace: true });
    }
  }, [location.pathname, navigate, studentId]);
  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };
  const exportStudents = () => {
    const headers = ["Student", "ID", "Email", "Mobile", "Course", "Batch", "Mentor", "Status"];
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    // Rows from the table carry every enrollment (record + StudentBatch
    // rosters); course, batch and mentor are listed in the same order so the
    // nth course belongs to the nth batch.
    const rows = tab === "students" ? listRows ?? students : students;
    const joined = (student, field, fallback) => student.enrollments?.length
      ? student.enrollments.map((item) => item[field] || fallback).join("; ")
      : null;
    const csv = [
      headers.join(","),
      ...rows.map((student) =>
        [student.name, student.studentId, student.email, student.mobile, joined(student, "course", "Not reported") ?? student.course, joined(student, "batch", "Not assigned") ?? student.batch, joined(student, "mentor", "Unassigned") ?? (student.mentorName || "Unassigned"), student.status]
          .map(escape)
          .join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "students.csv";
    link.click();
    URL.revokeObjectURL(url);
    notify(`${rows.length} student records exported`);
  };
  // Reloads the roster in place (no page skeleton); attendance and enrollment
  // rosters in the table refetch because the student list changes.
  const refresh = async () => {
    setRefreshing(true);
    try {
      const rows = await refreshStudents();
      notify(`Student list refreshed · ${rows?.length ?? students.length} students`);
    } catch (requestError) {
      notify(getApiErrorMessage(requestError, "Unable to refresh the student list."));
    } finally {
      setRefreshing(false);
    }
  };
  // Returns the saved student so the form can enroll any further courses
  // against the same student id.
  const save = async (values, id) => {
    const saved = await saveStudent(values, id);
    await retry();
    notify(
      id ? "Student updated successfully." : "Student added successfully.",
    );
    return saved;
  };
  // Called after the extra courses of a multi-course save are enrolled.
  const enrolled = async (message) => {
    await retry();
    notify(message);
  };
  // One canonical Student Details page, addressed by the backend student id
  // (useStudents maps id = studentId) — the same page Attendance/Progress
  // menu items and the dashboard already link to.
  const openProfile = (student) => {
    navigate(`/organization/students/${encodeURIComponent(student.id ?? student.studentId)}`);
  };
  const sendInvoiceEmail = async (student) => {
    const email = String(student.email || "").trim();
    if (!email) {
      notify("This student does not have an email address.");
      return;
    }

    try {
      const invoices = await invoiceService.list();
      const studentId = String(student.id ?? student.studentId ?? "");
      const matchingInvoices = invoices.filter((invoice) => {
        const invoiceStudentId = String(
          invoice.studentId ?? invoice.student?.id ?? invoice.customerId ?? invoice.userId ?? "",
        );
        const invoiceEmail = String(
          invoice.customerEmail ?? invoice.studentEmail ?? invoice.email ?? invoice.student?.email ?? "",
        ).trim().toLowerCase();
        return (studentId && invoiceStudentId === studentId) || invoiceEmail === email.toLowerCase();
      });
      const invoice = matchingInvoices[matchingInvoices.length - 1];
      const invoiceId = Number(invoice?.invoiceId ?? invoice?.id);
      if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
        notify("No backend invoice was found for this student.");
        return;
      }

      await invoiceService.sendEmail(invoiceId, {
        subject: `Invoice ${invoice.invoiceNumber ?? invoice.invoiceNo ?? invoiceId}`,
        message: `Hello ${student.name || email}, please find your invoice attached.`,
      });
      notify(`Invoice sent to ${email}.`);
    } catch (error) {
      notify(getApiErrorMessage(error, "Unable to send the invoice email."));
    }
  };

  return (
    <main className="students-management-page min-h-full min-w-0 p-3 text-[#102D50] sm:px-4 sm:py-3 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto min-w-0 max-w-[1600px] space-y-3">
        <OrgShowcaseHero
          variant="v14"
          className="osh-v14--students"
          eyebrow="Student Operations"
          title={["Students", "Management"]}
          subtitle="Manage enrollments, monitor learning progress, and oversee student records from one place."
          features={[
            { icon: Users, label: ["Track Enrollment", "Real-time data"], tone: "blue" },
            { icon: BarChart3, label: ["Monitor Progress", "Learning analytics"], tone: "purple" },
            { icon: Layers3, label: ["Manage Batches", "Organized learning"], tone: "green" },
            { icon: Sparkles, label: ["Ensure Success", "Better outcomes"], tone: "orange" },
          ]}
          art={ORG_BANNERS.students}
        />
        <div>
            <section
              aria-label="Student statistics"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-3.5"
            >
              {/* v23 — the design shows four cards; at-risk learners stay on the dashboard. */}
              {stats.filter((stat) => stat.key !== "atRisk").map((stat) => (
                <KpiWaveCard
                  key={stat.key}
                  decoration="bars"
                  stat={stat}
                  onClick={() => handleKpiClick(stat.key)}
                />
              ))}
            </section>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          className="flex w-fit max-w-full flex-wrap gap-2 rounded-2xl border border-[#E2EAF5] bg-white p-1.5 shadow-[0_2px_8px_rgba(38,83,130,.05)] dark:border-slate-700 dark:bg-slate-900"
          aria-label="Student management views"
        >
          <button
            type="button"
            aria-pressed={tab === "students"}
            onClick={() => setTab("students")}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877F9]/40 ${tab === "students" ? "bg-[#075B9D] text-white shadow-[0_6px_14px_rgba(7,91,157,.25)]" : "border border-[#DCE7F3] bg-[#F7FAFD] text-[#173A63] hover:bg-[#EEF4FB] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}
          >
            <Users className="h-4 w-4" />
            Student List
            <span className="students-tab-count">{loading ? "…" : visibleCount}</span>
          </button>
          <button
            type="button"
            aria-pressed={tab === "approvals"}
            onClick={() => setTab("approvals")}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877F9]/40 ${tab === "approvals" ? "bg-[#075B9D] text-white shadow-[0_6px_14px_rgba(7,91,157,.25)]" : "border border-[#DCE7F3] bg-[#F7FAFD] text-[#173A63] hover:bg-[#EEF4FB] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}
          >
            <ShieldCheck className="h-4 w-4" />
            Pending Approval
            <span className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-[#FFD98A] px-1.5 text-[11px] font-bold text-[#B86600]">
              {pendingCount}
            </span>
          </button>
        </nav>
          <p className="flex items-center gap-3 text-[#102D50] dark:text-slate-200">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#EAF2FF] text-[#1D63D8] dark:bg-slate-800" aria-hidden="true"><Users className="h-5 w-5" /></span>
            <span className="leading-tight">
              <b className="block text-[15px] font-bold">{loading ? "…" : visibleCount === students.length ? students.length : `${visibleCount} of ${students.length}`} Students</b>
              <span className="text-xs text-slate-500 dark:text-slate-400">Manage and view student records</span>
            </span>
            <span className="v14-actions ml-2">
              <button
                type="button"
                onClick={refresh}
                disabled={loading || refreshing}
                className="v14-btn"
                aria-label="Refresh student list"
              >
                <RefreshCw aria-hidden="true" className={refreshing ? "animate-spin" : undefined} />
                <span className="students-btn-label">Refresh</span>
              </button>
              <button type="button" onClick={exportStudents} disabled={loading || !students.length} className="v14-btn">
                <Download aria-hidden="true" />
                Export
              </button>
              <button
                type="button"
                data-page-new
                onClick={() => setForm({ open: true, student: null })}
                className="v14-btn v14-btn--primary"
              >
                <Plus aria-hidden="true" />
                Add Student
              </button>
            </span>
          </p>
        </div>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="grid min-h-[330px] place-items-center rounded-[16px] border border-rose-200/80 bg-white/95 p-6 text-center shadow-[0_12px_32px_rgba(35,75,115,.08)] dark:border-rose-900/60 dark:bg-slate-900">
            <div className="max-w-md">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 ring-1 ring-rose-100 dark:bg-rose-950/50 dark:ring-rose-900"><AlertCircle className="h-8 w-8 text-rose-500" /></span>
              <p className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Student records could not be loaded
              </p>
              <p className="mt-1.5 text-sm text-slate-500">We couldn't connect to the student service. Check the connection and try again.</p>
              <button
                onClick={retry}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          </div>
        ) : tab === "students" ? (
          <StudentList
            students={students}
            initialStatus={studentStatus}
            onEdit={(student) => setForm({ open: true, student })}
            onView={openProfile}
            onDelete={removeStudent}
            onDeactivate={deactivateStudent}
            notify={notify}
            onAssignBatch={(student) => navigate(`/organization/students/${student.id}/assign-batch`)}
            onSendInvoiceEmail={sendInvoiceEmail}
            onStudentsChange={patchStudents}
            onRowsChange={setListRows}
          />
        ) : (
          <ApprovalQueue
            students={students}
            enrollmentApprovals={enrollmentApprovals}
            onReviewEnrollment={(approval) => navigate(approval.path)}
            notify={notify}
            onView={openProfile}
            onApprove={approveStudent}
            onReject={rejectStudent}
            refreshStudents={refreshStudents}
          />
        )}
      </div>
      <StudentForm
        open={form.open}
        student={form.student}
        onClose={() => setForm({ open: false, student: null })}
        onSave={save}
        onEnrolled={enrolled}
      />
      {toast && <Toast message={toast} />}
    </main>
  );
}

function Toast({ message }) {
  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-20 z-[2000] flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-2xl sm:right-5"
      style={{ width: "min(24rem, calc(100vw - 2rem))", color: "#fff", backgroundColor: "#0f172a", border: "1px solid #334155", opacity: 1 }}
    >
      <Users className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
      <span className="min-w-0 leading-5" style={{ color: "#fff" }}>{message}</span>
    </div>,
    document.body,
  );
}
