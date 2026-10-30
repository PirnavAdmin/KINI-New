import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiChevronDown, FiLogIn, FiMenu, FiUser, FiX } from "react-icons/fi";
import { ROUTES } from "@shared/constants/routeConstants";
import { BRAND } from "../theme";

// Same links as the landing navbar (src/landing/shared/components/navbar).
// That navbar needs the landing ThemeProvider, so the enrollment page keeps
// its own compact copy rather than mounting a second theme provider.
const NAV_ITEMS = [
  { label: "Home", to: ROUTES.PUBLIC.HOME },
  { label: "About Us", to: ROUTES.PUBLIC.ABOUT },
  { label: "Programs", to: "/programs", hasMenu: true },
  { label: "Contact Us", to: ROUTES.PUBLIC.CONTACT },
];

// public/assets/kini-company-logo.svg with the wordmark in white so it reads
// on the navy bar; the orange cap is unchanged.
export function KiniWordmark({ color = "#FFFFFF", className = "" }) {
  return (
    <svg viewBox="78 4 204 116" className={className} role="img" aria-label="KINI">
      <defs>
        <linearGradient id="kini-cap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffb51b" />
          <stop offset="1" stopColor="#f45b22" />
        </linearGradient>
      </defs>
      <text x="180" y="113" textAnchor="middle" fill={color} fontFamily="Arial Black, Arial, sans-serif" fontSize="120" fontWeight="900" letterSpacing="-10">kini</text>
      <g fill="url(#kini-cap)">
        <path d="M123 17 140 10h46l17 7-17 7h-46z" />
        <path d="M130 27h65v9h-65z" />
        <path d="M140 36h45v13l-23 10-22-10z" />
        <path d="M186 26h3v38h-3z" />
        <circle cx="193" cy="72" r="8" />
      </g>
    </svg>
  );
}

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "text-white" : "text-white/80 hover:text-white"}`;

export default function EnrollmentNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40" style={{ backgroundColor: BRAND.primary }}>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to={ROUTES.PUBLIC.HOME} aria-label="KINI home" className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
            <KiniWordmark className="h-8 w-auto sm:h-9" />
          </Link>
          <span aria-hidden="true" className="h-6 w-px bg-white/30" />
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white sm:text-sm">Enrollment</span>
        </div>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.label} to={item.to} end={item.to === ROUTES.PUBLIC.HOME} className={linkClass}>
              <span className="inline-flex items-center gap-1">
                {item.label}
                {item.hasMenu && <FiChevronDown aria-hidden="true" className="h-3.5 w-3.5" />}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <FiLogIn aria-hidden="true" className="h-4 w-4" /> Login
          </Link>
          <Link
            to={ROUTES.AUTH.REGISTER}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
            style={{ backgroundColor: BRAND.accent, color: BRAND.primary }}
          >
            <FiUser aria-hidden="true" className="h-4 w-4" /> Register
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="enrollment-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid h-10 w-10 place-items-center rounded-lg text-white hover:bg-white/10 lg:hidden"
        >
          {open ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav id="enrollment-mobile-nav" aria-label="Main" className="border-t border-white/10 px-4 pb-4 pt-2 lg:hidden">
          <div className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.label} to={item.to} end={item.to === ROUTES.PUBLIC.HOME} className={linkClass} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Link to={ROUTES.AUTH.LOGIN} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-4 py-2.5 text-sm font-semibold text-white">
              <FiLogIn aria-hidden="true" className="h-4 w-4" /> Login
            </Link>
            <Link to={ROUTES.AUTH.REGISTER} className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold" style={{ backgroundColor: BRAND.accent, color: BRAND.primary }}>
              <FiUser aria-hidden="true" className="h-4 w-4" /> Register
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
