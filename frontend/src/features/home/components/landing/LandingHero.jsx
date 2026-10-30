import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { ROUTES } from "@shared/constants/routeConstants";
import { AntiGravityCanvas } from "@/components/ui/particle-effect-for-hero";
import { HERO_BENEFITS } from "../../data/landingContent";
import { BTN_ON_DARK_LG, BTN_PRIMARY_LG } from "./landingStyles";

const ease = [0.16, 1, 0.3, 1];
const rise = (delay) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, delay, ease } });

// Full-screen hero in Kini logo colours: an edge-to-edge navy band that fills
// the viewport below the fixed 72px navbar, with a cursor-reactive particle
// field behind the centred message, CTAs and benefits.
export default function LandingHero() {
  return (
    <section aria-labelledby="landing-hero-title"
      className="relative flex min-h-[calc(100svh-72px)] overflow-hidden bg-[#133B5D] text-white">
      <AntiGravityCanvas particleColor="#ffffff" accentColor="#FFB51B" glowColor="#F39924" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#F39924]/15 blur-3xl" />

      <div className="relative flex w-full">
        <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-[52rem] flex-col items-center justify-center px-4 py-14 text-center sm:px-10 sm:py-16 lg:py-20">
          <motion.p {...rise(0)}
            className="inline-flex max-w-full items-center rounded-full bg-white/[0.08] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/90 ring-1 ring-white/15 sm:tracking-[0.14em]">
            <span aria-hidden="true" className="mr-2.5 flex shrink-0 border-r border-white/20 pr-2.5">
              <span className="h-2 w-2 rounded-full bg-[#FFB51B]" />
            </span>
            Kini EduHub · Live online tech learning
          </motion.p>

          <motion.h1 {...rise(0.06)} id="landing-hero-title"
            className="mt-6 text-balance text-[2.25rem] font-bold leading-[1.1] tracking-[-0.03em] text-white sm:text-[3.25rem] sm:leading-[1.08] xl:text-[4rem]">
            Build job-ready tech skills with{" "}
            <span className="text-[#FFB51B] underline decoration-[#F45B22] decoration-[3px] underline-offset-[8px]">live classes</span>{" "}
            and real practice.
          </motion.h1>

          <motion.p {...rise(0.12)} className="mx-auto mt-6 max-w-[38rem] text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
            Pick a course and review its modules, join scheduled live sessions with your batch, then keep practising
            with assignments, practice tests and interview guides.
          </motion.p>

          <motion.div {...rise(0.18)} className="mt-8 flex w-full flex-col justify-center gap-3 min-[430px]:w-auto min-[430px]:flex-row">
            <Link to={ROUTES.PUBLIC.COURSES}
              className={`group ${BTN_PRIMARY_LG} focus-visible:ring-[#FFB51B] focus-visible:ring-offset-[#133B5D]`}>
              Explore Courses
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </Link>
            <Link to={ROUTES.PUBLIC.CONTACT} className={BTN_ON_DARK_LG}>Talk to Our Team</Link>
          </motion.div>

          <motion.ul {...rise(0.24)} aria-label="What you get with Kini EduHub"
            className="mt-9 flex max-w-[44rem] flex-wrap justify-center gap-x-6 gap-y-3">
            {HERO_BENEFITS.map((label) => (
              <li key={label} className="flex items-start gap-2.5 text-left text-sm font-medium leading-6 text-white/90">
                <span aria-hidden="true" className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#FFB51B] text-[#133B5D]">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {label}
              </li>
            ))}
          </motion.ul>

          <motion.p {...rise(0.3)} className="mt-8 border-t border-white/10 pt-5 text-sm text-white/65">
            Already a student?{" "}
            <Link to={ROUTES.AUTH.LOGIN}
              className="rounded font-semibold text-white underline decoration-[#FFB51B] decoration-2 underline-offset-4 hover:text-[#FFB51B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB51B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#133B5D]">
              Sign in to your portal
            </Link>
          </motion.p>
        </div>
      </div>
    </section>
  );
}
