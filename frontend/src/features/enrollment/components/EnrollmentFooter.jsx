import { Link } from "react-router-dom";
import { ROUTES } from "@shared/constants/routeConstants";
import { BRAND } from "../theme";
import { KiniWordmark } from "./EnrollmentNavbar";

// Real routes from src/landing/landingRoutes.jsx. Social links are left out
// until the project has configured profile URLs.
const LINKS = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms of Service", to: "/terms-conditions" },
  { label: "Contact Support", to: ROUTES.PUBLIC.CONTACT },
];

export default function EnrollmentFooter({ isDark }) {
  return (
    <footer
      className="mt-8 border-t"
      style={{
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(19,59,93,0.1)",
        backgroundColor: isDark ? "rgba(11,17,32,0.6)" : "rgba(255,255,255,0.7)",
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <KiniWordmark color={isDark ? "#FFFFFF" : BRAND.primary} className="h-8 w-auto" />
          <span className="text-xs" style={{ color: isDark ? "#94A3B8" : "#64748B" }}>
            © {new Date().getFullYear()} KINI Edutech. All rights reserved.
          </span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="transition-colors hover:underline underline-offset-4"
              style={{ color: isDark ? "#CBD5E1" : BRAND.primary }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
