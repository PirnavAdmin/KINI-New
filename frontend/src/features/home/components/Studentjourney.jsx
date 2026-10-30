// StudentJourneyExperience.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// ============================================
// SCENES — Each is a complete emotional moment
// ============================================

const SCENES = [
  {
    id: 'campus',
    title: 'First Day',
    subtitle: 'Nervous. Excited. Ready.',
    emotion: 'anticipation',
    background: 'bg-gradient-to-b from-sky-400 to-blue-600',
    studentPose: 'standing_looking_up',
    elements: ['birds', 'trees', 'sunlight_rays', 'campus_buildings'],
    speech: '...this is it. My first step.'
  },
  {
    id: 'demo',
    title: 'The Demo Class',
    subtitle: 'This is what I want to build.',
    emotion: 'wonder',
    background: 'bg-gradient-to-b from-indigo-500 to-purple-700',
    studentPose: 'watching_amazed',
    elements: ['floating_code', 'laptop_glow', 'projector_light'],
    speech: 'Wait... I can build THAT?'
  },
  {
    id: 'enroll',
    title: 'Official Student',
    subtitle: 'ID card. Laptop. Dream.',
    emotion: 'pride',
    background: 'bg-gradient-to-b from-emerald-500 to-teal-700',
    studentPose: 'holding_id_card',
    elements: ['id_card_glow', 'confetti_sparkles', 'laptop'],
    speech: 'I\'m really doing this.'
  },
  {
    id: 'learn',
    title: 'Late Night Study',
    subtitle: 'Confusion. Frustration. Breakthrough.',
    emotion: 'struggle',
    background: 'bg-gradient-to-b from-slate-700 to-slate-900',
    studentPose: 'studying_intense',
    elements: ['floating_equations', 'coffee_mug', 'monitor_glow'],
    speech: 'Okay... okay... I think I get it...'
  },
  {
    id: 'practice',
    title: 'First Project',
    subtitle: 'It works. It actually works.',
    emotion: 'triumph',
    background: 'bg-gradient-to-b from-amber-500 to-orange-700',
    studentPose: 'celebrating_hands_up',
    elements: ['rocket', 'github_stars', 'deploy_animation'],
    speech: '🎉 FIRST PROJECT DEPLOYED!'
  },
  {
    id: 'interview',
    title: 'Mock Interview',
    subtitle: 'Sweaty. Nervous. But ready.',
    emotion: 'determination',
    background: 'bg-gradient-to-b from-blue-800 to-indigo-900',
    studentPose: 'interview_confident',
    elements: ['floating_questions', 'confidence_aura', 'tie_adjust'],
    speech: 'I\'ve prepared for this moment.'
  },
  {
    id: 'placement',
    title: 'The Offer',
    subtitle: 'Everything led to this.',
    emotion: 'joy',
    background: 'bg-gradient-to-b from-green-500 to-emerald-800',
    studentPose: 'jumping_celebration',
    elements: ['confetti_rain', 'offer_letter', 'sparkles'],
    speech: 'I GOT THE JOB! 🚀'
  },
  {
    id: 'dream',
    title: 'Software Engineer',
    subtitle: 'The journey. The transformation.',
    emotion: 'fulfillment',
    background: 'bg-gradient-to-b from-purple-600 to-pink-800',
    studentPose: 'standing_proud',
    elements: ['level_up_100', 'certificate', 'aura_glow'],
    speech: 'From student to software engineer.'
  }
];

// ============================================
// SVG STUDENT — The Hero (detailed, expressive)
// ============================================

