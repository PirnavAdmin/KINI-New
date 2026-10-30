import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaReact,
  FaNodeJs,
  FaDatabase,
  FaServer,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

const MernCurriculum = () => {
  const navigate = useNavigate();

  const curriculum = [
    {
      id: 1,
      title: "Frontend Development",
      icon: <FaReact />,
      color: "text-cyan-400",
      weeks: "4 Weeks",
      topics: [
        "HTML5 & CSS3",
        "JavaScript ES6+",
        "React Fundamentals",
        "React Hooks",
        "Tailwind CSS",
      ],
    },
    {
      id: 2,
      title: "Backend Development",
      icon: <FaNodeJs />,
      color: "text-green-400",
      weeks: "4 Weeks",
      topics: [
        "Node.js",
        "Express.js",
        "REST APIs",
        "Authentication",
        "JWT Security",
      ],
    },
    {
      id: 3,
      title: "Database Management",
      icon: <FaDatabase />,
      color: "text-emerald-400",
      weeks: "2 Weeks",
      topics: [
        "MongoDB",
        "Mongoose",
        "CRUD Operations",
        "Aggregation",
        "Optimization",
      ],
    },
    {
      id: 4,
      title: "Deployment & Projects",
      icon: <FaServer />,
      color: "text-orange-400",
      weeks: "2 Weeks",
      topics: [
        "Docker Basics",
        "AWS Deployment",
        "CI/CD",
        "Real Projects",
        "Portfolio Building",
      ],
    },
  ];

  return (
    <section className="min-h-screen bg-[#020b14] text-white py-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <span className="px-5 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
            Industry Ready Curriculum
          </span>

          <h1 className="text-5xl md:text-7xl font-bold mt-8">
            MERN Stack
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Learning Roadmap
            </span>
          </h1>

          <p className="max-w-3xl mx-auto mt-6 text-lg text-gray-400">
            Master Full Stack Development with a structured roadmap
            designed by industry experts and hiring managers.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          {[
            ["12 Weeks", "Duration"],
            ["50+", "Assignments"],
            ["15+", "Projects"],
            ["100%", "Job Support"],
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

        {/* Curriculum Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mt-20">
          {curriculum.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.15,
                duration: 0.7,
              }}
              viewport={{ once: true }}
              whileHover={{
                y: -10,
                scale: 1.02,
              }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`text-5xl ${module.color}`}
                >
                  {module.icon}
                </div>

                <div>
                  <h2 className="text-3xl font-bold">
                    {module.title}
                  </h2>

                  <p className="text-gray-400">
                    {module.weeks}
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {module.topics.map((topic, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3"
                  >
                    <FaCheckCircle className="text-cyan-400" />
                    <span className="text-gray-300">
                      {topic}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() =>
                  navigate(`/curriculum/module/${module.id}`)
                }
                className="mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:scale-105 transition-all"
              >
                Explore Module
              </button>
            </motion.div>
          ))}
        </div>

        {/* Mentor Section */}
        <div className="mt-24">
          <h2 className="text-4xl font-bold text-center mb-12">
            Learn From Expert Mentors
          </h2>

          <div className="flex justify-center -space-x-5">
            {[
              "https://i.pravatar.cc/150?img=11",
              "https://i.pravatar.cc/150?img=12",
              "https://i.pravatar.cc/150?img=13",
              "https://i.pravatar.cc/150?img=14",
              "https://i.pravatar.cc/150?img=15",
            ].map((avatar, index) => (
              <motion.img
                key={index}
                whileHover={{ y: -10 }}
                src={avatar}
                alt="mentor"
                className="w-20 h-20 rounded-full border-4 border-[#020b14]"
              />
            ))}
          </div>

          <p className="text-center text-gray-400 mt-6">
            Senior Developers from Product Companies
          </p>
        </div>

        {/* Roadmap Image */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24"
        >
          <div className="bg-white/5 border border-white/10 rounded-[40px] p-6">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200"
              alt="Curriculum Roadmap"
              className="rounded-3xl w-full h-[450px] object-cover"
            />
          </div>
        </motion.div>

        {/* CTA */}
        <div className="mt-24">
          <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-xl rounded-[40px] p-12 text-center">

            <h2 className="text-4xl md:text-5xl font-bold">
              Start Your MERN Journey Today
            </h2>

            <p className="text-gray-400 mt-5 max-w-2xl mx-auto">
              Follow a structured curriculum, build projects,
              get mentorship and become job ready.
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

export default MernCurriculum;