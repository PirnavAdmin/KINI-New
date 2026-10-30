import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronRight, FiArrowRight, FiStar } from "react-icons/fi";
import { MEGA_DATA, focusRing } from "./constants";
import CourseCard from "./CourseCard";

export default function MegaMenu({ menuKey, isVisible }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const data = MEGA_DATA[menuKey];

  useEffect(() => {
    if (data && isVisible) {
      setActiveCategory((prev) => prev || data.categories[0].id);
    }
  }, [menuKey, isVisible, data]);

  const handleKeyDown = useCallback((e) => {
    if (!data || !isVisible) return;
    const catIndex = data.categories.findIndex((c) => c.id === activeCategory);
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const next = (catIndex + 1) % data.categories.length;
      setActiveCategory(data.categories[next].id);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (catIndex - 1 + data.categories.length) % data.categories.length;
      setActiveCategory(data.categories[prev].id);
    }
  }, [data, isVisible, activeCategory]);

  if (!data) return null;

  const activeCat = data.categories.find((c) => c.id === activeCategory);
  const activeCourses = activeCat?.courses || [];

  return (
    <motion.div
      onKeyDown={handleKeyDown}
      role="menu"
      aria-label={`${menuKey} submenu`}
      initial={{ opacity: 0, y: 10 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`
        w-[calc(100vw-2rem)] lg:w-[860px] xl:w-[920px] 2xl:w-[980px]
        max-w-[calc(100vw-2rem)]
        max-h-[520px]
        bg-white backdrop-blur-xl
        border border-black/5
        shadow-[0_20px_80px_rgba(0,0,0,0.08)]
        rounded-2xl
        overflow-hidden
        ${isVisible ? "pointer-events-auto" : "pointer-events-none"}
      `}
    >
      <div className="flex">
        {/* Category sidebar */}
        <div className="w-[220px] flex-shrink-0 p-5 bg-slate-50/60 border-r border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-400">
            Categories
          </p>
          <div className="space-y-0.5">
            {data.categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onMouseEnter={() => setActiveCategory(cat.id)}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-all duration-300 ${focusRing}
                    ${isActive
                      ? "bg-slate-100 text-slate-900 font-medium"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium"
                    }`}
                >
                  <span className="truncate">{cat.label}</span>
                  {isActive && (
                    <FiChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Featured CTA */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <a
              href="/courses"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 text-slate-500 hover:text-slate-700 hover:bg-slate-50 ${focusRing}`}
            >
              <FiStar className="w-3.5 h-3.5" />
              Browse All
              <FiArrowRight className="w-3 h-3 ml-auto" />
            </a>
          </div>
        </div>

        {/* Course grid */}
        <div className="flex-1 p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {activeCat?.label || "Courses"}
            </p>
            <a
              href="/courses"
              className={`text-xs font-semibold flex items-center gap-1 transition-all duration-300 hover:gap-1.5 text-slate-500 hover:text-slate-700 ${focusRing}`}
            >
              View all <FiChevronRight className="w-3 h-3" />
            </a>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-1"
            >
              {activeCourses.length > 0 ? (
                activeCourses.map((course, i) => (
                  <CourseCard key={i} course={course} />
                ))
              ) : (
                <p className="text-sm py-4 text-center text-slate-400">
                  No courses in this category yet.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          <span className="font-semibold text-slate-700">500+</span> courses · Updated weekly
        </p>
        <a
          href="/courses"
          className="text-xs font-semibold px-4 py-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300"
        >
          Browse All Courses →
        </a>
      </div>
    </motion.div>
  );
}
