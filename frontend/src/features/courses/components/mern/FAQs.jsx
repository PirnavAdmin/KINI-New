import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaQuestionCircle,
} from "react-icons/fa";

const FAQs = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [category, setCategory] = useState("All");

  const faqData = [
    {
      category: "MERN",
      question: "Do I need coding experience to learn MERN?",
      answer:
        "No. The program starts from fundamentals and gradually progresses to advanced MERN concepts."
    },
    {
      category: "MERN",
      question: "How long is the MERN course?",
      answer:
        "The complete curriculum takes around 12–16 weeks depending on your learning pace."
    },
    {
      category: "Projects",
      question: "How many projects will I build?",
      answer:
        "You will build 15+ industry-grade projects including eCommerce, LMS, Social Media, and Admin Dashboards."
    },
    {
      category: "Projects",
      question: "Will projects be deployed live?",
      answer:
        "Yes. You will deploy projects using Vercel, Netlify, Render and cloud platforms."
    },
    {
      category: "Placements",
      question: "Do you provide placement assistance?",
      answer:
        "Yes. We provide resume reviews, mock interviews, referrals, and career guidance."
    },
    {
      category: "Placements",
      question: "What is the average package?",
      answer:
        "Students have secured packages ranging from ₹6 LPA to ₹24+ LPA."
    },
  ];

  const filteredFaqs =
    category === "All"
      ? faqData
      : faqData.filter((faq) => faq.category === category);

  return (
    <section className="min-h-screen bg-[#020b14] text-white py-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="px-5 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
            Frequently Asked Questions
          </span>

          <h1 className="mt-8 text-5xl md:text-7xl font-bold">
            MERN Stack
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Help Center
            </span>
          </h1>

          <p className="text-gray-400 text-lg max-w-3xl mx-auto mt-6">
            Find answers about MERN training, projects,
            mentorship, and placement opportunities.
          </p>
        </motion.div>

        {/* Mentor Avatars */}
        <div className="flex justify-center -space-x-4 mt-10">
          {[11, 22, 33, 44, 55].map((img) => (
            <img
              key={img}
              src={`https://i.pravatar.cc/150?img=${img}`}
              alt=""
              className="w-14 h-14 rounded-full border-2 border-[#020b14]"
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          {[
            ["100+", "FAQs"],
            ["24/7", "Support"],
            ["15K+", "Students"],
            ["95%", "Success Rate"],
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center"
            >
              <h3 className="text-3xl font-bold text-cyan-400">
                {item[0]}
              </h3>
              <p className="text-gray-400 mt-2">
                {item[1]}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mt-16 max-w-xl mx-auto">
          <div className="relative">
            <FaSearch className="absolute left-5 top-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search questions..."
              className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex justify-center flex-wrap gap-4 mt-10">
          {["All", "MERN", "Projects", "Placements"].map(
            (item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`px-6 py-3 rounded-xl transition ${
                  category === item
                    ? "bg-cyan-500 text-white"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        {/* FAQ List */}
        <div className="mt-16 space-y-5">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              layout
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setActiveFaq(
                    activeFaq === index ? null : index
                  )
                }
                className="w-full p-6 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <FaQuestionCircle className="text-cyan-400" />
                  <div className="text-left">
                    <span className="text-cyan-400 text-sm">
                      {faq.category}
                    </span>
                    <h3 className="font-semibold">
                      {faq.question}
                    </h3>
                  </div>
                </div>

                {activeFaq === index ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </button>

              <AnimatePresence>
                {activeFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                    }}
                  >
                    <p className="px-6 pb-6 text-gray-400">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-24">
          <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-[40px] p-12 text-center">

            <h2 className="text-4xl md:text-5xl font-bold">
              Need More Help?
            </h2>

            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Talk with our mentors and get personalized
              guidance about MERN courses and placements.
            </p>

            <div className="flex flex-wrap justify-center gap-5 mt-10">
              <button
                onClick={() => navigate("/courses")}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:scale-105 transition"
              >
                Explore Courses
              </button>

              <button
                onClick={() => navigate("/projects")}
                className="px-8 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition"
              >
                View Projects
              </button>

              <button
                onClick={() => navigate("/placements")}
                className="px-8 py-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition"
              >
                Placement Stories
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FAQs;