/**
 * Live Class Mock Data
 *
 * Provides 20 realistic static live class records for the Mentor Dashboard.
 * Distribution: 3 Live · 4 Today (Scheduled) · 1 Scheduled (future) ·
 *               4 Upcoming · 5 Completed · 3 Cancelled
 *
 * This data can be seamlessly replaced with the GET /api/v1/live-classes API
 * response once the backend is available — no UI code changes needed.
 *
 * Shape matches what the MentorLiveClasses component expects.
 */

// ── Date helpers ────────────────────────────────────────────────

const today = () => {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

const daysFromNow = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const makeCreated = (...offsets) => {
  const d = new Date()
  for (const o of offsets) d.setDate(d.getDate() - o)
  return d.toISOString().split('T')[0]
}

// ── Static mentor info used across records ──────────────────────

const MENTOR_ID = 101
const MENTOR_NAME = 'Dr. Sarah Chen'

// ── Class records ───────────────────────────────────────────────

export function getLiveClassMockData() {
  const now = new Date()

  /* Live class times (~20–60 min from now) */
  const makeLiveTime = (offsetMin) => {
    const t = new Date(now.getTime() + offsetMin * 60 * 1000)
    const h = String(t.getHours()).padStart(2, '0')
    const m = String(t.getMinutes()).padStart(2, '0')
    const end = new Date(t.getTime() + 75 * 60 * 1000)
    const eh = String(end.getHours()).padStart(2, '0')
    const em = String(end.getMinutes()).padStart(2, '0')
    return { start: `${h}:${m}`, end: `${eh}:${em}` }
  }

  const l1 = makeLiveTime(15)
  const l2 = makeLiveTime(35)
  const l3 = makeLiveTime(50)

  return [
    // ═══════════════════════════════════════════════════════════
    // 🔴 3 LIVE CLASSES — Happening right now (today)
    // ═══════════════════════════════════════════════════════════
    {
      liveClassId: 1001, classTitle: 'React Hooks & Component Lifecycle',
      description: 'Deep dive into useState, useEffect, useReducer, and custom hooks. Covers component lifecycle, side effects, performance optimization with useMemo and useCallback, and practical real-world patterns for building scalable React applications.',
      courseName: 'React.js Development', batchName: 'React Batch A',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: today(), startTime: l1.start, endTime: l1.end,
      durationMinutes: 90, meetingPlatform: 'Google Meet',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      recordingEnabled: true, attendanceCount: 24, status: 'Live',
      studentsCount: 28, sessionType: 'Theory', classCategory: 'Frontend Development',
      subject: 'React.js', createdDate: makeCreated(5),
    },
    {
      liveClassId: 1002, classTitle: 'Spring Boot REST API Development',
      description: 'Build production-ready REST APIs with Spring Boot. Topics include dependency injection, JPA repositories, DTO patterns, exception handling, API versioning, and securing endpoints with JWT authentication.',
      courseName: 'Java Full Stack Development', batchName: 'Java Batch A',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: today(), startTime: l2.start, endTime: l2.end,
      durationMinutes: 120, meetingPlatform: 'Zoom',
      meetingLink: 'https://zoom.us/j/1234567890',
      recordingEnabled: true, attendanceCount: 19, status: 'Live',
      studentsCount: 22, sessionType: 'Practical', classCategory: 'Backend Development',
      subject: 'Java', createdDate: makeCreated(4),
    },
    {
      liveClassId: 1003, classTitle: 'ES6+ Features & Async Programming',
      description: 'Master modern JavaScript features including arrow functions, destructuring, spread/rest operators, template literals, modules, Promises, async/await, and error handling patterns for asynchronous code.',
      courseName: 'JavaScript Fundamentals', batchName: 'JS Batch A',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: today(), startTime: l3.start, endTime: l3.end,
      durationMinutes: 90, meetingPlatform: 'Microsoft Teams',
      meetingLink: 'https://teams.microsoft.com/l/meetup/abc123',
      recordingEnabled: true, attendanceCount: 21, status: 'Live',
      studentsCount: 25, sessionType: 'Theory', classCategory: 'Core Development',
      subject: 'JavaScript', createdDate: makeCreated(7),
    },

    // ═══════════════════════════════════════════════════════════
    // 📅 4 TODAY'S (Scheduled) — Later today
    // ═══════════════════════════════════════════════════════════
    {
      liveClassId: 1004, classTitle: 'Responsive Layouts with Flexbox & Grid',
      description: 'Hands-on workshop covering CSS Flexbox and Grid layout systems. Learn to build responsive, mobile-first layouts and manage alignment, distribution, and responsive breakpoints.',
      courseName: 'HTML & CSS Masterclass', batchName: 'Web Fundamentals Batch A',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: today(), startTime: '14:00', endTime: '15:30',
      durationMinutes: 90, meetingPlatform: 'Google Meet',
      meetingLink: 'https://meet.google.com/def-ghij-klm',
      recordingEnabled: true, attendanceCount: 0, status: 'Scheduled',
      studentsCount: 30, sessionType: 'Practical', classCategory: 'Frontend Development',
      subject: 'HTML & CSS', createdDate: makeCreated(3),
    },
    {
      liveClassId: 1005, classTitle: 'SQL Joins, Indexes & Query Performance',
      description: 'Deep dive into INNER JOIN, LEFT JOIN, self-joins, composite indexes, EXPLAIN plan analysis, and query optimization strategies for production databases.',
      courseName: 'Database Management', batchName: 'DB Batch A',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: today(), startTime: '15:00', endTime: '16:30',
      durationMinutes: 90, meetingPlatform: 'Zoom',
      meetingLink: 'https://zoom.us/j/2345678901',
      recordingEnabled: true, attendanceCount: 0, status: 'Scheduled',
      studentsCount: 22, sessionType: 'Practical', classCategory: 'Database Systems',
      subject: 'SQL', createdDate: makeCreated(6),
    },
    {
      liveClassId: 1006, classTitle: 'Full Stack Developer Mock Interview',
      description: 'Live simulated technical interview covering data structures, algorithms, system design, and behavioral questions. Receive real-time feedback on problem-solving and communication.',
      courseName: 'Interview Preparation', batchName: 'Placement Batch B',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: today(), startTime: '16:00', endTime: '17:30',
      durationMinutes: 90, meetingPlatform: 'Microsoft Teams',
      meetingLink: 'https://teams.microsoft.com/l/meetup/def456',
      recordingEnabled: false, attendanceCount: 0, status: 'Scheduled',
      studentsCount: 6, sessionType: 'Mock Interview', classCategory: 'Placement Preparation',
      subject: 'Interview Prep', createdDate: makeCreated(8),
    },
    {
      liveClassId: 1007, classTitle: 'Building RESTful APIs with ASP.NET Core',
      description: 'Create robust Web APIs using ASP.NET Core. Covers controllers, attribute routing, model binding, validation, Entity Framework Core integration, and Swagger documentation.',
      courseName: 'ASP.NET Core Web API', batchName: '.NET Batch A',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: today(), startTime: '17:00', endTime: '18:30',
      durationMinutes: 90, meetingPlatform: 'Zoom',
      meetingLink: 'https://zoom.us/j/3456789012',
      recordingEnabled: true, attendanceCount: 0, status: 'Scheduled',
      studentsCount: 18, sessionType: 'Theory + Practical', classCategory: 'Backend Development',
      subject: 'ASP.NET Core', createdDate: makeCreated(9),
    },

    // ═══════════════════════════════════════════════════════════
    // 🔮 4 UPCOMING — Future dates (not today)
    // ═══════════════════════════════════════════════════════════
    {
      liveClassId: 1008, classTitle: 'Microservices Architecture & Design Patterns',
      description: 'Learn to decompose monoliths into microservices. Covers service discovery, API gateways, circuit breakers, event-driven communication, and container orchestration with Kubernetes.',
      courseName: 'System Design', batchName: 'SD Batch A',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: daysFromNow(1), startTime: '10:00', endTime: '12:00',
      durationMinutes: 120, meetingPlatform: 'Google Meet',
      meetingLink: 'https://meet.google.com/ghi-jklm-nop',
      recordingEnabled: true, attendanceCount: 0, status: 'Scheduled',
      studentsCount: 35, sessionType: 'Theory + Practical', classCategory: 'System Design',
      subject: 'System Design', createdDate: makeCreated(2),
    },
    {
      liveClassId: 1009, classTitle: 'Resume & LinkedIn Optimization Workshop',
      description: 'Hands-on session to craft ATS-friendly resumes, optimize LinkedIn profiles, build a personal brand, and network effectively with recruiters. Bring your resume for live review.',
      courseName: 'Placement Preparation', batchName: 'Placement Batch A',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: daysFromNow(2), startTime: '09:00', endTime: '11:00',
      durationMinutes: 120, meetingPlatform: 'Zoom',
      meetingLink: 'https://zoom.us/j/4567890123',
      recordingEnabled: true, attendanceCount: 0, status: 'Scheduled',
      studentsCount: 40, sessionType: 'Workshop', classCategory: 'Placement Preparation',
      subject: 'Career Prep', createdDate: makeCreated(1),
    },
    {
      liveClassId: 1010, classTitle: 'Crafting ATS-Friendly Resumes',
      description: 'Learn how applicant tracking systems work, what keywords to use, how to structure your experience, and common pitfalls that cause rejection. Includes templates and live critiques.',
      courseName: 'Resume Building', batchName: 'Placement Batch C',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: daysFromNow(4), startTime: '14:00', endTime: '16:00',
      durationMinutes: 120, meetingPlatform: 'Microsoft Teams',
      meetingLink: 'https://teams.microsoft.com/l/meetup/ghi789',
      recordingEnabled: true, attendanceCount: 0, status: 'Scheduled',
      studentsCount: 35, sessionType: 'Workshop', classCategory: 'Placement Preparation',
      subject: 'Career Prep', createdDate: makeCreated(3),
    },
    {
      liveClassId: 1011, classTitle: 'Microservices with Spring Cloud',
      description: 'Advanced Java session covering Spring Cloud Config, Eureka service discovery, API Gateway, resilience with Resilience4j, distributed tracing, and centralized logging.',
      courseName: 'Java Full Stack Development', batchName: 'Java Batch B',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: daysFromNow(7), startTime: '11:00', endTime: '13:00',
      durationMinutes: 120, meetingPlatform: 'Google Meet',
      meetingLink: 'https://meet.google.com/jkl-mnop-qrs',
      recordingEnabled: true, attendanceCount: 0, status: 'Scheduled',
      studentsCount: 20, sessionType: 'Theory + Practical', classCategory: 'Backend Development',
      subject: 'Java', createdDate: makeCreated(5),
    },

    // ═══════════════════════════════════════════════════════════
    // ✅ 5 COMPLETED — Past dates
    // ═══════════════════════════════════════════════════════════
    {
      liveClassId: 1012, classTitle: 'Closures, Promises & Error Handling',
      description: 'Comprehensive session on JavaScript closures, the event loop, promise chaining, error boundaries, try/catch patterns, and debugging async code with hands-on exercises.',
      courseName: 'JavaScript Fundamentals', batchName: 'JS Batch A',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: daysAgo(2), startTime: '10:00', endTime: '11:30',
      durationMinutes: 90, meetingPlatform: 'Google Meet',
      meetingLink: 'https://meet.google.com/nop-qrst-uvw',
      recordingEnabled: true, attendanceCount: 23, status: 'Completed',
      studentsCount: 25, sessionType: 'Theory', classCategory: 'Core Development',
      subject: 'JavaScript', createdDate: makeCreated(10),
    },
    {
      liveClassId: 1013, classTitle: 'CSS Animations & Modern Layouts',
      description: 'Master CSS transitions, keyframe animations, transforms, clip-path magic, container queries, and latest CSS features including subgrid, :has() selector, and view transitions.',
      courseName: 'HTML & CSS Masterclass', batchName: 'Web Fundamentals Batch B',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: daysAgo(5), startTime: '14:00', endTime: '16:00',
      durationMinutes: 120, meetingPlatform: 'Zoom',
      meetingLink: 'https://zoom.us/j/5678901234',
      recordingEnabled: true, attendanceCount: 26, status: 'Completed',
      studentsCount: 28, sessionType: 'Practical', classCategory: 'Frontend Development',
      subject: 'HTML & CSS', createdDate: makeCreated(12),
    },
    {
      liveClassId: 1014, classTitle: 'Database Sharding & Caching Strategies',
      description: 'Architecting for scale: horizontal sharding, consistent hashing, Redis caching, CDN strategies, read replicas, and cache invalidation patterns from production systems.',
      courseName: 'System Design', batchName: 'SD Batch A',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: daysAgo(8), startTime: '11:00', endTime: '12:30',
      durationMinutes: 90, meetingPlatform: 'Microsoft Teams',
      meetingLink: 'https://teams.microsoft.com/l/meetup/jkl012',
      recordingEnabled: true, attendanceCount: 15, status: 'Completed',
      studentsCount: 18, sessionType: 'Theory', classCategory: 'System Design',
      subject: 'System Design', createdDate: makeCreated(15),
    },
    {
      liveClassId: 1015, classTitle: 'NoSQL Databases & MongoDB',
      description: 'Introduction to document databases, schema design for MongoDB, aggregation pipelines, indexing strategies, replication, sharding, and NoSQL vs relational trade-offs.',
      courseName: 'Database Management', batchName: 'DB Batch B',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: daysAgo(12), startTime: '15:00', endTime: '17:00',
      durationMinutes: 120, meetingPlatform: 'Google Meet',
      meetingLink: 'https://meet.google.com/stu-vwxy-zab',
      recordingEnabled: true, attendanceCount: 17, status: 'Completed',
      studentsCount: 20, sessionType: 'Theory + Practical', classCategory: 'Database Systems',
      subject: 'MongoDB', createdDate: makeCreated(18),
    },
    {
      liveClassId: 1016, classTitle: 'Docker & Containerization Bootcamp',
      description: 'Build and deploy containerized applications with Docker, docker-compose, multi-stage builds, and security best practices for containerized microservices.',
      courseName: 'DevOps Essentials', batchName: 'DevOps Batch A',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: daysAgo(15), startTime: '10:00', endTime: '13:00',
      durationMinutes: 180, meetingPlatform: 'Zoom',
      meetingLink: 'https://zoom.us/j/6789012345',
      recordingEnabled: true, attendanceCount: 22, status: 'Completed',
      studentsCount: 25, sessionType: 'Practical', classCategory: 'DevOps',
      subject: 'Docker', createdDate: makeCreated(20),
    },

    // ═══════════════════════════════════════════════════════════
    // ❌ 3 CANCELLED — Past dates
    // ═══════════════════════════════════════════════════════════
    {
      liveClassId: 1017, classTitle: 'Kubernetes Pod Autoscaling',
      description: 'Scheduled deep dive into horizontal pod autoscaling, cluster autoscaling, resource quotas, and production cluster management. Cancelled due to mentor unavailability.',
      courseName: 'DevOps Essentials', batchName: 'DevOps Batch A',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: daysAgo(3), startTime: '14:00', endTime: '16:00',
      durationMinutes: 120, meetingPlatform: 'Zoom',
      meetingLink: 'https://zoom.us/j/7890123456',
      recordingEnabled: false, attendanceCount: 0, status: 'Cancelled',
      studentsCount: 20, sessionType: 'Practical', classCategory: 'DevOps',
      subject: 'Kubernetes', createdDate: makeCreated(14),
    },
    {
      liveClassId: 1018, classTitle: 'GraphQL API Design & Apollo Federation',
      description: 'Design and implement GraphQL APIs with Apollo Server, schema stitching, federation, subscriptions, and caching strategies. Cancelled — rescheduled for next month.',
      courseName: 'Backend Engineering', batchName: 'Backend Batch B',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: daysAgo(6), startTime: '11:00', endTime: '12:30',
      durationMinutes: 90, meetingPlatform: 'Zoom',
      meetingLink: 'https://zoom.us/j/8901234567',
      recordingEnabled: false, attendanceCount: 0, status: 'Cancelled',
      studentsCount: 18, sessionType: 'Theory + Practical', classCategory: 'Backend Development',
      subject: 'GraphQL', createdDate: makeCreated(17),
    },
    {
      liveClassId: 1019, classTitle: 'AWS Cloud Deployment Workshop',
      description: 'Deploy applications on AWS EC2, ECS, Lambda with CI/CD pipelines. Cancelled due to scheduling conflict. A new session will be announced shortly.',
      courseName: 'Cloud Computing', batchName: 'Cloud Batch A',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: daysAgo(10), startTime: '09:00', endTime: '12:00',
      durationMinutes: 180, meetingPlatform: 'Google Meet',
      meetingLink: 'https://meet.google.com/tuv-wxyz-abc',
      recordingEnabled: false, attendanceCount: 0, status: 'Cancelled',
      studentsCount: 15, sessionType: 'Workshop', classCategory: 'Cloud & DevOps',
      subject: 'AWS', createdDate: makeCreated(20),
    },

    // ═══════════════════════════════════════════════════════════
    // 🆕 1 MORE (Scheduled) — Future date
    // ═══════════════════════════════════════════════════════════
    {
      liveClassId: 1020, classTitle: 'Advanced TypeScript Patterns',
      description: 'Deep dive into conditional types, mapped types, template literal types, decorators, declaration files, and advanced generic patterns used in production TypeScript codebases.',
      courseName: 'TypeScript Masterclass', batchName: 'TS Batch A',
      mentorId: MENTOR_ID, mentorName: MENTOR_NAME,
      scheduledDate: daysFromNow(10), startTime: '14:00', endTime: '16:30',
      durationMinutes: 150, meetingPlatform: 'Google Meet',
      meetingLink: 'https://meet.google.com/bcd-efgh-ijk',
      recordingEnabled: true, attendanceCount: 0, status: 'Scheduled',
      studentsCount: 24, sessionType: 'Theory + Practical', classCategory: 'Core Development',
      subject: 'TypeScript', createdDate: makeCreated(2),
    },
  ]
}

export default getLiveClassMockData
