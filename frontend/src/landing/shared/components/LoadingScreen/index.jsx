import { useEffect, useState } from "react";
import logo from "../../../assets/kini-logo.png";

const STYLE = `
  @keyframes keh-drop {
    0%   { opacity: 0; transform: translateY(-24px) scale(0.88); }
    60%  { opacity: 1; transform: translateY(4px)  scale(1.05); }
    80%  { transform: translateY(-2px) scale(0.98); }
    100% { opacity: 1; transform: translateY(0)    scale(1); }
  }
  @keyframes keh-pulse {
    0%, 100% { filter: drop-shadow(0 0 0px rgba(19,59,93,0.15)); }
    50%       { filter: drop-shadow(0 0 20px rgba(19,59,93,0.45))
                        drop-shadow(0 0 8px  rgba(243,153,36,0.35)); }
  }
  @keyframes keh-fade-up {
    0%   { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes keh-dot {
    0%, 80%, 100% { transform: scale(0.5); opacity: 0.25; }
    40%            { transform: scale(1);   opacity: 1; }
  }
  .keh-logo-img {
    animation: keh-drop 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards;
  }
  .keh-logo-img.pulsing {
    animation:
      keh-drop  0.65s cubic-bezier(0.34,1.56,0.64,1) forwards,
      keh-pulse 2s   ease-in-out 0.7s infinite;
  }
  .keh-tagline {
    opacity: 0;
    animation: keh-fade-up 0.45s ease-out 0.75s forwards;
  }
  .keh-dot { animation: keh-dot 1.1s ease-in-out infinite; }
  .keh-dot:nth-child(1) { animation-delay: 0.9s; }
  .keh-dot:nth-child(2) { animation-delay: 1.1s; }
  .keh-dot:nth-child(3) { animation-delay: 1.3s; }
`;

export default function LoadingScreen({ onComplete }) {
  const [phase, setPhase]       = useState("enter");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!document.getElementById("keh-loader-styles")) {
      const s = document.createElement("style");
      s.id = "keh-loader-styles";
      s.textContent = STYLE;
      document.head.appendChild(s);
    }

    const start    = performance.now();
    const duration = 2400;

    const tick = (now) => {
      const pct = Math.min(((now - start) / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const t1 = setTimeout(() => setPhase("pulse"), 400);
    const t2 = setTimeout(() => setPhase("exit"),  2400);
    const t3 = setTimeout(() => onComplete?.(),    2950);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  /* Circumference for r=48 ring */
  const C  = 2 * Math.PI * 48;
  const offset = C * (1 - progress / 100);

  return (
    <div style={{
      position:      "fixed",
      inset:         0,
      zIndex:        9999,
      display:       "flex",
      flexDirection: "column",
      alignItems:    "center",
      justifyContent:"center",
      background:    "#ffffff",
      opacity:       phase === "exit" ? 0 : 1,
      transition:    "opacity 0.55s cubic-bezier(0.4,0,0.2,1)",
      pointerEvents: phase === "exit" ? "none" : "all",
    }}>

      {/* ── Ring + Logo ── */}
      <div style={{ position: "relative", width: 120, height: 120,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>

        {/* Spinning gradient progress ring */}
        <svg
          width="120" height="120"
          viewBox="0 0 120 120"
          style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
        >
          <defs>
            <linearGradient id="ring-g" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#133B5D" />
              <stop offset="100%" stopColor="#F39924" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle cx="60" cy="60" r="48" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
          {/* Fill */}
          <circle
            cx="60" cy="60" r="48"
            fill="none"
            stroke="url(#ring-g)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.08s linear" }}
          />
        </svg>

        {/* Actual logo image */}
        <img
          src={logo}
          alt="Kini Edx Hub"
          className={`keh-logo-img${phase === "pulse" ? " pulsing" : ""}`}
          style={{ width: 80, height: 80, objectFit: "contain" }}
        />
      </div>

      {/* No separate wordmark/tagline here: the logo artwork above already
          renders "Kini" + "Learn. Innovate. Lead." — repeating it in text
          would just duplicate (and risk drifting out of sync with) what's
          already in the image. */}

      {/* ── Progress bar ── */}
      <div style={{
        marginTop: 24, width: 150, height: 3,
        borderRadius: 99, background: "#e2e8f0", overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width:  `${progress}%`,
          borderRadius: 99,
          background: "linear-gradient(90deg,#133B5D 0%,#F39924 100%)",
          transition: "width 0.08s linear",
        }} />
      </div>

      {/* ── Bouncing dots ── */}
      <div style={{ display: "flex", gap: 5, marginTop: 12 }}>
        {[0,1,2].map((i) => (
          <span key={i} className="keh-dot" style={{
            display: "block", width: 6, height: 6,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#133B5D,#F39924)",
          }} />
        ))}
      </div>
    </div>
  );
}
