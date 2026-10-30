// Mock data for the Mentor "My Batches" list + Batch Workspace pages.
// Swap these exports for real API calls (batchService, studentService, etc.)
// once the backend exposes mentor-scoped batch endpoints — every consumer
// only reads these shapes, never how they're produced.

export const MENTOR_BATCHES = [
  {
    id: 1,
    courseId: 101,
    batchName: 'React Morning Batch',
    courseName: 'Full Stack Dev',
    currentModule: 'React Context API',
    moduleProgress: 6,
    totalModules: 10,
    studentCount: 28,
    progress: 65,
    mentorName: 'You',
    startDate: '2026-08-01',
    endDate: '2027-02-28',
    nextLiveClass: { date: 'Tomorrow', time: '10:00 AM', title: 'React Context API' },
    attendancePct: 78,
    assignmentCompletionPct: 84,
    status: 'active',
    academicYear: '2025-26',
    batchType: 'Online',
    schedule: 'Mon/Wed/Fri 10:00 AM',
  },
  {
    id: 2,
    courseId: 102,
    batchName: 'Node.js Afternoon',
    courseName: 'Full Stack Dev',
    currentModule: 'Pandas & Data Wrangling',
    moduleProgress: 4,
    totalModules: 8,
    studentCount: 22,
    progress: 48,
    mentorName: 'You',
    startDate: '2025-01-07',
    endDate: '2025-05-30',
    nextLiveClass: { date: 'Tomorrow', time: '10:00 AM', title: 'Data Cleaning Workshop' },
    attendancePct: 82,
    assignmentCompletionPct: 76,
    status: 'active',
    academicYear: '2025-26',
    batchType: 'Hybrid',
    schedule: 'Tue/Thu 2:00 PM',
  },
  {
    id: 3,
    courseId: 103,
    batchName: 'React Advanced Aug',
    courseName: 'React Advanced',
    currentModule: 'Neural Networks',
    moduleProgress: 5,
    totalModules: 9,
    studentCount: 12,
    progress: 32,
    mentorName: 'You',
    startDate: '2025-01-08',
    endDate: '2025-07-10',
    nextLiveClass: { date: 'Wed', time: '2:00 PM', title: 'Neural Networks from Scratch' },
    attendancePct: 90,
    assignmentCompletionPct: 68,
    status: 'active',
    academicYear: '2025-26',
    batchType: 'Online',
    schedule: 'Tue/Thu 11:00 AM',
  },
  {
    id: 4,
    courseId: 104,
    batchName: 'Batch D - React',
    courseName: 'React Development',
    currentModule: 'Component Architecture',
    moduleProgress: 2,
    totalModules: 7,
    studentCount: 10,
    progress: 35,
    mentorName: 'You',
    startDate: '2025-01-13',
    endDate: '2025-06-01',
    nextLiveClass: { date: 'Thu', time: '5:00 PM', title: 'Component Patterns' },
    attendancePct: 87,
    assignmentCompletionPct: 61,
    status: 'active',
    academicYear: '2025-26',
    batchType: 'Online',
    schedule: 'Mon, Thu',
  },
  {
    id: 5,
    courseId: 105,
    batchName: 'Batch E - Node.js',
    courseName: 'Node.js Backend',
    currentModule: 'Not started',
    moduleProgress: 0,
    totalModules: 8,
    studentCount: 0,
    progress: 0,
    mentorName: 'You',
    startDate: '2025-09-01',
    endDate: '2026-02-15',
    nextLiveClass: null,
    attendancePct: 0,
    assignmentCompletionPct: 0,
    status: 'upcoming',
    academicYear: '2025-26',
    batchType: 'Online',
    schedule: 'TBD',
  },
  {
    id: 6,
    courseId: 106,
    batchName: 'Batch F - AWS',
    courseName: 'AWS Cloud Practitioner',
    currentModule: 'Not started',
    moduleProgress: 0,
    totalModules: 6,
    studentCount: 5,
    progress: 0,
    mentorName: 'You',
    startDate: '2025-09-03',
    endDate: '2026-01-20',
    nextLiveClass: { date: 'Feb 3', time: '4:00 PM', title: 'Cloud Fundamentals Kickoff' },
    attendancePct: 0,
    assignmentCompletionPct: 0,
    status: 'upcoming',
    academicYear: '2025-26',
    batchType: 'Hybrid',
    schedule: 'Tue, Fri',
  },
  {
    id: 7,
    courseId: 101,
    batchName: 'Batch G - MERN 2024',
    courseName: 'Full Stack MERN',
    currentModule: 'Course Completed',
    moduleProgress: 10,
    totalModules: 10,
    studentCount: 14,
    progress: 100,
    mentorName: 'You',
    startDate: '2024-06-01',
    endDate: '2024-12-15',
    nextLiveClass: null,
    attendancePct: 93,
    assignmentCompletionPct: 97,
    status: 'completed',
    academicYear: '2024-25',
    batchType: 'Online',
    schedule: 'Mon, Wed, Fri',
  },
  {
    id: 8,
    courseId: 102,
    batchName: 'Batch H - Python 2024',
    courseName: 'Python for Data Science',
    currentModule: 'Course Completed',
    moduleProgress: 8,
    totalModules: 8,
    studentCount: 9,
    progress: 100,
    mentorName: 'You',
    startDate: '2024-05-15',
    endDate: '2024-11-10',
    nextLiveClass: null,
    attendancePct: 90,
    assignmentCompletionPct: 94,
    status: 'completed',
    academicYear: '2024-25',
    batchType: 'Online',
    schedule: 'Tue, Thu',
  },
]

