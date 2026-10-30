// ═══════════════════════════════════════════════════════════════════
// SUPER ADMIN PAGES — Mock Data
// ═══════════════════════════════════════════════════════════════════
//
// TODO: API Integration — Replace with API calls
// =================================

// ─────────────────────────────────────────────────────────────────
// ORGANIZATIONS
// ─────────────────────────────────────────────────────────────────

export const ORG_STATS = {
  total: 128,
  active: 104,
  trial: 16,
  expired: 8,
  growth: 18.5,
  totalEmployees: 45230,
  monthlyRevenue: 284500,
}

export const ORGANIZATIONS = [
  { id: 'org-001', name: 'Acme Corp', industry: 'Technology', size: 'Large (500+)', country: 'United States', employees: 843, subscription: 'Enterprise', status: 'active', createdDate: 'Jan 15, 2024', email: 'admin@acmecorp.com', phone: '+1 (555) 000-1001', plan: 'Enterprise', amount: 24999, expiryDate: 'Jan 15, 2025' },
  { id: 'org-002', name: 'Globex Inc', industry: 'Finance', size: 'Large (500+)', country: 'United Kingdom', employees: 1250, subscription: 'Professional', status: 'active', createdDate: 'Feb 3, 2024', email: 'admin@globex.com', phone: '+44 20 7946 0002', plan: 'Professional', amount: 9999, expiryDate: 'Feb 3, 2025' },
  { id: 'org-003', name: 'Initech', industry: 'Manufacturing', size: 'Medium (200-500)', country: 'Germany', employees: 520, subscription: 'Starter', status: 'active', createdDate: 'Mar 12, 2024', email: 'admin@initech.de', phone: '+49 30 1234 0003', plan: 'Starter', amount: 4999, expiryDate: 'Mar 12, 2025' },
  { id: 'org-004', name: 'Hooli', industry: 'Technology', size: 'Enterprise (1000+)', country: 'United States', employees: 2100, subscription: 'Enterprise', status: 'active', createdDate: 'Apr 8, 2024', email: 'admin@hooli.com', phone: '+1 (555) 000-1004', plan: 'Enterprise', amount: 34999, expiryDate: 'Apr 8, 2025' },
  { id: 'org-005', name: 'Umbrella Corp', industry: 'Healthcare', size: 'Medium (200-500)', country: 'Japan', employees: 980, subscription: 'Professional', status: 'suspended', createdDate: 'May 20, 2024', email: 'admin@umbrella.co.jp', phone: '+81 3 1234 0005', plan: 'Professional', amount: 9999, expiryDate: 'May 20, 2025' },
  { id: 'org-006', name: 'Stark Industries', industry: 'Defense', size: 'Enterprise (1000+)', country: 'United States', employees: 3200, subscription: 'Enterprise', status: 'active', createdDate: 'Jun 5, 2024', email: 'admin@stark.com', phone: '+1 (555) 000-1006', plan: 'Enterprise', amount: 49999, expiryDate: 'Jun 5, 2025' },
  { id: 'org-007', name: 'Wayne Enterprises', industry: 'Conglomerate', size: 'Enterprise (1000+)', country: 'United States', employees: 5800, subscription: 'Enterprise', status: 'active', createdDate: 'Jul 18, 2024', email: 'admin@wayne.com', phone: '+1 (555) 000-1007', plan: 'Enterprise', amount: 59999, expiryDate: 'Jul 18, 2025' },
  { id: 'org-008', name: 'Cyberdyne Systems', industry: 'AI & Robotics', size: 'Medium (200-500)', country: 'United States', employees: 450, subscription: 'Professional', status: 'active', createdDate: 'Aug 22, 2024', email: 'admin@cyberdyne.com', phone: '+1 (555) 000-1008', plan: 'Professional', amount: 9999, expiryDate: 'Aug 22, 2025' },
  { id: 'org-009', name: 'Oscorp', industry: 'Biotechnology', size: 'Large (500+)', country: 'United States', employees: 760, subscription: 'Starter', status: 'trial', createdDate: 'Sep 10, 2024', email: 'admin@oscorp.com', phone: '+1 (555) 000-1009', plan: 'Trial', amount: 0, expiryDate: 'Dec 10, 2024' },
  { id: 'org-010', name: 'Massive Dynamic', industry: 'Research', size: 'Large (500+)', country: 'Canada', employees: 890, subscription: 'Professional', status: 'active', createdDate: 'Oct 1, 2024', email: 'admin@massive.ca', phone: '+1 (555) 000-1010', plan: 'Professional', amount: 9999, expiryDate: 'Oct 1, 2025' },
  { id: 'org-011', name: 'Soylent Corp', industry: 'Food & Beverage', size: 'Medium (200-500)', country: 'United States', employees: 340, subscription: 'Starter', status: 'expired', createdDate: 'Nov 15, 2023', email: 'admin@soylent.com', phone: '+1 (555) 000-1011', plan: 'Starter', amount: 4999, expiryDate: 'Nov 15, 2024' },
  { id: 'org-012', name: 'Wonka Industries', industry: 'Food & Beverage', size: 'Small (<200)', country: 'Switzerland', employees: 180, subscription: 'Free', status: 'active', createdDate: 'Dec 5, 2024', email: 'admin@wonka.ch', phone: '+41 22 123 1012', plan: 'Free', amount: 0, expiryDate: '—' },
]

