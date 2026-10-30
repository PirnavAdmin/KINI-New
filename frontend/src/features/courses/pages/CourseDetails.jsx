import { useParams, Link, useNavigate } from "react-router-dom";

import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";

import coursesData from "@shared/data/coursesData";

import {
  FaStar,
  FaUsers,
  FaClock,
  FaPlayCircle,
  FaCheckCircle,
  FaArrowLeft,
} from "react-icons/fa";

import AOS from "aos";
import "aos/dist/aos.css";

import { useEffect } from "react";

// ─────────────────────────────────────────────────────────
//  Fallback component shown when no course matches the URL
// ─────────────────────────────────────────────────────────
function CourseNotFound() {
  return (
    <>
      <Navbar />
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-5">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
            Course Not Found
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            We couldn't find a course matching that ID. It may have been
            removed or the link might be incorrect.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <FaArrowLeft />
            Browse All Courses
          </Link>
        </div>
      </section>
      <Footer />
    </>
  );
}

// ─────────────────────────────────────────────────────────
//  Main CourseDetails component
// ─────────────────────────────────────────────────────────
function CourseDetails() {
  const { id } = useParams();
  const courseId = Number(id);
  const course = coursesData.find((item) => item.id === courseId);

  const navigate = useNavigate();
  const handleEnroll = () => navigate("/enrollment");

  // ── AOS initialisation (runs once regardless) ──
  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
      easing: "ease-in-out",
      offset: 80,
    });
  }, []);

  // ═══════════════════════════════════════════════
  //  🛡️  GUARD CLAUSE — crashes the error before
  //      any JSX that accesses `course.*` properties
  // ═══════════════════════════════════════════════
  if (!course) {
    return <CourseNotFound />;
  }

  // ── Past this point `course` is guaranteed defined ──

  return (
    <>
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
        <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/20 blur-3xl rounded-full" />

        <div className="relative max-w-7xl mx-auto px-5 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
          {/* ----- LEFT ----- */}
          <div data-aos="fade-right">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-xl px-5 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-sm font-medium tracking-wide">Premium Course</p>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              {course.title}
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              Learn modern technologies with real-world projects,
              hands-on practice, and industry-level mentorship to
              become a professional developer.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-3 rounded-2xl">
                <FaStar className="text-yellow-400" />
                <span>4.9 Rating</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-3 rounded-2xl">
                <FaUsers />
                <span>{course.students}+ Students</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-3 rounded-2xl">
                <FaClock />
                <span>40 Hours</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-5">
              <button
                onClick={handleEnroll}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-blue-600 hover:to-indigo-700 px-8 py-4 rounded-2xl font-bold shadow-[0_20px_60px_rgba(59,130,246,0.3)] hover:scale-105 transition-all duration-300"
              >
                Enroll Now
              </button>
              <button className="flex items-center gap-3 border border-white/20 bg-white/10 backdrop-blur-xl hover:bg-white/20 px-8 py-4 rounded-2xl font-semibold transition duration-300">
                <FaPlayCircle />
                Watch Preview
              </button>
            </div>
          </div>

          {/* ----- RIGHT IMAGE ----- */}
          <div data-aos="fade-left" data-aos-delay="300" className="relative">
            <div className="absolute -top-6 -left-6 bg-white text-gray-900 p-5 rounded-3xl shadow-2xl z-20 hidden md:block">
              <p className="text-3xl font-extrabold text-blue-600 mb-1">24+</p>
              <p className="text-gray-500">Interactive Lessons</p>
            </div>

            <img
              src={course.image}
              alt={course.title}
              className="rounded-[36px] shadow-[0_20px_100px_rgba(0,0,0,0.5)] hover:scale-[1.02] transition duration-500"
            />

            <div className="absolute -bottom-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-3xl shadow-2xl hidden md:block">
              <p className="text-white font-bold text-xl mb-1">100% Practical</p>
              <p className="text-gray-300 text-sm">Real-world project based learning</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-3 gap-10">
          {/* ----- LEFT CONTENT ----- */}
          <div className="lg:col-span-2 space-y-8">
            <div data-aos="fade-up" className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-md hover:shadow-xl transition duration-300">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Course Overview</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                This course is designed to help you become an
                industry-ready frontend and full stack developer
                using React JS, Tailwind CSS, APIs, Authentication,
                Routing, Firebase, and Deployment.
              </p>
            </div>

            <div data-aos="fade-up" data-aos-delay="200" className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-md hover:shadow-xl transition duration-300">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8">What You'll Learn</h2>
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  "React Fundamentals",
                  "Tailwind CSS",
                  "Firebase Authentication",
                  "API Integration",
                  "Routing & Navigation",
                  "Deployment & Hosting",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-slate-50 hover:bg-blue-50 p-5 rounded-2xl transition duration-300"
                  >
                    <FaCheckCircle className="text-green-500 text-xl" />
                    <span className="font-medium text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ----- SIDEBAR ----- */}
          <div data-aos="fade-left" data-aos-delay="300">
            <div className="sticky top-28 bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl">
              <img src={course.image} alt={course.title} className="rounded-3xl mb-6" />

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-5xl font-extrabold text-blue-600">$99</h2>
                <div className="bg-green-100 text-green-600 px-4 py-2 rounded-full font-semibold">20% OFF</div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white py-4 rounded-2xl font-bold shadow-[0_20px_60px_rgba(59,130,246,0.25)] hover:scale-[1.02] transition-all duration-300 mb-8">
                Start Learning
              </button>

              <div className="space-y-5 text-gray-600">
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

      <Footer />
    </>
  );
}

export default CourseDetails;
