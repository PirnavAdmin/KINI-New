import { useState } from "react";

import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";

import {
  FaSearch,
  FaArrowRight,
  FaBookOpen,
  FaCode,
  FaLayerGroup,
} from "react-icons/fa";

const guides = [
  {
    title: "React JS Interview Guide",
    level: "Intermediate",
    questions: "100+ Questions",
    category: "React",
    tags: ["react", "hooks", "redux"],
    icon: <FaCode />,
    color: "from-cyan-500 to-blue-600",
  },
  {
    title: "Node JS Interview Guide",
    level: "Advanced",
    questions: "120+ Questions",
    category: "Node",
    tags: ["node", "express", "backend"],
    icon: <FaLayerGroup />,
    color: "from-green-500 to-emerald-600",
  },
  {
    title: "Python Interview Guide",
    level: "Beginner to Advanced",
    questions: "150+ Questions",
    category: "Python",
    tags: ["python", "django", "flask"],
    icon: <FaBookOpen />,
    color: "from-yellow-500 to-orange-500",
  },
  {
    title: "JavaScript Interview Guide",
    level: "Advanced",
    questions: "200+ Questions",
    category: "JavaScript",
    tags: ["javascript", "es6", "frontend"],
    icon: <FaCode />,
    color: "from-purple-500 to-indigo-600",
  },
  {
    title: "SQL Interview Guide",
    level: "Intermediate",
    questions: "80+ Questions",
    category: "SQL",
    tags: ["sql", "mysql", "database"],
    icon: <FaLayerGroup />,
    color: "from-pink-500 to-rose-600",
  },
  {
    title: "MERN Stack Interview Guide",
    level: "Advanced",
    questions: "250+ Questions",
    category: "MERN",
    tags: ["mern", "mongodb", "react", "node"],
    icon: <FaCode />,
    color: "from-slate-800 to-slate-900",
  },
];

function InterviewGuides() {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const categories = [
    "All",
    "React",
    "Node",
    "Python",
    "JavaScript",
    "SQL",
    "MERN",
  ];

  const filteredGuides = guides.filter(
    (guide) => {
      const matchesSearch =
        guide.title
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        guide.tags.some((tag) =>
          tag
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            )
        );

      const matchesCategory =
        selectedCategory === "All" ||
        guide.category ===
          selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 pt-32 pb-24">

        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/20 blur-[150px] rounded-full" />

        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/20 blur-[150px] rounded-full" />

        <div className="relative max-w-7xl mx-auto px-5 text-center">

          <span className="uppercase tracking-[4px] text-cyan-400 font-semibold">
            Career Preparation
          </span>

          <h1 className="mt-5 text-5xl md:text-7xl font-extrabold text-white">
            Interview
            <span className="text-cyan-400">
              {" "}Guides
            </span>
          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-slate-300 text-lg">
            Crack your next interview with
            expert-curated guides, coding
            questions, answers and roadmaps.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mt-10 relative">

            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              placeholder="Search React, Node, Python..."
              className="w-full pl-14 pr-5 py-5 rounded-2xl bg-white text-slate-900 outline-none shadow-xl"
            />

          </div>

        </div>

      </section>

      {/* Categories */}
      <section className="bg-white py-10 border-b">

        <div className="max-w-7xl mx-auto px-5 flex flex-wrap gap-4 justify-center">

          {categories.map((item) => (

            <button
              key={item}
              onClick={() =>
                setSelectedCategory(
                  item
                )
              }
              className={`px-5 py-3 rounded-full font-semibold transition
              ${
                selectedCategory === item
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 hover:bg-blue-600 hover:text-white"
              }`}
            >
              {item}
            </button>

          ))}

        </div>

      </section>

      {/* Guides */}
      <section className="py-24 bg-slate-50">

        <div className="max-w-7xl mx-auto px-5">

          {filteredGuides.length ===
          0 ? (

            <div className="text-center py-20">

              <h2 className="text-4xl font-bold text-slate-700">
                No Guides Found
              </h2>

              <p className="text-gray-500 mt-4">
                Try searching React,
                Node, Python, SQL...
              </p>

            </div>

          ) : (

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

              {filteredGuides.map(
                (guide, index) => (

                  <div
                    key={index}
                    className="group bg-white rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500"
                  >

                    <div
                      className={`h-3 bg-gradient-to-r ${guide.color}`}
                    />

                    <div className="p-8">

                      <div
                        className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${guide.color} flex items-center justify-center text-white text-3xl`}
                      >
                        {guide.icon}
                      </div>

                      <h3 className="mt-6 text-2xl font-bold text-slate-900">
                        {guide.title}
                      </h3>

                      <p className="mt-3 text-gray-500">
                        Comprehensive
                        interview preparation
                        guide with real-world
                        questions and answers.
                      </p>

                      <div className="flex flex-wrap gap-3 mt-6">

                        <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                          {guide.level}
                        </span>

                        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                          {
                            guide.questions
                          }
                        </span>

                      </div>

                      <button className="mt-8 flex items-center gap-3 text-blue-600 font-bold group-hover:gap-5 transition-all">
                        Read Guide
                        <FaArrowRight />
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </section>

      <Footer />
    </>
  );
}

export default InterviewGuides;