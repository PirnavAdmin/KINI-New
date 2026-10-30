import { CAPABILITIES } from "../../data/landingContent";
import { CONTAINER } from "./landingStyles";

// What every course includes, shown where other academies put headline stats.
// It lists platform features only: no unverified counts or partner logos.
export default function CapabilityStrip() {
  return (
    <section aria-label="What every course includes" className="relative z-10 bg-white pb-4">
      <div className={CONTAINER}>
        <ul className="-mt-8 grid grid-cols-1 overflow-hidden rounded-3xl border border-[#133B5D]/10 bg-white shadow-[0_24px_50px_-30px_rgba(19,59,93,0.45)] min-[480px]:grid-cols-2 lg:grid-cols-5">
          {CAPABILITIES.map(({ icon: Icon, title, detail }) => (
            <li key={title} className="flex items-start gap-3.5 border-[#133B5D]/[0.08] p-5 [&:not(:last-child)]:border-b min-[480px]:[&:nth-child(odd)]:border-r lg:border-b-0 lg:[&:not(:last-child)]:border-r lg:[&:last-child]:border-r-0 lg:p-6">
              <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#133B5D] text-white">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-[#133B5D]">{title}</span>
                <span className="mt-0.5 block text-[13px] leading-5 text-[#5f7180]">{detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
