import { motion } from "framer-motion";

// Students page header: icon tile, title/subtitle, a decorative tagline and the
// page actions. The tagline is purely decorative (aria-hidden, no pointer
// events) and only shown where there is room, so it never crowds the buttons.
export default function StudentsPageHeader({ title, subtitle, icon: Icon, actions }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
        {Icon && (
          <span
            aria-hidden="true"
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#E5F0FF] text-[#0877F9] shadow-[0_6px_16px_rgba(8,119,249,.12)] ring-1 ring-[#D3E4FB] sm:h-[72px] sm:w-[72px] dark:bg-slate-800 dark:text-sky-300 dark:ring-slate-700"
          >
            <Icon className="h-7 w-7 sm:h-9 sm:w-9" strokeWidth={1.75} />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em] !text-[#0B2545] sm:text-[32px] dark:!text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm leading-6 !text-[#5B78A0] sm:text-[15px] dark:!text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <p
          aria-hidden="true"
          className="pointer-events-none hidden -rotate-6 select-none text-[26px] leading-[1.05] text-[#9CB9DD]/60 min-[1400px]:block"
          style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: "italic" }}
        >
          Empowering
          <br />
          <span className="pl-5">Future Leaders</span>
        </p>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </motion.header>
  );
}
