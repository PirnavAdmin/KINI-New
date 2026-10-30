// ═══════════════════════════════════════════════════════════════════
// ORGANIZATION BATCHES MODULE — Premium Enterprise Mock Data
// ═══════════════════════════════════════════════════════════════════
// Static data for the enhanced Batches + Courses module

const INDIAN_STUDENTS_POOL = [
  { name: 'Narayana Nani', id: 'STU-101' },
  { name: 'Sai Kiran', id: 'STU-102' },
  { name: 'Pavan Kumar', id: 'STU-103' },
  { name: 'Sravani', id: 'STU-104' },
  { name: 'Tejaswini', id: 'STU-105' },
  { name: 'Rahul Kumar', id: 'STU-106' },
  { name: 'Akhil', id: 'STU-107' },
  { name: 'Keerthana', id: 'STU-108' },
  { name: 'Harshitha', id: 'STU-109' },
  { name: 'Vamshi Krishna', id: 'STU-110' },
  { name: 'Venkata Ramana', id: 'STU-111' },
  { name: 'Lakshmi Prasanna', id: 'STU-112' },
  { name: 'Mohan Rao', id: 'STU-113' },
  { name: 'Divya Sri', id: 'STU-114' },
  { name: 'Siva Kumar', id: 'STU-115' },
  { name: 'Anjali Devi', id: 'STU-116' },
  { name: 'Ravi Teja', id: 'STU-117' },
  { name: 'Sneha Latha', id: 'STU-118' },
  { name: 'Mahesh Babu', id: 'STU-119' },
  { name: 'Priyanka Reddy', id: 'STU-120' },
  { name: 'Arun Kumar', id: 'STU-121' },
  { name: 'Bhavana Sri', id: 'STU-122' },
  { name: 'Chandra Sekhar', id: 'STU-123' },
  { name: 'Deepthi Sravya', id: 'STU-124' },
  { name: 'Eshwar Prasad', id: 'STU-125' },
  { name: 'Gayathri Devi', id: 'STU-126' },
  { name: 'Hari Chandana', id: 'STU-127' },
  { name: 'Indira Priyadarshini', id: 'STU-128' },
  { name: 'Jaya Krishna', id: 'STU-129' },
  { name: 'Kavya Sree', id: 'STU-130' },
]

