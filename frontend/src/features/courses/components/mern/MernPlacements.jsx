import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaBriefcase,
  FaArrowRight,
  FaBuilding,
} from "react-icons/fa";

const MernPlacements = () => {
  const navigate = useNavigate();

  const placements = [
    {
      id: 1,
      name: "Rahul Sharma",
      company: "Google",
      package: "₹18 LPA",
      role: "Frontend Developer",
      image: "https://i.pravatar.cc/300?img=11",
    },
    {
      id: 2,
      name: "Priya Reddy",
      company: "Amazon",
      package: "₹22 LPA",
      role: "Full Stack Engineer",
      image: "https://i.pravatar.cc/300?img=32",
    },
    {
      id: 3,
      name: "Arjun Patel",
      company: "Microsoft",
      package: "₹20 LPA",
      role: "MERN Developer",
      image: "https://i.pravatar.cc/300?img=15",
    },
    {
      id: 4,
      name: "Ananya Verma",
      company: "Infosys",
      package: "₹12 LPA",
      role: "Software Engineer",
      image: "https://i.pravatar.cc/300?img=25",
    },
  ];

  const companies = [
    "Google",
    "Amazon",
    "Microsoft",
    "TCS",
    "Infosys",
    "Wipro",
    "Accenture",
    "Cognizant",
  ];

  return (
    <section className="min-h-screen bg-[#020b14] text-white py-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <span className="px-5 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
            100% Placement Assistance
          </span>

          <h1 className="text-5xl md:text-7xl font-bold mt-8">
            Student
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Placement Success
            </span>
          </h1>

          <p className="text-gray-400 text-lg mt-6 max-w-3xl mx-auto">
            Thousands of students have transformed their careers
            through our MERN Stack training and landed jobs at
            top companies.
          </p>
        </motion.div>

        {/* Placement Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          {[
            ["15K+", "Students Trained"],
            ["3500+", "Placements"],
            ["₹24 LPA", "Highest Package"],
            ["95%", "Placement Rate"],
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center"
            >
              <h2 className="text-3xl font-bold text-cyan-400">
                {item[0]}
              </h2>
              <p className="text-gray-400 mt-2">
                {item[1]}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Students */}
        <div className="mt-24">
          <h2 className="text-4xl font-bold text-center mb-12">
            Recent Placements
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {placements.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.15,
                  duration: 0.8,
                }}
                viewport={{ once: true }}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden"
              >
                <img
                  src={student.image}
                  alt={student.name}
                  className="w-full h-72 object-cover"
                />

                <div className="p-6">
                  <h3 className="text-2xl font-bold">
                    {student.name}
                  </h3>

                  <p className="text-cyan-400 mt-2">
                    {student.role}
                  </p>

                  <div className="flex items-center gap-2 mt-4 text-gray-400">
                    <FaBuilding />
                    {student.company}
                  </div>

                  <div className="mt-4">
                    <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-400">
                      {student.package}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/placement/${student.id}`)
                    }
                    className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition"
                  >
                    View Story
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hiring Companies */}
        <div className="mt-24">
          <h2 className="text-4xl font-bold text-center mb-12">
            Hiring Partners
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {companies.map((company, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center"
              >
                <FaBriefcase className="mx-auto text-cyan-400 text-3xl mb-4" />
                <h3 className="font-semibold">{company}</h3>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-24">
          <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-white/10 rounded-[40px] p-10 backdrop-blur-xl">
            
            <div className="flex justify-center -space-x-4 mb-8">
              <img
                src="https://i.pravatar.cc/100?img=50"
                alt=""
                className="w-14 h-14 rounded-full border-2 border-[#020b14]"
              />
              <img
                src="https://i.pravatar.cc/100?img=60"
                alt=""
                className="w-14 h-14 rounded-full border-2 border-[#020b14]"
              />
              <img
                src="https://i.pravatar.cc/100?img=70"
                alt=""
                className="w-14 h-14 rounded-full border-2 border-[#020b14]"
              />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-center">
              Your Dream Job Starts Here
            </h2>

            <p className="text-center text-gray-400 mt-5 max-w-2xl mx-auto">
              Learn MERN Stack, build projects, crack interviews,
              and get placed at top companies.
            </p>

            <div className="flex flex-wrap justify-center gap-5 mt-10">
              <button
                onClick={() => navigate("/courses")}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold flex items-center gap-2 hover:scale-105 transition"
              >
                Explore Courses
                <FaArrowRight />
              </button>

              <button
                onClick={() => navigate("/mentors")}
                className="px-8 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition"
              >
                Meet Mentors
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MernPlacements;