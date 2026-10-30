/**
 * Score calculation utilities for assessment results
 */

/**
 * Calculate percentage score
 * @param {number} obtained - Marks obtained
 * @param {number} total - Total marks
 * @returns {number}
 */
export function calculatePercentage(obtained, total) {
  if (!total || total === 0) return 0
  return Math.round((obtained / total) * 100)
}

/**
 * Calculate topic-wise performance from answers
 * @param {Array} questions - Assessment questions with topic info
 * @param {Array} answers - User's answers
 * @returns {Array<{ topic: string, score: number, correct: number, wrong: number, total: number }>}
 */
export function calculateTopicPerformance(questions = [], answers = []) {
  const topicMap = {}
  
  questions.forEach((q) => {
    const topic = q.topic || q.category || 'General'
    if (!topicMap[topic]) {
      topicMap[topic] = { topic, correct: 0, wrong: 0, skipped: 0, total: 0 }
    }
    
    const userAnswer = answers.find(a => a.questionId === q.id)
    const isCorrect = userAnswer && checkAnswer(q, userAnswer.selectedOption)
    
    topicMap[topic].total += 1
    if (isCorrect) topicMap[topic].correct += 1
    else if (userAnswer?.selectedOption !== undefined && userAnswer?.selectedOption !== null) topicMap[topic].wrong += 1
    else topicMap[topic].skipped += 1
  })

  return Object.values(topicMap).map(t => ({
    ...t,
    score: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
  }))
}

/**
 * Check if user's answer is correct based on question type
 * @param {Object} question
 * @param {any} userAnswer
 * @returns {boolean}
 */
export function checkAnswer(question, userAnswer) {
  if (userAnswer === undefined || userAnswer === null) return false
  
  if (question.type === 'single' || question.type === 'truefalse') {
    return userAnswer === question.correctAnswer
  }
  
  if (question.type === 'multi') {
    if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) return false
    if (userAnswer.length !== question.correctAnswer.length) return false
    return userAnswer.every(a => question.correctAnswer.includes(a))
  }
  
  if (question.type === 'fill') {
    return String(userAnswer).toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim()
  }
  
  return false
}

/**
 * Calculate overall statistics from results
 * @param {Object} params
 * @returns {Object}
 */
export function calculateOverallStats({ score, correct, incorrect, skipped, totalQuestions, timeTaken }) {
  return {
    score: score ?? 0,
    correct: correct ?? 0,
    incorrect: incorrect ?? 0,
    skipped: skipped ?? 0,
    totalQuestions: totalQuestions ?? 0,
    answered: (correct ?? 0) + (incorrect ?? 0),
    accuracy: calculateAccuracy(correct ?? 0, incorrect ?? 0),
    attempted: ((correct ?? 0) + (incorrect ?? 0)) / (totalQuestions ?? 1) * 100,
    timeTaken: timeTaken ?? 0,
  }
}

/**
 * Calculate accuracy
 */
function calculateAccuracy(correct, incorrect) {
  const total = correct + incorrect
  return total > 0 ? Math.round((correct / total) * 100) : 0
}
