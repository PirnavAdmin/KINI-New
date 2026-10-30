import PropTypes from "prop-types";

const SIZE_MAP = {
  sm: "h-10 w-10 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-xl",
  xl: "h-28 w-28 text-2xl",
};

export default function ChatAvatar({ person, size = "md" }) {
  return (
    <div className="relative shrink-0">
      <div
        className={`grid place-items-center rounded-[1.4rem] bg-gradient-to-br font-semibold text-white shadow-[0_14px_30px_-18px_rgba(37,99,235,0.85)] ${person.gradient} ${SIZE_MAP[size]}`}
        aria-hidden="true"
      >
        {person.initials}
      </div>
      {person.online && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-emerald-500 shadow-sm dark:border-slate-950" />
      )}
    </div>
  );
}

ChatAvatar.propTypes = {
  person: PropTypes.object.isRequired,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
};

