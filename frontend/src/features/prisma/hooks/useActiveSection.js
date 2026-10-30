import { useState, useEffect, useRef } from "react";

const SECTION_IDS = ["hero", "about", "features"];

/**
 * Tracks which section is currently most visible in the viewport
 * using an IntersectionObserver with `threshold: 0.3`.
 *
 * Returns the active section ID (e.g. "hero", "about", "features").
 */
export default function useActiveSection() {
  const [active, setActive] = useState("hero");
  const entriesRef = useRef({});

  useEffect(() => {
    entriesRef.current = {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entriesRef.current[entry.target.id] = entry.intersectionRatio;
        });

        // Pick the section with the highest intersection ratio
        let bestId = active;
        let bestRatio = 0;
        for (const id of SECTION_IDS) {
          const ratio = entriesRef.current[id] ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        setActive(bestId);
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
    );

    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return active;
}
