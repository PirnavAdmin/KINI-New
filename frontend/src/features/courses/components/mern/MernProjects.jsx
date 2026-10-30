import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaGithub,
  FaExternalLinkAlt,
  FaReact,
} from "react-icons/fa";

const MernProjects = () => {
  const navigate = useNavigate();

  const projects = [
    {
      id: 1,
      title: "E-Commerce Platform",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200",
      description:
        "Full MERN e-commerce application with payments, authentication and admin dashboard.",
      tech: "React • Node • MongoDB",
    },
    {
      id: 2,
      title: "Learning Management System",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200",
      description:
        "Complete LMS platform with courses, mentors, certificates and progress tracking.",
      tech: "MERN Stack",
    },
    {
      id: 3,
      title: "AI Project Manager",
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200",
      description:
        "AI-powered project management system with real-time collaboration.",
      tech: "React + OpenAI + Node",
    },
    {
      id: 4,
      title: "Social Media App",
      image:
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200",
      description:
        "Modern social networking platform with posts, chats and notifications.",
      tech: "MongoDB • Express • React",
    },
  ];

  return (
    <section className="min-h-screen bg-[#020b14] text-white py-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            Real World MERN Projects
          </span>

          <h1 className="mt-8 text-5xl md:text-7xl font-bold">
            Build Production
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Ready Projects
            </span>
          </h1>

          <p className="max-w-3xl mx-auto mt-6 text-lg text-gray-400">
            Learn by building advanced MERN stack applications used
            by startups and enterprise companies.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-20">
          {[
            ["50+", "Projects"],
            ["15K+", "Students"],
            ["100+", "Modules"],
            ["4.9★", "Rating"],
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center"
            >
              <h3 className="text-3xl font-bold text-cyan-400">
                {item[0]}
              </h3>

              <p className="text-gray-400 mt-2">
                {item[1]}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-2 gap-10">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
              }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden group"
            >
              {/* Image */}
              <div className="overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-72 object-cover group-hover:scale-110 transition duration-700"
                />
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <FaReact className="text-cyan-400 text-2xl" />
                  <span className="text-cyan-400">
                    MERN Stack
                  </span>
                </div>

                <h2 className="text-3xl font-bold mb-4">
                  {project.title}
                </h2>

                <p className="text-gray-400 mb-5">
                  {project.description}
                </p>

                <div className="text-sm text-cyan-400 mb-6">
                  {project.tech}
                </div>

                {/* Team Avatars */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-3">
                    <img
                      src="https://i.pravatar.cc/100?img=11"
                      alt=""
                      className="w-10 h-10 rounded-full border-2 border-[#020b14]"
                    />
                    <img
                      src="https://i.pravatar.cc/100?img=22"
                      alt=""
                      className="w-10 h-10 rounded-full border-2 border-[#020b14]"
                    />
                    <img
                      src="https://i.pravatar.cc/100?img=33"
                      alt=""
                      className="w-10 h-10 rounded-full border-2 border-[#020b14]"
                    />
                  </div>

                  <span className="text-gray-400 text-sm">
                    Team Project
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() =>
                      navigate(`/project/${project.id}`)
                    }
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:scale-105 transition"
                  >
                    View Project
                  </button>

                  <button
                    className="w-14 h-14 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition"
                  >
                    <FaGithub />
                  </button>

                  <button
                    className="w-14 h-14 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition"
                  >
                    <FaExternalLinkAlt />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="mt-24"
        >
          <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-xl rounded-[40px] p-12 text-center">

            <div className="flex justify-center -space-x-4 mb-8">
              <img
                src="https://i.pravatar.cc/100?img=10"
                alt=""
                className="w-14 h-14 rounded-full border-2 border-[#020b14]"
              />
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
            </div>

            <h2 className="text-4xl md:text-5xl font-bold">
              Ready To Build Your Next Project?
            </h2>

            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              Start working on real-world MERN applications and
              create a portfolio that impresses recruiters.
            </p>

            <div className="flex flex-wrap justify-center gap-5 mt-10">
              <button
                onClick={() => navigate("/courses")}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:scale-105 transition"
              >
                Start Learning
              </button>

              <button
                onClick={() => navigate("/mentors")}
                className="px-8 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition"
              >
                Meet Mentors
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MernProjects;