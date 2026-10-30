import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { CAREER_ART, CAREER_TOOLS } from "../../data/landingContent";
import Reveal from "./Reveal";
import { CONTAINER, DISPLAY_FONT, EYEBROW, FOCUS_RING } from "./landingStyles";

// Career preparation: tool list on the left, illustration on the right.
// All three tools are public routes that work without an account.
export default function CareerTools() {
  return (
    <section aria-labelledby="career-title" className="bg-[#FBF7F1] py-20 lg:py-28">
      <div className={`${CONTAINER} grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16`}>
        <div>
          <p className={EYEBROW}>Career preparation</p>
          <h2 id="career-title" className={`${DISPLAY_FONT} mt-4 text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] text-[#133B5D] sm:text-[2.6rem]`}>
            Get ready for interviews with Kini career tools
          </h2>
          <p className="mt-4 max-w-[32rem] text-base leading-7 text-[#5f7180]">
            Open to everyone, enrolled or not. Build your resume and practise before you apply.
          </p>
          <ul className="mt-9 divide-y divide-[#133B5D]/10 border-y border-[#133B5D]/10">
            {CAREER_TOOLS.map(({ icon: Icon, title, body, to, cta }) => (
              <li key={title}>
                <Link to={to} className={`group flex items-center gap-5 rounded-xl py-5 transition-colors hover:bg-white/70 sm:px-3 ${FOCUS_RING}`}>
                  <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#133B5D] text-white transition-colors group-hover:bg-[#F39924] group-hover:text-[#133B5D]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-base font-semibold text-[#133B5D]">{title}</span>
                    <span className="mt-1 block text-sm leading-6 text-[#5f7180]">{body}</span>
                    <span className="sr-only">: {cta}</span>
                  </span>
                  <ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0 text-[#9A5A06] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Reveal>
          <div className="relative">
            <img src={CAREER_ART} alt="A Kini student working on a laptop beside books labelled Learn, Practice and Grow"
              loading="lazy" decoding="async" width="1700" height="640"
              className="aspect-[4/3] w-full rounded-[32px] object-cover object-[40%_50%] shadow-[0_30px_60px_-35px_rgba(19,59,93,0.6)] lg:aspect-[5/4]" />
            <div className="absolute -bottom-5 left-5 right-5 rounded-2xl bg-white p-4 shadow-[0_20px_40px_-20px_rgba(19,59,93,0.5)] sm:left-auto sm:w-72">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9A5A06]">Open to everyone</p>
              <p className="mt-1 text-sm font-semibold text-[#133B5D]">Resume builder, interview guides and practice tests</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
