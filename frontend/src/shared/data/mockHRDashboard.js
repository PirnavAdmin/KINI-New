// Mock data for the HR employee-specialization dashboard.
// Replace each export with a real API call when the backend is ready —
// the HRDashboard page only reads these values, never how they're produced.

export const HR_STATS = {
  todayAttendance: 92,
  newEmployees: 6,
  pendingLeaveRequests: 4,
  openPositions: 8,
  upcomingInterviews: 5,
  employeeSatisfaction: 4.6,
}

export const HR_RECENT_EMPLOYEES = [
  { id: 'e1', name: 'Ananya Rao', role: 'Frontend Engineer', department: 'Engineering', joinDate: '2026-07-21', status: 'active' },
  { id: 'e2', name: 'Vikram Shah', role: 'Mentor', department: 'Academics', joinDate: '2026-07-18', status: 'active' },
  { id: 'e3', name: 'Priya Nair', role: 'Recruiter', department: 'HR', joinDate: '2026-07-15', status: 'pending' },
  { id: 'e4', name: 'Karan Mehta', role: 'DevOps Engineer', department: 'Engineering', joinDate: '2026-07-10', status: 'active' },
  { id: 'e5', name: 'Sara Thomas', role: 'Content Writer', department: 'Marketing', joinDate: '2026-07-05', status: 'active' },
]

export const HR_LEAVE_REQUESTS = [
  { id: 'l1', employee: 'Arjun Kapoor', type: 'Sick Leave', dates: 'Aug 1 – Aug 2', status: 'pending' },
  { id: 'l2', employee: 'Meera Iyer', type: 'Vacation', dates: 'Aug 4 – Aug 8', status: 'pending' },
  { id: 'l3', employee: 'Rohit Sen', type: 'Work From Home', dates: 'Jul 30', status: 'approved' },
  { id: 'l4', employee: 'Divya Menon', type: 'Sick Leave', dates: 'Jul 29', status: 'pending' },
]

export const HR_ATTENDANCE_TODAY = { present: 138, absent: 6, late: 5, onLeave: 4, total: 153 }

export const HR_RECRUITMENT_PIPELINE = [
  { stage: 'Applied', count: 42 },
  { stage: 'Screening', count: 18 },
  { stage: 'Interview', count: 9 },
  { stage: 'Offer', count: 3 },
  { stage: 'Hired', count: 6 },
]

export const HR_ANNOUNCEMENTS = [
  { id: 'a1', title: 'Q3 performance review cycle opens Aug 5', date: '2026-07-29' },
  { id: 'a2', title: 'New wellness benefit enrollment now open', date: '2026-07-26' },
  { id: 'a3', title: 'Office closed Aug 15 for public holiday', date: '2026-07-22' },
]

export const HR_UPCOMING_BIRTHDAYS = [
  { id: 'b1', name: 'Neha Verma', date: 'Aug 2', department: 'Design' },
  { id: 'b2', name: 'Aditya Kulkarni', date: 'Aug 6', department: 'Engineering' },
  { id: 'b3', name: 'Fatima Sheikh', date: 'Aug 9', department: 'HR' },
]
