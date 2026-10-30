import { ROUTES } from '@shared/constants/routeConstants'

const E = ROUTES.EMPLOYEE
// Shared by the sidebar and dashboard so every overview opens its own workspace.
export const HR_DASHBOARD_NAVIGATION = [
  { title: 'WORKSPACE', items: [
    { label: 'Dashboard', icon: 'LayoutDashboard', path: E.HR_DASHBOARD, moduleId: 'dashboard' },
    { label: 'Employees', icon: 'Users', path: E.HR_EMPLOYEES, moduleId: 'employees', description: 'Employee records and workforce details' },
    { label: 'Batches', icon: 'Users', path: E.BATCHES, permissionKey: 'batches', description: 'Batch assignments and learners' },
    { label: 'Class Schedule', icon: 'CalendarDays', path: E.TODAY_SCHEDULE, permissionKey: 'schedule', description: 'Upcoming classes and session times' },
    { label: 'Syllabus', icon: 'BookOpen', path: E.SYLLABUS, permissionKey: 'resources', description: 'Course and batch syllabus management' },
  ] },
  { title: 'MANAGEMENT', items: [
    { label: 'Students', icon: 'Users', path: '/employee/students', moduleId: 'students', description: 'Student records and enrollment details' },
    { label: 'Attendance', icon: 'CalendarCheck', path: E.HR_ATTENDANCE, moduleId: 'attendance', description: 'Daily attendance and employee records' },
    { label: 'Leave Management', icon: 'ClipboardCheck', path: E.HR_LEAVE, moduleId: 'leave', description: 'Leave requests, balances and approvals' },
    { label: 'Performance', icon: 'TrendingUp', path: E.HR_PERFORMANCE, moduleId: 'performance', description: 'Employee reviews and performance' },
  ] },
  { title: 'ENGAGE', items: [
    { label: 'Resources', icon: 'FolderOpen', path: E.RESOURCES, permissionKey: 'resources', description: 'Shared documents and learning materials' },
    { label: 'Announcements', icon: 'MessageCircleMore', path: E.ANNOUNCEMENTS, permissionKey: 'announcements', description: 'Organization news and team updates' },
    { label: 'Calendar', icon: 'CalendarDays', path: E.CALENDAR, permissionKey: 'calendar', description: 'Events, meetings and important dates' },
  ] },
]
