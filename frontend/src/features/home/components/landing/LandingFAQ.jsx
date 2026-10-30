import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Plus } from "lucide-react";
import { FAQ_GROUPS } from "../../data/landingContent";
import LandingTabs from "./LandingTabs";
import { CONTAINER, DISPLAY_FONT, EYEBROW, FOCUS_RING } from "./landingStyles";

// Category tabs on the left, a disclosure accordion on the right. Each question
// is a button that controls its answer region.
export default function LandingFAQ() {
  const [group, setGroup] = useState(FAQ_GROUPS[0].id);
  const [open, setOpen] = useState(0);
  const baseId = useId();
  const current = FAQ_GROUPS.find((item) => item.id === group) ?? FAQ_GROUPS[0];
  const selectGroup = (id) => { setGroup(id); setOpen(0); };

  return (
    <section aria-labelledby="faq-title" className="bg-white py-20 lg:py-28">
      <div className={`${CONTAINER} grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16`}>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className={EYEBROW}>FAQ</p>
          <h2 id="faq-title" className={`${DISPLAY_FONT} mt-4 text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] text-[#133B5D] sm:text-[2.6rem]`}>
            Frequently asked questions
          </h2>
          <div className="mt-8 -mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0">
            <LandingTabs tabs={FAQ_GROUPS} active={current.id} onChange={selectGroup} idBase={baseId} label="Question topics"
              orientation="horizontal" className="flex w-max gap-1 lg:w-full lg:flex-col" />
          </div>
          <div className="mt-8 hidden rounded-2xl border border-[#133B5D]/10 bg-[#F6F8FB] p-5 lg:block">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#133B5D]"><Mail aria-hidden="true" className="h-4 w-4 text-[#9A5A06]" /> Still have a question?</p>
            <p className="mt-1 text-sm leading-6 text-[#5f7180]">Send it to our team and we will get back to you.</p>
            <Link to="/contact" className={`mt-3 inline-flex rounded font-semibold text-[#133B5D] underline decoration-[#F39924] decoration-2 underline-offset-4 ${FOCUS_RING}`}>Contact us</Link>
          </div>
        </div>

        <div id={`${baseId}-panel-${current.id}`} role="tabpanel" aria-labelledby={`${baseId}-tab-${current.id}`}
          className="divide-y divide-[#133B5D]/10 self-start rounded-3xl border border-[#133B5D]/10 bg-white shadow-[0_24px_50px_-40px_rgba(19,59,93,0.5)]">
          {current.items.map(({ q, a }, index) => {
            const expanded = open === index;
            const buttonId = `${baseId}-${current.id}-q${index}`;
            const panelId = `${baseId}-${current.id}-a${index}`;
            return (
              <div key={q}>
                <h3>
                  <button id={buttonId} type="button" aria-expanded={expanded} aria-controls={panelId}
                    onClick={() => setOpen(expanded ? -1 : index)}
                    className={`flex w-full items-center justify-between gap-4 rounded-3xl px-6 py-6 text-left text-base font-semibold text-[#133B5D] sm:px-8 ${FOCUS_RING} focus-visible:ring-offset-0`}>
                    {q}
                    <span aria-hidden="true" className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-[transform,background-color] duration-200 motion-reduce:transition-none ${expanded ? "rotate-45 border-[#F39924] bg-[#F39924] text-[#133B5D]" : "border-[#133B5D]/15 text-[#133B5D]"}`}>
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!expanded}
                  className="-mt-2 px-6 pb-6 text-[15px] leading-7 text-[#5f7180] sm:px-8">
                  {a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