const StudentAvatar = ({ pose, emotion, size = 120 }) => {
  const poses = {
    standing_looking_up: { head: 0, arms: 'down', eyes: 'up' },
    watching_amazed: { head: 15, arms: 'open', eyes: 'wide' },
    holding_id_card: { head: 0, arms: 'holding', eyes: 'proud' },
    studying_intense: { head: -20, arms: 'typing', eyes: 'focused' },
    celebrating_hands_up: { head: 0, arms: 'up', eyes: 'happy' },
    interview_confident: { head: 0, arms: 'crossed', eyes: 'confident' },
    jumping_celebration: { head: 0, arms: 'up', eyes: 'ecstatic' },
    standing_proud: { head: 0, arms: 'down', eyes: 'proud' }
  };

  const currentPose = poses[pose] || poses.standing_looking_up;

  return (
    <motion.svg
      width={size}
      height={size * 1.6}
      viewBox="0 0 100 160"
      fill="none"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, type: 'spring' }}
    >
      {/* Aura glow */}
      <motion.circle
        cx="50"
        cy="60"
        r="50"
        fill="currentColor"
        className="text-purple-500/20"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Body */}
      <rect x="35" y="55" width="30" height="40" rx="8" fill="#6366F1" />
      
      {/* Head */}
      <motion.circle
        cx="50"
        cy="40"
        r="22"
        fill="#FCD34D"
        animate={{ rotate: currentPose.head }}
      />

      {/* Hair */}
      <path d="M28 40 Q50 15 72 40" fill="#78350F" />

      {/* Eyes */}
      <motion.rect
        x="40"
        y="35"
        width="8"
        height="6"
        rx="3"
        fill="#1E293B"
        animate={{ y: currentPose.eyes === 'up' ? 33 : currentPose.eyes === 'wide' ? 34 : 35 }}
      />
      <motion.rect
        x="52"
        y="35"
        width="8"
        height="6"
        rx="3"
        fill="#1E293B"
        animate={{ y: currentPose.eyes === 'up' ? 33 : currentPose.eyes === 'wide' ? 34 : 35 }}
      />

      {/* Mouth — emotional expression */}
      <motion.path
        d={
          emotion === 'joy' ? "M42 48 Q50 55 58 48" :
          emotion === 'wonder' ? "M43 48 Q50 52 57 48" :
          emotion === 'struggle' ? "M43 50 Q50 46 57 50" :
          emotion === 'triumph' ? "M42 48 Q50 56 58 48" :
          "M44 49 Q50 52 56 49"
        }
        stroke="#1E293B"
        strokeWidth="2"
        fill="none"
      />

      {/* Arms */}
      <motion.g>
        {currentPose.arms === 'up' && (
          <>
            <line x1="30" y1="65" x2="15" y2="40" stroke="#6366F1" strokeWidth="6" strokeLinecap="round" />
            <line x1="70" y1="65" x2="85" y2="40" stroke="#6366F1" strokeWidth="6" strokeLinecap="round" />
          </>
        )}
        {currentPose.arms === 'open' && (
          <>
            <line x1="30" y1="65" x2="10" y2="60" stroke="#6366F1" strokeWidth="6" strokeLinecap="round" />
            <line x1="70" y1="65" x2="90" y2="60" stroke="#6366F1" strokeWidth="6" strokeLinecap="round" />
          </>
        )}
        {currentPose.arms === 'typing' && (
          <>
            <line x1="30" y1="65" x2="20" y2="80" stroke="#6366F1" strokeWidth="6" strokeLinecap="round" />
            <line x1="70" y1="65" x2="80" y2="80" stroke="#6366F1" strokeWidth="6" strokeLinecap="round" />
          </>
        )}
        {(currentPose.arms === 'down' || currentPose.arms === 'holding') && (
          <>
            <line x1="30" y1="65" x2="20" y2="85" stroke="#6366F1" strokeWidth="6" strokeLinecap="round" />
            <line x1="70" y1="65" x2="80" y2="85" stroke="#6366F1" strokeWidth="6" strokeLinecap="round" />
          </>
        )}
      </motion.g>

      {/* Legs */}
      <line x1="42" y1="95" x2="38" y2="130" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
      <line x1="58" y1="95" x2="62" y2="130" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />

      {/* Shoes */}
      <ellipse cx="38" cy="132" rx="8" ry="4" fill="#1E293B" />
      <ellipse cx="62" cy="132" rx="8" ry="4" fill="#1E293B" />
    </motion.svg>
  );
};

