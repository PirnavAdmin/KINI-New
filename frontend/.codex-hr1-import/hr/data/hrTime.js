// KINI HRMS — mock data: attendance, leave, shifts, holidays.

export const HR_ATTENDANCE_TODAY = { present: 138, absent: 6, late: 5, onLeave: 8, wfh: 14, total: 153, updatedAt: '10:24 AM' }

export const HR_ATTENDANCE_LOG = [
  { id: 'AT-01', employee: 'Ananya Rao', dept: 'Engineering', checkIn: '09:02', checkOut: '18:14', status: 'present', hours: '9.2', shift: 'General', wfh: false },
  { id: 'AT-02', employee: 'Vikram Shah', dept: 'Academics', checkIn: '08:45', checkOut: '17:30', status: 'present', hours: '8.8', shift: 'Morning', wfh: false },
  { id: 'AT-03', employee: 'Karan Mehta', dept: 'Engineering', checkIn: '10:12', checkOut: '19:05', status: 'late', hours: '8.9', shift: 'Night', wfh: false },
  { id: 'AT-04', employee: 'Priya Nair', dept: 'HR', checkIn: '09:20', checkOut: '18:02', status: 'present', hours: '8.7', shift: 'General', wfh: false },
  { id: 'AT-05', employee: 'Sara Thomas', dept: 'Marketing', checkIn: '—', checkOut: '—', status: 'absent', hours: '0', shift: 'General', wfh: false },
  { id: 'AT-06', employee: 'Arjun Kapoor', dept: 'Engineering', checkIn: '09:01', checkOut: '18:00', status: 'present', hours: '9.0', shift: 'General', wfh: false },
  { id: 'AT-07', employee: 'Rohit Sen', dept: 'Sales', checkIn: '—', checkOut: '—', status: 'on-leave', hours: '0', shift: 'General', wfh: false },
  { id: 'AT-08', employee: 'Neha Verma', dept: 'Design', checkIn: '09:15', checkOut: '17:45', status: 'wfh', hours: '8.5', shift: 'General', wfh: true },
  { id: 'AT-09', employee: 'Aditya Kulkarni', dept: 'Design', checkIn: '10:30', checkOut: '18:45', status: 'late', hours: '8.3', shift: 'Flexible', wfh: false },
  { id: 'AT-10', employee: 'Nikhil Verma', dept: 'Product', checkIn: '09:05', checkOut: '18:20', status: 'present', hours: '9.3', shift: 'General', wfh: false },
  { id: 'AT-11', employee: 'Fatima Sheikh', dept: 'HR', checkIn: '09:40', checkOut: '18:10', status: 'late', hours: '8.5', shift: 'General', wfh: false },
  { id: 'AT-12', employee: 'Divya Menon', dept: 'HR', checkIn: '08:58', checkOut: '18:05', status: 'present', hours: '9.1', shift: 'General', wfh: false },
]

export const HR_ATTENDANCE_HEATMAP = {
  month: 'August 2026',
  // weeks × days: 0 = weekend/off, 1 = present, 2 = late, 3 = wfh, 4 = leave, 5 = absent
  weeks: [
    [0, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 2, 1, 3, 0],
    [0, 1, 4, 1, 1, 1, 0],
    [0, 2, 1, 1, 3, 1, 0],
    [0, 1, 1, 5, 1, 1, 0],
    [0, 1, 2, 1, 1, 4, 0],
  ],
  legend: [
    { key: 1, label: 'Present', color: '#10b981' },
    { key: 2, label: 'Late', color: '#F59E0B' },
    { key: 3, label: 'WFH', color: '#0f55f7' },
    { key: 4, label: 'Leave', color: '#8b5cf6' },
    { key: 5, label: 'Absent', color: '#EF4444' },
  ],
}

export const HR_ATTENDANCE_MONTHLY = [
  { label: 'Present', count: 124 },
  { label: 'Late', count: 9 },
  { label: 'WFH', count: 14 },
  { label: 'On Leave', count: 8 },
  { label: 'Absent', count: 4 },
]

export const HR_ATTENDANCE_TREND = [
  { day: 'Mon', present: 140, late: 3 },
  { day: 'Tue', present: 137, late: 5 },
  { day: 'Wed', present: 141, late: 4 },
  { day: 'Thu', present: 135, late: 7 },
  { day: 'Fri', present: 138, late: 5 },
  { day: 'Sat', present: 22, late: 1 },
]

