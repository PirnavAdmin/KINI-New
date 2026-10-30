export const WEBINAR_MEETINGS = [
  {
    id: 'react-architecture-2026', title: 'React Architecture Webinar', type: 'Webinar',
    description: 'A practical deep dive into scalable React architecture, design systems, performance, and maintainable frontend patterns.',
    host: { name: 'Alex Chen', role: 'Senior Frontend Engineer', email: 'alex.chen@kinieduhub.io', initials: 'AC' },
    date: '2026-08-06', startTime: '10:00', endTime: '11:30', duration: '1h 30m', timeZone: 'Asia/Kolkata (IST)',
    platform: 'Zoom', meetingLink: 'https://zoom.us/j/8842017632', meetingId: '884 201 7632', passcode: 'REACT26',
    participants: ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Eve Davis', 'Frank Miller'], participantCount: 86,
    registrationStatus: 'Open', status: 'Scheduled', createdBy: 'Demo Mentor', createdDate: '2026-07-20', lastUpdated: '2026-08-01',
    agenda: ['Architecture foundations', 'Feature-based structure', 'State and data boundaries', 'Performance checklist', 'Live Q&A'],
    recordingAvailable: false, attachments: [{ name: 'React Architecture Guide.pdf', size: '2.4 MB' }, { name: 'Session Agenda.docx', size: '184 KB' }],
    notes: 'Participants should have working knowledge of React hooks and component composition.',
  },
  {
    id: 'mentor-monthly-sync', title: 'Monthly Mentor Sync', type: 'Meeting',
    description: 'Monthly collaboration meeting for mentors to review batch progress, student risks, and upcoming academic activities.',
    host: { name: 'Priya Sharma', role: 'Lead Mentor', email: 'priya.sharma@kinieduhub.io', initials: 'PS' },
    date: '2026-08-03', startTime: '14:00', endTime: '15:00', duration: '1h', timeZone: 'Asia/Kolkata (IST)',
    platform: 'Google Meet', meetingLink: 'https://meet.google.com/mentor-sync', meetingId: 'mentor-sync', passcode: null,
    participants: ['Demo Mentor', 'Alex Chen', 'Rajesh Kumar', 'Ananya Singh'], participantCount: 12,
    registrationStatus: 'Invite only', status: 'Live', createdBy: 'Priya Sharma', createdDate: '2026-07-27', lastUpdated: '2026-08-03',
    agenda: ['Batch health review', 'At-risk students', 'August calendar', 'Action items'], recordingAvailable: true,
    recordingLink: 'https://drive.google.com/mentor-sync-recording', attachments: [{ name: 'Mentor KPI Report.xlsx', size: '540 KB' }], notes: 'Team leads should update batch metrics before joining.',
  },
  {
    id: 'ai-education-webinar', title: 'AI in Education Webinar', type: 'Webinar',
    description: 'Explore responsible and effective uses of generative AI for teaching, assessment, and personalized learning.',
    host: { name: 'Dr. Meera Rao', role: 'AI Education Specialist', email: 'meera.rao@kinieduhub.io', initials: 'MR' },
    date: '2026-08-08', startTime: '15:00', endTime: '16:30', duration: '1h 30m', timeZone: 'Asia/Kolkata (IST)', platform: 'Microsoft Teams',
    meetingLink: 'https://teams.microsoft.com/l/meetup/ai-education', meetingId: '948 331 002', passcode: 'AIEDU', participants: ['Batch A - MERN', 'Batch B - Python', 'Batch C - AI/ML'], participantCount: 140,
    registrationStatus: 'Open', status: 'Scheduled', createdBy: 'Academic Team', createdDate: '2026-07-18', lastUpdated: '2026-08-02',
    agenda: ['AI-assisted teaching', 'Assessment integrity', 'Personalized pathways', 'Responsible AI'], recordingAvailable: false,
    attachments: [{ name: 'Responsible AI Checklist.pdf', size: '1.1 MB' }], notes: 'Registration closes two hours before the event.',
  },
  {
    id: 'github-workshop', title: 'Git & GitHub Collaboration Workshop', type: 'Webinar', description: 'Hands-on workflow covering branches, pull requests, code reviews, and conflict resolution.',
    host: { name: 'Vikram Patel', role: 'DevOps Engineer', email: 'vikram.patel@kinieduhub.io', initials: 'VP' }, date: '2026-07-29', startTime: '16:00', endTime: '17:30', duration: '1h 30m', timeZone: 'Asia/Kolkata (IST)', platform: 'Zoom',
    meetingLink: 'https://zoom.us/j/778812901', meetingId: '778 812 901', passcode: 'GITHUB', participants: ['Alice Johnson', 'David Brown', 'Henry Moore'], participantCount: 64, registrationStatus: 'Closed', status: 'Completed',
    createdBy: 'Demo Mentor', createdDate: '2026-07-10', lastUpdated: '2026-07-29', agenda: ['Git workflow', 'Pull requests', 'Reviews', 'Conflict lab'], recordingAvailable: true, recordingLink: 'https://videos.kinieduhub.io/github-workshop', attachments: [{ name: 'Git Command Reference.pdf', size: '870 KB' }], notes: 'Recording and lab files are available to attendees.',
  },
  {
    id: 'student-project-review', title: 'Student Project Review Meeting', type: 'Meeting', description: 'Structured review of capstone progress, blockers, code quality, and delivery milestones.',
    host: { name: 'Demo Mentor', role: 'MERN Stack Mentor', email: 'mentor@demo.kinieduhub.io', initials: 'DM' }, date: '2026-08-05', startTime: '11:00', endTime: '12:00', duration: '1h', timeZone: 'Asia/Kolkata (IST)', platform: 'Google Meet', meetingLink: 'https://meet.google.com/project-review', meetingId: 'project-review', passcode: null,
    participants: ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown'], participantCount: 8, registrationStatus: 'Invite only', status: 'Scheduled', createdBy: 'Demo Mentor', createdDate: '2026-08-01', lastUpdated: '2026-08-02', agenda: ['Demo progress', 'Technical blockers', 'Code quality', 'Next milestone'], recordingAvailable: false, attachments: [], notes: 'Each team receives ten minutes for its update.',
  },
  {
    id: 'career-guidance', title: 'Career Guidance & Interview Readiness', type: 'Webinar', description: 'Industry-focused guidance covering portfolio positioning, interviews, and job-search strategy.',
    host: { name: 'Ananya Singh', role: 'Career Success Manager', email: 'ananya.singh@kinieduhub.io', initials: 'AS' }, date: '2026-08-12', startTime: '17:00', endTime: '18:30', duration: '1h 30m', timeZone: 'Asia/Kolkata (IST)', platform: 'Microsoft Teams', meetingLink: 'https://teams.microsoft.com/career-guidance', meetingId: '734 190 118', passcode: 'CAREER',
    participants: ['All final-year batches'], participantCount: 220, registrationStatus: 'Open', status: 'Scheduled', createdBy: 'Career Team', createdDate: '2026-07-30', lastUpdated: '2026-08-02', agenda: ['Portfolio audit', 'Interview framework', 'Resume signals', 'Hiring Q&A'], recordingAvailable: false, attachments: [{ name: 'Interview Preparation Kit.pdf', size: '3.2 MB' }], notes: 'Students may submit questions during registration.',
  },
  {
    id: 'assessment-calibration', title: 'Assessment Calibration Meeting', type: 'Meeting', description: 'Mentor calibration meeting to align rubrics and evaluation standards.', host: { name: 'Rajesh Kumar', role: 'Assessment Lead', email: 'rajesh.kumar@kinieduhub.io', initials: 'RK' },
    date: '2026-07-25', startTime: '10:30', endTime: '11:30', duration: '1h', timeZone: 'Asia/Kolkata (IST)', platform: 'Google Meet', meetingLink: 'https://meet.google.com/calibration', meetingId: 'calibration', passcode: null, participants: ['Mentor Team'], participantCount: 18, registrationStatus: 'Invite only', status: 'Completed', createdBy: 'Assessment Team', createdDate: '2026-07-15', lastUpdated: '2026-07-25', agenda: ['Rubric review', 'Sample evaluation', 'Variance resolution'], recordingAvailable: true, recordingLink: 'https://videos.kinieduhub.io/calibration', attachments: [{ name: 'Evaluation Rubric.xlsx', size: '220 KB' }], notes: 'Approved rubric applies to August assessments.',
  },
  {
    id: 'cloud-fundamentals', title: 'Cloud Fundamentals Orientation', type: 'Webinar', description: 'Orientation to cloud concepts, learning outcomes, labs, and certification pathways.', host: { name: 'Neha Verma', role: 'Cloud Architect', email: 'neha.verma@kinieduhub.io', initials: 'NV' },
    date: '2026-08-15', startTime: '09:30', endTime: '11:00', duration: '1h 30m', timeZone: 'Asia/Kolkata (IST)', platform: 'Zoom', meetingLink: 'https://zoom.us/j/665120884', meetingId: '665 120 884', passcode: 'CLOUD', participants: ['Cloud Cohort'], participantCount: 72, registrationStatus: 'Open', status: 'Scheduled', createdBy: 'Learning Team', createdDate: '2026-08-01', lastUpdated: '2026-08-02', agenda: ['Cloud overview', 'Lab environment', 'Learning plan', 'Certification map'], recordingAvailable: false, attachments: [{ name: 'Cloud Learning Path.pdf', size: '1.5 MB' }], notes: 'Lab credentials will be shared after the session.',
  },
  {
    id: 'cancelled-office-hours', title: 'Advanced React Office Hours', type: 'Meeting', description: 'Open office-hours session for advanced React questions.', host: { name: 'Alex Chen', role: 'Senior Frontend Engineer', email: 'alex.chen@kinieduhub.io', initials: 'AC' },
    date: '2026-08-04', startTime: '16:00', endTime: '17:00', duration: '1h', timeZone: 'Asia/Kolkata (IST)', platform: 'Google Meet', meetingLink: 'https://meet.google.com/react-hours', meetingId: 'react-hours', passcode: null, participants: ['Batch A - MERN'], participantCount: 24, registrationStatus: 'Closed', status: 'Cancelled', createdBy: 'Alex Chen', createdDate: '2026-07-31', lastUpdated: '2026-08-03', agenda: ['Suspense', 'Performance', 'Testing'], recordingAvailable: false, attachments: [], notes: 'Cancelled due to host unavailability; replacement session will be announced.',
  },
  {
    id: 'system-design-masterclass', title: 'System Design Masterclass', type: 'Webinar', description: 'Design scalable services using practical architecture trade-offs and case studies.', host: { name: 'Arjun Nair', role: 'Principal Engineer', email: 'arjun.nair@kinieduhub.io', initials: 'AN' },
    date: '2026-08-20', startTime: '18:00', endTime: '20:00', duration: '2h', timeZone: 'Asia/Kolkata (IST)', platform: 'Zoom', meetingLink: 'https://zoom.us/j/551900127', meetingId: '551 900 127', passcode: 'DESIGN', participants: ['Advanced engineering cohorts'], participantCount: 180, registrationStatus: 'Open', status: 'Scheduled', createdBy: 'Academic Team', createdDate: '2026-08-01', lastUpdated: '2026-08-03', agenda: ['Requirements', 'Capacity planning', 'Data design', 'Scaling patterns', 'Case study'], recordingAvailable: false, attachments: [{ name: 'System Design Workbook.pdf', size: '4.8 MB' }], notes: 'Bring a notebook for the collaborative case study.',
  },
]

export const getWebinarMeetingById = (id) => WEBINAR_MEETINGS.find((event) => event.id === id)

