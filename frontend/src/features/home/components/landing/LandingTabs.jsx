import { useRef } from "react";
import { FOCUS_RING } from "./landingStyles";

// WAI-ARIA tablist with roving tabindex and arrow/Home/End keys. The caller
// renders the matching panel with id `${idBase}-panel-${tab.id}`.
export default function LandingTabs({ tabs, active, onChange, idBase, label, orientation = "horizontal", tone = "light", className = "" }) {
  const refs = useRef({});
  const vertical = orientation === "vertical";

  const focusTab = (index) => {
    const tab = tabs[(index + tabs.length) % tabs.length];
    onChange(tab.id);
    refs.current[tab.id]?.focus();
  };
  // Both arrow pairs work because some lists stack vertically on wide screens.
  const onKeyDown = (event, index) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") focusTab(index + 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") focusTab(index - 1);
    else if (event.key === "Home") focusTab(0);
    else if (event.key === "End") focusTab(tabs.length - 1);
    else return;
    event.preventDefault();
  };

  const dark = tone === "dark";
  return (
    <div role="tablist" aria-label={label} aria-orientation={orientation} className={className}>
      {tabs.map((tab, index) => {
        const selected = tab.id === active;
        const Icon = tab.icon;
        return (
          <button key={tab.id} ref={(node) => { refs.current[tab.id] = node; }} type="button" role="tab"
            id={`${idBase}-tab-${tab.id}`} aria-selected={selected} aria-controls={`${idBase}-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1} onClick={() => onChange(tab.id)} onKeyDown={(event) => onKeyDown(event, index)}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors ${FOCUS_RING} ${
              vertical ? "w-full justify-start text-left" : ""
            } ${
              selected
                ? dark ? "bg-white text-[#133B5D]" : "bg-[#133B5D] text-white"
                : dark ? "text-white/75 hover:bg-white/10 hover:text-white" : "text-[#17324a] hover:bg-[#133B5D]/[0.06]"
            }`}>
            {Icon && <Icon aria-hidden="true" className={`h-4 w-4 ${selected ? "text-[#F39924]" : ""}`} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
