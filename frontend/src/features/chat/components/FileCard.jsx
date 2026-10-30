import PropTypes from "prop-types";
import { Download, FileText } from "lucide-react";

const FILE_STYLES = {
  pdf: "from-rose-500 to-red-500",
  doc: "from-blue-600 to-cyan-500",
  image: "from-emerald-500 to-teal-500",
  code: "from-violet-600 to-fuchsia-500",
  voice: "from-amber-500 to-orange-500",
};

export default function FileCard({ name, size, type = "pdf" }) {
  return (
    <div className="flex min-w-[240px] items-center gap-3 rounded-2xl border border-white/70 bg-white/95 p-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)] dark:border-slate-700/70 dark:bg-slate-900/90">
      <span
        className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ${
          FILE_STYLES[type] || FILE_STYLES.pdf
        }`}
      >
        <FileText className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
          {name}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {type.toUpperCase()} {size ? `· ${size}` : ""}
        </p>
      </div>

      <button
        type="button"
        aria-label={`Download ${name}`}
        className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-300"
      >
        <Download className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}

FileCard.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.string,
  type: PropTypes.oneOf(["pdf", "doc", "image", "code", "voice"]),
};