export const ORG_GROWTH_CHART = [
  { month: 'Jan', newOrgs: 8, totalOrgs: 72 },
  { month: 'Feb', newOrgs: 12, totalOrgs: 84 },
  { month: 'Mar', newOrgs: 15, totalOrgs: 99 },
  { month: 'Apr', newOrgs: 10, totalOrgs: 109 },
  { month: 'May', newOrgs: 18, totalOrgs: 127 },
  { month: 'Jun', newOrgs: 22, totalOrgs: 149 },
  { month: 'Jul', newOrgs: 16, totalOrgs: 165 },
  { month: 'Aug', newOrgs: 20, totalOrgs: 185 },
  { month: 'Sep', newOrgs: 25, totalOrgs: 210 },
  { month: 'Oct', newOrgs: 19, totalOrgs: 229 },
  { month: 'Nov', newOrgs: 28, totalOrgs: 257 },
  { month: 'Dec', newOrgs: 24, totalOrgs: 281 },
]

export const INDUSTRY_DISTRIBUTION = [
  { name: 'Technology', value: 42, color: '#2563EB' },
  { name: 'Finance', value: 18, color: '#10B981' },
  { name: 'Healthcare', value: 15, color: '#8B5CF6' },
  { name: 'Manufacturing', value: 12, color: '#F59E0B' },
  { name: 'Education', value: 10, color: '#EF4444' },
  { name: 'Others', value: 31, color: '#94A3B8' },
]

// ─────────────────────────────────────────────────────────────────
// EMPLOYEES (cross-organization)
// ─────────────────────────────────────────────────────────────────

export const EMPLOYEE_STATS = {
  total: 45230,
  active: 41280,
  newThisMonth: 1240,
  terminated: 1890,
}

