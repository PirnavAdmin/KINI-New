import { memo } from "react";
import { motion } from "framer-motion";

const iconGradientMap = {
  "from-blue-500 to-cyan-500": "group-hover:shadow-blue-500/10",
  "from-purple-500 to-pink-500": "group-hover:shadow-purple-500/10",
  "from-emerald-500 to-teal-500": "group-hover:shadow-emerald-500/10",
  "from-amber-500 to-orange-500": "group-hover:shadow-amber-500/10",
  "from-rose-500 to-red-500": "group-hover:shadow-rose-500/10",
  "from-cyan-500 to-blue-500": "group-hover:shadow-cyan-500/10",
};

const iconBgMap = {
  "from-blue-500 to-cyan-500":
    "from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500 group-hover:to-cyan-500",
  "from-purple-500 to-pink-500":
    "from-purple-500/20 to-pink-500/20 group-hover:from-purple-500 group-hover:to-pink-500",
  "from-emerald-500 to-teal-500":
    "from-emerald-500/20 to-teal-500/20 group-hover:from-emerald-500 group-hover:to-teal-500",
  "from-amber-500 to-orange-500":
    "from-amber-500/20 to-orange-500/20 group-hover:from-amber-500 group-hover:to-orange-500",
  "from-rose-500 to-red-500":
    "from-rose-500/20 to-red-500/20 group-hover:from-rose-500 group-hover:to-red-500",
  "from-cyan-500 to-blue-500":
    "from-cyan-500/20 to-blue-500/20 group-hover:from-cyan-500 group-hover:to-blue-500",
};

const iconColorMap = {
  "from-blue-500 to-cyan-500": "text-blue-600 group-hover:text-white",
  "from-purple-500 to-pink-500": "text-purple-600 group-hover:text-white",
  "from-emerald-500 to-teal-500": "text-emerald-600 group-hover:text-white",
  "from-amber-500 to-orange-500": "text-amber-600 group-hover:text-white",
  "from-rose-500 to-red-500": "text-rose-600 group-hover:text-white",
  "from-cyan-500 to-blue-500": "text-cyan-600 group-hover:text-white",
};

const FeatureCard = memo(({ feature, index, variants: customVariants }) => {
  const Icon = feature.icon;
  const shadowClass = iconGradientMap[feature.gradient];
  const bgClass = iconBgMap[feature.gradient];
  const colorClass = iconColorMap[feature.gradient];
  const v = customVariants;

  return (
    <motion.div
      custom={index}
      variants={v}
      initial="hidden"
      animate="visible"
      className="group relative flex flex-col gap-3 px-4 py-4 sm:px-5 sm:py-5 rounded-2xl bg-white border border-slate-100 hover:border-transparent shadow-sm hover:shadow-xl transition-all duration-300 cursor-default"
    >
      {/* Hover gradient overlay */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300 pointer-events-none`}
      />

      {/* Icon container */}
      <div
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${bgClass} transition-all duration-300 shadow-sm ${shadowClass}`}
        aria-hidden="true"
      >
        <Icon className={`text-lg transition-colors duration-300 ${colorClass}`} />
      </div>

      {/* Title + Description */}
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
          {feature.title}
        </h3>
        <p className="text-xs leading-relaxed text-slate-500 group-hover:text-slate-600 transition-colors">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
});

FeatureCard.displayName = "FeatureCard";
export default FeatureCard;
