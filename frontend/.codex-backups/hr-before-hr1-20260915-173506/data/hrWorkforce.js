// KINI HRMS — mock data: assets, documents, exits, tickets, settings, dashboard extras.

export const HR_ASSET_STATS = { total: 214, assigned: 186, available: 22, underMaintenance: 6, expiringWarranty: 9 }

export const HR_ASSETS = [
  { id: 'AS-001', asset: 'MacBook Pro M3', category: 'Laptop', serial: 'MBP3-8841', assignedTo: 'Ananya Rao', condition: 'Good', warranty: '2027-06-30', status: 'assigned', purchased: '2024-05-12', cost: 189000 },
  { id: 'AS-002', asset: 'Dell Latitude 7440', category: 'Laptop', serial: 'DL744-2210', assignedTo: 'Priya Nair', condition: 'Good', warranty: '2026-12-15', status: 'assigned', purchased: '2024-07-03', cost: 124000 },
  { id: 'AS-003', asset: 'iPhone 15 Pro', category: 'Mobile', serial: 'IP15-7782', assignedTo: 'Nikhil Verma', condition: 'Excellent', warranty: '2026-10-20', status: 'assigned', purchased: '2024-10-01', cost: 134900 },
  { id: 'AS-004', asset: 'UltraWide Monitor 34"', category: 'Display', serial: 'UW34-1120', assignedTo: 'Available', condition: 'Good', warranty: '2026-08-22', status: 'available', purchased: '2024-08-22', cost: 62000 },
  { id: 'AS-005', asset: 'Ergonomic Chair', category: 'Furniture', serial: 'EC-5521', assignedTo: 'Vikram Shah', condition: 'Fair', warranty: '2026-09-30', status: 'assigned', purchased: '2023-09-30', cost: 28500 },
  { id: 'AS-006', asset: 'Lenovo ThinkPad X1', category: 'Laptop', serial: 'TPX1-3390', assignedTo: '—', condition: 'Under repair', warranty: '2026-07-28', status: 'maintenance', purchased: '2024-02-14', cost: 142000 },
  { id: 'AS-007', asset: 'Noise-Cancelling Headset', category: 'Accessory', serial: 'NC-9087', assignedTo: 'Sara Thomas', condition: 'Excellent', warranty: '2027-01-10', status: 'assigned', purchased: '2025-01-10', cost: 21000 },
  { id: 'AS-008', asset: 'Canon EOS R10', category: 'Camera', serial: 'CR10-5567', assignedTo: 'Marketing Team', condition: 'Good', warranty: '2026-11-05', status: 'assigned', purchased: '2024-11-05', cost: 98000 },
]

export const HR_ASSET_MAINTENANCE = [
  { id: 'MT-01', asset: 'Lenovo ThinkPad X1', issue: 'Battery replacement', raised: '2026-08-01', vendor: 'Lenovo Care', eta: '2026-08-07', status: 'in-progress' },
  { id: 'MT-02', asset: 'Dell Latitude 7440', issue: 'Keyboard malfunction', raised: '2026-07-28', vendor: 'Dell Service', eta: '2026-08-04', status: 'scheduled' },
  { id: 'MT-03', asset: 'Projector Epson', issue: 'Lamp replacement', raised: '2026-07-25', vendor: 'Epson Care', eta: '2026-08-02', status: 'completed' },
]

export const HR_DOCUMENTS = [
  { id: 'DOC-01', employee: 'Ananya Rao', type: 'PAN Card', uploaded: '2024-03-18', expires: '—', size: '412 KB', status: 'verified', verifiedBy: 'Kavya Menon' },
  { id: 'DOC-02', employee: 'Ananya Rao', type: 'Aadhaar', uploaded: '2024-03-18', expires: '—', size: '398 KB', status: 'verified', verifiedBy: 'Kavya Menon' },
  { id: 'DOC-03', employee: 'Karan Mehta', type: 'Passport', uploaded: '2022-11-14', expires: '2027-11-13', size: '1.2 MB', status: 'verified', verifiedBy: 'Divya Menon' },
  { id: 'DOC-04', employee: 'Priya Nair', type: 'Degree Certificate', uploaded: '2025-01-10', expires: '—', size: '856 KB', status: 'pending', verifiedBy: '—' },
  { id: 'DOC-05', employee: 'Vikram Shah', type: 'Visa / Work Permit', uploaded: '2021-07-01', expires: '2026-09-15', size: '640 KB', status: 'expiring', verifiedBy: 'Kavya Menon' },
  { id: 'DOC-06', employee: 'Sara Thomas', type: 'Address Proof', uploaded: '2025-06-02', expires: '—', size: '512 KB', status: 'verified', verifiedBy: 'Divya Menon' },
  { id: 'DOC-07', employee: 'Rohit Sen', type: 'PAN Card', uploaded: '2024-09-16', expires: '—', size: '404 KB', status: 'rejected', verifiedBy: 'Divya Menon' },
]

