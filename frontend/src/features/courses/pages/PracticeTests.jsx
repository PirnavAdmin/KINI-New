import { useState } from "react";

import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";

import {
  FaSearch,
  FaPlay,
  FaClock,
  FaQuestionCircle,
  FaChartLine,
} from "react-icons/fa";
import { useThemeContext } from "@shared/context/ThemeContext";

const tests = [
  {
    id: 1,
    title: "React JS Assessment",
    category: "React",
    questions: 25,
    duration: "30 Min",
    level: "Intermediate",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: 2,
    title: "JavaScript Quiz",
    category: "JavaScript",
    questions: 40,
    duration: "45 Min",
    level: "Advanced",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: 3,
    title: "Node JS Assessment",
    category: "Node",
    questions: 35,
    duration: "40 Min",
    level: "Advanced",
    color: "from-green-500 to-emerald-600",
  },
  {
    id: 4,
    title: "Python Practice Test",
    category: "Python",
    questions: 50,
    duration: "60 Min",
    level: "Beginner",
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: 5,
    title: "SQL Challenge",
    category: "SQL",
    questions: 30,
    duration: "35 Min",
    level: "Intermediate",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: 6,
    title: "MERN Stack Test",
    category: "MERN",
    questions: 75,
    duration: "90 Min",
    level: "Advanced",
    color: "from-slate-800 to-slate-900",
  },
];

function PracticeTests() {
  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");
  const { isDark } = useThemeContext();

  const categories = [
    "All",
    "React",
    "JavaScript",
    "Node",
    "Python",
    "SQL",
    "MERN",
  ];

  const filteredTests = tests.filter(
    (test) => {
      const matchesSearch =
        test.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesCategory =
        category === "All" ||
        test.category === category;

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

        <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-cyan-500/20 blur-[180px] rounded-full" />

        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-purple-500/20 blur-[180px] rounded-full" />

        <div className="relative max-w-7xl mx-auto px-5 text-center">

          <span className="uppercase tracking-[4px] text-cyan-400 font-semibold">
            Skill Assessment
          </span>

          <h1 className="mt-5 text-5xl md:text-7xl font-extrabold text-white">
            Practice
            <span className="text-cyan-400">
              {" "}Tests
            </span>
          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-slate-300 text-lg">
            Evaluate your knowledge with
            real-world assessments designed
            by industry experts.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mt-10 relative">

            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search Practice Tests..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full pl-14 pr-5 py-5 rounded-2xl bg-white text-slate-900 shadow-xl outline-none"
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
                setCategory(item)
              }
              className={`px-5 py-3 rounded-full font-semibold transition
              ${
                category === item
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 hover:bg-blue-600 hover:text-white"
              }`}
            >
              {item}
            </button>

          ))}

        </div>

      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-50">

        <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-3 gap-8">

          <div className="bg-white rounded-3xl p-8 text-center shadow-lg">
            <h2 className="text-5xl font-bold text-blue-600">
              500+
            </h2>
            <p className="mt-3 text-gray-500">
              Practice Questions
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 text-center shadow-lg">
            <h2 className="text-5xl font-bold text-green-600">
              50+
            </h2>
            <p className="mt-3 text-gray-500">
              Mock Assessments
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 text-center shadow-lg">
            <h2 className="text-5xl font-bold text-purple-600">
              10K+
            </h2>
            <p className="mt-3 text-gray-500">
              Students Tested
            </p>
          </div>

        </div>

      </section>

      {/* Tests Grid */}
      <section className="py-24 bg-slate-50">

        <div className="max-w-7xl mx-auto px-5">

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

            {filteredTests.map((test) => (

              <div
                key={test.id}
                className="group bg-white rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500"
              >

                <div
                  className={`h-3 bg-gradient-to-r ${test.color}`}
                />

                <div className="p-8">

                  <div
                    className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${test.color} flex items-center justify-center text-white text-3xl`}
                  >
                    <FaChartLine />
                  </div>

                  <h3 className="mt-6 text-2xl font-bold text-slate-900">
                    {test.title}
                  </h3>

                  <div className="flex flex-wrap gap-3 mt-6">

                    <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                      {test.level}
                    </span>

                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                      {test.category}
                    </span>

                  </div>

                  <div className="mt-6 space-y-3">

                    <div className="flex items-center gap-3 text-gray-600">
                      <FaQuestionCircle />
                      {test.questions} Questions
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                      <FaClock />
                      {test.duration}
                    </div>

                  </div>

                  <button className="mt-8 w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition">

                    <FaPlay />

                    Start Test

                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className={`py-24 transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'}`}>

        <div className="max-w-4xl mx-auto px-5 text-center">

          <h2 className="text-5xl font-bold">
            Ready To Test Your Skills?
          </h2>

          <p className="mt-5 text-slate-400 text-lg">
            Take assessments, identify your
            strengths, and prepare for real
            technical interviews.
          </p>

          <button className="mt-8 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-4 rounded-2xl font-bold transition">

            Start Learning

          </button>

        </div>

      </section>

      <Footer />
    </>
  );
}

export default PracticeTests;