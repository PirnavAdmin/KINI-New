import { useState } from "react";
import { Check, ClipboardCheck, X } from "lucide-react";
export default function CorrectionRequests({ requests, onResolve, notify }) {
  const [dialog, setDialog] = useState(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const confirm = () => {
    const result = onResolve(dialog.request, dialog.decision, reason);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    notify(`Correction ${dialog.decision}`);
    setDialog(null);
    setReason("");
    setError("");
  };
  return (
    <div>
      {requests.length === 0 ? (
        <div className="grid min-h-72 place-items-center rounded-xl border bg-white text-center">
          <div>
            <ClipboardCheck className="mx-auto h-9 w-9 text-emerald-500" />
            <h2 className="mt-3 font-semibold">No pending corrections</h2>
            <p className="mt-1 text-sm text-slate-500">
              All requests have been reviewed.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full min-w-[1150px] text-left text-xs">
            <thead className="bg-slate-50 uppercase tracking-wider text-slate-500">
              <tr>
                {[
                  "Student",
                  "Class Date",
                  "Original Status",
                  "Requested Status",
                  "Reason",
                  "Requested By",
                  "Date",
                  "Actions",
                ].map((head) => (
                  <th key={head} className="px-4 py-3">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4 font-semibold">{item.student}</td>
                  <td className="px-4">{item.date}</td>
                  <td className="px-4">
                    <span className="rounded bg-red-50 px-2 py-1 text-red-600">
                      {item.original}
                    </span>
                  </td>
                  <td className="px-4">
                    <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">
                      {item.requested}
                    </span>
                  </td>
                  <td className="max-w-xs px-4 text-slate-600">
                    {item.reason}
                  </td>
                  <td className="px-4">{item.requestedBy}</td>
                  <td className="px-4">{item.requestedAt}</td>
                  <td className="px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setDialog({ request: item, decision: "approved" })
                        }
                        className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-2 font-semibold text-white"
                      >
                        <Check className="h-3 w-3" />
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          setDialog({ request: item, decision: "rejected" })
                        }
                        className="inline-flex items-center gap-1 rounded border border-red-200 px-2.5 py-2 font-semibold text-red-600"
                      >
                        <X className="h-3 w-3" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {dialog && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4">
          <div
            role="alertdialog"
            className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl"
          >
            <h2 className="font-semibold">
              {dialog.decision === "approved"
                ? "Approve attendance override?"
                : "Reject correction request?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Override <b>{dialog.request.student}</b> attendance on{" "}
              <b>{dialog.request.date}</b> from <b>{dialog.request.original}</b>{" "}
              → <b>{dialog.request.requested}</b>? This change will be
              permanently recorded in the audit log.
            </p>
            <label className="mt-4 block text-xs font-semibold">
              Admin reason <span className="text-red-500">*</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="3"
                className="mt-1.5 w-full rounded-lg border p-3 text-sm"
              />
            </label>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setDialog(null);
                  setReason("");
                  setError("");
                }}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirm}
                className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${dialog.decision === "approved" ? "bg-emerald-600" : "bg-red-600"}`}
              >
                {dialog.decision === "approved"
                  ? "Confirm override"
                  : "Reject request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
