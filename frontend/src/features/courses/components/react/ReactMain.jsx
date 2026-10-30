import React from "react";

import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";

import ReactHeroSection from "./ReactHeroSection.jsx";

import ReactMentors from "./ReactMentors";
import ReactProjectsSection from "./ReactProjectsSection";
import ReactCurriculumSection from "./ReactCurriculumSection";
import ReactFAQ from "./ReactFAQ";

const ReactMain = () => {
  return (
    <div className="bg-[#030712] min-h-screen">
      <Navbar />
      <main>
        <ReactHeroSection />
        <ReactCourse />
        <ReactMentors />
        <ReactProjectsSection />
        <ReactCurriculumSection />
        <ReactFAQ />
      </main>
      <Footer />
    </div>
  );
};

export default ReactMain;