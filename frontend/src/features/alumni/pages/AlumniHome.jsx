import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { MotionConfig, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import "@fontsource/sora/600.css";

import Navbar from "@shared/components/Navbar";
import SectionHeading from "@features/home/components/landing/SectionHeading";
import Reveal from "@features/home/components/landing/Reveal";
import {
  ACCENT_TEXT,
  BTN_ON_DARK_LG,
  BTN_PRIMARY_LG,
  BTN_SECONDARY_LG,
  CONTAINER,
  DISPLAY_FONT,
  EYEBROW_DARK,
  FOCUS_RING,
} from "@features/home/components/landing/landingStyles";
import {
  ALUMNI_AREAS,
  ALUMNI_HERO_ART,
  ALUMNI_HERO_POINTS,
  ALUMNI_JOURNEY,
  MENTOR_ART,
  MENTOR_POINTS,
} from "../constants/alumniPageContent";

const CareerTools = lazy(() => import("@features/home/components/landing/CareerTools"));
const Footer = lazy(() => import("@shared/components/Footer"));

const ease = [0.16, 1, 0.3, 1];
const rise = (delay) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease } });

function AlumniHero() {
  return (
    <section aria-labelledby="alumni-hero-title" className="relative overflow-hidden bg-[#F6F8FB]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(#133B5D14_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className={`${CONTAINER} relative grid items-center gap-12 pb-20 pt-12 sm:pt-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:py-20`}>
        <div>
          <motion.p {...rise(0)} className="inline-flex items-center gap-2 rounded-full border border-[#133B5D]/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#133B5D] shadow-sm">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#F39924]" />
            Kini EduHub alumni
          </motion.p>
          <motion.h1 {...rise(0.06)} id="alumni-hero-title"
            className={`${DISPLAY_FONT} mt-6 text-[2.4rem] font-semibold leading-[1.06] tracking-[-0.035em] text-[#133B5D] sm:text-[3.2rem] xl:text-[3.6rem]`}>
            Your Kini journey continues <span className={ACCENT_TEXT}>after the certificate</span>.
          </motion.h1>
          <motion.p {...rise(0.12)} className="mt-7 max-w-[34rem] text-base leading-7 text-[#4f6272] sm:text-lg sm:leading-8">
            The alumni area is where people who learned on Kini stay connected: find each other, join events,
            ask for guidance and share opportunities.
          </motion.p>
          <motion.div {...rise(0.18)} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#alumni-areas" className={BTN_PRIMARY_LG}>Explore the alumni areas <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
            <Link to="/contact" className={BTN_SECONDARY_LG}>Talk to our team</Link>
          </motion.div>
          <motion.ul {...rise(0.24)} aria-label="Alumni areas"
            className="mt-10 grid max-w-[36rem] grid-cols-2 gap-3 sm:grid-cols-4">
            {ALUMNI_HERO_POINTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col gap-2 rounded-2xl border border-[#133B5D]/10 bg-white p-3.5 text-sm font-medium text-[#17324a] shadow-[0_10px_30px_-22px_rgba(19,59,93,0.4)]">
                <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-lg bg-[#F39924]/15 text-[#9A5A06]"><Icon className="h-4 w-4" /></span>
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.figure initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease }}
          className="relative mx-auto w-full max-w-[38rem] lg:max-w-none">
          <div aria-hidden="true" className="absolute -bottom-3 -left-2 h-2/3 w-2/3 rounded-[36px] bg-[#133B5D] sm:-bottom-6 sm:-left-6" />
          <div className="relative overflow-hidden rounded-[32px] shadow-[0_40px_80px_-40px_rgba(14,45,71,0.7)]">
            <img src={ALUMNI_HERO_ART} alt="A Kini student at a laptop holding up a certificate of completion, beside books labelled Learn, Practice and Grow"
              width="1785" height="640" fetchPriority="high" decoding="async"
              className="aspect-[1/1] w-full object-cover object-[38%_50%] sm:aspect-[4/3] lg:aspect-[1.05/1]" />
          </div>
          <motion.div {...rise(0.4)} className="absolute -right-2 bottom-8 hidden items-center gap-3 rounded-2xl bg-white p-3.5 pr-5 shadow-[0_18px_40px_-18px_rgba(14,45,71,0.45)] ring-1 ring-[#133B5D]/[0.06] sm:flex lg:-right-8">
            <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-xl bg-[#F39924]/15 text-[#9A5A06]"><ArrowUpRight className="h-5 w-5" /></span>
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f7180]">After your course</span>
              <span className="block text-sm font-semibold text-[#133B5D]">Stay part of the community</span>
            </span>
          </motion.div>
        </motion.figure>
      </div>
    </section>
  );
}

function AlumniAreas() {
  const [primary, ...rest] = ALUMNI_AREAS;
  return (
    <section id="alumni-areas" aria-labelledby="areas-title" className="scroll-mt-24 bg-white py-20 lg:py-28">
      <div className={CONTAINER}>
        <SectionHeading id="areas-title" eyebrow="The alumni network" title="Four ways to stay connected"
          intro="Each area has its own page. Pick where you want to start." />
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <li className="md:col-span-2 lg:row-span-2">
            <Reveal className="h-full">
              <Link to={primary.to} className={`group flex h-full flex-col justify-between overflow-hidden rounded-[32px] bg-[#133B5D] p-8 text-white ${FOCUS_RING}`}>
                <div>
                  <span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-2xl bg-[#F39924] text-[#133B5D]"><primary.icon className="h-6 w-6" /></span>
                  <h3 className={`${DISPLAY_FONT} mt-8 text-[1.75rem] font-semibold leading-tight sm:text-[2rem]`}>{primary.title}</h3>
                  <p className="mt-3 max-w-[26rem] text-[15px] leading-7 text-white/75">{primary.body}</p>
                </div>
                <img src="/assets/MentorsBnners/web/mentor-students.webp" alt="" loading="lazy" decoding="async" width="1500" height="500"
                  className="mt-8 w-full rounded-2xl bg-white object-contain p-3" />
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#F7B45C]">
                  {primary.cta} <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </span>
              </Link>
            </Reveal>
          </li>
          {rest.map(({ icon: Icon, title, body, to, cta }, index) => (
            <li key={title} className={index === 2 ? "md:col-span-2" : ""}>
              <Reveal delay={0.06 * (index + 1)} className="h-full">
                <Link to={to} className={`group flex h-full flex-col rounded-[28px] border border-[#133B5D]/10 bg-[#F6F8FB] p-7 transition-colors hover:border-[#133B5D]/25 hover:bg-white ${FOCUS_RING}`}>
                  <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-2xl bg-[#133B5D] text-white transition-colors group-hover:bg-[#F39924] group-hover:text-[#133B5D]"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-6 text-lg font-semibold text-[#133B5D]">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[#5f7180]">{body}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#133B5D]">
                    {cta} <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-[#9A5A06] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function GiveBack() {
  return (
    <section aria-labelledby="giveback-title" className="relative overflow-hidden bg-[#0E2D47] py-20 text-white lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_85%_30%,rgba(243,153,36,0.14),transparent_70%)]" />
      <div className={`${CONTAINER} relative grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20`}>
        <div>
          <p className={EYEBROW_DARK}>Give back</p>
          <h2 id="giveback-title" className={`${DISPLAY_FONT} mt-4 text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[2.6rem]`}>
            Help the next batch the way others helped you.
          </h2>
          <p className="mt-5 max-w-[32rem] text-base leading-7 text-white/75">
            If you would like to mentor current learners, tell us about your experience and our team will get in touch.
          </p>
          <ul className="mt-8 space-y-4">
            {MENTOR_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-[15px] leading-6">
                <span aria-hidden="true" className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#F39924] text-[#133B5D]"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/contact" className={`${BTN_PRIMARY_LG} focus-visible:ring-[#F39924] focus-visible:ring-offset-[#0E2D47]`}>Offer to mentor <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
            <Link to="/alumni/mentorship" className={BTN_ON_DARK_LG}>About mentorship</Link>
          </div>
        </div>
        <Reveal>
          <div className="rounded-[32px] bg-white p-4 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] sm:p-6">
            <img src={MENTOR_ART} alt="A Kini mentor guiding three students at a desk, with panels for live mentoring and learning progress"
              loading="lazy" decoding="async" width="1500" height="533" className="w-full rounded-2xl" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AlumniJourney() {
  return (
    <section aria-labelledby="alumni-journey-title" className="bg-[#F6F8FB] py-20 lg:py-28">
      <div className={CONTAINER}>
        <SectionHeading id="alumni-journey-title" align="center" eyebrow="From learner to alumni" title="What happens after your course" />
        <ol className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <span aria-hidden="true" className="absolute left-[12%] right-[12%] top-7 hidden h-px bg-[#133B5D]/15 lg:block" />
          {ALUMNI_JOURNEY.map(({ icon: Icon, title, body }, index) => (
            <li key={title} className="relative">
              <Reveal delay={index * 0.08} className="flex h-full flex-col items-center rounded-3xl border border-[#133B5D]/10 bg-white p-6 text-center lg:border-0 lg:bg-transparent lg:p-0">
                <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full border-4 border-[#F6F8FB] bg-[#133B5D] text-white shadow-[0_10px_24px_-10px_rgba(19,59,93,0.7)]">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-[#F39924] text-[11px] font-bold text-[#133B5D]"><span className="sr-only">Step </span>{index + 1}</span>
                </span>
                <h3 className="mt-5 text-base font-semibold text-[#133B5D]">{title}</h3>
                <p className="mt-2 max-w-[16rem] text-sm leading-6 text-[#5f7180]">{body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function AlumniCTA() {
  return (
    <section aria-labelledby="alumni-cta-title" className="bg-white py-20 lg:py-24">
      <div className={CONTAINER}>
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] bg-[#133B5D] px-6 py-12 text-white sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-16">
            <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[36px] border-[#F39924]/15" />
            <div className="relative max-w-[36rem]">
              <h2 id="alumni-cta-title" className={`${DISPLAY_FONT} text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[2.6rem]`}>
                Not a Kini learner yet?
              </h2>
              <p className="mt-4 text-base leading-7 text-white/75">Start with a course. The alumni network is there when you finish.</p>
            </div>
            <div className="relative mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
              <Link to="/courses" className={`${BTN_PRIMARY_LG} focus-visible:ring-[#F39924] focus-visible:ring-offset-[#133B5D]`}>Browse courses <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
              <Link to="/login" className={BTN_ON_DARK_LG}>Student sign in</Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// Public alumni landing. It describes the alumni areas and links to their
// existing routes; it shows no member counts, names, events or testimonials
// because none are backed by real data yet.
function AlumniHome() {
  return (
    <MotionConfig reducedMotion="user">
      <Navbar />
      <main id="main-content" className="overflow-x-clip bg-white text-[#17324a]">
        <AlumniHero />
        <AlumniAreas />
        <GiveBack />
        <AlumniJourney />
        <Suspense fallback={<div className="min-h-[40vh] bg-[#FBF7F1]" aria-hidden="true" />}>
          <CareerTools />
        </Suspense>
        <AlumniCTA />
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </MotionConfig>
  );
}

export default AlumniHome;
