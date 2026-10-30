import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaReact,
  FaNodeJs,
  FaDatabase,
  FaServer,
} from "react-icons/fa";

const MernCourses = () => {
  const navigate = useNavigate();

  const courses = [
    {
      id: 1,
      title: "React Mastery",
      icon: <FaReact />,
      lessons: "45 Lessons",
      students: "3.2k Students",
      color: "text-cyan-400",
      route: "/course/react",
    },
    {
      id: 2,
      title: "Node.js Backend",
      icon: <FaNodeJs />,
      lessons: "38 Lessons",
      students: "2.8k Students",
      color: "text-green-400",
      route: "/course/node",
    },
    {
      id: 3,
      title: "MongoDB Database",
      icon: <FaDatabase />,
      lessons: "25 Lessons",
      students: "1.9k Students",
      color: "text-emerald-400",
      route: "/course/mongodb",
    },
    {
      id: 4,
      title: "Express API Development",
      icon: <FaServer />,
      lessons: "30 Lessons",
      students: "2.5k Students",
      color: "text-orange-400",
      route: "/course/express",
    },
  ];

  return (
    <section className="min-h-screen bg-[#020b14] text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="px-5 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            Premium MERN Learning Platform
          </span>

          <h1 className="mt-6 text-5xl md:text-7xl font-bold">
            Master The
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              MERN Stack
            </span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto mt-6 text-lg">
            Industry-focused courses designed to make you a professional
            full-stack developer with real-world projects.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {[
            ["15K+", "Students"],
            ["120+", "Hours Content"],
            ["50+", "Projects"],
            ["24/7", "Support"],
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center"
            >
              <h2 className="text-3xl font-bold text-cyan-400">
                {item[0]}
              </h2>
              <p className="text-gray-400">{item[1]}</p>
            </div>
          ))}
        </div>

        {/* Courses */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.2,
                duration: 0.8,
              }}
              whileHover={{
                y: -10,
                scale: 1.03,
              }}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 hover:border-cyan-500/40 transition-all duration-300"
            >
              <div
                className={`text-5xl mb-5 ${course.color}`}
              >
                {course.icon}
              </div>

              <h3 className="text-2xl font-bold mb-3">
                {course.title}
              </h3>

              <p className="text-gray-400 mb-2">
                {course.lessons}
              </p>

              <p className="text-gray-500 mb-6">
                {course.students}
              </p>

              {/* Avatars */}
              <div className="flex -space-x-3 mb-6">
                <img
                  src="https://i.pravatar.cc/100?img=11"
                  alt=""
                  className="w-10 h-10 rounded-full border-2 border-[#020b14]"
                />
                <img
                  src="https://i.pravatar.cc/100?img=12"
                  alt=""
                  className="w-10 h-10 rounded-full border-2 border-[#020b14]"
                />
                <img
                  src="https://i.pravatar.cc/100?img=13"
                  alt=""
                  className="w-10 h-10 rounded-full border-2 border-[#020b14]"
                />
              </div>

              <button
                onClick={() => navigate(course.route)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                Start Learning →
              </button>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="mt-24"
        >
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 text-center">
            <h2 className="text-4xl font-bold">
              Ready to Become a Full Stack Developer?
            </h2>

            <p className="text-gray-400 mt-4">
              Join thousands of students building production-ready MERN
              applications.
            </p>

            <div className="flex justify-center gap-5 mt-8">
              <button
                onClick={() => navigate("/enrollment")}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:scale-105 transition"
              >
                Enroll Now
              </button>

              <button
                onClick={() => navigate("/projects")}
                className="px-8 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition"
              >
                View Projects
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MernCourses;