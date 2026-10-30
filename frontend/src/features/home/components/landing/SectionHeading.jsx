import { DISPLAY_FONT } from "./landingStyles";

// Eyebrow + heading + optional intro used at the top of each landing section.
export default function SectionHeading({ id, eyebrow, title, intro, align = "left", tone = "light", children }) {
  const centered = align === "center";
  const dark = tone === "dark";
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${centered ? "md:flex-col md:items-center text-center" : ""}`}>
      <div className={centered ? "mx-auto max-w-[42rem]" : "max-w-[42rem]"}>
        {eyebrow && (
          <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#F7B45C]" : "text-[#9A5A06]"}`}>
            {eyebrow}
          </p>
        )}
        <h2 id={id} className={`${DISPLAY_FONT} mt-3 text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] sm:text-4xl ${dark ? "text-white" : "text-[#133B5D]"}`}>
          {title}
        </h2>
        {intro && <p className={`mt-4 text-base leading-7 ${dark ? "text-white/75" : "text-[#5f7180]"}`}>{intro}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
