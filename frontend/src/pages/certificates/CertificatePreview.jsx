import "./certificatePreview.css";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Award,
  Download,
  Printer,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";

const QR_SIZE = 21;
const inFinder = (row, col, top, left) => {
  const y = row - top;
  const x = col - left;
  if (x < 0 || x > 6 || y < 0 || y > 6) return false;
  return x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4);
};
// A crisp QR-style verification mark with the three standard finder squares.
const qrPattern = Array.from({ length: QR_SIZE * QR_SIZE }, (_, index) => {
  const row = Math.floor(index / QR_SIZE);
  const col = index % QR_SIZE;
  if (inFinder(row, col, 0, 0) || inFinder(row, col, 0, 14) || inFinder(row, col, 14, 0)) return 1;
  if ((row < 8 && col < 8) || (row < 8 && col > 12) || (row > 12 && col < 8)) return 0;
  return ((row * 11 + col * 7 + row * col) % 5) < 2 ? 1 : 0;
});

function QrMark() {
  return (
    <div
      aria-label="Certificate verification QR code"
      className="grid aspect-square h-20 w-20 grid-cols-[repeat(21,1fr)] grid-rows-[repeat(21,1fr)] border-[5px] border-white bg-white shadow-sm"
    >
      {qrPattern.map((on, index) => (
        <i key={index} className={on ? "bg-slate-900" : "bg-white"} />
      ))}
    </div>
  );
}

