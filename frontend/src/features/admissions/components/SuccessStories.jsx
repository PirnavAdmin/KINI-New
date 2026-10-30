import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { HiStar } from "react-icons/hi";

const stories = [
  {
    name: "Priya Sharma",
    role: "SDE II @ Microsoft",
    program: "Full-Stack Web Development",
    hike: "+180%",
    prev: "Junior Dev @ Local Agency",
    feedback:
      "The live classes and real project work changed everything. By Week 6 I had a portfolio that recruiters actually stopped to look at. Landed my Microsoft offer 3 months after graduating.",
    initials: "PS",
    color: "from-blue-500 to-indigo-600",
    stars: 5,
  },
  {
    name: "Arjun Mehta",
    role: "Data Analyst @ Flipkart",
    program: "Data Science & ML",
    hike: "+140%",
    prev: "Finance Analyst",
    feedback:
      "I was a career switcher with zero ML background. The structured curriculum and mock interview prep gave me the confidence to crack a data role at Flipkart in under 90 days.",
    initials: "AM",
    color: "from-indigo-500 to-violet-600",
    stars: 5,
  },
  {
    name: "Sneha Rao",
    role: "Product Manager @ Razorpay",
    program: "Product Management",
    hike: "+95%",
    prev: "Business Ops Lead",
    feedback:
      "The mentors had worked at Swiggy, Google, and Razorpay — they spoke to real hiring contexts. The mock PM interviews were harder than the actual interviews, which was exactly what I needed.",
    initials: "SR",
    color: "from-violet-500 to-purple-600",
    stars: 5,
  },
  {
    name: "Rohit Kumar",
    role: "Cloud Engineer @ Infosys",
    program: "Cloud DevOps Engineering",
    hike: "+120%",
    prev: "System Admin",
    feedback:
      "The hands-on lab projects with AWS and Kubernetes set me apart from everyone else in the interview pool. Got three offers in the first two weeks of the placement drive.",
    initials: "RK",
    color: "from-purple-500 to-fuchsia-600",
    stars: 5,
  },
  {
    name: "Divya Nair",
    role: "UX Designer @ CRED",
    program: "UI/UX Design",
    hike: "+160%",
    prev: "Graphic Designer",
    feedback:
      "Transitioning from graphic design to UX felt daunting but the program made it methodical. My capstone project actually became part of the portfolio that got me hired at CRED.",
    initials: "DN",
    color: "from-fuchsia-500 to-pink-600",
    stars: 5,
  },
];

function TestimonialCard({ story }) {
  return (
    <div className="flex-shrink-0 w-[320px] sm:w-[380px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col gap-4 hover:border-indigo-500/30 transition-all duration-300 group">
      {/* Stars */}
      <div className="flex gap-0.5">
        {[...Array(story.stars)].map((_, i) => (
          <HiStar key={i} className="text-amber-400 text-sm" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-slate-300 text-sm leading-relaxed flex-1">"{story.feedback}"</p>

      {/* Hike badge */}
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-green-500/15 border border-green-500/20 text-green-400 text-xs font-bold">
          {story.hike} Salary Hike
        </span>
        <span className="text-slate-500 text-xs">{story.program}</span>
      </div>

      {/* Person */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/5">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${story.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
          {story.initials}
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{story.name}</div>
          <div className="text-slate-400 text-xs">{story.role}</div>
          <div className="text-slate-600 text-xs">Previously: {story.prev}</div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessStories() {
  const scrollRef = useRef(null);
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true });

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 400, behavior: "smooth" });
  };

  return (
    <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[500px] h-[400px] bg-blue-700/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-4">
            Alumni Outcomes
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Real People. Real Results.
          </h2>
          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto">
            Every story here started with a single application.
          </p>
        </motion.div>

        {/* Slider */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {stories.map((story) => (
              <TestimonialCard key={story.name} story={story} />
            ))}
          </div>

          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#081028] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#081028] to-transparent" />
        </div>

        {/* Arrow controls */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => scroll(-1)}
            className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/40 flex items-center justify-center text-white transition-all duration-200"
            aria-label="Scroll left"
          >
            <FiArrowLeft />
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/40 flex items-center justify-center text-white transition-all duration-200"
            aria-label="Scroll right"
          >
            <FiArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
}