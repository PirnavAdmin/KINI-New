import { memo, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

const TABS = [
  { id: "video", label: "Video" },
  { id: "overview", label: "Overview" },
  { id: "resources", label: "Resources" },
  { id: "discussion", label: "Discussion" },
  { id: "quiz", label: "Quiz" },
  { id: "certificate", label: "Certificate" },
];

const CourseTabs = memo(function CourseTabs({ activeTab, onTabChange }) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef({});

  useEffect(() => {
    const el = tabsRef.current[activeTab];
    if (el) {
      setIndicatorStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div className="relative border-b border-[#1F2937]">
      <div className="flex overflow-x-auto scrollbar-none gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => (tabsRef.current[tab.id] = el)}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer ${
              activeTab === tab.id
                ? "text-white"
                : "text-[#6B7280] hover:text-[#9CA3AF]"
            }`}
            aria-label={`${tab.label} tab`}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Animated underline */}
      <motion.div
        className="absolute bottom-0 h-0.5 bg-[#0f55f7] rounded-full"
        animate={indicatorStyle}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  );
});

export default CourseTabs;
export { TABS };

