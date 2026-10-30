// ============================================
// FILE: components/FinalCelebration.jsx
// ============================================
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

const FinalCelebration = ({ isComplete }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (isComplete) {
      setShowConfetti(true);
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  if (!isComplete) return null;

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#085FA7', '#5CA347', '#2EA7E0', '#F59E0B', '#EF4444']}
        />
      )}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-8 rounded-3xl border border-white/20 bg-gradient-to-br from-[#085FA7]/20 to-[#5CA347]/20 p-8 text-center backdrop-blur-xl"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-4 text-6xl"
        >
          🎓
        </motion.div>
        
        <h2 className="text-3xl font-bold text-white">Congratulations!</h2>
        <p className="mt-2 text-gray-300">
          You've completed the entire journey and are now job-ready!
        </p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-6 flex flex-wrap justify-center gap-4"
        >
          <button className="rounded-full bg-gradient-to-r from-[#085FA7] to-[#5CA347] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[#085FA7]/30 transition-transform hover:scale-105">
            🏆 Download Certificate
          </button>
          <button className="rounded-full border border-white/20 px-8 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10">
            🚀 Explore Placements
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {['🌟 350+ Problems', '📝 120+ Assignments', '🚀 25+ Projects', '💼 20+ Interviews'].map((stat, i) => (
            <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-gray-400">Achievement</p>
              <p className="text-sm font-bold text-white">{stat}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </>
  );
};

export default FinalCelebration;