export const GLOBAL_EMPLOYEES = [
  { id: 'emp-001', name: 'Alice Johnson', organization: 'Acme Corp', department: 'Engineering', designation: 'Senior Developer', email: 'alice@acmecorp.com', status: 'active', joiningDate: 'Mar 15, 2022', phone: '+1 (555) 100-2001', manager: 'Bob Smith', skills: ['React', 'TypeScript', 'Node.js'], performance: 92 },
  { id: 'emp-002', name: 'Bob Smith', organization: 'Acme Corp', department: 'Engineering', designation: 'Engineering Manager', email: 'bob@acmecorp.com', status: 'active', joiningDate: 'Jan 10, 2021', phone: '+1 (555) 100-2002', manager: '—', skills: ['System Design', 'Leadership', 'Agile'], performance: 88 },
  { id: 'emp-003', name: 'Carol Davis', organization: 'Globex Inc', department: 'Marketing', designation: 'Marketing Director', email: 'carol@globex.com', status: 'active', joiningDate: 'Jun 5, 2023', phone: '+44 20 7946 3003', manager: 'David Lee', skills: ['Digital Marketing', 'SEO', 'Analytics'], performance: 95 },
  { id: 'emp-004', name: 'David Lee', organization: 'Globex Inc', department: 'Sales', designation: 'VP of Sales', email: 'david@globex.com', status: 'active', joiningDate: 'Feb 20, 2020', phone: '+44 20 7946 3004', manager: '—', skills: ['Sales Strategy', 'Negotiation', 'CRM'], performance: 91 },
  { id: 'emp-005', name: 'Eva Martinez', organization: 'Hooli', department: 'HR', designation: 'HR Manager', email: 'eva@hooli.com', status: 'active', joiningDate: 'Aug 12, 2022', phone: '+1 (555) 100-2005', manager: 'Frank Wilson', skills: ['Recruiting', 'HR Policies', 'Employee Relations'], performance: 87 },
  { id: 'emp-006', name: 'Frank Wilson', organization: 'Hooli', department: 'Engineering', designation: 'Principal Architect', email: 'frank@hooli.com', status: 'active', joiningDate: 'Apr 1, 2019', phone: '+1 (555) 100-2006', manager: '—', skills: ['Architecture', 'Cloud', 'Microservices', 'AI/ML'], performance: 97 },
  { id: 'emp-007', name: 'Grace Kim', organization: 'Initech', department: 'Manufacturing', designation: 'Operations Manager', email: 'grace@initech.de', status: 'active', joiningDate: 'Sep 15, 2021', phone: '+49 30 1234 4007', manager: 'Henry Mueller', skills: ['Operations', 'Supply Chain', 'Lean'], performance: 83 },
  { id: 'emp-008', name: 'Henry Mueller', organization: 'Initech', department: 'Manufacturing', designation: 'Plant Director', email: 'henry@initech.de', status: 'active', joiningDate: 'Jan 5, 2018', phone: '+49 30 1234 4008', manager: '—', skills: ['Manufacturing', 'Leadership', 'Six Sigma'], performance: 90 },
  { id: 'emp-009', name: 'Ivy Chen', organization: 'Cyberdyne Systems', department: 'R&D', designation: 'AI Researcher', email: 'ivy@cyberdyne.com', status: 'active', joiningDate: 'Nov 1, 2023', phone: '+1 (555) 100-2009', manager: 'Jack Turner', skills: ['Machine Learning', 'Python', 'TensorFlow', 'NLP'], performance: 94 },
  { id: 'emp-010', name: 'Jack Turner', organization: 'Cyberdyne Systems', department: 'R&D', designation: 'Head of Research', email: 'jack@cyberdyne.com', status: 'active', joiningDate: 'Jul 20, 2020', phone: '+1 (555) 100-2010', manager: '—', skills: ['Research', 'AI/ML', 'Robotics', 'Leadership'], performance: 96 },
  { id: 'emp-011', name: 'Kevin Brown', organization: 'Stark Industries', department: 'Engineering', designation: 'Senior Engineer', email: 'kevin@stark.com', status: 'active', joiningDate: 'May 10, 2022', phone: '+1 (555) 100-2011', manager: 'Lena Odinsson', skills: ['Mechanical Engineering', 'CAD', 'Prototyping'], performance: 89 },
  { id: 'emp-012', name: 'Lena Odinsson', organization: 'Stark Industries', department: 'Engineering', designation: 'Engineering Director', email: 'lena@stark.com', status: 'active', joiningDate: 'Mar 1, 2019', phone: '+1 (555) 100-2012', manager: '—', skills: ['Engineering', 'Project Management', 'Innovation'], performance: 93 },
  { id: 'emp-013', name: 'Mike Patel', organization: 'Wayne Enterprises', department: 'Finance', designation: 'CFO', email: 'mike@wayne.com', status: 'active', joiningDate: 'Jan 15, 2017', phone: '+1 (555) 100-2013', manager: '—', skills: ['Finance', 'Investment', 'Risk Management'], performance: 98 },
  { id: 'emp-014', name: 'Nina Williams', organization: 'Oscorp', department: 'R&D', designation: 'Research Scientist', email: 'nina@oscorp.com', status: 'trial', joiningDate: 'Oct 1, 2024', phone: '+1 (555) 100-2014', manager: 'Dr. Otto Octavius', skills: ['Biotech', 'Genetics', 'Lab Research'], performance: 82 },
  { id: 'emp-015', name: 'Oliver Queen', organization: 'Massive Dynamic', department: 'Security', designation: 'Security Lead', email: 'oliver@massive.ca', status: 'active', joiningDate: 'Jun 20, 2021', phone: '+1 (555) 100-2015', manager: '—', skills: ['Cybersecurity', 'Penetration Testing', 'Compliance'], performance: 91 },
  { id: 'emp-016', name: 'Sarah Connor', organization: 'Cyberdyne Systems', department: 'R&D', designation: 'AI Ethics Officer', email: 'sarah@cyberdyne.com', status: 'active', joiningDate: 'Apr 15, 2023', phone: '+1 (555) 100-2016', manager: 'Jack Turner', skills: ['AI Ethics', 'Policy', 'Compliance', 'Research'], performance: 88 },
  { id: 'emp-017', name: 'Tony Stark', organization: 'Stark Industries', department: 'Executive', designation: 'CEO', email: 'tony@stark.com', status: 'active', joiningDate: 'Jan 1, 2010', phone: '+1 (555) 100-2017', manager: '—', skills: ['Leadership', 'Innovation', 'Engineering', 'Vision'], performance: 100 },
  { id: 'emp-018', name: 'Bruce Wayne', organization: 'Wayne Enterprises', department: 'Executive', designation: 'CEO', email: 'bruce@wayne.com', status: 'active', joiningDate: 'Jan 1, 2005', phone: '+1 (555) 100-2018', manager: '—', skills: ['Leadership', 'Strategy', 'Finance'], performance: 99 },
  { id: 'emp-019', name: 'Peter Parker', organization: 'Oscorp', department: 'R&D', designation: 'Junior Researcher', email: 'peter@oscorp.com', status: 'active', joiningDate: 'Sep 1, 2024', phone: '+1 (555) 100-2019', manager: 'Nina Williams', skills: ['Biology', 'Chemistry', 'Data Analysis'], performance: 78 },
  { id: 'emp-020', name: 'Natasha Romanoff', organization: 'Hooli', department: 'Security', designation: 'Chief Security Officer', email: 'natasha@hooli.com', status: 'active', joiningDate: 'Mar 5, 2020', phone: '+1 (555) 100-2020', manager: '—', skills: ['Security', 'Intelligence', 'Risk Assessment'], performance: 97 },
]

