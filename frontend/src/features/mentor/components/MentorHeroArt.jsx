/* Decorative hero artwork for the mentor module pages. Pure inline SVG so it
   stays crisp at every density and adds no network requests. Every piece is
   aria-hidden — the page title and subtitle carry the meaning. */

const svgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": "true",
  focusable: "false",
  preserveAspectRatio: "xMidYMax meet",
};

/** Profile card with a gear badge (Settings). */
export function SettingsArt() {
  return (
    <svg viewBox="0 0 250 130" {...svgProps}>
      <path d="M20 130 C40 84 88 70 124 96 L124 130 Z" fill="#f6a043" opacity=".85" />
      <path d="M0 130 C22 106 58 100 84 114 L84 130 Z" fill="#fbc27c" opacity=".7" />
      <path d="M150 130 C180 92 220 86 250 70 L250 130 Z" fill="#c9dcf6" opacity=".8" />
      <g transform="rotate(-4 150 64)">
        <rect x="88" y="10" width="124" height="104" rx="12" fill="#ffffff" stroke="#d6e2f2" strokeWidth="2" />
        <circle cx="116" cy="40" r="11" fill="#2f6fe4" />
        <path d="M100 66 C100 54 132 54 132 66 Z" fill="#2f6fe4" />
        <rect x="140" y="30" width="54" height="6" rx="3" fill="#bcd2f1" />
        <rect x="140" y="44" width="38" height="6" rx="3" fill="#dbe7f8" />
        <rect x="102" y="80" width="92" height="6" rx="3" fill="#dbe7f8" />
        <rect x="102" y="94" width="66" height="6" rx="3" fill="#e8f0fb" />
      </g>
      <g transform="translate(206 92)">
        <circle r="30" fill="#2f6fe4" />
        <circle r="30" fill="none" stroke="#ffffff" strokeOpacity=".35" strokeWidth="3" />
        <g fill="#ffffff">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <rect key={angle} x="-4" y="-19" width="8" height="9" rx="2" transform={`rotate(${angle})`} />
          ))}
          <circle r="13" />
        </g>
        <circle r="5.5" fill="#2f6fe4" />
      </g>
    </svg>
  );
}

