import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { FiMenu } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { useThemeContext } from "@shared/context/ThemeContext";
import Logo from "./navbar/Logo";
import DesktopMenu from "./navbar/DesktopMenu";
import MobileMenu from "./navbar/MobileMenu";
import AuthControls from "./navbar/AuthControls";
import CartButton from "./navbar/CartButton";
import { focusRing } from "./navbar/constants";

export default function Navbar() {
  const location = useLocation();
  const { isDark, toggle: toggleTheme } = useThemeContext();
  const [scrolled, setScrolled] = useState(false);
  const [activeMega, setActiveMega] = useState(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const headerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollHeight > 0 ? Math.min((scrollY / scrollHeight) * 100, 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Close transient navigation UI after the router commits a new location.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setActiveMega(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!activeMega) return;
    const handleEsc = (e) => { if (e.key === "Escape") setActiveMega(null); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [activeMega]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? isDark
              ? "rgba(2,6,23,0.92)"
              : "rgba(255,255,255,0.72)"
            : isDark
              ? "rgba(2,6,23,0.8)"
              : "rgba(255,255,255,0.72)",
          backdropFilter: "blur(20px) saturate(1.5)",
          WebkitBackdropFilter: "blur(20px) saturate(1.5)",
          borderBottom: scrolled
            ? `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(8,95,167,0.08)"}`
            : "1px solid transparent",
          boxShadow: scrolled
            ? isDark
              ? "0 8px 32px rgba(0,0,0,0.5)"
              : "0 4px 24px rgba(8,95,167,0.06)"
            : "none",
        }}
        role="banner"
      >
        {/* Top accent line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Scroll progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary via-primary-light to-primary-lighter"
          style={{ width: `${scrollProgress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(scrollProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Page scroll progress"
        />

        <nav
          className={`w-full px-6 sm:px-8 lg:px-12 flex items-center justify-between gap-6 transition-all duration-300
            ${scrolled ? "h-16" : "h-[72px]"}`}
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Left: Logo */}
          <Logo />

          {/* Center: Desktop Navigation */}
          <DesktopMenu
            activeMega={activeMega}
            setActiveMega={setActiveMega}
            scrolled={scrolled}
          />

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Desktop-only controls */}
            {/* <div className="hidden lg:flex items-center gap-1.5">
              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            
            </div> */}

            {/* Cart - visible on every breakpoint */}
            <CartButton isDark={isDark} />

            {/* Auth (desktop) */}
            <div className="hidden sm:block">
              <AuthControls isDark={isDark} />
            </div>

            {/* CTA - desktop only */}
           

            {/* Mobile hamburger */}
            <button
              onClick={openMobile}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className={`lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 ${focusRing}
                ${isDark
                  ? "text-slate-300 hover:text-white hover:bg-white/[0.08]"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
            >
              <FiMenu className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <MobileMenu
        open={mobileOpen}
        onClose={closeMobile}
        onToggleTheme={toggleTheme}
        isDark={isDark}
      />

      {/* Offset for fixed header */}
      <div className="h-[72px]" />
    </>
  );
}
