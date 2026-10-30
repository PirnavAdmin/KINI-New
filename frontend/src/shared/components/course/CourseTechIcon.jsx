import { resolveCourseTech } from "./courseTech";

// Brand icon for a course name, inside an optional tinted tile.
export default function CourseTechIcon({ name, size = "md", tile = true, className = "" }) {
  const { icon: Icon, color, soft } = resolveCourseTech(name);
  const sizes = {
    sm: { box: "h-8 w-8 rounded-lg", icon: "h-[18px] w-[18px]" },
    md: { box: "h-11 w-11 rounded-xl", icon: "h-6 w-6" },
    xl: { box: "h-[88px] w-[88px] rounded-[22px] sm:h-[100px] sm:w-[100px]", icon: "h-12 w-12 sm:h-14 sm:w-14" },
  }[size];

  if (!tile) return <Icon aria-hidden="true" className={`${sizes.icon} ${className}`} style={{ color }} />;

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center ${sizes.box} ${className}`}
      style={{ backgroundColor: soft }}
    >
      <Icon className={sizes.icon} style={{ color }} />
    </span>
  );
}