/** Stacked report sheets with a bar chart (Reports). */
export function ReportsArt() {
  return (
    <svg viewBox="0 0 250 130" {...svgProps}>
      <circle cx="46" cy="104" r="30" fill="#fde7c7" opacity=".9" />
      <path d="M0 130 C40 104 90 104 130 118 L130 130 Z" fill="#fbc27c" opacity=".55" />
      <g transform="rotate(8 190 70)">
        <rect x="150" y="26" width="84" height="100" rx="8" fill="#ffffff" stroke="#d6e2f2" strokeWidth="2" />
        <circle cx="192" cy="62" r="17" fill="#dbe7f8" />
        <path d="M192 62 L192 45 A17 17 0 0 1 208 67 Z" fill="#2f6fe4" />
        <rect x="164" y="90" width="56" height="5" rx="2.5" fill="#bcd2f1" />
        <rect x="164" y="102" width="40" height="5" rx="2.5" fill="#dbe7f8" />
      </g>
      <g transform="rotate(-6 118 66)">
        <rect x="70" y="6" width="100" height="120" rx="9" fill="#ffffff" stroke="#d6e2f2" strokeWidth="2" />
        <rect x="104" y="0" width="34" height="12" rx="4" fill="#1f3f68" />
        <rect x="84" y="24" width="60" height="6" rx="3" fill="#bcd2f1" />
        {[
          [88, 78, "#8fb5ee"],
          [104, 62, "#5c8fe0"],
          [120, 48, "#2f6fe4"],
          [136, 68, "#1f4fa8"],
        ].map(([x, y, fill]) => (
          <rect key={x} x={x} y={y} width="11" height={104 - y} rx="2" fill={fill} />
        ))}
        <rect x="84" y="106" width="68" height="3" rx="1.5" fill="#d6e2f2" />
      </g>
      <circle cx="198" cy="22" r="10" fill="#e8f1ff" stroke="#2f6fe4" strokeWidth="2" />
      <path d="M193.5 22.5 l3.2 3.2 l5.3-6.2" fill="none" stroke="#2f6fe4" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Desk calendar with a clock and a potted plant (Leave requests). */
export function LeaveArt() {
  return (
    <svg viewBox="0 0 250 130" {...svgProps}>
      <path d="M120 130 C150 96 200 92 250 104 L250 130 Z" fill="#c9dcf6" opacity=".7" />
      {/* plant */}
      <g transform="translate(18 40)">
        <path d="M34 50 C18 34 10 18 14 0 C28 14 36 30 34 50 Z" fill="#2ea36b" />
        <path d="M36 52 C44 30 58 18 72 14 C66 32 54 46 36 52 Z" fill="#45c07f" />
        <path d="M32 54 C18 48 6 40 0 26 C16 28 28 38 32 54 Z" fill="#6fd39a" />
        <path d="M18 56 H54 L49 90 H23 Z" fill="#f28a1e" />
        <rect x="15" y="52" width="42" height="9" rx="3" fill="#f6a043" />
      </g>
      {/* calendar */}
      <g transform="translate(92 12)">
        <rect x="0" y="8" width="112" height="104" rx="12" fill="#2f6fe4" />
        <rect x="0" y="30" width="112" height="82" rx="0" fill="#ffffff" />
        <rect x="0" y="100" width="112" height="12" rx="6" fill="#ffffff" />
        <rect x="0.5" y="8.5" width="111" height="103" rx="12" fill="none" stroke="#d6e2f2" />
        {[20, 44, 68, 92].map((x) => (
          <rect key={x} x={x - 3} y="0" width="6" height="18" rx="3" fill="#1f3f68" />
        ))}
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={12 + col * 24}
              y={40 + row * 21}
              width="16"
              height="13"
              rx="3"
              fill={row === 1 && col === 2 ? "#f28a1e" : "#dbe7f8"}
            />
          )),
        )}
      </g>
      {/* clock */}
      <g transform="translate(210 92)">
        <circle r="28" fill="#f28a1e" />
        <circle r="21" fill="#ffffff" />
        <path d="M0 -13 V0 L9 6" fill="none" stroke="#1f3f68" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle r="2.6" fill="#1f3f68" />
      </g>
    </svg>
  );
}

/** Wall calendar with highlighted sessions (Class schedule). */
export function ScheduleArt() {
  return (
    <svg viewBox="0 0 250 130" {...svgProps}>
      <path d="M40 130 C80 100 140 96 190 112 C214 120 232 116 250 110 L250 130 Z" fill="#c9dcf6" opacity=".75" />
      <g transform="translate(70 8) rotate(-3 60 60)">
        <rect x="0" y="10" width="124" height="108" rx="14" fill="#2f6fe4" />
        <rect x="6" y="34" width="112" height="78" rx="8" fill="#ffffff" />
        {[24, 50, 76, 102].map((x) => (
          <g key={x}>
            <rect x={x - 4} y="0" width="8" height="20" rx="4" fill="#1f3f68" />
          </g>
        ))}
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((col) => {
            const orange = (row === 0 && col === 3) || (row === 2 && col === 1);
            return (
              <rect
                key={`${row}-${col}`}
                x={16 + col * 25}
                y={44 + row * 22}
                width="18"
                height="14"
                rx="3.5"
                fill={orange ? "#f6a043" : row === 1 && col === 0 ? "#fde7c7" : "#dbe7f8"}
              />
            );
          }),
        )}
      </g>
      <circle cx="44" cy="46" r="7" fill="#dbe8fa" />
      <circle cx="220" cy="36" r="5" fill="#fde2bf" />
    </svg>
  );
}

