import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaStar,
  FaQuoteLeft,
  FaArrowRight,
  FaBriefcase,
} from "react-icons/fa";

const StudentReviews = () => {
  const navigate = useNavigate();

  const reviews = [
    {
      id: 1,
      name: "Rahul Sharma",
      role: "Frontend Developer @ Google",
      image: "https://i.pravatar.cc/300?img=11",
      package: "18 LPA",
      review:
        "The MERN curriculum was industry-focused. Building real projects helped me crack interviews and land my dream role.",
    },
    {
      id: 2,
      name: "Priya Reddy",
      role: "Full Stack Engineer @ Amazon",
      image: "https://i.pravatar.cc/300?img=32",
      package: "22 LPA",
      review:
        "Mentorship, mock interviews, and project reviews made a huge difference. The placement support was exceptional.",
    },
    {
      id: 3,
      name: "Arjun Patel",
      role: "MERN Developer @ Microsoft",
      image: "https://i.pravatar.cc/300?img=15",
      package: "20 LPA",
      review:
        "From React to deployment, everything was covered. My portfolio projects impressed recruiters immediately.",
    },
  ];

  const projects = [
    "E-Commerce Platform",
    "Learning Management System",
    "Social Media App",
    "AI Project Manager",
    "Job Portal",
    "Food Delivery App",
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
            Student Success Stories
          </span>

          <h1 className="text-5xl md:text-7xl font-bold mt-8">
            Reviews &
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Placements
            </span>
          </h1>

          <p className="text-gray-400 mt-6 max-w-3xl mx-auto text-lg">
            Hear from students who built real-world MERN projects,
            cracked interviews, and secured jobs at top companies.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          {[
            ["4.9★", "Average Rating"],
            ["15K+", "Students"],
            ["3500+", "Placements"],
            ["50+", "Projects"],
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

        {/* Reviews */}
        <div className="grid lg:grid-cols-3 gap-8 mt-24">
          {reviews.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.15,
                duration: 0.7,
              }}
              whileHover={{
                y: -10,
                scale: 1.02,
              }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden"
            >
              <img
                src={student.image}
                alt={student.name}
                className="w-full h-72 object-cover"
              />

              <div className="p-8">
                <FaQuoteLeft className="text-cyan-400 text-3xl mb-4" />

                <p className="text-gray-300 leading-relaxed">
                  {student.review}
                </p>

                <div className="flex text-yellow-400 gap-1 mt-5">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-2xl font-bold">
                    {student.name}
                  </h3>

                  <p className="text-cyan-400">
                    {student.role}
                  </p>

                  <span className="inline-block mt-4 px-4 py-2 rounded-full bg-green-500/20 text-green-400">
                    Package: ₹{student.package}
                  </span>
                </div>

                <button
                  onClick={() =>
                    navigate(`/review/${student.id}`)
                  }
                  className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition"
                >
                  Read Full Story
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Projects Showcase */}
        <div className="mt-24">
          <h2 className="text-4xl font-bold text-center mb-12">
            Projects Built By Students
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
              >
                <h3 className="text-xl font-semibold">
                  {project}
                </h3>

                <p className="text-gray-400 mt-3">
                  Production-ready project built during the MERN
                  training program.
                </p>

                <button
                  onClick={() => navigate("/projects")}
                  className="mt-5 text-cyan-400 flex items-center gap-2"
                >
                  View Projects
                  <FaArrowRight />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Placement CTA */}
        <div className="mt-24">
          <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-white/10 rounded-[40px] p-12 backdrop-blur-xl text-center">

            <div className="flex justify-center -space-x-4 mb-8">
              <img
                src="https://i.pravatar.cc/100?img=20"
                alt=""
                className="w-14 h-14 rounded-full border-2 border-[#020b14]"
              />
              <img
                src="https://i.pravatar.cc/100?img=30"
                alt=""
                className="w-14 h-14 rounded-full border-2 border-[#020b14]"
              />
              <img
                src="https://i.pravatar.cc/100?img=40"
                alt=""
                className="w-14 h-14 rounded-full border-2 border-[#020b14]"
              />
            </div>

            <FaBriefcase className="mx-auto text-cyan-400 text-5xl mb-6" />

            <h2 className="text-4xl md:text-5xl font-bold">
              Become Our Next Success Story
            </h2>

            <p className="text-gray-400 mt-5 max-w-2xl mx-auto">
              Learn MERN Stack, build real projects, receive
              mentorship, and secure placements at leading companies.
            </p>

            <div className="flex flex-wrap justify-center gap-5 mt-10">
              <button
                onClick={() => navigate("/courses")}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:scale-105 transition"
              >
                Start Learning
              </button>

              <button
                onClick={() => navigate("/placements")}
                className="px-8 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition"
              >
                View Placements
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default StudentReviews;