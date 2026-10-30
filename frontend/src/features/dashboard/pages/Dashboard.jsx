import Navbar from "@shared/components/Navbar";

import {
  FaBookOpen,
  FaGraduationCap,
  FaClock,
  FaChartLine,
  FaArrowUp,
} from "react-icons/fa";

import { motion } from "framer-motion";

import AOS from "aos";
import "aos/dist/aos.css";

import { useEffect } from "react";

function Dashboard() {

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
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">

        {/* Background Blur Effects */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/20 blur-3xl rounded-full"></div>

        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/20 blur-3xl rounded-full"></div>

        <div className="relative mx-auto w-full max-w-none px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-[4.5rem]">

          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">

            {/* Left Content */}
            <div
              data-aos="fade-right"
              className="min-w-0 max-w-2xl"
            >

              <p className="text-cyan-400 uppercase tracking-[4px] font-semibold mb-4">

                Student Dashboard

              </p>

              <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">

                Welcome Back,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">

                  Narendra 👋

                </span>

              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">

                Track your learning progress, manage your courses,
                improve your coding skills, and become a professional
                developer with real-world projects.

              </p>

            </div>

            {/* Right Progress Card */}
            <div
              data-aos="fade-left"
              data-aos-delay="300"
              className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.4)] sm:p-8"
            >

              <p className="text-gray-300 mb-4 text-lg">
                Overall Progress
              </p>

              <h2 className="mb-4 text-5xl font-extrabold sm:mb-6 sm:text-6xl">
                78%
              </h2>

              <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">

                <div className="w-[78%] h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>

              </div>

              <p className="text-sm text-gray-300 mt-4">
                Keep learning to unlock achievements 🚀
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ================= DASHBOARD CONTENT ================= */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-12 sm:py-14 lg:py-16">

        <div className="mx-auto w-full max-w-none px-4 sm:px-6 lg:px-8">

          {/* ================= CARDS ================= */}
          <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Card 1 */}
            <motion.div
              data-aos="zoom-in-up"
              data-aos-delay="100"
              whileHover={{ y: -10 }}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-all duration-500 hover:shadow-[0_20px_60px_rgba(59,130,246,0.2)] sm:p-8"
            >

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-600 sm:mb-6 sm:h-16 sm:w-16">

                <FaGraduationCap />

              </div>

              <p className="text-gray-500 font-medium mb-3">
                Completed Courses
              </p>

              <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                12
              </h2>

              <div className="mt-4 flex items-center gap-2 font-semibold text-green-600 sm:mt-5">

                <FaArrowUp />

                +15% This Month

              </div>

            </motion.div>

            {/* Card 2 */}
            <motion.div
              data-aos="zoom-in-up"
              data-aos-delay="200"
              whileHover={{ y: -10 }}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-all duration-500 hover:shadow-[0_20px_60px_rgba(139,92,246,0.2)] sm:p-8"
            >

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-2xl text-purple-600 sm:mb-6 sm:h-16 sm:w-16">

                <FaBookOpen />

              </div>

              <p className="text-gray-500 font-medium mb-3">
                Active Courses
              </p>

              <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                5
              </h2>

              <div className="mt-4 font-semibold text-blue-600 sm:mt-5">

                Continue Learning

              </div>

            </motion.div>

            {/* Card 3 */}
            <motion.div
              data-aos="zoom-in-up"
              data-aos-delay="300"
              whileHover={{ y: -10 }}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-all duration-500 hover:shadow-[0_20px_60px_rgba(236,72,153,0.2)] sm:p-8"
            >

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-2xl text-pink-600 sm:mb-6 sm:h-16 sm:w-16">

                <FaClock />

              </div>

              <p className="text-gray-500 font-medium mb-3">
                Learning Hours
              </p>

              <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                120h
              </h2>

              <div className="mt-4 font-semibold text-pink-600 sm:mt-5">

                Consistent Progress

              </div>

            </motion.div>

            {/* Card 4 */}
            <motion.div
              data-aos="zoom-in-up"
              data-aos-delay="400"
              whileHover={{ y: -10 }}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-all duration-500 hover:shadow-[0_20px_60px_rgba(34,197,94,0.2)] sm:p-8"
            >

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl text-green-600 sm:mb-6 sm:h-16 sm:w-16">

                <FaChartLine />

              </div>

              <p className="text-gray-500 font-medium mb-3">
                Skill Growth
              </p>

              <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                92%
              </h2>

              <div className="mt-4 font-semibold text-green-600 sm:mt-5">

                Excellent Performance

              </div>

            </motion.div>

          </div>

          {/* ================= LEARNING SECTION ================= */}
          <div className="grid gap-4 lg:grid-cols-3">

            {/* Left Section */}
            <div
              data-aos="fade-up-right"
              className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-6 shadow-md sm:p-8"
            >

              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">

                    Continue Learning

                  </h2>

                  <p className="text-gray-500">
                    Your active learning journey
                  </p>

                </div>

                <button className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-2.5 font-semibold text-white shadow-lg transition duration-300 hover:from-indigo-700 hover:to-blue-700">

                  View All

                </button>

              </div>

              {/* Course Card */}
              <div className="flex flex-col gap-5 rounded-3xl bg-slate-50 p-5 transition duration-300 hover:shadow-lg md:flex-row">

                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"
                  alt="course"
                  className="h-44 w-full rounded-2xl object-cover md:w-64"
                />

                <div className="flex-1">

                  <p className="text-blue-600 font-semibold mb-2">
                    React JS Masterclass
                  </p>

                  <h3 className="mb-3 text-xl font-bold leading-snug text-gray-900 sm:text-2xl">

                    Build Modern Applications With React

                  </h3>

                  {/* Progress */}
                  <div>

                    <div className="flex justify-between text-sm text-gray-500 mb-2">

                      <span>Progress</span>

                      <span>70%</span>

                    </div>

                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

                      <div className="w-[70%] h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* Achievement Card */}
            <div
              data-aos="fade-up-left"
              data-aos-delay="300"
              className="flex flex-col justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-2xl sm:p-8"
            >

              <p className="mb-3 uppercase tracking-[4px] text-blue-200">

                Achievement

              </p>

              <h2 className="mb-4 text-3xl font-extrabold leading-tight sm:text-4xl">

                You're Doing Great 🚀

              </h2>

              <p className="mb-6 leading-relaxed text-blue-100">

                Complete your current courses and unlock new
                certifications to improve your career opportunities.

              </p>

              <button className="rounded-2xl bg-white px-5 py-2.5 font-bold text-blue-700 shadow-lg transition duration-300 hover:bg-gray-100">

                Explore More Courses

              </button>

            </div>

          </div>

        </div>

      </section>
    </>
  );
}

export default Dashboard;
