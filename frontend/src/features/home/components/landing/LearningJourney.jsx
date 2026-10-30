import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { JOURNEY_STEPS } from "../../data/landingContent";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { BTN_PRIMARY, CONTAINER } from "./landingStyles";

// Connected five-step timeline: horizontal on desktop, vertical rail on mobile.
export default function LearningJourney() {
  return (
    <section aria-labelledby="journey-title" className="bg-white py-20 lg:py-28">
      <div className={CONTAINER}>
        <SectionHeading id="journey-title" eyebrow="Your learning journey" title="From choosing a course to your first interview"
          intro="Five clear steps, all handled inside Kini.">
          <a href="#courses" className={BTN_PRIMARY}>Start with step one <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
        </SectionHeading>

        <ol className="relative mt-14 grid gap-6 lg:grid-cols-5 lg:gap-5">
          <span aria-hidden="true" className="absolute bottom-8 left-[27px] top-8 w-px bg-[#133B5D]/15 lg:hidden" />
          <span aria-hidden="true" className="absolute left-[10%] right-[10%] top-[27px] hidden h-px bg-[#133B5D]/15 lg:block">
            <motion.span initial={{ width: "0%" }} whileInView={{ width: "100%" }} viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.2, ease: "easeInOut" }} className="block h-px bg-[#F39924]" />
          </span>
          {JOURNEY_STEPS.map(({ icon: Icon, title, body }, index) => (
            <li key={title} className="relative">
              <Reveal delay={index * 0.08} className="flex gap-5 lg:flex-col lg:items-center lg:gap-0 lg:text-center">
                <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 border-white bg-[#133B5D] text-white shadow-[0_10px_24px_-10px_rgba(19,59,93,0.7)]">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-[#F39924] text-[11px] font-bold text-[#133B5D]">
                    <span className="sr-only">Step </span>{index + 1}
                  </span>
                </span>
                <div className="flex-1 rounded-2xl border border-[#133B5D]/10 bg-[#F6F8FB] p-5 lg:mt-6 lg:w-full lg:min-h-[168px]">
                  <h3 className="text-base font-semibold text-[#133B5D]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5f7180]">{body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
