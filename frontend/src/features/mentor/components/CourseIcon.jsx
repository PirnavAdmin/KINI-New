import PropTypes from "prop-types";
import { Atom, BarChart3, BookOpen, Brain, Coffee, Infinity as InfinityIcon, Leaf } from "lucide-react";

/* Small square course logo tile (My Courses list + detail header). Picks a
   themed mark from the course name; falls back to a book icon. */
const THEMES = [
  { test: /dev\s*ops/i, key: "devops", Icon: InfinityIcon },
  { test: /mern|mongo/i, key: "mern", Icon: Leaf },
  { test: /node/i, key: "node", text: "node" },
  { test: /react|next/i, key: "react", Icon: Atom },
  { test: /java(?!script)|spring/i, key: "java", Icon: Coffee },
  { test: /\bai\b|ml\b|machine|deep/i, key: "ai", Icon: Brain },
  { test: /data|analytics|python/i, key: "data", Icon: BarChart3 },
];

const courseTheme = (name = "") => THEMES.find(({ test }) => test.test(name)) ?? { key: "generic", Icon: BookOpen };

export default function CourseIcon({ name = "", size = "md", className = "" }) {
  const theme = courseTheme(name);
  const Icon = theme.Icon;
  return (
    <span className={`mv17-course-icon mv17-course-icon--${theme.key} mv17-course-icon--${size} ${className}`} aria-hidden="true">
      {theme.text ? <b>{theme.text}</b> : <Icon />}
    </span>
  );
}

CourseIcon.propTypes = { name: PropTypes.string, size: PropTypes.oneOf(["sm", "md", "lg"]), className: PropTypes.string };
