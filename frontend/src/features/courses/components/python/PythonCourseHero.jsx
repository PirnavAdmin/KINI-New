import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPython,
  FaPlay,
  FaDownload,
  FaUsers,
  FaStar,
} from "react-icons/fa";
import PythonCareerRoles from "./PythonCareerRoles";
import Navbar from "@shared/components/Navbar";
import PythonMentors from "./PythonMentors";
import Pythonprojects from "./Pythonprojects";
import PythonCurriculum from "./PythonCurriculum";
import PythonTestimonials from "./PythonTestimonials";
import PythonFAQ from "./PythonFAQ";
import Footer from "@shared/components/Footer";
import PlacementPartners from "./PlacementPartners";


const PythonCourseHero = () => {
  const navigate = useNavigate();
  const handleEnroll = () => navigate("/enrollment");

  return (
    <>
   <Navbar />
    <section className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4"
          alt="Python Course"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-blue-950/80" />
      </div>

      {/* Glow Effects */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-500/20 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center min-h-screen py-24">
          {/* LEFT CONTENT */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg border border-white/20 px-5 py-2 rounded-full mb-8">
              <FaUsers className="text-yellow-400" />
              <span className="text-sm tracking-wider">
                5,000+ Students Enrolled
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold leading-tight">
              Become a
              <span className="block mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Python Developer
              </span>
              <span className="block">
                in <span className="text-blue-400">6 Months</span>
              </span>
            </h1>

            {/* Description */}
            <p className="mt-8 text-lg text-slate-300 leading-relaxed max-w-2xl">
              Learn Python from fundamentals to advanced concepts including
              OOP, APIs, Django, Flask, SQL, Data Structures, and real-world
              projects. Get job-ready with live mentorship and career support.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-10">
              <div>
                <h3 className="text-3xl font-bold text-yellow-400">100+</h3>
                <p className="text-slate-400">Coding Exercises</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-blue-400">15+</h3>
                <p className="text-slate-400">Real Projects</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-green-400">95%</h3>
                <p className="text-slate-400">Placement Support</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-5 mt-10">
              <button
                onClick={handleEnroll}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition-all duration-300 font-semibold shadow-xl"
              >
                Enroll Now
              </button>

              <button className="px-8 py-4 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300 flex items-center gap-3">
                <FaDownload />
                Download Syllabus
              </button>
            </div>
          </div>

          {/* RIGHT VIDEO CARD */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1526379095098-d400fd0bf935"
                alt="Python Course"
                className="w-full h-[500px] object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Play Button */}
              <div className="absolute inset-0 flex justify-center items-center">
                <button className="w-24 h-24 rounded-full bg-red-600 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-2xl">
                  <FaPlay className="text-3xl ml-1" />
                </button>
              </div>

              {/* Course Info */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <FaPython className="text-yellow-400 text-3xl" />
                  <h3 className="text-2xl font-bold">
                    Python Full Stack Program
                  </h3>
                </div>

                <p className="text-slate-300">
                  Master Python, Django, APIs, SQL & Full Stack Development.
                </p>

                <div className="flex items-center gap-4 mt-5">
                  <FaStar className="text-yellow-400" />
                  <span>4.9 Rating</span>

                  <span className="w-1 h-1 rounded-full bg-white" />

                  <span>6 Months</span>

                  <span className="w-1 h-1 rounded-full bg-white" />

                  <span>Live Classes</span>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-8 -left-8 bg-white text-slate-900 rounded-2xl p-4 shadow-2xl">
              <h4 className="font-bold text-lg">₹5 LPA+</h4>
              <p className="text-sm text-slate-600">
                Average Salary Package
              </p>
            </div>

            <div className="absolute -bottom-8 -right-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 shadow-2xl">
              <h4 className="font-bold text-lg">Job Ready</h4>
              <p className="text-sm text-blue-100">
                Industry Curriculum
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 border-t border-slate-700/50" />
      <div className="absolute inset-0 border-b border-slate-700/50" />
      <div className="absolute inset-0 border-l border-slate-700/50" />
      
      <PythonCareerRoles/>
      <Pythonprojects/>
      <PythonCurriculum/>
      <PythonTestimonials/>
      <PythonFAQ/>
      <Footer/>
    </section>
    </>
  );

};

export default PythonCourseHero;