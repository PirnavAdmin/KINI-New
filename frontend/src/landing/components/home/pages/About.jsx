import { Suspense, lazy } from "react";

import Navbar from "@landing-shared/components/navbar";
import Seo from "@landing-shared/components/Seo";

import Hero from "../components/about/Hero.jsx";
import OurApproach from "../components/about/OurApproach.jsx";
import LearnersCompanies from "../components/about/LearnersCompanies.jsx";
import LearningEcosystem from "../components/about/LearningEcosystem.jsx";
import BuiltAroundCareer from "../components/about/BuiltAroundCareer.jsx";
import StudentJourney from "../components/about/StudentJourney.jsx";
import CTASection from "../components/about/CTASection.jsx";

const Footer = lazy(() => import("@landing-shared/components/Footer"));

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About Us"
        description="Kini Edx Hub bridges the gap between education and industry with practical, project-based technology training, expert mentorship and career guidance."
        path="/about"
      />
      <Navbar />
      <main className="overflow-x-hidden bg-gradient-to-b from-primary-50/50 via-white to-secondary-50/30 dark:bg-none">
        <Hero />
        <OurApproach />
        <LearnersCompanies />
        <LearningEcosystem />
        <BuiltAroundCareer />
        <StudentJourney />
        <CTASection />
      </main>
      <Suspense fallback={null}>
        <Footer compact />
      </Suspense>
    </>
  );
}
