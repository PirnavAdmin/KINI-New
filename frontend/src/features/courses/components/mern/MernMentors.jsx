import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLinkedin, FaGithub, FaStar } from "react-icons/fa";

const MernMentors = () => {
  const navigate = useNavigate();

  const mentors = [
    {
      id: 1,
      name: "Rahul Sharma",
      role: "Senior MERN Architect",
      image: "https://i.pravatar.cc/300?img=11",
      experience: "8+ Years",
      students: "4.5K+",
    },
    {
      id: 2,
      name: "Ananya Reddy",
      role: "React & Frontend Expert",
      image: "https://i.pravatar.cc/300?img=32",
      experience: "6+ Years",
      students: "3.2K+",
    },
    {
      id: 3,
      name: "Arjun Patel",
      role: "Node.js Backend Lead",
      image: "https://i.pravatar.cc/300?img=15",
      experience: "7+ Years",
      students: "2.8K+",
    },
    {
      id: 4,
      name: "Priya Verma",
      role: "MongoDB Specialist",
      image: "https://i.pravatar.cc/300?img=25",
      experience: "5+ Years",
      students: "2K+",
    },
  ];

  return (
    <section className="min-h-screen bg-[#020b14] text-white py-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <span className="px-5 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
            Learn From Industry Experts
          </span>

          <h1 className="text-5xl md:text-7xl font-bold mt-8">
            Meet Our
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              MERN Mentors
            </span>
          </h1>

          <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-400">
            Learn directly from experienced developers working in
            top tech companies and building real-world products.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          {[
            ["20+", "Expert Mentors"],
            ["15K+", "Students"],
            ["100+", "Projects"],
            ["4.9★", "Average Rating"],
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center"
            >
              <h3 className="text-3xl font-bold text-cyan-400">
                {item[0]}
              </h3>
              <p className="text-gray-400 mt-2">{item[1]}</p>
            </motion.div>
          ))}
        </div>

        {/* Mentor Cards */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mt-20">
          {mentors.map((mentor, index) => (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.15,
                duration: 0.7,
              }}
              whileHover={{
                y: -12,
                scale: 1.03,
              }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden group"
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={mentor.image}
                  alt={mentor.name}
                  className="w-full h-72 object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#020b14] via-transparent to-transparent"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold">
                  {mentor.name}
                </h3>

                <p className="text-cyan-400 mt-2">
                  {mentor.role}
                </p>

                <div className="flex justify-between mt-5 text-sm text-gray-400">
                  <span>{mentor.experience}</span>
                  <span>{mentor.students}</span>
                </div>

                <div className="flex items-center gap-2 mt-4 text-yellow-400">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>

                {/* Socials */}
                <div className="flex gap-3 mt-5">
                  <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-cyan-500 transition">
                    <FaLinkedin />
                  </button>

                  <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-cyan-500 transition">
                    <FaGithub />
                  </button>
                </div>

                {/* Button */}
                <button
                  onClick={() =>
                    navigate(`/mentor/${mentor.id}`)
                  }
                  className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                >
                  View Profile →
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="mt-24"
        >
          <div className="rounded-[40px] border border-white/10 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl p-12 text-center">
            
            {/* Avatars */}
            <div className="flex justify-center -space-x-4 mb-8">
              <img
                src="https://i.pravatar.cc/100?img=12"
                alt=""
                className="w-14 h-14 rounded-full border-2 border-[#020b14]"
              />
              <img
                src="https://i.pravatar.cc/100?img=18"
                alt=""
                className="w-14 h-14 rounded-full border-2 border-[#020b14]"
              />
              <img
                src="https://i.pravatar.cc/100?img=22"
                alt=""
                className="w-14 h-14 rounded-full border-2 border-[#020b14]"
              />
              <img
                src="https://i.pravatar.cc/100?img=28"
                alt=""
                className="w-14 h-14 rounded-full border-2 border-[#020b14]"
              />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold">
              Start Learning With Experts
            </h2>

            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Get personalized guidance, code reviews, career
              mentorship, and project support from our mentors.
            </p>

            <div className="flex flex-wrap justify-center gap-5 mt-10">
              <button
                onClick={() => navigate("/courses")}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:scale-105 transition"
              >
                Explore Courses
              </button>

              <button
                onClick={() => navigate("/contact")}
                className="px-8 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition"
              >
                Contact Mentors
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MernMentors;