import Navbar from '@landing-shared/components/navbar';
import { ThemeProvider } from '@landing-shared/context/ThemeContext';

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

// Reuse the public Home header and its registration modal. Keep the landing
// theme scoped to the header so checkout retains its existing app providers.
export default function EnrollmentNavbar() {
  return (
    <ThemeProvider>
      <Navbar />
    </ThemeProvider>
  );
}