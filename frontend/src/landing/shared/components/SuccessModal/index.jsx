import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Mail, MessageCircle, Phone } from "lucide-react";
import ModalOverlay from "@landing-shared/components/ModalOverlay";
import CoursePreviewCard from "@landing-shared/components/CoursePreviewCard";
import Button from "@landing-shared/components/ui/Button";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import { EASE_PREMIUM } from "@landing-shared/hooks/useScrollAnimation";

const CHECKLIST = [
  "Registration Received",
  "Course Selected",
  "Verification Pending",
  "Team Contact Within 24 Hours",
];

const CONTACT_LINKS = [
  { icon: Phone, label: "Call Us", href: "tel:+15551234567" },
  { icon: Mail, label: "Email Us", href: "mailto:support@kinieduhub.io" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/15551234567" },
];

const CONFETTI_COLORS = ["var(--color-primary-500)", "var(--color-secondary-500)", "var(--color-brand-coral)"];

function useConfettiPieces(count = 12) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const distance = 50 + Math.random() * 30;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 15,
          rotate: Math.random() * 360,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          delay: Math.random() * 0.15,
        };
      }),
    [count],
  );
}

export default function SuccessModal({ isOpen, onClose, course }) {
  const { isDark } = useThemeContext();
  const navigate = useNavigate();
  const confetti = useConfettiPieces();

  const goHome = () => {
    onClose?.();
    navigate("/");
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} labelledBy="success-modal-heading" maxWidthClassName="sm:max-w-[440px]">
      <div className="flex flex-col items-center text-center">
        {/* Compact Success Icon & Confetti */}
        <div className="relative flex h-14 w-14 items-center justify-center">
          {confetti.map((piece) => (
            <motion.span
              key={piece.id}
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: piece.color }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{ x: piece.x, y: piece.y, opacity: 0, rotate: piece.rotate }}
              transition={{ duration: 0.8, delay: 0.1 + piece.delay, ease: "easeOut" }}
            />
          ))}

          <motion.span
            className="absolute inset-0 rounded-full bg-secondary-500/20"
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
          />

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-secondary-500/15"
          >
            <Check className="h-7 w-7 text-secondary-500" strokeWidth={3} aria-hidden="true" />
          </motion.div>
        </div>

        <motion.h2
          id="success-modal-heading"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3, ease: EASE_PREMIUM }}
          className={`mt-3 text-lg font-semibold ${isDark ? "text-white" : "text-ink-900"}`}
        >
          🎉 Registration Successful!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3, ease: EASE_PREMIUM }}
          className={`mt-1.5 text-xs leading-relaxed ${isDark ? "text-white/60" : "text-ink-900/60"}`}
        >
          Thank you for choosing KiniEduHub. Our admissions team will contact you shortly with the next steps.
        </motion.p>
      </div>

      {/* Checklist grid */}
      <div className={`mt-3.5 grid grid-cols-2 gap-2 rounded-xl border p-3 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-ink-900/[0.06] bg-porcelain"}`}>
        {CHECKLIST.map((item) => (
          <div key={item} className="flex items-center gap-1.5">
            <Check className="h-3 w-3 flex-shrink-0 text-secondary-500" aria-hidden="true" />
            <span className={`text-[11px] font-medium leading-tight text-left ${isDark ? "text-white/70" : "text-ink-900/70"}`}>{item}</span>
          </div>
        ))}
      </div>

      {/* Course preview if available */}
      {course && (
        <div className="mt-3">
          <p className={`mb-1 text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-white/40" : "text-ink-900/40"}`}>
            Selected Course
          </p>
          <div className="[&_*]:text-xs">
            <CoursePreviewCard course={course} />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button type="button" onClick={goHome} className="w-full py-2 text-xs sm:flex-1">
          Continue
        </Button>
        <Button type="button" variant="secondary" onClick={goHome} className="w-full py-2 text-xs sm:flex-1">
          Back to Home
        </Button>
      </div>

      {/* Footer assistance links */}
      <div className={`mt-3.5 border-t pt-3 text-center ${isDark ? "border-white/10" : "border-ink-900/[0.06]"}`}>
        <p className={`text-[11px] font-medium ${isDark ? "text-white/40" : "text-ink-900/40"}`}>Need immediate assistance?</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          {CONTACT_LINKS.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className={`flex items-center gap-1 rounded-pill border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                isDark
                  ? "border-white/10 text-white/75 hover:bg-white/10"
                  : "border-ink-900/10 text-ink-900/75 hover:bg-ink-900/5"
              }`}
            >
              <Icon className="h-2.5 w-2.5" aria-hidden="true" />
              {label}
            </a>
          ))}
        </div>
      </div>
    </ModalOverlay>
  );
}