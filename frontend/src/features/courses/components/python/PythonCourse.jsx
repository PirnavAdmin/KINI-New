import React from "react";
import { useNavigate } from "react-router-dom";

import PythonHero from "../components/python/PythonHero";
import PythonCareerRoles from "../components/python/PythonCareerRoles";

// Future Sections
// import PythonMentors from "../components/python/PythonMentors";
// import CurriculumSection from "../components/python/CurriculumSection";
// import PlacementPartners from "../components/python/PlacementPartners";
// import FAQ from "../components/python/FAQ";

const PythonCourse = () => {
  const navigate = useNavigate();
  const handleEnroll = () => navigate("/enrollment");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">

      {/* ================= Background Effects ================= */}

      {/* Grid Pattern */}
      <div
        className="
          fixed inset-0
          bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),
          linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]
          bg-[size:60px_60px]
          pointer-events-none
          opacity-40
        "
      />

      {/* Top Left Glow */}
      <div
        className="
          fixed
          -top-40
          -left-40
          w-[600px]
          h-[600px]
          bg-cyan-500/15
          rounded-full
          blur-[180px]
          pointer-events-none
        "
      />

      {/* Top Right Glow */}
      <div
        className="
          fixed
          top-0
          right-0
          w-[500px]
          h-[500px]
          bg-blue-500/10
          rounded-full
          blur-[180px]
          pointer-events-none
        "
      />

      {/* Center Glow */}
      <div
        className="
          fixed
          top-1/2
          left-1/2
          -translate-x-1/2
          -translate-y-1/2
          w-[700px]
          h-[700px]
          bg-purple-500/10
          rounded-full
          blur-[220px]
          pointer-events-none
        "
      />

      {/* Bottom Glow */}
      <div
        className="
          fixed
          bottom-0
          left-1/2
          -translate-x-1/2
          w-[800px]
          h-[400px]
          bg-cyan-500/10
          rounded-full
          blur-[200px]
          pointer-events-none
        "
      />

      {/* ================= Page Content ================= */}

      <div className="relative z-10">

        {/* Hero */}
        <section className="relative">
          <PythonHero />
        </section>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Career Roles */}
        <section className="relative py-12">
          <PythonCareerRoles />
        </section>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Future Sections */}

        {/*
        <section className="relative py-12">
          <CurriculumSection />
        </section>

        <div className="max-w-7xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <section className="relative py-12">
          <PythonMentors />
        </section>

        <div className="max-w-7xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <section className="relative py-12">
          <PlacementPartners />
        </section>

        <div className="max-w-7xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <section className="relative py-12">
          <FAQ />
        </section>
        */}

        {/* Bottom CTA */}
        <section className="relative py-24 px-6">
          <div
            className="
              max-w-5xl
              mx-auto
              rounded-[40px]
              border
              border-white/10
              bg-white/[0.04]
              backdrop-blur-2xl
              p-10
              md:p-16
              text-center
              shadow-[0_20px_80px_rgba(0,0,0,0.4)]
            "
          >
            <span
              className="
                inline-flex
                items-center
                px-4
                py-2
                rounded-full
                bg-cyan-500/10
                border
                border-cyan-500/20
                text-cyan-300
                text-sm
              "
            >
              🚀 Start Your Career Journey
            </span>

            <h2 className="mt-6 text-4xl md:text-6xl font-bold">
              Become a
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Python Developer
              </span>
            </h2>

            <p className="mt-6 text-slate-400 max-w-2xl mx-auto text-lg">
              Learn Python, Backend Development, APIs, Databases,
              Machine Learning, and build industry-ready projects
              with mentorship and placement assistance.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-5 mt-10">
              <button
                onClick={handleEnroll}
                className="
                  px-8
                  py-4
                  rounded-2xl
                  font-semibold
                  text-white
                  bg-gradient-to-r
                  from-cyan-500
                  via-blue-500
                  to-purple-600
                  shadow-[0_20px_60px_rgba(59,130,246,0.4)]
                  hover:scale-105
                  transition-all
                  duration-300
                "
              >
                Enroll Now →
              </button>

              <button
                className="
                  px-8
                  py-4
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  backdrop-blur-xl
                  hover:bg-white/[0.08]
                  transition
                "
              >
                Download Syllabus
              </button>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
};

export default PythonCourse;