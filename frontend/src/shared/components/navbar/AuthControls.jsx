import { useState, useEffect, useCallback, useRef, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiLogIn, FiLayout, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useAuth } from "@shared/hooks/useAuth";
import { focusRing } from "./constants";
import { getRoleBasePath, getStoredRole, getStoredUser, hasStoredSession } from "@shared/utils/authSession";

const AuthControls = memo(function AuthControls({ isDark }) {
  const { isAuthenticated, user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [focusIndex, setFocusIndex] = useState(-1);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [dropdownOpen]);

  const effectiveAuth = isAuthenticated || hasStoredSession();
  const effectiveRole = role || getStoredRole();
  const storedUser = getStoredUser();
  const userName = user?.firstName || user?.name || storedUser?.firstName || storedUser?.name || "User";
  const userInitial = userName?.charAt(0)?.toUpperCase() || "U";

  const getRolePath = useCallback((suffix) => {
    const base = getRoleBasePath(effectiveRole);
    return base ? `${base}${suffix}` : "#";
  }, [effectiveRole]);

  const menuItems = [
    { label: "Dashboard", icon: FiLayout, path: getRolePath("/dashboard") },
    { label: "Profile", icon: FiUser, path: getRolePath("/profile") },
    { label: "Settings", icon: FiSettings, path: getRolePath("/settings") },
  ];

  const handleLogout = useCallback(async () => {
    await logout();
    setDropdownOpen(false);
    console.group("🚨 REDIRECT");
    console.error("Redirect Triggered");
    console.log("Current Route:", window.location.pathname);
    console.log("Destination:", "/login");
    console.log("Auth Token:", localStorage.getItem("token"));
    console.log("isAuthenticated:", localStorage.getItem("isAuthenticated"));
    console.log("Stored User:", localStorage.getItem("user"));
    console.log("Role:", localStorage.getItem("userRole") || localStorage.getItem("selectedRole") || null);
    console.trace();
    console.groupEnd();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const handleDropdownKeyDown = useCallback((e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((prev) => Math.min(prev + 1, menuItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((prev) => Math.max(prev - 1, -1));
    }
  }, [menuItems.length]);

  if (!effectiveAuth) {
    return (
      <div className="flex items-center gap-3">
        <Link
          to="/signup"
          className={`group inline-flex h-11 min-w-[152px] items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 text-sm font-bold tracking-normal text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${focusRing}`}
          style={{
            background: "linear-gradient(135deg, #085FA7, #043366)",
            boxShadow: "0 12px 28px rgba(8,95,167,0.22)",
          }}
        >
          <span>Get Started</span>
          <FiArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
        <Link
          to="/login"
          className={`inline-flex h-11 min-w-[122px] items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 text-sm font-bold tracking-normal transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${focusRing}
            ${isDark
              ? "border border-white/[0.12] bg-white/[0.08] text-white hover:bg-white/[0.12]"
              : "border border-slate-200 bg-white text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:bg-slate-50"
            }`}
        >
          <FiLogIn className="h-4 w-4 shrink-0" />
          <span>Sign In</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setDropdownOpen((o) => !o); setFocusIndex(-1); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDropdownOpen((o) => !o); } }}
        className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-bold transition-all duration-200 ${focusRing}`}
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(8,95,167,0.4), rgba(4,51,102,0.4))"
            : "linear-gradient(135deg, #085FA7, #043366)",
          borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(8,95,167,0.3)",
          color: "#fff",
        }}
        aria-label="User menu"
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
        title={userName}
      >
        {userInitial}
      </button>

      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            aria-label="User menu options"
            onKeyDown={handleDropdownKeyDown}
            className={`absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border shadow-2xl
              ${isDark ? "border-white/[0.08] shadow-black/50" : "border-slate-200 shadow-slate-200/80"}`}
            style={{
              background: isDark ? "rgba(10,14,26,0.99)" : "rgba(255,255,255,0.99)",
            }}
          >
            <div className="border-b px-4 py-3" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white"
                  style={{
                    background: isDark
                      ? "linear-gradient(135deg, rgba(8,95,167,0.4), rgba(4,51,102,0.4))"
                      : "linear-gradient(135deg, #085FA7, #043366)",
                  }}
                >
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {userName}
                  </p>
                  <p className={`text-[11px] capitalize ${isDark ? "text-white/40" : "text-slate-400"}`}>
                    {effectiveRole?.replace("-", " ") || "User"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-1.5">
              {menuItems.map((item, i) => {
                const Icon = item.icon;
                const isFocused = focusIndex === i;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${focusRing}
                      ${isDark
                        ? "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    style={{
                      background: isFocused
                        ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)")
                        : "transparent",
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
              <button
                onClick={handleLogout}
                role="menuitem"
                className={`m-1.5 flex w-[calc(100%-12px)] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${focusRing}
                  ${isDark
                    ? "text-red-400 hover:bg-red-500/[0.08] hover:text-red-300"
                    : "text-red-600 hover:bg-red-50 hover:text-red-700"
                  }`}
              >
                <FiLogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default AuthControls;
