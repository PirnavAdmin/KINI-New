import { useState, useEffect } from "react";

/**
 * useTheme
 * Global theme hook backed by localStorage + <html> class toggling.
 * - Persists user preference across reloads
 * - Toggles the `dark` class on <html>, so Tailwind's `dark:` variants
 *   work everywhere automatically (if you choose to use them)
 * - Also returns `isDark` boolean for components using the `t` helper
 *   pattern (functions that take isDark and return classNames)
 */
export default function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    // 1. Check localStorage first
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    // 2. Fall back to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((d) => !d) };
}
