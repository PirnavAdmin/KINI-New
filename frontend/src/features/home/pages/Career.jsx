import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import {
  FaBriefcase,
  FaFileAlt,
  FaUserTie,
  FaRocket,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";

function Career() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-in-out-cubic",
      offset: 80,
      delay: 50,
      mirror: false,
      debounceDelay: 50,
      throttleDelay: 99,
    });

    window.addEventListener("load", AOS.refresh);

    return () => {
      window.removeEventListener("load", AOS.refresh);
    };
  }, []);

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
        <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/20 blur-3xl rounded-full"></div>

        <div className="relative max-w-7xl mx-auto px-5 py-24 text-center">
          <span
            data-aos="fade-down"
            className="inline-flex items-center px-5 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-xl mb-6"
          >
            🚀 Career Acceleration Program
          </span>

          <h1
            data-aos="zoom-in"
            data-aos-delay="200"
            className="text-5xl md:text-7xl font-extrabold mb-6"
          >
            Build Your
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Dream Career
            </span>
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="300"
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Get placement assistance, mock interviews, resume reviews, and
            industry mentorship to land your dream job.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: "5000+", label: "Students Placed" },
              { value: "300+", label: "Hiring Partners" },
              { value: "92%", label: "Placement Rate" },
              { value: "18 LPA", label: "Highest Package" },
            ].map((item, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 150}
                className="bg-slate-50 rounded-3xl p-8 text-center shadow-sm hover:shadow-xl transition"
              >
                <h2 className="text-5xl font-extrabold text-blue-600 mb-3">
                  {item.value}
                </h2>
                <p className="text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <p
              data-aos="fade-up"
              className="text-blue-600 uppercase tracking-[4px] font-semibold mb-3"
            >
              Career Services
            </p>
            <h2 data-aos="zoom-in" className="text-5xl font-extrabold">
              Everything You Need
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaFileAlt />,
                title: "Resume Review",
                desc: "ATS-friendly resume optimization.",
              },
              {
                icon: <FaUserTie />,
                title: "Mock Interviews",
                desc: "Practice with industry experts.",
              },
              {
                icon: <FaBriefcase />,
                title: "Job Referrals",
                desc: "Direct hiring opportunities.",
              },
              {
                icon: <FaRocket />,
                title: "Career Coaching",
                desc: "Personalized growth roadmap.",
              },
            ].map((item, index) => (
              <div
                key={index}
                data-aos="zoom-in-up"
                data-aos-delay={index * 120}
                className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition duration-500"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-6">
                  {item.icon}
                </div>

                <h3 className="text-2xl font-bold mb-3">
                  {item.title}
                </h3>

                <p className="text-gray-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 data-aos="fade-up" className="text-5xl font-extrabold mb-4">
              Placement Journey
            </h2>
            <p data-aos="fade-up" data-aos-delay="150" className="text-gray-500">
              A structured path to your dream job
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              "Enroll in Program",
              "Build Portfolio",
              "Mock Interviews",
              "Get Placed",
            ].map((step, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 200}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-center text-2xl font-bold mb-5">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold">
                  {step}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-5">
          <div className="bg-white rounded-3xl p-10 shadow-xl">
            <h2
              data-aos="zoom-in"
              className="text-4xl font-extrabold mb-8 text-center"
            >
              Why Choose Us?
            </h2>

            <div className="space-y-5">
              {[
                "1:1 Career Mentorship",
                "Resume & LinkedIn Optimization",
                "Unlimited Mock Interviews",
                "Dedicated Placement Support",
                "Access to Hiring Partners",
              ].map((item, index) => (
                <div
                  key={index}
                  data-aos="fade-right"
                  data-aos-delay={index * 100}
                  className="flex items-center gap-4"
                >
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <span className="text-lg">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20 text-white">
        <div className="max-w-4xl mx-auto text-center px-5">
          <h2 data-aos="zoom-in" className="text-5xl font-extrabold mb-6">
            Ready To Launch Your Career?
          </h2>

          <p
            data-aos="fade-up"
            data-aos-delay="150"
            className="text-xl mb-8 text-blue-100"
          >
            Join thousands of learners who transformed their careers.
          </p>

          <button
            data-aos="zoom-in-up"
            data-aos-delay="300"
            className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition"
          >
            Apply Now <FaArrowRight className="inline ml-2" />
          </button>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Career;