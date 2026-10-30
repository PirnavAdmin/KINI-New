import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { PLATFORM_ROLES } from "../../data/landingContent";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { CONTAINER, DISPLAY_FONT, FOCUS_RING } from "./landingStyles";

const LINK = `inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold ${FOCUS_RING}`;

// Bento of the three Kini portals: a large institute card and two smaller
// student and mentor cards.
export default function PlatformRoles() {
  const [institutes, ...others] = PLATFORM_ROLES;
  return (
    <section aria-labelledby="roles-title" className="bg-white py-20 lg:py-28">
      <div className={CONTAINER}>
        <SectionHeading id="roles-title" eyebrow="One platform" title="Built for learners, mentors and institutes"
          intro="Kini EduHub runs the whole course, not just the classroom. Each group gets a portal of its own." />

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-3 lg:row-span-2">
            <article className="flex h-full flex-col overflow-hidden rounded-[32px] bg-[#133B5D] text-white">
              <div className="p-7 sm:p-9">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F7B45C]">{institutes.eyebrow}</p>
                <h3 className={`${DISPLAY_FONT} mt-3 text-2xl font-semibold leading-tight sm:text-[1.9rem]`}>{institutes.title}</h3>
                <p className="mt-3 max-w-[34rem] text-[15px] leading-7 text-white/75">{institutes.body}</p>
                <ul className="mt-6 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
                  {institutes.points.map((point) => (
                    <li key={point} className="flex items-center gap-2.5 text-sm font-medium">
                      <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full bg-[#F39924] text-[#133B5D]"><Check className="h-3 w-3" strokeWidth={3} /></span>
                      {point}
                    </li>
                  ))}
                </ul>
                <Link to={institutes.to} className={`${LINK} mt-6 text-[#F7B45C] hover:text-white focus-visible:ring-[#F39924] focus-visible:ring-offset-[#133B5D]`}>
                  {institutes.cta} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
              <div className="relative mx-4 mb-4 min-h-[15rem] flex-1 overflow-hidden rounded-3xl bg-gradient-to-b from-[#EAF0F6] to-white sm:mx-6 sm:mb-6">
                <img src={institutes.image} alt={institutes.alt} loading="lazy" decoding="async" width="1500" height="533"
                  className="absolute inset-0 h-full w-full object-cover object-[50%_100%]" />
              </div>
            </article>
          </Reveal>

          {others.map((role, index) => (
            <Reveal key={role.id} delay={0.08 * (index + 1)} className="lg:col-span-2">
              <article className="group flex h-full flex-col overflow-hidden rounded-[32px] border border-[#133B5D]/10 bg-[#F6F8FB]">
                <div className="p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A5A06]">{role.eyebrow}</p>
                  <h3 className="mt-2 text-lg font-semibold leading-snug text-[#133B5D]">{role.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5f7180]">{role.body}</p>
                  <Link to={role.to} className={`${LINK} mt-3 text-[#133B5D] hover:text-[#0E2D47]`}>
                    {role.cta} <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </Link>
                </div>
                <img src={role.image} alt={role.alt} loading="lazy" decoding="async" width="1500" height="560"
                  className="mt-auto h-40 w-full object-cover object-right sm:h-48" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
