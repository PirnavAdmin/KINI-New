import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@shared/constants/routeConstants";
import useFocusTrap from "@shared/components/navbar/useFocusTrap";

import {
  STORAGE_SESSION_KEY,
  STORAGE_DAILY_KEY,
  POPUP_DELAY,
  SCROLL_TRIGGER_DEPTH,
  features,
  getTimeRemaining,
  backdropVariants,
  modalVariants,
  cardVariants,
  countdownVariants,
  ctaVariants,
  reducedMotionVariants,
} from "./constants/popupData";

import PopupHero from "./components/PopupHero";
import FeatureCard from "./components/FeatureCard";
import CountdownDisplay from "./components/CountdownDisplay";
import CTASection from "./components/CTASection";
import DismissOptions from "./components/DismissOptions";

const SEATS_TOTAL = 500;
const SEATS_FILLED = 412;

const BatchAnnouncementPopup = ({ onOpenEnquiry }) => {
  const [show, setShow] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining);
  const previousFocusRef = useRef(null);
  const hasTriggeredRef = useRef(false);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  // Select variants based on user's motion preference
  const activeVariants = prefersReducedMotion ? reducedMotionVariants : null;
  const bv = activeVariants?.backdropVariants ?? backdropVariants;
  const mv = activeVariants?.modalVariants ?? modalVariants;
  const cv = activeVariants?.cardVariants ?? cardVariants;
  const cdv = activeVariants?.countdownVariants ?? countdownVariants;
  const ctav = activeVariants?.ctaVariants ?? ctaVariants;

  // ── Check storage + auto-show ──────────────────────────────────────────
  useEffect(() => {
    // ── Debug bypass: ?force_popup skips all storage checks ─────────────
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("force_popup")) {
      const timer = setTimeout(() => {
        hasTriggeredRef.current = true;
        setShow(true);
      }, 500);
      return () => clearTimeout(timer);
    }

    const dailyDismiss = localStorage.getItem(STORAGE_DAILY_KEY);
    if (dailyDismiss) {
      const expiry = parseInt(dailyDismiss, 10);
      if (!isNaN(expiry) && Date.now() < expiry) {
        return;
      }
      localStorage.removeItem(STORAGE_DAILY_KEY);
    }

    const sessionDismiss = sessionStorage.getItem(STORAGE_SESSION_KEY);
    if (sessionDismiss) return;

    // Show after timeout fallback (2.5s)
    const timer = setTimeout(() => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        setShow(true);
      }
    }, POPUP_DELAY);

    // Show on scroll depth (35% of page)
    const handleScroll = () => {
      if (hasTriggeredRef.current) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
      if (scrollPercent >= SCROLL_TRIGGER_DEPTH) {
        hasTriggeredRef.current = true;
        setShow(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ── Countdown tick ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!show) return;
    setTimeLeft(getTimeRemaining());
    const interval = setInterval(() => setTimeLeft(getTimeRemaining()), 60_000);
    return () => clearInterval(interval);
  }, [show]);

  // ── Body scroll lock ───────────────────────────────────────────────────
  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  // ── Focus save / restore ───────────────────────────────────────────────
  useEffect(() => {
    if (show) {
      previousFocusRef.current = document.activeElement;
    } else if (previousFocusRef.current?.focus) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [show]);

  // ── Escape key ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const focusTrapRef = useFocusTrap(show);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    setShow(false);
    sessionStorage.setItem(STORAGE_SESSION_KEY, "true");
    if (dontShowToday) {
      localStorage.setItem(STORAGE_DAILY_KEY, (Date.now() + 86400000).toString());
    }
  }, [dontShowToday]);

  const handleEnrollNow = useCallback(() => {
    handleClose();
    navigate(ROUTES.PUBLIC.ADMISSIONS);
  }, [handleClose, navigate]);

  const handleBookConsultation = useCallback(() => {
    handleClose();
    if (onOpenEnquiry) {
      setTimeout(() => onOpenEnquiry(), 300);
    }
  }, [handleClose, onOpenEnquiry]);

  return (
    <AnimatePresence onExitComplete={() => { document.body.style.overflow = ""; }}>
      {show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            variants={bv}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={prefersReducedMotion ? { duration: 0.1 } : { duration: 0.3 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={focusTrapRef}
            variants={mv}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="New Batch Started — Admissions Open"
            className="
              relative
              w-[95vw]
              max-w-[1100px]
              max-h-[90vh]
              overflow-y-auto
              bg-white
              rounded-3xl
              shadow-[0_40px_100px_rgba(0,0,0,0.3)]
              mx-auto
              flex
              flex-col
            "
          >
            {/* ── Hero ──────────────────────────────────────────── */}
            <PopupHero onClose={handleClose} />

            {/* ── Body ──────────────────────────────────────────── */}
            <div className="flex-1 px-6 sm:px-10 pt-8 sm:pt-10 pb-6 sm:pb-8 space-y-5 sm:space-y-6">
              {/* Feature cards — 3 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {features.map((feature, i) => (
                  <FeatureCard key={feature.title} feature={feature} index={i} variants={cv} />
                ))}
              </div>

              {/* Countdown */}
              <CountdownDisplay
                timeLeft={timeLeft}
                seatsFilled={SEATS_FILLED}
                seatsTotal={SEATS_TOTAL}
                variants={cdv}
              />

              {/* CTAs */}
              <CTASection
                onEnrollNow={handleEnrollNow}
                onBookConsultation={handleBookConsultation}
                variants={ctav}
              />

              {/* Dismiss */}
              <DismissOptions
                dontShowToday={dontShowToday}
                onToggleDontShow={setDontShowToday}
                onMaybeLater={handleClose}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

BatchAnnouncementPopup.displayName = "BatchAnnouncementPopup";
export default BatchAnnouncementPopup;
