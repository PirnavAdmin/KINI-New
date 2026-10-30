import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import ScrollToTop from "@shared/components/ScrollToTop";

// ── Layout ──────────────────────────────────────────────────
import DashboardLayout from "@shared/layouts/DashboardLayout";

// ── Public landing pages (src/landing) ──────────────────────
import { landingRoutes } from "@/landing/landingRoutes";

// ── Route Guards ────────────────────────────────────────────
import ProtectedRoute from "@features/auth/components/ProtectedRoute";
import PublicRoute from "@features/auth/components/PublicRoute";
import RoleBasedRoute from "@features/auth/components/RoleBasedRoute";
import PermissionGuard from "@features/auth/components/PermissionGuard";
import Unauthorized from "@features/auth/components/Unauthorized";
import useHrPermissions from "@features/hr/hooks/useHrPermissions";

// ── Route Constants ────────────────────────────────────────
import { ROUTES } from "@shared/constants/routeConstants";
import { normalizeRole, ROLE_DASHBOARD_ROUTES } from "@shared/constants/roles";

// ================================================================
// LAZY-LOADED PAGE COMPONENTS
// ================================================================

// ── EdTech Hero Landing Page ────────────────────────────────

// ── Upskill Course Program ───────────────────────────────────
const UpskillCourseProgram = lazy(
  () => import("@features/home/pages/UpskillCourseProgram"),
);

// ── Landing Page (3D Premium Landing) ───────────────────────
const LandingPage = lazy(() => import("@features/landing/LandingPage"));
const ConsultationPage = lazy(
  () => import("@features/landing/pages/ConsultationPage"),
);

// ── Prisma Creative Studio Landing ───────────────────────────
const PrismaLanding = lazy(() => import("@features/prisma/PrismaLanding"));

// ── Public Pages (home feature) ──────────────────────────────
const Home = lazy(() => import("@features/home/pages/Home"));
const Blog = lazy(() => import("@features/home/pages/Blog"));
const Career = lazy(() => import("@features/home/pages/Career"));
const Features = lazy(() => import("@features/home/pages/Features"));
const Mentors = lazy(() => import("@features/home/pages/Mentors"));
const NotFound = lazy(() => import("@features/home/pages/NotFound"));

// ── Courses Pages ─────────────────────────────────────────────
const Courses = lazy(() => import("@features/courses/pages/Courses"));
const CourseDetails = lazy(
  () => import("@features/courses/pages/CourseDetails"),
);
const WatchCourse = lazy(() => import("@features/courses/pages/WatchCourse"));
const Enroll = lazy(() => import("@features/courses/pages/Enroll"));
const Wishlist = lazy(() => import("@features/courses/pages/Wishlist"));
const InterviewGuides = lazy(
  () => import("@features/courses/pages/InterviewGuides"),
);
const PracticeTests = lazy(
  () => import("@features/courses/pages/PracticeTests"),
);
const ResumeBuilder = lazy(
  () => import("@features/resume/pages/ResumeBuilder"),
);

// ── Course Detail Sub-pages ──────────────────────────────────
const PythonCourseHero = lazy(
  () => import("@features/courses/components/python/PythonCourseHero"),
);
const ReactMain = lazy(
  () => import("@features/courses/components/react/ReactMain"),
);
const MernMain = lazy(
  () => import("@features/courses/components/mern/MernStack"),
);
const AiMain = lazy(() => import("@features/courses/components/ai/AiMain"));
const AIEngineeringImmersive = lazy(
  () => import("@features/courses/pages/AIEngineeringImmersive"),
);

// ── Admissions ───────────────────────────────────────────────
const Admissions = lazy(() => import("@features/admissions/pages/Admissions"));

// ── Alumni ────────────────────────────────────────────────────
const AlumniHome = lazy(() => import("@features/alumni/pages/AlumniHome"));
const AlumniDirectory = lazy(
  () => import("@features/alumni/pages/AlumniDirectory"),
);
const AlumniEvents = lazy(() => import("@features/alumni/pages/AlumniEvents"));
const AlumniMentorship = lazy(
  () => import("@features/alumni/pages/AlumniMentorship"),
);
const AlumniJobs = lazy(() => import("@features/alumni/pages/AlumniJobs"));

// ── Checkout & Cart ──────────────────────────────────────────
const CheckoutPage = lazy(
  () => import("@features/checkout/pages/CheckoutPage"),
);
const CartPage = lazy(() => import("@features/cart/pages/CartPage"));

// ── Premium Enrollment ───────────────────────────────────────
const EnrollmentPage = lazy(
  () => import("@features/enrollment/pages/EnrollmentPage"),
);
const ActivateAccount = lazy(
  () => import("@features/auth/pages/ActivateAccount"),
);

// ── Course Curriculum ────────────────────────────────────────
const CourseCurriculumPage = lazy(
  () => import("@features/course-curriculum/pages/CourseCurriculumPage"),
);

// ── Auth Pages ──────────────────────────────────────────────
import Login from "@features/auth/pages/login/Login";
import OrganizationLogin from "@features/auth/pages/login/OrganizationLogin";
import MentorLogin from "@features/auth/pages/login/MentorLogin";
import EmployeeLogin from "@features/auth/pages/login/EmployeeLogin";

// ── Mentor Pages ────────────────────────────────────────────────
const MentorDashboard = lazy(
  () => import("@features/mentor/pages/MentorDashboard"),
);
const MentorCourses = lazy(
  () => import("@features/mentor/pages/MentorCourses"),
);
const MentorStudents = lazy(
  () => import("@features/mentor/pages/MentorStudents"),
);
const MentorBatches = lazy(
  () => import("@features/mentor/pages/MentorBatches"),
);
const MentorBatchWorkspace = lazy(
  () => import("@features/mentor/pages/MentorBatchWorkspace"),
);
const MentorStudentWorkspace = lazy(
  () => import("@features/mentor/pages/MentorStudentWorkspace"),
);
const MentorBatchStudentDetails = lazy(
  () => import("@features/mentor/pages/MentorBatchStudentDetails"),
);
const MentorLiveClasses = lazy(
  () => import("@features/mentor/pages/MentorLiveClasses"),
);
const MentorRecordedSessions = lazy(
  () => import("@features/mentor/pages/MentorRecordedSessions"),
);
const MentorAssignments = lazy(
  () => import("@features/mentor/pages/MentorAssignments"),
);
const MentorAssessments = lazy(
  () => import("@features/mentor/pages/MentorAssessments"),
);
const MentorCalendar = lazy(
  () => import("@features/mentor/pages/MentorCalendar"),
);
const MentorAttendance = lazy(
  () => import("@features/mentor/pages/MentorAttendance"),
);
const MentorWebinarsMeetings = lazy(
  () => import("@features/mentor/pages/MentorWebinarsMeetings"),
);
const MentorWebinarMeetingDetails = lazy(
  () => import("@features/mentor/pages/MentorWebinarMeetingDetails"),
);
const MentorMessages = lazy(
  () => import("@features/mentor/pages/MentorMessages"),
);
const MentorReports = lazy(
  () => import("@features/mentor/pages/MentorReports"),
);
const MentorProfile = lazy(
  () => import("@features/mentor/pages/MentorProfile"),
);
const MentorNotifications = lazy(
  () => import("@features/mentor/pages/MentorNotifications"),
);
const MentorSettings = lazy(
  () => import("@features/mentor/pages/MentorSettings"),
);
const StudentNotifications = lazy(
  () => import("@features/student/pages/StudentNotifications"),
);
import Register from "@features/auth/pages/Register";
import ForgotPassword from "@features/auth/pages/login/ForgotPassword";
import OtpVerification from "@features/auth/pages/login/OtpVerification";
import ResetPassword from "@features/auth/pages/login/ResetPassword";
import ProfileChangePassword from "@features/auth/pages/login/ProfileChangePassword";
const Users = lazy(() => import("@features/auth/pages/Users"));

// ── Coding Assessment ────────────────────────────────────────
const CodingAssessmentPage = lazy(
  () => import("@features/coding-assessment/pages/CodingAssessmentPage"),
);

// ── Skill Management Pages ─────────────────────────────────
const SkillDashboard = lazy(
  () => import("@features/skills/pages/SkillDashboard"),
);
const SkillMaster = lazy(() => import("@features/skills/pages/SkillMaster"));
const SkillMatrix = lazy(() => import("@features/skills/pages/SkillMatrix"));
const SkillAnalytics = lazy(
  () => import("@features/skills/pages/SkillAnalytics"),
);

