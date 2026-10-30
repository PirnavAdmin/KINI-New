// KINI HRMS — mock data: employees, departments, mentors.

export const HR_EMPLOYEES = [
  { id: 'EMP-101', name: 'Ananya Rao', email: 'ananya.rao@kinieduhub.io', phone: '+91 98450 10101', department: 'Engineering', designation: 'Frontend Engineer', branch: 'Bengaluru', type: 'Full-time', mentor: 'Rahul Nair', manager: 'Kiran Shetty', shift: 'General', experience: 4, joinDate: '2024-03-18', salary: 18.5, status: 'active', rating: 4.6 },
  { id: 'EMP-102', name: 'Vikram Shah', email: 'vikram.shah@kinieduhub.io', phone: '+91 98450 10102', department: 'Academics', designation: 'Senior Mentor', branch: 'Bengaluru', type: 'Full-time', mentor: '—', manager: 'Meera Iyer', shift: 'Morning', experience: 9, joinDate: '2021-07-01', salary: 24.0, status: 'active', rating: 4.8 },
  { id: 'EMP-103', name: 'Priya Nair', email: 'priya.nair@kinieduhub.io', phone: '+91 98450 10103', department: 'HR', designation: 'Recruiter', branch: 'Chennai', type: 'Full-time', mentor: 'Sneha Pillai', manager: 'Kavya Menon', shift: 'General', experience: 3, joinDate: '2025-01-10', salary: 12.0, status: 'active', rating: 4.2 },
  { id: 'EMP-104', name: 'Karan Mehta', email: 'karan.mehta@kinieduhub.io', phone: '+91 98450 10104', department: 'Engineering', designation: 'DevOps Engineer', branch: 'Hyderabad', type: 'Full-time', mentor: '—', manager: 'Kiran Shetty', shift: 'Night', experience: 6, joinDate: '2022-11-14', salary: 20.0, status: 'active', rating: 4.4 },
  { id: 'EMP-105', name: 'Sara Thomas', email: 'sara.thomas@kinieduhub.io', phone: '+91 98450 10105', department: 'Marketing', designation: 'Content Writer', branch: 'Remote', type: 'Contract', mentor: '—', manager: 'Divya Menon', shift: 'General', experience: 2, joinDate: '2025-06-02', salary: 8.5, status: 'active', rating: 4.1 },
  { id: 'EMP-106', name: 'Arjun Kapoor', email: 'arjun.kapoor@kinieduhub.io', phone: '+91 98450 10106', department: 'Engineering', designation: 'Backend Engineer', branch: 'Bengaluru', type: 'Full-time', mentor: 'Rahul Nair', manager: 'Kiran Shetty', shift: 'General', experience: 5, joinDate: '2023-02-20', salary: 19.5, status: 'active', rating: 4.5 },
  { id: 'EMP-107', name: 'Meera Iyer', email: 'meera.iyer@kinieduhub.io', phone: '+91 98450 10107', department: 'Academics', designation: 'Curriculum Lead', branch: 'Chennai', type: 'Full-time', mentor: '—', manager: 'Kavya Menon', shift: 'Morning', experience: 11, joinDate: '2019-08-05', salary: 28.0, status: 'active', rating: 4.9 },
  { id: 'EMP-108', name: 'Rohit Sen', email: 'rohit.sen@kinieduhub.io', phone: '+91 98450 10108', department: 'Sales', designation: 'Account Executive', branch: 'Mumbai', type: 'Full-time', mentor: '—', manager: 'Divya Menon', shift: 'General', experience: 3, joinDate: '2024-09-16', salary: 13.5, status: 'on-leave', rating: 4.0 },
  { id: 'EMP-109', name: 'Divya Menon', email: 'divya.menon@kinieduhub.io', phone: '+91 98450 10109', department: 'HR', designation: 'HR Business Partner', branch: 'Bengaluru', type: 'Full-time', mentor: '—', manager: 'Kavya Menon', shift: 'General', experience: 8, joinDate: '2020-04-13', salary: 22.0, status: 'active', rating: 4.7 },
  { id: 'EMP-110', name: 'Nikhil Verma', email: 'nikhil.verma@kinieduhub.io', phone: '+91 98450 10110', department: 'Product', designation: 'Product Manager', branch: 'Bengaluru', type: 'Full-time', mentor: '—', manager: 'Kavya Menon', shift: 'General', experience: 7, joinDate: '2021-12-06', salary: 25.0, status: 'active', rating: 4.6 },
  { id: 'EMP-111', name: 'Fatima Sheikh', email: 'fatima.sheikh@kinieduhub.io', phone: '+91 98450 10111', department: 'HR', designation: 'HR Executive', branch: 'Hyderabad', type: 'Full-time', mentor: 'Sneha Pillai', manager: 'Divya Menon', shift: 'General', experience: 2, joinDate: '2025-03-03', salary: 9.5, status: 'pending', rating: 3.9 },
  { id: 'EMP-112', name: 'Aditya Kulkarni', email: 'aditya.kulkarni@kinieduhub.io', phone: '+91 98450 10112', department: 'Design', designation: 'UI Designer', branch: 'Remote', type: 'Intern', mentor: '—', manager: 'Kiran Shetty', shift: 'Flexible', experience: 1, joinDate: '2025-07-21', salary: 4.0, status: 'active', rating: 4.3 },
  { id: 'EMP-113', name: 'Neha Verma', email: 'neha.verma@kinieduhub.io', phone: '+91 98450 10113', department: 'Design', designation: 'Brand Designer', branch: 'Mumbai', type: 'Full-time', mentor: '—', manager: 'Kiran Shetty', shift: 'General', experience: 5, joinDate: '2022-05-09', salary: 16.0, status: 'active', rating: 4.5 },
  { id: 'EMP-114', name: 'Ishaan Gupta', email: 'ishaan.gupta@kinieduhub.io', phone: '+91 98450 10114', department: 'Sales', designation: 'Sales Manager', branch: 'Mumbai', type: 'Full-time', mentor: '—', manager: 'Kavya Menon', shift: 'General', experience: 10, joinDate: '2018-10-22', salary: 27.0, status: 'active', rating: 4.7 },
  { id: 'EMP-115', name: 'Kavya Menon', email: 'kavya.menon@kinieduhub.io', phone: '+91 98450 10115', department: 'Operations', designation: 'COO', branch: 'Bengaluru', type: 'Full-time', mentor: '—', manager: '—', shift: 'General', experience: 14, joinDate: '2016-06-01', salary: 42.0, status: 'active', rating: 4.9 },
]

