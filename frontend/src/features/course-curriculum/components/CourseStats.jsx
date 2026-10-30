import { motion } from "framer-motion";
import { Code2, FileText, ClipboardCheck, Monitor, Users, Rocket, Briefcase } from "lucide-react";

const ICON_MAP = {
  Code2, FileText, ClipboardCheck, Monitor, Users, Rocket, Briefcase,
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const CourseStats = ({ stats }) => {
  if (!stats?.length) return null;
  return (
    <section className="relative bg-white border-y border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 lg:gap-3"
        >
          {stats.map((stat, i) => {
            const Icon = ICON_MAP[stat.icon] || Code2;
            return (
              <motion.div
                key={i}
                variants={item}
                className="relative group"
              >
                <div className="bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] p-3.5 text-center hover:shadow-md hover:shadow-[#085FA7]/5 hover:border-[#085FA7]/20 transition-all duration-300">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2.5 transition-transform group-hover:scale-110 duration-300"
                    style={{ backgroundColor: `${stat.color}12` }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: stat.color }} />
                  </div>
                  <p className="text-lg font-extrabold text-[#0F172A]">{stat.value}</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default CourseStats;