// ── Super Admin Pages ────────────────────────────────────────
const SuperAdminDashboard = lazy(
  () => import("@features/super-admin/pages/SuperAdminDashboard"),
);
const SuperAdminLogin = lazy(
  () => import("@features/super-admin/pages/SuperAdminLogin"),
);
const SuperAdminOrganizations = lazy(
  () => import("@features/super-admin/pages/SuperAdminOrganizations"),
);
const SuperAdminOrganizationDetails = lazy(
  () => import("@features/super-admin/pages/SuperAdminOrganizationDetails"),
);
const SuperAdminEmployees = lazy(
  () => import("@features/super-admin/pages/SuperAdminEmployees"),
);
const SuperAdminCourses = lazy(
  () => import("@features/super-admin/pages/SuperAdminCourses"),
);
const SuperAdminUsers = lazy(
  () => import("@features/super-admin/pages/SuperAdminUsers"),
);
const SuperAdminUserDetails = lazy(
  () => import("@features/super-admin/pages/SuperAdminUserDetails"),
);
const SuperAdminAuditLogs = lazy(
  () => import("@features/super-admin/pages/SuperAdminAuditLogs"),
);
const SuperAdminPricePlans = lazy(
  () => import("@features/super-admin/pages/SuperAdminPricePlans"),
);
const PaymentDetails = lazy(
  () => import("@features/super-admin/pages/PaymentDetails"),
);
const SuperAdminStudents = lazy(
  () => import("@features/super-admin/pages/SuperAdminStudents"),
);
const SuperAdminStudentDetails = lazy(
  () => import("@features/super-admin/pages/SuperAdminStudentDetails"),
);
const SuperAdminSubscriptions = lazy(
  () => import("@features/super-admin/pages/SuperAdminSubscriptions"),
);
const SubscriptionDetails = lazy(
  () => import("@features/super-admin/pages/SubscriptionDetails"),
);
const SuperAdminRevenue = lazy(
  () => import("@features/super-admin/pages/SuperAdminRevenue"),
);
const RevenueTransactionDetails = lazy(
  () => import("@features/super-admin/pages/RevenueTransactionDetails"),
);
const SuperAdminProfile = lazy(
  () => import("@features/super-admin/pages/SuperAdminProfile"),
);
const SuperAdminAnalytics = lazy(
  () => import("@features/super-admin/pages/SuperAdminAnalytics"),
);
const SuperAdminReports = lazy(
  () => import("@features/super-admin/pages/SuperAdminReports"),
);
const SuperAdminSettings = lazy(
  () => import("@features/super-admin/pages/SuperAdminSettings"),
);
const SuperAdminGovernance = lazy(
  () => import("@features/super-admin/pages/SuperAdminGovernance"),
);

// ── Organization Pages ─────────────────────────────────────
const OrgAdminDashboard = lazy(
  () => import("@features/organization/pages/InstituteAdminDashboard"),
);
const OrgFinance = lazy(
  () => import("@features/organization/pages/FinanceManagement"),
);
const OrgLiveClasses = lazy(
  () => import("@features/live-classes/pages/LiveClasses"),
);
const CourseMaterials = lazy(
  () => import("@features/organization/pages/CourseMaterials"),
);
const OrgPayroll = lazy(() => import("@features/organization/pages/PayrollApiReady"));
const OrgAttendance = lazy(() => import("@features/organization/pages/AttendanceApiReady"));
const OrgRevenue = lazy(() => import("@features/organization/pages/RevenueApiReady"));
const OrgInvoices = lazy(() => import("@features/organization/pages/InvoiceManagement"));
const OrgInvoiceDetails = lazy(() => import("@features/organization/pages/InvoiceDetails"));
const OrgAssessments = lazy(
  () => import("@/pages/assessments/AssessmentsPage"),
);
const OrgLearning = lazy(
  () => import("@features/organization/pages/OrgLearning"),
);
const OrgGoals = lazy(() => import("@features/organization/pages/OrgGoals"));
const OrgReports = lazy(
  () => import("@features/organization/pages/OrgReports"),
);
const OrgPerformance = lazy(
  () => import("@features/organization/pages/OrgPerformance"),
);
const OrgBranches = lazy(
  () => import("@features/organization/pages/OrgBranches"),
);
const RecycleBinPage = lazy(
  () => import("@features/organization/RecycleBin/RecycleBinPage"),
);
const CourseManagement = lazy(() => import("@/pages/courses/CoursesPage"));
const CourseBuilder = lazy(() => import("@/pages/courses/CourseForm"));
const MentorManagement = lazy(() => import("@/pages/trainers/TrainersPage"));
const BatchManagement = lazy(
  () => import("@features/organization/pages/BatchManagement"),
);
const BatchDetails = lazy(() => import("@/pages/batches/BatchDetail"));
const OrgStudentProfile = lazy(
  () => import("@features/organization/pages/StudentProfile"),
);
const OrgStudentOverview = lazy(
  () => import("@features/organization/pages/StudentOverview"),
);
const OrgStudentAssignments = lazy(
  () => import("@features/organization/pages/StudentAssignments"),
);
const OrgStudentPerformance = lazy(
  () => import("@features/organization/pages/StudentPerformance"),
);
const OrgStudentReports = lazy(
  () => import("@features/organization/pages/StudentReports"),
);
const OrgCourseDetails = lazy(() => import("@/pages/courses/CourseDetail"));
const OrgModuleDetails = lazy(
  () => import("@features/organization/pages/ModuleDetails"),
);
const OrgSubConceptDetails = lazy(
  () => import("@features/organization/pages/SubConceptDetails"),
);
const DesignationManagement = lazy(
  () => import("@features/organization/pages/DesignationManagement"),
);
const LevelManagement = lazy(
  () => import("@features/organization/pages/LevelManagement"),
);
const CertificateManagement = lazy(
  () => import("@/pages/certificates/CertificatesPage"),
);
const OrganizationRegistrationPage = lazy(
  () => import("@features/organization/pages/OrganizationRegistrationPage"),
);
const OrganizationOverviewPage = lazy(
  () => import("@features/organization/pages/OrganizationOverviewPage"),
);
const OrganizationProfilePage = lazy(
  () => import("@features/organization/pages/OrganizationProfilePage"),
);
const OrganizationSettingsPage = lazy(
  () => import("@features/organization/pages/OrganizationSettingsPage"),
);
const TeamManagement = lazy(
  () => import("@features/organization/pages/TeamManagement"),
);
const EmployeeManagement = lazy(
  () => import("@features/organization/pages/EmployeeManagement"),
);
const EmployeeDetails = lazy(
  () => import("@features/organization/pages/EmployeeDetails"),
);
const StudentManagement = lazy(() => import("@/pages/students/StudentsPage"));
const AssignStudentToBatch = lazy(() => import("@/pages/students/AssignStudentToBatch"));
const CompetencyManagement = lazy(
  () => import("@features/organization/pages/CompetencyManagement"),
);
const OrgCareerPaths = lazy(
  () => import("@features/organization/pages/CareerPathManagement"),
);
const OrgAICareerCoach = lazy(
  () => import("@features/organization/pages/AICareerCoach"),
);
const OrgNotifications = lazy(
  () => import("@features/organization/pages/Notifications"),
);
const OrganizationOperationsCenter = lazy(
  () => import("@features/organization/pages/OrganizationOperationsCenter"),
);
const OrgWebinars = lazy(() => import("@features/organization/pages/Webinars"));
const OrgWebinarDetails = lazy(
  () => import("@features/organization/pages/WebinarDetails"),
);
const OrgWebinarsCalendar = lazy(
  () => import("@features/organization/pages/WebinarsCalendarPage"),
);