export const HR_DOC_AUDIT = [
  { id: 'DA-01', doc: 'Passport — Karan Mehta', action: 'Uploaded', by: 'Karan Mehta', at: '2022-11-14 10:22', ip: '103.21.58.10' },
  { id: 'DA-02', doc: 'Passport — Karan Mehta', action: 'Verified', by: 'Divya Menon', at: '2022-11-15 09:04', ip: '103.21.58.55' },
  { id: 'DA-03', doc: 'PAN Card — Rohit Sen', action: 'Rejected', by: 'Divya Menon', at: '2026-07-20 14:31', ip: '103.21.58.55' },
  { id: 'DA-04', doc: 'Degree — Priya Nair', action: 'Uploaded', by: 'Priya Nair', at: '2026-07-28 11:12', ip: '103.21.58.77' },
]

export const HR_EXIT_STATS = { inProcess: 3, cleared: 2, settlementDue: 1, resignedThisQuarter: 5 }

export const HR_EXITS = [
  { id: 'EX-01', employee: 'Rohit Sen', department: 'Sales', designation: 'Account Executive', noticeDate: '2026-07-20', lastDay: '2026-08-19', status: 'in-process', reason: 'Higher studies', stage: 'clearance' },
  { id: 'EX-02', employee: 'Sara Thomas', department: 'Marketing', designation: 'Content Writer', noticeDate: '2026-06-28', lastDay: '2026-07-27', status: 'cleared', reason: 'Relocation', stage: 'settlement' },
  { id: 'EX-03', employee: 'Ramesh Iyer', department: 'Academics', designation: 'Mentor', noticeDate: '2026-08-01', lastDay: '2026-08-31', status: 'in-process', reason: 'Career change', stage: 'kt' },
  { id: 'EX-04', employee: 'Tanvi Joshi', department: 'Academics', designation: 'Junior Mentor', noticeDate: '2026-05-15', lastDay: '2026-06-14', status: 'settled', reason: 'Startup', stage: 'completed' },
]

export const HR_EXIT_CHECKLIST = [
  { id: 'EC-01', task: 'IT asset return', owner: 'IT', status: 'done' },
  { id: 'EC-02', task: 'Access revoke', owner: 'IT', status: 'done' },
  { id: 'EC-03', task: 'Finance settlement', owner: 'Finance', status: 'pending' },
  { id: 'EC-04', task: 'Exit interview', owner: 'HR', status: 'pending' },
  { id: 'EC-05', task: 'Knowledge transfer', owner: 'Manager', status: 'pending' },
  { id: 'EC-06', task: 'HR clearance letter', owner: 'HR', status: 'pending' },
]

export const HR_EXIT_INTERVIEWS = [
  { id: 'EI-01', employee: 'Sara Thomas', date: '2026-07-24', reason: 'Relocation', feedback: 'Loved the culture, moving for family reasons.', status: 'completed' },
  { id: 'EI-02', employee: 'Ramesh Iyer', date: '2026-08-12', reason: 'Career change', feedback: '—', status: 'scheduled' },
]

export const HR_EXIT_TIMELINE = [
  { date: '2026-07-20', title: 'Resignation submitted', desc: 'Rohit Sen submitted notice of 30 days.', type: 'notice' },
  { date: '2026-07-21', title: 'Exit checklist initiated', desc: 'IT, Finance and HR tasks created.', type: 'checklist' },
  { date: '2026-07-24', title: 'Knowledge transfer started', desc: 'Account pipeline docs handed over.', type: 'kt' },
  { date: '2026-08-05', title: 'Exit interview scheduled', desc: 'With HRBP Divya Menon.', type: 'interview' },
]

