/**
 * Grade utility functions for assessment results
 */

/**
 * Calculate letter grade from percentage score
 * @param {number} score - Percentage score (0-100)
 * @returns {{ grade: string, label: string, color: string }}
 */
export function calculateGrade(score) {
  if (score >= 95) return { grade: 'A+', label: 'Outstanding', color: '#10B981' }
  if (score >= 90) return { grade: 'A', label: 'Excellent', color: '#10B981' }
  if (score >= 85) return { grade: 'A-', label: 'Very Good', color: '#34D399' }
  if (score >= 80) return { grade: 'B+', label: 'Good', color: '#3B82F6' }
  if (score >= 75) return { grade: 'B', label: 'Above Average', color: '#3B82F6' }
  if (score >= 70) return { grade: 'B-', label: 'Average', color: '#F59E0B' }
  if (score >= 65) return { grade: 'C+', label: 'Below Average', color: '#F59E0B' }
  if (score >= 60) return { grade: 'C', label: 'Needs Improvement', color: '#F97316' }
  if (score >= 50) return { grade: 'D', label: 'Poor', color: '#EF4444' }
  return { grade: 'F', label: 'Fail', color: '#DC2626' }
}

/**
 * Calculate accuracy percentage
 * @param {number} correct
 * @param {number} incorrect
 * @returns {number}
 */
export function calculateAccuracy(correct, incorrect) {
  const total = correct + incorrect
  return total > 0 ? Math.round((correct / total) * 100) : 0
}

/**
 * Format time duration
 * @param {number} seconds
 * @returns {{ formatted: string, minutes: number, seconds: number }}
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return {
    formatted: mins > 0 ? `${mins}m ${secs}s` : `${secs}s`,
    minutes: mins,
    seconds: secs,
  }
}

/**
 * Calculate average time per question
 * @param {number} totalSeconds
 * @param {number} totalQuestions
 * @returns {string}
 */
export function averageTimePerQuestion(totalSeconds, totalQuestions) {
  if (!totalQuestions || totalQuestions === 0) return '0s'
  const avg = Math.round(totalSeconds / totalQuestions)
  return avg > 60 ? `${Math.floor(avg / 60)}m ${avg % 60}s` : `${avg}s`
}

/**
 * Get mastery level based on topic score
 * @param {number} score - Topic score percentage (0-100)
 * @returns {{ label: string, color: string, icon: string }}
 */
export function getMasteryLevel(score) {
  if (score >= 90) return { label: 'Expert', color: '#10B981', icon: '🌟' }
  if (score >= 75) return { label: 'Advanced', color: '#3B82F6', icon: '⭐' }
  if (score >= 60) return { label: 'Intermediate', color: '#F59E0B', icon: '📗' }
  if (score >= 40) return { label: 'Beginner', color: '#F97316', icon: '📖' }
  return { label: 'Needs Work', color: '#EF4444', icon: '📘' }
}