// ── Employee Pages ─────────────────────────────────────────
const EmployeeMyLearning = lazy(
  () => import("@features/employee/pages/EmployeeMyLearning"),
);
const HRBatchDetails = lazy(() => import('@features/hr/pages/BatchDetails'));
const EmployeeBatches = lazy(
  () => import("@features/employee/pages/EmployeeBatches"),
);
const EmployeeClassSchedule = lazy(
  () => import("@features/employee/pages/EmployeeClassSchedule"),
);
const EmployeeLiveClasses = lazy(
  () => import("@features/employee/pages/EmployeeLiveClasses"),
);
const EmployeeRecordedSessions = lazy(
  () => import("@features/employee/pages/EmployeeRecordedSessions"),
);
const EmployeeAssignments = lazy(
  () => import("@features/employee/pages/EmployeeAssignments"),
);
const EmployeeAssessments = lazy(
  () => import("@features/employee/pages/EmployeeAssessments"),
);
const EmployeeAttendance = lazy(
  () => import("@features/employee/pages/EmployeeAttendance"),
);
const EmployeeLeaveRequests = lazy(
  () => import("@features/employee/pages/EmployeeLeaveRequests"),
);
const EmployeePerformance = lazy(
  () => import("@features/employee/pages/EmployeePerformance"),
);
const EmployeeSkills = lazy(
  () => import("@features/employee/pages/EmployeeSkills"),
);
const EmployeeGoals = lazy(
  () => import("@features/employee/pages/EmployeeGoals"),
);
const EmployeeCareer = lazy(
  () => import("@features/employee/pages/EmployeeCareer"),
);
const EmployeeAICareerCoach = lazy(
  () => import("@features/employee/pages/EmployeeAICareerCoach"),
);
const EmployeeCertificates = lazy(
  () => import("@features/employee/pages/EmployeeCertificates"),
);
const EmployeeReports = lazy(
  () => import("@features/employee/pages/EmployeeReports"),
);
const EmployeeResources = lazy(
  () => import("@features/employee/pages/EmployeeResources"),
);
const EmployeeCalendar = lazy(
  () => import("@features/employee/pages/EmployeeCalendar"),
);
const EmployeeMessages = lazy(
  () => import("@features/employee/pages/EmployeeMessages"),
);
const EmployeeNotifications = lazy(
  () => import("@features/employee/pages/EmployeeNotifications"),
);
const EmployeeAnnouncements = lazy(
  () => import("@features/employee/pages/EmployeeAnnouncements"),
);
const EmployeeReviews = lazy(
  () => import("@features/employee/pages/EmployeeReviews"),
);
const EmployeeProfile = lazy(
  () => import("@features/employee/pages/EmployeeProfile"),
);
const EmployeeSettings = lazy(
  () => import("@features/employee/pages/EmployeeSettings"),
);
const EmployeeCoursePlayer = lazy(
  () =>
    import("@features/student/pages/StudentCoursePlayer/StudentCoursePlayer"),
);
// RBAC UPGRADE — HR/Operations employee-department dashboards
const HRDashboard = lazy(() => import("@features/hr/pages/HRDashboard"));
const HrStudentManagement = lazy(() => import("@features/hr/pages/HrStudentManagement"));
const EmployeeDashboard = lazy(() => import("@features/employee/pages/EmployeeDashboard"));
const HrRouteGuard = lazy(
  () => import("@features/hr/components/HrRouteGuard"),
);
const HRWorkspace = lazy(() => import("@features/hr/pages/HRWorkspace"));
const HREmployees = lazy(() => import("@features/hr/pages/EmployeeManagement"));
const HROnboarding = lazy(
  () => import("@features/hr/pages/OnboardingManagement"),
);
const HRAttendance = lazy(
  () => import("@features/hr/pages/AttendanceManagement"),
);
const HRLeave = lazy(() => import("@features/hr/pages/LeaveManagement"));
const HREmployeeLeaveDetails = lazy(() => import("@features/hr/pages/EmployeeLeaveDetails"));
const HREmployeeAttendanceDetails = lazy(() => import("@features/hr/pages/EmployeeAttendanceDetails"));
const HREmployeeDetails = lazy(() => import('@features/hr/pages/EmployeeDetails'));
const HRStudentDetails = lazy(() => import("@features/hr/pages/StudentDetails"));
const HRShifts = lazy(() => import("@features/hr/pages/ShiftManagement"));
const HRHolidays = lazy(() => import("@features/hr/pages/HolidayManagement"));
const HRPayroll = lazy(() => import("@features/hr/pages/PayrollManagement"));
const HRPayslips = lazy(() => import("@features/hr/pages/PayslipManagement"));
const HRRecruitment = lazy(
  () => import("@features/hr/pages/RecruitmentManagement"),
);
const HRPerformance = lazy(
  () => import("@features/hr/pages/PerformanceManagement"),
);
const HRAppraisal = lazy(
  () => import("@features/hr/pages/AppraisalManagement"),
);
const HRAssets = lazy(() => import("@features/hr/pages/AssetManagement"));
const HRDocuments = lazy(() => import("@features/hr/pages/DocumentManagement"));
const HRExit = lazy(() => import("@features/hr/pages/ExitManagement"));
const HRTickets = lazy(() => import("@features/hr/pages/TicketManagement"));
const HRReports = lazy(() => import("@features/hr/pages/HRReports"));
const HRSettings = lazy(() => import("@features/hr/pages/HRSettings"));
const HRSyllabusAssignments = lazy(() => import("@features/syllabus/pages/HRSyllabusAssignments"));
const AssignedSyllabus = lazy(() => import("@features/syllabus/pages/AssignedSyllabus"));
const EmployeeSyllabus = lazy(() => import("@features/syllabus/pages/EmployeeSyllabus"));
const OperationsDashboard = lazy(
  () => import("@features/employee/pages/OperationsDashboard"),
);
const HRWorkQueue = lazy(() => import("@features/employee/pages/HRWorkQueue"));
// Demo Mode — presentation-only role switcher, does not touch real auth
const DemoLogin = lazy(() => import("@features/auth/pages/DemoLogin"));

// ── Student Pages ───────────────────────────────────────────
const StudentDashboard = lazy(
  () => import("@features/student/pages/StudentDashboard"),
);
const StudentWorkCenter = lazy(
  () => import("@features/student/pages/StudentWorkCenter"),
);
const StudentCourseMaterials = lazy(
  () => import("@features/student/pages/StudentCourseMaterials"),
);
const StudentMyClasses = lazy(
  () => import("@features/student/pages/MyClasses"),
);
const StudentLiveClassroom = lazy(
  () => import("@features/student/pages/StudentLiveClassroom"),
);
const StudentCalendar = lazy(
  () => import("@features/student/pages/StudentCalendar"),
);
const StudentAttendance = lazy(
  () => import("@features/student/pages/StudentAttendance"),
);
const StudentCourses = lazy(
  () => import("@features/student/pages/StudentCourses"),
);
const StudentVideoLesson = lazy(
  () => import("@/pages/student/courses/VideoLesson"),
);
const StudentAssignmentPage = lazy(
  () => import("@/pages/student/courses/AssignmentPage"),
);
const StudentCourseResultPage = lazy(
  () => import("@/pages/student/courses/ResultPage"),
);
const StudentCoursePlayer = lazy(
  () =>
    import("@features/student/pages/StudentCoursePlayer/StudentCoursePlayer"),
);
const AssessmentsList = lazy(
  () => import("@features/student/pages/AssessmentsList"),
);
const AssessmentDetails = lazy(
  () => import("@features/student/pages/AssessmentDetails"),
);
const AssessmentInstructions = lazy(
  () => import("@features/student/pages/AssessmentInstructions"),
);
const LiveAssessment = lazy(
  () => import("@features/student/pages/LiveAssessment"),
);
const AssessmentEvaluation = lazy(
  () => import("@features/student/pages/AssessmentEvaluation"),
);
const AssessmentResults = lazy(
  () => import("@/pages/student/assessments/AssessmentResult"),
);
const AssessmentAnalytics = lazy(
  () => import("@features/student/pages/AssessmentAnalytics"),
);
const AssessmentCertificate = lazy(
  () => import("@features/student/pages/AssessmentCertificate"),
);
const StudentCertificates = lazy(
  () => import("@features/student/pages/StudentCertificates"),
);
const StudentJobPortal = lazy(
  () => import("@features/student/pages/StudentJobPortal"),
);
const StudentLearningPaths = lazy(
  () => import("@features/student/pages/StudentLearningPaths"),
);
const StudentAICareerCoach = lazy(
  () => import("@features/student/pages/StudentAICareerCoach"),
);
const StudentMentorChat = lazy(
  () => import("@features/student/pages/StudentMentorChat"),
);
const StudentProfile = lazy(
  () => import("@features/student/pages/StudentProfile"),
);
const StudentSettings = lazy(
  () => import("@features/student/pages/StudentSettings"),
);
const StudentPayments = lazy(
  () => import("@features/student/pages/StudentPayments"),
);
const StudentProgress = lazy(
  () => import("@features/student/pages/StudentProgress"),
);
const StudentMyBatch = lazy(
  () => import("@features/student/pages/StudentMyBatch"),
);
const StudentRecordings = lazy(
  () => import("@features/student/pages/StudentRecordings"),
);

// ── Placeholder for future pages ────────────────────────────

// ================================================================
// SUSPENSE FALLBACK
// ================================================================
const PageLoader = () => (
  <div className="flex h-dvh items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-medium text-slate-400">Loading...</span>
    </div>
  </div>
);

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

const DashboardRedirect = () => {
  const role = normalizeRole(
    localStorage.getItem("user_role") ||
      localStorage.getItem("role") ||
      localStorage.getItem("userRole"),
  );
  return <Navigate to={ROLE_DASHBOARD_ROUTES[role] || "/"} replace />;
};

