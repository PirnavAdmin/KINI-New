import { motion } from "framer-motion";
import { FiShield } from "react-icons/fi";
import { formatCurrency } from "@shared/utils/formatters";

/**
 * Price summary card for the cart page.
 * `children` renders the primary action; `note` renders under the totals.
 */
// `lines` lists each selected course with its price.
export default function OrderSummary({ title = "Order Summary", subtotal, discount = 0, total, courseCount, lines = [], note, children }) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="lg:sticky lg:top-24 rounded-3xl bg-white border border-slate-200 shadow-[0_20px_60px_rgba(19,59,93,0.08)] overflow-hidden"
      aria-label={title}
    >
      <div className="h-1 bg-gradient-to-r from-[#133B5D] via-[#1f5785] to-[#F39924]" />

      <div className="p-6 sm:p-7">
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#133B5D]">
          {title}
        </h2>

        {lines.length > 0 && (
          <ul className="mt-5 space-y-2 border-b border-dashed border-slate-200 pb-4 text-sm" aria-label="Selected courses">
            {lines.map((line) => (
              <li key={line.id} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-slate-700">{line.label}</span>
                <span className="shrink-0 font-semibold text-slate-900 tabular-nums">{formatCurrency(line.amount)}</span>
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-5 space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">
              Subtotal{courseCount ? ` (${courseCount} ${courseCount === 1 ? "course" : "courses"})` : ""}
            </dt>
            <dd className="font-semibold text-slate-900 tabular-nums">{formatCurrency(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Discount</dt>
            <dd className="font-semibold text-emerald-600 tabular-nums">
              {discount > 0 ? `− ${formatCurrency(discount)}` : formatCurrency(0)}
            </dd>
          </div>

          <div className="border-t border-dashed border-slate-200 pt-4 flex items-end justify-between">
            <dt className="font-bold text-[#133B5D]">Total</dt>
            <dd className="text-3xl font-extrabold text-[#133B5D] tabular-nums">{formatCurrency(total)}</dd>
          </div>
        </dl>

        {note && (
          <div className="mt-5 rounded-2xl bg-[#133B5D]/[0.05] p-3.5 text-xs leading-relaxed text-slate-600">{note}</div>
        )}

        <div className="mt-6 space-y-3">{children}</div>

        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <FiShield className="w-3.5 h-3.5" />
          Secure payment via Razorpay
        </p>
      </div>
    </motion.aside>
  );
}