/** Graduation cap resting on a stack of books (Courses, Batches, Students). */
export function GraduationArt() {
  return (
    <svg viewBox="0 0 250 130" {...svgProps}>
      <path d="M60 130 C100 108 160 104 214 118 L214 130 Z" fill="#c9dcf6" opacity=".7" />
      <g transform="translate(78 54)">
        <rect x="0" y="52" width="120" height="20" rx="5" fill="#1f4fa8" />
        <rect x="6" y="56" width="104" height="4" rx="2" fill="#cfe0fb" />
        <rect x="10" y="32" width="108" height="20" rx="5" fill="#2f6fe4" />
        <rect x="16" y="36" width="96" height="4" rx="2" fill="#e3edfd" />
        <rect x="4" y="14" width="104" height="18" rx="5" fill="#5c8fe0" />
        <rect x="10" y="18" width="90" height="3.5" rx="1.75" fill="#eef4fe" />
        <rect x="104" y="14" width="10" height="18" rx="3" fill="#ffffff" opacity=".85" />
      </g>
      <g transform="translate(94 4)">
        <path d="M0 26 L48 6 L96 26 L48 46 Z" fill="#1f3f68" />
        <path d="M20 34 L20 50 C20 60 76 60 76 50 L76 34 L48 46 Z" fill="#284f80" />
        <path d="M88 29 L88 58" stroke="#f28a1e" strokeWidth="3" strokeLinecap="round" />
        <path d="M82 58 L94 58 L91 72 L85 72 Z" fill="#f28a1e" />
      </g>
    </svg>
  );
}

/** House with a person working on a laptop (Work-from-home leave). */
export function WorkFromHomeArt() {
  return (
    <svg viewBox="0 0 250 130" {...svgProps}>
      <path d="M40 130 C80 104 150 100 220 118 L220 130 Z" fill="#c9dcf6" opacity=".75" />
      <g transform="translate(40 56)">
        <path d="M30 70 C18 50 16 30 24 12 C34 30 36 50 30 70 Z" fill="#2ea36b" />
        <path d="M32 70 C40 50 52 40 64 36 C58 54 48 64 32 70 Z" fill="#6fd39a" />
        <path d="M18 60 H46 L42 74 H22 Z" fill="#f28a1e" />
      </g>
      <g transform="translate(92 14)">
        <path d="M0 50 L58 8 L116 50" fill="none" stroke="#2f6fe4" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="46" width="88" height="70" rx="6" fill="#ffffff" stroke="#d6e2f2" strokeWidth="2" />
        <circle cx="58" cy="66" r="10" fill="#f6c9a0" />
        <path d="M48 64 C48 52 68 52 68 62 C62 58 54 58 48 64 Z" fill="#1f3f68" />
        <path d="M40 98 C40 84 76 84 76 98 Z" fill="#2f6fe4" />
        <rect x="36" y="94" width="44" height="18" rx="3" fill="#1f3f68" />
        <circle cx="58" cy="103" r="2.4" fill="#9cc0ef" />
        <g transform="translate(118 2)" fill="none" stroke="#2f6fe4" strokeWidth="3" strokeLinecap="round">
          <path d="M0 16 C8 8 20 8 28 16" /><path d="M6 22 C10 18 18 18 22 22" /><circle cx="14" cy="27" r="1.8" fill="#2f6fe4" />
        </g>
      </g>
    </svg>
  );
}

/** Results board with bars and a success check (Assessment results). */
export function ResultsArt() {
  return (
    <svg viewBox="0 0 250 130" {...svgProps}>
      <path d="M0 130 C50 96 120 92 180 110 C210 118 232 112 250 108 L250 130 Z" fill="#dbe8fa" opacity=".9" />
      <g transform="translate(96 6)">
        <rect x="0" y="0" width="72" height="124" rx="12" fill="#2f6fe4" />
        <rect x="10" y="12" width="36" height="8" rx="4" fill="#9cc0ef" />
        <rect x="10" y="26" width="52" height="6" rx="3" fill="#5c8fe0" />
        <rect x="12" y="82" width="11" height="34" rx="2" fill="#f6b54a" />
        <rect x="30" y="64" width="11" height="52" rx="2" fill="#ffffff" />
        <rect x="48" y="48" width="11" height="68" rx="2" fill="#cfe0fb" />
      </g>
      <circle cx="190" cy="58" r="24" fill="#13a36b" />
      <path d="M179 58 l8 8 l15-17" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M220 22 l3 7 l7 3 l-7 3 l-3 7 l-3-7 l-7-3 l7-3 Z" fill="#f6b54a" />
      <path d="M78 36 l2 5 l5 2 l-5 2 l-2 5 l-2-5 l-5-2 l5-2 Z" fill="#fbc27c" />
    </svg>
  );
}

