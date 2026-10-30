import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleDashed, Loader2, UserPlus, XCircle } from "lucide-react";
import KiniDialog from "@shared/components/KiniDialog";
import apiClient from "@shared/services/apiClient";
import { studentBatchAssignmentService } from "@shared/services/studentBatchAssignmentService";
import { demoPaymentApi } from "@shared/services/demoPaymentApi";
import { ENROLLMENT_APPROVAL_EVENT } from "@shared/services/enrollmentApprovalStore";
import { studentsApi } from "@/api/students";
import { API_ENDPOINTS } from "@/api/endpoints";
import { ApprovalResultPanel } from "./ApproveStudentDialog";
import { describeApprovalError, describeApprovalResult } from "./studentApproval";

const normalizeEmail = (value) => String(value ?? "").trim().toLowerCase();
const rowsOf = (payload) => (Array.isArray(payload) ? payload : payload?.items ?? payload?.data ?? payload?.batches ?? []);
const errorText = (error) => {
  const data = error?.response?.data;
  const message = typeof data === "string" ? data : data?.message ?? data?.title ?? error?.message;
  return error?.response ? `HTTP ${error.response.status}${message ? `: ${message}` : ""}` : (message || "Can't reach the backend");
};

/**
 * Turns a Demo Payment Mode purchase into a real backend student and
 * approves them, using only documented endpoints and the organization's own
 * session (a guest checkout has no token to create students with):
 *
 *   1. find the student in GET /api/v1/organization/students by email, else
 *      POST /api/v1/organization/students (first course + batch)
 *   2. store the real student id on every demo payment request
 *   3. POST /api/StudentBatch for each further paid course's batch
 *   4. PUT /api/v1/organization/students/{studentId}/approve
 *
 * requests: the pending demo requests of one student (same email).
 */
