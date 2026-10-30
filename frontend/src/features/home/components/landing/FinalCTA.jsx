import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { CTA_POINTS } from "../../data/landingContent";
import Reveal from "./Reveal";
import { BTN_ON_DARK_LG, BTN_PRIMARY_LG, CONTAINER, DISPLAY_FONT } from "./landingStyles";

const ART = "/assets/StudentBanners/certificatesBanner.webp";

// Closing call to action. "Talk to our team" goes to the contact page, whose
// form submits to the real get-in-touch API.
export default function FinalCTA() {
  return (
    <section aria-labelledby="cta-title" className="bg-[#F6F8FB] py-20 lg:py-24">
      <div className={CONTAINER}>
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] bg-[#133B5D] text-white">
            <img src={ART} alt="" loading="lazy" decoding="async" width="1785" height="640"
              className="absolute inset-0 h-full w-full object-cover opacity-[0.16] mix-blend-luminosity" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#133B5D] via-[#133B5D]/95 to-[#133B5D]/70" />
            <div className="relative grid gap-10 px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-16">
              <div>
                <h2 id="cta-title" className={`${DISPLAY_FONT} text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[2.8rem]`}>
                  Ready to start? <span className="text-[#F7B45C]">Pick your course</span> today.
                </h2>
                <p className="mt-5 max-w-[32rem] text-base leading-7 text-white/75">
                  Browse the catalogue, or tell us about your background and goals and our team will help you choose.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href="#courses" className={`${BTN_PRIMARY_LG} focus-visible:ring-offset-[#133B5D] focus-visible:ring-[#F39924]`}>
                    Explore courses <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </a>
                  <Link to="/contact" className={BTN_ON_DARK_LG}>Talk to our team</Link>
                </div>
              </div>
              <ul className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm sm:p-8">
                {CTA_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-[15px] leading-6">
                    <span aria-hidden="true" className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#F39924] text-[#133B5D]">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
