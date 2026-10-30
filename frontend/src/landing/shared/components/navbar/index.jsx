
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { ChevronDown, LogIn, Menu, UserPlus, X } from "lucide-react";
import { ROUTES } from "@landing-shared/constants/routeConstants";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import kiniLogo from "../../../assets/kini-logo.png";

const RegisterModal = lazy(() => import("../RegisterModal"));

const navItems = [
  { label: "Home", to: ROUTES.PUBLIC.HOME },
  { label: "About Us", to: ROUTES.PUBLIC.ABOUT },
  {
    label: "Programs",
    to: ROUTES.PUBLIC.PROGRAMS,
    children: [
      { label: "Corporate Training", to: ROUTES.PUBLIC.CORPORATE_TRAINING },
      { label: "Internships", to: ROUTES.PUBLIC.INTERNSHIPS },
      { label: "Placements", to: ROUTES.PUBLIC.PLACEMENTS },
    ],
  },
  { label: "Contact Us", to: ROUTES.PUBLIC.CONTACT },
];

/* ── Desktop "Programs" dropdown ──────────────────────────────────────── */
function NavDropdown({ label, to, children, linkClass, isDark }) {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef(null);
  const wrapperRef = useRef(null);

  const openNow = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  }, []);

  const closeSoon = useCallback(() => {
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 150);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative flex items-center"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <NavLink to={to} className={linkClass} onClick={() => setOpen(false)}>
        {({ isActive }) => (
          <>
            {label}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 h-[2px] w-[55%] -translate-x-1/2 rounded-full bg-secondary-500" />
            )}
          </>
        )}
      </NavLink>

      <button
        type="button"
        aria-expanded={open}
        aria-label={`${open ? "Close" : "Open"} ${label} submenu`}
        onClick={() => setOpen((v) => !v)}
        className="flex h-6 w-6 shrink-0 items-center justify-center text-white/70 transition-colors hover:text-white"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <div
        className={`absolute left-0 top-full z-40 w-56 origin-top overflow-hidden rounded-xl border shadow-xl transition-all duration-150 ${
          open ? "mt-1 max-h-80 opacity-100" : "mt-0 max-h-0 opacity-0"
        } ${isDark ? "border-white/10 bg-ink-950" : "border-white/10 bg-[#0B3554]"}`}
      >
        <div className="py-1.5">
          {children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-[14px] transition-colors ${
                  isActive ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [hasOpenedRegister, setHasOpenedRegister] = useState(false);

  const { isDark } = useThemeContext();

  const openRegister = useCallback(() => {
    setHasOpenedRegister(true);
    setIsRegisterOpen(true);
    setMenuOpen(false);
  }, []);

  const closeRegister = useCallback(() => {
    setIsRegisterOpen(false);
  }, []);

  const linkClass = ({ isActive }) =>
    [
      "relative whitespace-nowrap px-2.5 py-2",
      "text-[15px] font-medium",
      "transition-colors duration-200",
      isActive ? "text-white" : "text-white/80 hover:text-white",
    ].join(" ");

  const iconButtonClass =
    "border-white/15 text-white/70 hover:bg-white/10 hover:text-white";

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full border-b border-white/[0.12]"
        style={{
          background: "linear-gradient(90deg, #0e2d47 0%, #133b5d 48%, #174d72 100%)",
        }}
      >
        {/* =====================================================
            DESKTOP HEADER — curved KINI brand panel
        ====================================================== */}
        <nav
          className="relative hidden w-full items-center lg:flex"
          style={{
            minHeight: "72px",
            padding: "0 32px 0 190px",
            gap: "32px",
          }}
          aria-label="Primary"
        >
          {/* The curve belongs to the panel; the image stays intact inside it. */}
          <Link
            to={ROUTES.PUBLIC.HOME}
            aria-label="KINI — Learn. Innovate. Lead."
            className="absolute left-0 top-0 z-20 flex items-start justify-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-inset"
            style={{
              width: "170px",
              height: "84px",
              padding: "8px 12px",
              background: "#ffffff",
              border: "0",
              borderBottomRightRadius: "100% 72%",
              boxShadow: "none",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <img
              src={kiniLogo}
              alt="KINI — Learn. Innovate. Lead."
              className="relative z-10 block object-contain object-left-top"
              style={{
                width: "88px",
                maxWidth: "88px",
                height: "auto",
                maxHeight: "54px",
                opacity: 1,
                filter: "none",
                mixBlendMode: "normal",
                transform: "none",
              }}
            />
          </Link>

          {/* Spacer keeps navigation aligned to the right */}
          <div className="min-w-0 flex-1" />

          {/* Navigation links */}
          <nav className="flex items-center gap-1 xl:gap-2">
            {navItems.map((item) =>
              item.children ? (
                <NavDropdown
                  key={item.to}
                  label={item.label}
                  to={item.to}
                  children={item.children}
                  linkClass={linkClass}
                  isDark={isDark}
                />
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === ROUTES.PUBLIC.HOME}
                  className={linkClass}
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 h-[2px] w-[55%] -translate-x-1/2 rounded-full bg-secondary-500" />
                      )}
                    </>
                  )}
                </NavLink>
              )
            )}
          </nav>

          {/* Right controls — Login (secondary) + Register (primary) */}
          <div className="flex shrink-0 items-center gap-3">
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-6 py-2.5 text-[13px] font-semibold text-white transition-all duration-200 hover:border-white/45 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
              style={{ minHeight: "46px" }}
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Login
            </Link>
            <button
              type="button"
              onClick={openRegister}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-[13px] font-semibold transition-all duration-200 hover:brightness-110"
              style={{
                color: "#133b5d",
                background: "linear-gradient(135deg, #f39924 0%, #ffad27 100%)",
                border: "1px solid rgba(255, 183, 70, 0.5)",
                borderRadius: "999px",
                boxShadow: "0 5px 14px rgba(8, 35, 58, 0.2)",
                minHeight: "46px",
              }}
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Register
            </button>
          </div>
        </nav>

        {/* =====================================================
            MOBILE / TABLET HEADER — single compact row
        ====================================================== */}
        <div className="relative flex w-full items-center lg:hidden" style={{ minHeight: "72px", padding: "0 20px" }}>
          {/* Logo — compact white card (mobile) */}
          <Link
            to={ROUTES.PUBLIC.HOME}
            aria-label="KINI — Learn. Innovate. Lead."
            className="z-10 flex shrink-0 items-center justify-center"
            style={{
              width: "clamp(170px, 46vw, 200px)",
              height: "56px",
              padding: "6px 12px",
              background: "#ffffff",
              border: "1px solid rgba(19, 59, 93, 0.14)",
              borderRadius: "10px",
              boxShadow: "0 4px 14px rgba(5, 30, 52, 0.16)",
              boxSizing: "border-box",
              overflow: "visible",
            }}
          >
            <img
              src={kiniLogo}
              alt="KINI — Learn. Innovate. Lead."
              className="block object-contain object-center"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "42px",
                opacity: 1,
                filter: "none",
                mixBlendMode: "normal",
              }}
            />
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Mobile actions — hamburger */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className={`flex h-[40px] w-[40px] items-center justify-center rounded-full border transition-colors ${iconButtonClass}`}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* =====================================================
            MOBILE MENU DROPDOWN
        ====================================================== */}
        <div
          id="mobile-nav-menu"
          className={`overflow-y-auto transition-all duration-300 lg:hidden ${
            isDark ? "bg-ink-950" : "bg-[#133b5d]"
          } ${menuOpen ? "max-h-[calc(100vh-4.5rem)] opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.to} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <NavLink to={item.to} className={linkClass} onClick={() => setMenuOpen(false)}>
                      {item.label}
                    </NavLink>
                    <button
                      type="button"
                      aria-expanded={mobileProgramsOpen}
                      aria-controls="mobile-programs-submenu"
                      aria-label={mobileProgramsOpen ? `Collapse ${item.label}` : `Expand ${item.label}`}
                      onClick={() => setMobileProgramsOpen((v) => !v)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center text-white/70 transition-colors hover:text-white"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${mobileProgramsOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  <div
                    id="mobile-programs-submenu"
                    className={`overflow-hidden pl-4 transition-all duration-300 ${
                      mobileProgramsOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="flex flex-col gap-1 py-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={linkClass}
                          onClick={() => setMenuOpen(false)}
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === ROUTES.PUBLIC.HOME}
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              )
            )}
            <Link
              to={ROUTES.AUTH.LOGIN}
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-white/45 hover:bg-white/[0.12]"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Login
            </Link>
            <button
              type="button"
              onClick={openRegister}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 hover:brightness-110"
              style={{
                color: "#133b5d",
                background: "linear-gradient(135deg, #f39924 0%, #ffad27 100%)",
                border: "1px solid rgba(255, 183, 70, 0.5)",
              }}
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Register
            </button>
          </nav>
        </div>
      </header>

      {/* =====================================================
          REGISTER MODAL
      ====================================================== */}
      {hasOpenedRegister && (
        <Suspense fallback={null}>
          <RegisterModal isOpen={isRegisterOpen} onClose={closeRegister} />
        </Suspense>
      )}
    </>
  );
}
