import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import ParticlesBg from "@/components/ui/ParticlesBg";
import HeroContent from "./components/HeroContent";
import HeroScene from "./components/HeroScene";
import FeaturedCourses from "./components/FeaturedCourses";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import TrustedCompanies from "./components/TrustedCompanies";
import LearningTimeline from "./components/LearningTimeline";
import ScrollIndicator from "./components/ScrollIndicator";
import StickyScrollStory from "./components/StickyScrollStory";
import StickyImageScroll from "./components/StickyImageScroll";
import StickyGallery from "./components/StickyGallery";
import ScrollProgressBar from "./components/ScrollProgressBar";
import AnimatedFooter from "./components/AnimatedFooter";

export default function HeroPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const sceneRef = useRef(null);

  // Smooth mouse tracking with spring physics simulation
  const handleMouseMove = useCallback((e) => {
    if (!sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <>
      {/* ── Scroll Progress Indicator ────────────────────── */}
      <ScrollProgressBar />

      {/* Hero Section */}
      <ParticlesBg
        className="min-h-screen"
        showGradient
        showNoise
        showParticles
        showGrid
      >
        {/* Subtle Navbar placeholder */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-between">
            <span
              className="text-lg font-bold tracking-tight"
              style={{ color: "rgba(255,255,255,.9)" }}
            >
              Pirnav<span style={{ color: "rgba(255,255,255,.45)" }}>EduHub</span>
            </span>
            <div className="flex items-center gap-4">
              <a
                href="/login"
                className="text-sm font-medium transition-colors"
                style={{ color: "rgba(255,255,255,.6)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.9)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.6)")}
              >
                Sign in
              </a>
              <a
                href="/signup"
                className="text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                  color: "#fff",
                  boxShadow: "0 4px 15px rgba(99,102,241,.3)",
                }}
              >
                Get Started
              </a>
            </div>
          </div>
        </div>

        {/* Main hero grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 min-h-[calc(100vh-100px)]">
          <div
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-100px)]"
            ref={sceneRef}
          >
            {/* Left: Content */}
            <HeroContent />

            {/* Right: Scene with parallax */}
            <motion.div
              className="hidden lg:block"
              style={{
                transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`,
                transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
            </motion.div>

            {/* Mobile scene */}
          
          </div>
        </div>

        <ScrollIndicator />
      </ParticlesBg>

      {/* ═══════════════════════════════════════════════════ */}
      {/* STICKY SCROLL STORY — 3 storytelling sections       */}
      {/* ═══════════════════════════════════════════════════ */}
      <StickyScrollStory />

      {/* ═══════════════════════════════════════════════════ */}
      {/* STICKY IMAGE SCROLL — split layout                  */}
      {/* ═══════════════════════════════════════════════════ */}
      <StickyImageScroll />

      {/* ═══════════════════════════════════════════════════ */}
      {/* STICKY GALLERY — stacked images + text              */}
      {/* ═══════════════════════════════════════════════════ */}
      <StickyGallery />

      {/* Learning Journey */}
      <div data-aos="fade-up" data-aos-duration="800">
        <LearningTimeline />
      </div>

      {/* Featured Courses */}
      <FeaturedCourses />

      {/* Testimonials */}
      <Testimonials />

      {/* Trusted Companies */}
      <TrustedCompanies />

      {/* FAQ */}
      <FAQ />

      {/* ═══════════════════════════════════════════════════ */}
      {/* ANIMATED FOOTER — large typography + gradient        */}
      {/* ═══════════════════════════════════════════════════ */}
      <AnimatedFooter />
    </>
  );
}
