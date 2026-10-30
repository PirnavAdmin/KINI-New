import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiArrowRight, FiCheck, FiDownload, FiShare2, FiMail } from "react-icons/fi";
import { useThemeContext } from "@shared/context/ThemeContext";
import { BRAND } from "../theme";
const companyLogo = "/assets/new-logo-f.jpg.jpeg";


const t = (dark) => ({
  bg: dark ? "#050816" : "#F1F5F9",
  card: dark ? "rgba(11,17,32,0.75)" : "rgba(255,255,255,0.95)",
  border: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  text: dark ? "#F8FAFC" : "#0F172A",
  textSecondary: dark ? "#CBD5E1" : "#475569",
  textMuted: dark ? "#94A3B8" : "#64748B",
  borderLight: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  overlay: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
});

const PARTICLES = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 6 + 2,
  delay: Math.random() * 0.5,
  duration: Math.random() * 2 + 2,
}));

const SuccessScreen = ({ course, finalPrice, receipt, isStudentAccount = false, onBrowseCourses, onGoToDashboard }) => {
  const [visible, setVisible] = useState(false);
  const [receiptState, setReceiptState] = useState("idle"); // idle | generating | done | error
  const [shareState, setShareState] = useState("idle"); // idle | sharing | shared | copied | error
  const receiptTimerRef = useRef(null);
  const shareTimerRef = useRef(null);
  const { isDark } = useThemeContext();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Clear any pending button-label timers on unmount to avoid leaks.
  useEffect(() => () => {
    if (receiptTimerRef.current) clearTimeout(receiptTimerRef.current);
    if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
  }, []);

  // ---- Receipt data (real values from the successful enrollment/payment) ----
  // One payment can cover several courses: `receipt.items` lists each course
  // with its batch and enrollment request. Older single-course receipts have
  // only course/batch/requestId at the top level.
  const items = receipt?.items?.length
    ? receipt.items
    : [{ course: receipt?.course ?? { title: course?.name }, batch: receipt?.batch, requestId: receipt?.requestId }];
  const courseTitle = items.map((item) => String(item.course?.title || item.course?.name || "").trim()).filter(Boolean).join(", ")
    || String(course?.name || "").trim();
  const batchSummary = items.map((item) => [item.course?.title, item.batch?.name].filter(Boolean).join(": ")).filter(Boolean).join("; ");
  const studentName = [receipt?.student?.firstName, receipt?.student?.lastName]
    .filter(Boolean)
    .join(" ") || receipt?.student?.fullName || "";
  const customerEmail = receipt?.student?.email || "";
  const payment = receipt?.payment || {};
  // Demo Payment Mode receipts are labelled everywhere so they can't pass for a real payment.
  const isDemo = payment.mode === "demo";
  const orderId = payment.orderId != null ? String(payment.orderId) : (receipt?.requestId ? String(receipt.requestId) : "");
  const purchaseDate = payment.paidAt
    ? new Date(payment.paidAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "";
  const paidAmount = Number.isFinite(Number(payment.amount))
    ? `Rs. ${Number(payment.amount).toLocaleString("en-IN")}`
    : "";

  const handleDownloadReceipt = async () => {
    if (!receipt || receiptState === "generating") return;
    setReceiptState("generating");
    try {
      // Same receipt generator dependency/style already used elsewhere in the app.
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      doc.setDrawColor(219, 234, 254);
      doc.setLineWidth(0.6);
      doc.rect(8, 8, 194, 281);
      doc.setFillColor(15, 85, 247);
      doc.rect(8, 8, 194, 34, "F");
      doc.setFillColor(6, 182, 168);
      doc.rect(8, 39, 194, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(21);
      doc.text("KINI EDX HUB", 18, 21);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Payment Receipt", 18, 30);

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("PAYMENT RECEIPT", 18, 58);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      // Only fields that actually exist in the purchase data are printed.
      const rows = [
        [items.length > 1 ? `Courses (${items.length})` : "Course", courseTitle],
        ["Batches", items.length > 1 ? batchSummary : ""],
        ["Customer", studentName],
        ["Email", customerEmail],
        ["Order ID", orderId],
        ["Transaction ID", payment.transactionId],
        ["Payment method", payment.method],
        ["Purchase date", purchaseDate],
        ["Amount", paidAmount],
        ["Payment status", payment.status],
        ["Payment mode", isDemo ? payment.label : ""],
      ].filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "");

      let y = 75;
      rows.forEach(([label, value]) => {
        const lines = doc.splitTextToSize(String(value), 105); // wrap long course/customer names
        doc.setTextColor(100, 116, 139);
        doc.text(label, 18, y);
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.text(lines, 78, y);
        doc.setFont("helvetica", "normal");
        const lineY = y + 4 + (lines.length - 1) * 5;
        doc.setDrawColor(226, 232, 240);
        doc.line(18, lineY, 192, lineY);
        y += 11.5 + (lines.length - 1) * 5;
      });

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.text("This is a system-generated receipt and does not require a signature.", 105, 278, { align: "center" });

      const safeOrderId = String(orderId || payment.transactionId || "receipt").replace(/[^a-zA-Z0-9-_]/g, "-");
      doc.save(`course-receipt-${safeOrderId}.pdf`);
      setReceiptState("done");
      receiptTimerRef.current = setTimeout(() => setReceiptState("idle"), 2600);
    } catch (error) {
      console.error("Unable to generate the payment receipt", error);
      setReceiptState("error");
      receiptTimerRef.current = setTimeout(() => setReceiptState("idle"), 2600);
    }
  };

  const copyShareText = async () => {
    const text = [
      "Course Purchase Successful",
      `Your purchase of ${courseTitle || "your course"} was successful.`,
      orderId ? `Order ID: ${orderId}` : "",
      window.location.href,
    ].filter(Boolean).join("\n");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleShare = async () => {
    if (!receipt || shareState === "sharing") return;
    setShareState("sharing");
    let resetLabel = true;
    const shareData = {
      title: "Course Purchase Successful",
      text: `Your purchase of ${courseTitle || "your course"} was successful.`,
    };
    // Only attach the current app URL when it is a real shareable http(s) URL.
    if (/^https?:$/.test(window.location.protocol)) shareData.url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareState("shared");
      } else {
        setShareState(await copyShareText() ? "copied" : "error");
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        // User closed the native share dialog — not an error.
        resetLabel = false;
        setShareState("idle");
        return;
      }
      // Some browsers throw for unsupported share data — fall back to clipboard.
      setShareState(await copyShareText() ? "copied" : "error");
    } finally {
      if (resetLabel) {
        shareTimerRef.current = setTimeout(() => setShareState("idle"), 2600);
      }
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center transition-colors duration-300"
          style={{ backgroundColor: t(isDark).bg }}
        >
          {/* Floating particles */}
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute left-1/2 top-1/3 w-1 h-1 rounded-full"
              style={{
                left: `calc(50% + ${(p.x - 50) * 4}px)`,
                top: `calc(28% + ${(p.y - 50) * 2}px)`,
                backgroundColor: `${BRAND.primary}4D`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Background glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{
              background: `linear-gradient(135deg, ${BRAND.primary}1A, ${BRAND.secondary}1A)`,
            }}
          />

          {/* Success card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15, delay: 0.2 }}
            className="relative w-full max-w-[36rem] mx-4"
          >
            <div
              className="rounded-2xl p-6 sm:p-8 text-center shadow-2xl transition-colors duration-300"
              style={{
                border: `1px solid ${t(isDark).border}`,
                backgroundColor: t(isDark).card,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.08)",
              }}
            >
              {/* Logo */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.3 }}
                className="mb-4"
              >
                <div className="brand-logo-viewport mx-auto flex h-10 w-[90px] items-center justify-center">
                  <img src={companyLogo} alt="Kini" className="brand-logo-image" />
                </div>
              </motion.div>

              {/* Animated checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.4 }}
                className="relative mx-auto mb-4"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
                    boxShadow: `0 4px 24px ${BRAND.primary}4D`,
                  }}
                >
                  <FiCheckCircle className="w-10 h-10 text-white" />
                </div>
                {/* Ring pulse */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: `${BRAND.secondary}4D` }}
                  animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-3xl sm:text-4xl font-bold mb-2"
                style={{
                  fontFamily: "'Sora', sans-serif",
                  color: t(isDark).text,
                }}
              >
                Payment Successful!
              </motion.h1>

              {isDemo && (
                <p className="mx-auto mb-3 inline-flex rounded-full px-3 py-1 text-[11px] font-bold tracking-wide" style={{ backgroundColor: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D" }}>
                  {payment.label}
                </p>
              )}

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-base mb-2"
                style={{ color: t(isDark).textSecondary }}
              >
                Your payment has been received. Your enrollment request has been sent to the organization for approval.
              </motion.p>

              {/* Purchase details */}
              <motion.dl
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                className="mb-4 space-y-2 rounded-xl p-4 text-left text-sm"
                style={{ border: `1px solid ${t(isDark).borderLight}`, backgroundColor: t(isDark).overlay }}
              >
                {[
                  ["Student", studentName || "—"],
                  ["Amount paid", finalPrice != null ? `₹${Number(finalPrice).toLocaleString("en-IN")}` : "—"],
                  [isDemo ? "Demo transaction ID" : "Payment reference", payment.transactionId || "—"],
                  ...(isDemo ? [["Payment status", "Demo success"]] : []),
                  ["Order ID", orderId || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <dt style={{ color: t(isDark).textMuted }}>{label}</dt>
                    <dd className="text-right font-semibold break-all" style={{ color: t(isDark).text }}>{value}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4">
                  <dt style={{ color: t(isDark).textMuted }}>Enrollment status</dt>
                  <dd>
                    <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
                      Pending approval
                    </span>
                  </dd>
                </div>
              </motion.dl>

              <motion.ul
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.78 }}
                className="mb-4 space-y-2 text-left text-sm"
                aria-label="Courses in this payment"
              >
                {items.map((item, index) => (
                  <li
                    key={item.requestId ?? item.course?.id ?? index}
                    className="flex items-start justify-between gap-3 rounded-xl px-4 py-3"
                    style={{ border: `1px solid ${t(isDark).borderLight}`, backgroundColor: t(isDark).overlay }}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold" style={{ color: t(isDark).text }}>{item.course?.title || item.course?.name || "Course"}</p>
                      <p className="mt-0.5 text-xs" style={{ color: t(isDark).textMuted }}>
                        {[item.batch?.name, item.batch?.shift].filter(Boolean).join(" · ") || "Batch to be confirmed"}
                      </p>
                    </div>
                    {item.amount != null && items.length > 1 && (
                      <span className="shrink-0 text-xs font-semibold tabular-nums" style={{ color: t(isDark).textSecondary }}>
                        ₹{Number(item.amount).toLocaleString("en-IN")}
                      </span>
                    )}
                  </li>
                ))}
              </motion.ul>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-5 flex items-start gap-2 rounded-xl px-4 py-3 text-left text-sm"
                style={{ color: t(isDark).textSecondary, backgroundColor: `${BRAND.primary}0F`, border: `1px solid ${BRAND.primary}26` }}
              >
                <FiMail className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BRAND.primary }} />
                <span>
                  You will receive an email once your enrollment is approved.
                  {isStudentAccount
                    ? " Approved courses then appear in My Courses."
                    : customerEmail ? ` We'll send it to ${customerEmail}.` : ""}
                </span>
              </motion.p>

              {/* Action buttons */}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="space-y-3"
              >
                {/* Guests have no account until approval, so only students get a portal link. */}
                <button
                  type="button"
                  onClick={isStudentAccount ? onGoToDashboard : onBrowseCourses}
                  className="w-full rounded-2xl text-white px-6 py-4 font-semibold text-base flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`,
                    boxShadow: `0 4px 24px ${BRAND.primary}40`,
                  }}
                >
                  {isStudentAccount ? "Go to Dashboard" : "Browse more courses"}
                  <FiArrowRight className="w-5 h-5" />
                </button>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadReceipt}
                    disabled={!receipt || receiptState === "generating"}
                    className="flex-1 rounded-xl px-4 py-3 text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{
                      border: `1px solid ${t(isDark).borderLight}`,
                      backgroundColor: t(isDark).overlay,
                      color: t(isDark).textMuted,
                    }}
                  >
                    {receiptState === "done"
                      ? <FiCheck className="w-3.5 h-3.5" />
                      : <FiDownload className={`w-3.5 h-3.5 ${receiptState === "generating" ? "animate-pulse" : ""}`} />}
                    {receiptState === "generating" ? "Generating Receipt…" : receiptState === "done" ? "Receipt Downloaded" : receiptState === "error" ? "Download Failed — Retry" : "Receipt"}
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    disabled={!receipt || shareState === "sharing"}
                    className="flex-1 rounded-xl px-4 py-3 text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{
                      border: `1px solid ${t(isDark).borderLight}`,
                      backgroundColor: t(isDark).overlay,
                      color: t(isDark).textMuted,
                    }}
                  >
                    {shareState === "shared" || shareState === "copied"
                      ? <FiCheck className="w-3.5 h-3.5" />
                      : <FiShare2 className={`w-3.5 h-3.5 ${shareState === "sharing" ? "animate-pulse" : ""}`} />}
                    {shareState === "sharing" ? "Opening Share…" : shareState === "shared" ? "Shared" : shareState === "copied" ? "Copied to Clipboard" : shareState === "error" ? "Copy Failed — Retry" : "Share"}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessScreen;
