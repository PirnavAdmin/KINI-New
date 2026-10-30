

import {
  FiMonitor,
  FiCpu,
  FiAward,
  FiShield,   // ✅ FIXED HERE
  FiLayers,
  FiFileText,
  FiVideo,
  FiUsers
} from "react-icons/fi";

export default function ProgramHighlights() {
  const items = [
    { icon: <FiMonitor className="text-blue-400" />, label: "Live Classes" },
    { icon: <FiCpu className="text-purple-400" />, label: "Industry Projects" },
    { icon: <FiAward className="text-emerald-400" />, label: "Certifications" },
    { icon: <FiShield className="text-amber-400" />, label: "Career Support" }, // ✅ updated
    { icon: <FiLayers className="text-pink-400" />, label: "Job Portal Access" },
    { icon: <FiFileText className="text-cyan-400" />, label: "Resume Building" },
    { icon: <FiVideo className="text-orange-400" />, label: "Interview Preparation" },
    { icon: <FiUsers className="text-indigo-400" />, label: "Community Access" },
  ];

  return (
    <section className="max-w-[1400px] mx-auto px-2 lg:px-8 pt-8 md:pt-10 space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-1">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          Program Highlights
        </h2>
        <p className="text-slate-400">
          A comprehensive suite of career benefits included with every enrollment.
        </p>
      </div>

      <div className="overflow-hidden relative">
        <div className="flex gap-4 w-max animate-scroll">
          {[...items, ...items].map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-sm text-center hover:bg-slate-900/60 transition-colors duration-200 group"
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </div>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}