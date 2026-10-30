// ============================================
// FILE: components/SkillProgress.jsx
// ============================================
import { motion } from 'framer-motion';
import { useJourney } from '../shared/context/JourneyContext';

const SkillProgress = () => {
  const { SKILLS, currentStep } = useJourney();
  
  const getSkillValue = (skillKey) => {
    const skill = SKILLS[skillKey];
    const stepIndex = Math.min(currentStep, skill.levels.length - 1);
    return skill.levels[stepIndex] || 0;
  };

  const skills = Object.entries(SKILLS).map(([key, skill]) => ({
    key,
    label: skill.label,
    value: getSkillValue(key),
  }));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <h3 className="mb-4 text-sm font-semibold text-white">Skill Progression</h3>
      <div className="space-y-3">
        {skills.map(({ key, label, value }) => (
          <div key={key}>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">{label}</span>
              <span className="text-white">{value}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#085FA7] to-[#5CA347]"
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillProgress;