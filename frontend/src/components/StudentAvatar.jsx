// ============================================
// FILE: components/StudentAvatar.jsx
// ============================================
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';

const StudentAvatar = ({ progress = 0 }) => {
  // Create MotionValues for smooth animations
  const progressValue = useMotionValue(progress);
  const scale = useTransform(progressValue, [0, 0.5, 1], [1, 1.2, 1.1]);
  const rotate = useTransform(progressValue, [0, 0.5, 1], [0, 5, 0]);
  const glowSize = useTransform(progressValue, [0, 1], [20, 60]);
  const opacity = useTransform(progressValue, [0, 0.1, 1], [0.3, 0.8, 1]);
  const y = useTransform(progressValue, [0, 0.5, 1], [0, -10, 0]);

  // Update the MotionValue when progress prop changes
  useEffect(() => {
    progressValue.set(progress);
  }, [progress, progressValue]);

  // Different avatar stages based on progress
  const getAvatarSVG = (progressValue) => {
    if (progressValue < 0.33) {
      // Beginner - Casual student
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Student body - casual */}
          <circle cx="50" cy="35" r="20" fill="#085FA7" opacity="0.3" stroke="#085FA7" strokeWidth="2"/>
          <circle cx="50" cy="35" r="15" fill="#085FA7" opacity="0.6"/>
          <circle cx="45" cy="32" r="2.5" fill="white"/>
          <circle cx="55" cy="32" r="2.5" fill="white"/>
          <path d="M42 42 Q50 48 58 42" stroke="white" strokeWidth="2" fill="none"/>
          {/* T-shirt */}
          <rect x="40" y="55" width="20" height="25" rx="3" fill="#5CA347" opacity="0.8"/>
          {/* Jeans */}
          <rect x="38" y="75" width="8" height="15" rx="2" fill="#085FA7" opacity="0.4"/>
          <rect x="54" y="75" width="8" height="15" rx="2" fill="#085FA7" opacity="0.4"/>
          {/* Backpack */}
          <rect x="58" y="52" width="8" height="20" rx="2" fill="#085FA7" opacity="0.4"/>
        </svg>
      );
    } else if (progressValue < 0.66) {
      // Mid journey - Laptop + Backpack
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Student with laptop */}
          <circle cx="50" cy="35" r="20" fill="#085FA7" opacity="0.3" stroke="#085FA7" strokeWidth="2"/>
          <circle cx="50" cy="35" r="15" fill="#085FA7" opacity="0.8"/>
          <circle cx="45" cy="32" r="2.5" fill="white"/>
          <circle cx="55" cy="32" r="2.5" fill="white"/>
          <path d="M42 42 Q50 48 58 42" stroke="white" strokeWidth="2" fill="none"/>
          {/* Laptop */}
          <rect x="35" y="54" width="30" height="20" rx="2" fill="#5CA347" opacity="0.9"/>
          <rect x="38" y="56" width="24" height="12" rx="1" fill="#0F172A" opacity="0.8"/>
          <rect x="46" y="74" width="8" height="2" rx="1" fill="#5CA347"/>
          {/* Backpack */}
          <rect x="60" y="50" width="12" height="22" rx="3" fill="#085FA7" opacity="0.6"/>
          <path d="M62 50 L66 44 L70 50" stroke="#085FA7" strokeWidth="2" fill="none"/>
          {/* Shoes */}
          <rect x="38" y="88" width="10" height="6" rx="3" fill="#085FA7" opacity="0.5"/>
          <rect x="52" y="88" width="10" height="6" rx="3" fill="#085FA7" opacity="0.5"/>
        </svg>
      );
    } else {
      // Professional - Suit + Certificate
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Professional with suit and certificate */}
          <circle cx="50" cy="35" r="20" fill="#085FA7" opacity="0.3" stroke="#085FA7" strokeWidth="2"/>
          <circle cx="50" cy="35" r="15" fill="#085FA7" opacity="0.9"/>
          <circle cx="45" cy="32" r="2.5" fill="white"/>
          <circle cx="55" cy="32" r="2.5" fill="white"/>
          <path d="M42 42 Q50 48 58 42" stroke="white" strokeWidth="2" fill="none"/>
          {/* Suit jacket */}
          <rect x="35" y="52" width="30" height="25" rx="3" fill="#085FA7" opacity="0.9"/>
          <line x1="50" y1="52" x2="50" y2="77" stroke="#0F172A" strokeWidth="1"/>
          <rect x="42" y="52" width="3" height="6" rx="1" fill="#5CA347"/>
          <rect x="55" y="52" width="3" height="6" rx="1" fill="#5CA347"/>
          {/* Tie */}
          <rect x="48" y="58" width="4" height="12" rx="1" fill="#5CA347" opacity="0.8"/>
          {/* Certificate */}
          <rect x="65" y="45" width="15" height="12" rx="1" fill="#5CA347" opacity="0.9"/>
          <rect x="67" y="47" width="11" height="2" rx="0.5" fill="white" opacity="0.6"/>
          <rect x="67" y="50" width="8" height="2" rx="0.5" fill="white" opacity="0.4"/>
          <rect x="67" y="53" width="6" height="2" rx="0.5" fill="white" opacity="0.3"/>
          {/* Professional shoes */}
          <rect x="36" y="88" width="12" height="6" rx="3" fill="#0F172A" opacity="0.8"/>
          <rect x="52" y="88" width="12" height="6" rx="3" fill="#0F172A" opacity="0.8"/>
        </svg>
      );
    }
  };

  return (
    <motion.div
      className="relative"
      style={{ 
        scale, 
        rotate, 
        opacity,
        y,
      }}
    >
      {/* Glow ring */}
      <motion.div
        className="absolute inset-[-20%] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(8,95,167,0.2), transparent ${glowSize}%)`,
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Shadow beneath avatar */}
      <motion.div
        className="absolute -bottom-2 left-1/2 h-2 w-12 -translate-x-1/2 rounded-full bg-black/20"
        style={{
          scale: useTransform(progressValue, [0, 0.5, 1], [0.8, 1.2, 0.8]),
          opacity: useTransform(progressValue, [0, 0.5, 1], [0.3, 0.6, 0.3]),
        }}
      />
      
      {/* Avatar SVG */}
      <div className="relative w-16 h-16 md:w-20 md:h-20">
        {getAvatarSVG(progress)}
      </div>

      {/* Status indicator */}
      <motion.div
        className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#0F172A]"
        style={{
          backgroundColor: progress < 0.33 ? '#5CA347' : progress < 0.66 ? '#2EA7E0' : '#085FA7',
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

export default StudentAvatar;