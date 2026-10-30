export const API_ENDPOINTS = {
  hr: {
    dashboard: "/api/hr/dashboard",
    employees: "/api/hr/employees",
    departments: "/api/hr/departments",
    students: "/api/students",
    attendance: "/api/hr/attendance",
    leave: "/api/hr/leave",
    performance: "/api/hr/performance",
    announcements: "/api/hr/announcements",
    calendar: "/api/hr/calendar/events",
    resources: "/api/hr/resources",
  },
  getInTouch: {
    base: "/api/GetInTouch",
    byId: (id) => `/api/GetInTouch/${encodeURIComponent(id)}`,
  },
  register: {
    base: "/api/Register",
    byId: (id) => `/api/Register/${encodeURIComponent(id)}`,
  },
  student: {
    courses: "/api/v1/student/courses",
    courseSyllabus: "/api/v1/student/courses/syllabus",
  },
  enrollment: {
    paymentConfirmationEmail: "/api/v1/enrollments/payment-confirmation-email",
  },
  payments: {
    createOrder: "/api/v1/orders/create",
    verify: "/api/v1/payments/verify",
    validateCoupon: "/api/v1/coupons/validate",
    order: (orderId) => `/api/v1/orders/${encodeURIComponent(orderId)}`,
    history: "/api/v1/payments/history",
  },
  ai: {
    chat: "/api/AI/chat",
    generateAssessment: "/api/AI/assessment/generate",
  },
  // Swagger-confirmed (Chat controller, live /swagger/v1/swagger.json). GET
  // /conversations and the two POST bodies (CreateConversationDto:
  // {studentId, mentorId}, SendMessageDto: {message, attachmentId}) match the
  // live backend contract exactly; PUT read takes no body.
  //
  // Attachment routes below are also Swagger-confirmed for their REQUEST
  // shape only — the upload endpoint takes multipart/form-data with exactly
  // "file" (binary) + "message" (string, optional caption), and
  // view/download/delete take only the path id, no body. None of the four
  // declare a response schema in Swagger (the live doc has no
  // [ProducesResponseType] on these actions), so response field names are
  // handled defensively in chatService.js rather than assumed.
  chat: {
    conversations: "/api/v1/chat/conversations",
    messages: (conversationId) => `/api/v1/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
    read: (conversationId) => `/api/v1/chat/conversations/${encodeURIComponent(conversationId)}/read`,
    attachments: (conversationId) => `/api/v1/chat/conversations/${encodeURIComponent(conversationId)}/attachments`,
    attachmentView: (attachmentId) => `/api/v1/chat/attachments/${encodeURIComponent(attachmentId)}/view`,
    attachmentDownload: (attachmentId) => `/api/v1/chat/attachments/${encodeURIComponent(attachmentId)}/download`,
    attachmentById: (attachmentId) => `/api/v1/chat/attachments/${encodeURIComponent(attachmentId)}`,
  },
  assessmentQuestions: {
    base: "/api/AssessmentQuestion",
    byAssessment: (assessmentId) => `/api/AssessmentQuestion/assessment/${encodeURIComponent(assessmentId)}`,
    byId: (questionId) => `/api/AssessmentQuestion/${encodeURIComponent(questionId)}`,
  },
  attendance: {
    base: "/api/Attendance",
    liveClass: (liveClassId) => `/api/Attendance/liveclass/${encodeURIComponent(liveClassId)}`,
    studentLiveClass: (studentId, liveClassId) => `/api/Attendance/student/${encodeURIComponent(studentId)}/liveclass/${encodeURIComponent(liveClassId)}`,
    // Returns the CALLING user's own attendance for the live class — the
    // backend resolves the student/mentor from the auth token, unlike
    // studentLiveClass() above which requires an explicit studentId.
    myLiveClass: (liveClassId) => `/api/Attendance/my/liveclass/${encodeURIComponent(liveClassId)}`,
    generate: (liveClassId) => `/api/Attendance/liveclass/${encodeURIComponent(liveClassId)}/generate`,
    dashboard: (liveClassId) => `/api/Attendance/liveclass/${encodeURIComponent(liveClassId)}/dashboard`,
    report: (liveClassId) => `/api/Attendance/report/liveclass/${encodeURIComponent(liveClassId)}`,
    reportPdf: (liveClassId) => `/api/Attendance/report/pdf/${encodeURIComponent(liveClassId)}`,
    reportExcel: (liveClassId) => `/api/Attendance/report/excel/${encodeURIComponent(liveClassId)}`,
  },
  calendar: {
    month: "/api/Calendar/month",
    week: "/api/Calendar/week",
    day: "/api/Calendar/day",
    today: "/api/Calendar/today",
    upcoming: "/api/Calendar/upcoming",
    event: (eventId) => `/api/Calendar/event/${encodeURIComponent(eventId)}`,
  },
  competency: {
    base: "/api/Competency",
    byId: (id) => `/api/Competency/${encodeURIComponent(id)}`,
    dashboard: "/api/Competency/dashboard",
    byRole: (roleId) => `/api/Competency/role/${encodeURIComponent(roleId)}`,
  },
  studentBatch: {
    base: "/api/StudentBatch",
    students: (batchId) => `/api/StudentBatch/${encodeURIComponent(batchId)}/students`,
    availableStudents: (batchId) => `/api/StudentBatch/${encodeURIComponent(batchId)}/available-students`,
    // Every course/batch enrollment of one student: { studentId, courses: [...] }.
    studentEnrollments: (studentId) => `/api/StudentBatch/student/${encodeURIComponent(studentId)}/enrollments`,
  },
  auth: {
    register: "/api/Auth/register",
    login: "/api/Auth/login",
    sendOtp: "/api/Auth/send-otp",
    verifyOtp: "/api/Auth/verify-otp",
    forgotPassword: "/api/Auth/forgot-password",
    resetPassword: "/api/Auth/reset-password",
    changePassword: (userId) => `/api/Auth/change-password/${encodeURIComponent(userId)}`,
    logout: "/api/Auth/logout",
    users: "/api/Auth/users",
    profile: (userId) => `/api/Auth/profile/${encodeURIComponent(userId)}`,
    deleteUser: (userId) => `/api/Auth/delete-user/${encodeURIComponent(userId)}`,
    studentGoogleLogin: "/api/v1/students/google-login",
    employeeGoogleLogin: "/api/v1/employees/google-login",
  },
  superAdmin: {
    login: "/api/v1/SuperAdmin/login",
    organizationSummary: "/api/superadmin/dashboard/organizations/summary",
    organizations: "/api/superadmin/dashboard/organizations",
    organizationById: (organizationId) => `/api/superadmin/dashboard/organizations/${encodeURIComponent(organizationId)}`,
    organizationSubscription: (organizationId) => `/api/superadmin/organizations/${encodeURIComponent(organizationId)}/subscription`,
    organizationEmployees: (organizationId) => `/api/v1/superadmin/organizations/${encodeURIComponent(organizationId)}/employees`,
    organizationEmployee: (organizationId, employeeId) => `/api/v1/superadmin/organizations/${encodeURIComponent(organizationId)}/employees/${encodeURIComponent(employeeId)}`,
  },
  organization: {
    base: "/api/v1/organization",
    login: "/api/v1/organization/login",
    googleLogin: "/api/v1/organization/google-login",
    byId: (id) => `/api/v1/organization/${encodeURIComponent(id)}`,
    employeeRoles: "/api/v1/organization/employees/roles",
    employees: "/api/v1/organization/employees",
    employee: (employeeId) => `/api/v1/organization/employees/${encodeURIComponent(employeeId)}`,
    students: "/api/v1/organization/students",
    student: (studentId) => `/api/v1/organization/students/${encodeURIComponent(studentId)}`,
    tutors: "/api/v1/organization/tutors",
    tutor: (tutorId) => `/api/v1/organization/tutors/${encodeURIComponent(tutorId)}`,
    mentors: "/api/v1/organization/mentors",
    mentor: (mentorId) => `/api/v1/organization/mentors/${encodeURIComponent(mentorId)}`,
    batches: "/api/v1/organization/batches",
    batch: (batchId) => `/api/v1/organization/batches/${encodeURIComponent(batchId)}`,
    mentorBatches: (mentorId) => `/api/v1/organization/employees/${encodeURIComponent(mentorId)}/batches`,
    batchSummary: "/api/v1/organization/batches/summary",
    batchExport: "/api/v1/organization/batches/export",
    branches: "/api/v1/organization/branches",
    branch: (branchId) => `/api/v1/organization/branches/${encodeURIComponent(branchId)}`,
    studentPaymentStatus: (studentId) => `/api/v1/organization/students/${encodeURIComponent(studentId)}/payment-status`,
    approveStudentEnrollment: (studentId) => `/api/v1/organization/students/${encodeURIComponent(studentId)}/approve-enrollment`,
    approveStudent: (studentId) => `/api/v1/organization/students/${encodeURIComponent(studentId)}/approve`,
    rejectStudent: (studentId) => `/api/v1/organization/students/${encodeURIComponent(studentId)}/reject`,
    assignStudentBatch: (studentId) => `/api/v1/organization/students/${encodeURIComponent(studentId)}/assign-batch`,
    studentCredentials: (studentId) => `/api/v1/organization/students/${encodeURIComponent(studentId)}/credentials`,
    sendStudentCredentials: (studentId) => `/api/v1/organization/students/${encodeURIComponent(studentId)}/send-credentials`,
    tutorAssignments: "/api/v1/organization/tutor-assignments",
    tutorAvailability: (tutorId) => `/api/v1/organization/tutors/${encodeURIComponent(tutorId)}/availability`,
    courseModules: (courseId) => `/api/v1/organization/courses/${encodeURIComponent(courseId)}/modules`,
    courseSyllabus: (courseId) => `/api/v1/organization/courses/${encodeURIComponent(courseId)}/syllabus`,
    courseSyllabusImportPdf: (courseId) => `/api/v1/organization/courses/${encodeURIComponent(courseId)}/syllabus/import-pdf`,
    moduleSubjects: (courseId, moduleId) => `/api/v1/organization/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/subjects`,
    courseCategories: "/api/v1/organization/course-categories",
    courseSessions: (courseId, moduleId, subjectId) => `/api/v1/organization/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/subjects/${encodeURIComponent(subjectId)}/sessions`,
    courseClasses: "/api/v1/organization/classes",
  },
  courses: {
    base: "/api/v1/courses",
    byId: (courseId) => `/api/v1/courses/${encodeURIComponent(courseId)}`,
    pdf: (courseId) => `/api/v1/courses/${encodeURIComponent(courseId)}/pdf`,
    uploadPdf: (courseId) => `/api/v1/courses/${encodeURIComponent(courseId)}/upload-pdf`,
  },
  assessments: {
    base: "/api/Assessment",
    byId: (assessmentId) => `/api/Assessment/${encodeURIComponent(assessmentId)}`,
    publish: (assessmentId) => `/api/Assessment/${encodeURIComponent(assessmentId)}/publish`,
    // Swagger: multipart/form-data with the PDF in "file"; returns the
    // extracted questions only — nothing is created or published.
    mentorImportPdf: "/api/v1/mentor/assessments/import-pdf",
  },
  liveClasses: {
    base: "/api/v1/live-classes",
    byId: (id) => `/api/v1/live-classes/${encodeURIComponent(id)}`,
    dashboard: "/api/v1/live-classes/dashboard",
    upcoming: "/api/v1/live-classes/upcoming",
    completed: "/api/v1/live-classes/completed",
    live: "/api/v1/live-classes/live",
    today: "/api/v1/live-classes/today",
    start: (id) => `/api/v1/live-classes/${encodeURIComponent(id)}/start`,
    end: (id) => `/api/v1/live-classes/${encodeURIComponent(id)}/end`,
    cancel: (id) => `/api/v1/live-classes/${encodeURIComponent(id)}/cancel`,
    join: (id) => `/api/v1/live-classes/${encodeURIComponent(id)}/join`,
    uploadPdf: "/api/v1/live-classes/upload-pdf",
    pdf: (id) => `/api/v1/live-classes/${encodeURIComponent(id)}/pdf`,
    recording: (id) => `/api/v1/live-classes/${encodeURIComponent(id)}/recording`,
  },
  // Swagger-confirmed (JitsiAttendance controller): a distinct participant
  // event log for the embedded Jitsi conference itself — separate from
  // liveClasses.join above, which records class-level join eligibility.
  jitsiAttendance: {
    join: "/api/jitsi-attendance/join",
    leave: "/api/jitsi-attendance/leave",
  },
  liveClassDropdowns: {
    courses: "/api/v1/courses/dropdown",
    batches: "/api/v1/batches/dropdown",
    mentors: "/api/v1/mentors/dropdown",
    meetingPlatforms: "/api/v1/meeting-platforms/dropdown",
    statuses: "/api/v1/status/dropdown",
  },
  // Swagger-confirmed: only these 6 Permission routes exist on the backend.
  // (No /api/Permission/users/... routes — removed after confirming via the
  // live Swagger doc that they 404 and had no callers.)
  permission: {
    modules: "/api/Permission/modules",
    byRole: (role) => `/api/Permission/roles/${encodeURIComponent(role)}`,
    updateRole: (role) => `/api/Permission/roles/${encodeURIComponent(role)}`,
    byEmployee: (employeeId) => `/api/Permission/employees/${encodeURIComponent(employeeId)}`,
    updateEmployee: (employeeId) => `/api/Permission/employees/${encodeURIComponent(employeeId)}`,
    employeeModule: (employeeId, permissionId) => `/api/Permission/employees/${encodeURIComponent(employeeId)}/modules/${encodeURIComponent(permissionId)}`,
  },
  recycleBin: {
    list: (entity) => `/api/RecycleBin/${encodeURIComponent(entity)}`,
    restore: (entity, id) => `/api/RecycleBin/${encodeURIComponent(entity)}/${encodeURIComponent(id)}/restore`,
    permanent: (entity, id) => `/api/RecycleBin/${encodeURIComponent(entity)}/${encodeURIComponent(id)}/permanent`,
  },
  studentAssessment: {
    available: "/api/StudentAssessment/available",
    start: "/api/StudentAssessment/start",
    submit: "/api/StudentAssessment/submit",
    byId: (id) => `/api/StudentAssessment/${encodeURIComponent(id)}`,
    result: (id) => `/api/StudentAssessment/result/${encodeURIComponent(id)}`,
  },
  zoom: { webhook: "/api/zoom/webhook" },
  invoices: {
    base: "/api/v1/invoices",
    byId: (invoiceId) => `/api/v1/invoices/${encodeURIComponent(invoiceId)}`,
    cancel: (invoiceId) => `/api/v1/invoices/${encodeURIComponent(invoiceId)}/cancel`,
    pdf: (invoiceId) => `/api/v1/invoices/${encodeURIComponent(invoiceId)}/pdf`,
    sendEmail: (invoiceId) => `/api/v1/invoices/${encodeURIComponent(invoiceId)}/send-email`,
  },
  notifications: {
    // Swagger-confirmed: there is no employee-scoped notification endpoint on
    // the backend today (only student, mentor and organization). Do not add
    // one here without a matching backend route.
    student: (studentId) => `/api/v1/notifications/student/${encodeURIComponent(studentId)}`,
    mentor: (mentorId) => `/api/v1/notifications/mentor/${encodeURIComponent(mentorId)}`,
    organization: (organizationId) => `/api/v1/notifications/organization/${encodeURIComponent(organizationId)}`,
    studentUnreadCount: (studentId) => `/api/v1/notifications/student/${encodeURIComponent(studentId)}/unread-count`,
    mentorUnreadCount: (mentorId) => `/api/v1/notifications/mentor/${encodeURIComponent(mentorId)}/unread-count`,
    organizationUnreadCount: (organizationId) => `/api/v1/notifications/organization/${encodeURIComponent(organizationId)}/unread-count`,
    markRead: (notificationId) => `/api/v1/notifications/${encodeURIComponent(notificationId)}/read`,
    markAllStudentRead: (studentId) => `/api/v1/notifications/student/${encodeURIComponent(studentId)}/read-all`,
    markAllMentorRead: (mentorId) => `/api/v1/notifications/mentor/${encodeURIComponent(mentorId)}/read-all`,
    markAllOrganizationRead: (organizationId) => `/api/v1/notifications/organization/${encodeURIComponent(organizationId)}/read-all`,
    remove: (notificationId) => `/api/v1/notifications/${encodeURIComponent(notificationId)}`,
  },
  leaveRequests: {
    base: "/api/v1/leave-requests",
    mine: "/api/v1/leave-requests/my",
    approve: (id) => `/api/v1/leave-requests/${encodeURIComponent(id)}/approve`,
    reject: (id) => `/api/v1/leave-requests/${encodeURIComponent(id)}/reject`,
  },
  mentorDashboard: {
    courses: "/api/mentor/dashboard/courses",
    courseSyllabus: (courseId) => `/api/mentor/dashboard/courses/${encodeURIComponent(courseId)}/syllabus`,
    batches: "/api/mentor/dashboard/batches",
    students: "/api/mentor/dashboard/students",
    classes: "/api/mentor/dashboard/classes",
    byMentorId: (mentorId) => `/api/mentor/dashboard/${encodeURIComponent(mentorId)}`,
    today: (mentorId) => `/api/mentor/dashboard/${encodeURIComponent(mentorId)}/today`,
    upcoming: (mentorId) => `/api/mentor/dashboard/${encodeURIComponent(mentorId)}/upcoming`,
    attendance: (mentorId) => `/api/mentor/dashboard/${encodeURIComponent(mentorId)}/attendance`,
  },
  syllabusAssignments: {
    base: '/api/hr/syllabus-assignments',
    byId: (id) => `/api/hr/syllabus-assignments/${encodeURIComponent(id)}`,
    status: (id) => `/api/hr/syllabus-assignments/${encodeURIComponent(id)}/status`,
    employee: '/api/employee/syllabus',
    employeeById: (id) => `/api/employee/syllabus/${encodeURIComponent(id)}`,
    mentor: '/api/mentor/syllabus',
    mentorById: (id) => `/api/mentor/syllabus/${encodeURIComponent(id)}`,
    completeModule: (assignmentId, moduleId) => `/api/employee/syllabus/${encodeURIComponent(assignmentId)}/modules/${encodeURIComponent(moduleId)}/complete`,
    mentorCompleteModule: (assignmentId, moduleId) => `/api/mentor/syllabus/${encodeURIComponent(assignmentId)}/modules/${encodeURIComponent(moduleId)}/complete`,
  },
  employeeAttendance: {
    base: "/api/EmployeeAttendance",
    checkIn: "/api/EmployeeAttendance/check-in",
    checkOut: "/api/EmployeeAttendance/check-out",
    report: "/api/EmployeeAttendance/report",
    // Self-scoped variants — resolve the employee from the auth token, same
    // as check-in/check-out already do, instead of taking an explicit
    // employeeId query param. Use these for "my own attendance" screens;
    // keep base/report (which accept an explicit employeeId) for admin/HR
    // screens that look up another employee's attendance.
    my: "/api/EmployeeAttendance/my",
    myReport: "/api/EmployeeAttendance/my/report",
    correctionRequest: "/api/EmployeeAttendance/correction-request",
  },
  employeeProfile: {
    base: "/api/v1/employee-profile",
    personal: "/api/v1/employee-profile/personal",
    bank: "/api/v1/employee-profile/bank",
    education: "/api/v1/employee-profile/education",
    experience: "/api/v1/employee-profile/experience",
    departments: "/api/v1/employee-profile/departments",
    documentTypes: "/api/v1/employee-profile/document-types",
    documents: "/api/v1/employee-profile/documents",
    documentDownload: (documentId) => `/api/v1/employee-profile/documents/${encodeURIComponent(documentId)}/download`,
    documentById: (documentId) => `/api/v1/employee-profile/documents/${encodeURIComponent(documentId)}`,
    pdf: "/api/v1/employee-profile/pdf",
  },
  mentorBatches: (employeeOrMentorId) =>
    `/api/v1/organization/employees/${encodeURIComponent(employeeOrMentorId)}/batches`,
};
