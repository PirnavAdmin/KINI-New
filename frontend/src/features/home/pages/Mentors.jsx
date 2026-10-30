import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";

import mentorsData from "@shared/data/mentorsData";

import {
  FaStar,
  FaUsers,
  FaArrowRight,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";

import { motion } from "framer-motion";

import AOS from "aos";
import "aos/dist/aos.css";

import { useEffect } from "react";

function Mentors() {

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

        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full"></div>

        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full"></div>

        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

        <div
          data-aos="zoom-in"
          className="relative max-w-7xl mx-auto px-5 py-24 md:py-32 text-center"
        >

          {/* Badge */}
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-xl px-6 py-3 rounded-full mb-8 shadow-lg">

            <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>

            <p className="text-sm md:text-base font-medium tracking-wide">

              100+ Expert Mentors Available

            </p>

          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-8">

            Learn From

            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 animate-gradient">

              Industry Experts

            </span>

          </h1>

          {/* Description */}
          <p className="text-base md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">

            Connect with world-class mentors from Google,
            Microsoft, Amazon, OpenAI, and other top tech
            companies to accelerate your development career.

          </p>

        </div>

      </section>

      {/* ================= MENTORS SECTION ================= */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-28">

        <div className="max-w-7xl mx-auto px-5">

          {/* ================= SECTION TITLE ================= */}
          <div
            data-aos="fade-up"
            className="text-center mb-20"
          >

            <p className="text-blue-600 font-semibold uppercase tracking-[5px] mb-4">

              Top Mentors

            </p>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">

              Meet Our Professional Team

            </h2>

            <div className="w-32 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-full mx-auto"></div>

          </div>

          {/* ================= CARDS ================= */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

            {mentorsData.map((mentor, index) => (

              <motion.div
                key={mentor.id}
                data-aos="zoom-in-up"
                data-aos-delay={index * 100}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -15 }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
                className="group relative bg-white/90 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_80px_rgba(59,130,246,0.18)] transition-all duration-700"
              >

                {/* Gradient Top Border */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600"></div>

                {/* ================= IMAGE ================= */}
                <div className="relative overflow-hidden">

                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    className="h-80 w-full object-cover group-hover:scale-125 transition duration-[2000ms] ease-out"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition duration-700"></div>

                  {/* Rating */}
                  <div className="absolute top-5 right-5 flex items-center gap-1 bg-yellow-400 text-black px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">

                    <FaStar className="text-xs" />

                    {mentor.rating}

                  </div>

                  {/* Company */}
                  <div className="absolute bottom-5 left-5 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full shadow-lg">

                    <p className="text-sm font-semibold text-white">

                      {mentor.company}

                    </p>

                  </div>

                </div>

                {/* ================= CONTENT ================= */}
                <div className="p-7">

                  {/* Name */}
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-blue-600 transition duration-300">

                    {mentor.name}

                  </h2>

                  {/* Role */}
                  <p className="text-gray-500 leading-relaxed mb-6 min-h-[60px]">

                    {mentor.title}

                  </p>

                  {/* Students */}
                  <div className="flex items-center justify-between mb-7">

                    <div className="flex items-center gap-2 text-gray-500">

                      <FaUsers className="text-blue-500" />

                      <span className="font-medium">

                        {mentor.students}+ Students

                      </span>

                    </div>

                    {/* Social Icons */}
                    <div className="flex items-center gap-3">

                      <button className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110">

                        <FaLinkedin />

                      </button>

                      <button className="w-10 h-10 rounded-full bg-slate-100 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110">

                        <FaTwitter />

                      </button>

                    </div>

                  </div>

                  {/* Button */}
                  <button className="group/btn w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-blue-700 text-white py-4 rounded-2xl font-bold shadow-[0_15px_40px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition-all duration-500">

                    View Profile

                    <FaArrowRight className="text-sm group-hover/btn:translate-x-1 transition duration-300" />

                  </button>

                </div>

              </motion.div>

            ))}

          </div>

        </div>

      </section>

      <Footer />
    </>
  );
}

export default Mentors;