export const HR_EMPLOYEE_STATS = {
  total: 153, active: 138, onLeave: 8, contractors: 11, interns: 6, growth: 8.7,
  femalePct: 46, avgTenureYears: 3.4,
}

export const HR_DEPARTMENTS = [
  { id: 'D-01', name: 'Engineering', head: 'Kiran Shetty', headId: 'EMP-116', employees: 42, openPositions: 4, performance: 88, color: '#0f55f7', members: ['Ananya Rao', 'Karan Mehta', 'Arjun Kapoor'] },
  { id: 'D-02', name: 'Academics', head: 'Meera Iyer', headId: 'EMP-107', employees: 31, openPositions: 2, performance: 92, color: '#06b6a8', members: ['Vikram Shah', 'Meera Iyer'] },
  { id: 'D-03', name: 'HR', head: 'Kavya Menon', headId: 'EMP-115', employees: 12, openPositions: 1, performance: 90, color: '#8b5cf6', members: ['Priya Nair', 'Divya Menon', 'Fatima Sheikh'] },
  { id: 'D-04', name: 'Marketing', head: 'Divya Menon', headId: 'EMP-109', employees: 18, openPositions: 2, performance: 84, color: '#EC4899', members: ['Sara Thomas'] },
  { id: 'D-05', name: 'Sales', head: 'Ishaan Gupta', headId: 'EMP-114', employees: 22, openPositions: 3, performance: 81, color: '#F59E0B', members: ['Rohit Sen', 'Ishaan Gupta'] },
  { id: 'D-06', name: 'Product', head: 'Nikhil Verma', headId: 'EMP-110', employees: 9, openPositions: 1, performance: 89, color: '#10b981', members: ['Nikhil Verma'] },
  { id: 'D-07', name: 'Design', head: 'Kiran Shetty', headId: 'EMP-116', employees: 11, openPositions: 1, performance: 86, color: '#6366f1', members: ['Aditya Kulkarni', 'Neha Verma'] },
  { id: 'D-08', name: 'Operations', head: 'Kavya Menon', headId: 'EMP-115', employees: 8, openPositions: 0, performance: 91, color: '#EF4444', members: ['Kavya Menon'] },
]

export const HR_ORG_TREE = [
  { level: 0, name: 'Kini EdX Hub', type: 'Company', count: 153, children: [
    { level: 1, name: 'Engineering', type: 'Department', count: 42 },
    { level: 1, name: 'Academics', type: 'Department', count: 31 },
    { level: 1, name: 'HR', type: 'Department', count: 12 },
    { level: 1, name: 'Marketing', type: 'Department', count: 18 },
    { level: 1, name: 'Sales', type: 'Department', count: 22 },
    { level: 1, name: 'Product', type: 'Department', count: 9 },
    { level: 1, name: 'Design', type: 'Department', count: 11 },
    { level: 1, name: 'Operations', type: 'Department', count: 8 },
  ] },
]

export const HR_MENTORS = [
  { id: 'MEN-01', name: 'Vikram Shah', email: 'vikram.shah@kinieduhub.io', department: 'Academics', designation: 'Senior Mentor', specialization: 'Full Stack Development', courses: 6, batches: 4, students: 96, rating: 4.8, reviews: 214, availability: 'available', experience: 9, status: 'active' },
  { id: 'MEN-02', name: 'Rahul Nair', email: 'rahul.nair@kinieduhub.io', department: 'Academics', designation: 'Mentor', specialization: 'React & Frontend', courses: 4, batches: 3, students: 74, rating: 4.6, reviews: 168, availability: 'available', experience: 6, status: 'active' },
  { id: 'MEN-03', name: 'Sneha Pillai', email: 'sneha.pillai@kinieduhub.io', department: 'Academics', designation: 'Mentor', specialization: 'Data Science & AI', courses: 5, batches: 3, students: 68, rating: 4.7, reviews: 149, availability: 'busy', experience: 7, status: 'active' },
  { id: 'MEN-04', name: 'Arvind Krishnan', email: 'arvind.k@kinieduhub.io', department: 'Academics', designation: 'Mentor', specialization: 'DevOps & Cloud', courses: 3, batches: 2, students: 41, rating: 4.5, reviews: 96, availability: 'available', experience: 8, status: 'active' },
  { id: 'MEN-05', name: 'Tanvi Joshi', email: 'tanvi.joshi@kinieduhub.io', department: 'Academics', designation: 'Junior Mentor', specialization: 'UI/UX Design', courses: 2, batches: 2, students: 33, rating: 4.3, reviews: 51, availability: 'available', experience: 3, status: 'probation' },
  { id: 'MEN-06', name: 'Ramesh Iyer', email: 'ramesh.iyer@kinieduhub.io', department: 'Academics', designation: 'Mentor', specialization: 'Java & Backend', courses: 3, batches: 1, students: 22, rating: 4.4, reviews: 60, availability: 'on-leave', experience: 5, status: 'on-leave' },
]

export const HR_MENTOR_STATS = { total: 24, active: 21, onLeave: 2, avgRating: 4.6, totalBatches: 18, totalStudents: 482 }

// ── Mentor → full employee profiles (Employee Table + Profile popup) ─────────
// Additive mock data: HR_MENTORS (used by the Mentor Directory + dashboard)
// stays untouched; HR_MENTOR_EMPLOYEES merges each mentor with its rich
// HR employee record for the premium employee table.

export const HR_MENTOR_DOCUMENTS = [
  { name: 'Resume', type: 'PDF' },
  { name: 'Offer Letter', type: 'PDF' },
  { name: 'Aadhaar', type: 'PDF' },
  { name: 'PAN', type: 'PDF' },
  { name: 'ID Card', type: 'PNG' },
  { name: 'Certificates', type: 'PDF' },
  { name: 'Experience Letter', type: 'PDF' },
]