// ============================================
// SPEECH BUBBLE — Manga/Anime style
// ============================================

const SpeechBubble = ({ text, isVisible }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="absolute -top-20 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-2xl border-2 border-black"
        style={{ maxWidth: '280px' }}
      >
        {/* Bubble tail */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-black" />
        
        <p className="text-sm font-bold text-gray-800 text-center">
          {text}
        </p>
      </motion.div>
    )}
  </AnimatePresence>
);

// ============================================
// ENVIRONMENT ELEMENTS — Studio Ghibli atmosphere
// ============================================

const Environment = ({ scene }) => {
  const elements = {
    birds: (
      <motion.div
        className="absolute"
        animate={{ x: [0, 100, 200], y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <span className="text-2xl">🐦</span>
      </motion.div>
    ),
    sunlight_rays: (
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-200/20 to-transparent" />
    ),
    floating_code: (
      <motion.div
        className="absolute right-10 top-20 font-mono text-sm text-green-400/60"
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {`<div className="hero">`}
      </motion.div>
    ),
    rocket: (
      <motion.div
        className="absolute right-20 bottom-20 text-4xl"
        animate={{ y: [0, -50, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🚀
      </motion.div>
    ),
    confetti_rain: (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF'][i % 4],
              left: `${Math.random() * 100}%`,
              top: '-10px'
            }}
            animate={{
              y: ['0vh', '110vh'],
              x: [`${Math.random() * 100 - 50}px`, `${Math.random() * 100 - 50}px`],
              rotate: [0, 720]
            }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() }}
          />
        ))}
      </div>
    ),
    level_up_100: (
      <motion.div
        className="absolute right-10 top-10 text-6xl font-black text-yellow-400"
        animate={{ scale: [0.8, 1.2, 0.8], rotate: [-5, 5, -5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        LEVEL 100
      </motion.div>
    )
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {scene.elements?.map((el) => (
        <div key={el}>{elements[el]}</div>
      ))}
    </div>
  );
};

// ============================================
// MAIN COMPONENT — StudentJourneyExperience
// ============================================

export const StudentJourneyExperience = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [showSpeech, setShowSpeech] = useState(true);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Map scroll to scenes
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((value) => {
      const sceneIndex = Math.min(
        Math.floor(value * SCENES.length),
        SCENES.length - 1
      );
      if (sceneIndex !== currentScene) {
        setCurrentScene(sceneIndex);
        setShowSpeech(true);
        setTimeout(() => setShowSpeech(false), 3000);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, currentScene]);

  const scene = SCENES[currentScene];

  return (
    <div ref={containerRef} className="relative h-[800vh]">
      {/* Sticky container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background — cinematic transitions */}
        <motion.div
          className={`absolute inset-0 transition-colors duration-1000 ${scene.background}`}
          animate={{ opacity: 1 }}
        />

        {/* Environment — Ghibli atmosphere */}
        <Environment scene={scene} />

        {/* Student — The Hero, always visible */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <StudentAvatar
            pose={scene.studentPose}
            emotion={scene.emotion}
            size={160}
          />
        </div>

        {/* Speech bubble — Anime style */}
        <SpeechBubble text={scene.speech} isVisible={showSpeech} />

        {/* Scene title — cinematic overlay */}
        <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-white drop-shadow-2xl">
            {scene.title}
          </h2>
          <p className="text-lg text-white/80 mt-2 font-medium">
            {scene.subtitle}
          </p>
        </motion.div>

        {/* Progress indicator — minimal */}
        <div className="absolute bottom-10 right-10 text-white/40 text-sm font-mono">
          {currentScene + 1} / {SCENES.length}
        </div>
      </div>
    </div>
  );
};

export default StudentJourneyExperience;