// Keep HR users out of the generic learning dashboard, including when they
// open the legacy employee dashboard URL directly.
const EmployeeDashboardEntry = () => {
  const { isHrUser, isLoading } = useHrPermissions();
  if (isLoading) return <p role="status">Loading your workspace...</p>;
  if (isHrUser) {
    return <Navigate to={ROUTES.EMPLOYEE.HR_DASHBOARD} replace />;
  }

  return (
    <SuspenseWrapper>
      <EmployeeDashboard />
    </SuspenseWrapper>
  );
};

// ================================================================
// APP ROUTES
// ================================================================

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Root and the other landing-only pages -> landing (src/landing).
            The app's own home page is served at /home. */}
        {landingRoutes}

        {/* Prisma Creative Studio Landing */}
        <Route
          path="/prisma"
          element={
            <SuspenseWrapper>
              <PrismaLanding />
            </SuspenseWrapper>
          }
        />

        {/* 3D Premium Landing (legacy) */}
        <Route
          path={ROUTES.PUBLIC.LANDING}
          element={
            <SuspenseWrapper>
              <LandingPage />
            </SuspenseWrapper>
          }
        />

        {/* Consultation Page */}
        <Route
          path={ROUTES.PUBLIC.CONSULTATION}
          element={
            <SuspenseWrapper>
              <ConsultationPage />
            </SuspenseWrapper>
          }
        />

        {/* Legacy Home */}
        <Route
          path="/home"
          element={
            <SuspenseWrapper>
              <Home />
            </SuspenseWrapper>
          }
        />

        {/* Upskill Program */}
        <Route
          path={ROUTES.PUBLIC.UPSKILL_PROGRAM}
          element={
            <SuspenseWrapper>
              <UpskillCourseProgram />
            </SuspenseWrapper>
          }
        />

        {/* Courses & Learning */}
        <Route
          path={ROUTES.PUBLIC.COURSES}
          element={
            <SuspenseWrapper>
              <Courses />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.COURSE_DETAILS}
          element={
            <SuspenseWrapper>
              <CourseDetails />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.WATCH_COURSE}
          element={
            <SuspenseWrapper>
              <WatchCourse />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.MENTORS}
          element={
            <SuspenseWrapper>
              <Mentors />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.RESUME_BUILDER}
          element={
            <SuspenseWrapper>
              <ResumeBuilder />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.INTERVIEW_GUIDES}
          element={
            <SuspenseWrapper>
              <InterviewGuides />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.PRACTICE_TESTS}
          element={
            <SuspenseWrapper>
              <PracticeTests />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.BLOG}
          element={
            <SuspenseWrapper>
              <Blog />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.CAREER}
          element={
            <SuspenseWrapper>
              <Career />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.FEATURES}
          element={
            <SuspenseWrapper>
              <Features />
            </SuspenseWrapper>
          }
        />
        {/* /contact and /about are served by the landing pages (landingRoutes). */}
        <Route
          path={ROUTES.PUBLIC.ENROLL}
          element={
            <SuspenseWrapper>
              <Enroll />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.ADMISSIONS}
          element={
            <SuspenseWrapper>
              <Admissions />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.ALUMNI}
          element={
            <SuspenseWrapper>
              <AlumniHome />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.ALUMNI_DIRECTORY}
          element={
            <SuspenseWrapper>
              <AlumniDirectory />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.ALUMNI_EVENTS}
          element={
            <SuspenseWrapper>
              <AlumniEvents />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.ALUMNI_MENTORSHIP}
          element={
            <SuspenseWrapper>
              <AlumniMentorship />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.ALUMNI_JOBS}
          element={
            <SuspenseWrapper>
              <AlumniJobs />
            </SuspenseWrapper>
          }
        />
        {/* Premium Course Curriculum — dynamic slug-based routing */}
        <Route
          path={ROUTES.PUBLIC.COURSE_CURRICULUM}
          element={
            <SuspenseWrapper>
              <CourseCurriculumPage />
            </SuspenseWrapper>
          }
        />
        {/* Legacy static curriculum route (kept for backward compatibility) */}
        <Route
          path="/courses/curriculum"
          element={
            <SuspenseWrapper>
              <CourseCurriculumPage />
            </SuspenseWrapper>
          }
        />

        {/* Coding Assessment */}
        <Route
          path="/coding-assessment"
          element={
            <SuspenseWrapper>
              <CodingAssessmentPage />
            </SuspenseWrapper>
          }
        />

        {/* Premium Enrollment Checkout */}
        <Route
          path="/enrollment"
          element={
            <SuspenseWrapper>
              <EnrollmentPage />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.CHECKOUT}
          element={
            <SuspenseWrapper>
              <CheckoutPage />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.CART}
          element={
            <SuspenseWrapper>
              <CartPage />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.WISHLIST}
          element={
            <SuspenseWrapper>
              <Wishlist />
            </SuspenseWrapper>
          }
        />

        {/* Course detail sub-pages */}
        <Route
          path={ROUTES.PUBLIC.PYTHON_COURSE}
          element={
            <SuspenseWrapper>
              <PythonCourseHero />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.REACT_COURSE}
          element={
            <SuspenseWrapper>
              <ReactMain />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.MERN_COURSE}
          element={
            <SuspenseWrapper>
              <MernMain />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.AI_COURSE}
          element={
            <SuspenseWrapper>
              <AiMain />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.PUBLIC.AI_ENGINEERING_IMMERSIVE}
          element={
            <SuspenseWrapper>
              <AIEngineeringImmersive />
            </SuspenseWrapper>
          }
        />

        {/* Auth Routes */}
        <Route element={<PublicRoute />}>
          <Route
            path={ROUTES.AUTH.LOGIN}
            element={
              <SuspenseWrapper>
                <Login />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.MENTOR.LOGIN}
            element={
              <SuspenseWrapper>
                <MentorLogin />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.LOGIN}
            element={
              <SuspenseWrapper>
                <EmployeeLogin />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.LOGIN}
            element={
              <SuspenseWrapper>
                <OrganizationLogin />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.SUPER_ADMIN.LOGIN}
            element={
              <SuspenseWrapper>
                <SuperAdminLogin />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.AUTH.REGISTER}
            element={
              <SuspenseWrapper>
                <Register />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/signup"
            element={<Navigate to={ROUTES.AUTH.REGISTER} replace />}
          />
          <Route
            path={ROUTES.AUTH.SEND_OTP}
            element={
              <SuspenseWrapper>
                <ForgotPassword />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.AUTH.FORGOT_PASSWORD}
            element={
              <SuspenseWrapper>
                <ForgotPassword />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.AUTH.OTP_VERIFICATION}
            element={
              <SuspenseWrapper>
                <OtpVerification />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/otp-verification"
            element={<Navigate to={ROUTES.AUTH.OTP_VERIFICATION} replace />}
          />
          <Route
            path={ROUTES.AUTH.RESET_PASSWORD}
            element={
              <SuspenseWrapper>
                <ResetPassword />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.AUTH.ACTIVATE_ACCOUNT}
            element={
              <SuspenseWrapper>
                <ActivateAccount />
              </SuspenseWrapper>
            }
          />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* Demo Mode — intentionally NOT wrapped in PublicRoute, so a presenter can jump between demo personas without being bounced to a dashboard */}
        <Route
          path="/demo-login"
          element={
            <SuspenseWrapper>
              <DemoLogin />
            </SuspenseWrapper>
          }
        />
        <Route
          path={ROUTES.AUTH.CHANGE_PASSWORD}
          element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <ProfileChangePassword />
              </SuspenseWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.AUTH.PROFILE}
          element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <StudentProfile />
              </SuspenseWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.AUTH.USERS}
          element={
            <ProtectedRoute allowedRoles={["super-admin", "org-admin"]}>
              <SuspenseWrapper>
                <Users />
              </SuspenseWrapper>
            </ProtectedRoute>
          }
        />

        {/* Legacy Dashboard Redirect */}
        <Route
          path={ROUTES.SUPER_ADMIN.LEGACY_DASHBOARD}
          element={<Navigate to={ROUTES.SUPER_ADMIN.DASHBOARD} replace />}
        />

        {/* SUPER ADMIN MODULE */}
        <Route
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={["super-admin"]}>
                <DashboardLayout />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        >
          <Route
            path={ROUTES.SUPER_ADMIN.ROOT}
            element={<Navigate to={ROUTES.SUPER_ADMIN.DASHBOARD} replace />}
          />
          <Route
            path={ROUTES.SUPER_ADMIN.DASHBOARD}
            element={
              <SuspenseWrapper>
                <SuperAdminDashboard />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.SUPER_ADMIN.ORGANIZATIONS}
            element={
              <SuspenseWrapper>
                <SuperAdminOrganizations />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.SUPER_ADMIN.ORGANIZATION_DETAILS}
            element={
              <SuspenseWrapper>
                <SuperAdminOrganizationDetails />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.SUPER_ADMIN.EMPLOYEES}
            element={
              <SuspenseWrapper>
                <SuperAdminEmployees />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.SUPER_ADMIN.STUDENTS}
            element={
              <SuspenseWrapper>
                <SuperAdminStudents />
              </SuspenseWrapper>
            }
          />
          <Route path={ROUTES.SUPER_ADMIN.STUDENT_DETAILS} element={<SuspenseWrapper><SuperAdminStudentDetails /></SuspenseWrapper>} />
          <Route
            path={ROUTES.SUPER_ADMIN.SUBSCRIPTIONS}
            element={
              <SuspenseWrapper>
                <SuperAdminSubscriptions />
              </SuspenseWrapper>
            }
          />
          <Route path={ROUTES.SUPER_ADMIN.SUBSCRIPTION_DETAILS} element={<SuspenseWrapper><SubscriptionDetails /></SuspenseWrapper>} />
          <Route path={ROUTES.SUPER_ADMIN.COURSES} element={<SuspenseWrapper><SuperAdminCourses /></SuspenseWrapper>} />
          <Route path={ROUTES.SUPER_ADMIN.USERS} element={<SuspenseWrapper><SuperAdminUsers /></SuspenseWrapper>} />
          <Route path={ROUTES.SUPER_ADMIN.USER_DETAILS} element={<SuspenseWrapper><SuperAdminUserDetails /></SuspenseWrapper>} />
          <Route path={ROUTES.SUPER_ADMIN.AUDIT_LOGS} element={<SuspenseWrapper><SuperAdminAuditLogs /></SuspenseWrapper>} />
          <Route path={ROUTES.SUPER_ADMIN.PRICE_PLANS} element={<SuspenseWrapper><SuperAdminPricePlans /></SuspenseWrapper>} />
          <Route path={ROUTES.SUPER_ADMIN.PAYMENT_DETAILS} element={<SuspenseWrapper><PaymentDetails /></SuspenseWrapper>} />
          <Route path={ROUTES.SUPER_ADMIN.REVENUE} element={<SuspenseWrapper><SuperAdminRevenue /></SuspenseWrapper>} />
          <Route path={ROUTES.SUPER_ADMIN.REVENUE_TRANSACTION_DETAILS} element={<SuspenseWrapper><RevenueTransactionDetails /></SuspenseWrapper>} />
          <Route path={ROUTES.SUPER_ADMIN.ROLES_PERMISSIONS} element={<SuspenseWrapper><SuperAdminGovernance /></SuspenseWrapper>} />
          <Route
            path={ROUTES.SUPER_ADMIN.ANALYTICS}
            element={
              <SuspenseWrapper>
                <SuperAdminAnalytics />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.SUPER_ADMIN.REPORTS}
            element={
              <SuspenseWrapper>
                <SuperAdminReports />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.SUPER_ADMIN.GOVERNANCE}
            element={
              <SuspenseWrapper>
                <SuperAdminGovernance />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.SUPER_ADMIN.SETTINGS}
            element={
              <SuspenseWrapper>
                <SuperAdminSettings />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.SUPER_ADMIN.PROFILE}
            element={
              <SuspenseWrapper>
                <SuperAdminProfile />
              </SuspenseWrapper>
            }
          />
        </Route>

        {/* ORGANIZATION MODULE */}
        <Route
          path={ROUTES.ORG_ADMIN.REGISTRATION}
          element={
            <SuspenseWrapper>
              <OrganizationRegistrationPage />
            </SuspenseWrapper>
          }
        />
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "org-admin",
                "organization",
                "organizationadmin",
                "Organization",
                "OrganizationAdmin",
                "OrgAdmin",
              ]}
              requireOrganization
            >
              <RoleBasedRoute allowedRoles={["org-admin"]}>
                <DashboardLayout />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        >
          <Route
            path={ROUTES.ORG_ADMIN.ROOT}
            element={<Navigate to={ROUTES.ORG_ADMIN.DASHBOARD} replace />}
          />
          <Route
            path={ROUTES.ORG_ADMIN.DASHBOARD}
            element={
              <SuspenseWrapper>
                <OrgAdminDashboard />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.OVERVIEW}
            element={
              <SuspenseWrapper>
                <OrganizationOverviewPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.PROFILE}
            element={
              <SuspenseWrapper>
                <OrganizationProfilePage />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.EMPLOYEES}
            element={
              <SuspenseWrapper>
                <EmployeeManagement />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.EMPLOYEE_DETAILS}
            element={
              <SuspenseWrapper>
                <EmployeeDetails />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.STUDENTS}
            element={
              <SuspenseWrapper>
                <StudentManagement />
              </SuspenseWrapper>
            }
          />
          <Route path={ROUTES.ORG_ADMIN.STUDENT_ADD} element={<SuspenseWrapper><StudentManagement /></SuspenseWrapper>} />
          <Route path={ROUTES.ORG_ADMIN.STUDENT_DETAILS} element={<SuspenseWrapper><OrgStudentProfile /></SuspenseWrapper>} />
          <Route path={ROUTES.ORG_ADMIN.STUDENT_EDIT} element={<SuspenseWrapper><StudentManagement /></SuspenseWrapper>} />
          <Route path={ROUTES.ORG_ADMIN.STUDENT_ASSIGN} element={<SuspenseWrapper><StudentManagement /></SuspenseWrapper>} />
          <Route path={ROUTES.ORG_ADMIN.STUDENT_ASSIGN_BATCH} element={<SuspenseWrapper><AssignStudentToBatch /></SuspenseWrapper>} />
          <Route
            path={ROUTES.ORG_ADMIN.MENTORS}
            element={
              <SuspenseWrapper>
                <MentorManagement />
              </SuspenseWrapper>
            }
          />
          <Route path={ROUTES.ORG_ADMIN.TUTORS} element={<SuspenseWrapper><MentorManagement /></SuspenseWrapper>} />
          <Route path={ROUTES.ORG_ADMIN.TUTOR_ADD} element={<SuspenseWrapper><MentorManagement /></SuspenseWrapper>} />
          <Route path={ROUTES.ORG_ADMIN.TUTOR_DETAILS} element={<SuspenseWrapper><MentorManagement /></SuspenseWrapper>} />
          <Route path={ROUTES.ORG_ADMIN.TUTOR_EDIT} element={<SuspenseWrapper><MentorManagement /></SuspenseWrapper>} />
          <Route path={ROUTES.ORG_ADMIN.TUTOR_ASSIGN} element={<SuspenseWrapper><MentorManagement /></SuspenseWrapper>} />
          <Route path={ROUTES.ORG_ADMIN.TUTOR_ASSIGNMENTS} element={<SuspenseWrapper><MentorManagement /></SuspenseWrapper>} />
          <Route
            path={ROUTES.ORG_ADMIN.RECYCLE_BIN}
            element={
              <SuspenseWrapper>
                <RecycleBinPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.COURSES}
            element={
              <SuspenseWrapper>
                <CourseManagement />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.COURSE_CREATE}
            element={
              <SuspenseWrapper>
                <CourseBuilder />
              </SuspenseWrapper>
            }
          />
          <Route path={ROUTES.ORG_ADMIN.COURSE_ADD} element={<SuspenseWrapper><CourseBuilder /></SuspenseWrapper>} />
          <Route path={ROUTES.ORG_ADMIN.COURSE_EDIT} element={<SuspenseWrapper><CourseBuilder /></SuspenseWrapper>} />
          <Route
            path={ROUTES.ORG_ADMIN.BATCHES}
            element={
              <SuspenseWrapper>
                <BatchManagement />
              </SuspenseWrapper>
            }
          />
          <Route path={ROUTES.ORG_ADMIN.BATCH_ADD} element={<Navigate to={`${ROUTES.ORG_ADMIN.BATCHES}?create=true`} replace />} />
          <Route path={ROUTES.ORG_ADMIN.BATCH_EDIT} element={<Navigate to={ROUTES.ORG_ADMIN.BATCHES} replace />} />
          <Route
            path={ROUTES.ORG_ADMIN.BATCH_DETAILS}
            element={
              <SuspenseWrapper>
                <BatchDetails />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.STUDENT_PROFILE}
            element={
              <SuspenseWrapper>
                <OrgStudentProfile />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.STUDENT_OVERVIEW}
            element={
              <SuspenseWrapper>
                <OrgStudentOverview />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.STUDENT_ASSIGNMENTS}
            element={
              <SuspenseWrapper>
                <OrgStudentAssignments />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.STUDENT_PERFORMANCE}
            element={
              <SuspenseWrapper>
                <OrgStudentPerformance />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.STUDENT_REPORTS}
            element={
              <SuspenseWrapper>
                <OrgStudentReports />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.COURSE_DETAILS}
            element={
              <SuspenseWrapper>
                <OrgCourseDetails />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.COURSE_MODULE_DETAILS}
            element={
              <SuspenseWrapper>
                <OrgModuleDetails />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.SUB_CONCEPT_DETAILS}
            element={
              <SuspenseWrapper>
                <OrgSubConceptDetails />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.LIVE_CLASSES}
            element={
              <SuspenseWrapper>
                <OrgLiveClasses />
              </SuspenseWrapper>
            }
          />
          <Route path={ROUTES.ORG_ADMIN.CLASSES} element={<SuspenseWrapper><OrgLiveClasses /></SuspenseWrapper>} />
          <Route path={ROUTES.ORG_ADMIN.COURSE_MATERIALS} element={<SuspenseWrapper><CourseMaterials /></SuspenseWrapper>} />
          <Route path={ROUTES.ORG_ADMIN.PAYROLL} element={<SuspenseWrapper><OrgPayroll /></SuspenseWrapper>} />
          <Route
            path={ROUTES.ORG_ADMIN.ATTENDANCE}
            element={
              <SuspenseWrapper>
                <OrgAttendance />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.CERTIFICATES}
            element={
              <SuspenseWrapper>
                <CertificateManagement />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.DESIGNATIONS}
            element={
              <SuspenseWrapper>
                <DesignationManagement />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.LEVELS}
            element={
              <SuspenseWrapper>
                <LevelManagement />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.TEAMS}
            element={
              <SuspenseWrapper>
                <TeamManagement />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.SKILLS}
            element={<Navigate to={ROUTES.ORG_ADMIN.SKILL_DASHBOARD} replace />}
          />
          <Route
            path={ROUTES.ORG_ADMIN.SKILL_DASHBOARD}
            element={
              <SuspenseWrapper>
                <SkillDashboard />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.SKILL_MASTER}
            element={
              <SuspenseWrapper>
                <SkillMaster />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.SKILL_MATRIX}
            element={
              <SuspenseWrapper>
                <SkillMatrix />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.SKILL_ANALYTICS}
            element={
              <SuspenseWrapper>
                <SkillAnalytics />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.REPORTS}
            element={
              <SuspenseWrapper>
                <OrgReports />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.FINANCE}
            element={
              <SuspenseWrapper>
                <OrgFinance />
              </SuspenseWrapper>
            }
          />
          <Route path={ROUTES.ORG_ADMIN.REVENUE} element={<SuspenseWrapper><OrgRevenue /></SuspenseWrapper>} />
          <Route
            path={ROUTES.ORG_ADMIN.INVOICES}
            element={
              <SuspenseWrapper>
                <OrgInvoices />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.INVOICE_DETAILS}
            element={
              <SuspenseWrapper>
                <OrgInvoiceDetails />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.PERFORMANCE}
            element={
              <SuspenseWrapper>
                <OrgPerformance />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.BRANCHES}
            element={
              <SuspenseWrapper>
                <OrgBranches />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.GOALS}
            element={
              <SuspenseWrapper>
                <OrgGoals />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.COMPETENCIES}
            element={
              <SuspenseWrapper>
                <CompetencyManagement />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.ASSESSMENTS}
            element={
              <SuspenseWrapper>
                <OrgAssessments />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.SYLLABUS}
            element={
              <HrRouteGuard module="syllabus" action="assign" allowOrganizationAdmin>
                <SuspenseWrapper><HRSyllabusAssignments /></SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.LEARNING}
            element={
              <SuspenseWrapper>
                <OrgLearning />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/organization/career-paths"
            element={
              <SuspenseWrapper>
                <OrgCareerPaths />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.AI_CAREER_COACH}
            element={
              <SuspenseWrapper>
                <OrgAICareerCoach />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.NOTIFICATIONS}
            element={
              <SuspenseWrapper>
                <OrgNotifications />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.APPROVALS}
            element={
              <SuspenseWrapper>
                <OrganizationOperationsCenter view="approvals" />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.SUPPORT}
            element={
              <SuspenseWrapper>
                <OrganizationOperationsCenter view="support" />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.DAILY_REVIEW}
            element={
              <SuspenseWrapper>
                <OrganizationOperationsCenter view="daily" />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.AUDIT_LOG}
            element={
              <SuspenseWrapper>
                <OrganizationOperationsCenter view="audit" />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.WEBINARS}
            element={
              <SuspenseWrapper>
                <OrgWebinars />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.WEBINAR_DETAILS}
            element={
              <SuspenseWrapper>
                <OrgWebinarDetails />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.WEBINAR_CALENDAR}
            element={
              <SuspenseWrapper>
                <OrgWebinarsCalendar />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.SETTINGS}
            element={
              <PermissionGuard permission="settings">
                <SuspenseWrapper>
                  <OrganizationSettingsPage />
                </SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.ORG_ADMIN.CHANGE_PASSWORD}
            element={
              <SuspenseWrapper>
                <ProfileChangePassword />
              </SuspenseWrapper>
            }
          />
        </Route>

        {/* HR Settings is shared by Organization Admin and permitted HR users. */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path={ROUTES.EMPLOYEE.HR_SETTINGS}
            element={
              <HrRouteGuard module="settings" action="edit" allowOrganizationAdmin>
                <SuspenseWrapper>
                  <HRSettings />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
        </Route>

        {/* EMPLOYEE MODULE */}
        <Route
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={["employee"]}>
                <DashboardLayout />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        >
          <Route
            path={ROUTES.EMPLOYEE.ROOT}
            element={<Navigate to={ROUTES.EMPLOYEE.DASHBOARD} replace />}
          />
          <Route
            path={ROUTES.EMPLOYEE.DASHBOARD}
            element={<EmployeeDashboardEntry />}
          />
          {/* Legacy /hr URLs stay compatible, but there is only one HR workspace. */}
          <Route path={ROUTES.HR.ROOT} element={<Navigate to={ROUTES.EMPLOYEE.HR_DASHBOARD} replace />} />
          <Route path={ROUTES.HR.DASHBOARD} element={<Navigate to={ROUTES.EMPLOYEE.HR_DASHBOARD} replace />} />
          <Route path={ROUTES.HR.EMPLOYEES} element={<Navigate to={ROUTES.EMPLOYEE.HR_EMPLOYEES} replace />} />
          <Route path={ROUTES.HR.EMPLOYEE_DETAILS} element={<Navigate to={ROUTES.EMPLOYEE.HR_EMPLOYEES} replace />} />
          <Route path={ROUTES.HR.ATTENDANCE} element={<Navigate to={ROUTES.EMPLOYEE.HR_ATTENDANCE} replace />} />
          <Route path={ROUTES.HR.LEAVE} element={<Navigate to={ROUTES.EMPLOYEE.HR_LEAVE} replace />} />
          <Route path={ROUTES.HR.RECRUITMENT} element={<Navigate to={ROUTES.EMPLOYEE.HR_RECRUITMENT} replace />} />
          <Route path={ROUTES.HR.CANDIDATE_DETAILS} element={<Navigate to={ROUTES.EMPLOYEE.HR_RECRUITMENT} replace />} />
          <Route path={ROUTES.HR.DOCUMENTS} element={<Navigate to={ROUTES.EMPLOYEE.HR_DOCUMENTS} replace />} />
          <Route path={ROUTES.HR.REPORTS} element={<Navigate to={ROUTES.EMPLOYEE.HR_REPORTS} replace />} />
          <Route path={ROUTES.HR.PROFILE} element={<Navigate to={ROUTES.EMPLOYEE.PROFILE} replace />} />
          <Route
            path={ROUTES.EMPLOYEE.MY_LEARNING}
            element={
              <SuspenseWrapper>
                <EmployeeMyLearning />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.BATCHES}
            element={
              <SuspenseWrapper>
                <EmployeeBatches />
              </SuspenseWrapper>
            }
          />
          <Route path="/employee/hr-employees/:employeeId" element={<HrRouteGuard module="employees"><SuspenseWrapper><HREmployeeDetails /></SuspenseWrapper></HrRouteGuard>} />
          <Route path="/employee/batches/:batchId" element={<HrRouteGuard module="batches"><SuspenseWrapper><HRBatchDetails /></SuspenseWrapper></HrRouteGuard>} />
          <Route
            path={ROUTES.EMPLOYEE.TODAY_SCHEDULE}
            element={
              <SuspenseWrapper>
                <EmployeeClassSchedule />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.LIVE_CLASSES}
            element={
              <SuspenseWrapper>
                <EmployeeLiveClasses />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.RECORDED_SESSIONS}
            element={
              <SuspenseWrapper>
                <EmployeeRecordedSessions />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.ASSIGNMENTS}
            element={
              <SuspenseWrapper>
                <EmployeeAssignments />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.ASSESSMENTS}
            element={
              <SuspenseWrapper>
                <EmployeeAssessments />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.ATTENDANCE}
            element={
              <SuspenseWrapper>
                <EmployeeAttendance />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.LEAVE}
            element={
              <SuspenseWrapper>
                <EmployeeLeaveRequests />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.PERFORMANCE}
            element={
              <SuspenseWrapper>
                <EmployeePerformance />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.SKILLS}
            element={
              <SuspenseWrapper>
                <EmployeeSkills />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.GOALS}
            element={
              <SuspenseWrapper>
                <EmployeeGoals />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.CAREER}
            element={
              <SuspenseWrapper>
                <EmployeeCareer />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.AI_CAREER_COACH}
            element={
              <SuspenseWrapper>
                <EmployeeAICareerCoach />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.CERTIFICATES}
            element={
              <SuspenseWrapper>
                <EmployeeCertificates />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.REPORTS}
            element={
              <SuspenseWrapper>
                <EmployeeReports />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.RESOURCES}
            element={
              <SuspenseWrapper>
                <EmployeeResources />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.CALENDAR}
            element={
              <SuspenseWrapper>
                <EmployeeCalendar />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.MESSAGES}
            element={
              <SuspenseWrapper>
                <EmployeeMessages />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.NOTIFICATIONS}
            element={
              <SuspenseWrapper>
                <EmployeeNotifications />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.ANNOUNCEMENTS}
            element={
              <SuspenseWrapper>
                <EmployeeAnnouncements />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.REVIEWS}
            element={
              <SuspenseWrapper>
                <EmployeeReviews />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.PROFILE}
            element={
              <SuspenseWrapper>
                <EmployeeProfile />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.SETTINGS}
            element={
              <SuspenseWrapper>
                <EmployeeSettings />
              </SuspenseWrapper>
            }
          />
          {/* Legacy learning route kept for backward compatibility */}
          <Route
            path={ROUTES.EMPLOYEE.LEARNING}
            element={
              <SuspenseWrapper>
                <EmployeeMyLearning />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.LEARNING_PLAYER}
            element={
              <SuspenseWrapper>
                <EmployeeCoursePlayer />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.SYLLABUS}
            element={
              <SuspenseWrapper>
                <EmployeeSyllabus />
              </SuspenseWrapper>
            }
          />
          {/* RBAC UPGRADE — HR/Operations employee-department dashboards, gated by PermissionGuard on top of the existing employee RoleBasedRoute */}
          <Route
            path="/employee/students/:studentId"
            element={<HrRouteGuard module="students"><SuspenseWrapper><HRStudentDetails /></SuspenseWrapper></HrRouteGuard>}
          />
          <Route
            path="/employee/students"
            element={
              <HrRouteGuard module="students">
                <SuspenseWrapper><HrStudentManagement /></SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_DASHBOARD}
            element={
              <HrRouteGuard module="dashboard">
                <SuspenseWrapper>
                  <HRDashboard />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.OPERATIONS_DASHBOARD}
            element={
              <PermissionGuard permission="operations-dashboard">
                <SuspenseWrapper>
                  <OperationsDashboard />
                </SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_WORK_CENTER}
            element={
              <HrRouteGuard module="dashboard">
                <SuspenseWrapper>
                  <HRWorkspace />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_WORKSPACE}
            element={
              <HrRouteGuard module="dashboard">
                <SuspenseWrapper>
                  <HRWorkspace />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          {/* NAV FIX — each HR/Operations sidebar item now has its own unique route instead of pointing back at the dashboard */}
          <Route
            path={ROUTES.EMPLOYEE.HR_EMPLOYEES}
            element={
              <HrRouteGuard module="employees">
                <SuspenseWrapper>
                  <HREmployees />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_LEAVE}
            element={
              <HrRouteGuard module="leave">
                <SuspenseWrapper>
                  <HRLeave />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={`${ROUTES.EMPLOYEE.HR_LEAVE}/employee/:employeeId`}
            element={
              <HrRouteGuard module="leave">
                <SuspenseWrapper>
                  <HREmployeeLeaveDetails />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_PAYROLL}
            element={
              <HrRouteGuard module="payroll">
                <SuspenseWrapper>
                  <HRPayroll />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_RECRUITMENT}
            element={
              <HrRouteGuard module="recruitment">
                <SuspenseWrapper>
                  <HRRecruitment />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_MENTORS}
            element={
              <HrRouteGuard module="mentors">
                <Navigate
                  to={`${ROUTES.EMPLOYEE.HR_EMPLOYEES}?role=mentor`}
                  replace
                />
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_ONBOARDING}
            element={
              <HrRouteGuard module="onboarding">
                <SuspenseWrapper>
                  <HROnboarding />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_SYLLABUS}
            element={
              <HrRouteGuard module="syllabus" action="assign" allowOrganizationAdmin>
                <SuspenseWrapper>
                  <HRSyllabusAssignments />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_ATTENDANCE}
            element={
              <HrRouteGuard module="attendance"><SuspenseWrapper><HRAttendance /></SuspenseWrapper></HrRouteGuard>
            }
          />
          <Route
            path={`${ROUTES.EMPLOYEE.HR_ATTENDANCE}/employee/:employeeId`}
            element={<HrRouteGuard module="attendance"><SuspenseWrapper><HREmployeeAttendanceDetails /></SuspenseWrapper></HrRouteGuard>}
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_SHIFTS}
            element={
              <HrRouteGuard module="shifts">
                <SuspenseWrapper>
                  <HRShifts />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_HOLIDAYS}
            element={
              <HrRouteGuard module="holidays">
                <SuspenseWrapper>
                  <HRHolidays />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_PAYSLIPS}
            element={
              <HrRouteGuard module="payslips">
                <SuspenseWrapper>
                  <HRPayslips />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_PERFORMANCE}
            element={
              <HrRouteGuard module="performance">
                <SuspenseWrapper>
                  <HRPerformance />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_APPRAISAL}
            element={
              <HrRouteGuard module="appraisal">
                <SuspenseWrapper>
                  <HRAppraisal />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_ASSETS}
            element={
              <HrRouteGuard module="assets">
                <SuspenseWrapper>
                  <HRAssets />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_DOCUMENTS}
            element={
              <HrRouteGuard module="documents"><SuspenseWrapper><HRDocuments /></SuspenseWrapper></HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_EXIT}
            element={
              <HrRouteGuard module="exit">
                <SuspenseWrapper>
                  <HRExit />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_TICKETS}
            element={
              <HrRouteGuard module="tickets">
                <SuspenseWrapper>
                  <HRTickets />
                </SuspenseWrapper>
              </HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.HR_REPORTS}
            element={
              <HrRouteGuard module="reports"><SuspenseWrapper><HRReports /></SuspenseWrapper></HrRouteGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.OPERATIONS_ADMISSIONS}
            element={
              <PermissionGuard permission="admissions">
                <SuspenseWrapper>
                  <HRWorkQueue mode="admissions" />
                </SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.OPERATIONS_ENROLLMENTS}
            element={
              <PermissionGuard permission="enrollments">
                <SuspenseWrapper>
                  <HRWorkQueue mode="enrollments" />
                </SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.OPERATIONS_STUDENT_SUPPORT}
            element={
              <PermissionGuard permission="student-support">
                <SuspenseWrapper>
                  <HRWorkQueue mode="support" />
                </SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.EMPLOYEE.OPERATIONS_SCHEDULING}
            element={
              <PermissionGuard permission="scheduling">
                <SuspenseWrapper>
                  <HRWorkQueue mode="scheduling" />
                </SuspenseWrapper>
              </PermissionGuard>
            }
          />
        </Route>

        {/* MENTOR MODULE */}
        <Route
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={["mentor"]}>
                <DashboardLayout />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        >
          <Route
            path={ROUTES.MENTOR.ROOT}
            element={<Navigate to={ROUTES.MENTOR.DASHBOARD} replace />}
          />
          <Route
            path={ROUTES.MENTOR.DASHBOARD}
            element={
              <PermissionGuard permission="dashboard">
                <SuspenseWrapper>
                  <MentorDashboard />
                </SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR.PROFILE}
            element={
              <PermissionGuard permission="employee-profile">
                <SuspenseWrapper><MentorProfile /></SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR.COURSES}
            element={
              <PermissionGuard permission="courses">
                <SuspenseWrapper><MentorCourses /></SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR.SYLLABUS}
            element={
              <PermissionGuard permission="syllabus">
                <SuspenseWrapper><AssignedSyllabus recipientType="mentor" /></SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR.STUDENTS}
            element={
              <PermissionGuard permission="students">
                <SuspenseWrapper><MentorStudents /></SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR.STUDENT_WORKSPACE}
            element={
              <PermissionGuard permission="students">
                <SuspenseWrapper><MentorStudentWorkspace /></SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR.BATCH_STUDENT_DETAILS}
            element={
              <PermissionGuard permission="batches">
                <SuspenseWrapper><MentorBatchStudentDetails /></SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR.BATCHES}
            element={
              <PermissionGuard permission="batches">
                <SuspenseWrapper><MentorBatches /></SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR.BATCH_WORKSPACE}
            element={
              <PermissionGuard permission="batches">
                <SuspenseWrapper><MentorBatchWorkspace /></SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR.LIVE_CLASSES}
            element={
              <PermissionGuard permission="live-classes">
                <SuspenseWrapper><MentorLiveClasses /></SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR.RECORDED_SESSIONS}
            element={
              <SuspenseWrapper>
                <MentorRecordedSessions />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.MENTOR.ASSIGNMENTS}
            element={
              <SuspenseWrapper>
                <MentorAssignments />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.MENTOR.ASSESSMENTS}
            element={
              <SuspenseWrapper>
                <MentorAssessments />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.MENTOR.PERFORMANCE}
            element={<Navigate to={ROUTES.MENTOR.STUDENTS} replace />}
          />
          <Route
            path={ROUTES.MENTOR.CALENDAR}
            element={
              // "classes" has no corresponding backend module (Swagger-confirmed
              // 10-module catalog: dashboard/employees/courses/batches/attendance/
              // assessments/reports/live-classes/employee-profile/students) — it
              // could never be granted by any organization. This calendar view is
              // the mentor's class-scheduling surface, so it's gated by the real
              // module it actually represents: live-classes.
              <PermissionGuard permission="live-classes">
                <SuspenseWrapper><MentorCalendar /></SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR.ATTENDANCE}
            element={
              <PermissionGuard permission="attendance">
                <SuspenseWrapper><MentorAttendance /></SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR.LEAVE}
            element={
              <SuspenseWrapper>
                <EmployeeLeaveRequests audience="mentor" />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.MENTOR.WEBINARS_MEETINGS}
            element={
              <SuspenseWrapper>
                <MentorWebinarsMeetings />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.MENTOR.WEBINAR_MEETING_DETAILS}
            element={
              <SuspenseWrapper>
                <MentorWebinarMeetingDetails />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.MENTOR.MESSAGES}
            element={
              <SuspenseWrapper>
                <MentorMessages />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.MENTOR.REPORTS}
            element={
              <PermissionGuard permission="reports">
                <SuspenseWrapper><MentorReports /></SuspenseWrapper>
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR.NOTIFICATIONS}
            element={
              <SuspenseWrapper>
                <MentorNotifications />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.MENTOR.RESOURCES}
            element={<Navigate to={`${ROUTES.MENTOR.COURSES}?tab=materials`} replace />}
          />
          <Route
            path={ROUTES.MENTOR.SETTINGS}
            element={
              <PermissionGuard permission="settings">
                <SuspenseWrapper><MentorSettings /></SuspenseWrapper>
              </PermissionGuard>
            }
          />
        </Route>

        {/* STUDENT MODULE */}
        <Route
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={["student"]}>
                <DashboardLayout />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        >
          <Route
            path={ROUTES.STUDENT.ROOT}
            element={<Navigate to={ROUTES.STUDENT.DASHBOARD} replace />}
          />
          <Route
            path={ROUTES.STUDENT.DASHBOARD}
            element={
              <SuspenseWrapper>
                <StudentDashboard />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.WORK_CENTER}
            element={
              <SuspenseWrapper>
                <StudentWorkCenter />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.MY_CLASSES}
            element={
              <SuspenseWrapper>
                <StudentMyClasses />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.CLASS_JOIN}
            element={
              <SuspenseWrapper>
                <StudentLiveClassroom />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.CALENDAR}
            element={
              <SuspenseWrapper>
                <StudentCalendar />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.ATTENDANCE}
            element={
              <SuspenseWrapper>
                <StudentAttendance />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.LIVE_CLASSES}
            element={<Navigate to={ROUTES.STUDENT.MY_CLASSES} replace />}
          />
          <Route
            path={ROUTES.STUDENT.COURSES}
            element={
              <SuspenseWrapper>
                <StudentCourses />
              </SuspenseWrapper>
            }
          />
          <Route path={ROUTES.STUDENT.BATCH} element={<SuspenseWrapper><StudentMyBatch /></SuspenseWrapper>} />
          <Route path={ROUTES.STUDENT.CLASS_SCHEDULE} element={<SuspenseWrapper><StudentCalendar /></SuspenseWrapper>} />
          <Route path={ROUTES.STUDENT.RECORDINGS} element={<SuspenseWrapper><StudentRecordings /></SuspenseWrapper>} />
          <Route path={ROUTES.STUDENT.SYLLABUS} element={<Navigate to={ROUTES.STUDENT.COURSES} replace />} />
          <Route path={ROUTES.STUDENT.MATERIALS} element={<SuspenseWrapper><StudentCourseMaterials /></SuspenseWrapper>} />
          <Route path={ROUTES.STUDENT.QUIZZES} element={<Navigate to={ROUTES.STUDENT.ASSESSMENTS} replace />} />
          <Route path={ROUTES.STUDENT.PROGRESS} element={<SuspenseWrapper><StudentProgress /></SuspenseWrapper>} />
          <Route path={ROUTES.STUDENT.PAYMENTS} element={<SuspenseWrapper><StudentPayments /></SuspenseWrapper>} />
          <Route
            path="/student/courses/:courseId/classes/:classId/videos"
            element={
              <SuspenseWrapper>
                <StudentVideoLesson />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/student/courses/:courseId/classes/:classId/assignment"
            element={
              <SuspenseWrapper>
                <StudentAssignmentPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/student/courses/:courseId/classes/:classId/results/:attemptId"
            element={
              <SuspenseWrapper>
                <StudentCourseResultPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.COURSE_PLAYER}
            element={
              <SuspenseWrapper>
                <StudentCoursePlayer />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.LEARNING_PATHS}
            element={
              <SuspenseWrapper>
                <StudentLearningPaths />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.ASSESSMENTS}
            element={
              <SuspenseWrapper>
                <AssessmentsList />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/student/assessments/:id"
            element={
              <SuspenseWrapper>
                <AssessmentDetails />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.ASSESSMENT_DETAILS}
            element={
              <SuspenseWrapper>
                <AssessmentDetails />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.ASSESSMENT_INSTRUCTIONS}
            element={
              <SuspenseWrapper>
                <AssessmentInstructions />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.ASSESSMENT_LIVE}
            element={
              <SuspenseWrapper>
                <LiveAssessment />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.ASSESSMENT_EVALUATION}
            element={
              <SuspenseWrapper>
                <AssessmentEvaluation />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.ASSESSMENT_RESULTS}
            element={
              <SuspenseWrapper>
                <AssessmentResults />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.ASSESSMENT_CERTIFICATE}
            element={
              <SuspenseWrapper>
                <AssessmentCertificate />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.ASSESSMENT_ANALYTICS}
            element={
              <SuspenseWrapper>
                <AssessmentAnalytics />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.CERTIFICATES}
            element={
              <SuspenseWrapper>
                <StudentCertificates />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.JOB_PORTAL}
            element={
              <SuspenseWrapper>
                <StudentJobPortal />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.AI_CAREER_COACH}
            element={
              <SuspenseWrapper>
                <StudentAICareerCoach />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.MENTOR_CHAT}
            element={
              <SuspenseWrapper>
                <StudentMentorChat />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.NOTIFICATIONS}
            element={
              <SuspenseWrapper>
                <StudentNotifications />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.PROFILE}
            element={
              <SuspenseWrapper>
                <StudentProfile />
              </SuspenseWrapper>
            }
          />
          <Route
            path={ROUTES.STUDENT.SETTINGS}
            element={
              <SuspenseWrapper>
                <StudentSettings />
              </SuspenseWrapper>
            }
          />
        </Route>

        {/* 404 Catch-all */}
        <Route
          path="*"
          element={
            <SuspenseWrapper>
              <NotFound />
            </SuspenseWrapper>
          }
        />
      </Routes>
    </>
  );
};

export default AppRoutes;
