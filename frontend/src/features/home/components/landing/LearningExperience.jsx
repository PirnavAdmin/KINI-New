import { EXPERIENCE_ART, EXPERIENCE_POINTS } from "../../data/landingContent";
import Reveal from "./Reveal";
import { CONTAINER, DISPLAY_FONT, EYEBROW_DARK } from "./landingStyles";

const ASSESSMENT_ART = "/assets/StudentBanners/assessmentsBanner.webp";

// Dark split section: the batch illustration on the left, how learning works
// on Kini on the right.
export default function LearningExperience() {
  return (
    <section aria-labelledby="experience-title" className="relative overflow-hidden bg-[#0E2D47] py-20 text-white lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_15%_40%,rgba(243,153,36,0.14),transparent_70%)]" />
      <div className={`${CONTAINER} relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20`}>
        <Reveal className="order-2 sm:pb-24 lg:order-1">
          <div className="relative">
            <div className="rounded-[32px] bg-white p-4 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] sm:p-6">
              <div className="mb-3 flex flex-wrap gap-2">
                {["Batch schedule", "Live classes", "Assignments"].map((chip) => (
                  <span key={chip} className="rounded-full bg-[#133B5D]/[0.06] px-3 py-1 text-xs font-semibold text-[#133B5D]">{chip}</span>
                ))}
              </div>
              <img src={EXPERIENCE_ART} alt="A Kini student at a desk with a My Batch calendar and a board listing live classes, assignments, mentor support and progress tracking"
                loading="lazy" decoding="async" width="1630" height="640" className="w-full rounded-2xl" />
            </div>
            <figure className="relative mt-5 overflow-hidden rounded-3xl border-[6px] border-[#0E2D47] bg-white shadow-[0_30px_60px_-25px_rgba(0,0,0,0.7)] sm:absolute sm:-bottom-24 sm:right-8 sm:mt-0 sm:w-[58%]">
              <img src={ASSESSMENT_ART} alt="A Kini student completing an assessment checklist on a laptop"
                loading="lazy" decoding="async" width="1707" height="640" className="aspect-[16/10] w-full object-cover object-[55%_50%]" />
              <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0E2D47] to-transparent px-4 pb-3 pt-8 text-xs font-semibold text-white">
                Assessments linked to your course
              </figcaption>
            </figure>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <p className={EYEBROW_DARK}>The Kini learning experience</p>
          <h2 id="experience-title" className={`${DISPLAY_FONT} mt-4 text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[2.6rem]`}>
            Structured, live and accountable, from the first class to the last.
          </h2>
          <ul className="mt-10 space-y-7">
            {EXPERIENCE_POINTS.map(({ icon: Icon, title, body }, index) => (
              <li key={title}>
                <Reveal delay={index * 0.06} className="flex gap-5">
                  <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/[0.06] text-[#F7B45C]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold">{title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-white/70">{body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