/** Mentor at a laptop with chat bubbles (Messages). */
export function MessagesArt() {
  return (
    <svg viewBox="0 0 250 130" {...svgProps}>
      <g transform="translate(20 40)">
        <rect x="0" y="10" width="46" height="30" rx="8" fill="#2f6fe4" />
        <rect x="8" y="19" width="30" height="4" rx="2" fill="#cfe0fb" />
        <rect x="8" y="27" width="20" height="4" rx="2" fill="#cfe0fb" />
        <path d="M10 40 L6 50 L20 40 Z" fill="#2f6fe4" />
      </g>
      <g transform="translate(60 6)">
        <rect x="0" y="0" width="54" height="32" rx="8" fill="#ffffff" stroke="#d6e2f2" strokeWidth="2" />
        <rect x="9" y="10" width="36" height="4" rx="2" fill="#2f6fe4" />
        <rect x="9" y="18" width="26" height="4" rx="2" fill="#9cc0ef" />
      </g>
      <g transform="translate(118 12)">
        <circle cx="52" cy="26" r="20" fill="#f6c9a0" />
        <path d="M30 24 C30 2 74 0 74 22 C66 14 42 12 30 24 Z" fill="#1f3f68" />
        <circle cx="45" cy="28" r="6" fill="none" stroke="#1f3f68" strokeWidth="2.4" />
        <circle cx="60" cy="28" r="6" fill="none" stroke="#1f3f68" strokeWidth="2.4" />
        <path d="M14 118 C14 72 90 72 90 118 Z" fill="#f6a043" />
        <path d="M40 60 L52 76 L64 60" fill="none" stroke="#e27410" strokeWidth="3" />
        <rect x="22" y="88" width="62" height="36" rx="4" fill="#4b5f78" />
        <circle cx="53" cy="106" r="3" fill="#cfe0fb" />
      </g>
      <g transform="translate(214 60)">
        <path d="M10 60 C0 40 0 20 8 4 C18 20 20 40 10 60 Z" fill="#45c07f" />
        <path d="M12 60 C18 42 26 32 34 28 C32 44 24 54 12 60 Z" fill="#2ea36b" />
      </g>
    </svg>
  );
}

/** Ringing bell with a notification card (Notifications). */
export function NotificationArt() {
  return (
    <svg viewBox="0 0 250 130" {...svgProps}>
      <path d="M40 130 C90 100 170 96 250 112 L250 130 Z" fill="#dbe8fa" opacity=".9" />
      <g transform="translate(92 14)">
        <path d="M44 8 C18 8 10 30 10 52 L10 76 L0 90 L88 90 L78 76 L78 52 C78 30 70 8 44 8 Z" fill="#f6a043" />
        <path d="M44 8 C30 8 22 22 20 40" fill="none" stroke="#fde2bf" strokeWidth="4" strokeLinecap="round" />
        <circle cx="44" cy="100" r="10" fill="#e27410" />
        <rect x="38" y="0" width="12" height="10" rx="4" fill="#e27410" />
      </g>
      <circle cx="176" cy="24" r="13" fill="#e5484d" />
      <rect x="174" y="15" width="4" height="11" rx="2" fill="#ffffff" />
      <circle cx="176" cy="31" r="2.2" fill="#ffffff" />
      <g transform="translate(160 58)">
        <rect x="0" y="0" width="84" height="56" rx="10" fill="#ffffff" stroke="#d6e2f2" strokeWidth="2" />
        <rect x="12" y="14" width="56" height="6" rx="3" fill="#bcd2f1" />
        <rect x="12" y="26" width="40" height="6" rx="3" fill="#dbe7f8" />
        <rect x="12" y="38" width="48" height="6" rx="3" fill="#dbe7f8" />
      </g>
    </svg>
  );
}

