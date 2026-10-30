import { useEffect } from "react";
import "aos/dist/aos.css";

/**
 * Scroll-reveal using AOS's stylesheet and data-aos attributes.
 *
 * AOS.init() only listens to window scrolling. Dashboard pages scroll inside
 * the layout's <main> panel, so AOS would never reveal cards below the first
 * screen (they would stay at opacity 0). This hook adds AOS's `aos-animate`
 * class with an IntersectionObserver instead, which works in any scroll panel.
 *
 * plan: [{ selector, aos, duration = 550, delay = 0, stagger = 0 }]
 *   AOS CSS supports durations and delays in 50ms steps.
 * Elements rendered later (after API data arrives) are picked up too.
 */
export default function useScrollReveal(rootRef, plan) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const step = (value) => String(Math.max(0, Math.round(value / 50) * 50));
    const reveal = (el) => el.classList.add("aos-animate");
    const observer = !reduced && "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            reveal(entry.target);
            observer.unobserve(entry.target); // once: true
          });
        }, { rootMargin: "0px 0px -35px 0px" })
      : null;

    const apply = () => {
      plan.forEach(({ selector, aos, duration = 550, delay = 0, stagger = 0 }) => {
        root.querySelectorAll(selector).forEach((el, index) => {
          if (el.dataset.revealReady) return;
          el.dataset.revealReady = "1";
          el.setAttribute("data-aos", aos);
          el.setAttribute("data-aos-duration", step(duration));
          el.setAttribute("data-aos-easing", "ease-out-cubic");
          el.setAttribute("data-aos-delay", step(Math.min(delay + index * stagger, 300)));
          if (observer) observer.observe(el);
          else reveal(el); // reduced motion / no IO: show immediately
        });
      });
    };
    apply();
    const mutations = new MutationObserver(apply);
    mutations.observe(root, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      observer?.disconnect();
    };
  }, [rootRef, plan]);
}
