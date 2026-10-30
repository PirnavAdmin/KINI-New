import React from "react";
import { useNavigate } from "react-router-dom";

const MernHero = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-[#020b14] text-white flex items-center">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <div>
          <span className="inline-block px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-6">
            🚀 Full Stack MERN Development
          </span>

          <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
            Build Modern
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              MERN Applications
            </span>
          </h1>

          <p className="mt-6 text-gray-400 text-lg leading-relaxed max-w-xl">
            Develop scalable, high-performance web applications using
            MongoDB, Express.js, React.js, and Node.js. Learn industry-level
            architecture and deploy production-ready projects.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mt-10">
            <button
              onClick={() => navigate("/courses")}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/30"
            >
              Explore Courses
            </button>

            <button
              onClick={() => navigate("/projects")}
              className="px-8 py-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300"
            >
              View Projects
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-14">
            <div>
              <h3 className="text-3xl font-bold text-cyan-400">50+</h3>
              <p className="text-gray-500">Projects</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-cyan-400">10K+</h3>
              <p className="text-gray-500">Students</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-cyan-400">100%</h3>
              <p className="text-gray-500">Job Support</p>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="relative flex justify-center">
          
          {/* Glow Effect */}
          <div className="absolute w-72 h-72 bg-cyan-500/20 blur-[120px] rounded-full"></div>

          <div className="relative grid grid-cols-2 gap-5 w-full max-w-lg">
            
            {[
              { name: "MongoDB", color: "text-green-400" },
              { name: "Express.js", color: "text-gray-300" },
              { name: "React.js", color: "text-cyan-400" },
              { name: "Node.js", color: "text-green-500" },
            ].map((tech, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300"
              >
                <h3 className={`text-2xl font-bold ${tech.color}`}>
                  {tech.name}
                </h3>
                <p className="text-gray-500 mt-3 text-sm">
                  Industry standard technology stack.
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default MernHero;