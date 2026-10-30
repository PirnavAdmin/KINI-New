import { Suspense, lazy } from "react";
import { MotionConfig } from "framer-motion";
import "@fontsource/sora/600.css";

import Navbar from "@shared/components/Navbar";
import WhatsAppButton from "@shared/components/WhatsAppButton";
import LandingHero from "../components/landing/LandingHero";
import CapabilityStrip from "../components/landing/CapabilityStrip";

// Below-the-fold sections load as separate chunks so the hero paints first.
const FeaturedCourses = lazy(() => import("../components/FeaturedCourses"));
const LearningExperience = lazy(() => import("../components/landing/LearningExperience"));
const PortalShowcase = lazy(() => import("../components/landing/PortalShowcase"));
const PlatformRoles = lazy(() => import("../components/landing/PlatformRoles"));
const LearningJourney = lazy(() => import("../components/landing/LearningJourney"));
const CareerTools = lazy(() => import("../components/landing/CareerTools"));
const LandingFAQ = lazy(() => import("../components/landing/LandingFAQ"));
const FinalCTA = lazy(() => import("../components/landing/FinalCTA"));
const Footer = lazy(() => import("@shared/components/Footer"));

function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <Navbar />
      <main id="main-content" className="overflow-x-clip bg-white text-[#17324a]">
        <LandingHero />
        <CapabilityStrip />
        <Suspense fallback={<div className="min-h-[60vh] bg-white" aria-hidden="true" />}>
          <FeaturedCourses />
          <LearningExperience />
          <PortalShowcase />
          <LearningJourney />
          <PlatformRoles />
          <CareerTools />
          <LandingFAQ />
          <FinalCTA />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <WhatsAppButton />
    </MotionConfig>
  );
}

export default Home;
