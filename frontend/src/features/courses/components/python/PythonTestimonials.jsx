import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Ravi Kumar",
    text: "This course helped me land a job at Amazon!",
  },
  {
    name: "Sneha Reddy",
    text: "Best mentorship experience ever.",
  },
  {
    name: "Arjun",
    text: "Real projects + guidance = success.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-black overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center mb-12">
          What Students Say
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
            >
              <p className="text-slate-300">"{t.text}"</p>
              <h4 className="mt-4 font-semibold">{t.name}</h4>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;