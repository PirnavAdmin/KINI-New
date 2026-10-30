import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { PORTAL_TABS } from "../../data/landingContent";
import LandingTabs from "./LandingTabs";
import SectionHeading from "./SectionHeading";
import { CONTAINER, DISPLAY_FONT } from "./landingStyles";

// Tabbed tour of the student portal. Every tab is a screen that exists in the
// student module (class schedule, materials, assessments, progress, certificates).
export default function PortalShowcase() {
  const [active, setActive] = useState(PORTAL_TABS[0].id);
  const idBase = useId();
  const tab = PORTAL_TABS.find((item) => item.id === active) ?? PORTAL_TABS[0];

  return (
    <section aria-labelledby="portal-title" className="bg-[#F6F8FB] py-20 lg:py-28">
      <div className={CONTAINER}>
        <SectionHeading id="portal-title" align="center" eyebrow="Inside the student portal"
          title="Everything you need to learn, in one account"
          intro="Once you enrol, your course runs from the Kini student portal. Here is what you will find there." />

        <div className="mt-10 -mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <LandingTabs tabs={PORTAL_TABS} active={active} onChange={setActive} idBase={idBase} label="Student portal features"
            className="mx-auto flex w-max gap-1 rounded-2xl border border-[#133B5D]/10 bg-white p-1.5 shadow-sm" />
        </div>

        <div id={`${idBase}-panel-${tab.id}`} role="tabpanel" aria-labelledby={`${idBase}-tab-${tab.id}`} tabIndex={0}
          className="mt-8 rounded-[32px] border border-[#133B5D]/10 bg-white p-4 shadow-[0_30px_60px_-40px_rgba(19,59,93,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#133B5D] sm:p-6 lg:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={tab.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }} className="grid items-center gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
              <div className="overflow-hidden rounded-3xl bg-gradient-to-b from-[#EAF0F6] to-[#F6F8FB]">
                <img src={tab.image} alt="" loading="lazy" decoding="async" width="1800" height="640"
                  className={`aspect-[16/9] w-full sm:aspect-[2.2/1] lg:aspect-[1.55/1] ${tab.fit === "contain" ? "object-contain object-bottom px-4 pt-6" : "object-cover"}`} />
              </div>
              <div className="px-2 pb-2 lg:px-0 lg:pb-0">
                <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F39924]/15 text-[#9A5A06]">
                  <tab.icon className="h-5 w-5" />
                </span>
                <h3 className={`${DISPLAY_FONT} mt-5 text-2xl font-semibold leading-tight text-[#133B5D] sm:text-[1.75rem]`}>{tab.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-[#5f7180]">{tab.body}</p>
                <ul className="mt-6 space-y-3">
                  {tab.points.map((point) => (
                    <li key={point} className="flex items-center gap-3 text-sm font-medium text-[#17324a]">
                      <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#133B5D] text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
