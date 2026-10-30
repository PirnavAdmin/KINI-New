import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sameer Vyas",
    role: "Technical Lead",
    company: "Wipro",
    text: "The training experience was excellent. The teaching methodology was simple, effective, and highly practical. I gained confidence and improved my skills significantly.",
    rating: 5,
  },
  {
    name: "Priyanka Kulkarni",
    role: "Technical Lead",
    company: "Lumedx",
    text: "I joined to upgrade my web technology skills. The sessions, assignments, and mentor support helped me gain confidence and improve my development capabilities.",
    rating: 5,
  },
  {
    name: "Gulam Qureshi",
    role: "UI Developer",
    company: "CRMnext",
    text: "Live sessions, recordings, projects, and mentor support helped me gain confidence and improve my development skills significantly. Highly recommended!",
    rating: 5,
  },
  {
    name: "Rahul Sharma",
    role: "Full Stack Developer",
    company: "Tech Mahindra",
    text: "The structured curriculum and real-world projects made all the difference. I was able to switch careers and land my dream job within 3 months of completing the program.",
    rating: 5,
  },
  {
    name: "Anjali Deshmukh",
    role: "Data Engineer",
    company: "Amazon",
    text: "From a non-tech background to landing a role at Amazon — this program changed my life. The mentors believed in me even when I didn't believe in myself.",
    rating: 5,
  },
  {
    name: "Rohit Verma",
    role: "Frontend Developer",
    company: "Swiggy",
    text: "The projects and real-world scenarios prepared me for actual workplace challenges. I felt job-ready from day one of my new role.",
    rating: 5,
  },
];

const Testimonials = memo(function Testimonials() {
  const doubled = useMemo(() => [...TESTIMONIALS, ...TESTIMONIALS], []);

  return (
    <section
      className="relative py-20 sm:py-24 lg:py-28 overflow-hidden"
      style={{ background: "#071226" }}
    >
      {/* Top border glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(99,102,241,.3), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          data-aos="fade-up"
          data-aos-duration="800"
          className="text-center mb-14"
        >
          <p
            className="text-sm font-medium uppercase tracking-[0.2em] mb-3"
            style={{ color: "rgba(255,255,255,.35)" }}
          >
            Student Success Stories
          </p>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold"
            style={{ color: "rgba(255,255,255,.9)" }}
          >
            What Our{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #60A5FA, #A855F7)",
              }}
            >
              Graduates Say
            </span>
          </h2>
        </motion.div>

        {/* Scrolling testimonials row 1 */}
        <div className="relative mb-6" data-aos="fade-right" data-aos-duration="800">
          <div
            className="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r to-transparent pointer-events-none"
            style={{ background: "linear-gradient(90deg, #071226, transparent)" }}
          />
          <div
            className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l to-transparent pointer-events-none"
            style={{ background: "linear-gradient(270deg, #071226, transparent)" }}
          />
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 35, ease: "linear", repeat: Infinity }}
            className="flex gap-5 w-max"
          >
            {doubled.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
});

function TestimonialCard({ testimonial: t }) {
  return (
    <div
      className="w-[340px] sm:w-[380px] flex-shrink-0 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,.03)",
        border: "1px solid rgba(255,255,255,.06)",
      }}
    >
      {/* Quote icon */}
      <Quote size={20} style={{ color: "rgba(99,102,241,.3)" }} className="mb-3" />

      {/* Text */}
      <p
        className="text-sm leading-relaxed mb-4 line-clamp-3"
        style={{ color: "rgba(255,255,255,.65)" }}
      >
        "{t.text}"
      </p>

      {/* Stars */}
      <div className="flex items-center gap-0.5 mb-4">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />
        ))}
      </div>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: "linear-gradient(135deg, rgba(96,165,250,.2), rgba(168,85,247,.2))",
            color: "rgba(255,255,255,.8)",
          }}
        >
          {t.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,.85)" }}>
            {t.name}
          </p>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,.4)" }}>
            {t.role} at {t.company}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Testimonials;