const DEFAULT_MENTOR_PROFILE = {
  employeeCode: 'KIN-M000',
  role: 'Faculty',
  phone: '—',
  joiningDate: '—',
  employmentType: 'Full-time',
  gender: '—',
  dob: '—',
  bloodGroup: 'O+',
  maritalStatus: '—',
  nationality: 'Indian',
  aadhaar: '000000000000',
  pan: 'AAAAA0000A',
  personalEmail: '—',
  officialEmail: '—',
  alternateNumber: '—',
  emergencyContact: '—',
  emergencyContactPerson: '—',
  currentAddress: '—',
  permanentAddress: '—',
  city: '—',
  state: '—',
  country: 'India',
  postalCode: '—',
  reportingManager: 'Kavya Menon',
  branch: 'Bengaluru',
  officeLocation: 'Kini EdX Hub · Koramangala',
  shift: 'General',
  workMode: 'On-site',
  confirmationDate: '—',
  probationStatus: 'Completed',
  noticePeriod: '30 days',
  assignedCourses: [],
  assignedBatches: [],
  studentsAssigned: 0,
  currentBatch: '—',
  mentorRating: 0,
  completedSessions: 0,
  upcomingSessions: 0,
  attendancePercentage: 0,
  performanceScore: 0,
  skills: [],
  certifications: [],
  education: [],
  documents: HR_MENTOR_DOCUMENTS,
  payroll: { salaryGrade: '—', bankName: '—', accountNumber: '00000000000', ifsc: '—', pfNumber: '—', esiNumber: '—' },
  attendance: { presentDays: 0, absentDays: 0, halfDays: 0, lateEntries: 0, workingHours: '—', leavesTaken: 0 },
  leave: { annualLeave: 0, casualLeave: 0, sickLeave: 0, remainingLeave: 0 },
  performance: { overallRating: 0, quarterlyRating: 0, lastAppraisal: '—', achievements: [], goals: [], managerRemarks: '—' },
  hrNotes: '—',
  courseCompletion: 0,
  assignmentsReviewed: 0,
  averageFeedback: 0,
  monthlyRating: 0,
  lastSession: '—',
  nextSession: '—',
  mentees: [],
  timeline: [],
}

const buildMentorProfile = (overrides) => ({ ...DEFAULT_MENTOR_PROFILE, ...overrides })

