import { useState, useEffect, useMemo } from 'react'
import { ASSESSMENTS_MOCK } from '@shared/data/assessmentData'
import { calculateGrade, calculateAccuracy, formatTime } from '@shared/utils/gradeCalculator'

/**
 * Custom hook to load and prepare assessment results data.
 * Falls back to generating realistic mock results if no data is passed via location.state.
 *
 * @param {string} assessmentId - The assessment ID from useParams
 * @param {object} locationState - The state passed via React Router navigation
 * @returns {{ loading, error, assessment, results, stats, gradeInfo, timeInfo, topicData, pieData, strengths, weaknesses }}
 */
export function useAssessmentResults(assessmentId, locationState) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load assessment from mock data
  const assessment = useMemo(() => {
    if (!assessmentId) return null
    return ASSESSMENTS_MOCK.find(a => a.id === assessmentId) || null
  }, [assessmentId])

  // Generate results from locationState or create realistic mock results
  const results = useMemo(() => {
    if (locationState) return locationState

    // Generate realistic mock results for demo/preview
    if (assessment) {
      const totalQuestions = assessment.totalQuestions || 25
      const correct = Math.floor(totalQuestions * (0.65 + Math.random() * 0.3))
      const incorrect = Math.floor((totalQuestions - correct) * (0.6 + Math.random() * 0.2))
      const skipped = totalQuestions - correct - incorrect
      const score = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0
      const passed = score >= (assessment.passingScore || 70)
      const timeTaken = Math.floor((assessment.duration || 30) * 60 * (0.7 + Math.random() * 0.3))

      // Generate mock answers
      const answers = (assessment.questions || []).map((q, i) => {
        const answered = Math.random() > 0.15
        if (!answered) return { questionId: q.id, selectedOption: null, isCorrect: false, timeSpent: Math.floor(Math.random() * 60 + 10) }
        
        const isCorrect = Math.random() > (q.difficulty === 'hard' ? 0.5 : q.difficulty === 'medium' ? 0.3 : 0.15)
        const selectedOption = isCorrect ? q.correctAnswer : (q.type === 'multi' ? [0] : 0)
        
        return {
          questionId: q.id,
          selectedOption,
          isCorrect,
          timeSpent: Math.floor(Math.random() * 90 + 15),
        }
      })

      return {
        score,
        correct,
        incorrect,
        skipped,
        totalQuestions,
        passed,
        timeTaken,
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        category: assessment.category,
        difficulty: assessment.difficulty,
        passingScore: assessment.passingScore,
        maxAttempts: assessment.maxAttempts,
        attemptsUsed: 1,
        answers,
        rank: Math.floor(Math.random() * 50) + 1,
        totalParticipants: Math.floor(Math.random() * 200) + 50,
        completedAt: new Date().toISOString(),
      }
    }
    return null
  }, [assessment, locationState])

  // Derived data
  const stats = useMemo(() => {
    if (!results) return null
    return {
      totalQuestions: results.totalQuestions ?? 0,
      correct: results.correct ?? 0,
      incorrect: results.incorrect ?? 0,
      skipped: results.skipped ?? 0,
      answered: (results.correct ?? 0) + (results.incorrect ?? 0),
      score: results.score ?? 0,
      accuracy: calculateAccuracy(results.correct ?? 0, results.incorrect ?? 0),
      attempted: ((results.correct ?? 0) + (results.incorrect ?? 0)) / (results.totalQuestions ?? 1) * 100,
    }
  }, [results])

  const gradeInfo = useMemo(() => results ? calculateGrade(results.score ?? 0) : null, [results])
  const timeInfo = useMemo(() => results ? formatTime(results.timeTaken ?? 0) : null, [results])

  // Topic data from assessment questions
  const topicData = useMemo(() => {
    if (!assessment || !results) return []
    const topics = assessment.topicsIncluded || []
    return topics.slice(0, 6).map((topic, i) => ({
      topic,
      score: Math.max(35, Math.min(100, (results.score || 0) + (i % 3 === 0 ? 12 : i % 3 === 1 ? -8 : 3))),
      avg: 72,
      correct: Math.floor(results.totalQuestions * 0.3),
      wrong: Math.floor(results.totalQuestions * 0.1),
    }))
  }, [assessment, results])

  // Pie chart data
  const pieData = useMemo(() => {
    if (!results) return []
    return [
      { name: 'Correct', value: results.correct || 0, color: '#10B981' },
      { name: 'Incorrect', value: results.incorrect || 0, color: '#EF4444' },
      { name: 'Skipped', value: results.skipped || 0, color: '#94A3B8' },
    ].filter(d => d.value > 0)
  }, [results])

  // Skill radar data
  const skillData = useMemo(() => {
    if (!assessment || !results) return []
    return (assessment.skills || []).slice(0, 6).map((skill, i) => ({
      skill,
      value: Math.max(30, Math.min(100, (results.score || 0) + (i % 2 === 0 ? 10 : -5))),
      fullMark: 100,
    }))
  }, [assessment, results])

  // Strengths and weaknesses
  const strengths = useMemo(() => {
    if (!assessment || !results) return []
    const allTopics = assessment.topicsIncluded || []
    return allTopics.filter((_, i) => i % 2 === 0).slice(0, 4).map(t => ({
      topic: t,
      score: Math.min(100, (results.score || 0) + 15 + Math.floor(Math.random() * 10)),
      description: `Strong understanding of ${t.toLowerCase()} concepts`,
    }))
  }, [assessment, results])

  const weaknesses = useMemo(() => {
    if (!assessment || !results) return []
    const allTopics = assessment.topicsIncluded || []
    return allTopics.filter((_, i) => i % 2 === 1).slice(0, 4).map(t => ({
      topic: t,
      score: Math.max(30, (results.score || 0) - 15 - Math.floor(Math.random() * 10)),
      description: `Need improvement in ${t.toLowerCase()}`,
    }))
  }, [assessment, results])

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      if (!assessment && assessmentId) {
        setError(new Error('Assessment not found'))
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [assessment, assessmentId])

  return {
    loading,
    error,
    assessment,
    results,
    stats,
    gradeInfo,
    timeInfo,
    topicData,
    pieData,
    skillData,
    strengths,
    weaknesses,
  }
}
