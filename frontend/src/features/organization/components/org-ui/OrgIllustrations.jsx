/* Decorative hero artwork for the organization pages. Pure SVG so it stays
   crisp at every density and adds no image requests. All art is aria-hidden. */

const svgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": "true",
  focusable: "false",
  preserveAspectRatio: "xMidYMax meet",
};

/** Soft background waves painted behind the hero content. */
export function HeroWaves({ tone = "blue" }) {
  const warm = tone === "warm";
  return (
    <svg className="kx-hero__waves" viewBox="0 0 1200 160" preserveAspectRatio="none" {...{ xmlns: svgProps.xmlns, "aria-hidden": "true" }}>
      <defs>
        <linearGradient id={`kx-wave-a-${tone}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={warm ? "#fff4e8" : "#dbe8fa"} stopOpacity="0" />
          <stop offset="1" stopColor={warm ? "#fde3c4" : "#cfe0f7"} stopOpacity={warm ? ".75" : ".9"} />
        </linearGradient>
        <linearGradient id={`kx-wave-b-${tone}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={warm ? "#fff8f0" : "#e6eefa"} stopOpacity="0" />
          <stop offset="1" stopColor={warm ? "#fcebd6" : "#dde9f8"} stopOpacity=".8" />
        </linearGradient>
      </defs>
      <path d="M560 160 C700 70 820 150 930 90 C1030 35 1110 60 1200 20 L1200 160 Z" fill={`url(#kx-wave-a-${tone})`} />
      <path d="M760 160 C860 110 960 160 1050 118 C1120 86 1160 110 1200 92 L1200 160 Z" fill={`url(#kx-wave-b-${tone})`} />
      {warm && <path d="M880 0 C940 30 1000 10 1060 40 C1110 64 1160 40 1200 50 L1200 0 Z" fill={`url(#kx-wave-b-${tone})`} opacity=".7" />}
    </svg>
  );
}

/** Clipboard with ticked checklist, graduation cap and pencil. */
export function AssessmentArt() {
  return (
    <svg viewBox="0 0 250 130" {...svgProps}>
      <path d="M40 130 C60 70 110 60 150 90 L150 130 Z" fill="#f6a043" opacity=".85" />
      <path d="M20 130 C40 100 80 96 104 112 L104 130 Z" fill="#fbc27c" opacity=".7" />
      <g transform="rotate(-10 140 70)">
        <rect x="86" y="18" width="104" height="124" rx="10" fill="#ffffff" stroke="#d6e2f2" strokeWidth="2" />
        <rect x="116" y="10" width="44" height="16" rx="5" fill="#1f3f68" />
        {[44, 70, 96].map((y) => (
          <g key={y}>
            <rect x="100" y={y} width="16" height="16" rx="3.5" fill="#e8f1ff" stroke="#2f6fe4" strokeWidth="2" />
            <path d={`M103.5 ${y + 8.5} l3.8 3.8 l6.2-7.4`} fill="none" stroke="#12a26a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="124" y={y + 3} width="52" height="4" rx="2" fill="#bcd2f1" />
            <rect x="124" y={y + 10} width="36" height="4" rx="2" fill="#dbe7f8" />
          </g>
        ))}
      </g>
      <g transform="translate(166 4)">
        <path d="M0 22 L34 8 L68 22 L34 36 Z" fill="#1f3f68" />
        <path d="M14 28 L14 42 C14 48 54 48 54 42 L54 28 L34 36 Z" fill="#284f80" />
        <path d="M60 25 L60 46" stroke="#f28a1e" strokeWidth="2.5" />
        <circle cx="60" cy="48" r="3.5" fill="#f28a1e" />
      </g>
      <g transform="rotate(38 212 98)">
        <rect x="204" y="44" width="14" height="74" rx="3" fill="#f28a1e" />
        <rect x="204" y="44" width="14" height="10" rx="2" fill="#1f3f68" />
        <path d="M204 118 L211 134 L218 118 Z" fill="#fde2bf" />
        <path d="M209 129 L211 134 L213 129 Z" fill="#1f3f68" />
      </g>
    </svg>
  );
}

/** Payroll sheet with a calculator and coin stacks. */
export function PayrollArt() {
  return (
    <svg viewBox="0 0 250 130" {...svgProps}>
      <path d="M0 130 C30 88 70 80 108 104 C130 118 150 110 170 96 L170 130 Z" fill="#bcd4f4" opacity=".75" />
      <g transform="rotate(-8 110 70)">
        <rect x="62" y="6" width="96" height="120" rx="8" fill="#ffffff" stroke="#d6e2f2" strokeWidth="2" />
        <text x="110" y="30" textAnchor="middle" fontSize="15" fontWeight="800" fill="#1f3f68" fontFamily="Inter, sans-serif">PAYROLL</text>
        {[44, 66, 88].map((y) => (
          <g key={y}>
            <rect x="74" y={y} width="14" height="14" rx="3" fill="#ffffff" stroke="#9fb6d6" strokeWidth="1.6" />
            <path d={`M77 ${y + 7.5} l3 3 l5.5-6.5`} fill="none" stroke="#12a26a" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="96" y={y + 3} width="48" height="3.5" rx="1.75" fill="#bcd2f1" />
            <rect x="96" y={y + 9} width="32" height="3.5" rx="1.75" fill="#dbe7f8" />
          </g>
        ))}
      </g>
      <g transform="translate(140 40)">
        <rect x="0" y="0" width="58" height="84" rx="9" fill="#274c7b" />
        <rect x="8" y="9" width="42" height="16" rx="3" fill="#cfe2fb" />
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <rect key={`${row}-${col}`} x={9 + col * 14} y={33 + row * 15} width="10" height="10" rx="2.5" fill={row === 2 && col === 2 ? "#f28a1e" : "#9cc0ef"} />
          )),
        )}
      </g>
      <g>
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx="224" cy={118 - i * 8} rx="18" ry="6.5" fill={i % 2 ? "#f6b54a" : "#f0a22c"} stroke="#d9861a" strokeWidth="1.2" />
        ))}
        {[0, 1].map((i) => (
          <ellipse key={`s${i}`} cx="120" cy={122 - i * 8} rx="15" ry="5.5" fill={i % 2 ? "#f6b54a" : "#f0a22c"} stroke="#d9861a" strokeWidth="1.2" />
        ))}
      </g>
    </svg>
  );
}

