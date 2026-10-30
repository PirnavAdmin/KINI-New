import React from "react";

import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";

import AiCourse from "./AiCourse";
import AiMentors from "./AiMentors";
import AiCurriculum from "./AiCurriculum";
import AiFaq from "./AiFaq";
import AiPlacements from "./AiPlacements";
import AiProjects from "./AiProjects";
import AiHero from "./AiHero";

const AiMain = () => {
  return (
    <>
      <Navbar />
      <AiHero/>

      <AiCourse />
      <AiMentors />
      <AiProjects/>
      <AiCurriculum />
      <AiPlacements/>
      <AiFaq />

      <Footer />
    </>
  );
};

export default AiMain;