const STUDENT_NAME_POOL = [
  'Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Eve Davis',
  'Frank Miller', 'Grace Wilson', 'Henry Moore', 'Ivy Taylor', 'Jack Anderson',
  'Karen Thomas', 'Liam Jackson', 'Mia White', 'Noah Harris', 'Olivia Martin',
]

const RISK_REASONS = [
  'Low attendance & no recent activity',
  'Missed last 2 assignment deadlines',
  'Failed most recent assessment',
  'Declining engagement over 2 weeks',
]

const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const getInitials = (name) => name.split(' ').map((p) => p[0]).join('').toUpperCase()

export const getBatchById = (id) => MENTOR_BATCHES.find((b) => b.id === Number(id))

export const generateBatchStudents = (batch) => {
  if (!batch || !batch.studentCount) return []
  return Array.from({ length: batch.studentCount }, (_, i) => {
    const seed = batch.id * 100 + i
    const name = STUDENT_NAME_POOL[(batch.id + i) % STUDENT_NAME_POOL.length]
    const attendancePct = Math.round(60 + seededRandom(seed) * 40)
    const progressPct = Math.round(20 + seededRandom(seed + 1) * 80)
    const assignmentPct = Math.round(30 + seededRandom(seed + 2) * 70)
    const assessmentScore = Math.round(40 + seededRandom(seed + 3) * 60)
    const riskLevel = attendancePct < 70 || assignmentPct < 50 ? 'high' : attendancePct < 85 ? 'medium' : 'low'
    return {
      id: seed,
      studentId: `STU${String(seed).padStart(4, '0')}`,
      name,
      avatar: getInitials(name),
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: `+91 9${String(seed).padStart(9, '0')}`,
      status: 'active',
      enrollmentDate: batch.startDate,
      attendancePct,
      progressPct,
      assignmentPct,
      assessmentScore,
      riskLevel,
      riskReason: riskLevel === 'high' ? RISK_REASONS[i % RISK_REASONS.length] : null,
      lastActive: ['2 hours ago', 'Yesterday', '30 min ago', '3 days ago', '1 day ago'][i % 5],
    }
  })
}

// Candidate students not yet enrolled in any batch — feeds the "Search Existing
// Student" flow inside the Add Student modal.
const AVAILABLE_NAME_POOL = [
  'Priya Nair', 'Rahul Verma', 'Sofia Khan', 'Arjun Mehta', 'Zara Ahmed', 'Kevin Lee',
]

export const AVAILABLE_STUDENTS_POOL = AVAILABLE_NAME_POOL.map((name, i) => ({
  id: 9000 + i,
  studentId: `STU${String(9000 + i).padStart(4, '0')}`,
  name,
  avatar: getInitials(name),
  email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
  phone: `+91 8${String(9000 + i).padStart(9, '0')}`,
}))

export const findStudentById = (studentId) => {
  const id = Number(studentId)
  for (const batch of MENTOR_BATCHES) {
    const match = generateBatchStudents(batch).find((s) => s.id === id)
    if (match) return { student: match, batch }
  }
  return { student: null, batch: null }
}

export const generateLiveClasses = (batch) => {
  if (!batch) return []
  const topics = ['Kickoff Session', 'Core Concepts Walkthrough', 'Hands-on Lab', 'Doubt Clearing Session', 'Project Review', 'Mock Interview Prep']
  return Array.from({ length: 6 }, (_, i) => {
    const isPast = i < 3
    return {
      id: batch.id * 10 + i,
      title: `${batch.courseName}: ${topics[i % topics.length]}`,
      date: isPast ? `${10 + i} Jan 2025` : i === 3 ? 'Today' : i === 4 ? 'Tomorrow' : `${20 + i} Jan 2025`,
      time: ['10:00 AM', '2:00 PM', '3:00 PM', '5:00 PM'][i % 4],
      duration: '60 min',
      platform: i % 2 === 0 ? 'Zoom' : 'Google Meet',
      status: isPast ? 'completed' : i === 3 ? 'upcoming' : 'scheduled',
      attendeeCount: isPast ? Math.max(1, batch.studentCount - i) : null,
      recordingAvailable: isPast,
    }
  })
}