export default function CertificatePreview({
  record,
  onClose,
  onIssue,
  onRevoke,
  notify,
}) {
  const [current, setCurrent] = useState(record);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const isIssued = current.status === "Issued";
  const isRevoked = current.status === "Revoked";
  const certificateNo = current.certificateNo || "Not issued";

  const issue = () => {
    const number = onIssue(current.id);
    setCurrent((item) => ({
      ...item,
      status: "Issued",
      certificateNo: number,
      issuedDate: "August 4, 2026",
    }));
    notify("Certificate issued successfully — the student has been notified");
  };

  const downloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const fitText = (value, x, y, width, height, size) => {
      const text = String(value ?? 'Not provided');
      let lines;
      do {
        doc.setFontSize(size);
        lines = doc.splitTextToSize(text, width);
        if (lines.length * size * 0.4 <= height) break;
        size -= 0.5;
      } while (size > 4);
      doc.text(lines, x, y, { align: 'center', lineHeightFactor: 1.1 });
    };
    doc.setDrawColor(24, 77, 120);
    doc.setLineWidth(2);
    doc.rect(9, 9, 279, 192);
    doc.setDrawColor(202, 166, 71);
    doc.setLineWidth(0.6);
    doc.rect(13, 13, 271, 184);
    doc.setTextColor(24, 77, 120);
    doc.setFont("times", "bold");
    doc.setFontSize(30);
    doc.text("KINI EDX HUB", 148.5, 37, { align: "center" });
    doc.setTextColor(76, 85, 99);
    doc.setFontSize(11);
    doc.text("INSTITUTE OF PROFESSIONAL LEARNING", 148.5, 45, {
      align: "center",
    });
    doc.setTextColor(32, 39, 55);
    doc.setFontSize(25);
    doc.text("CERTIFICATE OF COMPLETION", 148.5, 70, { align: "center" });
    doc.setFont("times", "normal");
    doc.setFontSize(13);
    doc.text("This is to certify that", 148.5, 87, { align: "center" });
    doc.setTextColor(24, 77, 120);
    doc.setFont("times", "italic");
    doc.setFontSize(29);
    fitText(current.name, 148.5, 99, 230, 18, 29);
    doc.setDrawColor(202, 166, 71);
    doc.line(50, 116, 247, 116);
    doc.setTextColor(55, 65, 81);
    doc.setFont("times", "normal");
    doc.setFontSize(13);
    doc.text("has successfully completed", 148.5, 125, { align: "center" });
    doc.setFont("times", "bold");
    doc.setFontSize(19);
    fitText(current.course, 148.5, 138, 230, 18, 19);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Date: ${current.issuedDate || "August 4, 2026"}`, 39, 169);
    fitText(`Certificate No: ${certificateNo}`, 148.5, 169, 85, 15, 10);
    doc.setFont("times", "italic");
    doc.text("Authorized Signatory", 248, 169, { align: "center" });
    doc.line(225, 164, 271, 164);
    const qrX = 260;
    const qrY = 174;
    const qrSize = 18;
    const cellSize = qrSize / QR_SIZE;
    doc.setFillColor(255, 255, 255);
    doc.rect(qrX - 1.5, qrY - 1.5, qrSize + 3, qrSize + 3, "F");
    doc.setFillColor(15, 23, 42);
    qrPattern.forEach((on, index) => {
      if (!on) return;
      doc.rect(qrX + (index % QR_SIZE) * cellSize, qrY + Math.floor(index / QR_SIZE) * cellSize, cellSize, cellSize, "F");
    });
    doc.save(`${certificateNo}-${current.name.replaceAll(" ", "-")}.pdf`);
    notify("Certificate PDF downloaded successfully");
  };

  const revoke = () => {
    const result = onRevoke(current.id, reason);
    if (!result.ok) return setError(result.error);
    setCurrent((item) => ({
      ...item,
      status: "Revoked",
      revokeReason: reason,
    }));
    setRevokeOpen(false);
    notify("Certificate revoked and audit logged");
  };

  return createPortal(
    <div className="certificate-preview-modal fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-slate-950/70 p-2 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-labelledby="certificate-preview-title">
      <section className="certificate-preview-shell flex max-h-[calc(100dvh-2rem)] w-full max-w-[1020px] flex-col overflow-hidden rounded-2xl bg-slate-100 shadow-2xl">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Certificate preview
            </p>
            <h2 id="certificate-preview-title" className="mt-0.5 text-lg font-semibold">Review before issue</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close certificate preview"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="certificate-preview-scroll min-h-0 flex-1 overflow-y-auto p-2.5 sm:p-3">
        {isRevoked && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <b>This certificate has been revoked.</b>
              <p className="mt-1">Reason: {current.revokeReason}</p>
            </div>
          </div>
        )}
        <div
          id="certificate-preview"
          className="certificate-document relative mx-auto w-full max-w-[980px] bg-[#fffdf8] p-2 shadow-lg sm:p-3"
        >
          <div className="certificate-frame relative flex min-h-[560px] flex-col items-center gap-6 border-[3px] border-[#174a72] px-6 py-5 text-center sm:px-10 sm:py-8">
            <div className="pointer-events-none absolute inset-2 border border-[#caa647]" />
            <div className="absolute left-5 top-5 h-14 w-14 border-l-[18px] border-t-[18px] border-[#caa647]/25 sm:h-24 sm:w-24 sm:border-l-[28px] sm:border-t-[28px]" />
            <div className="absolute bottom-5 right-5 h-14 w-14 border-b-[18px] border-r-[18px] border-[#caa647]/25 sm:h-24 sm:w-24 sm:border-b-[28px] sm:border-r-[28px]" />
            <div className="relative flex items-center gap-2 text-[#174a72]">
              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#caa647] sm:h-11 sm:w-11">
                <Award className="h-5 w-5 sm:h-7 sm:w-7" />
              </span>
              <div className="text-left">
                <p className="font-serif text-sm font-bold tracking-[0.12em] sm:text-xl">
                  KINI EDX HUB
                </p>
                <p className="text-[6px] tracking-[0.2em] sm:text-[8px]">
                  INSTITUTE OF PROFESSIONAL LEARNING
                </p>
              </div>
            </div>
            <div className="certificate-content relative flex w-full min-w-0 flex-1 flex-col items-center justify-center py-2">
              <div className="h-px w-24 bg-[#caa647]" />
              <h1 className="mt-2 font-serif text-lg font-semibold tracking-[0.18em] text-slate-800 sm:text-3xl">
                CERTIFICATE OF COMPLETION
              </h1>
              <p className="mt-3 font-serif text-[9px] text-slate-500 sm:mt-5 sm:text-sm">
                This is to certify that
              </p>
              <p className="certificate-student mt-1 max-w-full border-b border-[#caa647] px-2 pb-1 font-serif text-2xl leading-tight italic text-[#174a72] [overflow-wrap:anywhere] sm:text-4xl">
                {current.name}
              </p>
              <p className="mt-3 font-serif text-[9px] text-slate-500 sm:mt-4 sm:text-sm">
                has successfully completed
              </p>
              <h2 className="certificate-course mt-1 max-w-full font-serif text-sm font-bold text-slate-800 [overflow-wrap:anywhere] sm:text-2xl">
                {current.course}
              </h2>
              <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                with distinction and demonstrated commitment to professional
                excellence
              </p>
            </div>
            <div className="certificate-signatures relative grid w-full shrink-0 grid-cols-1 items-end gap-4 text-xs text-slate-600 sm:grid-cols-[1fr_1.5fr_1fr_auto] [&>*]:min-w-0 [&>*]:[overflow-wrap:anywhere]">
              <div className="text-left">
                <p className="font-semibold text-slate-800">
                  {current.issuedDate || "August 4, 2026"}
                </p>
                <div className="mt-1 h-px w-full max-w-24 bg-slate-400" />
                <p className="mt-1">Date of Issue</p>
              </div>
              <div>
                <p className="font-mono font-semibold text-slate-700">
                  {certificateNo}
                </p>
                <p className="mt-1 text-[6px] uppercase tracking-wider sm:text-[9px]">
                  Certificate Number
                </p>
              </div>
              <div className="flex justify-end">
                <div className="pt-6 text-center">
                  <p className="font-serif italic text-slate-800">
                    Rahul Sharma
                  </p>
                  <div className="mt-1 h-px w-24 bg-slate-400" />
                  <p className="mt-1">Authorized Signatory</p>
                </div>
              </div>
              <div className="hidden sm:block" aria-label="Certificate verification area"><QrMark /></div>
            </div>
            {isRevoked && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-white/25">
                <span className="-rotate-12 border-4 border-red-500 px-8 py-2 text-4xl font-black tracking-widest text-red-500/80">
                  REVOKED
                </span>
              </div>
            )}
          </div>
        </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Digitally
            verifiable using the certificate number and QR code.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
            {isIssued && !isRevoked && (
              <button
                onClick={downloadPdf}
                className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold"
              >
                <Download className="h-4 w-4" /> Download PDF
              </button>
            )}
            {isIssued && !isRevoked && (
              <button
                onClick={() => setRevokeOpen(true)}
                className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600"
              >
                Revoke
              </button>
            )}
            {!isIssued && !isRevoked && (
              <button
                onClick={issue}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Send className="h-4 w-4" /> Issue Certificate
              </button>
            )}
          </div>
        </div>
      </section>
      {revokeOpen && (
        <div className="fixed inset-0 z-[1010] grid place-items-center overflow-y-auto bg-slate-950/55 p-4">
          <div className="relative my-auto w-full rounded-xl bg-white p-5 shadow-2xl" style={{ maxWidth: "32rem" }} role="dialog" aria-modal="true" aria-labelledby="revoke-certificate-title">
            <button
              type="button"
              onClick={() => {
                setRevokeOpen(false);
                setError("");
              }}
              aria-label="Close revoke certificate dialog"
              title="Close"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex gap-3 text-red-700">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <div className="pr-8">
                <h3 id="revoke-certificate-title" className="font-semibold">Revoke this certificate?</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  The student will be notified, their download access will be
                  removed, and public verification will show this certificate as
                  revoked. This action is permanently audit-logged.
                </p>
              </div>
            </div>
            <label className="mt-4 block text-xs font-semibold">
              Revocation reason <span className="text-red-500">*</span>
              <textarea
                autoFocus
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError("");
                }}
                rows="3"
                className="mt-1.5 w-full rounded-lg border p-3 text-sm"
                placeholder="Explain why this certificate is being revoked"
              />
            </label>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setRevokeOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={revoke}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