export const HR_TICKET_STATS = { open: 12, inProgress: 7, resolved: 64, avgResponse: '3.2h', satisfaction: 4.5 }

export const HR_TICKETS = [
  { id: 'TK-1024', subject: 'Payslip discrepancy for July', category: 'Payroll', priority: 'high', assignee: 'Kavya Menon', status: 'in-progress', created: '2026-08-01', requester: 'Karan Mehta' },
  { id: 'TK-1023', subject: 'Leave balance not updated', category: 'Leave', priority: 'medium', assignee: 'Fatima Sheikh', status: 'open', created: '2026-08-02', requester: 'Rohit Sen' },
  { id: 'TK-1022', subject: 'New laptop request — onboarding', category: 'IT', priority: 'low', assignee: 'IT Helpdesk', status: 'open', created: '2026-08-03', requester: 'Amit Deshpande' },
  { id: 'TK-1021', subject: 'Address change for PF records', category: 'Compliance', priority: 'medium', assignee: 'Divya Menon', status: 'in-progress', created: '2026-07-31', requester: 'Sara Thomas' },
  { id: 'TK-1020', subject: 'Medical insurance claim help', category: 'Benefits', priority: 'high', assignee: 'Kavya Menon', status: 'resolved', created: '2026-07-29', requester: 'Neha Verma' },
  { id: 'TK-1019', subject: 'Update bank details', category: 'Payroll', priority: 'medium', assignee: 'Fatima Sheikh', status: 'resolved', created: '2026-07-28', requester: 'Aditya Kulkarni' },
]

export const HR_TICKET_COMMENTS = [
  { id: 'CM-01', author: 'Karan Mehta', role: 'Requester', text: 'My July payslip shows TDS ₹2,400 higher than June.', at: '2026-08-01 09:12' },
  { id: 'CM-02', author: 'Kavya Menon', role: 'Payroll Lead', text: 'Checking the advance deduction from July 12 — will confirm shortly.', at: '2026-08-01 11:40' },
  { id: 'CM-03', author: 'Karan Mehta', role: 'Requester', text: 'Thanks, that explains it. Closing the ticket once updated.', at: '2026-08-02 08:55' },
]

export const HR_SETTINGS_POLICIES = {
  attendance: [
    { id: 'AP-01', policy: 'Work hours', value: '9h + 1h break (shift-based)', updated: '2026-06-01' },
    { id: 'AP-02', policy: 'Grace period', value: '15 min per shift', updated: '2026-06-01' },
    { id: 'AP-03', policy: 'Late marks', value: '3 late = 1 half-day', updated: '2026-06-01' },
    { id: 'AP-04', policy: 'WFH allowance', value: '2 days / week (manager approved)', updated: '2026-07-15' },
  ],
  leave: [
    { id: 'LP-01', policy: 'Annual leave', value: '27 days (CL+PL)', updated: '2026-01-01' },
    { id: 'LP-02', policy: 'Sick leave', value: '10 days, no carry-over', updated: '2026-01-01' },
    { id: 'LP-03', policy: 'Carry forward', value: 'Max 10 PL days', updated: '2026-01-01' },
    { id: 'LP-04', policy: 'Approval chain', value: 'Manager → HR for > 3 days', updated: '2026-02-10' },
  ],
}

export const HR_ROLES = [
  { id: 'RL-01', role: 'HR Admin', users: 3, permissions: 'Full HR access', status: 'active' },
  { id: 'RL-02', role: 'HR Executive', users: 4, permissions: 'Requests, documents, tickets', status: 'active' },
  { id: 'RL-03', role: 'Recruiter', users: 3, permissions: 'Vacancies, candidates, offers', status: 'active' },
]

export const HR_AUDIT_LOGS = [
  { id: 'AU-01', user: 'Kavya Menon', action: 'Updated payroll run', module: 'Payroll', ip: '103.21.58.55', at: '2026-08-01 10:02' },
  { id: 'AU-02', user: 'Divya Menon', action: 'Verified document DOC-01', module: 'Documents', ip: '103.21.58.55', at: '2026-08-01 09:44' },
  { id: 'AU-03', user: 'Priya Nair', action: 'Moved candidate C-01 to Offer', module: 'Recruitment', ip: '103.21.58.90', at: '2026-07-31 16:20' },
  { id: 'AU-04', user: 'Fatima Sheikh', action: 'Approved leave LV-103', module: 'Leave', ip: '103.21.58.77', at: '2026-07-31 14:08' },
  { id: 'AU-05', user: 'Kiran Shetty', action: 'Assigned asset AS-001', module: 'Assets', ip: '103.21.58.44', at: '2026-07-30 11:31' },
]