export const generateRecordedSessions = (batch) => {
  if (!batch) return []
  const topics = ['Introduction & Setup', 'Core Concepts', 'Hands-on Project Build', 'Advanced Patterns']
  return Array.from({ length: Math.min(4, Math.max(1, batch.moduleProgress || 1)) }, (_, i) => ({
    id: batch.id * 10 + i,
    title: `${batch.courseName}: ${topics[i % topics.length]}`,
    date: `${5 + i * 7} Jan 2025`,
    duration: `${45 + i * 5} min`,
    views: Math.round(batch.studentCount * (0.6 + seededRandom(batch.id + i) * 0.4)),
    sizeMb: 180 + i * 40,
  }))
}

const ASSIGNMENT_TITLES = ['Build a REST API', 'Data Cleaning Project', 'Component Library', 'Capstone Milestone 1']

export const generateAssignments = (batch) => {
  if (!batch) return []
  return Array.from({ length: 4 }, (_, i) => {
    const submitted = Math.max(0, Math.round((batch.studentCount || 0) * (0.4 + seededRandom(batch.id + i * 2) * 0.6)))
    const pending = Math.max(0, (batch.studentCount || 0) - submitted)
    const statuses = ['active', 'due-today', 'overdue', 'completed']
    return {
      id: batch.id * 10 + i,
      title: ASSIGNMENT_TITLES[i % ASSIGNMENT_TITLES.length],
      dueDate: `${15 + i * 5} Jan 2025`,
      submitted,
      pending,
      avgScore: Math.round(60 + seededRandom(batch.id + i) * 35),
      status: statuses[i % statuses.length],
    }
  })
}

export const generateAssessments = (batch) => {
  if (!batch) return []
  const titles = ['Module 1 Quiz', 'Mid-Term Assessment', 'Final Evaluation']
  return Array.from({ length: 3 }, (_, i) => ({
    id: batch.id * 10 + i,
    title: titles[i],
    type: i === 1 ? 'Timed Exam' : 'Quiz',
    questions: 10 + i * 5,
    attemptsCompleted: Math.max(0, Math.round((batch.studentCount || 0) * (0.5 + seededRandom(batch.id + i) * 0.5))),
    avgScore: Math.round(55 + seededRandom(batch.id + i + 3) * 40),
    status: i === 2 ? 'draft' : 'published',
  }))
}

export const generateAttendanceSummary = (batch) => {
  if (!batch) return { present: 0, absent: 0, late: 0, total: 0, weeklyTrend: [], weeklyLabels: [] }
  const total = batch.studentCount || 0
  const present = Math.round(total * (batch.attendancePct || 0) / 100)
  const late = Math.min(total - present, Math.round(total * 0.05))
  const absent = Math.max(0, total - present - late)
  const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weeklyTrend = weeklyLabels.map((_, i) => Math.round(Math.max(50, (batch.attendancePct || 70) - 8 + seededRandom(batch.id + i) * 16)))
  return { present, absent, late, total, weeklyTrend, weeklyLabels }
}

export const generateResources = (batch) => {
  if (!batch) return []
  const items = [
    { title: 'Course Slides - Week 1', type: 'pdf' },
    { title: 'Setup & Environment Guide', type: 'pdf' },
    { title: 'Reference Implementation', type: 'link' },
    { title: 'Recorded Walkthrough', type: 'video' },
    { title: 'Cheat Sheet', type: 'pdf' },
  ]
  return items.map((item, i) => ({
    id: batch.id * 10 + i,
    ...item,
    uploadDate: `${1 + i * 4} Jan 2025`,
    downloads: Math.round((batch.studentCount || 0) * (0.5 + seededRandom(batch.id + i) * 1.2)),
    sizeMb: item.type === 'video' ? 220 + i * 30 : 2 + i,
  }))
}

export const generateDiscussions = (batch) => {
  if (!batch) return []
  const threads = [
    { author: STUDENT_NAME_POOL[0], message: 'Can someone explain the difference between useEffect and useLayoutEffect?', replies: 4 },
    { author: STUDENT_NAME_POOL[1], message: 'Getting a CORS error when calling the API from localhost — any tips?', replies: 2 },
    { author: STUDENT_NAME_POOL[2], message: 'Is the assignment 3 deadline extended?', replies: 1 },
  ]
  return threads.map((t, i) => ({ id: batch.id * 10 + i, ...t, time: `${i + 1} day${i === 0 ? '' : 's'} ago`, resolved: i === 2 }))
}

export const generateReports = (batch) => {
  if (!batch) return null
  return {
    batchReport: {
      totalStudents: batch.studentCount,
      averageProgress: `${batch.progress}%`,
      averageAttendance: `${batch.attendancePct}%`,
      completionRate: `${batch.assignmentCompletionPct}%`,
    },
    performanceReport: {
      excellent: Math.round((batch.studentCount || 0) * 0.3),
      good: Math.round((batch.studentCount || 0) * 0.4),
      average: Math.round((batch.studentCount || 0) * 0.2),
      needsImprovement: Math.round((batch.studentCount || 0) * 0.1),
    },
  }
}
