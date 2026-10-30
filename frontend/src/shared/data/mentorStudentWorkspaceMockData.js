// Mock data for the Mentor "Student Workspace" page (per-student deep-dive
// opened from a batch's Students tab). Swap for real API calls once the
// backend exposes mentor-scoped student endpoints — consumers only read
// these shapes, never how they're produced.

export { findStudentById } from './mentorBatchWorkspaceMockData'

const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export const generateLearningProgress = (student, batch) => {
  if (!student || !batch) return null
  const totalModules = batch.totalModules || 8
  const exactCompletedModules = Math.max(0, Math.min(totalModules, (student.progressPct / 100) * totalModules))
  const completedModules = Math.floor(exactCompletedModules)
  const activeModuleProgress = Math.round((exactCompletedModules - completedModules) * 100)
  const lessonsPerModule = 5
  const totalLessons = totalModules * lessonsPerModule
  const completedLessons = Math.round((student.progressPct / 100) * totalLessons)
  return {
    courseProgress: student.progressPct,
    completedModules,
    totalModules,
    modules: Array.from({ length: totalModules }, (_, i) => ({
      name: `Module ${i + 1}`,
      progress: i < completedModules ? 100 : i === completedModules && completedModules < totalModules ? activeModuleProgress : 0,
    })),
    completedLessons,
    remainingLessons: totalLessons - completedLessons,
    avgWatchTimeMin: Math.round(18 + seededRandom(student.id) * 22),
  }
}

const ASSIGNMENT_TITLES = ['Build a REST API', 'Data Cleaning Project', 'Component Library', 'Capstone Milestone 1']
const ASSIGNMENT_STATUSES = ['graded', 'submitted', 'pending', 'late']

export const generateStudentAssignments = (student) => {
  if (!student) return []
  return ASSIGNMENT_TITLES.map((title, i) => {
    const status = ASSIGNMENT_STATUSES[i % ASSIGNMENT_STATUSES.length]
    const graded = status === 'graded'
    return {
      id: student.id * 10 + i,
      title,
      status,
      submissionDate: status === 'pending' ? null : `${10 + i * 5} Jan 2025`,
      grade: graded ? Math.round(50 + seededRandom(student.id + i) * 50) : null,
      feedback: graded ? 'Solid implementation — refine error handling for edge cases.' : null,
      fileName: status === 'pending' ? null : `${title.toLowerCase().replace(/\s+/g, '-')}.zip`,
    }
  })
}

export const generateStudentAssessments = (student) => {
  if (!student) return []
  const titles = ['Module 1 Quiz', 'Mid-Term Assessment', 'Final Evaluation']
  return titles.map((title, i) => {
    const score = Math.round(40 + seededRandom(student.id + i) * 60)
    return {
      id: student.id * 10 + i,
      title,
      score,
      attempts: 1 + (i % 2),
      timeTakenMin: 15 + i * 10,
      passed: score >= 50,
      questionAnalysis: { correct: Math.round(score / 10), incorrect: Math.round((100 - score) / 10), total: 10 },
    }
  })
}

export const generateStudentAttendance = (student) => {
  if (!student) return { dailyRecords: [], weeklyTrend: [], monthlyTrend: [], attendancePct: 0, lateJoins: 0 }
  const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const monthlyLabels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4']
  const dailyRecords = weeklyLabels.map((label, i) => ({
    day: label,
    status: seededRandom(student.id + i) > 0.85 ? 'absent' : seededRandom(student.id + i + 1) > 0.75 ? 'late' : 'present',
  }))
  return {
    dailyRecords,
    weeklyTrend: weeklyLabels.map((_, i) => Math.round(Math.max(50, student.attendancePct - 10 + seededRandom(student.id + i) * 20))),
    weeklyLabels,
    monthlyTrend: monthlyLabels.map((_, i) => Math.round(Math.max(50, student.attendancePct - 8 + seededRandom(student.id + i + 10) * 16))),
    monthlyLabels,
    attendancePct: student.attendancePct,
    lateJoins: dailyRecords.filter((r) => r.status === 'late').length,
  }
}

export const generateStudentLiveClasses = (student, batch) => {
  if (!student || !batch) return []
  const topics = ['Kickoff Session', 'Core Concepts Walkthrough', 'Hands-on Lab', 'Doubt Clearing Session', 'Project Review']
  return topics.map((topic, i) => {
    const isPast = i < 3
    return {
      id: student.id * 10 + i,
      title: `${batch.courseName}: ${topic}`,
      date: isPast ? `${10 + i} Jan 2025` : i === 3 ? 'Today' : 'Tomorrow',
      status: isPast ? 'completed' : 'upcoming',
      attendanceStatus: isPast ? (seededRandom(student.id + i) > 0.2 ? 'present' : 'absent') : null,
      recordingAvailable: isPast,
      joinedAt: isPast ? `${9 + i}:0${i}0 AM` : null,
    }
  })
}

export const generateStudentRecordedSessions = (student, batch) => {
  if (!student || !batch) return []
  const topics = ['Introduction & Setup', 'Core Concepts', 'Hands-on Project Build']
  return topics.map((topic, i) => ({
    id: student.id * 10 + i,
    title: `${batch.courseName}: ${topic}`,
    watched: seededRandom(student.id + i) > 0.3,
    watchPct: Math.round(40 + seededRandom(student.id + i) * 60),
    aiNotesAvailable: true,
    aiSummary: `Covers ${topic.toLowerCase()} with a walkthrough of key concepts and a live coding demo.`,
    generatedQuizAvailable: i % 2 === 0,
  }))
}

export const generateStudentResources = (student, batch) => {
  if (!student || !batch) return []
  const items = [
    { title: 'Course Slides - Week 1', type: 'pdf' },
    { title: 'Project Starter Kit', type: 'code' },
    { title: 'Reference Implementation', type: 'link' },
    { title: 'Lecture Notes', type: 'ppt' },
  ]
  return items.map((item, i) => ({ id: student.id * 10 + i, ...item, downloaded: seededRandom(student.id + i) > 0.4 }))
}

export const generateStudentCertificates = (student, batch) => {
  if (!student || !batch) return []
  if (batch.status !== 'completed' && student.progressPct < 100) return []
  return [{
    id: student.id, courseName: batch.courseName, status: student.progressPct >= 100 ? 'issued' : 'in-progress',
    issuedDate: student.progressPct >= 100 ? batch.endDate : null,
  }]
}

export const generateActivityTimeline = (student) => {
  if (!student) return []
  return [
    { id: 1, type: 'login', text: 'Logged in to the learning portal', time: student.lastActive },
    { id: 2, type: 'lesson', text: 'Completed lesson: State Management with Hooks', time: 'Yesterday' },
    { id: 3, type: 'live', text: 'Joined live class: React Hooks Deep Dive', time: '2 days ago' },
    { id: 4, type: 'assignment', text: 'Submitted assignment: Build a REST API', time: '3 days ago' },
    { id: 5, type: 'assessment', text: 'Attempted assessment: Module 1 Quiz', time: '5 days ago' },
    { id: 6, type: 'certificate', text: 'Earned certificate for a prior course', time: '2 weeks ago' },
    { id: 7, type: 'job', text: 'Job Portal unlocked after 60% course completion', time: '3 weeks ago' },
  ]
}

export const MENTOR_NOTES_SEED = [
  { id: 1, text: 'Strong grasp of frontend fundamentals, needs more practice with async patterns.', type: 'observation', date: '12 Jan 2025' },
  { id: 2, text: 'Follow up on missed live class before next assignment deadline.', type: 'follow-up', date: '18 Jan 2025' },
]
