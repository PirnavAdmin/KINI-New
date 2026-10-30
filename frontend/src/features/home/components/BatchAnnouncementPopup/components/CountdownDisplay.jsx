import { memo } from "react";
import { motion } from "framer-motion";
import { FaUsers } from "react-icons/fa";

const CountdownSegment = memo(({ value, label, isLast }) => (
  <div className="flex items-center gap-1">
    <div className="flex flex-col items-center">
      <div className="min-w-[3.5rem] sm:min-w-[4rem] px-3 py-2 sm:py-2.5 rounded-xl bg-gradient-to-b from-amber-50 to-amber-100/60 border border-amber-200/60 shadow-sm backdrop-blur-sm">
        <span className="block text-center text-lg sm:text-xl font-bold text-amber-800 tabular-nums leading-none">
          {value}
        </span>
        <span className="block text-center text-[10px] font-semibold text-amber-500 uppercase tracking-wider mt-0.5">
          {label}
        </span>
      </div>
    </div>
    {!isLast && (
      <span className="text-lg font-bold text-amber-300 self-start mt-2 px-0.5">:</span>
    )}
  </div>
));

CountdownSegment.displayName = "CountdownSegment";

const CountdownDisplay = memo(({ timeLeft, seatsFilled, seatsTotal, variants: customVariants }) => {
  const pct = Math.round((seatsFilled / seatsTotal) * 100);
  const v = customVariants;

  return (
    <motion.div
      variants={v}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200/40 shadow-sm"
    >
      {/* Timer */}
      <div className="flex items-center gap-1">
        <span className="text-xs font-semibold text-amber-700/80 uppercase tracking-wider mr-2 select-none">
          Closes in
        </span>
        <div className="flex items-center">
          <CountdownSegment value={timeLeft.days} label="days" />
          <CountdownSegment value={timeLeft.hours} label="hrs" />
          <CountdownSegment value={timeLeft.minutes} label="min" isLast />
        </div>
      </div>

      {/* Seats */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-amber-700">
          <FaUsers className="text-[11px]" />
          <span className="text-xs font-medium">
            <span className="font-bold">{seatsTotal - seatsFilled}</span> seats left
          </span>
        </div>
        <div className="w-16 sm:w-20 h-1.5 rounded-full bg-amber-200/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
});

CountdownDisplay.displayName = "CountdownDisplay";
export default CountdownDisplay;
