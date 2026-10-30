import { Suspense, lazy, useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "@landing-shared/components/navbar";
import Seo from "@landing-shared/components/Seo";

import Hero from "../components/Hero";
import CardFlip from "../components/CardFlip";
import { FaCode, FaServer, FaBrain } from "react-icons/fa";

// ─── Import the video intro and form components ──────────────
import VideoIntro from "@landing-shared/components/GetInTouchModal/VideoIntro";   // adjust path
// adjust path

const Footer = lazy(() => import("@landing-shared/components/Footer"));
const ProjectNew = lazy(() => import("./ProjectNew"));
const CareerRoadmapGenerator = lazy(() => import("../components/Careerroadmapgenerator"));
const TrustedCompanies = lazy(() => import("../components/TrustedCompanies"));
const StudentJourney = lazy(() => import("../components/StudentJourney"));
const WhyChooseUs = lazy(() => import("../components/WhyChooseUs"));
const DashboardShowcase = lazy(() => import("../components/DashboardShowcase"));
const Categories = lazy(() => import("../components/Categories"));
const FeaturedCourses = lazy(() => import("../components/FeaturedCourses"));
const LearningPaths = lazy(() => import("../components/LearningPaths"));
const Stats = lazy(() => import("../components/Stats"));
const ExpertMentors = lazy(() => import("../components/ExpertMentors"));
const Testimonials = lazy(() => import("../components/Testimonials"));
const Newsletter = lazy(() => import("../components/Newsletter"));
const CTA = lazy(() => import("../components/CTA"));
const EnquiryWidget = lazy(() => import("./EnquiryWidget"));

const GetInTouchModal = lazy(() => import("@landing-shared/components/GetInTouchModal"));

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

function AnimatedSection({ children, className = "" }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={sectionVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Home() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [loadRest, setLoadRest] = useState(false);
  const [loadWidgets, setLoadWidgets] = useState(false);

  // ─── Get In Touch → Intro Video flow ──────────────────────────────
  const [showGetInTouch, setShowGetInTouch] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(false);

  const handleOpenEnquiry = useCallback(() => setIsEnquiryOpen(true), []);
  const handleCloseEnquiry = useCallback(() => setIsEnquiryOpen(false), []);

  // Auto-open Get In Touch 5s after load, once per browser session.
  useEffect(() => {
    if (sessionStorage.getItem("kini_intro_flow_seen")) return;

    const timer = window.setTimeout(() => {
      sessionStorage.setItem("kini_intro_flow_seen", "true");
      setShowGetInTouch(true);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, []);

  // Lock body scroll while the blocking Get In Touch modal is open. The
  // intro video is now a small non-blocking floating card (bottom-left),
  // so it no longer locks scroll.
  useEffect(() => {
    document.body.style.overflow = showGetInTouch ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showGetInTouch]);

  // Submitting or closing Get In Touch both continue on to the intro video.
  const handleGetInTouchAdvance = useCallback(() => {
    setShowGetInTouch(false);
    setShowIntroVideo(true);
  }, []);

  const handleVideoClose = useCallback(() => {
    setShowIntroVideo(false);
  }, []);

  // VideoIntro has no built-in Escape handling (unlike GetInTouchModal),
  // so it's added here without touching its UI.
  useEffect(() => {
    if (!showIntroVideo) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleVideoClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showIntroVideo, handleVideoClose]);

  useEffect(() => {
    const contentTimer = window.setTimeout(() => setLoadRest(true), 50);
    const widgetTimer = window.setTimeout(() => setLoadWidgets(true), 1400);

    return () => {
      window.clearTimeout(contentTimer);
      window.clearTimeout(widgetTimer);
    };
  }, []);

  return (
    <>
      <Seo
        title="Corporate Training, Internships & Placement Assistance"
        description="Master industry skills with live training, real-world projects, expert mentorship and placement assistance. Kini Edx Hub is a future-ready corporate training platform."
        path="/"
      />
      <Navbar />

      <div className="relative z-10">
        <main className="overflow-x-clip">
          <Hero />

          {loadRest && (
            <Suspense fallback={null}>
              <AnimatedSection>
                <CareerRoadmapGenerator/>
              </AnimatedSection>
              <AnimatedSection>
                <FeaturedCourses />
              </AnimatedSection>
              <AnimatedSection>
                <TrustedCompanies />
              </AnimatedSection>
              <AnimatedSection>
                <StudentJourney />
              </AnimatedSection>
              <AnimatedSection>
                <WhyChooseUs />
              </AnimatedSection>
              <AnimatedSection>
                <Categories />
              </AnimatedSection>
            </Suspense>
          )}

          {/* Isolated in its own Suspense: this section depends on a
              third-party Lottie CDN (lottie.host) that can suspend
              indefinitely if slow/unreachable. Kept separate so that
              failure can't blank out every other section, which shared
              one Suspense boundary with it previously. */}
          {loadRest && (
            <Suspense fallback={null}>
              <AnimatedSection>
                <ProjectNew />
              </AnimatedSection>
            </Suspense>
          )}

          {loadRest && (
            <Suspense fallback={null}>
              {/* CARD FLIP */}
             <section className="py-16 md:py-20 bg-[#F3F8FC] dark:bg-app-dark-gradient">
  <div className="max-w-7xl mx-auto px-6">
    <div className="text-center mb-8">
      <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-500/10 px-4 py-2 text-sm font-semibold text-primary-700 dark:text-primary-300">
        <div className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-300 animate-pulse" />
        Choose Your Path
      </span>
      <h2 className="mt-4 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
        Explore Our{" "}
        <span className="bg-gradient-to-r from-[#133B5D] to-[#F39924] bg-clip-text text-transparent">
          Career Tracks
        </span>
      </h2>
    </div>
    <div className="grid md:grid-cols-3 gap-6">
      <CardFlip
        title="Frontend"
        subtitle="Master Modern Web Development"
        description="Build beautiful, responsive interfaces with React, Next.js, and modern CSS frameworks."
        features={[
          "React & Next.js",
          "TypeScript Mastery",
          "Responsive Design",
          "State Management",
          "API Integration",
        ]}
        icon={FaCode}
      />
      <CardFlip
        title="Backend"
        subtitle="Build Scalable Systems"
        description="Design robust APIs, manage databases, and deploy cloud-native server applications at scale."
        features={[
          "Node.js & Express",
          "REST & GraphQL APIs",
          "Database Design",
          "Authentication",
          "Cloud Deployment",
        ]}
        icon={FaServer}
      />
      <CardFlip
        title="AI"
        subtitle="Shape the Future"
        description="Master machine learning, deep learning, and build intelligent applications that solve real problems."
        features={[
          "Python & ML",
          "Neural Networks",
          "NLP & Computer Vision",
          "TensorFlow & PyTorch",
          "AI Deployment",
        ]}
        icon={FaBrain}
      />
    </div>
  </div>
</section>

              <AnimatedSection>
                <LearningPaths />
              </AnimatedSection>
              <AnimatedSection>
                <Stats />
              </AnimatedSection>
            
              <AnimatedSection>
                <Testimonials />
              </AnimatedSection>
              <AnimatedSection>
                <Newsletter />
              </AnimatedSection>
              <AnimatedSection>
                <CTA onOpenEnquiry={handleOpenEnquiry} />
              </AnimatedSection>
            </Suspense>
          )}
        </main>

        {loadRest && (
          <Suspense fallback={null}>
            <Footer compact />
          </Suspense>
        )}
      </div>

      {loadWidgets && (
        <Suspense fallback={null}>
          <EnquiryWidget isOpen={isEnquiryOpen} onClose={handleCloseEnquiry} />

          {/* ─── Get In Touch modal (self-contained: own backdrop/portal/scroll-lock) ── */}
          <GetInTouchModal
            isOpen={showGetInTouch}
            onClose={handleGetInTouchAdvance}
            onSubmitted={handleGetInTouchAdvance}
          />

          {/* ─── Intro Video: floating card, bottom-left, autoplay muted ── */}
          <AnimatePresence>
            {showIntroVideo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="fixed bottom-6 left-6 z-[9998] w-[190px] sm:w-[250px] md:w-[300px]"
                style={{ maxWidth: "calc(100vw - 32px)" }}
              >
                <VideoIntro variant="floating" onSkip={handleVideoClose} />
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      )}
      
    </>
  );
}

export default Home;