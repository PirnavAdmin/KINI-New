import { motion } from "framer-motion";
import {
  FiShield,
  FiFileText,
  FiBriefcase,
  FiAward,
  FiUsers,
  FiHeart,
} from "react-icons/fi";
import { TRUST_BADGES } from "@shared/data/mockData";

// Icon mapping per badge id
const BADGE_ICONS = {
  secure: FiShield,
  invoice: FiFileText,
  placement: FiBriefcase,
  certificate: FiAward,
  mentorship: FiUsers,
  community: FiHeart,
};

/**
 * TrustBadges
 * A grid of small icon cards communicating the value-adds and
 * security guarantees that come with enrollment.
 */
const TrustBadges = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-7 shadow-xl shadow-black/20"
    >
      <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Why students trust us</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TRUST_BADGES.map((badge, idx) => {
          const Icon = BADGE_ICONS[badge.id] ?? FiShield;
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 * idx }}
              whileHover={{ y: -3 }}
              className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-slate-900/40 p-3.5 transition-colors hover:border-cyan-400/20"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/15 to-purple-500/15">
                <Icon className="w-4.5 h-4.5 text-cyan-300" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white leading-tight">
                  {badge.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  {badge.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};

export default TrustBadges;
