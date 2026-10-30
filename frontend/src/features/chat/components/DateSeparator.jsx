import PropTypes from "prop-types";

export default function DateSeparator({ label }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
      <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {label}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
    </div>
  );
}

DateSeparator.propTypes = {
  label: PropTypes.string.isRequired,
};