export const HR_MENTOR_PROFILES = {
  'MEN-01': buildMentorProfile({
    employeeCode: 'KIN-M101', role: 'Senior Faculty', phone: '+91 98450 20001', joiningDate: '2021-07-01', employmentType: 'Full-time',
    gender: 'Male', dob: '1988-04-12', bloodGroup: 'B+', maritalStatus: 'Married',
    aadhaar: '452188901234', pan: 'BHVPS4521F', personalEmail: 'vikram.shah@gmail.com', officialEmail: 'vikram.shah@kinieduhub.io',
    alternateNumber: '+91 90080 20001', emergencyContact: '+91 98220 20001', emergencyContactPerson: 'Anita Shah (Spouse)',
    currentAddress: '12, 4th Cross, Indiranagar', permanentAddress: 'Plot 7, Gandhi Nagar, Mysuru',
    city: 'Bengaluru', state: 'Karnataka', postalCode: '560038',
    reportingManager: 'Meera Iyer', branch: 'Bengaluru', shift: 'Morning', confirmationDate: '2021-12-01', noticePeriod: '60 days',
    assignedCourses: ['Full Stack Development', 'React & Frontend', 'Node.js Backend'],
    assignedBatches: ['FSD-B1', 'FSD-B3', 'REACT-B2', 'NODE-B1'],
    studentsAssigned: 96, currentBatch: 'FSD-B3', mentorRating: 4.8, completedSessions: 342, upcomingSessions: 6,
    attendancePercentage: 97, performanceScore: 92,
    skills: ['React', 'Node.js', 'JavaScript', 'SQL', 'AWS', 'MongoDB', 'Leadership', 'Communication'],
    certifications: [
      { name: 'AWS Certified Solutions Architect', issuedBy: 'Amazon Web Services', issueDate: '2023-03-14', expiryDate: '2026-03-14' },
      { name: 'Full Stack Web Development Certification', issuedBy: 'Kini EdX Hub', issueDate: '2021-12-01', expiryDate: '—' },
    ],
    education: [
      { qualification: 'B.E. Computer Science', university: 'VTU, Belagavi', year: 2010, grade: '8.7 CGPA' },
      { qualification: 'M.Tech Software Engineering', university: 'IIT Bombay', year: 2013, grade: '8.9 CGPA' },
    ],
    payroll: { salaryGrade: 'L4', bankName: 'HDFC Bank', accountNumber: '50100284511982', ifsc: 'HDFC0001234', pfNumber: 'KN/BLR/123456/112', esiNumber: '29001234567' },
    attendance: { presentDays: 214, absentDays: 2, halfDays: 3, lateEntries: 5, workingHours: '1,712 hrs', leavesTaken: 14 },
    leave: { annualLeave: 20, casualLeave: 8, sickLeave: 6, remainingLeave: 16 },
    performance: {
      overallRating: 4.8, quarterlyRating: 4.7, lastAppraisal: 'Q3 2026',
      achievements: ['Highest batch completion rate (94%)', 'Mentored 12 students into placements'],
      goals: ['Launch advanced FSD specialization', 'Improve NPS score above 85'],
      managerRemarks: 'Consistent top-performer. Strong ownership and excellent student engagement.',
    },
    hrNotes: 'Eligible for the next appraisal cycle. Interested in the curriculum leadership track.',
    courseCompletion: 92, assignmentsReviewed: 460, averageFeedback: 4.8, monthlyRating: 4.8,
    lastSession: '2026-08-03', nextSession: '2026-08-06',
    mentees: [
      { name: 'Aarav Sharma', batch: 'FSD-B3', progress: 88 },
      { name: 'Diya Patel', batch: 'FSD-B3', progress: 82 },
      { name: 'Karthik Reddy', batch: 'REACT-B2', progress: 76 },
      { name: 'Meghana Rao', batch: 'NODE-B1', progress: 91 },
    ],
    timeline: [
      { date: '2021-07-01', title: 'Joined Organization', desc: 'Onboarded as Senior Mentor · Academics', type: 'notice' },
      { date: '2021-12-01', title: 'Probation Completed', desc: 'Confirmed after successful review', type: 'approval' },
      { date: '2023-03-14', title: 'AWS Certification Added', desc: 'AWS Certified Solutions Architect', type: 'document' },
      { date: '2024-04-01', title: 'Promoted to Senior Faculty', desc: 'Led FSD curriculum redesign', type: 'approval' },
      { date: '2026-07-28', title: 'Quarterly Review', desc: 'Rated 4.8 — top quartile', type: 'kt' },
    ],
  }),
  'MEN-02': buildMentorProfile({
    employeeCode: 'KIN-M102', role: 'Faculty', phone: '+91 98450 20002', joiningDate: '2022-03-14', employmentType: 'Full-time',
    gender: 'Male', dob: '1992-09-23', bloodGroup: 'B+', maritalStatus: 'Married',
    aadhaar: '889045216677', pan: 'BJYPR8890L', personalEmail: 'rahul.nair@gmail.com', officialEmail: 'rahul.nair@kinieduhub.io',
    alternateNumber: '+91 90080 20002', emergencyContact: '+91 98220 20002', emergencyContactPerson: 'Nisha Nair (Spouse)',
    currentAddress: '4B, Prestige Apartments, Whitefield', permanentAddress: 'Sree Nagar, Thrissur, Kerala',
    city: 'Bengaluru', state: 'Karnataka', postalCode: '560066',
    reportingManager: 'Meera Iyer', branch: 'Bengaluru', shift: 'General', confirmationDate: '2022-09-14',
    assignedCourses: ['React & Frontend', 'Web Fundamentals', 'JavaScript Essentials'],
    assignedBatches: ['REACT-B2', 'REACT-B4', 'WEB-B1'],
    studentsAssigned: 74, currentBatch: 'REACT-B4', mentorRating: 4.6, completedSessions: 268, upcomingSessions: 4,
    attendancePercentage: 95, performanceScore: 88,
    skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Redux', 'Communication', 'Problem Solving'],
    certifications: [
      { name: 'Meta React Professional Certificate', issuedBy: 'Meta', issueDate: '2023-05-20', expiryDate: '2026-05-20' },
      { name: 'React Mastery Program', issuedBy: 'Kini EdX Hub', issueDate: '2022-09-01', expiryDate: '—' },
    ],
    education: [
      { qualification: 'B.E. Information Science', university: 'VTU, Belagavi', year: 2014, grade: '8.1 CGPA' },
      { qualification: 'MCA', university: 'IGNOU', year: 2017, grade: '78%' },
    ],
    payroll: { salaryGrade: 'L3', bankName: 'HDFC Bank', accountNumber: '50100311889900', ifsc: 'HDFC0002345', pfNumber: 'KN/BLR/123456/213', esiNumber: '29009876543' },
    attendance: { presentDays: 212, absentDays: 4, halfDays: 5, lateEntries: 8, workingHours: '1,696 hrs', leavesTaken: 16 },
    leave: { annualLeave: 20, casualLeave: 8, sickLeave: 6, remainingLeave: 14 },
    performance: {
      overallRating: 4.6, quarterlyRating: 4.5, lastAppraisal: 'Q3 2026',
      achievements: ['Built 20+ React projects into the curriculum', 'Improved student satisfaction to 4.7'],
      goals: ['Get promoted to Senior Mentor this year', 'Launch an advanced hooks workshop'],
      managerRemarks: 'Reliable and a student favourite. Strong communication skills.',
    },
    hrNotes: 'Prefers morning slots. Approved for AWS certification sponsorship.',
    courseCompletion: 88, assignmentsReviewed: 318, averageFeedback: 4.6, monthlyRating: 4.6,
    lastSession: '2026-08-04', nextSession: '2026-08-07',
    mentees: [
      { name: 'Ishita Verma', batch: 'REACT-B4', progress: 79 },
      { name: 'Aditya Nair', batch: 'REACT-B4', progress: 85 },
      { name: 'Shreya Iyer', batch: 'WEB-B1', progress: 68 },
    ],
    timeline: [
      { date: '2022-03-14', title: 'Joined Organization', desc: 'Onboarded as Mentor · React & Frontend', type: 'notice' },
      { date: '2022-09-14', title: 'Probation Completed', desc: 'Confirmed as full-time mentor', type: 'approval' },
      { date: '2023-05-20', title: 'Meta Certification Added', desc: 'Meta React Professional Certificate', type: 'document' },
      { date: '2026-08-02', title: 'Batch Assigned', desc: 'REACT-B4 · 28 students', type: 'checklist' },
    ],
  }),
  'MEN-03': buildMentorProfile({
    employeeCode: 'KIN-M103', role: 'Faculty', phone: '+91 98450 20003', joiningDate: '2022-11-07', employmentType: 'Full-time',
    gender: 'Female', dob: '1990-01-30', bloodGroup: 'A+', maritalStatus: 'Married',
    aadhaar: '778833449911', pan: 'BKQPS7788K', personalEmail: 'sneha.pillai@gmail.com', officialEmail: 'sneha.pillai@kinieduhub.io',
    alternateNumber: '+91 90080 20003', emergencyContact: '+91 98220 20003', emergencyContactPerson: 'Arun Pillai (Spouse)',
    currentAddress: '22, Lake View Road, HSR Layout', permanentAddress: 'Kochi, Kerala',
    city: 'Bengaluru', state: 'Karnataka', postalCode: '560102',
    reportingManager: 'Meera Iyer', branch: 'Bengaluru', shift: 'General', confirmationDate: '2023-05-07',
    assignedCourses: ['Data Science & AI', 'Python for Data', 'Machine Learning'],
    assignedBatches: ['DS-B2', 'PY-B3'],
    studentsAssigned: 68, currentBatch: 'DS-B2', mentorRating: 4.7, completedSessions: 241, upcomingSessions: 5,
    attendancePercentage: 94, performanceScore: 89,
    skills: ['Python', 'SQL', 'Machine Learning', 'TensorFlow', 'Pandas', 'Data Visualization', 'Communication'],
    certifications: [
      { name: 'Google Data Analytics Certificate', issuedBy: 'Google', issueDate: '2023-08-10', expiryDate: '2026-08-10' },
      { name: 'TensorFlow Developer Certificate', issuedBy: 'DeepLearning.AI', issueDate: '2024-02-15', expiryDate: '2027-02-15' },
    ],
    education: [
      { qualification: 'B.Tech Electronics & Communication', university: 'NIT Calicut', year: 2012, grade: '8.4 CGPA' },
      { qualification: 'M.Tech Data Science', university: 'IIIT Bangalore', year: 2015, grade: '8.6 CGPA' },
    ],
    payroll: { salaryGrade: 'L3', bankName: 'HDFC Bank', accountNumber: '50100455667788', ifsc: 'HDFC0003456', pfNumber: 'KN/BLR/123456/334', esiNumber: '29006543210' },
    attendance: { presentDays: 210, absentDays: 3, halfDays: 6, lateEntries: 7, workingHours: '1,680 hrs', leavesTaken: 13 },
    leave: { annualLeave: 20, casualLeave: 8, sickLeave: 6, remainingLeave: 15 },
    performance: {
      overallRating: 4.7, quarterlyRating: 4.6, lastAppraisal: 'Q3 2026',
      achievements: ['Published 2 industry case studies', 'Hosted 10+ AI webinars for students'],
      goals: ['Lead the Data Science specialization', 'Complete AWS Machine Learning certification'],
      managerRemarks: 'Great analytical depth. Excellent at supporting struggling students.',
    },
    hrNotes: 'Flexible on weekends. Interested in curriculum design.',
    courseCompletion: 89, assignmentsReviewed: 289, averageFeedback: 4.7, monthlyRating: 4.7,
    lastSession: '2026-08-04', nextSession: '2026-08-08',
    mentees: [
      { name: 'Rohan Gupta', batch: 'DS-B2', progress: 84 },
      { name: 'Ananya Singh', batch: 'DS-B2', progress: 90 },
      { name: 'Vivek Pillai', batch: 'PY-B3', progress: 71 },
    ],
    timeline: [
      { date: '2022-11-07', title: 'Joined Organization', desc: 'Onboarded as Mentor · Data Science & AI', type: 'notice' },
      { date: '2023-05-07', title: 'Probation Completed', desc: 'Confirmed after successful review', type: 'approval' },
      { date: '2024-02-15', title: 'TensorFlow Certification Added', desc: 'DeepLearning.AI credential', type: 'document' },
      { date: '2026-07-15', title: 'Webinar Conducted', desc: 'AI Career Paths · 120 attendees', type: 'interview' },
    ],
  }),
  'MEN-04': buildMentorProfile({
    employeeCode: 'KIN-M104', role: 'Contract Faculty', phone: '+91 98450 20004', joiningDate: '2023-06-19', employmentType: 'Contract',
    gender: 'Male', dob: '1987-12-05', bloodGroup: 'O+', maritalStatus: 'Married',
    aadhaar: '665522114433', pan: 'BOKPA6655H', personalEmail: 'arvind.k@gmail.com', officialEmail: 'arvind.k@kinieduhub.io',
    alternateNumber: '+91 90080 20004', emergencyContact: '+91 98220 20004', emergencyContactPerson: 'Lakshmi Krishnan (Mother)',
    currentAddress: '8, Cyber Heights, Gachibowli', permanentAddress: 'T. Nagar, Chennai',
    city: 'Hyderabad', state: 'Telangana', postalCode: '500032',
    reportingManager: 'Kiran Shetty', branch: 'Hyderabad', officeLocation: 'Kini EdX Hub · Gachibowli', shift: 'Night', confirmationDate: '2023-12-19', noticePeriod: '45 days',
    assignedCourses: ['DevOps & Cloud', 'Docker & Kubernetes', 'CI/CD Pipeline'],
    assignedBatches: ['DEVOPS-B1'],
    studentsAssigned: 41, currentBatch: 'DEVOPS-B1', mentorRating: 4.5, completedSessions: 186, upcomingSessions: 3,
    attendancePercentage: 93, performanceScore: 85,
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'Python', 'CI/CD', 'Problem Solving'],
    certifications: [
      { name: 'AWS Certified DevOps Engineer', issuedBy: 'Amazon Web Services', issueDate: '2023-10-01', expiryDate: '2026-10-01' },
      { name: 'Certified Kubernetes Administrator', issuedBy: 'CNCF', issueDate: '2024-04-22', expiryDate: '2027-04-22' },
    ],
    education: [
      { qualification: 'B.E. Electronics & Communication', university: 'Anna University', year: 2009, grade: '7.9 CGPA' },
      { qualification: 'M.S. Cloud Computing', university: 'BITS Pilani', year: 2014, grade: '8.2 CGPA' },
    ],
    payroll: { salaryGrade: 'L3', bankName: 'ICICI Bank', accountNumber: '50200188990011', ifsc: 'ICIC0004455', pfNumber: 'KN/HYD/654321/445', esiNumber: '29001122334' },
    attendance: { presentDays: 205, absentDays: 5, halfDays: 4, lateEntries: 12, workingHours: '1,640 hrs', leavesTaken: 15 },
    leave: { annualLeave: 18, casualLeave: 6, sickLeave: 6, remainingLeave: 12 },
    performance: {
      overallRating: 4.5, quarterlyRating: 4.4, lastAppraisal: 'Q2 2026',
      achievements: ['Cut deployment time by 40%', 'Ran 3 successful infrastructure workshops'],
      goals: ['Complete Terraform Associate certification', 'Convert contract to full-time'],
      managerRemarks: 'Technically excellent. Slightly quiet in team forums.',
    },
    hrNotes: 'Contract review due Jan 2027. Good renewal probability.',
    courseCompletion: 82, assignmentsReviewed: 176, averageFeedback: 4.4, monthlyRating: 4.5,
    lastSession: '2026-08-01', nextSession: '2026-08-05',
    mentees: [
      { name: 'Nikhil Rao', batch: 'DEVOPS-B1', progress: 77 },
      { name: 'Sanya Kapoor', batch: 'DEVOPS-B1', progress: 81 },
    ],
    timeline: [
      { date: '2023-06-19', title: 'Joined Organization', desc: 'Onboarded as Contract Mentor · DevOps & Cloud', type: 'notice' },
      { date: '2023-12-19', title: 'Contract Renewed', desc: 'Extended for 12 months', type: 'payroll' },
      { date: '2024-04-22', title: 'CKA Certification Added', desc: 'Certified Kubernetes Administrator', type: 'document' },
      { date: '2026-07-22', title: 'Infra Workshop Delivered', desc: 'CI/CD pipelines · 45 attendees', type: 'interview' },
    ],
  }),
  'MEN-05': buildMentorProfile({
    employeeCode: 'KIN-M105', role: 'Junior Faculty', phone: '+91 98450 20005', joiningDate: '2025-02-10', employmentType: 'Full-time',
    gender: 'Female', dob: '1998-07-18', bloodGroup: 'AB+', maritalStatus: 'Single',
    aadhaar: '554499881122', pan: 'CETPT5544J', personalEmail: 'tanvi.joshi@gmail.com', officialEmail: 'tanvi.joshi@kinieduhub.io',
    alternateNumber: '+91 90080 20005', emergencyContact: '+91 98220 20005', emergencyContactPerson: 'Rajesh Joshi (Father)',
    currentAddress: '9, Rose Villa, Andheri East', permanentAddress: 'Pune, Maharashtra',
    city: 'Mumbai', state: 'Maharashtra', postalCode: '400069',
    reportingManager: 'Meera Iyer', branch: 'Remote', officeLocation: 'Remote · Mumbai', shift: 'Flexible',
    probationStatus: 'Under Probation', noticePeriod: '30 days',
    assignedCourses: ['UI/UX Design', 'Figma Essentials'],
    assignedBatches: ['UIUX-B1'],
    studentsAssigned: 33, currentBatch: 'UIUX-B1', mentorRating: 4.3, completedSessions: 87, upcomingSessions: 2,
    attendancePercentage: 92, performanceScore: 80,
    skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'HTML', 'CSS', 'Communication'],
    certifications: [
      { name: 'Google UX Design Certificate', issuedBy: 'Google', issueDate: '2025-01-12', expiryDate: '2028-01-12' },
    ],
    education: [
      { qualification: 'B.Des Interaction Design', university: 'NID Ahmedabad', year: 2024, grade: '8.0 CGPA' },
    ],
    payroll: { salaryGrade: 'L2', bankName: 'HDFC Bank', accountNumber: '50200233445566', ifsc: 'HDFC0004567', pfNumber: 'KN/MUM/123456/556', esiNumber: '29006545678' },
    attendance: { presentDays: 152, absentDays: 6, halfDays: 8, lateEntries: 10, workingHours: '1,216 hrs', leavesTaken: 9 },
    leave: { annualLeave: 20, casualLeave: 8, sickLeave: 6, remainingLeave: 17 },
    performance: {
      overallRating: 4.3, quarterlyRating: 4.1, lastAppraisal: 'Q1 2026',
      achievements: ['Won the internal design sprint', 'Created 5 new Figma templates'],
      goals: ['Clear probation by Aug 2026', 'Complete a motion design course'],
      managerRemarks: 'Fast learner with great energy. Needs more classroom confidence.',
    },
    hrNotes: 'Probation review scheduled 20 Aug 2026. On track.',
    courseCompletion: 74, assignmentsReviewed: 96, averageFeedback: 4.2, monthlyRating: 4.2,
    lastSession: '2026-08-02', nextSession: '2026-08-06',
    mentees: [
      { name: 'Pooja Deshmukh', batch: 'UIUX-B1', progress: 72 },
      { name: 'Yash Thakur', batch: 'UIUX-B1', progress: 65 },
    ],
    timeline: [
      { date: '2025-02-10', title: 'Joined Organization', desc: 'Onboarded as Junior Mentor · UI/UX Design', type: 'notice' },
      { date: '2025-04-10', title: 'Training Completed', desc: 'Mentor onboarding program', type: 'checklist' },
      { date: '2025-09-15', title: 'Batch Assigned', desc: 'UIUX-B1 · 14 students', type: 'checklist' },
      { date: '2026-07-30', title: 'Quarterly Review', desc: 'Rated 4.3 — on track for confirmation', type: 'kt' },
    ],
  }),
  'MEN-06': buildMentorProfile({
    employeeCode: 'KIN-M106', role: 'Faculty', phone: '+91 98450 20006', joiningDate: '2022-01-17', employmentType: 'Full-time',
    gender: 'Male', dob: '1985-03-28', bloodGroup: 'O-', maritalStatus: 'Married',
    aadhaar: '443355667788', pan: 'AKMPR4433D', personalEmail: 'ramesh.iyer@gmail.com', officialEmail: 'ramesh.iyer@kinieduhub.io',
    alternateNumber: '+91 90080 20006', emergencyContact: '+91 98220 20006', emergencyContactPerson: 'Divya Iyer (Spouse)',
    currentAddress: '3, Green Park, Velachery', permanentAddress: 'Madurai, Tamil Nadu',
    city: 'Chennai', state: 'Tamil Nadu', postalCode: '600042',
    reportingManager: 'Meera Iyer', branch: 'Chennai', officeLocation: 'Kini EdX Hub · Velachery', shift: 'Morning', confirmationDate: '2022-07-17', noticePeriod: '60 days',
    assignedCourses: ['Java & Backend', 'Spring Boot', 'Microservices'],
    assignedBatches: ['JAVA-B2'],
    studentsAssigned: 22, currentBatch: 'JAVA-B2', mentorRating: 4.4, completedSessions: 152, upcomingSessions: 1,
    attendancePercentage: 88, performanceScore: 82,
    skills: ['Java', 'Spring Boot', 'SQL', 'Microservices', 'Kafka', 'Docker', 'Leadership', 'Problem Solving'],
    certifications: [
      { name: 'Oracle Certified Java Programmer', issuedBy: 'Oracle', issueDate: '2021-11-05', expiryDate: '2026-11-05' },
      { name: 'Spring Professional Certification', issuedBy: 'VMware', issueDate: '2023-09-18', expiryDate: '2026-09-18' },
    ],
    education: [
      { qualification: 'B.E. Computer Science', university: 'Thiagarajar College', year: 2007, grade: '8.2 CGPA' },
      { qualification: 'M.E. Software Systems', university: 'Anna University', year: 2010, grade: '8.0 CGPA' },
    ],
    payroll: { salaryGrade: 'L3', bankName: 'HDFC Bank', accountNumber: '50200366778899', ifsc: 'HDFC0005678', pfNumber: 'KN/MDS/123456/667', esiNumber: '29004332211' },
    attendance: { presentDays: 194, absentDays: 9, halfDays: 5, lateEntries: 14, workingHours: '1,552 hrs', leavesTaken: 18 },
    leave: { annualLeave: 20, casualLeave: 8, sickLeave: 6, remainingLeave: 9 },
    performance: {
      overallRating: 4.4, quarterlyRating: 4.3, lastAppraisal: 'Q2 2026',
      achievements: ['Migrated 3 courses to microservices', 'Mentored junior devs in code reviews'],
      goals: ['Complete Azure certification', 'Return to full availability'],
      managerRemarks: 'Dependable. Currently on medical leave — plan batch coverage.',
    },
    hrNotes: 'On leave (medical) until 15 Aug 2026. Batch coverage arranged.',
    courseCompletion: 78, assignmentsReviewed: 142, averageFeedback: 4.3, monthlyRating: 4.4,
    lastSession: '2026-07-29', nextSession: '2026-08-18',
    mentees: [
      { name: 'Krishna Murthy', batch: 'JAVA-B2', progress: 74 },
      { name: 'Lakshmi Devi', batch: 'JAVA-B2', progress: 80 },
    ],
    timeline: [
      { date: '2022-01-17', title: 'Joined Organization', desc: 'Onboarded as Mentor · Java & Backend', type: 'notice' },
      { date: '2022-07-17', title: 'Probation Completed', desc: 'Confirmed after successful review', type: 'approval' },
      { date: '2023-09-18', title: 'Spring Certification Added', desc: 'VMware Spring Professional', type: 'document' },
      { date: '2026-07-20', title: 'Leave Applied', desc: 'Medical leave until 15 Aug 2026', type: 'notice' },
    ],
  }),
}

