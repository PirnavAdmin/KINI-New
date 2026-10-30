import { memo } from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiPlayCircle, FiTrendingUp, FiShield } from "react-icons/fi";
import CountdownTimer from "./CountdownTimer";
import SocialProof from "./SocialProof";
import CTASection from "./CTASection";

const HeroSection = memo(function HeroSection({ data, onPrimary, onSecondary, loading }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      {/* Left Column — Content */}
      <div className="space-y-6">
        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300 text-xs font-semibold tracking-wide backdrop-blur-md"
        >
          <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          {data.badge}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.08]"
        >
          {data.headline}{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            {data.headlineAccent}
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
          className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl"
        >
          {data.description}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CTASection
            primaryLabel={data.primaryCTA}
            secondaryLabel={data.secondaryCTA}
            onPrimary={onPrimary}
            onSecondary={onSecondary}
            loading={loading}
          />
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
        >
          <SocialProof proof={data.socialProof} />
        </motion.div>
      </div>

      {/* Right Column — Visual + Urgency */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="space-y-5"
      >
        {/* Urgency Module */}
        <CountdownTimer urgency={data.urgency} />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {data.stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="rounded-xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-sm p-3 text-center hover:border-slate-700/40 transition-colors"
            >
              <p className="text-base font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {[
            { icon: FiTrendingUp, text: "Career-focused curriculum", color: "text-emerald-400" },
            { icon: FiShield, text: "Placement until hired", color: "text-blue-400" },
            { icon: FiPlayCircle, text: "Live interactive sessions", color: "text-purple-400" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <item.icon className={`w-3 h-3 ${item.color}`} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
});

export default HeroSection;
