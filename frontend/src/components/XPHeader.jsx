// ============================================
// FILE: components/XPHeader.jsx
// ============================================
import { motion } from 'framer-motion';
import { useJourney } from '../shared/context/JourneyContext';
import AnimatedCounter from './ui/AnimatedCounter';

const XPHeader = () => {
  const { xp, level } = useJourney();
  const xpPercent = Math.min((xp / 1000) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 mb-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#085FA7] to-[#5CA347] p-[2px]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0F172A] text-2xl">
              {level.emoji || '🎯'}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400">Student Level</p>
            <p className="text-2xl font-bold text-white">{level.label}</p>
            <p className="text-xs text-gray-500">
              XP: <AnimatedCounter value={xp} /> / 1000
            </p>
          </div>
        </div>

        <div className="flex-1">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#085FA7] to-[#5CA347]"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="h-2 w-2 rounded-full bg-white"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Level 0</span>
            <span>Level 5</span>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="text-center">
            <p className="text-xl font-bold text-white">
              <AnimatedCounter value={Math.floor(xp / 50)} />
            </p>
            <p className="text-[10px] text-gray-500">Missions</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">
              <AnimatedCounter value={Math.floor(xp / 100)} />
            </p>
            <p className="text-[10px] text-gray-500">Badges</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default XPHeader;