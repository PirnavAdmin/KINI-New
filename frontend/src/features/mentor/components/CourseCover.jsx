import PropTypes from "prop-types";

/* Illustrated course cover for batch cards. Uses the course's own image
   when the API sends one; otherwise draws a themed cover from the course
   name (DevOps, Node.js, React, Python, Java …) so every card has art. */

const THEMES = [
  { test: /dev\s*ops/i, key: "devops" },
  { test: /node/i, key: "node" },
  { test: /react|mern|next/i, key: "react" },
  { test: /python|django|flask/i, key: "python" },
  { test: /java(?!script)|spring/i, key: "java" },
  { test: /data|ml|machine|ai\b/i, key: "data" },
];

function DevOpsArt() {
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="ccDevops" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1d4fd8" /><stop offset="1" stopColor="#0b2a7a" /></linearGradient>
        <linearGradient id="ccLoop" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7cc4ff" /><stop offset="1" stopColor="#3b82f6" /></linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#ccDevops)" />
      {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={30 + i * 34} cy={20 + (i % 3) * 60} r="1.6" fill="#9cc7ff" opacity=".5" />)}
      <path d="M100 92 C100 62 140 62 160 92 C180 122 220 122 220 92 C220 62 180 62 160 92 C140 122 100 122 100 92 Z" fill="none" stroke="url(#ccLoop)" strokeWidth="14" strokeLinejoin="round" />
      <path d="M100 92 C100 62 140 62 160 92 C180 122 220 122 220 92 C220 62 180 62 160 92 C140 122 100 122 100 92 Z" fill="none" stroke="#dbeafe" strokeWidth="2" strokeDasharray="4 8" />
      <g fill="#ffffff" opacity=".9">
        <circle cx="62" cy="130" r="16" fill="none" stroke="#ffffff" strokeWidth="4" />
        <circle cx="62" cy="130" r="5" />
        <path d="M250 42 a14 14 0 0 1 26 6 a10 10 0 0 1 -4 19 h-26 a10 10 0 0 1 4 -25 z" opacity=".8" />
        <path d="M150 150 l10 -6 l10 6 v12 l-10 6 l-10 -6 z" fill="none" stroke="#ffffff" strokeWidth="3" />
      </g>
    </svg>
  );
}

function NodeArt() {
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="ccNode" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0f3d2e" /><stop offset="1" stopColor="#06180f" /></linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#ccNode)" />
      <g transform="translate(160 90) scale(0.74) translate(-160 -90)">
      <rect x="210" y="40" width="92" height="104" rx="8" fill="#0b2a1d" stroke="#1f6e46" />
      {[56, 68, 80, 92, 104, 116, 128].map((y, i) => <rect key={y} x={220 + (i % 2) * 8} y={y} width={40 + (i * 7) % 34} height="4" rx="2" fill={i % 3 ? "#2e8b57" : "#7ee2a8"} opacity=".7" />)}
      <text x="28" y="108" fill="#ffffff" fontSize="40" fontWeight="800" fontFamily="Arial, sans-serif">n</text>
      <circle cx="68" cy="94" r="12" fill="none" stroke="#ffffff" strokeWidth="6" />
      <text x="84" y="108" fill="#ffffff" fontSize="40" fontWeight="800" fontFamily="Arial, sans-serif">de</text>
      <path d="M170 56 L200 73 V107 L170 124 L140 107 V73 Z" fill="#3fae49" />
      <path d="M170 56 L200 73 V107 L170 124 L140 107 V73 Z" fill="none" stroke="#8be08f" strokeWidth="2" />
      <text x="170" y="100" fill="#ffffff" textAnchor="middle" fontSize="24" fontWeight="800" fontFamily="Arial, sans-serif">JS</text>
      </g>
    </svg>
  );
}

function ReactArt() {
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="ccReact" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#15223d" /><stop offset="1" stopColor="#0a1122" /></linearGradient></defs>
      <rect width="320" height="180" fill="url(#ccReact)" />
      <g transform="translate(160 90)" fill="none" stroke="#61dafb" strokeWidth="5">
        <ellipse rx="70" ry="26" />
        <ellipse rx="70" ry="26" transform="rotate(60)" />
        <ellipse rx="70" ry="26" transform="rotate(120)" />
        <circle r="11" fill="#61dafb" stroke="none" />
      </g>
    </svg>
  );
}

function GenericArt({ label, from, to, accent }) {
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id={`cc-${label}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={from} /><stop offset="1" stopColor={to} /></linearGradient></defs>
      <rect width="320" height="180" fill={`url(#cc-${label})`} />
      <circle cx="270" cy="30" r="70" fill="#ffffff" opacity=".06" />
      <circle cx="40" cy="170" r="60" fill="#ffffff" opacity=".05" />
      <path d="M118 70 L92 92 L118 114" fill="none" stroke={accent} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M202 70 L228 92 L202 114" fill="none" stroke={accent} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M172 62 L148 122" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
      <text x="160" y="160" fill="#ffffff" opacity=".85" textAnchor="middle" fontSize="18" fontWeight="700" fontFamily="Arial, sans-serif">{label}</text>
    </svg>
  );
}
GenericArt.propTypes = { label: PropTypes.string, from: PropTypes.string, to: PropTypes.string, accent: PropTypes.string };

export default function CourseCover({ name = "", imageUrl, className = "" }) {
  if (imageUrl) {
    return <img src={imageUrl} alt="" className={`mentor-course-cover ${className}`} loading="lazy" />;
  }
  const theme = THEMES.find(({ test }) => test.test(name))?.key;
  const label = String(name || "Course").trim().slice(0, 18);
  return (
    <div className={`mentor-course-cover ${className}`} aria-hidden="true">
      {theme === "devops" && <DevOpsArt />}
      {theme === "node" && <NodeArt />}
      {theme === "react" && <ReactArt />}
      {theme === "python" && <GenericArt label={label} from="#1e4f8a" to="#0e2748" accent="#ffd43b" />}
      {theme === "java" && <GenericArt label={label} from="#9a3412" to="#431407" accent="#fdba74" />}
      {theme === "data" && <GenericArt label={label} from="#5b21b6" to="#2e1065" accent="#c4b5fd" />}
      {!theme && <GenericArt label={label} from="#133b5d" to="#0a1f33" accent="#f39924" />}
    </div>
  );
}

CourseCover.propTypes = { name: PropTypes.string, imageUrl: PropTypes.string, className: PropTypes.string };
