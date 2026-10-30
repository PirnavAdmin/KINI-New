import PropTypes from "prop-types";

export default function OnlineIndicator({ online = false, label }) {
  const text = label ?? (online ? "Online" : "Offline");

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs ${
        online ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${online ? "bg-emerald-500" : "bg-slate-300"}`} />
      {text}
    </span>
  );
}

OnlineIndicator.propTypes = {
  online: PropTypes.bool,
  label: PropTypes.string,
};

