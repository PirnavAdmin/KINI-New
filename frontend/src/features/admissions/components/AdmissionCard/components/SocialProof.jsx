import { memo } from "react";
import { motion } from "framer-motion";
import { FiStar, FiCheckCircle } from "react-icons/fi";

const SocialProof = memo(function SocialProof({ proof }) {
  return (
    <div className="space-y-4">
      {/* Avatars + Rating */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex -space-x-2">
          {proof.avatars.slice(0, 5).map((url, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="w-8 h-8 rounded-full border-2 border-slate-900 overflow-hidden"
            >
              <img
                src={url}
                alt={`Student ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-[#2563EB] flex items-center justify-center text-[10px] font-bold text-white">
            +
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <FiStar
              key={i}
              className={`w-3.5 h-3.5 ${i < Math.floor(proof.rating) ? "text-amber-400 fill-amber-400" : "text-slate-600"}`}
            />
          ))}
          <span className="text-sm font-semibold text-slate-200 ml-1">
            {proof.rating}
          </span>
          <span className="text-xs text-slate-500">
            ({proof.reviewCount} reviews)
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: proof.enrolledCount, label: "Enrolled", icon: FiCheckCircle, color: "text-emerald-400" },
          { value: `${proof.placementPercentage}%`, label: "Placement Rate", icon: FiCheckCircle, color: "text-blue-400" },
          { value: proof.partnerLogos.length + "+", label: "Hiring Partners", icon: FiCheckCircle, color: "text-purple-400" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="text-center p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/40"
          >
            <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
            <p className="text-sm font-bold text-white">{stat.value}</p>
            <p className="text-[10px] text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Hiring partners */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">
          Trusted by
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {proof.partnerLogos.map((name) => (
            <span
              key={name}
              className="px-2.5 py-1 rounded-lg bg-slate-800/40 border border-slate-700/30 text-[10px] font-semibold text-slate-400"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

export default SocialProof;
