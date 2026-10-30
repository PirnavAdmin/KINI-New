// Decorative graduation cap on a stack of books (inline SVG, no external asset).
function HeroIllustration() {
  return (
    <svg aria-hidden="true" viewBox="0 0 124 92" className="h-[86px] w-[116px] drop-shadow-[0_8px_10px_rgba(16,45,80,.18)]">
      <defs>
        <linearGradient id="hero-book-a" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1B6FD1" />
          <stop offset="1" stopColor="#0B4C9E" />
        </linearGradient>
        <linearGradient id="hero-book-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4DA3F5" />
          <stop offset="1" stopColor="#1E7BE0" />
        </linearGradient>
      </defs>
      {/* books */}
      <rect x="10" y="72" width="104" height="14" rx="3.5" fill="url(#hero-book-a)" />
      <rect x="96" y="74.5" width="15" height="9" rx="1.5" fill="#F4F8FE" />
      <rect x="18" y="58" width="92" height="14" rx="3.5" fill="url(#hero-book-b)" />
      <rect x="94" y="60.5" width="14" height="9" rx="1.5" fill="#F4F8FE" />
      <rect x="22" y="61" width="60" height="2.5" rx="1.25" fill="#fff" opacity=".55" />
      {/* graduation cap */}
      <path d="M36 34 v12 c0 7 48 7 48 0 v-12 l-24 11 z" fill="#0B2E5E" />
      <path d="M60 8 L108 27 L60 46 L12 27 Z" fill="#12407D" />
      <path d="M60 8 L108 27 L60 46 Z" fill="#0F3670" />
      <path d="M60 12.5 L98 27 L60 41.5 L22 27 Z" fill="none" stroke="#2E6BB8" strokeWidth="1" opacity=".7" />
      {/* tassel */}
      <path d="M60 27 L104 33 V55" fill="none" stroke="#F39924" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="104" cy="57" r="3.6" fill="#F39924" />
    </svg>
  );
}

// Courses page banner: icon tile, title/subtitle, decorative tagline and
// illustration, and the primary action. The decoration is aria-hidden and
// only rendered where there is room so it never crowds the button.
// `aos(animation, delay)` supplies the page's entrance-animation attributes.
const noAos = () => ({});

export default function CoursesPageHero({ title, subtitle, icon: Icon, action, aos = noAos }) {
  return (
    <div
      {...aos("fade-down", 0)}
      className="relative overflow-hidden rounded-[16px] border border-[#E4ECF6] bg-gradient-to-r from-white via-[#F7FAFF] to-[#EAF3FF] shadow-[0_4px_18px_rgba(38,83,130,.05)] dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(ellipse_at_72%_50%,rgba(243,153,36,.16),rgba(8,119,249,.07)_46%,transparent_72%)] md:block"
      />
      <div className="relative flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-5">
        <div {...aos("fade-right", 100)} className="flex min-w-0 flex-1 items-center gap-3.5 sm:gap-4">
          {Icon && (
            <span
              aria-hidden="true"
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#E4F0FF] text-[#0877F9] ring-1 ring-[#D3E4FB] sm:h-16 sm:w-16 dark:bg-slate-800 dark:text-sky-300 dark:ring-slate-700"
            >
              <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.75} />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] !text-[#102D50] sm:text-[30px] dark:!text-white">
              {title}
            </h1>
            <p className="mt-1 text-sm leading-6 !text-[#5B78A0] sm:text-[15px] dark:!text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>
        <p
          {...aos("fade-left", 150)}
          aria-hidden="true"
          className="pointer-events-none hidden -rotate-6 select-none text-[26px] leading-[1.05] text-[#0877F9]/90 min-[1180px]:block"
          style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: "italic" }}
        >
          Skills Today
          <br />
          <span className="pl-6">Brighter Tomorrow</span>
        </p>
        <div {...aos("fade-left", 150)} className="hidden md:block">
          <HeroIllustration />
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
