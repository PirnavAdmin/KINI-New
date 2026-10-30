export const ORG_METRICS = [
  {
    key: "enrollments",
    label: "Total Students",
    value: "1,248",
    note: "+8.2% vs last month",
    tone: "blue",
    icon: "students",
    path: "/organization/students",
  },
  {
    key: "students",
    label: "Active Students",
    value: "1,106",
    note: "88.6% of total",
    tone: "teal",
    icon: "active",
    path: "/organization/students?status=active",
  },
  {
    key: "trainers",
    label: "Mentors",
    value: "32",
    note: "28 active · 2 unavailable today",
    tone: "teal",
    icon: "trainers",
    path: "/organization/mentors",
  },
  {
    key: "employees",
    label: "Employees",
    value: "46",
    note: "46 total · 43 active",
    tone: "blue",
    icon: "employees",
    path: "/organization/employees",
  },
  {
    key: "batches",
    label: "Active Batches",
    value: "24",
    note: "3 ending soon",
    tone: "blue",
    icon: "batches",
    path: "/organization/batches",
  },
  {
    key: "classes",
    label: "Classes Today",
    value: "12",
    note: "2 require attention",
    tone: "amber",
    icon: "classes",
    path: "/organization/live-classes?view=today",
  },
  {
    key: "revenue",
    label: "Revenue Collected",
    value: "₹8.45L",
    note: "₹10.00L billed · 84.5% collected",
    tone: "blue",
    icon: "revenue",
    path: "/organization/finance?tab=overview",
  },
  {
    key: "payments",
    label: "Pending Payments",
    value: "₹1.55L",
    note: "23 students",
    tone: "rose",
    icon: "pending",
    path: "/organization/finance?tab=pending",
  },
];

export const TODAY_CLASSES = [
  {
    course: "React Fundamentals",
    batch: "React Morning · RF-03",
    time: "10:00–11:30 AM",
    trainer: "Rahul",
    students: "28/30 present",
    status: "Live now",
    room: "Online · Zoom",
    state: "live",
    action: "View class",
  },
  {
    course: "Python Basics",
    batch: "Python Basics · PB-04",
    time: "11:00–12:30 PM",
    trainer: "No mentor assigned",
    students: "24 enrolled",
    status: "Needs mentor",
    room: "Lab 201",
    state: "issue",
    action: "Assign mentor",
  },
  {
    course: "Node.js APIs",
    batch: "Node Afternoon · NA-02",
    time: "2:00–3:30 PM",
    trainer: "Priya",
    students: "22/25 enrolled",
    status: "Starts in 4h",
    room: "Online · Meet",
    state: "upcoming",
    action: "View class",
  },
  {
    course: "Data Science",
    batch: "Data Science Evening · DS-06",
    time: "6:00–7:30 PM",
    trainer: "Ankit",
    students: "18/20 enrolled",
    status: "Upcoming",
    room: "Room A-12",
    state: "upcoming",
    action: "View class",
  },
];

export const APPROVALS = [
  {
    id: 1,
    name: "Anjali Sharma",
    course: "Full Stack Development",
    time: "2 hours ago",
    sla: "Pending 2h",
    docs: [
      ["ID", true],
      ["Photo", true],
      ["Certificate", false],
    ],
  },
  {
    id: 2,
    name: "Kiran Mehta",
    course: "Data Science",
    time: "3 hours ago",
    sla: "Pending 3h",
    docs: [
      ["ID", true],
      ["Photo", true],
      ["Certificate", true],
    ],
  },
  {
    id: 3,
    name: "Rohan Verma",
    course: "UI/UX Design",
    time: "5 hours ago",
    sla: "Pending 5h",
    docs: [
      ["ID", false],
      ["Photo", true],
      ["Certificate", false],
    ],
  },
];

export const ATTENDANCE_TREND = [
  { day: "Wed", present: 91, absent: 9 },
  { day: "Thu", present: 93, absent: 7 },
  { day: "Fri", present: 88, absent: 12 },
  { day: "Sat", present: 95, absent: 5 },
  { day: "Sun", present: 84, absent: 16 },
  { day: "Mon", present: 94, absent: 6 },
  { day: "Tue", present: 96, absent: 4 },
];

export const STUDENT_PROGRESS = [
  { name: "On Track", value: 68, count: 850, color: "#0AAA8F" },
  { name: "Needs Attention", value: 22, count: 274, color: "#F59E0B" },
  { name: "At Risk", value: 10, count: 124, color: "#EF4444" },
];

export const REVENUE_TREND = [
  { month: "Apr", value: 6.1, growth: "+13.0%" },
  { month: "May", value: 5.8, growth: "-4.9%" },
  { month: "Jun", value: 7.2, growth: "+24.1%" },
  { month: "Jul", value: 7.5, growth: "+4.2%" },
  { month: "Aug", value: 8.45, growth: "+12.8%" },
];

export const AT_RISK_STUDENTS = [
  {
    name: "Pooja Singh",
    course: "Full Stack Dev · MERN M1",
    attendance: 42,
    progress: 35,
    active: "8 days ago",
    reason: "Low attendance",
    risk: "High Risk",
  },
  {
    name: "Arjun Kumar",
    course: "Data Science · DS A",
    attendance: 55,
    progress: 48,
    active: "5 days ago",
    reason: "Low progress",
    risk: "Medium Risk",
  },
  {
    name: "Meera Nair",
    course: "React Course · React B",
    attendance: 48,
    progress: 52,
    active: "3 days ago",
    reason: "Inactive 3 days",
    risk: "High Risk",
  },
];

export const BATCH_PERFORMANCE = [
  {
    batch: "MERN Morning",
    students: 30,
    attendance: 92,
    progress: 78,
    trainer: "Rahul",
    status: "Healthy",
  },
  {
    batch: "Python A",
    students: 25,
    attendance: 81,
    progress: 71,
    trainer: "Priya",
    status: "Monitor",
  },
  {
    batch: "Data Science",
    students: 28,
    attendance: 75,
    progress: 62,
    trainer: "Ankit",
    status: "Needs Attention",
  },
];

export const RECENT_PAYMENTS = [
  {
    student: "Kavya Patel",
    course: "MERN Stack",
    amount: "₹15,000",
    type: "EMI",
    date: "Today",
    status: "Paid",
  },
  {
    student: "Rahul Verma",
    course: "Data Science",
    amount: "₹22,000",
    type: "Full Payment",
    date: "Yesterday",
    status: "Paid",
  },
  {
    student: "Neha Sharma",
    course: "Python",
    amount: "₹7,500",
    type: "EMI",
    date: "Yesterday",
    status: "Pending",
  },
];

export const RECENT_ACTIVITY = [
  {
    type: "certificate",
    text: "Certificate issued to Kavya Patel",
    time: "8 min ago",
    path: "/organization/certificates?student=Kavya%20Patel",
  },
  {
    type: "student",
    text: "Student registration approved",
    time: "24 min ago",
    path: "/organization/approvals?status=approved",
  },
  {
    type: "alert",
    text: "Mentor marked absent for Python Basics",
    time: "42 min ago",
    path: "/organization/attendance?course=Python%20Basics&status=absent",
  },
  {
    type: "payment",
    text: "Payment received from Arjun Kumar",
    time: "1 hour ago",
    path: "/organization/finance?tab=payment-history&student=Arjun%20Kumar",
  },
  {
    type: "batch",
    text: "New batch “React Aug Batch” created",
    time: "2 hours ago",
    path: "/organization/batches?batch=React%20Aug%20Batch",
  },
];
