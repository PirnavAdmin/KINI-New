import { useState, useEffect, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { FiX, FiChevronDown, FiArrowRight } from "react-icons/fi";
import { useThemeContext } from "@shared/context/ThemeContext";
import { NAV_ITEMS, PUBLIC_ROUTES, MEGA_DATA, focusRing } from "./constants";
import ThemeToggle from "./ThemeToggle";
import useFocusTrap from "./useFocusTrap";

const MobileMenuItem = memo(function MobileMenuItem({ item, isDark, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const data = item.hasMega ? MEGA_DATA[item.key] : null;

  useEffect(() => {
    if (isOpen && data && !activeCategory) {
      setActiveCategory(data.categories[0]?.id || null);
    }
  }, [isOpen, data, activeCategory]);

  if (!item.hasMega) {
    return (
      <Link
        to={item.href || "#"}
        onClick={onClose}
        className={`flex items-center px-5 py-4 text-sm font-semibold transition-all duration-150 ${focusRing} ${isDark ? "text-slate-200 hover:text-white hover:bg-white/[0.04]" : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"}`}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className={`border-b ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between px-5 py-4 text-sm font-semibold transition-all duration-150 ${focusRing}
          ${isDark ? "text-slate-200 hover:text-white hover:bg-white/[0.04]" : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"}`}
      >
        {item.label}
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FiChevronDown className={`w-4 h-4 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && data && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`overflow-hidden ${isDark ? "bg-black/20" : "bg-slate-50"}`}
          >
            <div className="flex gap-1.5 px-3 pt-2 pb-3 overflow-x-auto scrollbar-hide">
              {data.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150 ${focusRing}
                    ${activeCategory === cat.id
                      ? "bg-gradient-to-r from-primary to-primary-dark text-white"
                      : isDark
                        ? "bg-white/[0.08] text-slate-400 hover:text-white"
                        : "bg-slate-200/70 text-text-secondary hover:text-text-primary"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="px-3 pb-3 space-y-1">
              {(data.categories.find((c) => c.id === activeCategory)?.courses || []).map((course, i) => (
                <Link
                  key={i}
                  to="/courses"
                  onClick={onClose}
                  className={`block p-3 rounded-xl text-sm transition-all ${isDark ? "hover:bg-white/[0.05]" : "hover:bg-slate-100"} ${focusRing}`}
                >
                  <p className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{course.title}</p>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{course.desc}</p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const MobileMenu = memo(function MobileMenu({ open, onClose, onToggleTheme, isDark }) {
  const location = useLocation();
  const drawerRef = useFocusTrap(open);

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-sm flex flex-col lg:hidden shadow-2xl
              ${isDark ? "bg-slate-950" : "bg-white"}`}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b flex-shrink-0 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
              <a href="/" className="brand-logo-viewport flex h-9 w-[132px] items-center justify-center" aria-label="Kini home">
                <img src="/assets/new-logo-f.jpg.jpeg" alt="Kini — Learn. Innovate. Lead." className="brand-logo-image" />
              </a>
              <div className="flex items-center gap-1.5">
                <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
                <button
                  onClick={onClose}
                  aria-label="Close navigation menu"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 ${focusRing}
                    ${isDark ? "text-slate-400 hover:text-white hover:bg-white/[0.08]" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Public routes chips */}
            <div className={`px-5 py-3 border-b ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
              <div className="flex flex-wrap gap-1.5">
                {PUBLIC_ROUTES.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={onClose}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${focusRing}
                        ${isActive
                          ? "bg-gradient-to-r from-primary to-primary-dark text-white"
                          : isDark
                        ? "text-slate-300 hover:text-white hover:bg-white/[0.08]"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Nav items */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {NAV_ITEMS.map((item) => (
                <MobileMenuItem key={item.key} item={item} isDark={isDark} onClose={onClose} />
              ))}
            </div>

            {/* Bottom CTA */}
            <div className={`p-4 border-t ${isDark ? "border-white/[0.06] bg-black/20" : "border-slate-100 bg-slate-50"}`}>
              <a
                href="/signup"
                onClick={onClose}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold shadow-lg shadow-glow-primary transition-all duration-300 active:scale-[0.98]"
              >
                Get Started <FiArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

export default MobileMenu;

