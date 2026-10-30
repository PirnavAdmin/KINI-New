import { useNavigate } from "react-router-dom";
import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";

import {
  FaPlayCircle,
  FaClock,
  FaUsers,
  FaStar,
  FaCheckCircle,
} from "react-icons/fa";

import AOS from "aos";
import "aos/dist/aos.css";

import { useEffect } from "react";

function WatchCourse() {
  const navigate = useNavigate();
  const handleEnroll = () => navigate("/enrollment");

  // ================= AOS =================
  useEffect(() => {

    AOS.init({
      duration: 1200,
      once: true,
      easing: "ease-in-out",
      offset: 80,
    });

  }, []);

  return (
    <>


      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">

        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/20 blur-3xl rounded-full"></div>

        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/20 blur-3xl rounded-full"></div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[70vh]">

            {/* ================= LEFT CONTENT ================= */}
            <div
              data-aos="fade-right"
            >

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2 rounded-full mb-6">

                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>

                <p className="text-sm font-medium tracking-wide">

                  Live Learning Experience

                </p>

              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
                Become a
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  React Developer
                </span>
              </h1>

              {/* Description */}
              <p className="max-w-lg text-base md:text-lg text-slate-100 leading-relaxed mb-4">

                Master React JS with real-world projects,
                modern frontend architecture, Tailwind CSS,
                routing, APIs, authentication, and deployment.

              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[
                  { icon: <FaStar />, value: "4.9", label: "Rating" },
                  { icon: <FaUsers />, value: "12K+", label: "Students" },
                  { icon: <FaClock />, value: "40H", label: "Content" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="
bg-white/5
backdrop-blur-xl
border border-white/10
rounded-2xl
p-4
text-center
hover:bg-white/10
hover:-translate-y-1
transition-all
duration-300
"
                  >
                    <div className="text-yellow-400 text-2xl flex justify-center mb-2">
                      {item.icon}
                    </div>
                  <h3 className="text-lg font-bold">{item.value}</h3>
                    <p className="text-sm text-gray-300">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Button */}
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-blue-600 hover:to-indigo-700 px-6 py-3 rounded-xl font-semibold text-base shadow-[0_10px_30px_rgba(59,130,246,0.25)] hover:scale-105 transition-all duration-300">
                Start Learning
              </button>
            </div>

            {/* ================= VIDEO CARD ================= */}
            <div
              data-aos="fade-left"
              data-aos-delay="300"
              className="relative"
            >

              {/* Floating Card */}
              <div className="absolute -top-6 -left-6 bg-white text-gray-900 p-5 rounded-3xl shadow-2xl hidden md:block z-20">

                <p className="text-3xl font-extrabold text-blue-600 mb-1">

                  24+

                </p>

                <p className="text-gray-500">
                  Premium Lessons
                </p>

              </div>

              {/* Video Container */}
              <div className="relative rounded-[32px] overflow-hidden border border-white/10 shadow-[0_20px_100px_rgba(0,0,0,0.5)] bg-black">

                {/* Top Gradient */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 z-20"></div>

                {/* Video */}
                <div className="relative rounded-[32px] overflow-hidden border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.5)]">

                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/pN6jk0uUrD8"
                      title="React Course"
                      allowFullScreen
                    />
                  </div>

                </div>

              </div>

              {/* Bottom Floating Card */}
              <div className="absolute -bottom-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-3xl shadow-2xl hidden md:block">

                <div className="flex items-center gap-3">

                  <FaPlayCircle className="text-cyan-400 text-2xl" />

                  <div>

                    <p className="text-white font-bold">
                      Hands-on Projects
                    </p>

                    <p className="text-sm text-gray-300">
                      Real-world learning
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= COURSE CONTENT ================= */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">

        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-3 gap-10">

          {/* ================= LEFT CONTENT ================= */}
          <div className="lg:col-span-2 space-y-8">

            {/* Overview */}
            <div
              data-aos="fade-up"
              className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-md hover:shadow-xl transition duration-300"
            >

              <h2 className="text-3xl font-extrabold text-gray-900 mb-6">

                Course Overview

              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">

                This professional React JS course helps you build
                modern web applications using components, hooks,
                Tailwind CSS, APIs, routing, authentication,
                Firebase, and deployment.

              </p>

            </div>

            {/* What You Learn */}
            <div
              data-aos="fade-up"
              data-aos-delay="200"
              className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-md hover:shadow-xl transition duration-300"
            >

              <h2 className="text-3xl font-extrabold text-gray-900 mb-8">

                What You'll Learn

              </h2>

              <div className="grid md:grid-cols-2 gap-5">

                {[
                  "React Fundamentals",
                  "Hooks & State Management",
                  "Tailwind CSS",
                  "Firebase Authentication",
                  "API Integration",
                  "Deployment & Hosting",
                ].map((item, index) => (

                  <div
                    key={index}
                    className="flex items-center gap-3 bg-slate-50 hover:bg-blue-50 p-5 rounded-2xl transition duration-300"
                  >

                    <FaCheckCircle className="text-green-500 text-xl" />

                    <span className="font-medium text-gray-700">

                      {item}

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* ================= SIDEBAR ================= */}
          <div
            data-aos="fade-left"
            data-aos-delay="300"
          >

            <div className="sticky top-28 bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl">

              <h2 className="text-4xl font-extrabold text-blue-600 mb-6">

                $99

              </h2>

              {/* Buttons */}
              <button
                onClick={handleEnroll}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white py-4 rounded-2xl font-bold shadow-[0_20px_60px_rgba(59,130,246,0.25)] hover:scale-[1.02] transition-all duration-300 mb-5"
              >

                Enroll Now

              </button>

              <button className="w-full border border-slate-200 hover:bg-slate-50 py-4 rounded-2xl font-bold text-gray-700 transition duration-300">

                Add To Wishlist

              </button>

              {/* Details */}
              <div className="space-y-5 text-gray-600 mt-8">

                <div className="flex items-center justify-between">

                  <span>Lessons</span>
                  <span className="font-semibold">24</span>

                </div>

                <div className="flex items-center justify-between">

                  <span>Duration</span>
                  <span className="font-semibold">40 Hours</span>

                </div>

                <div className="flex items-center justify-between">

                  <span>Level</span>
                  <span className="font-semibold">Beginner</span>

                </div>

                <div className="flex items-center justify-between">

                  <span>Certificate</span>
                  <span className="font-semibold">Yes</span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


    </>
  );
}

export default WatchCourse;