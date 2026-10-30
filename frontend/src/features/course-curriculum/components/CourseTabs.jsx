import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "curriculum", label: "Curriculum" },
  { id: "mentors", label: "Mentors" },
  { id: "reviews", label: "Reviews" },
  { id: "faq", label: "FAQ" },
];

const tabVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const CourseTabs = ({ children, onTabChange }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSticky, setIsSticky] = useState(false);
  const stickyRef = useRef(null);

  // Track sticky state
  useEffect(() => {
    const handleScroll = () => {
      if (stickyRef.current) {
        const rect = stickyRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTabClick = useCallback((tabId) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  }, [onTabChange]);

  return (
    <>
      {/* Sticky Tabs Nav */}
      <div ref={stickyRef} className="relative z-30">
        <div
          className={`transition-all duration-300 bg-white border-b border-[#E5E7EB] ${
            isSticky ? "shadow-md shadow-[#085FA7]/5" : ""
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav
              className="flex gap-0 -mb-px"
              role="tablist"
              aria-label="Course sections"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`tabpanel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative px-4 sm:px-6 py-3.5 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#085FA7] ${
                    activeTab === tab.id
                      ? "text-[#085FA7]"
                      : "text-slate-500 hover:text-[#085FA7]"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#085FA7] to-[#5CA347]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content — Single AnimatePresence */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 lg:pt-4 pb-6 lg:pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
          >
            {children[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default CourseTabs;