// Merged employee rows for the premium Employee Table — combines the lean
// mentor record with the full HR employee profile.
export const HR_MENTOR_EMPLOYEES = HR_MENTORS.map((mentor) => ({
  ...mentor,
  ...HR_MENTOR_PROFILES[mentor.id],
  employeeId: mentor.id,
}))

export const HR_BRANCHES = [
  { value: 'all', label: 'All Branches' },
  { value: 'Bengaluru', label: 'Bengaluru' },
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Remote', label: 'Remote' },
]

export const HR_DESIGNATIONS = [
  { value: 'all', label: 'All Designations' },
  { value: 'Frontend Engineer', label: 'Frontend Engineer' },
  { value: 'Backend Engineer', label: 'Backend Engineer' },
  { value: 'DevOps Engineer', label: 'DevOps Engineer' },
  { value: 'Senior Mentor', label: 'Senior Mentor' },
  { value: 'Mentor', label: 'Mentor' },
  { value: 'Recruiter', label: 'Recruiter' },
  { value: 'Product Manager', label: 'Product Manager' },
  { value: 'Sales Manager', label: 'Sales Manager' },
]

export const HR_DEPARTMENT_LIST = [
  { value: 'all', label: 'All Departments' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Academics', label: 'Academics' },
  { value: 'HR', label: 'HR' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Product', label: 'Product' },
  { value: 'Design', label: 'Design' },
  { value: 'Operations', label: 'Operations' },
]

export const HR_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'on-leave', label: 'On Leave' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
]

// ================================================================
// ENTERPRISE WORKFORCE — unified Employee Management (HR)
// ----------------------------------------------------------------
// Every person in the organisation is managed from ONE Employee
// module. Mentors are Employees with role = 'Mentor' — there is no
// separate mentor management surface. All of the following is
// additive mock data (no API/backend/RBAC changes).
// ================================================================

export const HR_ROLES = [
  'Employee', 'Mentor', 'HR', 'Recruiter', 'Payroll', 'Manager', 'Admin', 'Trainer', 'Department Head',
]

// Distinct badge colour per role (enterprise role taxonomy).
export const HR_ROLE_META = {
  Employee: { color: '#0f55f7' },
  Mentor: { color: '#8b5cf6' },
  HR: { color: '#EC4899' },
  Recruiter: { color: '#06b6a8' },
  Payroll: { color: '#10b981' },
  Manager: { color: '#F59E0B' },
  Admin: { color: '#EF4444' },
  Trainer: { color: '#6366f1' },
  'Department Head': { color: '#0d9488' },
}

export const HR_ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  ...HR_ROLES.map((role) => ({ value: role, label: role })),
]

