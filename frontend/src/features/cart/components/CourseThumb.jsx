const initialsOf = (name = "") =>
  name
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("") || "K";

/** Course image, or a navy tile with the course initials when there is none. */
export default function CourseThumb({ course, className = "w-20 h-20 sm:w-24 sm:h-24" }) {
  if (course.thumbnail) {
    return (
      <img
        src={course.thumbnail}
        alt=""
        className={`${className} shrink-0 rounded-2xl object-cover`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${className} shrink-0 rounded-2xl bg-gradient-to-br from-[#133B5D] to-[#1f5785] flex items-center justify-center text-white font-extrabold text-xl tracking-tight shadow-inner`}
    >
      {initialsOf(course.name)}
    </div>
  );
}
