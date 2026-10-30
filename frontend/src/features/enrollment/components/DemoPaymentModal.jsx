import { FlaskConical, Loader2 } from "lucide-react";
import KiniDialog, { KiniDetailRow } from "@shared/components/KiniDialog";
import { DEMO_LABEL } from "@shared/services/demoPaymentApi";

const formatInr = (value) => `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(value) || 0)}`;

/**
 * The demo gateway: stands in for the real payment window while
 * VITE_PAYMENT_MODE=demo. It never asks for card or bank details; the
 * outcome is chosen here and recorded by the demo backend.
 *
 * `busy` is "success" | "failed" | null while a choice is being recorded.
 */
export default function DemoPaymentModal({ open, order, methodLabel, busy, onSucceed, onFail, onCancel }) {
  if (!order) return null;
  const items = order.items ?? [];
  const closeIfIdle = () => { if (!busy) onCancel(); };

  return (
    <KiniDialog
      open={open}
      onClose={closeIfIdle}
      icon={FlaskConical}
      title="Demo Payment Gateway"
      subtitle="Choose how this test payment should end."
      closeLabel="Cancel demo payment"
      width={560}
      meta={(
        <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
          {DEMO_LABEL}
        </span>
      )}
      footer={(
        <>
          <button
            type="button"
            onClick={closeIfIdle}
            disabled={Boolean(busy)}
            className="mr-auto rounded-xl px-4 py-2.5 text-sm font-semibold text-[#4b5f78] transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onFail}
            disabled={Boolean(busy)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
          >
            {busy === "failed" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Simulate Failed Payment
          </button>
          <button
            type="button"
            onClick={onSucceed}
            disabled={Boolean(busy)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#133B5D] to-[#2D6A9F] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(19,59,93,.25)] transition hover:brightness-105 disabled:opacity-60"
          >
            {busy === "success" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Simulate Successful Payment
          </button>
        </>
      )}
    >
      <div className="space-y-2.5">
        <KiniDetailRow label={items.length > 1 ? "Courses" : "Course"} tone="blue">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.courseId} className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate">{item.courseTitle}</span>
                {items.length > 1 && <span className="shrink-0 text-sm font-medium tabular-nums text-[#4b5f78] dark:text-slate-400">{formatInr(item.listPrice)}</span>}
              </li>
            ))}
          </ul>
        </KiniDetailRow>
        <KiniDetailRow label="Amount" tone="green">
          <span className="tabular-nums">{formatInr(order.amount)}</span>
          {order.discount > 0 && <span className="ml-2 text-xs font-medium text-[#4b5f78] dark:text-slate-400">after {formatInr(order.discount)} discount</span>}
        </KiniDetailRow>
        <KiniDetailRow label="Payment method" tone="purple">{methodLabel}</KiniDetailRow>
        <KiniDetailRow label="Order" tone="orange"><span className="font-mono text-sm">{order.orderId}</span></KiniDetailRow>
      </div>
      <p className="mt-4 text-xs leading-5 text-[#5b6f88] dark:text-slate-400">
        No bank, card or UPI service is contacted. A successful demo payment sends your enrollment to the organization for approval; a failed one changes nothing and you can retry.
      </p>
    </KiniDialog>
  );
}
