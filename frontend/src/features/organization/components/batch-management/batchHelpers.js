// Plain (non-component) helpers for the organization Batches table. Split out
// of batchUi.jsx so that file exports components only (Fast Refresh needs a
// component-only module to keep working).

export const hashText = (text) => {
  let hash = 0;
  for (const char of String(text ?? "")) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });
export const formatBatchDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
};

// Batch progress has no backend field. It is derived from the batch's own
// start/end dates against the current time (0% before start, 100% once past
// end) — a real, reproducible number rather than an invented one.
export const computeBatchProgress = (startDate, endDate) => {
  const start = startDate ? new Date(startDate).getTime() : NaN;
  const end = endDate ? new Date(endDate).getTime() : NaN;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
};