const generateStudent = (index, batchName, courseName, mentorName) => {
  const student = INDIAN_STUDENTS_POOL[index % INDIAN_STUDENTS_POOL.length]
  const progressValues = [25, 50, 75, 100]
  const courseProgress = progressValues[index % progressValues.length]
  const attendanceValues = [95, 88, 92, 100, 85, 78, 96, 90, 82, 74, 98, 86]
  const performanceLabels = ['Excellent', 'Good', 'Average', 'Needs Improvement']
  const perfIndex = index % performanceLabels.length
  const assignmentScore = courseProgress >= 75 ? 85 + (index % 15) : courseProgress >= 50 ? 70 + (index % 15) : 50 + (index % 20)
  const attendance = attendanceValues[index % attendanceValues.length]

  return {
    studentId: student.id,
    name: student.name,
    email: `${student.name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
    mobile: `+91 ${9000000000 + index * 7}`.slice(0, 15),
    avatar: null,
    batchName,
    courseName,
    mentorName,
    enrollmentDate: '2025-01-15',
    lastActiveDate: '2025-07-15',
    courseProgress,
    completionPercentage: courseProgress,
    assignmentPerformance: Math.min(assignmentScore, 100),
    learningTrack: {
      frontend: 50 + (index * 13) % 50,
      backend: 40 + (index * 11) % 50,
      database: 30 + (index * 17) % 50,
      devops: 20 + (index * 19) % 40,
    },
    attendancePercentage: attendance,
    totalAssignments: 12,
    completedAssignments: Math.floor(courseProgress / 100 * 12),
    pendingAssignments: 12 - Math.floor(courseProgress / 100 * 12),
    averageScore: Math.min(assignmentScore, 100),
    overallPerformanceScore: Math.min(Math.round((courseProgress + assignmentScore + attendance) / 3), 100),
    performanceRating: performanceLabels[perfIndex],
    courseStatus: courseProgress === 100 ? 'Completed' : 'In Progress',
    moduleCompletion: courseProgress,
    certificationStatus: courseProgress === 100 ? 'Completed' : 'In Progress',
  }
}

export const BATCHES = [
  {
    batchId: 1,
    batchName: 'Python Full Stack Batch - 01',
    courseName: 'Python Full Stack Development',
    courseId: 101,
    mentorName: 'Sarah Chen',
    mentorId: 201,
    studentsCount: 28,
    startDate: '2026-01-15T09:00:00.000Z',
    endDate: '2026-06-15T18:00:00.000Z',
    status: 'Active',
    batchType: 'Online',
    capacity: 30,
    duration: '5 Months',
    description: 'Full-stack Python batch covering Django, React, PostgreSQL, and REST APIs with real-world capstone projects.',
  },
  {
    batchId: 2,
    batchName: 'Python Full Stack Batch - 02',
    courseName: 'Python Full Stack Development',
    courseId: 101,
    mentorName: 'Ravi Sharma',
    mentorId: 211,
    studentsCount: 22,
    startDate: '2026-03-01T09:00:00.000Z',
    endDate: '2026-08-01T18:00:00.000Z',
    status: 'Active',
    batchType: 'Online',
    capacity: 25,
    duration: '5 Months',
    description: 'Second Python full-stack batch focusing on Django, React, and cloud deployment with AWS.',
  },
  {
    batchId: 3,
    batchName: 'Java Full Stack Batch - 01',
    courseName: 'Java Full Stack Development',
    courseId: 102,
    mentorName: 'Mike Johnson',
    mentorId: 202,
    studentsCount: 24,
    startDate: '2026-02-01T10:00:00.000Z',
    endDate: '2026-08-01T17:00:00.000Z',
    status: 'Active',
    batchType: 'Online',
    capacity: 25,
    duration: '6 Months',
    description: 'Enterprise Java with Spring Boot, Angular, Oracle SQL, and microservices architecture.',
  },
  {
    batchId: 4,
    batchName: 'MERN Stack Batch - 01',
    courseName: 'MERN Stack Development',
    courseId: 103,
    mentorName: 'Anna Lee',
    mentorId: 203,
    studentsCount: 22,
    startDate: '2026-01-10T08:00:00.000Z',
    endDate: '2026-05-10T16:00:00.000Z',
    status: 'Active',
    batchType: 'Hybrid',
    capacity: 25,
    duration: '4 Months',
    description: 'Full-stack JavaScript with MongoDB, Express, React, Node.js, and modern deployment pipelines.',
  },
  {
    batchId: 5,
    batchName: 'AI & Machine Learning Batch - 01',
    courseName: 'AI & Machine Learning',
    courseId: 104,
    mentorName: 'Dr. Rachel Park',
    mentorId: 206,
    studentsCount: 18,
    startDate: '2026-03-01T09:30:00.000Z',
    endDate: '2026-09-01T15:30:00.000Z',
    status: 'Active',
    batchType: 'Online',
    capacity: 20,
    duration: '6 Months',
    description: 'AI & ML covering neural networks, deep learning, NLP, computer vision, and TensorFlow/PyTorch.',
  },
  {
    batchId: 6,
    batchName: 'Data Science Batch - 01',
    courseName: 'Data Science',
    courseId: 105,
    mentorName: 'Mike Johnson',
    mentorId: 202,
    studentsCount: 20,
    startDate: '2026-04-01T09:00:00.000Z',
    endDate: '2026-10-01T17:00:00.000Z',
    status: 'Active',
    batchType: 'Online',
    capacity: 22,
    duration: '6 Months',
    description: 'Data science with Python, pandas, NumPy, statistical analysis, and machine learning algorithms.',
  },
  {
    batchId: 7,
    batchName: 'UI/UX Design Batch - 01',
    courseName: 'UI/UX Design',
    courseId: 106,
    mentorName: 'Emily Davis',
    mentorId: 208,
    studentsCount: 16,
    startDate: '2026-02-15T10:00:00.000Z',
    endDate: '2026-06-15T18:00:00.000Z',
    status: 'Active',
    batchType: 'Offline',
    capacity: 18,
    duration: '4 Months',
    description: 'UI/UX design mastery with Figma, design systems, user research, prototyping, and portfolio development.',
  },
  {
    batchId: 8,
    batchName: 'DevOps Engineering Batch - 01',
    courseName: 'DevOps Engineering',
    courseId: 107,
    mentorName: 'Tom Wilson',
    mentorId: 207,
    studentsCount: 15,
    startDate: '2026-05-01T08:00:00.000Z',
    endDate: '2026-08-01T16:00:00.000Z',
    status: 'Active',
    batchType: 'Hybrid',
    capacity: 18,
    duration: '3 Months',
    description: 'DevOps with Docker, Kubernetes, Jenkins, Terraform, CI/CD pipelines, and cloud monitoring.',
  },
  {
    batchId: 9,
    batchName: 'Cloud Computing Batch - 01',
    courseName: 'Cloud Computing (AWS)',
    courseId: 108,
    mentorName: 'David Kim',
    mentorId: 204,
    studentsCount: 20,
    startDate: '2026-07-01T09:00:00.000Z',
    endDate: '2026-10-01T18:00:00.000Z',
    status: 'Upcoming',
    batchType: 'Online',
    capacity: 22,
    duration: '3 Months',
    description: 'AWS cloud architecture: EC2, S3, Lambda, RDS, and best practices for scalable cloud deployments.',
  },
  {
    batchId: 10,
    batchName: 'Cyber Security Batch - 01',
    courseName: 'Cyber Security',
    courseId: 109,
    mentorName: 'Lisa Brown',
    mentorId: 210,
    studentsCount: 14,
    startDate: '2026-06-01T09:00:00.000Z',
    endDate: '2026-09-01T17:00:00.000Z',
    status: 'Upcoming',
    batchType: 'Online',
    capacity: 16,
    duration: '3 Months',
    description: 'Cyber security fundamentals: network defense, ethical hacking, cryptography, and compliance standards.',
  },
  {
    batchId: 11,
    batchName: 'AWS Developer Batch - 01',
    courseName: 'AWS Developer (Solutions Architect)',
    courseId: 110,
    mentorName: 'Ravi Sharma',
    mentorId: 211,
    studentsCount: 16,
    startDate: '2026-10-01T09:00:00.000Z',
    endDate: '2026-12-15T17:00:00.000Z',
    status: 'Upcoming',
    batchType: 'Hybrid',
    capacity: 20,
    duration: '2.5 Months',
    description: 'Advanced AWS DevOps: CloudFormation, CI/CD, monitoring, security, and infrastructure as code.',
  },
  {
    batchId: 12,
    batchName: 'React Native Batch - 01',
    courseName: 'React Native Mobile Dev',
    courseId: 111,
    mentorName: 'Sarah Chen',
    mentorId: 201,
    studentsCount: 17,
    startDate: '2026-08-01T10:00:00.000Z',
    endDate: '2026-11-01T17:00:00.000Z',
    status: 'Upcoming',
    batchType: 'Online',
    capacity: 20,
    duration: '3 Months',
    description: 'Cross-platform mobile development with React Native, Expo, and native module integration.',
  },
  {
    batchId: 13,
    batchName: 'Angular Development Batch - 01',
    courseName: 'Angular Development',
    courseId: 112,
    mentorName: 'John Doe',
    mentorId: 205,
    studentsCount: 19,
    startDate: '2026-08-15T09:00:00.000Z',
    endDate: '2026-12-15T17:00:00.000Z',
    status: 'Upcoming',
    batchType: 'Hybrid',
    capacity: 22,
    duration: '4 Months',
    description: 'Enterprise Angular development with TypeScript, RxJS, NgRx, and Angular Material.',
  },
  {
    batchId: 14,
    batchName: '.NET Full Stack Batch - 01',
    courseName: '.NET Full Stack Development',
    courseId: 113,
    mentorName: 'James Miller',
    mentorId: 209,
    studentsCount: 21,
    startDate: '2026-03-15T09:00:00.000Z',
    endDate: '2026-08-15T17:00:00.000Z',
    status: 'Completed',
    batchType: 'Online',
    capacity: 24,
    duration: '5 Months',
    description: '.NET Core, ASP.NET, Entity Framework, SQL Server, and Azure cloud deployment.',
  },
  {
    batchId: 15,
    batchName: 'Blockchain Development Batch - 01',
    courseName: 'Blockchain Development',
    courseId: 114,
    mentorName: 'Dr. Rachel Park',
    mentorId: 206,
    studentsCount: 10,
    startDate: '2026-05-01T10:00:00.000Z',
    endDate: '2026-07-01T16:00:00.000Z',
    status: 'Completed',
    batchType: 'Online',
    capacity: 12,
    duration: '2 Months',
    description: 'Blockchain fundamentals, Solidity, smart contracts, Ethereum, and decentralized applications.',
  },
  {
    batchId: 16,
    batchName: 'Flutter Mobile Batch - 01',
    courseName: 'Flutter Mobile Development',
    courseId: 115,
    mentorName: 'Anna Lee',
    mentorId: 203,
    studentsCount: 23,
    startDate: '2026-09-01T09:00:00.000Z',
    endDate: '2026-12-01T18:00:00.000Z',
    status: 'Upcoming',
    batchType: 'Online',
    capacity: 25,
    duration: '3 Months',
    description: 'Cross-platform mobile development with Flutter, Dart, state management, and native integrations.',
  },
  {
    batchId: 17,
    batchName: 'React JS Batch - 01',
    courseName: 'React JS Development',
    courseId: 116,
    mentorName: 'Sarah Chen',
    mentorId: 201,
    studentsCount: 26,
    startDate: '2026-02-10T09:00:00.000Z',
    endDate: '2026-05-10T17:00:00.000Z',
    status: 'Completed',
    batchType: 'Online',
    capacity: 28,
    duration: '3 Months',
    description: 'Deep dive into React ecosystem: hooks, Redux, Next.js, TypeScript, and production deployment.',
  },
  {
    batchId: 18,
    batchName: 'Digital Marketing Batch - 01',
    courseName: 'Digital Marketing',
    courseId: 117,
    mentorName: 'Emily Davis',
    mentorId: 208,
    studentsCount: 18,
    startDate: '2026-06-01T09:00:00.000Z',
    endDate: '2026-09-01T17:00:00.000Z',
    status: 'Upcoming',
    batchType: 'Online',
    capacity: 20,
    duration: '3 Months',
    description: 'Digital marketing: SEO, SEM, social media, content strategy, analytics, and conversion optimization.',
  },
  {
    batchId: 19,
    batchName: 'Salesforce Batch - 01',
    courseName: 'Salesforce Developer',
    courseId: 118,
    mentorName: 'James Miller',
    mentorId: 209,
    studentsCount: 14,
    startDate: '2026-07-01T09:00:00.000Z',
    endDate: '2026-11-01T17:00:00.000Z',
    status: 'Active',
    batchType: 'Online',
    capacity: 16,
    duration: '4 Months',
    description: 'Salesforce Apex, Lightning Components, SOQL, and enterprise CRM development.',
  },
  {
    batchId: 20,
    batchName: 'Testing & Automation Batch - 01',
    courseName: 'Testing & Automation',
    courseId: 119,
    mentorName: 'Tom Wilson',
    mentorId: 207,
    studentsCount: 16,
    startDate: '2026-08-01T09:00:00.000Z',
    endDate: '2026-10-01T17:00:00.000Z',
    status: 'Active',
    batchType: 'Online',
    capacity: 18,
    duration: '3 Months',
    description: 'Manual testing, Selenium automation, API testing, and CI/CD integration for quality assurance.',
  },
  {
    batchId: 21,
    batchName: 'Go Backend Batch - 01',
    courseName: 'Go Language Backend',
    courseId: 120,
    mentorName: 'Tom Wilson',
    mentorId: 207,
    studentsCount: 12,
    startDate: '2026-04-01T09:00:00.000Z',
    endDate: '2026-06-01T17:00:00.000Z',
    status: 'Completed',
    batchType: 'Online',
    capacity: 15,
    duration: '2 Months',
    description: 'Go programming for backend services, concurrency, REST APIs, and microservices architecture.',
  },
  {
    batchId: 22,
    batchName: 'Docker & Kubernetes Batch - 01',
    courseName: 'Docker & Kubernetes',
    courseId: 121,
    mentorName: 'Ravi Sharma',
    mentorId: 211,
    studentsCount: 13,
    startDate: '2026-01-05T09:00:00.000Z',
    endDate: '2026-03-05T17:00:00.000Z',
    status: 'Completed',
    batchType: 'Offline',
    capacity: 15,
    duration: '2 Months',
    description: 'Containerization with Docker and orchestration with Kubernetes for production workloads.',
  },
  {
    batchId: 23,
    batchName: 'Python Django Batch - 01',
    courseName: 'Python Django Framework',
    courseId: 122,
    mentorName: 'Sarah Chen',
    mentorId: 201,
    studentsCount: 26,
    startDate: '2026-02-10T09:00:00.000Z',
    endDate: '2026-05-10T17:00:00.000Z',
    status: 'Completed',
    batchType: 'Online',
    capacity: 28,
    duration: '3 Months',
    description: 'Django framework: models, views, templates, REST framework, authentication, and deployment.',
  },
]

// ─── Generate students for each batch ─────────────────────────
const BATCH_STUDENTS_MAP = {}

BATCHES.forEach((batch) => {
  const count = batch.studentsCount
  const students = []
  // Deterministic shuffle for each batch using batchId as seed
  const startIdx = (batch.batchId * 7) % INDIAN_STUDENTS_POOL.length
  for (let i = 0; i < count; i++) {
    const idx = (startIdx + i) % INDIAN_STUDENTS_POOL.length
    students.push(generateStudent(idx, batch.batchName, batch.courseName, batch.mentorName))
  }
  BATCH_STUDENTS_MAP[batch.batchId] = students
})

export const BATCH_STUDENTS = BATCH_STUDENTS_MAP

// ─── Generate assignments for each batch ──────────────────────
const ASSIGNMENT_TEMPLATES = [
  { name: 'HTML Structure & Semantics', category: 'Frontend' },
  { name: 'CSS Layout & Responsive Design', category: 'Frontend' },
  { name: 'JavaScript DOM Manipulation', category: 'Frontend' },
  { name: 'React Component Architecture', category: 'Frontend' },
  { name: 'API Integration & Data Fetching', category: 'Backend' },
  { name: 'Database Schema & Querying', category: 'Database' },
  { name: 'Authentication & Authorization', category: 'Backend' },
  { name: 'State Management Implementation', category: 'Frontend' },
  { name: 'Unit Testing & Quality Assurance', category: 'DevOps' },
  { name: 'CI/CD Pipeline Configuration', category: 'DevOps' },
  { name: 'Docker Containerization', category: 'DevOps' },
  { name: 'Capstone Mini Project', category: 'Project' },
  { name: 'Major Project - Full Stack App', category: 'Project' },
  { name: 'Deployment & Production Readiness', category: 'DevOps' },
  { name: 'Performance Optimization', category: 'Frontend' },
]

const BATCH_ASSIGNMENTS_MAP = {}

BATCHES.forEach((batch) => {
  const count = Math.min(10 + batch.batchId % 6, ASSIGNMENT_TEMPLATES.length)
  const assignments = []
  const baseDate = new Date(batch.startDate)
  for (let i = 0; i < count; i++) {
    const template = ASSIGNMENT_TEMPLATES[i % ASSIGNMENT_TEMPLATES.length]
    const dueDate = new Date(baseDate)
    dueDate.setDate(dueDate.getDate() + (i + 1) * 14) // every 2 weeks
    const isCompleted = batch.status === 'Completed' || (batch.status === 'Active' && i < count - 3)
    const score = isCompleted ? 70 + (i * 3 + batch.batchId * 2) % 30 : null

    assignments.push({
      id: `ASG-B${batch.batchId}-${String(i + 1).padStart(3, '0')}`,
      name: template.name,
      category: template.category,
      dueDate: dueDate.toISOString().slice(0, 10),
      status: isCompleted ? 'Completed' : 'Pending',
      score: score > 100 ? 95 : score,
      remarks: isCompleted
        ? score >= 90 ? 'Outstanding performance' : score >= 80 ? 'Good work' : score >= 70 ? 'Satisfactory' : 'Needs improvement'
        : 'Not yet submitted',
    })
  }
  BATCH_ASSIGNMENTS_MAP[batch.batchId] = assignments
})

export const BATCH_ASSIGNMENTS = BATCH_ASSIGNMENTS_MAP

// ─── Reports for each batch ───────────────────────────────────
const BATCH_REPORTS_MAP = {}

BATCHES.forEach((batch) => {
  const students = BATCH_STUDENTS_MAP[batch.batchId] || []
  const total = students.length
  const avgProgress = total > 0 ? Math.round(students.reduce((s, st) => s + st.courseProgress, 0) / total) : 0
  const avgAttendance = total > 0 ? Math.round(students.reduce((s, st) => s + st.attendancePercentage, 0) / total) : 0
  const avgScore = total > 0 ? Math.round(students.reduce((s, st) => s + st.averageScore, 0) / total) : 0

  const excellent = students.filter((s) => s.performanceRating === 'Excellent').length
  const good = students.filter((s) => s.performanceRating === 'Good').length
  const average = students.filter((s) => s.performanceRating === 'Average').length
  const needsImprovement = students.filter((s) => s.performanceRating === 'Needs Improvement').length

  const above90 = students.filter((s) => s.attendancePercentage >= 90).length
  const between75and90 = students.filter((s) => s.attendancePercentage >= 75 && s.attendancePercentage < 90).length
  const below75 = students.filter((s) => s.attendancePercentage < 75).length

  const completedStudents = students.filter((s) => s.courseStatus === 'Completed').length

  BATCH_REPORTS_MAP[batch.batchId] = {
    batchReport: {
      totalStudents: total,
      averageProgress: `${avgProgress}%`,
      averageAttendance: `${avgAttendance}%`,
      averageScore: `${avgScore}%`,
      completionRate: total > 0 ? `${Math.round((completedStudents / total) * 100)}%` : '0%',
    },
    studentReport: {
      total,
      passed: Math.round(total * 0.7),
      failed: Math.round(total * 0.1),
      incomplete: total - Math.round(total * 0.7) - Math.round(total * 0.1),
    },
    assignmentReport: {
      total: (BATCH_ASSIGNMENTS_MAP[batch.batchId] || []).length,
      averageScore: `${avgScore}%`,
      submissions: students.length > 0 ? Math.round(students.reduce((s, st) => s + st.completedAssignments, 0) / students.length) : 0,
      pending: students.length > 0 ? Math.round(students.reduce((s, st) => s + st.pendingAssignments, 0) / students.length) : 0,
    },
    performanceReport: {
      excellent,
      good,
      average,
      needsImprovement,
    },
    attendanceReport: {
      above90,
      between75and90,
      below75,
    },
  }
})

export const BATCH_REPORTS = BATCH_REPORTS_MAP

// ─── Student Skills ───────────────────────────────────────────
const SKILL_TEMPLATES = {
  'STU-101': [
    { name: 'HTML', percentage: 90 }, { name: 'CSS', percentage: 85 }, { name: 'JavaScript', percentage: 82 },
    { name: 'React JS', percentage: 78 }, { name: 'Node JS', percentage: 72 }, { name: 'MongoDB', percentage: 68 },
    { name: 'TypeScript', percentage: 65 }, { name: 'Git', percentage: 80 },
  ],
  'STU-102': [
    { name: 'HTML', percentage: 95 }, { name: 'CSS', percentage: 92 }, { name: 'JavaScript', percentage: 94 },
    { name: 'React JS', percentage: 96 }, { name: 'Node JS', percentage: 90 }, { name: 'MongoDB', percentage: 88 },
    { name: 'TypeScript', percentage: 85 }, { name: 'Git', percentage: 92 },
  ],
  'STU-103': [
    { name: 'HTML', percentage: 75 }, { name: 'CSS', percentage: 70 }, { name: 'JavaScript', percentage: 68 },
    { name: 'React JS', percentage: 62 }, { name: 'Node JS', percentage: 58 }, { name: 'MongoDB', percentage: 55 },
    { name: 'TypeScript', percentage: 50 }, { name: 'Git', percentage: 65 },
  ],
  'STU-104': [
    { name: 'HTML', percentage: 88 }, { name: 'CSS', percentage: 90 }, { name: 'JavaScript', percentage: 85 },
    { name: 'React JS', percentage: 82 }, { name: 'Node JS', percentage: 78 }, { name: 'MongoDB', percentage: 75 },
    { name: 'TypeScript', percentage: 72 }, { name: 'Git', percentage: 82 },
  ],
  'STU-105': [
    { name: 'HTML', percentage: 65 }, { name: 'CSS', percentage: 60 }, { name: 'JavaScript', percentage: 58 },
    { name: 'React JS', percentage: 52 }, { name: 'Node JS', percentage: 48 }, { name: 'MongoDB', percentage: 45 },
    { name: 'TypeScript', percentage: 40 }, { name: 'Git', percentage: 55 },
  ],
  'STU-106': [
    { name: 'HTML', percentage: 85 }, { name: 'CSS', percentage: 82 }, { name: 'JavaScript', percentage: 80 },
    { name: 'React JS', percentage: 76 }, { name: 'Node JS', percentage: 72 }, { name: 'MongoDB', percentage: 70 },
    { name: 'TypeScript', percentage: 68 }, { name: 'Git', percentage: 78 },
  ],
  'STU-107': [
    { name: 'HTML', percentage: 70 }, { name: 'CSS', percentage: 68 }, { name: 'JavaScript', percentage: 72 },
    { name: 'React JS', percentage: 66 }, { name: 'Node JS', percentage: 60 }, { name: 'MongoDB', percentage: 55 },
    { name: 'TypeScript', percentage: 52 }, { name: 'Git', percentage: 62 },
  ],
  'STU-108': [
    { name: 'HTML', percentage: 92 }, { name: 'CSS', percentage: 95 }, { name: 'JavaScript', percentage: 90 },
    { name: 'React JS', percentage: 88 }, { name: 'Node JS', percentage: 82 }, { name: 'MongoDB', percentage: 80 },
    { name: 'TypeScript', percentage: 78 }, { name: 'Git', percentage: 85 },
  ],
  'STU-109': [
    { name: 'HTML', percentage: 78 }, { name: 'CSS', percentage: 75 }, { name: 'JavaScript', percentage: 72 },
    { name: 'React JS', percentage: 68 }, { name: 'Node JS', percentage: 65 }, { name: 'MongoDB', percentage: 60 },
    { name: 'TypeScript', percentage: 58 }, { name: 'Git', percentage: 70 },
  ],
  'STU-110': [
    { name: 'HTML', percentage: 88 }, { name: 'CSS', percentage: 84 }, { name: 'JavaScript', percentage: 86 },
    { name: 'React JS', percentage: 82 }, { name: 'Node JS', percentage: 78 }, { name: 'MongoDB', percentage: 74 },
    { name: 'TypeScript', percentage: 76 }, { name: 'Git', percentage: 80 },
  ],
}

export const STUDENT_SKILLS = SKILL_TEMPLATES

// ─── Per-student assignments ──────────────────────────────────
const STUDENT_ASSIGNMENTS_MAP = {}

Object.keys(BATCH_STUDENTS_MAP).forEach((batchId) => {
  const batchAssignments = BATCH_ASSIGNMENTS_MAP[batchId] || []
  const students = BATCH_STUDENTS_MAP[batchId] || []

  students.forEach((student, si) => {
    const assignments = batchAssignments.map((a, ai) => {
      const isCompleted = student.courseProgress >= 50 && ai < Math.floor(student.courseProgress / 100 * batchAssignments.length)
      return {
        ...a,
        status: a.status === 'Completed' ? 'Completed' : isCompleted ? 'Submitted' : 'Pending',
        score: isCompleted ? Math.min(60 + (si * 3 + ai * 5 + 10) % 40, 100) : null,
        remarks: isCompleted
          ? Math.min(60 + (si * 3 + ai * 5 + 10) % 40, 100) >= 90 ? 'Excellent' : Math.min(60 + (si * 3 + ai * 5 + 10) % 40, 100) >= 80 ? 'Good' : 'Average'
          : 'Not started',
      }
    })
    STUDENT_ASSIGNMENTS_MAP[student.studentId] = assignments
  })
})

export const STUDENT_ASSIGNMENTS = STUDENT_ASSIGNMENTS_MAP

// ─── Course Data (20 premium courses) ────────────────────────
export const COURSES_DATA = [
  {
    courseId: 101,
    courseName: 'Python Full Stack Development',
    description: 'Master Python full-stack development from frontend to backend. Build real-world applications with Django, React, PostgreSQL, and deploy to production.',
    level: 'Beginner to Advanced',
    thumbnail: null,
    totalPrice: 30000,
    totalDuration: '5 Months',
    totalModules: 3,
    status: 'Active',
    totalStudentsEnrolled: 156,
    modules: [
      { id: 'FE-101', name: 'Frontend Development', description: 'Build responsive UIs with HTML, CSS, JavaScript, and React. Learn component architecture, state management, and modern frontend tooling.', price: 10000, duration: '2 Months', topics: ['HTML', 'CSS', 'JavaScript', 'React JS'] },
      { id: 'BE-101', name: 'Backend Development', description: 'Build robust APIs with Python, Django, DRF, JWT authentication. Learn RESTful design patterns and server-side development.', price: 10000, duration: '2 Months', topics: ['Python', 'Django', 'Django REST Framework', 'REST APIs', 'JWT Authentication'] },
      { id: 'DB-101', name: 'Database Management', description: 'Master SQL and NoSQL databases. Learn querying, indexing, data modeling, and database optimization techniques.', price: 10000, duration: '1 Month', topics: ['SQL', 'PostgreSQL', 'MongoDB'] },
    ],
  },
  {
    courseId: 102,
    courseName: 'Java Full Stack Development',
    description: 'Enterprise-grade Java development covering Core Java, Spring Boot, microservices, Angular/React frontend, and database management with Oracle SQL.',
    level: 'Intermediate to Advanced',
    thumbnail: null,
    totalPrice: 35000,
    totalDuration: '6 Months',
    totalModules: 3,
    status: 'Active',
    totalStudentsEnrolled: 98,
    modules: [
      { id: 'FE-102', name: 'Frontend Development', description: 'Modern frontend with Angular/React, TypeScript, and responsive design patterns.', price: 12000, duration: '2 Months', topics: ['TypeScript', 'Angular', 'React JS', 'HTML/CSS'] },
      { id: 'BE-102', name: 'Backend Development', description: 'Enterprise backend with Core Java, Spring Boot, microservices, Docker, and JWT security.', price: 13000, duration: '2.5 Months', topics: ['Core Java', 'Spring Boot', 'Microservices', 'REST APIs', 'JWT Security', 'Docker'] },
      { id: 'DB-102', name: 'Database Management', description: 'Relational and NoSQL databases with Oracle SQL, PostgreSQL, MongoDB, and Hibernate JPA.', price: 10000, duration: '1.5 Months', topics: ['Oracle SQL', 'PostgreSQL', 'MongoDB', 'Hibernate JPA'] },
    ],
  },
  {
    courseId: 103,
    courseName: 'MERN Stack Development',
    description: 'Full-stack JavaScript development with MongoDB, Express.js, React, and Node.js. Build complete web applications from scratch.',
    level: 'Beginner to Advanced',
    thumbnail: null,
    totalPrice: 28000,
    totalDuration: '4 Months',
    totalModules: 3,
    status: 'Active',
    totalStudentsEnrolled: 210,
    modules: [
      { id: 'FE-103', name: 'Frontend Development', description: 'Modern React with hooks, Redux state management, and Tailwind CSS for responsive UIs.', price: 10000, duration: '1.5 Months', topics: ['HTML', 'CSS', 'JavaScript', 'React JS', 'Redux', 'Tailwind CSS'] },
      { id: 'BE-103', name: 'Backend Development', description: 'Scalable backend with Node.js, Express.js, REST APIs, JWT auth, and WebSocket integration.', price: 10000, duration: '1.5 Months', topics: ['Node.js', 'Express.js', 'REST APIs', 'JWT Auth', 'WebSockets'] },
      { id: 'DB-103', name: 'Database Management', description: 'MongoDB with Mongoose ODM, aggregation pipelines, indexing, and data modeling.', price: 8000, duration: '1 Month', topics: ['MongoDB', 'Mongoose ODM', 'Aggregation', 'Indexing', 'Data Modeling'] },
    ],
  },
  {
    courseId: 104,
    courseName: 'AI & Machine Learning',
    description: 'Comprehensive AI/ML program covering Python, statistics, deep learning, neural networks, NLP, and computer vision with TensorFlow and PyTorch.',
    level: 'Intermediate to Advanced',
    thumbnail: null,
    totalPrice: 40000,
    totalDuration: '6 Months',
    totalModules: 4,
    status: 'Active',
    totalStudentsEnrolled: 175,
    modules: [
      { id: 'AI-01', name: 'Python Fundamentals', description: 'Python programming for data science applications with NumPy and Pandas.', price: 8000, duration: '1 Month', topics: ['Python Basics', 'NumPy', 'Pandas', 'Data Structures'] },
      { id: 'AI-02', name: 'Statistics & Mathematics', description: 'Foundation in statistics, probability, linear algebra, and calculus for machine learning.', price: 10000, duration: '1.5 Months', topics: ['Descriptive Statistics', 'Probability', 'Linear Algebra', 'Calculus', 'Hypothesis Testing'] },
      { id: 'AI-03', name: 'Machine Learning', description: 'Supervised and unsupervised learning algorithms, model evaluation, and deployment.', price: 12000, duration: '2 Months', topics: ['Regression', 'Classification', 'Clustering', 'Decision Trees', 'SVM', 'Ensemble Methods'] },
      { id: 'AI-04', name: 'Deep Learning & AI', description: 'Advanced deep learning with CNNs, RNNs, transformers, and attention mechanisms.', price: 10000, duration: '1.5 Months', topics: ['Neural Networks', 'CNNs', 'RNNs', 'Transformers', 'TensorFlow', 'PyTorch'] },
    ],
  },
  {
    courseId: 105,
    courseName: 'Data Science',
    description: 'Complete data science program covering Python, statistical analysis, machine learning, and data visualization with industry-standard tools.',
    level: 'Beginner to Advanced',
    thumbnail: null,
    totalPrice: 38000,
    totalDuration: '6 Months',
    totalModules: 4,
    status: 'Active',
    totalStudentsEnrolled: 134,
    modules: [
      { id: 'DS-01', name: 'Python for Data Science', description: 'Python programming with Pandas, NumPy, and data cleaning techniques.', price: 8000, duration: '1 Month', topics: ['Python', 'Pandas', 'NumPy', 'Data Cleaning'] },
      { id: 'DS-02', name: 'Statistical Analysis', description: 'Descriptive and inferential statistics, hypothesis testing, and regression analysis.', price: 10000, duration: '1.5 Months', topics: ['Descriptive Stats', 'Inferential Stats', 'Hypothesis Testing', 'Regression'] },
      { id: 'DS-03', name: 'Machine Learning', description: 'ML algorithms, feature engineering, model selection, and cross-validation.', price: 12000, duration: '2 Months', topics: ['Supervised Learning', 'Unsupervised Learning', 'Feature Engineering', 'Model Selection'] },
      { id: 'DS-04', name: 'Data Visualization', description: 'Visual storytelling with Matplotlib, Seaborn, Plotly, and Tableau dashboards.', price: 8000, duration: '1.5 Months', topics: ['Matplotlib', 'Seaborn', 'Plotly', 'Tableau', 'Dashboarding'] },
    ],
  },
  {
    courseId: 106,
    courseName: 'UI/UX Design',
    description: 'Complete UI/UX design program covering user research, wireframing, prototyping, design systems, and visual design with Figma.',
    level: 'Beginner to Advanced',
    thumbnail: null,
    totalPrice: 25000,
    totalDuration: '4 Months',
    totalModules: 4,
    status: 'Active',
    totalStudentsEnrolled: 134,
    modules: [
      { id: 'UI-01', name: 'Design Fundamentals', description: 'Design principles, color theory, typography, grid systems, and visual hierarchy.', price: 6000, duration: '1 Month', topics: ['Design Principles', 'Color Theory', 'Typography', 'Grid Systems', 'Visual Hierarchy'] },
      { id: 'UI-02', name: 'User Research & Strategy', description: 'User research methods, personas, journey maps, information architecture, and usability testing.', price: 6000, duration: '1 Month', topics: ['User Research', 'Personas', 'Journey Maps', 'IA', 'Usability Testing'] },
      { id: 'UI-03', name: 'Wireframing & Prototyping', description: 'Figma masterclass: wireframing, prototyping, design systems, and component libraries.', price: 7000, duration: '1 Month', topics: ['Figma', 'Wireframing', 'Prototyping', 'Design Systems', 'Component Libraries'] },
      { id: 'UI-04', name: 'Visual Design & Branding', description: 'Advanced visual design, brand identity, motion design, and design-to-development handoff.', price: 6000, duration: '1 Month', topics: ['Visual Design', 'Brand Identity', 'Motion Design', 'Design Handoff', 'Portfolio'] },
    ],
  },
  {
    courseId: 107,
    courseName: 'DevOps Engineering',
    description: 'Master DevOps practices including containerization, CI/CD, infrastructure as code, cloud monitoring, and site reliability engineering.',
    level: 'Intermediate to Advanced',
    thumbnail: null,
    totalPrice: 32000,
    totalDuration: '4 Months',
    totalModules: 3,
    status: 'Active',
    totalStudentsEnrolled: 87,
    modules: [
      { id: 'DEV-01', name: 'Containerization & Orchestration', description: 'Docker and Kubernetes for container management, scaling, and deployment.', price: 12000, duration: '1.5 Months', topics: ['Docker', 'Kubernetes', 'Container Registry', 'Pod Management', 'Service Discovery'] },
      { id: 'DEV-02', name: 'CI/CD & Automation', description: 'Continuous integration/deployment with Jenkins, GitHub Actions, and GitLab CI.', price: 10000, duration: '1.5 Months', topics: ['Jenkins', 'GitHub Actions', 'GitLab CI', 'Pipeline as Code', 'Automation'] },
      { id: 'DEV-03', name: 'Infrastructure & Monitoring', description: 'Terraform, CloudFormation, Prometheus, Grafana, and ELK stack for monitoring.', price: 10000, duration: '1 Month', topics: ['Terraform', 'CloudFormation', 'Prometheus', 'Grafana', 'ELK Stack'] },
    ],
  },
  {
    courseId: 108,
    courseName: 'Cloud Computing (AWS)',
    description: 'Comprehensive AWS cloud computing covering EC2, S3, Lambda, RDS, VPC, and cloud architecture best practices for scalable applications.',
    level: 'Beginner to Advanced',
    thumbnail: null,
    totalPrice: 28000,
    totalDuration: '4 Months',
    totalModules: 3,
    status: 'Active',
    totalStudentsEnrolled: 112,
    modules: [
      { id: 'CLD-01', name: 'AWS Fundamentals', description: 'Core AWS services: EC2, S3, IAM, VPC, and cloud networking concepts.', price: 10000, duration: '1.5 Months', topics: ['EC2', 'S3', 'IAM', 'VPC', 'Cloud Networking'] },
      { id: 'CLD-02', name: 'Serverless & Compute', description: 'Lambda, API Gateway, DynamoDB, Step Functions, and event-driven architectures.', price: 10000, duration: '1.5 Months', topics: ['Lambda', 'API Gateway', 'DynamoDB', 'Step Functions', 'EventBridge'] },
      { id: 'CLD-03', name: 'Databases & Storage', description: 'RDS, Aurora, ElastiCache, CloudFront, and data migration strategies.', price: 8000, duration: '1 Month', topics: ['RDS', 'Aurora', 'ElastiCache', 'CloudFront', 'S3 Advanced'] },
    ],
  },
  {
    courseId: 109,
    courseName: 'Cyber Security',
    description: 'Complete cyber security program covering network defense, ethical hacking, cryptography, penetration testing, and compliance standards.',
    level: 'Intermediate to Advanced',
    thumbnail: null,
    totalPrice: 35000,
    totalDuration: '5 Months',
    totalModules: 4,
    status: 'Active',
    totalStudentsEnrolled: 76,
    modules: [
      { id: 'SEC-01', name: 'Network Security', description: 'Firewalls, IDS/IPS, VPNs, network segmentation, and secure network architecture.', price: 9000, duration: '1.5 Months', topics: ['Firewalls', 'IDS/IPS', 'VPNs', 'Network Segmentation', 'Secure Architecture'] },
      { id: 'SEC-02', name: 'Ethical Hacking', description: 'Penetration testing, vulnerability assessment, Metasploit, and bug bounty methodologies.', price: 10000, duration: '1.5 Months', topics: ['Penetration Testing', 'Vulnerability Assessment', 'Metasploit', 'Bug Bounty', 'Exploitation'] },
      { id: 'SEC-03', name: 'Cryptography & Compliance', description: 'Encryption algorithms, PKI, SSL/TLS, GDPR, HIPAA, and security compliance.', price: 8000, duration: '1 Month', topics: ['Encryption', 'PKI', 'SSL/TLS', 'GDPR', 'HIPAA'] },
      { id: 'SEC-04', name: 'Cloud & App Security', description: 'OWASP Top 10, secure coding practices, cloud security, and DevSecOps integration.', price: 8000, duration: '1 Month', topics: ['OWASP Top 10', 'Secure Coding', 'Cloud Security', 'DevSecOps', 'SAST/DAST'] },
    ],
  },
  {
    courseId: 110,
    courseName: 'AWS Developer (Solutions Architect)',
    description: 'Become an AWS Solutions Architect. Master cloud architecture, design patterns, migration strategies, and pass the AWS SAA certification.',
    level: 'Intermediate to Advanced',
    thumbnail: null,
    totalPrice: 30000,
    totalDuration: '4 Months',
    totalModules: 3,
    status: 'Active',
    totalStudentsEnrolled: 93,
    modules: [
      { id: 'AWS-01', name: 'Architecture Core', description: 'AWS Well-Architected Framework, high availability, fault tolerance, and cost optimization.', price: 11000, duration: '1.5 Months', topics: ['Well-Architected Framework', 'High Availability', 'Fault Tolerance', 'Cost Optimization', 'Reliability'] },
      { id: 'AWS-02', name: 'Compute & Networking', description: 'Advanced EC2, Elastic Load Balancing, Auto Scaling, Route 53, and hybrid networking.', price: 10000, duration: '1.5 Months', topics: ['Advanced EC2', 'ELB', 'Auto Scaling', 'Route 53', 'Hybrid Networking'] },
      { id: 'AWS-03', name: 'Migration & Innovation', description: 'Migration strategies, database migration, serverless innovation, and exam preparation.', price: 9000, duration: '1 Month', topics: ['Migration Strategies', 'DMS', 'Serverless', 'Exam Prep', 'Best Practices'] },
    ],
  },
  {
    courseId: 111,
    courseName: 'Flutter Mobile Development',
    description: 'Cross-platform mobile development with Flutter and Dart. Build beautiful, natively compiled apps for iOS and Android from a single codebase.',
    level: 'Beginner to Advanced',
    thumbnail: null,
    totalPrice: 25000,
    totalDuration: '3 Months',
    totalModules: 3,
    status: 'Active',
    totalStudentsEnrolled: 145,
    modules: [
      { id: 'FL-01', name: 'Dart & Flutter Basics', description: 'Dart programming language, Flutter widgets, and building your first cross-platform app.', price: 8000, duration: '1 Month', topics: ['Dart Basics', 'Flutter Widgets', 'Stateful Widgets', 'Navigation', 'Theming'] },
      { id: 'FL-02', name: 'State Management & APIs', description: 'Provider, Riverpod, Bloc patterns, REST API integration, and local data persistence.', price: 9000, duration: '1 Month', topics: ['Provider', 'Riverpod', 'Bloc', 'REST APIs', 'SQLite', 'SharedPreferences'] },
      { id: 'FL-03', name: 'Advanced Flutter & Deployment', description: 'Animations, custom painters, platform channels, app store deployment, and CI/CD.', price: 8000, duration: '1 Month', topics: ['Animations', 'Custom Painters', 'Platform Channels', 'App Store', 'Play Store', 'CI/CD'] },
    ],
  },
  {
    courseId: 112,
    courseName: 'Digital Marketing',
    description: 'Comprehensive digital marketing program covering SEO, SEM, social media marketing, content strategy, analytics, and conversion optimization.',
    level: 'Beginner to Advanced',
    thumbnail: null,
    totalPrice: 20000,
    totalDuration: '3 Months',
    totalModules: 3,
    status: 'Active',
    totalStudentsEnrolled: 168,
    modules: [
      { id: 'DM-01', name: 'SEO & Content Marketing', description: 'On-page and off-page SEO, keyword research, content strategy, and link building.', price: 7000, duration: '1 Month', topics: ['Keyword Research', 'On-Page SEO', 'Off-Page SEO', 'Content Strategy', 'Link Building'] },
      { id: 'DM-02', name: 'Social Media & Paid Ads', description: 'Facebook/Instagram ads, Google Ads, LinkedIn marketing, and retargeting strategies.', price: 7000, duration: '1 Month', topics: ['Facebook Ads', 'Google Ads', 'Instagram Marketing', 'LinkedIn', 'Retargeting'] },
      { id: 'DM-03', name: 'Analytics & Conversion', description: 'Google Analytics, conversion rate optimization, A/B testing, and marketing automation.', price: 6000, duration: '1 Month', topics: ['Google Analytics', 'CRO', 'A/B Testing', 'Marketing Automation', 'Reporting'] },
    ],
  },
  {
    courseId: 113,
    courseName: 'Salesforce Developer',
    description: 'Master Salesforce development including Apex, Lightning Components, SOQL, and platform app building for enterprise CRM solutions.',
    level: 'Intermediate to Advanced',
    thumbnail: null,
    totalPrice: 30000,
    totalDuration: '4 Months',
    totalModules: 3,
    status: 'Active',
    totalStudentsEnrolled: 56,
    modules: [
      { id: 'SF-01', name: 'Salesforce Fundamentals', description: 'Salesforce platform overview, data model, security model, and declarative development.', price: 10000, duration: '1.5 Months', topics: ['Salesforce Basics', 'Data Model', 'Security Model', 'Declarative Dev', 'Process Builder'] },
      { id: 'SF-02', name: 'Apex & Lightning Components', description: 'Apex programming, triggers, batch jobs, Lightning Web Components, and Aura components.', price: 12000, duration: '1.5 Months', topics: ['Apex', 'Triggers', 'Batch Apex', 'Lightning Web Components', 'Aura'] },
      { id: 'SF-03', name: 'Integration & Deployment', description: 'REST/SOAP APIs, Platform Events, Change Data Capture, and Salesforce DX deployment.', price: 8000, duration: '1 Month', topics: ['REST APIs', 'SOAP APIs', 'Platform Events', 'Change Data Capture', 'Salesforce DX'] },
    ],
  },
  {
    courseId: 114,
    courseName: 'Testing & Automation',
    description: 'Comprehensive software testing program covering manual testing, automation with Selenium, API testing, performance testing, and CI/CD integration.',
    level: 'Beginner to Advanced',
    thumbnail: null,
    totalPrice: 22000,
    totalDuration: '3 Months',
    totalModules: 3,
    status: 'Active',
    totalStudentsEnrolled: 89,
    modules: [
      { id: 'TST-01', name: 'Manual Testing Fundamentals', description: 'SDLC, STLC, test case design, bug reporting, and test management tools.', price: 7000, duration: '1 Month', topics: ['SDLC', 'STLC', 'Test Case Design', 'Bug Reporting', 'JIRA', 'TestRail'] },
      { id: 'TST-02', name: 'Automation with Selenium', description: 'Selenium WebDriver, TestNG, Page Object Model, data-driven testing, and framework design.', price: 8000, duration: '1 Month', topics: ['Selenium WebDriver', 'TestNG', 'Page Object Model', 'Data-Driven Testing', 'Framework Design'] },
      { id: 'TST-03', name: 'API & Performance Testing', description: 'REST API testing with Postman/RestAssured, performance testing with JMeter, and CI integration.', price: 7000, duration: '1 Month', topics: ['Postman', 'RestAssured', 'API Automation', 'JMeter', 'CI Integration'] },
    ],
  },
  {
    courseId: 115,
    courseName: 'Business Analytics',
    description: 'Transform data into business insights. Learn data analysis, visualization, SQL, Excel, and storytelling to drive strategic business decisions.',
    level: 'Beginner to Advanced',
    thumbnail: null,
    totalPrice: 20000,
    totalDuration: '3 Months',
    totalModules: 3,
    status: 'Active',
    totalStudentsEnrolled: 178,
    modules: [
      { id: 'BA-01', name: 'Analytics Foundations', description: 'Business metrics, data collection, Excel analytics, SQL for business analysis, and KPI frameworks.', price: 7000, duration: '1 Month', topics: ['Business Metrics', 'Excel Analytics', 'SQL for BA', 'KPIs', 'Data Collection'] },
      { id: 'BA-02', name: 'Visualization & Dashboards', description: 'Data visualization principles, Tableau dashboards, Power BI reports, and executive presentations.', price: 7000, duration: '1 Month', topics: ['Data Visualization', 'Tableau', 'Power BI', 'Dashboards', 'Storytelling'] },
      { id: 'BA-03', name: 'Advanced Analytics & Strategy', description: 'Predictive analytics, cohort analysis, customer segmentation, and data-driven strategy.', price: 6000, duration: '1 Month', topics: ['Predictive Analytics', 'Cohort Analysis', 'Segmentation', 'Strategy', 'A/B Testing'] },
    ],
  },
  {
    courseId: 116,
    courseName: 'Power BI',
    description: 'Master Microsoft Power BI for data visualization, DAX formulas, Power Query, dashboard design, and enterprise-scale business intelligence solutions.',
    level: 'Beginner to Advanced',
    thumbnail: null,
    totalPrice: 18000,
    totalDuration: '2 Months',
    totalModules: 3,
    status: 'Active',
    totalStudentsEnrolled: 203,
    modules: [
      { id: 'PB-01', name: 'Power BI Basics', description: 'Power BI Desktop, data sources, data transformation with Power Query, and basic visualizations.', price: 6000, duration: '3 Weeks', topics: ['Power BI Desktop', 'Data Sources', 'Power Query', 'Visualizations', 'Reports'] },
      { id: 'PB-02', name: 'DAX & Data Modeling', description: 'DAX formulas, calculated columns, measures, time intelligence, and star schema modeling.', price: 6000, duration: '3 Weeks', topics: ['DAX Fundamentals', 'Calculated Columns', 'Measures', 'Time Intelligence', 'Star Schema'] },
      { id: 'PB-03', name: 'Advanced Dashboards & Deployment', description: 'Row-level security, Power BI Service, workspaces, deployment pipelines, and embedded analytics.', price: 6000, duration: '2 Weeks', topics: ['Row-Level Security', 'Power BI Service', 'Workspaces', 'Deployment', 'Embedded'] },
    ],
  },
  {
    courseId: 117,
    courseName: 'React JS Development',
    description: 'Deep dive into React ecosystem: hooks, context API, Redux, Next.js, TypeScript, testing, and production deployment of modern single-page applications.',
    level: 'Beginner to Advanced',
    thumbnail: null,
    totalPrice: 24000,
    totalDuration: '3 Months',
    totalModules: 3,
    status: 'Active',
    totalStudentsEnrolled: 189,
    modules: [
      { id: 'RE-01', name: 'React Core Concepts', description: 'JSX, components, props, state, hooks (useState, useEffect, useContext), and React Router.', price: 8000, duration: '1 Month', topics: ['JSX', 'Components', 'Props & State', 'React Hooks', 'React Router'] },
      { id: 'RE-02', name: 'Advanced React Patterns', description: 'Compound components, render props, custom hooks, context API, Redux, and performance optimization.', price: 8000, duration: '1 Month', topics: ['Custom Hooks', 'Context API', 'Redux', 'Performance', 'Code Splitting'] },
      { id: 'RE-03', name: 'Next.js & Production', description: 'Next.js framework, SSR, SSG, TypeScript integration, testing, and deployment to Vercel/AWS.', price: 8000, duration: '1 Month', topics: ['Next.js', 'SSR/SSG', 'TypeScript', 'Testing', 'Deployment'] },
    ],
  },
  {
    courseId: 118,
    courseName: 'Angular Development',
    description: 'Enterprise Angular development with TypeScript, RxJS, NgRx state management, Angular Material, and scalable architecture for large applications.',
    level: 'Intermediate to Advanced',
    thumbnail: null,
    totalPrice: 26000,
    totalDuration: '4 Months',
    totalModules: 3,
    status: 'Active',
    totalStudentsEnrolled: 67,
    modules: [
      { id: 'AN-01', name: 'Angular Fundamentals', description: 'Components, modules, services, dependency injection, routing, and template syntax.', price: 9000, duration: '1.5 Months', topics: ['Components', 'Modules', 'Services', 'DI', 'Routing', 'Templates'] },
      { id: 'AN-02', name: 'RxJS & State Management', description: 'Reactive programming with RxJS, observables, operators, NgRx store, and effects.', price: 9000, duration: '1.5 Months', topics: ['RxJS', 'Observables', 'Operators', 'NgRx Store', 'Effects'] },
      { id: 'AN-03', name: 'Advanced Angular & Deployment', description: 'Angular Material, lazy loading, PWA, SSR with Angular Universal, and testing.', price: 8000, duration: '1 Month', topics: ['Angular Material', 'Lazy Loading', 'PWA', 'Angular Universal', 'Testing'] },
    ],
  },
  {
    courseId: 119,
    courseName: 'Blockchain Development',
    description: 'Master blockchain technology: Solidity smart contracts, Ethereum, Web3.js, decentralized applications, NFTs, and DeFi protocols.',
    level: 'Intermediate to Advanced',
    thumbnail: null,
    totalPrice: 35000,
    totalDuration: '4 Months',
    totalModules: 3,
    status: 'Active',
    totalStudentsEnrolled: 45,
    modules: [
      { id: 'BC-01', name: 'Blockchain Fundamentals', description: 'Distributed ledger technology, consensus mechanisms, cryptography, and Ethereum architecture.', price: 12000, duration: '1.5 Months', topics: ['DLT', 'Consensus', 'Cryptography', 'Ethereum', 'Gas & Transactions'] },
      { id: 'BC-02', name: 'Smart Contracts & Solidity', description: 'Solidity programming, ERC standards, testing, security patterns, and Hardhat framework.', price: 13000, duration: '1.5 Months', topics: ['Solidity', 'ERC-20', 'ERC-721', 'Hardhat', 'Security Patterns'] },
      { id: 'BC-03', name: 'dApps & Web3 Integration', description: 'Web3.js, Ethers.js, React integration, wallet connectivity, IPFS, and DeFi protocols.', price: 10000, duration: '1 Month', topics: ['Web3.js', 'Ethers.js', 'Wallet Connect', 'IPFS', 'DeFi'] },
    ],
  },
  {
    courseId: 120,
    courseName: 'Prompt Engineering & Generative AI',
    description: 'Master prompt engineering for LLMs like GPT-4, Claude, and Gemini. Build AI-powered applications with LangChain, vector databases, and RAG architectures.',
    level: 'Beginner to Advanced',
    thumbnail: null,
    totalPrice: 20000,
    totalDuration: '2 Months',
    totalModules: 3,
    status: 'Active',
    totalStudentsEnrolled: 234,
    modules: [
      { id: 'PE-01', name: 'Prompt Fundamentals', description: 'Prompt design patterns, zero-shot/few-shot learning, chain-of-thought, and prompt optimization techniques.', price: 7000, duration: '3 Weeks', topics: ['Prompt Design', 'Zero-Shot', 'Few-Shot', 'Chain-of-Thought', 'Optimization'] },
      { id: 'PE-02', name: 'AI Application Development', description: 'LangChain framework, RAG architecture, vector databases (Pinecone, Weaviate), and LLM API integration.', price: 7000, duration: '3 Weeks', topics: ['LangChain', 'RAG', 'Vector Databases', 'LLM APIs', 'Embeddings'] },
      { id: 'PE-03', name: 'Advanced AI & Deployment', description: 'Fine-tuning, evaluation metrics, responsible AI, and deploying AI applications to production.', price: 6000, duration: '2 Weeks', topics: ['Fine-Tuning', 'Evaluation', 'Responsible AI', 'Deployment', 'Monitoring'] },
    ],
  },
]