export const HR_EXPERIENCE_OPTIONS = [
  { value: 'all', label: 'All Experience' },
  { value: 'lt3', label: 'Less than 3 years' },
  { value: '3to5', label: '3 – 5 years' },
  { value: 'gt5', label: 'More than 5 years' },
]

export const HR_JOINING_OPTIONS = [
  { value: 'all', label: 'All Joining Dates' },
  { value: 'last30', label: 'Last 30 days' },
  { value: 'last90', label: 'Last 90 days' },
  { value: 'year', label: 'This year' },
  { value: 'older', label: 'Before this year' },
]

// Derives a role for lean employee records from their designation.
const deriveRole = (e) => {
  const d = String(e.designation || '').toLowerCase()
  if (d.includes('mentor')) return 'Mentor'
  if (d.includes('recruiter')) return 'Recruiter'
  if (d.includes('business partner') || d.includes('hr executive')) return 'HR'
  if (d.includes('coo') || d.includes('ceo')) return 'Manager'
  if (d.includes('manager')) return 'Manager'
  if (d.includes('head') || d.includes('lead')) return 'Department Head'
  if (d.includes('trainer')) return 'Trainer'
  return 'Employee'
}

const EMPLOYEE_DOCUMENTS = [
  { name: 'Resume', type: 'PDF' },
  { name: 'Offer Letter', type: 'PDF' },
  { name: 'Aadhaar', type: 'PDF' },
  { name: 'PAN', type: 'PDF' },
  { name: 'ID Card', type: 'PNG' },
  { name: 'Bank Details', type: 'PDF' },
  { name: 'Certificates', type: 'PDF' },
  { name: 'Experience Letter', type: 'PDF' },
]

