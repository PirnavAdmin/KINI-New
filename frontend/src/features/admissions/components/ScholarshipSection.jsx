import { motion } from "framer-motion";
import { FiAward, FiUsers, FiClock, FiStar } from "react-icons/fi";

export default function Scholarships() {
  const lists = [
    { icon: <FiAward className="text-amber-400" />, pct: "Up to 30% Off", title: "Merit Scholarship", desc: "Awarded to high achievers with stellar academic track records or proven technical skillsets." },
    { icon: <FiUsers className="text-purple-400" />, pct: "Up to 20% Off", title: "Women In Tech Scholarship", desc: "Dedicated initiative seeking to foster diverse parity by supporting female technology leaders." },
    { icon: <FiClock className="text-blue-400" />, pct: "Up to 15% Off", title: "Early Bird Scholarship", desc: "Applicable directly to early submissions processing applications prior to first cutoff waves." },
    { icon: <FiStar className="text-emerald-400" />, pct: "Up to 20% Off", title: "Veteran Scholarship", desc: "Tailored to offer professional adjustments favoring transitioning service veterans." },
  ];

  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Scholarships Available</h2>
        <p className="text-slate-400">Merit and equity-based frameworks built to ease financial pathways.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {lists.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition-colors group"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">{item.title.split(" ")[0]} Bracket</span>
              </div>
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                {item.pct}
              </div>
              <h3 className="text-md font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}