/** Rising bar chart with a growth arrow and a rupee coin. */
export function RevenueArt() {
  return (
    <svg viewBox="0 0 250 130" {...svgProps}>
      <path d="M0 130 C40 96 92 96 132 112 C172 128 206 104 250 100 L250 130 Z" fill="#c7dbf6" opacity=".8" />
      <circle cx="64" cy="92" r="32" fill="#fde7c7" />
      <circle cx="64" cy="92" r="25" fill="#f6a043" />
      <circle cx="64" cy="92" r="19" fill="none" stroke="#fde2bf" strokeWidth="2" />
      <text x="64" y="102" textAnchor="middle" fontSize="28" fontWeight="800" fill="#ffffff" fontFamily="Inter, sans-serif">₹</text>
      {[
        [110, 84, "#8fb5ee"],
        [134, 66, "#5c8fe0"],
        [158, 48, "#2f6fe4"],
        [182, 30, "#1f4fa8"],
      ].map(([x, y, fill]) => (
        <rect key={x} x={x} y={y} width="18" height={126 - y} rx="3" fill={fill} />
      ))}
      <path d="M102 76 C130 60 150 52 176 28" fill="none" stroke="#f28a1e" strokeWidth="6" strokeLinecap="round" />
      <path d="M166 22 L190 14 L184 38 Z" fill="#f28a1e" />
      <circle cx="222" cy="58" r="7" fill="none" stroke="#f6a043" strokeWidth="3" />
    </svg>
  );
}

/** Invoice sheet with rupee coin, stacked books and a graduation cap. */
export function InvoiceArt() {
  return (
    <svg viewBox="0 0 250 130" {...svgProps}>
      <path d="M0 130 C36 96 76 92 110 110 L110 130 Z" fill="#fbc27c" opacity=".8" />
      <circle cx="30" cy="34" r="6" fill="#dbe8fa" />
      <g transform="rotate(-6 110 64)">
        <rect x="58" y="6" width="104" height="124" rx="9" fill="#ffffff" stroke="#d6e2f2" strokeWidth="2" />
        <text x="110" y="30" textAnchor="middle" fontSize="15" fontWeight="800" fill="#1f3f68" fontFamily="Inter, sans-serif">INVOICE</text>
        {[44, 58, 72, 86].map((y, index) => (
          <rect key={y} x="72" y={y} width={index % 2 ? 54 : 74} height="6" rx="3" fill="#bcd2f1" />
        ))}
      </g>
      <g transform="translate(150 60)">
        <rect x="6" y="46" width="88" height="16" rx="3" fill="#1f3f68" />
        <rect x="10" y="30" width="80" height="16" rx="3" fill="#2f6fe4" />
        <rect x="14" y="36" width="72" height="3" rx="1.5" fill="#cfe0fb" />
        <path d="M18 14 L52 0 L86 14 L52 28 Z" fill="#1f3f68" />
        <path d="M32 20 L32 30 C32 34 72 34 72 30 L72 20 L52 28 Z" fill="#284f80" />
        <path d="M80 17 L80 34" stroke="#f28a1e" strokeWidth="2.4" />
      </g>
      <circle cx="146" cy="98" r="27" fill="#f6a043" />
      <circle cx="146" cy="98" r="21" fill="none" stroke="#fde2bf" strokeWidth="2" />
      <text x="146" y="108" textAnchor="middle" fontSize="28" fontWeight="800" fill="#ffffff" fontFamily="Inter, sans-serif">₹</text>
    </svg>
  );
}
