import { Suspense, useEffect, useLayoutEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa6";
import { ThemeProvider } from "@landing-shared/context/ThemeContext";
import { ModalProvider } from "@landing-shared/context/ModalProvider";
import LoadingScreen from "@landing-shared/components/LoadingScreen";

// The intro loading screen plays once per page load, not every time a
// visitor comes back to a landing page from another part of the app.
let introShown = false;

// AOS (Animate On Scroll) for every landing page that uses `data-aos`.
// `once: false` + `mirror: true` so sections replay their fade every time
// they re-enter the viewport, scrolling either direction.
function useAOS() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: false,
      mirror: true,
      offset: 80,
      anchorPlacement: "top-bottom",
      disable: prefersReducedMotion,
    });
  }, []);
}

// Floating WhatsApp button, bottom-right corner. From `sm` up the app's Kini
// Assistant launcher takes the corner (sm:bottom-6 in kini-assistant
// ChatWindow), so the button sits above it there; on phones the launcher is
// already raised to bottom-20.
function WhatsAppButton() {
  const phoneNumber = "919000198239";
  const message = "Hello! I'm interested in your programs.";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-4 z-50 flex sm:bottom-24 sm:right-6 h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-green-500/30 transition-colors duration-200"
      style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
    >
      <FaWhatsapp className="h-7 w-7 text-white" aria-hidden="true" />
    </motion.a>
  );
}

// Layout route for the public landing pages. Provides the landing's own
// ThemeProvider and ModalProvider and scopes the landing CSS by putting
// `kini-landing` on <body> (so the modals' portals are inside it too).
// The app's router, ScrollToTop and sonner Toaster are reused.
export default function LandingLayout() {
  const [isLoading, setIsLoading] = useState(!introShown);
  useAOS();

  useLayoutEffect(() => {
    document.body.classList.add("kini-landing");
    return () => document.body.classList.remove("kini-landing");
  }, []);

  const finishIntro = () => {
    introShown = true;
    setIsLoading(false);
  };

  return (
    <ThemeProvider>
      {isLoading && <LoadingScreen onComplete={finishIntro} />}
      <ModalProvider>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
              Loading...
            </div>
          }
        >
          <Outlet />
        </Suspense>
        <WhatsAppButton />
      </ModalProvider>
    </ThemeProvider>
  );
}