export const EMPLOYEE_DEPARTMENTS = [
  { value: '', label: 'All Departments' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' },
  { value: 'HR', label: 'HR' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'R&D', label: 'R&D' },
  { value: 'Security', label: 'Security' },
  { value: 'Executive', label: 'Executive' },
  { value: 'Operations', label: 'Operations' },
]

export const EMPLOYEE_ORGS = [
  { value: '', label: 'All Organizations' },
  { value: 'Acme Corp', label: 'Acme Corp' },
  { value: 'Globex Inc', label: 'Globex Inc' },
  { value: 'Hooli', label: 'Hooli' },
  { value: 'Initech', label: 'Initech' },
  { value: 'Cyberdyne Systems', label: 'Cyberdyne Systems' },
  { value: 'Stark Industries', label: 'Stark Industries' },
  { value: 'Wayne Enterprises', label: 'Wayne Enterprises' },
  { value: 'Oscorp', label: 'Oscorp' },
  { value: 'Massive Dynamic', label: 'Massive Dynamic' },
]

// ─────────────────────────────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────────────────────────────

export const STUDENT_STATS = {
  total: 28430,
  active: 22180,
  completedCourses: 15820,
  certificationsIssued: 12450,
  enrollmentGrowth: 14.8,
}

export const STUDENTS = [
  { id: 'stu-001', name: 'Alex Johnson', email: 'alex.j@email.com', coursesEnrolled: 4, progress: 75, certifications: 2, status: 'active', joinedDate: 'Jan 15, 2024', lastActive: '2 hours ago', avgScore: 87, skills: ['JavaScript', 'React', 'Python'] },
  { id: 'stu-002', name: 'Maria Garcia', email: 'maria.g@email.com', coursesEnrolled: 6, progress: 60, certifications: 3, status: 'active', joinedDate: 'Mar 3, 2024', lastActive: '5 min ago', avgScore: 92, skills: ['Data Science', 'Python', 'SQL'] },
  { id: 'stu-003', name: 'James Wilson', email: 'james.w@email.com', coursesEnrolled: 3, progress: 90, certifications: 1, status: 'active', joinedDate: 'Feb 20, 2024', lastActive: '1 day ago', avgScore: 78, skills: ['AWS', 'Docker', 'Linux'] },
  { id: 'stu-004', name: 'Sophie Chen', email: 'sophie.c@email.com', coursesEnrolled: 8, progress: 45, certifications: 4, status: 'active', joinedDate: 'Apr 12, 2024', lastActive: '30 min ago', avgScore: 91, skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'] },
  { id: 'stu-005', name: 'Raj Patel', email: 'raj.p@email.com', coursesEnrolled: 2, progress: 100, certifications: 2, status: 'active', joinedDate: 'May 8, 2024', lastActive: '3 days ago', avgScore: 95, skills: ['Python', 'Machine Learning'] },
  { id: 'stu-006', name: 'Emma Brown', email: 'emma.b@email.com', coursesEnrolled: 5, progress: 30, certifications: 0, status: 'inactive', joinedDate: 'Jun 1, 2024', lastActive: '2 weeks ago', avgScore: 65, skills: ['HTML', 'CSS', 'JavaScript'] },
  { id: 'stu-007', name: 'Lucas Kim', email: 'lucas.k@email.com', coursesEnrolled: 7, progress: 55, certifications: 2, status: 'active', joinedDate: 'Feb 14, 2024', lastActive: '1 hour ago', avgScore: 84, skills: ['Java', 'Spring Boot', 'Microservices'] },
  { id: 'stu-008', name: 'Olivia Taylor', email: 'olivia.t@email.com', coursesEnrolled: 4, progress: 85, certifications: 2, status: 'active', joinedDate: 'Jul 22, 2024', lastActive: '15 min ago', avgScore: 89, skills: ['UI/UX', 'Figma', 'Design Systems'] },
  { id: 'stu-009', name: 'Noah Anderson', email: 'noah.a@email.com', coursesEnrolled: 1, progress: 100, certifications: 1, status: 'completed', joinedDate: 'Aug 5, 2024', lastActive: '1 month ago', avgScore: 76, skills: ['Excel', 'Data Analysis'] },
  { id: 'stu-010', name: 'Ava Martinez', email: 'ava.m@email.com', coursesEnrolled: 10, progress: 40, certifications: 5, status: 'active', joinedDate: 'Jan 30, 2024', lastActive: '10 min ago', avgScore: 93, skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'] },
  { id: 'stu-011', name: 'Ethan Lee', email: 'ethan.l@email.com', coursesEnrolled: 3, progress: 70, certifications: 1, status: 'active', joinedDate: 'Sep 18, 2024', lastActive: '2 days ago', avgScore: 81, skills: ['Go', 'Kubernetes', 'Docker'] },
  { id: 'stu-012', name: 'Isabella Wang', email: 'isabella.w@email.com', coursesEnrolled: 6, progress: 20, certifications: 0, status: 'active', joinedDate: 'Oct 10, 2024', lastActive: '1 week ago', avgScore: 72, skills: ['Python', 'SQL', 'Statistics'] },
]

export const ENROLLMENT_TRENDS = [
  { month: 'Jan', enrollments: 620, completions: 380 },
  { month: 'Feb', enrollments: 780, completions: 420 },
  { month: 'Mar', enrollments: 920, completions: 510 },
  { month: 'Apr', enrollments: 850, completions: 480 },
  { month: 'May', enrollments: 1100, completions: 620 },
  { month: 'Jun', enrollments: 1340, completions: 780 },
  { month: 'Jul', enrollments: 980, completions: 650 },
  { month: 'Aug', enrollments: 1250, completions: 810 },
  { month: 'Sep', enrollments: 1480, completions: 920 },
  { month: 'Oct', enrollments: 1160, completions: 740 },
  { month: 'Nov', enrollments: 1520, completions: 980 },
  { month: 'Dec', enrollments: 1280, completions: 890 },
]

export const COURSE_COMPLETION_RATE = [
  { name: 'Completed', value: 55, color: '#10B981' },
  { name: 'In Progress', value: 30, color: '#2563EB' },
  { name: 'Not Started', value: 15, color: '#94A3B8' },
]

// ─────────────────────────────────────────────────────────────────
// SUBSCRIPTIONS
// ─────────────────────────────────────────────────────────────────

export const SUBSCRIPTION_STATS = {
  monthlyRevenue: 284500,
  annualRevenue: 3414000,
  activePlans: 104,
  expiringPlans: 12,
  renewalRate: 94.2,
  avgPlanDuration: 14.3,
}

export const SUBSCRIPTIONS = [
  { id: 'sub-001', organization: 'Acme Corp', plan: 'Enterprise', amount: 24999, startDate: 'Jan 15, 2024', expiryDate: 'Jan 15, 2025', status: 'active', billingCycle: 'Annual', seats: 850, lastPayment: 'Jan 15, 2024', paymentMethod: 'Credit Card' },
  { id: 'sub-002', organization: 'Globex Inc', plan: 'Professional', amount: 9999, startDate: 'Feb 3, 2024', expiryDate: 'Feb 3, 2025', status: 'active', billingCycle: 'Annual', seats: 1250, lastPayment: 'Feb 3, 2024', paymentMethod: 'Bank Transfer' },
  { id: 'sub-003', organization: 'Initech', plan: 'Starter', amount: 4999, startDate: 'Mar 12, 2024', expiryDate: 'Mar 12, 2025', status: 'active', billingCycle: 'Annual', seats: 520, lastPayment: 'Mar 12, 2024', paymentMethod: 'Credit Card' },
  { id: 'sub-004', organization: 'Hooli', plan: 'Enterprise', amount: 34999, startDate: 'Apr 8, 2024', expiryDate: 'Apr 8, 2025', status: 'active', billingCycle: 'Annual', seats: 2100, lastPayment: 'Apr 8, 2024', paymentMethod: 'Wire Transfer' },
  { id: 'sub-005', organization: 'Umbrella Corp', plan: 'Professional', amount: 9999, startDate: 'May 20, 2024', expiryDate: 'May 20, 2025', status: 'suspended', billingCycle: 'Annual', seats: 980, lastPayment: 'May 20, 2024', paymentMethod: 'Credit Card' },
  { id: 'sub-006', organization: 'Stark Industries', plan: 'Enterprise', amount: 49999, startDate: 'Jun 5, 2024', expiryDate: 'Jun 5, 2025', status: 'active', billingCycle: 'Annual', seats: 3200, lastPayment: 'Jun 5, 2024', paymentMethod: 'Wire Transfer' },
  { id: 'sub-007', organization: 'Wayne Enterprises', plan: 'Enterprise Plus', amount: 69999, startDate: 'Jul 18, 2024', expiryDate: 'Jul 18, 2025', status: 'active', billingCycle: 'Annual', seats: 5800, lastPayment: 'Jul 18, 2024', paymentMethod: 'Bank Transfer' },
  { id: 'sub-008', organization: 'Cyberdyne Systems', plan: 'Professional', amount: 9999, startDate: 'Aug 22, 2024', expiryDate: 'Aug 22, 2025', status: 'active', billingCycle: 'Annual', seats: 450, lastPayment: 'Aug 22, 2024', paymentMethod: 'Credit Card' },
  { id: 'sub-009', organization: 'Oscorp', plan: 'Trial', amount: 0, startDate: 'Sep 10, 2024', expiryDate: 'Dec 10, 2024', status: 'trial', billingCycle: 'Monthly', seats: 760, lastPayment: '—', paymentMethod: '—' },
  { id: 'sub-010', organization: 'Massive Dynamic', plan: 'Professional', amount: 9999, startDate: 'Oct 1, 2024', expiryDate: 'Oct 1, 2025', status: 'active', billingCycle: 'Annual', seats: 890, lastPayment: 'Oct 1, 2024', paymentMethod: 'Credit Card' },
  { id: 'sub-011', organization: 'Soylent Corp', plan: 'Starter', amount: 4999, startDate: 'Nov 15, 2023', expiryDate: 'Nov 15, 2024', status: 'expired', billingCycle: 'Annual', seats: 340, lastPayment: 'Nov 15, 2023', paymentMethod: 'Credit Card' },
  { id: 'sub-012', organization: 'Wonka Industries', plan: 'Free', amount: 0, startDate: 'Dec 5, 2024', expiryDate: '—', status: 'active', billingCycle: 'Monthly', seats: 180, lastPayment: '—', paymentMethod: '—' },
]

export const REVENUE_GROWTH = [
  { month: 'Jan', mrr: 142000, arr: 1704000 },
  { month: 'Feb', mrr: 158000, arr: 1896000 },
  { month: 'Mar', mrr: 175000, arr: 2100000 },
  { month: 'Apr', mrr: 168000, arr: 2016000 },
  { month: 'May', mrr: 192000, arr: 2304000 },
  { month: 'Jun', mrr: 215000, arr: 2580000 },
  { month: 'Jul', mrr: 208000, arr: 2496000 },
  { month: 'Aug', mrr: 234000, arr: 2808000 },
  { month: 'Sep', mrr: 256000, arr: 3072000 },
  { month: 'Oct', mrr: 248000, arr: 2976000 },
  { month: 'Nov', mrr: 278000, arr: 3336000 },
  { month: 'Dec', mrr: 284500, arr: 3414000 },
]

export const PLAN_DISTRIBUTION = [
  { name: 'Enterprise', value: 4, revenue: 175000, color: '#2563EB' },
  { name: 'Professional', value: 4, revenue: 39996, color: '#8B5CF6' },
  { name: 'Starter', value: 2, revenue: 9998, color: '#10B981' },
  { name: 'Free/Trial', value: 2, revenue: 0, color: '#94A3B8' },
]

// ─────────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────────

export const SUPER_ADMIN_PROFILE = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'superadmin@kinieduhub.io',
  phone: '+1 (555) 000-0001',
  address: '123 Platform Street, San Francisco, CA 94105',
  role: 'Super Admin',
  joinedDate: 'January 2023',
  avatar: null,
  twoFactorEnabled: true,
  loginSessions: [
    { id: 's1', device: 'Chrome on Windows', location: 'San Francisco, US', ip: '192.168.1.100', lastActive: 'Active now', current: true },
    { id: 's2', device: 'Safari on iPhone', location: 'San Francisco, US', ip: '192.168.1.101', lastActive: '2 hours ago', current: false },
    { id: 's3', device: 'Firefox on macOS', location: 'New York, US', ip: '192.168.2.50', lastActive: '3 days ago', current: false },
  ],
  activityLogs: [
    { id: 'a1', action: 'Logged in', details: 'Chrome on Windows', timestamp: 'Dec 20, 2024 09:15 AM', type: 'login' },
    { id: 'a2', action: 'Created organization', details: 'Wonka Industries', timestamp: 'Dec 19, 2024 02:30 PM', type: 'org' },
    { id: 'a3', action: 'Modified subscription', details: 'Hooli → Enterprise Plus', timestamp: 'Dec 18, 2024 11:00 AM', type: 'billing' },
    { id: 'a4', action: 'Suspended organization', details: 'Umbrella Corp — Payment overdue', timestamp: 'Dec 17, 2024 10:45 AM', type: 'admin' },
    { id: 'a5', action: 'Updated system settings', details: 'Changed email templates', timestamp: 'Dec 16, 2024 04:20 PM', type: 'settings' },
    { id: 'a6', action: 'Generated report', details: 'Monthly Platform Analytics', timestamp: 'Dec 15, 2024 09:00 AM', type: 'report' },
    { id: 'a7', action: 'Password changed', details: 'Admin user password updated', timestamp: 'Dec 14, 2024 05:30 PM', type: 'security' },
    { id: 'a8', action: 'Two-factor enabled', details: 'Security enhancement', timestamp: 'Dec 13, 2024 03:15 PM', type: 'security' },
    { id: 'a9', action: 'Added admin user', details: 'New super admin: john@kinieduhub.io', timestamp: 'Dec 12, 2024 01:00 PM', type: 'admin' },
    { id: 'a10', action: 'Exported data', details: 'Organization directory CSV', timestamp: 'Dec 11, 2024 10:30 AM', type: 'export' },
  ],
  notificationPreferences: {
    emailNotifications: true,
    loginAlerts: true,
    orgChanges: true,
    billingAlerts: true,
    weeklyDigest: false,
    marketingEmails: false,
    systemUpdates: true,
  },
}
