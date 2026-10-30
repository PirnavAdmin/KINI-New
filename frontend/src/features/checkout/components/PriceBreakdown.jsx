import { motion } from "framer-motion";
import { FiTag } from "react-icons/fi";

/**
 * PriceBreakdown
 * Renders a line-item breakdown of pricing and computes the final
 * payable amount based on the base price, base discount, GST, and
 * any applied coupon.
 *
 * @param {object} priceData - { originalPrice, discountPercent, gstPercent }
 * @param {object|null} appliedCoupon - { type: 'flat'|'percent', value, code }
 */
const PriceBreakdown = ({ priceData, appliedCoupon }) => {
  const { originalPrice, discountPercent, gstPercent } = priceData;

  // Base discount applied before any coupon
  const baseDiscount = Math.round((originalPrice * discountPercent) / 100);
  const priceAfterBaseDiscount = originalPrice - baseDiscount;

  // Coupon discount (flat or percentage on the discounted price)
  let couponDiscount = 0;
  if (appliedCoupon) {
    couponDiscount =
      appliedCoupon.type === "percent"
        ? Math.round((priceAfterBaseDiscount * appliedCoupon.value) / 100)
        : appliedCoupon.value;
  }

  const totalDiscount = baseDiscount + couponDiscount;
  const taxableAmount = Math.max(originalPrice - totalDiscount, 0);
  const gstAmount = Math.round((taxableAmount * gstPercent) / 100);
  const finalAmount = taxableAmount + gstAmount;

  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const rows = [
    { label: "Original Price", value: formatINR(originalPrice), muted: true },
    {
      label: `Discount (${discountPercent}% off)`,
      value: `- ${formatINR(baseDiscount)}`,
      accent: "text-emerald-400",
    },
  ];

  if (appliedCoupon) {
    rows.push({
      label: `Coupon (${appliedCoupon.code})`,
      value: `- ${formatINR(couponDiscount)}`,
      accent: "text-emerald-400",
      icon: true,
    });
  }

  rows.push({
    label: `GST (${gstPercent}%)`,
    value: `+ ${formatINR(gstAmount)}`,
    muted: true,
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-7 shadow-xl shadow-black/20"
    >
      <h3 className="text-base sm:text-lg font-semibold text-white mb-5">Price Details</h3>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-slate-400">
              {row.icon && <FiTag className="w-3.5 h-3.5 text-emerald-400" />}
              {row.label}
            </span>
            <span className={`font-medium ${row.accent ?? "text-slate-300"} ${row.muted ? "" : ""}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="my-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Final amount highlight */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-500/10 border border-cyan-400/20 px-4 py-4">
        <div>
          <p className="text-xs text-slate-400 font-medium">Total Payable</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-0.5">
            {formatINR(finalAmount)}
          </p>
        </div>
        {totalDiscount > 0 && (
          <div className="text-right">
            <p className="text-xs text-slate-500 line-through">{formatINR(originalPrice + Math.round((taxableAmount + totalDiscount) * gstPercent / 100))}</p>
            <p className="text-xs font-semibold text-emerald-400 mt-0.5">
              You save {formatINR(totalDiscount)}
            </p>
          </div>
        )}
      </div>

      <p className="mt-3 text-[11px] text-slate-500 text-center">
        Inclusive of all taxes. A GST invoice will be emailed after payment.
      </p>
    </motion.section>
  );
};

export default PriceBreakdown;
