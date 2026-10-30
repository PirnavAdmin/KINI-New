import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaNodeJs, FaDatabase, FaReact } from "react-icons/fa";
import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";
import MernHero from "./MernHero";
import MernCourses from "./MernCourses";
import MernProjects from "./MernProjects";
import MernPlacements from "./MernPlacements";
import MernCurriculum from "./MernCurriculum";
import StudentReviews from "./StudentReviews";
import FAQs from "./FAQs";

const MernMain = () => {
  const [open, setOpen] = useState(null);

  return (
    <>
    <Navbar />
    <MernHero/>
    <MernCourses/>
    <MernCourses/>
    <MernProjects/>
    <MernPlacements/>
    <MernCurriculum/>
    <StudentReviews/>
    <FAQs/>



   
    <Footer />
        </> 
  );
};

export default MernMain;