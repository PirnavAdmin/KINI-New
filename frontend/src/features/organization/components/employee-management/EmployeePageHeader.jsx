import { motion } from "framer-motion";

// Page header for Organization → Employees: icon tile, two-tone title and the
// page actions. `PageHeader` is shared across roles and has no icon slot, so
// this page-level header is kept local. Colors avoid `text-blue-*` /
// `text-[#0f55f7]` because the org-admin theme recolors those on this page.
export default function EmployeePageHeader({ title, subtitle, icon: Icon, actions }) {
  const [lead, ...rest] = String(title).split(" ");

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 flex min-w-0 flex-col gap-4 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
        {Icon && (
          <span
            aria-hidden="true"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#E7F0FB] text-[#2A5DA8] shadow-[0_6px_16px_rgba(42,93,168,.10)] ring-1 ring-[#D6E4F6] sm:h-16 sm:w-16 dark:bg-slate-800 dark:text-sky-300 dark:ring-slate-700"
          >
            <Icon className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={1.75} />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] sm:text-[32px]">
            <span className="text-[#133B5D] dark:text-white">{lead}</span>
            {rest.length > 0 && (
              <>
                {" "}
                <span className="text-[#1F3FA8] dark:text-sky-300">{rest.join(" ")}</span>
              </>
            )}
          </h1>
          {subtitle && (
            <p className="mt-1 max-w-3xl text-[13px] leading-5 text-slate-500 sm:text-[15px] sm:leading-6 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </motion.header>
  );
}
