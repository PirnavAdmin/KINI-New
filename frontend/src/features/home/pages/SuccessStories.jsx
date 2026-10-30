import { useState } from "react";

const students = [
  {
    id: 1,
    name: "Poonam",
    package: "14 LPA",
    company: "Cognizant",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 2,
    name: "Anudeep",
    package: "10 LPA",
    company: "Capgemini",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 3,
    name: "Sudipta",
    package: "15 LPA",
    company: "PwC",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: 4,  
    name: "Susri",
    package: "18 LPA",
    company: "Infosys",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: 5,
    name: "Saketh",
    package: "9 LPA",
    company: "InfoLab",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
  },
];

function SuccessStories() {
  const [paused, setPaused] = useState(false);

  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-b from-black via-[#1a0000] to-red-700">

      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/20 blur-[120px] rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full"></div>

      <div className="relative z-10">

        <div className="text-center mb-16">

          <p className="uppercase tracking-[5px] text-red-300 font-semibold mb-4">
            Placements
          </p>

          <h2 className="text-5xl md:text-6xl font-extrabold text-white">
            Placement Outcomes
          </h2>

          <p className="text-gray-300 mt-5 text-lg">
            Our learners are getting hired by top companies.
          </p>

        </div>

        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >

          {/* Left Fade */}
          <div className="absolute left-0 top-0 h-full w-40 z-20 bg-gradient-to-r from-black via-black/80 to-transparent"></div>

          {/* Right Fade */}
          <div className="absolute right-0 top-0 h-full w-40 z-20 bg-gradient-to-l from-black via-black/80 to-transparent"></div>

          <div
            className={`flex gap-8 w-max ${
              paused ? "" : "animate-success-scroll"
            }`}
          >
            {[...students, ...students].map(
              (student, index) => (
                <div
                  key={index}
                  className="w-[350px] md:w-[380px] bg-white rounded-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-10 flex-shrink-0 hover:-translate-y-3 hover:shadow-[0_25px_70px_rgba(0,0,0,0.35)] transition-all duration-500"
                >

                  <div className="flex justify-center">

                    <div className="relative">

                      <img
                        src={student.image}
                        alt={student.name}
                        className="w-32 h-32 rounded-full border-4 border-yellow-400 object-cover"
                      />

                      <div className="absolute -bottom-2 -right-4 bg-red-700 text-white w-20 h-20 rounded-full flex items-center justify-center font-bold text-center text-sm shadow-lg">
                        {student.package}
                      </div>

                    </div>

                  </div>

                  <div className="mt-8 text-center">

                    <div className="bg-gradient-to-r from-black to-red-600 text-white py-3 rounded-xl font-bold tracking-[4px] uppercase text-lg">
                      {student.name}
                    </div>

                    <h3 className="mt-10 text-4xl font-bold text-blue-600">
                      {student.company}
                    </h3>

                    <p className="mt-4 text-gray-500">
                      Successfully placed through our
                      career acceleration program.
                    </p>

                  </div>

                </div>
              )
            )}

          </div>

        </div>

      </div>

    </section>
  );
}

export default SuccessStories;