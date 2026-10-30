// Mock data for the Operations employee-specialization dashboard.
// Replace each export with a real API call when the backend is ready —
// the OperationsDashboard page only reads these values, never how they're produced.

export const OPERATIONS_STATS = {
  newAdmissions: 34,
  activeEnrollments: 512,
  pendingCertificates: 12,
  supportTickets: 9,
  todaysClasses: 18,
  batchUtilization: 78,
  pendingTasks: 6,
}

export const OPERATIONS_ADMISSIONS = [
  { id: 'ad1', name: 'Rahul Bhatt', course: 'Java Full Stack Development', date: '2026-07-29', status: 'pending' },
  { id: 'ad2', name: 'Sneha Joshi', course: 'Data Science', date: '2026-07-28', status: 'approved' },
  { id: 'ad3', name: 'Aman Gupta', course: 'UI/UX Design', date: '2026-07-27', status: 'pending' },
  { id: 'ad4', name: 'Ishita Malhotra', course: 'Cyber Security', date: '2026-07-26', status: 'approved' },
  { id: 'ad5', name: 'Farhan Khan', course: 'DevOps Engineering', date: '2026-07-24', status: 'pending' },
]

export const OPERATIONS_SUPPORT_QUEUE = [
  { id: 's1', student: 'Priyanka Das', issue: 'Unable to join live class', priority: 'high', status: 'open' },
  { id: 's2', student: 'Yash Agarwal', issue: 'Certificate not generated', priority: 'medium', status: 'open' },
  { id: 's3', student: 'Kavya Reddy', issue: 'Batch schedule conflict', priority: 'medium', status: 'in-progress' },
  { id: 's4', student: 'Nikhil Chawla', issue: 'Refund request', priority: 'high', status: 'open' },
]

export const OPERATIONS_BATCH_SCHEDULE = [
  { id: 'bs1', batch: 'PY-2026-04', course: 'Python Full Stack Development', time: '10:00 AM', room: 'Live Room 1' },
  { id: 'bs2', batch: 'DS-2026-02', course: 'Data Science', time: '12:00 PM', room: 'Live Room 2' },
  { id: 'bs3', batch: 'UX-2026-03', course: 'UI/UX Design', time: '2:00 PM', room: 'Live Room 1' },
  { id: 'bs4', batch: 'SEC-2026-01', course: 'Cyber Security', time: '4:00 PM', room: 'Live Room 3' },
]

export const OPERATIONS_CERTIFICATE_REQUESTS = [
  { id: 'c1', student: 'Tanya Bansal', course: 'MERN Stack Development', requestedOn: '2026-07-28', status: 'pending' },
  { id: 'c2', student: 'Vivaan Shetty', course: 'AWS Solutions Architect', requestedOn: '2026-07-27', status: 'pending' },
  { id: 'c3', student: 'Ritika Saxena', course: 'Digital Marketing', requestedOn: '2026-07-25', status: 'issued' },
]

export const OPERATIONS_RECENT_ACTIVITIES = [
  { id: 'r1', text: 'Batch DS-2026-02 rescheduled to 12:00 PM', time: '2 hours ago' },
  { id: 'r2', text: 'Certificate issued to Ritika Saxena', time: '4 hours ago' },
  { id: 'r3', text: 'New admission received from Rahul Bhatt', time: '6 hours ago' },
  { id: 'r4', text: 'Support ticket #s4 escalated', time: '1 day ago' },
]

export const OPERATIONS_NOTIFICATIONS = [
  { id: 'n1', title: '3 admissions pending approval', time: '1 hour ago' },
  { id: 'n2', title: '2 certificate requests awaiting review', time: '3 hours ago' },
  { id: 'n3', title: 'Batch utilization dropped below 80% threshold', time: '1 day ago' },
]