export default function ProvisionStudentDialog({ requests: openedWith, refreshStudents, approve, onClose }) {
  // Snapshot: the queue polls, but this review works on the requests it opened with.
  const [requests] = useState(openedWith);
  const [failure, setFailure] = useState(null);
  const [batches, setBatches] = useState({});
  const [choice, setChoice] = useState(() => Object.fromEntries(requests.map((request) => [request.id, request.batch?.id ? String(request.batch.id) : ""])));
  // idle | working | done | failed
  const [phase, setPhase] = useState("idle");
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);
  const student = requests[0].student;
  const name = `${student.firstName} ${student.lastName}`.trim();

  // Batch options for courses paid without a batch.
  useEffect(() => {
    let active = true;
    requests.filter((request) => !request.batch?.id).forEach((request) => {
      const courseId = String(request.courseId ?? "");
      studentBatchAssignmentService.getBatches(courseId)
        .then((payload) => rowsOf(payload)
          .filter((batch) => String(batch.courseId ?? batch.course?.id ?? courseId) === courseId)
          .map((batch) => ({ id: String(batch.batchId ?? batch.id), name: batch.batchName ?? batch.name ?? `Batch #${batch.batchId ?? batch.id}` })))
        .catch(() => [])
        .then((options) => { if (active) setBatches((current) => ({ ...current, [request.id]: options })); });
    });
    return () => { active = false; };
  }, [requests]);

  const courseIdOf = (request) => Number(request.courseId);
  const primary = requests.find((request) => choice[request.id]) ?? null;
  const record = (entry) => setLog((current) => [...current, entry]);

  const run = async () => {
    if (phase === "working" || !primary) return;
    setPhase("working");
    setLog([]);
    setFailure(null);
    let studentId = null;
    try {
      // 1. Find or create the backend student.
      const roster = await refreshStudents();
      record({ ok: true, label: "Checked the backend roster", call: "GET /api/v1/organization/students", detail: `${roster.length} students` });
      const matches = roster.filter((item) => normalizeEmail(item.email) === normalizeEmail(student.email));
      if (matches.length > 1) throw Object.assign(new Error(`${matches.length} backend students share ${student.email}; pick the right one in the Student List.`), { step: "find" });
      let backend = matches[0] ?? null;
      if (backend) {
        record({ ok: true, label: `Found existing backend student #${backend.id}`, detail: `Status ${backend.status}; no new account created` });
      } else {
        let created;
        try {
          created = await studentsApi.create({
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            phone: student.phone,
            courseId: courseIdOf(primary),
            batchId: Number(choice[primary.id]),
          });
        } catch (error) {
          throw Object.assign(new Error(errorText(error)), { step: "create" });
        }
        const createdId = created.data?.id;
        backend = createdId != null ? created.data : (await refreshStudents()).find((item) => normalizeEmail(item.email) === normalizeEmail(student.email));
        if (!backend?.id) throw Object.assign(new Error("The backend accepted the student but returned no student ID, and it isn't in the roster."), { step: "create" });
        record({ ok: true, label: `Created backend student #${backend.id}`, call: "POST /api/v1/organization/students", detail: `${primary.courseName} with batch #${choice[primary.id]}; status ${backend.status ?? "not reported"}` });
      }
      studentId = Number(backend.id);

      // 2. Map every demo payment to the real student id.
      const links = await Promise.allSettled(requests.map((request) => demoPaymentApi.linkBackendStudent(request.id, studentId)));
      record({ ok: links.every((link) => link.status === "fulfilled"), label: `Linked ${requests.length} demo payment${requests.length > 1 ? "s" : ""} to #${studentId}`, detail: links.find((link) => link.status === "rejected")?.reason?.message });

      // 3. Further paid courses: enroll the same student in each chosen batch.
      for (const request of requests) {
        if (courseIdOf(request) === Number(backend.courseId ?? courseIdOf(primary))) continue;
        const batchId = Number(choice[request.id]);
        if (!batchId) {
          record({ ok: false, label: `${request.courseName}: not added in the backend`, detail: "No batch chosen for this course" });
          continue;
        }
        try {
          await apiClient.post(API_ENDPOINTS.studentBatch.base, { batchId, studentIds: [studentId] });
          record({ ok: true, label: `${request.courseName}: added to batch #${batchId}`, call: "POST /api/StudentBatch" });
        } catch (error) {
          record({ ok: false, label: `${request.courseName}: batch enrollment failed`, call: "POST /api/StudentBatch", detail: errorText(error) });
        }
      }

      // 4. Approve through the live API.
      let approval;
      try {
        const response = await approve(studentId);
        approval = { ...describeApprovalResult(response.raw, studentId), httpStatus: response.status, reloadError: response.reloadError };
        record({ ok: true, label: `Approved #${studentId}`, call: `PUT /api/v1/organization/students/${studentId}/approve`, detail: `HTTP ${response.status}` });
      } catch (error) {
        const described = describeApprovalError(error, studentId);
        if (!described.alreadyApproved) throw Object.assign(new Error(`${described.message}${described.status ? ` (HTTP ${described.status})` : ""}`), { step: "approve" });
        record({ ok: true, label: `#${studentId} was already approved`, call: `PUT /api/v1/organization/students/${studentId}/approve`, detail: "HTTP 409" });
        await refreshStudents().catch(() => {});
      }

      await Promise.allSettled(requests.map((request) => demoPaymentApi.recordLiveApproval(request.id, studentId)));
      window.dispatchEvent(new CustomEvent(ENROLLMENT_APPROVAL_EVENT));
      setResult(approval ?? null);
      setPhase("done");
    } catch (error) {
      record({ ok: false, label: { find: "Couldn't identify the student", create: "Couldn't create the backend student", approve: "Approval failed" }[error.step] ?? "Stopped", detail: error.message });
      setFailure(studentId
        ? `Backend student #${studentId} exists but is not approved. ${error.message}`
        : `No backend student was created and nothing was approved. ${error.message}`);
      setPhase("failed");
    }
  };

  const close = () => { if (phase !== "working") onClose(); };
  const missingBatch = !primary;

  return (
    <KiniDialog
      open
      onClose={close}
      icon={UserPlus}
      title={phase === "done" ? "Student approved" : `Approve ${name}?`}
      subtitle={phase === "done" ? "The backend confirmed this approval." : "Creates the student in the live backend if needed, then approves them."}
      closeLabel="Close approval dialog"
      width={600}
      footer={phase === "done" ? (
        <button type="button" onClick={onClose} className="rounded-xl bg-[#0F55F7] px-4 py-2.5 text-sm font-semibold text-white">Done</button>
      ) : (
        <>
          <button type="button" onClick={close} disabled={phase === "working"} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4b5f78] transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
          <button
            type="button"
            onClick={run}
            disabled={phase === "working" || missingBatch}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {phase === "working" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {phase === "working" ? "Working…" : phase === "failed" ? "Try again" : "Create & approve"}
          </button>
        </>
      )}
    >
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-[#4b5f78] dark:text-slate-400">Email</dt><dd className="font-semibold text-[#0f2a4a] dark:text-white">{student.email}</dd>
        <dt className="text-[#4b5f78] dark:text-slate-400">Mobile</dt><dd className="font-semibold text-[#0f2a4a] dark:text-white">{student.phone}</dd>
      </dl>

      <fieldset className="mt-4 space-y-2" disabled={phase === "working" || phase === "done"}>
        <legend className="mb-1 text-sm font-semibold text-[#0f2a4a] dark:text-white">Paid courses</legend>
        {requests.map((request) => {
          const options = request.batch?.id ? [{ id: String(request.batch.id), name: request.batch.name ?? `Batch #${request.batch.id}` }] : (batches[request.id] ?? null);
          return (
            <div key={request.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#edf1f7] px-3 py-2.5 dark:border-slate-700">
              <span className="min-w-0 flex-1 text-sm font-semibold text-[#0f2a4a] dark:text-white">
                {request.courseName}
                <span className="block font-mono text-[11px] font-normal text-[#5b6f88] dark:text-slate-400">{request.transactionId}</span>
              </span>
              <label className="sr-only" htmlFor={`batch-${request.id}`}>Batch for {request.courseName}</label>
              <select
                id={`batch-${request.id}`}
                value={choice[request.id]}
                onChange={(event) => setChoice((current) => ({ ...current, [request.id]: event.target.value }))}
                className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">{options === null ? "Loading batches…" : options.length ? "Choose a batch" : "No batch available"}</option>
                {(options ?? []).map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
              </select>
            </div>
          );
        })}
      </fieldset>

      {phase === "idle" && (
        <p className="mt-4 text-xs leading-5 text-[#5b6f88] dark:text-slate-400">
          {missingBatch
            ? "Choose a batch for at least one course: the backend needs a course and batch to create the student."
            : `If ${student.email} isn't a backend student yet, it is created with ${primary.courseName}; other courses are added to their batches. Then PUT …/approve runs. The backend sends any email; nothing is emailed from this page.`}
        </p>
      )}

      {log.length > 0 && (
        <ol aria-label="Backend steps" className="mt-4 space-y-1.5 text-xs">
          {log.map((entry, index) => (
            <li key={index} className="flex items-start gap-2">
              {entry.ok ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" /> : <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" aria-hidden="true" />}
              <span>
                <span className="font-semibold text-[#0f2a4a] dark:text-white">{entry.label}</span>
                {entry.call && <span className="ml-1 font-mono text-[11px] text-[#5b6f88] dark:text-slate-400">{entry.call}</span>}
                {entry.detail && <span className="block text-[#5b6f88] dark:text-slate-400">{entry.detail}</span>}
              </span>
            </li>
          ))}
          {phase === "working" && <li className="flex items-center gap-2 text-[#5b6f88]"><CircleDashed className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />Working…</li>}
        </ol>
      )}

      {phase === "done" && result && <ApprovalResultPanel result={result} />}
      {phase === "failed" && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {failure}
        </p>
      )}
    </KiniDialog>
  );
}