export const HR_ATTENDANCE_CORRECTIONS = [
  { id: 'CR-01', employee: 'Karan Mehta', date: '2026-08-01', request: 'Missed check-out', current: '—', requested: '19:05', status: 'pending' },
  { id: 'CR-02', employee: 'Sara Thomas', date: '2026-07-30', request: 'Network outage — mark present', current: 'Absent', requested: 'Present', status: 'pending' },
  { id: 'CR-03', employee: 'Neha Verma', date: '2026-07-29', request: 'Wrong shift tag', current: 'Night', requested: 'General', status: 'approved' },
  { id: 'CR-04', employee: 'Aditya Kulkarni', date: '2026-07-28', request: 'Late due to travel', current: 'Late', requested: 'Present', status: 'rejected' },
]

export const HR_LEAVE_TYPES = [
  { id: 'LT-1', name: 'Casual Leave', code: 'CL', days: 12, used: 5, remaining: 7, color: '#0f55f7' },
  { id: 'LT-2', name: 'Sick Leave', code: 'SL', days: 10, used: 2, remaining: 8, color: '#EF4444' },
  { id: 'LT-3', name: 'Privilege Leave', code: 'PL', days: 15, used: 9, remaining: 6, color: '#10b981' },
  { id: 'LT-4', name: 'Work From Home', code: 'WFH', days: 8, used: 4, remaining: 4, color: '#8b5cf6' },
  { id: 'LT-5', name: 'Paternity Leave', code: 'PAT', days: 5, used: 0, remaining: 5, color: '#F59E0B' },
  { id: 'LT-6', name: 'Maternity Leave', code: 'MAT', days: 26, used: 0, remaining: 26, color: '#EC4899' },
]

export const HR_LEAVE_REQUESTS = [
  { id: 'LV-101', employee: 'Arjun Kapoor', type: 'Sick Leave', dates: 'Aug 1 – Aug 2', days: 2, reason: 'Viral fever', status: 'pending', applied: '2026-07-31' },
  { id: 'LV-102', employee: 'Meera Iyer', type: 'Privilege Leave', dates: 'Aug 4 – Aug 8', days: 5, reason: 'Family vacation', status: 'pending', applied: '2026-07-28' },
  { id: 'LV-103', employee: 'Rohit Sen', type: 'Work From Home', dates: 'Jul 30', days: 1, reason: 'Plumber visit', status: 'approved', applied: '2026-07-29' },
  { id: 'LV-104', employee: 'Divya Menon', type: 'Casual Leave', dates: 'Aug 12', days: 1, reason: 'Personal errand', status: 'pending', applied: '2026-08-01' },
  { id: 'LV-105', employee: 'Sara Thomas', type: 'Sick Leave', dates: 'Aug 6 – Aug 7', days: 2, reason: 'Migraine', status: 'approved', applied: '2026-08-02' },
  { id: 'LV-106', employee: 'Nikhil Verma', type: 'Privilege Leave', dates: 'Aug 20 – Aug 22', days: 3, reason: 'Wedding', status: 'rejected', applied: '2026-07-25' },
  { id: 'LV-107', employee: 'Neha Verma', type: 'Work From Home', dates: 'Aug 10 – Aug 14', days: 5, reason: 'Remote sprint week', status: 'pending', applied: '2026-08-01' },
]

export const HR_LEAVE_CALENDAR_EVENTS = [
  { date: 4, employee: 'Meera Iyer', type: 'PL' },
  { date: 5, employee: 'Meera Iyer', type: 'PL' },
  { date: 6, employee: 'Meera Iyer', type: 'PL' },
  { date: 7, employee: 'Meera Iyer', type: 'PL' },
  { date: 8, employee: 'Meera Iyer', type: 'PL' },
  { date: 1, employee: 'Arjun Kapoor', type: 'SL' },
  { date: 2, employee: 'Arjun Kapoor', type: 'SL' },
  { date: 6, employee: 'Sara Thomas', type: 'SL' },
  { date: 7, employee: 'Sara Thomas', type: 'SL' },
  { date: 10, employee: 'Neha Verma', type: 'WFH' },
  { date: 12, employee: 'Divya Menon', type: 'CL' },
  { date: 15, employee: 'Rohit Sen', type: 'CL' },
]

export const HR_LEAVE_STATS = {
  totalRequests: 34, pending: 4, approvedThisMonth: 26, avgDuration: 2.4, wfhShare: 18,
}

export const HR_LEAVE_DEPT_LOAD = [
  { dept: 'Engineering', load: 42 },
  { dept: 'Academics', load: 31 },
  { dept: 'Sales', load: 24 },
  { dept: 'Marketing', load: 19 },
  { dept: 'HR', load: 14 },
  { dept: 'Design', load: 11 },
]

