// ============================================
// FILE: context/JourneyContext.jsx
// ============================================
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const STEPS = [
  { id: 'visitor', label: 'Visitor', xp: 0 },
  { id: 'demo', label: 'Demo Class', xp: 50 },
  { id: 'enroll', label: 'Enroll', xp: 100 },
  { id: 'learning', label: 'Learning', xp: 150 },
  { id: 'practice', label: 'Practice', xp: 200 },
  { id: 'assignments', label: 'Assignments', xp: 250 },
  { id: 'projects', label: 'Projects', xp: 300 },
  { id: 'practical', label: 'Practical Sessions', xp: 350 },
  { id: 'grooming', label: 'Grooming', xp: 400 },
  { id: 'resume', label: 'Resume Building', xp: 450 },
  { id: 'linkedin', label: 'LinkedIn Optimization', xp: 500 },
  { id: 'interviews', label: 'Mock Interviews', xp: 550 },
  { id: 'assessment', label: 'Final Assessment', xp: 600 },
  { id: 'jobready', label: 'Job Ready', xp: 700 },
  { id: 'placement', label: 'Placement', xp: 850 },
  { id: 'congrats', label: 'Congratulations', xp: 1000 },
];

const SKILLS = {
  html: { label: 'HTML', levels: [0, 20, 40, 60, 80, 95] },
  css: { label: 'CSS', levels: [0, 10, 30, 50, 70, 90] },
  javascript: { label: 'JavaScript', levels: [0, 0, 20, 45, 65, 85] },
  react: { label: 'React', levels: [0, 0, 10, 35, 60, 80] },
  projects: { label: 'Projects', levels: [0, 0, 0, 20, 50, 75] },
  jobReady: { label: 'Job Ready', levels: [0, 0, 0, 0, 20, 60] },
};

const JourneyContext = createContext();

export function JourneyProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [xp, setXp] = useState(0);
  const [unlockedSteps, setUnlockedSteps] = useState([0]);
  const [achievements, setAchievements] = useState([]);
  const [counters, setCounters] = useState({
    problems: 0,
    assignments: 0,
    projects: 0,
    interviews: 0,
  });

  const calculateLevel = useCallback((xp) => {
    if (xp >= 1000) return { level: 5, label: '🌟 Job Ready' };
    if (xp >= 700) return { level: 4, label: '💼 Professional' };
    if (xp >= 400) return { level: 3, label: '🚀 Advanced' };
    if (xp >= 200) return { level: 2, label: '📚 Intermediate' };
    if (xp >= 50) return { level: 1, label: '🎯 Beginner' };
    return { level: 0, label: '👋 Visitor' };
  }, []);

  const unlockStep = useCallback((index) => {
    if (!unlockedSteps.includes(index)) {
      setUnlockedSteps(prev => [...prev, index]);
      // Trigger achievement check
      checkAchievements(index);
    }
  }, [unlockedSteps]);

  const addXP = useCallback((amount) => {
    setXp(prev => Math.min(prev + amount, 1000));
  }, []);

  const checkAchievements = useCallback((stepIndex) => {
    const newAchievements = [];
    const step = STEPS[stepIndex];
    
    if (step.id === 'assignments') {
      newAchievements.push({ id: 'first-assignment', label: '📝 First Assignment Completed', unlocked: true });
    }
    if (step.id === 'projects') {
      newAchievements.push({ id: 'first-project', label: '🏆 First Project Completed', unlocked: true });
    }
    if (step.id === 'practical') {
      newAchievements.push({ id: 'industry-project', label: '🚀 Industry Project Finished', unlocked: true });
    }
    if (step.id === 'grooming') {
      newAchievements.push({ id: 'communication', label: '🎤 Communication Master', unlocked: true });
    }
    if (step.id === 'interviews') {
      newAchievements.push({ id: 'interview-ready', label: '💼 Interview Ready', unlocked: true });
    }
    
    setAchievements(prev => [...prev, ...newAchievements.filter(a => !prev.find(p => p.id === a.id))]);
  }, []);

  const updateCounters = useCallback((stepIndex) => {
    const step = STEPS[stepIndex];
    setCounters(prev => {
      const newCounters = { ...prev };
      if (step.id === 'assignments') newCounters.assignments += 15;
      if (step.id === 'projects') newCounters.projects += 3;
      if (step.id === 'interviews') newCounters.interviews += 2;
      return newCounters;
    });
  }, []);

  const value = useMemo(() => ({
    currentStep,
    setCurrentStep,
    xp,
    addXP,
    level: calculateLevel(xp),
    unlockedSteps,
    unlockStep,
    achievements,
    counters,
    updateCounters,
    STEPS,
    SKILLS,
    isComplete: xp >= 1000,
  }), [currentStep, xp, unlockedSteps, achievements, counters]);

  return (
    <JourneyContext.Provider value={value}>
      {children}
    </JourneyContext.Provider>
  );
}

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within JourneyProvider');
  }
  return context;
};