/** Laptop with a code tag and books (Batch workspace). */
export function CodeArt() {
  return (
    <svg viewBox="0 0 250 130" {...svgProps}>
      <g transform="translate(70 10)">
        <rect x="8" y="0" width="120" height="84" rx="8" fill="#2f6fe4" transform="skewX(-6)" />
        <rect x="16" y="8" width="104" height="68" rx="4" fill="#ffffff" transform="skewX(-6)" />
        <path d="M52 30 L38 42 L52 54" fill="none" stroke="#2f6fe4" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M84 30 L98 42 L84 54" fill="none" stroke="#2f6fe4" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M76 24 L62 60" stroke="#2f6fe4" strokeWidth="6" strokeLinecap="round" />
        <path d="M-10 92 L150 92 L140 102 L0 102 Z" fill="#1f4fa8" />
      </g>
      <g transform="translate(196 76)">
        <rect x="0" y="30" width="46" height="14" rx="3" fill="#f28a1e" />
        <rect x="4" y="16" width="42" height="14" rx="3" fill="#2f6fe4" />
        <rect x="0" y="2" width="44" height="14" rx="3" fill="#f6b54a" />
      </g>
    </svg>
  );
}

/** Friendly student character with books (Student workspace hero). */
export function StudentArt() {
  return (
    <svg viewBox="0 0 180 150" {...svgProps}>
      <circle cx="90" cy="96" r="54" fill="#e3edfb" />
      <path d="M36 150 C36 104 144 104 144 150 Z" fill="#2f6fe4" />
      <path d="M70 110 L90 132 L110 110" fill="none" stroke="#1f4fa8" strokeWidth="4" />
      <rect x="38" y="112" width="18" height="38" rx="6" fill="#1f3f68" />
      <rect x="96" y="116" width="44" height="30" rx="4" fill="#f28a1e" transform="rotate(-8 118 130)" />
      <rect x="100" y="120" width="36" height="4" rx="2" fill="#fde2bf" transform="rotate(-8 118 130)" />
      <rect x="80" y="84" width="20" height="18" rx="6" fill="#f2b98d" />
      <ellipse cx="90" cy="62" rx="30" ry="32" fill="#f6c9a0" />
      <path d="M58 58 C54 24 118 18 122 54 C112 40 100 34 86 38 C76 30 64 40 58 58 Z" fill="#6b3f1f" />
      <circle cx="79" cy="64" r="4" fill="#1f3f68" />
      <circle cx="101" cy="64" r="4" fill="#1f3f68" />
      <path d="M80 80 C86 86 94 86 100 80" fill="none" stroke="#b5673a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Reports banner (UI v15): potted plant, a tilted analytics board with bars
    and a rising arrow, and a card with a pie chart. */
export function ReportsBannerArt() {
  return (
    <svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
      <ellipse cx="160" cy="146" rx="140" ry="6" fill="#c9dbf4" opacity=".7" />
      {/* plant */}
      <path d="M40 146 h30 l-4 -26 h-22 z" fill="#ffffff" stroke="#d6e2f2" strokeWidth="2" />
      <path d="M55 120 C44 96 30 92 22 78 C40 80 52 94 55 112 Z" fill="#2fb36b" />
      <path d="M55 120 C60 92 74 84 84 70 C88 92 72 104 57 118 Z" fill="#23a05e" />
      <path d="M55 120 C50 100 52 84 58 70 C64 86 62 104 56 120 Z" fill="#3cc47a" />
      <path d="M55 120 C40 110 28 110 18 104 C34 100 48 106 55 116 Z" fill="#1f8f53" />
      {/* board */}
      <g transform="rotate(-6 150 80)">
        <rect x="92" y="18" width="118" height="122" rx="10" fill="#ffffff" stroke="#d6e2f2" strokeWidth="2" />
        <rect x="92" y="18" width="118" height="18" rx="10" fill="#e8f0fc" />
        <circle cx="104" cy="27" r="3" fill="#f39924" /><circle cx="114" cy="27" r="3" fill="#2f6fe4" /><circle cx="124" cy="27" r="3" fill="#16a974" />
        {[[106, 96, "#8fb5ee"], [124, 80, "#5c8fe0"], [142, 66, "#2f6fe4"], [160, 86, "#1f4fa8"], [178, 58, "#2f6fe4"]].map(([x, y, fill]) => (
          <rect key={x} x={x} y={y} width="12" height={128 - y} rx="2.5" fill={fill} />
        ))}
        <path d="M104 88 L128 74 L150 80 L186 46" fill="none" stroke="#f39924" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M176 44 L188 44 L187 56" fill="none" stroke="#f39924" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* pie card */}
      <g transform="rotate(5 250 90)">
        <rect x="214" y="42" width="72" height="92" rx="10" fill="#ffffff" stroke="#d6e2f2" strokeWidth="2" />
        <circle cx="250" cy="82" r="22" fill="#dbe7f8" />
        <path d="M250 82 L250 60 A22 22 0 1 1 229 88 Z" fill="#2f6fe4" />
        <path d="M250 82 L229 88 A22 22 0 0 1 250 60 Z" fill="#7fb0ff" />
        <rect x="228" y="112" width="44" height="5" rx="2.5" fill="#bcd2f1" />
        <rect x="228" y="122" width="30" height="5" rx="2.5" fill="#dbe7f8" />
      </g>
    </svg>
  );
}

/** Desk calendar with books, clock and leaves (Class Schedule v17 banner). */
export function ClassScheduleArt() {
  return (
    <svg viewBox="0 0 300 160" {...svgProps}>
      <ellipse cx="160" cy="150" rx="130" ry="9" fill="#cfdff5" opacity=".7" />
      {/* leaves */}
      <path d="M38 150 C20 118 26 86 52 66 C58 98 54 126 38 150 Z" fill="#8fd3b0" />
      <path d="M44 150 C44 120 62 98 88 92 C80 120 66 140 44 150 Z" fill="#5fbf8f" />
      <path d="M40 150 C46 124 52 100 60 80" stroke="#3f9e70" strokeWidth="2" fill="none" />
      {/* books */}
      <rect x="54" y="128" width="84" height="12" rx="3" fill="#1d4f91" />
      <rect x="60" y="116" width="76" height="12" rx="3" fill="#f39924" />
      <rect x="56" y="104" width="80" height="12" rx="3" fill="#2f6fe4" />
      <rect x="54" y="140" width="84" height="8" rx="2" fill="#0f2a4a" />
      <path d="M62 108 H130 M64 120 H128 M60 132 H130" stroke="#ffffff" strokeOpacity=".45" strokeWidth="1.5" />
      {/* calendar */}
      <g transform="translate(104 14) rotate(-4 70 60)">
        <rect x="0" y="12" width="140" height="118" rx="14" fill="#ffffff" stroke="#c8d8ef" strokeWidth="2" />
        <path d="M0 26 a14 14 0 0 1 14 -14 H126 a14 14 0 0 1 14 14 V40 H0 Z" fill="#2f6fe4" />
        {[26, 54, 82, 110].map((x) => <rect key={x} x={x - 4} y="2" width="8" height="22" rx="4" fill="#1d3f6e" />)}
        {[0, 1, 2, 3].map((row) => [0, 1, 2, 3, 4].map((col) => {
          const fill = row === 1 && col === 3 ? "#f39924" : row === 2 && col === 1 ? "#f39924" : row === 0 && col === 0 ? "#bfe6cf" : "#e4ecf8";
          return <rect key={`${row}-${col}`} x={12 + col * 25} y={50 + row * 19} width="18" height="13" rx="3" fill={fill} />;
        }))}
      </g>
      {/* clock */}
      <circle cx="238" cy="118" r="24" fill="#ffffff" stroke="#1d4f91" strokeWidth="5" />
      <path d="M238 104 V118 L248 124" stroke="#0f2a4a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="238" cy="118" r="2.5" fill="#f39924" />
      <circle cx="270" cy="30" r="4" fill="#fde2bf" />
      <circle cx="92" cy="40" r="5" fill="#dbe8fa" />
    </svg>
  );
}
