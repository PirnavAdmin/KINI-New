// Copy for the public landing page. Every item describes a feature that exists
// in this app (a route or a portal screen); nothing here is a metric, partner,
// mentor or testimonial, because the backend does not supply verified ones yet.
// Artwork is the Kini student-portal illustration set in public/assets.
import {
  Award,
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Layers3,
  MessagesSquare,
  MonitorPlay,
  NotebookPen,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react";

const ART = "/assets/StudentBanners";

// Hero benefits. Each line maps to a real screen: /courses and
// /course-curriculum, the student class schedule and class assignments, and
// the public /practice-tests, /interview-guides and /resume-builder.
export const HERO_BENEFITS = [
  "Live classes with your batch",
  "Module-by-module curriculum",
  "Assignments and practice tests",
  "Interview guides and resume builder",
];

export const CAPABILITIES = [
  { icon: Layers3, title: "Module-based curriculum", detail: "See every module before you enrol" },
  { icon: MonitorPlay, title: "Live sessions", detail: "Scheduled classes with an instructor" },
  { icon: FolderOpen, title: "Course materials", detail: "Notes, PDFs and code per module" },
  { icon: ClipboardCheck, title: "Assessments", detail: "Check your understanding as you go" },
  { icon: FileText, title: "Career tools", detail: "Resume builder and interview prep" },
];

export const EXPERIENCE_ART = `${ART}/myBatchBanner.webp`;

export const EXPERIENCE_POINTS = [
  {
    icon: Layers3,
    title: "A structured curriculum",
    body: "Each course is broken into modules, so you always know what you are learning now and what comes next.",
  },
  {
    icon: Users,
    title: "Batch-based learning",
    body: "You learn alongside a batch on a shared schedule, which keeps you moving at a steady pace.",
  },
  {
    icon: MonitorPlay,
    title: "Live, instructor-led classes",
    body: "Sessions run live and you join them from your student portal, with recordings when your instructor shares them.",
  },
  {
    icon: NotebookPen,
    title: "Practice that is checked",
    body: "Assignments and assessments follow the modules, and your results stay in your account.",
  },
];

// The student portal, screen by screen. Each tab maps to a real student route.
export const PORTAL_TABS = [
  {
    id: "classes",
    label: "Live classes",
    icon: CalendarClock,
    image: `${ART}/dashboardBanner.webp`,
    fit: "contain",
    title: "Your class schedule, one click from live",
    body: "Upcoming sessions for your batch are listed in your class schedule. Join from the portal when it is time, and catch up later in Recordings.",
    points: ["Class schedule for your batch", "Join live sessions from the portal", "Recordings when shared by your instructor"],
  },
  {
    id: "materials",
    label: "Course materials",
    icon: FolderOpen,
    image: `${ART}/courseMaterialsBanner.webp`,
    title: "Everything for a module in one place",
    body: "Notes, documents and code resources are organised by course and module, so revision does not start with a search.",
    points: ["Organised by course and module", "Documents, PDFs and code files", "Available whenever you need them"],
  },
  {
    id: "assessments",
    label: "Assessments",
    icon: ClipboardCheck,
    image: `${ART}/assessmentsBanner.webp`,
    title: "Practise, get checked, improve",
    body: "Assessments sit alongside the curriculum. Attempt them in the portal and review your results afterwards.",
    points: ["Assessments linked to your course", "Results saved to your account", "Coding practice for programming topics"],
  },
  {
    id: "progress",
    label: "Progress",
    icon: BarChart3,
    image: `${ART}/progressBanner.webp`,
    title: "See how far you have come",
    body: "Your progress and attendance are tracked as you move through the course, so you can spot gaps early.",
    points: ["Course progress at a glance", "Attendance history", "Clear view of what is left"],
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: Award,
    image: `${ART}/certificatesBanner.webp`,
    title: "Your certificates, ready to share",
    body: "Certificates you earn are listed in the Certificates section of your student portal, where you can view and download them.",
    points: ["Listed in your portal", "View and download", "Linked to the course you completed"],
  },
];

export const JOURNEY_STEPS = [
  { icon: Search, title: "Discover a course", body: "Compare courses, durations and fees, and read the full module list." },
  { icon: ShoppingCart, title: "Enrol securely", body: "Add the course to your cart and complete checkout with your student account." },
  { icon: Users, title: "Learn with your batch", body: "Join live classes on your batch schedule from the student portal." },
  { icon: NotebookPen, title: "Practise every module", body: "Work through assignments and assessments and review your results." },
  { icon: BriefcaseBusiness, title: "Prepare for interviews", body: "Build your resume and practise with guides and tests." },
];

export const CAREER_ART = `${ART}/profileBanner.webp`;

export const CAREER_TOOLS = [
  {
    icon: FileText,
    title: "Resume Builder",
    body: "Create a clean, ATS-friendly resume and download it when you are ready to apply.",
    to: "/resume-builder",
    cta: "Build your resume",
  },
  {
    icon: MessagesSquare,
    title: "Interview Guides",
    body: "Topic-wise guides that walk through commonly asked interview questions.",
    to: "/interview-guides",
    cta: "Read the guides",
  },
  {
    icon: BookOpenCheck,
    title: "Practice Tests",
    body: "Test yourself on core topics and find what needs more practice before an interview.",
    to: "/practice-tests",
    cta: "Take a practice test",
  },
];

export const FAQ_GROUPS = [
  {
    id: "enrolment",
    label: "Enrolment & fees",
    items: [
      {
        q: "How do I enrol in a course?",
        a: "Open a course to see its curriculum, then add it to your cart and complete checkout. You will be asked to sign in or create a student account if you have not already.",
      },
      {
        q: "Where can I see the course fee?",
        a: "The fee is shown on each course card and again at checkout. If a course says “Contact for fee”, send us a message from the contact page and our team will share the details.",
      },
      {
        q: "I am not sure which course is right for me. Who can I ask?",
        a: "Use the contact form and tell us about your background and goals. Our team will get back to you.",
      },
    ],
  },
  {
    id: "learning",
    label: "Classes & learning",
    items: [
      {
        q: "Are the classes live or recorded?",
        a: "Classes run as scheduled live sessions. Once you are enrolled and assigned to a batch, you join them from your student portal, where the class schedule is listed. Recordings appear in the portal when your instructor shares them.",
      },
      {
        q: "How is my learning checked?",
        a: "Courses include assignments and assessments. You attempt them in the student portal and your results are saved to your account.",
      },
      {
        q: "Will I receive a certificate?",
        a: "Certificates you earn are listed in the Certificates section of your student portal, where you can view and download them.",
      },
    ],
  },
  {
    id: "account",
    label: "Account & tools",
    items: [
      {
        q: "What do I get access to after enrolling?",
        a: "Your student dashboard gives you the course modules, live class schedule, course materials, assessments and progress, plus the career tools.",
      },
      {
        q: "Can I use the career tools without enrolling?",
        a: "Yes. The resume builder, interview guides and practice tests are open to everyone from the links on this page.",
      },
      {
        q: "I already have an account. Where do I sign in?",
        a: "Use the Sign in option in the top navigation, or go straight to the student sign-in page.",
      },
    ],
  },
];

// The three Kini portals. Each links to that portal's existing sign-in route.
export const PLATFORM_ROLES = [
  {
    id: "institutes",
    eyebrow: "For institutes & organisations",
    title: "Run courses, batches and people from one admin portal",
    body: "Organisation admins manage courses, batches, students and mentors, and keep track of attendance, assessments and certificates.",
    points: ["Courses & batches", "Students & mentors", "Attendance & assessments", "Certificates"],
    image: "/assets/Hr/web/hr-batches.webp",
    alt: "A Kini mentor guiding three students at a desk, with panels for live mentoring, upcoming sessions and learning progress",
    to: "/organization/login",
    cta: "Organisation sign in",
  },
  {
    id: "students",
    eyebrow: "For students",
    title: "Learn, practise and track progress",
    body: "Your classes, materials, assessments and certificates in the student portal.",
    image: "/assets/StudentBanners/myCoursesBanner.webp",
    alt: "A Kini student typing on a laptop at a desk",
    to: "/login",
    cta: "Student sign in",
  },
  {
    id: "mentors",
    eyebrow: "For mentors",
    title: "Teach your batches and review student work",
    body: "Mentors run classes, manage batches and follow each student's work from the mentor portal.",
    image: "/assets/MentorsBnners/web/mentor-batches.webp",
    alt: "A Kini mentor working on a laptop next to a course dashboard",
    to: "/mentor/login",
    cta: "Mentor sign in",
  },
];

export const CTA_POINTS = [
  "Module-based curriculum you can read before enrolling",
  "Live classes with your batch and instructor",
  "Assessments, progress and certificates in one portal",
  "Resume builder, interview guides and practice tests",
];
