import PropTypes from "prop-types";

export default function UnreadBadge({ count = 0 }) {
  if (!count) {
    return null;
  }

  return (
    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
      {count}
    </span>
  );
}

UnreadBadge.propTypes = {
  count: PropTypes.number,
};