export const HR_LEAVE_TREND = [
  { month: 'Mar', used: 22 },
  { month: 'Apr', used: 18 },
  { month: 'May', used: 26 },
  { month: 'Jun', used: 15 },
  { month: 'Jul', used: 21 },
  { month: 'Aug', used: 12 },
]

export const HR_SHIFTS = [
  { id: 'SH-01', name: 'General', code: 'GEN', start: '09:00', end: '18:00', grace: 15, coverage: 82, employees: 84, color: '#0f55f7' },
  { id: 'SH-02', name: 'Morning', code: 'MOR', start: '08:00', end: '17:00', grace: 10, coverage: 74, employees: 41, color: '#10b981' },
  { id: 'SH-03', name: 'Night', code: 'NGT', start: '18:00', end: '02:30', grace: 20, coverage: 68, employees: 17, color: '#8b5cf6' },
  { id: 'SH-04', name: 'Flexible', code: 'FLX', start: '—', end: '—', grace: 60, coverage: 91, employees: 11, color: '#F59E0B' },
]

export const HR_SHIFT_ASSIGNMENTS = [
  { id: 'SA-01', employee: 'Ananya Rao', shift: 'General', from: '2026-07-01', to: '2026-09-30', assignedBy: 'Divya Menon' },
  { id: 'SA-02', employee: 'Vikram Shah', shift: 'Morning', from: '2026-07-01', to: '2026-09-30', assignedBy: 'Kavya Menon' },
  { id: 'SA-03', employee: 'Karan Mehta', shift: 'Night', from: '2026-08-01', to: '2026-10-31', assignedBy: 'Divya Menon' },
  { id: 'SA-04', employee: 'Priya Nair', shift: 'General', from: '2026-06-01', to: '2026-08-31', assignedBy: 'Divya Menon' },
  { id: 'SA-05', employee: 'Aditya Kulkarni', shift: 'Flexible', from: '2026-07-21', to: '2026-12-31', assignedBy: 'Kiran Shetty' },
  { id: 'SA-06', employee: 'Neha Verma', shift: 'General', from: '2026-05-01', to: '2026-08-31', assignedBy: 'Kiran Shetty' },
]

export const HR_SHIFT_ROTATION = [
  { id: 'RO-01', team: 'Support Desk', pattern: '2 Weeks General → 1 Week Night', nextRotation: 'Aug 17, 2026', members: 9 },
  { id: 'RO-02', team: 'DevOps', pattern: 'Monthly General/Night', nextRotation: 'Sep 1, 2026', members: 6 },
  { id: 'RO-03', team: 'Academics', pattern: 'Morning fixed', nextRotation: '—', members: 31 },
]

export const HR_SHIFT_COVERAGE = [
  { time: '06:00', coverage: 12 },
  { time: '08:00', coverage: 58 },
  { time: '10:00', coverage: 91 },
  { time: '12:00', coverage: 96 },
  { time: '14:00', coverage: 94 },
  { time: '16:00', coverage: 88 },
  { time: '18:00', coverage: 62 },
  { time: '20:00', coverage: 31 },
  { time: '22:00', coverage: 18 },
]

export const HR_HOLIDAYS = [
  { id: 'H-01', name: 'Independence Day', date: '2026-08-15', day: 'Saturday', type: 'National', region: 'All Branches', recurring: true },
  { id: 'H-02', name: 'Onam', date: '2026-08-28', day: 'Friday', type: 'Regional', region: 'Kerala', recurring: true },
  { id: 'H-03', name: 'Ganesh Chaturthi', date: '2026-09-14', day: 'Monday', type: 'Festival', region: 'Maharashtra', recurring: true },
  { id: 'H-04', name: 'Gandhi Jayanti', date: '2026-10-02', day: 'Friday', type: 'National', region: 'All Branches', recurring: true },
  { id: 'H-05', name: 'Diwali', date: '2026-11-08', day: 'Sunday', type: 'Festival', region: 'All Branches', recurring: true },
  { id: 'H-06', name: 'Christmas', date: '2026-12-25', day: 'Friday', type: 'National', region: 'All Branches', recurring: true },
  { id: 'H-07', name: 'Republic Day', date: '2027-01-26', day: 'Tuesday', type: 'National', region: 'All Branches', recurring: true },
]

export const HR_HOLIDAY_CATEGORIES = [
  { id: 'HC-1', name: 'National', count: 5, color: '#0f55f7' },
  { id: 'HC-2', name: 'Regional', count: 3, color: '#06b6a8' },
  { id: 'HC-3', name: 'Festival', count: 4, color: '#F59E0B' },
  { id: 'HC-4', name: 'Company Special', count: 2, color: '#EC4899' },
]