export const HR_APPROVAL_MATRIX = [
  { id: 'AM-01', type: 'Leave ≤ 3 days', level1: 'Manager', level2: '—', sla: '24h' },
  { id: 'AM-02', type: 'Leave > 3 days', level1: 'Manager', level2: 'HRBP', sla: '48h' },
  { id: 'AM-03', type: 'Salary revision', level1: 'HR Head', level2: 'CFO', sla: '5 days' },
  { id: 'AM-04', type: 'Asset issue', level1: 'IT Admin', level2: '—', sla: '24h' },
  { id: 'AM-05', type: 'Exit clearance', level1: 'Manager', level2: 'Finance', sla: '7 days' },
]

// ── DASHBOARD EXTRAS ──────────────────────────────────────────────────────
export const HR_DASHBOARD = {
  pendingApprovals: [
    { id: 'PA-01', type: 'Leave', subject: 'Meera Iyer — PL (5 days)', at: '2h ago', urgent: true },
    { id: 'PA-02', type: 'Leave', subject: 'Arjun Kapoor — SL (2 days)', at: '5h ago', urgent: false },
    { id: 'PA-03', type: 'Salary revision', subject: 'Karan Mehta — 7.5% hike', at: '1d ago', urgent: true },
    { id: 'PA-04', type: 'Asset', subject: 'Lenovo X1 — repair approval', at: '1d ago', urgent: false },
  ],
  notifications: [
    { id: 'NF-01', title: '3 attendance corrections pending', at: '10 min ago', tone: 'warning' },
    { id: 'NF-02', title: 'Visa expires in 45 days — Vikram Shah', at: '1h ago', tone: 'danger' },
    { id: 'NF-03', title: 'New candidate applied for DevOps', at: '2h ago', tone: 'info' },
    { id: 'NF-04', title: 'Q3 review cycle opens Aug 5', at: '1d ago', tone: 'info' },
  ],
  activities: [
    { id: 'AC-01', action: 'Priya Nair moved Riya Sharma to Interview', at: '2h ago' },
    { id: 'AC-02', action: 'Kavya Menon processed July payroll', at: '3h ago' },
    { id: 'AC-03', action: 'Divya Menon verified 2 documents', at: '5h ago' },
    { id: 'AC-04', action: 'Ishaan Gupta approved exit checklist', at: '1d ago' },
    { id: 'AC-05', action: '3 employees joined — Design & Eng', at: '1d ago' },
  ],
  birthdays: [
    { id: 'BD-01', name: 'Neha Verma', dept: 'Design', date: 'Aug 2' },
    { id: 'BD-02', name: 'Aditya Kulkarni', dept: 'Engineering', date: 'Aug 6' },
    { id: 'BD-03', name: 'Fatima Sheikh', dept: 'HR', date: 'Aug 9' },
  ],
  anniversaries: [
    { id: 'AN-01', name: 'Vikram Shah', dept: 'Academics', years: 5, date: 'Aug 1' },
    { id: 'AN-02', name: 'Kavya Menon', dept: 'Operations', years: 10, date: 'Aug 6' },
  ],
  recentJoinings: [
    { id: 'RJ-01', name: 'Aditya Kulkarni', role: 'UI Designer', date: 'Jul 21' },
    { id: 'RJ-02', name: 'Amit Deshpande', role: 'Brand Designer', date: 'Aug 3' },
    { id: 'RJ-03', name: 'Divya Krish', role: 'Content Writer', date: 'Aug 3' },
  ],
  employeeGrowth: [
    { month: 'Mar', count: 142 },
    { month: 'Apr', count: 145 },
    { month: 'May', count: 146 },
    { month: 'Jun', count: 149 },
    { month: 'Jul', count: 151 },
    { month: 'Aug', count: 153 },
  ],
  aiInsights: [
    'Attrition risk elevated in Sales (3 exits in 90 days) — consider stay interviews.',
    'Attendance is 2.1% above target; Night shift late arrivals up 12% this month.',
    'Engineering hiring is 3 weeks ahead of plan — good time to backfill DevOps.',
  ],
}
