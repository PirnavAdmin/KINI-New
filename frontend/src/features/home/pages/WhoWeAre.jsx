import {
  FaUserGraduate,
  FaLaptopCode,
  FaChalkboardTeacher,
  FaBriefcase,
} from "react-icons/fa";

function WhoWeAre() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <p className="text-center uppercase tracking-[5px] text-slate-500">
          About Us
        </p>

        <h2 className="text-center text-5xl font-bold mt-4">
          Who Are We
        </h2>

        <div className="mt-12 bg-gradient-to-r from-slate-950 to-blue-700 rounded-3xl p-10 text-white text-center">

          <p className="text-2xl font-medium leading-relaxed">
            We build industry-ready engineers through structured
            learning, mentorship and placement support.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">

          <div className="bg-blue-50 p-8 rounded-2xl">
            <FaLaptopCode size={35} />
            <h3 className="font-bold mt-5">
              Industry Curriculum
            </h3>
          </div>

          <div className="bg-blue-50 p-8 rounded-2xl">
            <FaChalkboardTeacher size={35} />
            <h3 className="font-bold mt-5">
              Live Mentorship
            </h3>
          </div>

          <div className="bg-blue-50 p-8 rounded-2xl">
            <FaUserGraduate size={35} />
            <h3 className="font-bold mt-5">
              Real Projects
            </h3>
          </div>

          <div className="bg-blue-50 p-8 rounded-2xl">
            <FaBriefcase size={35} />
            <h3 className="font-bold mt-5">
              Placement Support
            </h3>
          </div>

        </div>
      </div>
    </section>
  );
}

export default WhoWeAre;