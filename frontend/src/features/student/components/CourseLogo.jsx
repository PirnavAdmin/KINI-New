import PropTypes from "prop-types";
import { BookOpen } from "lucide-react";

// Brand-style marks for common course names; anything else falls back to
// a book icon so every course still gets a tile.
const NodeMark = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M32 5 56 18.5v27L32 59 8 45.5v-27Z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
    <text x="32" y="41" textAnchor="middle" fontSize="20" fontWeight="800" fontFamily="inherit" fill="currentColor">JS</text>
  </svg>
);

const ReactMark = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3.2">
    <ellipse cx="32" cy="32" rx="26" ry="10" />
    <ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(60 32 32)" />
    <ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(120 32 32)" />
    <circle cx="32" cy="32" r="4.5" fill="currentColor" stroke="none" />
  </svg>
);

const TextMark = ({ label }) => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="7" y="7" width="50" height="50" rx="12" fill="none" stroke="currentColor" strokeWidth="4.5" />
    <text x="32" y="40" textAnchor="middle" fontSize="18" fontWeight="800" fontFamily="inherit" fill="currentColor">{label}</text>
  </svg>
);
TextMark.propTypes = { label: PropTypes.string.isRequired };

const HtmlMark = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M10 6h44l-4 46-18 6-18-6Z" fill="currentColor" />
    <path d="M22 18h21l-1 6H28l.6 7h12.8l-1.4 13L32 47l-8-3-.5-6h6l.3 3 2.2.7 2.3-.7.5-5H23Z" fill="#fff" />
  </svg>
);

const LOGOS = [
  { test: /html|css/i, tone: "html", Mark: HtmlMark },
  { test: /node/i, tone: "node", Mark: NodeMark },
  { test: /react/i, tone: "react", Mark: ReactMark },
  { test: /python/i, tone: "python", Mark: () => <TextMark label="Py" /> },
  { test: /java(?!script)/i, tone: "java", Mark: () => <TextMark label="Jv" /> },
  { test: /javascript|\bjs\b/i, tone: "js", Mark: () => <TextMark label="JS" /> },
  { test: /mern|mean|full\s*stack/i, tone: "react", Mark: ReactMark },
];

export default function CourseLogo({ name = "", size = "lg" }) {
  const match = LOGOS.find(({ test }) => test.test(name));
  const Mark = match?.Mark;
  return (
    <span className={`ksl-course-logo ksl-course-logo--${size} ksl-course-logo--${match?.tone || "default"}`}>
      {Mark ? <Mark /> : <BookOpen />}
    </span>
  );
}

CourseLogo.propTypes = {
  name: PropTypes.string,
  size: PropTypes.oneOf(["sm", "lg"]),
};
