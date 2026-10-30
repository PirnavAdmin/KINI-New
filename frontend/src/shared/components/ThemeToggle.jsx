// components/ThemeToggle.jsx
import { FiSun, FiMoon } from "react-icons/fi";
import useTheme from "@shared/hooks/useTheme";

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      className={`relative w-16 h-[34px] rounded-full border transition-all duration-300 flex items-center px-1
        ${isDark
          ? "bg-slate-700 border-slate-600"
          : "bg-slate-200 border-slate-300"
        }`}
    >
      <span className={`w-[26px] h-[26px] rounded-full flex items-center justify-center transition-transform duration-300
        ${isDark ? "translate-x-[30px] bg-slate-800" : "translate-x-0 bg-white"}`}>
        {isDark
          ? <FiMoon className="w-3.5 h-3.5 text-indigo-400" />
          : <FiSun  className="w-3.5 h-3.5 text-amber-500" />
        }
      </span>
    </button>
  );
}