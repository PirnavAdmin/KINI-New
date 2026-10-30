import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Ban,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  MoreHorizontal,
  Search,
  ShieldAlert,
} from "lucide-react";
import useCertificates from "@/hooks/useCertificates";
import CertificatePreview from "./CertificatePreview";
import EligibilityReview from "./EligibilityReview";

const statusStyle = {
  "Pending Review": "bg-amber-50 text-amber-700 ring-amber-200",
  Approved: "bg-blue-50 text-blue-700 ring-blue-200",
  Issued: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Revoked: "bg-red-50 text-red-700 ring-red-200",
};

export default function CertificatesPage() {
  const {
    loading,
    byStatus,
    stats,
    verifyIdentity,
    rejectRequest,
    approve,
    issue,
    revoke,
  } = useCertificates();
  const [tab, setTab] = useState("pending");
  const [query, setQuery] = useState("");
  const [review, setReview] = useState(null);
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState("");
  const [bulkIssue, setBulkIssue] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const rows = useMemo(
    () =>
      byStatus[tab].filter((item) =>
        `${item.name} ${item.course} ${item.batch}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [byStatus, query, tab],
  );
  const issueTotal = 124 + Math.max(0, byStatus.issued.length - 8);
  const tabs = [
    ["pending", "Pending Review", byStatus.pending.length],
    ["approved", "Approved", byStatus.approved.length],
    ["issued", "Issued", issueTotal],
    ["revoked", "Revoked", byStatus.revoked.length],
  ];
  const cards = [
    ["Eligible", stats.eligible, FileCheck2, "text-blue-600 bg-blue-50"],
    ["Pending Review", stats.pending, Clock3, "text-amber-600 bg-amber-50"],
    [
      "Issued This Month",
      stats.issuedMonth,
      Award,
      "text-emerald-600 bg-emerald-50",
    ],
    ["Revoked", stats.revoked, Ban, "text-red-600 bg-red-50"],
  ];

  const openPreview = (record) => setPreview(record);
  const approveRecord = (id) => {
    const result = approve(id);
    if (result.ok) {
      setReview(null);
      setPreview(result.record);
      setToast("Eligibility approved — certificate generated");
    }
    return result;
  };

  const issueEligibleCertificates = async () => {
    const eligible = byStatus.approved.filter(
      (item) => item.identityVerified && item.assessmentPassed && item.feePaid,
    );
    if (!eligible.length) {
      setToast("No eligible approved certificates are waiting to be issued");
      return;
    }
    setBulkIssue({ total: eligible.length, completed: 0, failed: [] });
    const failed = [];
    for (let index = 0; index < eligible.length; index += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 180));
      try {
        issue(eligible[index].id);
      } catch (error) {
        failed.push({
          name: eligible[index].name,
          reason: error.message || "Could not generate certificate",
        });
      }
      setBulkIssue({
        total: eligible.length,
        completed: index + 1,
        failed: [...failed],
      });
    }
    setToast(
      `${eligible.length - failed.length} certificates issued${failed.length ? `, ${failed.length} failed` : ""}`,
    );
  };

  if (loading)
    return (
      <main className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-[1500px] space-y-4">
          <div className="h-20 animate-pulse rounded-xl bg-slate-200" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-xl bg-slate-200"
              />
            ))}
          </div>
          <div className="h-[480px] animate-pulse rounded-xl bg-slate-200" />
        </div>
      </main>
    );

  return (
    <main className="min-h-full bg-slate-50 p-4 text-slate-800 sm:p-6">
      <div className="mx-auto max-w-[1600px] space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Credentials · Academic records
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              Certificate Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review eligibility, issue verified credentials and manage
              revocations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={issueEligibleCertificates}
              disabled={Boolean(
                bulkIssue && bulkIssue.completed < bulkIssue.total,
              )}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              <Award className="h-4 w-4" /> Issue all eligible
            </button>
            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              <ShieldAlert className="h-4 w-4 text-blue-600" /> All certificate
              actions are audit-logged
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map(([label, value, Icon, tone], index) => (
            <button
              key={label}
              onClick={() =>
                setTab(["pending", "pending", "issued", "revoked"][index])
              }
              className="rounded-xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 font-mono text-2xl font-semibold">
                    {value}
                  </p>
                </div>
                <span className={`rounded-lg p-2 ${tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </button>
          ))}
        </section>

        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 pt-2">
            <nav className="flex overflow-x-auto">
              {tabs.map(([key, label, count]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${tab === key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                >
                  {label}{" "}
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${tab === key ? "bg-blue-50" : "bg-slate-100"}`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </nav>
            <label className="mb-2 flex h-9 min-w-56 items-center gap-2 rounded-lg border bg-slate-50 px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-xs outline-none"
                placeholder="Search student, course or batch"
              />
            </label>
          </div>
          <div className="space-y-2 p-3 md:hidden">
            {rows.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => openPreview(item)}
                    className="min-w-0 text-left"
                  >
                    <b className="block truncate text-sm text-slate-900 dark:text-white">
                      {item.name}
                    </b>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                      {item.course} · {item.batch}
                    </span>
                  </button>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ring-inset ${statusStyle[item.status]}`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                  <span>
                    Score{" "}
                    <b className="text-slate-700 dark:text-slate-200">
                      {item.score}%
                    </b>
                  </span>
                  <span>{item.completionDate}</span>
                </div>
                <button
                  onClick={() =>
                    item.status === "Pending Review"
                      ? setReview(item)
                      : openPreview(item)
                  }
                  className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  {item.status === "Pending Review"
                    ? "Review eligibility"
                    : item.status === "Approved"
                      ? "Preview & issue"
                      : "View certificate"}
                </button>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1050px] text-left text-xs">
              <thead className="bg-slate-50 uppercase tracking-wider text-slate-500">
                <tr>
                  {[
                    "Student Name",
                    "Course",
                    "Batch",
                    "Completion Date",
                    "Score",
                    "Status",
                    "Actions",
                  ].map((head) => (
                    <th key={head} className="px-4 py-3 font-semibold">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 font-semibold text-blue-700">
                          {item.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.name}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                            {item.studentId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 font-medium">{item.course}</td>
                    <td className="px-4 text-slate-600">{item.batch}</td>
                    <td className="px-4 text-slate-600">
                      {item.completionDate}
                    </td>
                    <td className="px-4">
                      <b>{item.score}%</b>
                    </td>
                    <td className="px-4">
                      <span
                        className={`rounded-full px-2.5 py-1 font-semibold ring-1 ring-inset ${statusStyle[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4">
                      <div className="flex items-center gap-2">
                        {item.status === "Pending Review" && (
                          <button
                            onClick={() => setReview(item)}
                            className="rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white"
                          >
                            Review Eligibility
                          </button>
                        )}
                        {item.status === "Approved" && (
                          <button
                            onClick={() => openPreview(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white"
                          >
                            <Eye className="h-3.5 w-3.5" /> Preview & Issue
                          </button>
                        )}
                        {item.status === "Issued" && (
                          <button
                            onClick={() => openPreview(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 font-semibold"
                          >
                            <Download className="h-3.5 w-3.5" /> View / Download
                          </button>
                        )}
                        {item.status === "Revoked" && (
                          <button
                            onClick={() => openPreview(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 font-semibold"
                          >
                            <Eye className="h-3.5 w-3.5" /> View Record
                          </button>
                        )}
                        <button
                          aria-label="More actions"
                          className="rounded-lg border p-2 text-slate-500"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <div className="grid min-h-72 place-items-center text-center">
                <div>
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                  <h2 className="mt-3 font-semibold">No certificates here</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    No records match the current view.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {review && (
        <EligibilityReview
          record={review}
          onClose={() => setReview(null)}
          onVerify={(id) => {
            verifyIdentity(id);
            setReview((item) => ({ ...item, identityVerified: true }));
            setToast("Identity verified and audit logged");
          }}
          onApprove={approveRecord}
          onReject={(id, reason) => {
            rejectRequest(id, reason);
            setToast("Certificate request rejected");
          }}
        />
      )}
      {preview && (
        <CertificatePreview
          record={preview}
          onClose={() => setPreview(null)}
          onIssue={issue}
          onRevoke={revoke}
          notify={setToast}
        />
      )}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}
      {bulkIssue && (
        <div className="fixed bottom-5 right-5 z-[105] w-[340px] rounded-xl border border-slate-700 bg-slate-900 p-4 text-white shadow-2xl">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Issuing certificates</span>
            <span>
              {bulkIssue.completed}/{bulkIssue.total}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full bg-emerald-400 transition-all"
              style={{
                width: `${(bulkIssue.completed / bulkIssue.total) * 100}%`,
              }}
            />
          </div>
          {bulkIssue.completed === bulkIssue.total && (
            <div className="mt-3 text-xs text-slate-200">
              <b>{bulkIssue.total - bulkIssue.failed.length} succeeded</b>
              {bulkIssue.failed.length
                ? `, ${bulkIssue.failed.length} failed`
                : ""}
              {bulkIssue.failed.map((item) => (
                <p key={item.name} className="mt-1 text-rose-300">
                  {item.name}: {item.reason}
                </p>
              ))}
              <button
                onClick={() => setBulkIssue(null)}
                className="mt-3 font-semibold text-blue-300"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