const GENDERS = ['Male', 'Female']
const BLOOD_GROUPS = ['O+', 'B+', 'A+', 'AB+', 'O-']
const BANK_NAMES = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank']
const SKILL_POOL = ['Communication', 'Problem Solving', 'Teamwork', 'Project Management', 'MS Office', 'Leadership', 'Data Analysis', 'Time Management']

const skillHash = (value) => String(value).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

// Rich employee profile so the unified profile drawer can render every section
// (personal, employment, attendance, leave, payroll, performance, assets,
// documents, timeline) for non-mentor rows too.
const buildEmployeeProfile = (e, index) => {
  const joined = e.joinDate || '2024-01-01'
  const rating = e.rating || 4.0
  const attendance = 86 + ((index * 7) % 13)
  const hash = skillHash(e.name)
  const grade = rating >= 4.6 ? 'L4' : rating >= 4.2 ? 'L3' : 'L2'
  return {
    role: deriveRole(e),
    employeeCode: `KIN-E${String(index + 1).padStart(3, '0')}`,
    gender: GENDERS[index % GENDERS.length],
    dob: `${1990 + (index % 9)}-${String((index % 12) + 1).padStart(2, '0')}-15`,
    bloodGroup: BLOOD_GROUPS[index % BLOOD_GROUPS.length],
    maritalStatus: index % 3 === 0 ? 'Married' : 'Single',
    nationality: 'Indian',
    aadhaar: `4521${String(8890 + index * 97).padStart(8, '0')}`,
    pan: `BVHPS${String(4521 + index * 7).padStart(4, '0')}F`,
    personalEmail: `${e.name.toLowerCase().replace(/\s+/g, '.')}.personal@gmail.com`,
    officialEmail: e.email,
    alternateNumber: `+91 90080 ${String(20000 + index)}`,
    emergencyContact: `+91 98220 ${String(20000 + index)}`,
    emergencyContactPerson: index % 2 ? 'Family Member' : 'Spouse',
    currentAddress: `${10 + index}, 4th Cross, Indiranagar`,
    permanentAddress: `Plot ${index + 1}, Gandhi Nagar`,
    city: e.branch === 'Remote' ? 'Bengaluru' : e.branch,
    state: e.branch === 'Chennai' ? 'Tamil Nadu' : e.branch === 'Mumbai' ? 'Maharashtra' : e.branch === 'Hyderabad' ? 'Telangana' : 'Karnataka',
    country: 'India',
    postalCode: '560038',
    reportingManager: e.manager && e.manager !== '—' ? e.manager : 'Kavya Menon',
    officeLocation: `Kini EdX Hub · ${e.branch}`,
    workMode: e.branch === 'Remote' ? 'Remote' : 'On-site',
    confirmationDate: joined < '2024-01-01' ? '2024-06-01' : '—',
    probationStatus: e.status === 'pending' ? 'Under Probation' : 'Completed',
    noticePeriod: '30 days',
    skills: SKILL_POOL.slice(hash % 4, (hash % 4) + 4),
    certifications: rating >= 4.5
      ? [{ name: 'Professional Certification', issuedBy: 'Kini EdX Hub', issueDate: '2024-08-01', expiryDate: '2027-08-01' }]
      : [],
    education: [
      { qualification: 'B.E. Computer Science', university: 'VTU, Belagavi', year: 2016 + (index % 5), grade: `${(7 + (index % 2) + 0.4).toFixed(1)} CGPA` },
    ],
    documents: EMPLOYEE_DOCUMENTS,
    payroll: {
      salaryGrade: grade,
      bankName: BANK_NAMES[index % BANK_NAMES.length],
      accountNumber: `5010${String(284511982 + index * 137).padStart(8, '0')}`,
      ifsc: 'HDFC0001234',
      pfNumber: `KN/BLR/123456/${String(112 + index)}`,
      esiNumber: `2900123${String(4567 + index)}`,
    },
    attendance: {
      presentDays: 160 + (index % 40), absentDays: 1 + (index % 4), halfDays: index % 4, lateEntries: 2 + (index % 8),
      workingHours: `${1200 + index * 40} hrs`, leavesTaken: 8 + (index % 8), attendancePercentage: attendance,
    },
    leave: { annualLeave: 20, casualLeave: 8, sickLeave: 6, remainingLeave: 12 + (index % 7) },
    performance: {
      overallRating: rating, quarterlyRating: Math.round((rating - 0.2) * 10) / 10, lastAppraisal: 'Q3 2026',
      achievements: ['Delivered quarterly goals on time', 'Positive feedback in team reviews'],
      goals: ['Complete skill development plan', 'Take on more leadership responsibilities'],
      managerRemarks: 'Consistent contributor with strong ownership and collaboration.',
    },
    assets: [
      { name: 'MacBook Pro 14"', category: 'Laptop', status: 'Assigned' },
      { name: 'Dell Monitor 27"', category: 'Monitor', status: 'Assigned' },
      { name: 'Corporate ID Card', category: 'Access', status: 'Issued' },
    ],
    courseCompletion: 0,
    assignmentsReviewed: 0,
    averageFeedback: 0,
    monthlyRating: 0,
    lastSession: '—',
    nextSession: '—',
    mentees: [],
    timeline: [
      { date: joined, title: 'Joined Organization', desc: `Onboarded as ${e.designation} · ${e.department}`, type: 'notice' },
      ...(e.shift && e.shift !== 'General'
        ? [{ date: joined, title: 'Shift Assigned', desc: `${e.shift} shift pattern`, type: 'checklist' }]
        : []),
      { date: '2025-06-01', title: 'Performance Review', desc: `Rated ${rating.toFixed(1)} — strong performer`, type: 'kt' },
      { date: '2026-07-28', title: 'Quarterly Review', desc: `Q3 review · ${rating.toFixed(1)} rating`, type: 'approval' },
    ],
  }
}

