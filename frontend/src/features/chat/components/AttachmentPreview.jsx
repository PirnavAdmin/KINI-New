import PropTypes from "prop-types";
import { FileText, X } from "lucide-react";

export default function AttachmentPreview({ file, onRemove }) {
  if (!file) {
    return null;
  }

  return (
    <div className="mx-4 mb-3 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm dark:border-blue-500/20 dark:bg-blue-500/10">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
        <FileText className="h-4.5 w-4.5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-800 dark:text-slate-100">
          {file.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-300">
          {(Math.max(1, Math.round(file.size / 1024)))} KB
        </p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove attachment"
        className="rounded-full p-1 text-slate-400 transition hover:bg-white/70 hover:text-slate-700 dark:hover:bg-slate-900/70 dark:hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

AttachmentPreview.propTypes = {
  file: PropTypes.object,
  onRemove: PropTypes.func.isRequired,
};

