import {
  FaCheck,
  FaDatabase,
  FaCloud,
  FaRobot,
  FaServer,
  FaCode,
  FaChartLine,
  FaProjectDiagram,
} from "react-icons/fa";

import AOS from "aos";
import "aos/dist/aos.css";

import { useEffect } from "react";

function TechnologiesSection() {

  useEffect(() => {

    AOS.init({
      duration: 1200,
      once: true,
      easing: "ease-in-out",
    });

  }, []);

  const skills = [
    "SQL / NoSQL",
    "ETL Pipelines",
    "Data Modeling",
    "Machine Learning",
    "Big Data",
    "Cloud Computing",
    "Data Warehousing",
    "Python Programming",
  ];

  const technologies = [
    { icon: <FaDatabase />, name: "MongoDB" },
    { icon: <FaCloud />, name: "AWS" },
    { icon: <FaRobot />, name: "AI/ML" },
    { icon: <FaServer />, name: "NodeJS" },
    { icon: <FaCode />, name: "Python" },
    { icon: <FaChartLine />, name: "Power BI" },
    { icon: <FaProjectDiagram />, name: "Apache Airflow" },
    { icon: <FaDatabase />, name: "MySQL" },
    { icon: <FaCloud />, name: "Azure" },
  ];

  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full"></div>

      <div className="max-w-7xl mx-auto px-5">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ================= LEFT ================= */}
          <div data-aos="fade-right">

            <span className="inline-block bg-blue-100 text-blue-700 font-semibold px-5 py-2 rounded-full mb-6">

              Technologies

            </span>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-8">

              Master
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                {" "}The Modern
              </span>
              <br />
              Tech Stack

            </h2>

            <div className="space-y-5">

              {skills.map((skill, index) => (

                <div
                  key={index}
                  className="flex items-center gap-4"
                >

                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">

                    <FaCheck />

                  </div>

                  <p className="text-xl text-slate-700 font-medium">

                    {skill}

                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* ================= RIGHT ================= */}
          <div
            data-aos="fade-left"
            className="grid grid-cols-3 gap-6"
          >

            {technologies.map((tech, index) => (

              <div
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-[0_20px_60px_rgba(59,130,246,0.15)] hover:-translate-y-3 transition-all duration-500"
              >

                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-cyan-100 to-blue-100 flex items-center justify-center text-3xl text-blue-600 group-hover:scale-110 transition duration-300">

                  {tech.icon}

                </div>

                <h3 className="text-center mt-5 font-bold text-slate-800">

                  {tech.name}

                </h3>

              </div>

            ))}

          </div>

        </div>

      </div>

    </section>
  );
}

export default TechnologiesSection;