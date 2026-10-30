import { motion } from "framer-motion";
import { FaLinkedinIn } from "react-icons/fa";

const founders = [
  {
    name: "Narendra Kadiveti",
    role: "Founder & CEO",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a",
    company: "Ex Microsoft",
    description:
      "Passionate about transforming students into industry-ready software engineers through practical learning and mentorship.",
  },
  {
    name: "Ravi Kumar",
    role: "Co-Founder & CTO",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    company: "Ex Amazon",
    description:
      "Technology leader focused on building scalable learning ecosystems and empowering future tech professionals.",
  },
];

export default function FounderSection() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 blur-[120px] rounded-full opacity-30"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-200 blur-[120px] rounded-full opacity-30"></div>

      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-20">

          <span className="uppercase tracking-[5px] text-slate-500 text-sm">
            Leadership Team
          </span>

          <h2 className="mt-4 text-5xl font-bold text-slate-900">
            Meet Our
            <span className="text-blue-600 italic font-serif ml-3">
              Founders
            </span>
          </h2>

          <p className="max-w-2xl mx-auto mt-5 text-slate-600">
            Visionaries dedicated to creating the next generation
            of industry-ready software engineers.
          </p>

        </div>

        <div className="space-y-24">

          {founders.map((founder, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >

              {/* Image */}
              <div
                className={`flex ${
                  index % 2 === 0
                    ? "justify-center lg:justify-start"
                    : "justify-center lg:justify-end"
                }`}
              >
                <div className="relative">

                  <div className="absolute inset-0 bg-blue-600 rounded-3xl blur-3xl opacity-20 scale-110"></div>

                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="relative w-[350px] h-[450px] object-cover rounded-3xl shadow-2xl"
                  />

                  <a
                    href="#"
                    className="absolute bottom-5 right-5 w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-blue-600 text-xl hover:scale-110 transition"
                  >
                    <FaLinkedinIn />
                  </a>

                </div>
              </div>

              {/* Content */}
              <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-10 shadow-xl">

                <div className="flex flex-wrap gap-3 mb-5">

                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                    {founder.role}
                  </span>

                  <span className="bg-slate-100 px-4 py-2 rounded-full text-sm">
                    {founder.company}
                  </span>

                </div>

                <h3 className="text-4xl font-bold text-slate-900">
                  {founder.name}
                </h3>

                <div className="w-24 h-1 bg-blue-600 rounded-full my-6"></div>

                <p className="text-slate-600 leading-relaxed text-lg">
                  {founder.description}
                </p>

                <div className="grid grid-cols-3 gap-5 mt-10">

                  <div className="bg-slate-50 rounded-2xl p-5 text-center">
                    <h4 className="font-bold text-2xl text-blue-600">
                      10+
                    </h4>
                    <p className="text-sm text-slate-500">
                      Years Exp
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 text-center">
                    <h4 className="font-bold text-2xl text-blue-600">
                      5000+
                    </h4>
                    <p className="text-sm text-slate-500">
                      Students
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 text-center">
                    <h4 className="font-bold text-2xl text-blue-600">
                      100+
                    </h4>
                    <p className="text-sm text-slate-500">
                      Placements
                    </p>
                  </div>

                </div>

              </div>

            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}