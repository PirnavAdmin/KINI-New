export const HR_API_MODULES = {
  employees: { title: 'Employees', singular: 'Employee', columns: ['fullName', 'email', 'role', 'employmentType', 'status'], extras: { 'Department distribution': 'department-distribution', 'Employment types': 'type-distribution', 'Attendance overview': 'attendance-overview' }, options: { departments: '/api/hr/departments', roles: '/api/hr/roles' } },
  students: { title: 'Students', singular: 'Student', columns: ['fullName', 'email', 'courseName', 'batchName', 'status'] },
  attendance: { title: 'Attendance', singular: 'Attendance', columns: ['employeeName', 'date', 'checkIn', 'checkOut', 'status'], extras: { Overview: 'overview', Distribution: 'distribution' }, options: { filters: '/api/hr/attendance/filters' } },
  leave: { title: 'Leave Management', singular: 'Leave', columns: ['employeeName', 'leaveType', 'fromDate', 'toDate', 'reason', 'status'], options: { types: '/api/hr/leave/types' } },
  performance: { title: 'Performance', singular: 'Review', columns: ['employeeName', 'role', 'period', 'performanceScore', 'targetCompletion'], extras: { Trend: 'trend', 'By role': 'by-role' }, options: { filters: '/api/hr/performance/filters' } },
  announcements: { title: 'Announcements', singular: 'Announcement', columns: ['title', 'audience', 'status', 'publishDate', 'expiryDate', 'createdBy'], options: { options: '/api/hr/announcements/options' } },
  resources: { title: 'Resources', singular: 'Resource', columns: ['name', 'category', 'fileType', 'sizeKb', 'uploadedBy', 'uploadedDate'], options: { categories: '/api/hr/resources/categories', fileTypes: '/api/hr/resources/file-types', uploaders: '/api/hr/resources/uploaders' } },
  calendar: { title: 'Calendar', singular: 'Event', columns: ['title', 'eventType', 'startDateTime', 'endDateTime', 'location'], extras: { 'Upcoming events': 'upcoming', Holidays: '/api/hr/calendar/holidays', 'Employee leaves': '/api/hr/calendar/leaves', Classes: '/api/hr/calendar/classes' } },
  departments: { title: 'Departments', singular: 'Department', columns: ['departmentName', 'description'] },
}
