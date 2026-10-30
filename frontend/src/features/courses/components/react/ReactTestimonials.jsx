import { motion } from "framer-motion";
import {
  FaStar,
  FaQuoteLeft,
  FaBriefcase,
} from "react-icons/fa";

const reactTestimonials = [
  {
    name: "Kiran Kumar",
    role: "React Developer @ Infosys",
    text: "Got placed as a React Developer within 4 months. The projects and interview preparation helped me crack multiple offers.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Anjali Sharma",
    role: "Frontend Engineer @ TCS",
    text: "One of the best React programs I've taken. Real-world projects, mentorship, and placement support were outstanding.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Suresh Reddy",
    role: "UI Developer @ Accenture",
    text: "The practical learning approach made a huge difference. I built a strong portfolio and gained confidence in React.",
    image: "https://randomuser.me/api/portraits/men/55.jpg",
  },
];

export default function ReactTestimonials() {
  return (
    <section className="relative py-32 overflow-hidden bg-[#030712]">

      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[180px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[180px]" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-500/5 blur-[220px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-20">

          <div
            className="
              inline-flex
              items-center
              px-5
              py-2
              rounded-full
              border
              border-cyan-500/20
              bg-white/5
              backdrop-blur-xl
              text-cyan-300
              text-sm
              font-medium
            "
          >
            ⭐ Success Stories
          </div>

          <h2 className="mt-6 text-5xl md:text-6xl font-bold text-white">
            Student
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Testimonials
            </span>
          </h2>

          <p className="mt-6 text-slate-400 max-w-2xl mx-auto text-lg">
            Hear from our successful learners who transformed their careers
            through hands-on React training and mentorship.
          </p>

        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 text-center">
            <h3 className="text-4xl font-bold text-cyan-400">
              5000+
            </h3>
            <p className="text-slate-400 mt-2">
              Students Trained
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 text-center">
            <h3 className="text-4xl font-bold text-blue-400">
              95%
            </h3>
            <p className="text-slate-400 mt-2">
              Placement Rate
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 text-center">
            <h3 className="text-4xl font-bold text-purple-400">
              ₹8LPA
            </h3>
            <p className="text-slate-400 mt-2">
              Average Package
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 text-center">
            <h3 className="text-4xl font-bold text-green-400">
              4.9★
            </h3>
            <p className="text-slate-400 mt-2">
              Student Rating
            </p>
          </div>

        </div>

        {/* Testimonial Cards */}
        <div className="grid lg:grid-cols-3 gap-8">

          {reactTestimonials.map((student, index) => (
            <motion.div
              key={index}
              whileHover={{
                y: -10,
              }}
              transition={{
                duration: 0.3,
              }}
              className="
                group
                relative
                overflow-hidden
                rounded-[30px]
                border
                border-white/10
                bg-white/[0.04]
                backdrop-blur-2xl
                p-8
                hover:border-cyan-400/30
                transition-all
                duration-500
              "
            >
              {/* Hover Glow */}
              <div
                className="
                  absolute
                  inset-0
                  opacity-0
                  group-hover:opacity-100
                  transition
                  duration-500
                  bg-gradient-to-br
                  from-cyan-500/10
                  via-blue-500/5
                  to-purple-500/10
                "
              />

              <div className="relative z-10">

                {/* Quote Icon */}
                <FaQuoteLeft className="text-cyan-400 text-3xl mb-5" />

                {/* Review */}
                <p className="text-slate-300 leading-relaxed text-lg">
                  "{student.text}"
                </p>

                {/* Stars */}
                <div className="flex gap-1 mt-5">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className="text-yellow-400"
                    />
                  ))}
                </div>

                {/* User */}
                <div className="flex items-center gap-4 mt-8">

                  <img
                    src={student.image}
                    alt={student.name}
                    className="
                      w-14
                      h-14
                      rounded-full
                      object-cover
                      border-2
                      border-cyan-400/30
                    "
                  />

                  <div>
                    <h4 className="text-white font-bold">
                      {student.name}
                    </h4>

                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <FaBriefcase />
                      {student.role}
                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          ))}

        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">

          <div
            className="
              max-w-4xl
              mx-auto
              rounded-[32px]
              border
              border-white/10
              bg-white/[0.04]
              backdrop-blur-2xl
              p-10
            "
          >
            <h3 className="text-3xl font-bold text-white">
              Ready To Become Our Next Success Story?
            </h3>

            <p className="mt-4 text-slate-400">
              Join thousands of learners who launched successful careers
              with our React training program.
            </p>

            <button
              className="
                mt-8
                px-10
                py-4
                rounded-2xl
                text-white
                font-semibold
                bg-gradient-to-r
                from-cyan-500
                via-blue-500
                to-purple-600
                shadow-[0_20px_60px_rgba(59,130,246,0.35)]
                hover:scale-105
                transition-all
                duration-300
              "
            >
              Start Your Journey →
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}