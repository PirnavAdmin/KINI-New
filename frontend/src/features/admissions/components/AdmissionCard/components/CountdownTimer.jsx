import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiClock, FiUsers } from "react-icons/fi";

function calcTimeLeft(targetDate) {
  const diff = targetDate - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const TimeUnit = memo(function TimeUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center">
        <motion.span
          key={value}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-base sm:text-lg font-bold text-white tabular-nums"
        >
          {String(value).padStart(2, "0")}
        </motion.span>
      </div>
      <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
});

const CountdownTimer = memo(function CountdownTimer({ urgency }) {
  const deadlineMs = urgency.deadlineDays * 24 * 60 * 60 * 1000;
  const targetDate = new Date(Date.now() + deadlineMs);
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fillPercent = Math.min(
    100,
    (urgency.filledSeats / urgency.totalSeats) * 100
  );
  const isUrgent = fillPercent > 80;

  return (
    <div className="relative rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/60 to-slate-950/60 backdrop-blur-xl p-5 overflow-hidden">
      {/* Background glow */}
      <div className={`absolute inset-0 pointer-events-none ${isUrgent ? "bg-rose-500/5" : "bg-amber-500/5"}`} />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isUrgent ? "bg-rose-400 animate-pulse" : "bg-amber-400 animate-pulse"}`} />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {urgency.label}
            </span>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${isUrgent ? "bg-rose-500/10 border-rose-500/20 text-rose-300" : "bg-amber-500/10 border-amber-500/20 text-amber-300"}`}>
            {isUrgent ? "Almost Full" : "Limited"}
          </span>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {timeLeft.days > 0 && <TimeUnit value={timeLeft.days} label="Days" />}
          {timeLeft.days > 0 && <span className="text-slate-600 text-lg font-light mt-[-1.5rem]">:</span>}
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <span className="text-slate-600 text-lg font-light mt-[-1.5rem]">:</span>
          <TimeUnit value={timeLeft.minutes} label="Min" />
          <span className="text-slate-600 text-lg font-light mt-[-1.5rem]">:</span>
          <TimeUnit value={timeLeft.seconds} label="Sec" />
        </div>

        {/* Seats Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <FiUsers className="text-[11px]" />
              <span>{urgency.filledSeats}/{urgency.totalSeats} seats filled</span>
            </div>
            <span className="font-semibold text-slate-300">
              {urgency.totalSeats - urgency.filledSeats} left
            </span>
          </div>

          <div className="h-2 bg-slate-800/60 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${fillPercent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className={`h-full rounded-full ${
                isUrgent
                  ? "bg-gradient-to-r from-rose-500 to-red-500"
                  : "bg-gradient-to-r from-amber-500 to-orange-500"
              }`}
            />
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
          <FiClock className="text-[9px]" />
          <span>Offer ends in {urgency.deadlineDays} days</span>
        </div>
      </div>
    </div>
  );
});

export default CountdownTimer;
