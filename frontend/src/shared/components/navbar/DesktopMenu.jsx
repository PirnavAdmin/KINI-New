import { useCallback, useRef, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useThemeContext } from "@shared/context/ThemeContext";
import { NAV_ITEMS, PUBLIC_ROUTES, focusRing } from "./constants";
import NavItem from "./NavItem";
import MegaMenu from "./MegaMenu";

// Debug helper — set to true to trace hover events
// Set to `true` to trace hover events in the console
const DEBUG = false;

const DesktopMenu = memo(function DesktopMenu({ activeMega, setActiveMega, scrolled }) {
  const { isDark } = useThemeContext();
  const location = useLocation();
  const timerRef = useRef(null);

  const openMega = useCallback((key) => {
    if (DEBUG) console.log(`[mega] mouseenter → openMega(“${key}”)`);
    clearTimeout(timerRef.current);
    setActiveMega(key);
  }, [setActiveMega]);

  const closeMega = useCallback(() => {
    if (DEBUG) console.log(`[mega] mouseleave → closeMega (scheduled +100ms)`);
    timerRef.current = setTimeout(() => {
      if (DEBUG) console.log(`[mega] timeout fired → setActiveMega(null)`);
      setActiveMega(null);
    }, 100);
  }, [setActiveMega]);

  const stayOpen = useCallback(() => {
    if (DEBUG) console.log(`[mega] stayOpen → cleared close timeout`);
    clearTimeout(timerRef.current);
  }, []);

  const isActivePath = useCallback((path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  if (DEBUG) console.log(`[mega] render — activeMega = ${activeMega}`);

  return (
    <div className="hidden lg:flex items-center justify-center gap-5 xl:gap-6" role="menubar" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => (
        <div
          key={item.key}
          className="relative"
          onMouseEnter={() => openMega(item.key)}
          onMouseLeave={closeMega}
        >
          <NavItem
            item={item}
            isActive={activeMega === item.key}
            onClick={() => {
              if (DEBUG) console.log(`[mega] click → ${item.key}`);
              setActiveMega((prev) => prev === item.key ? null : item.key);
            }}
            isDark={isDark}
          />
          {item.hasMega && (
            <div
              onMouseEnter={stayOpen}
              onMouseLeave={closeMega}
              className={`fixed left-1/2 z-50 flex -translate-x-1/2 justify-center ${
                activeMega === item.key ? "" : "pointer-events-none"
              }`}
              style={{ top: scrolled ? 72 : 80 }}
            >
              <MegaMenu
                menuKey={item.key}
                isVisible={activeMega === item.key}
              />
            </div>
          )}
        </div>
      ))}

      {/* Public routes */}
      {PUBLIC_ROUTES.map((link) => {
        const isActive = isActivePath(link.path);
        return (
          <Link
            key={link.path}
            to={link.path}
            aria-current={isActive ? "page" : undefined}
            className={`relative px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${focusRing}
              ${isActive
                ? isDark
                  ? "text-white bg-white/[0.09]"
                  : "text-primary bg-primary-50"
                : isDark
                  ? "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
});

export default DesktopMenu;