// Normalised unified roster row (both lean employees and rich mentors).
const normalizeWorkforceRow = (row, index) => ({
  ...row,
  role: row.role || deriveRole(row),
  employeeId: row.employeeId || row.id || `EMP-${String(index + 1).padStart(3, '0')}`,
  type: row.type || row.employmentType || 'Full-time',
  manager: row.manager || row.reportingManager || '—',
  joinDate: row.joinDate || row.joiningDate || '—',
  contact: row.contact || row.phone || '—',
  __searchText: [
    row.employeeId, row.id, row.name, row.email, row.phone, row.department, row.designation,
    row.role, row.reportingManager, row.manager, row.branch, row.type, row.employmentType,
    row.specialization, (row.assignedCourses || []).join(' '), (row.assignedBatches || []).join(' '),
  ].join(' ').toLowerCase(),
})

// One roster: employees first, mentors after. When a person exists in both
// records (e.g. Vikram Shah), the richer mentor profile wins and keeps the
// original position — no duplicates, every member appears exactly once.
export const HR_WORKFORCE = (() => {
  const roster = new Map()
  HR_EMPLOYEES.forEach((e, i) => {
    const row = normalizeWorkforceRow({ ...e, ...buildEmployeeProfile(e, i) }, i)
    roster.set(row.name.toLowerCase(), row)
  })
  HR_MENTOR_EMPLOYEES.forEach((m, i) => {
    const row = normalizeWorkforceRow({ ...m, role: 'Mentor' }, i)
    roster.set(row.name.toLowerCase(), row)
  })
  return [...roster.values()]
})()

