// KINI HRMS — mock data: recruitment, onboarding, performance, appraisal.

export const HR_RECRUITMENT_STATS = {
  openPositions: 8, totalCandidates: 132, screening: 18, interviews: 9, offersOut: 3, hired: 6, timeToHire: 24,
}

export const HR_VACANCIES = [
  { id: 'V-01', title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Bengaluru', openings: 2, applicants: 34, status: 'open', posted: '2026-07-12' },
  { id: 'V-02', title: 'Data Science Mentor', department: 'Academics', location: 'Hyderabad', openings: 1, applicants: 21, status: 'open', posted: '2026-07-18' },
  { id: 'V-03', title: 'DevOps Engineer', department: 'Engineering', location: 'Bengaluru', openings: 1, applicants: 18, status: 'open', posted: '2026-07-20' },
  { id: 'V-04', title: 'Account Executive', department: 'Sales', location: 'Mumbai', openings: 3, applicants: 27, status: 'open', posted: '2026-06-28' },
  { id: 'V-05', title: 'Brand Designer', department: 'Design', location: 'Remote', openings: 1, applicants: 14, status: 'open', posted: '2026-07-25' },
  { id: 'V-06', title: 'Content Writer', department: 'Marketing', location: 'Remote', openings: 1, applicants: 12, status: 'on-hold', posted: '2026-07-05' },
  { id: 'V-07', title: 'Product Analyst', department: 'Product', location: 'Chennai', openings: 1, applicants: 9, status: 'open', posted: '2026-07-22' },
  { id: 'V-08', title: 'Backend Engineer (Node.js)', department: 'Engineering', location: 'Bengaluru', openings: 2, applicants: 26, status: 'open', posted: '2026-07-15' },
]

export const HR_CANDIDATES = [
  { id: 'C-01', name: 'Riya Sharma', role: 'Senior Frontend Engineer', stage: 'Interview', source: 'LinkedIn', rating: 4.6, applied: '2026-07-15', interviews: 2, owner: 'Priya Nair', location: 'Bengaluru' },
  { id: 'C-02', name: 'Dev Patel', role: 'Data Science Mentor', stage: 'Screening', source: 'Referral', rating: 4.2, applied: '2026-07-20', interviews: 1, owner: 'Sneha Pillai', location: 'Hyderabad' },
  { id: 'C-03', name: 'Lakshmi Nandakumar', role: 'Backend Engineer', stage: 'Offer', source: 'Naukri', rating: 4.8, applied: '2026-07-08', interviews: 3, owner: 'Priya Nair', location: 'Bengaluru' },
  { id: 'C-04', name: 'Mohammed Faiz', role: 'DevOps Engineer', stage: 'Interview', source: 'HackerEarth', rating: 4.4, applied: '2026-07-22', interviews: 2, owner: 'Karan Mehta', location: 'Bengaluru' },
  { id: 'C-05', name: 'Sneha Reddy', role: 'Account Executive', stage: 'Applied', source: 'Campus', rating: 3.8, applied: '2026-07-28', interviews: 0, owner: 'Ishaan Gupta', location: 'Mumbai' },
  { id: 'C-06', name: 'Amit Deshpande', role: 'Brand Designer', stage: 'Hired', source: 'Portfolio', rating: 4.7, applied: '2026-06-30', interviews: 3, owner: 'Kiran Shetty', location: 'Remote' },
  { id: 'C-07', name: 'Pooja Hegde', role: 'Senior Frontend Engineer', stage: 'Screening', source: 'AngelList', rating: 4.1, applied: '2026-07-24', interviews: 1, owner: 'Priya Nair', location: 'Bengaluru' },
  { id: 'C-08', name: 'Rahul Bhat', role: 'Backend Engineer', stage: 'Rejected', source: 'Naukri', rating: 3.2, applied: '2026-07-10', interviews: 1, owner: 'Priya Nair', location: 'Chennai' },
]

export const HR_PIPELINE = [
  { stage: 'Applied', count: 42 },
  { stage: 'Screening', count: 18 },
  { stage: 'Interview', count: 9 },
  { stage: 'Offer', count: 3 },
  { stage: 'Hired', count: 6 },
]

export const HR_INTERVIEWS = [
  { id: 'IV-01', candidate: 'Riya Sharma', role: 'Senior Frontend Engineer', panel: 'Kiran Shetty, Rahul Nair', date: '2026-08-05', time: '11:00 AM', mode: 'Video', status: 'scheduled' },
  { id: 'IV-02', candidate: 'Mohammed Faiz', role: 'DevOps Engineer', panel: 'Karan Mehta', date: '2026-08-05', time: '03:00 PM', mode: 'On-site', status: 'scheduled' },
  { id: 'IV-03', candidate: 'Dev Patel', role: 'Data Science Mentor', panel: 'Sneha Pillai', date: '2026-08-06', time: '10:30 AM', mode: 'Video', status: 'scheduled' },
  { id: 'IV-04', candidate: 'Pooja Hegde', role: 'Senior Frontend Engineer', panel: 'Rahul Nair', date: '2026-08-07', time: '02:00 PM', mode: 'Video', status: 'scheduled' },
  { id: 'IV-05', candidate: 'Lakshmi Nandakumar', role: 'Backend Engineer', panel: 'Kiran Shetty', date: '2026-08-03', time: '12:00 PM', mode: 'On-site', status: 'completed' },
]

export const HR_OFFERS = [
  { id: 'OF-01', candidate: 'Lakshmi Nandakumar', role: 'Backend Engineer', ctc: '₹19 LPA', status: 'sent', sentOn: '2026-08-02', validTill: '2026-08-09' },
  { id: 'OF-02', candidate: 'Amit Deshpande', role: 'Brand Designer', ctc: '₹16 LPA', status: 'accepted', sentOn: '2026-07-28', validTill: '2026-08-05' },
  { id: 'OF-03', candidate: 'Nandini Rao', role: 'Product Analyst', ctc: '₹14 LPA', status: 'draft', sentOn: '—', validTill: '—' },
]

export const HR_ONBOARDING = [
  { id: 'OB-01', candidate: 'Amit Deshpande', role: 'Brand Designer', department: 'Design', stage: 'activation', progress: 80, joining: '2026-08-10', buddy: 'Neha Verma' },
  { id: 'OB-02', candidate: 'Lakshmi Nandakumar', role: 'Backend Engineer', department: 'Engineering', stage: 'approval', progress: 60, joining: '2026-08-17', buddy: 'Arjun Kapoor' },
  { id: 'OB-03', candidate: 'Rahul Shetty', role: 'Frontend Engineer', department: 'Engineering', stage: 'documents', progress: 40, joining: '2026-08-24', buddy: 'Ananya Rao' },
  { id: 'OB-04', candidate: 'Maya Krishnan', role: 'HR Executive', department: 'HR', stage: 'pending', progress: 20, joining: '2026-09-01', buddy: 'Priya Nair' },
  { id: 'OB-05', candidate: 'Siddharth Menon', role: 'Account Executive', department: 'Sales', stage: 'verification', progress: 50, joining: '2026-08-20', buddy: 'Ishaan Gupta' },
  { id: 'OB-06', candidate: 'Divya Krish', role: 'Content Writer', department: 'Marketing', stage: 'welcome', progress: 100, joining: '2026-08-03', buddy: 'Sara Thomas' },
]

export const HR_ONBOARDING_STAGES = [
  { key: 'pending', label: 'Pending', color: '#94a3b8' },
  { key: 'documents', label: 'Documents', color: '#0f55f7' },
  { key: 'verification', label: 'Verification', color: '#F59E0B' },
  { key: 'approval', label: 'Approval', color: '#8b5cf6' },
  { key: 'activation', label: 'Activation', color: '#06b6a8' },
  { key: 'welcome', label: 'Welcome Kit', color: '#10b981' },
]

export const HR_WELCOME_KIT = [
  { id: 'WK-01', item: 'Laptop (MacBook Pro M3)', owner: 'IT', status: 'ready' },
  { id: 'WK-02', item: 'Access card + seat allocation', owner: 'Admin', status: 'ready' },
  { id: 'WK-03', item: 'Email + Slack accounts', owner: 'IT', status: 'pending' },
  { id: 'WK-04', item: 'Welcome swag box', owner: 'HR', status: 'ready' },
  { id: 'WK-05', item: 'Onboarding handbook', owner: 'L&D', status: 'ready' },
]

export const HR_PERFORMANCE_STATS = {
  avgRating: 4.4, goalsOnTrack: 74, reviewsDue: 6, promotionReady: 9, highPerformers: 12,
}

export const HR_GOALS = [
  { id: 'GL-01', employee: 'Ananya Rao', goal: 'Ship design system v2', type: 'Quarterly', progress: 78, status: 'on-track', due: '2026-09-30' },
  { id: 'GL-02', employee: 'Karan Mehta', goal: 'Reduce deploy time by 30%', type: 'Quarterly', progress: 55, status: 'at-risk', due: '2026-09-30' },
  { id: 'GL-03', employee: 'Vikram Shah', goal: 'Launch 2 new batches', type: 'Half-yearly', progress: 90, status: 'on-track', due: '2026-12-31' },
  { id: 'GL-04', employee: 'Nikhil Verma', goal: 'Improve NPS to 60', type: 'Yearly', progress: 64, status: 'on-track', due: '2026-12-31' },
  { id: 'GL-05', employee: 'Sara Thomas', goal: 'Publish 24 blog posts', type: 'Quarterly', progress: 41, status: 'at-risk', due: '2026-09-30' },
  { id: 'GL-06', employee: 'Ishaan Gupta', goal: 'Close ₹40L pipeline', type: 'Quarterly', progress: 82, status: 'on-track', due: '2026-09-30' },
]

export const HR_REVIEWS = [
  { id: 'RV-01', employee: 'Rohit Sen', reviewer: 'Ishaan Gupta', cycle: 'Q3 2026', rating: 4.0, status: 'completed', due: '2026-08-10' },
  { id: 'RV-02', employee: 'Fatima Sheikh', reviewer: 'Divya Menon', cycle: 'Q3 2026', rating: 3.9, status: 'in-progress', due: '2026-08-12' },
  { id: 'RV-03', employee: 'Aditya Kulkarni', reviewer: 'Kiran Shetty', cycle: 'Q3 2026', rating: 4.3, status: 'pending', due: '2026-08-15' },
  { id: 'RV-04', employee: 'Neha Verma', reviewer: 'Kiran Shetty', cycle: 'Q3 2026', rating: 4.5, status: 'in-progress', due: '2026-08-14' },
]

export const HR_RATING_DISTRIBUTION = [
  { range: '5.0', count: 18 },
  { range: '4.5–4.9', count: 41 },
  { range: '4.0–4.4', count: 46 },
  { range: '3.5–3.9', count: 28 },
  { range: '< 3.5', count: 9 },
]

export const HR_PERFORMANCE_TREND = [
  { quarter: 'Q4 25', rating: 4.1 },
  { quarter: 'Q1 26', rating: 4.2 },
  { quarter: 'Q2 26', rating: 4.3 },
  { quarter: 'Q3 26', rating: 4.4 },
]

export const HR_TRAINING = [
  { id: 'TR-01', program: 'Leadership Essentials', department: 'All', enrolled: 14, completion: 82, status: 'active' },
  { id: 'TR-02', program: 'React 19 Deep Dive', department: 'Engineering', enrolled: 22, completion: 91, status: 'active' },
  { id: 'TR-03', program: 'Effective Communication', department: 'All', enrolled: 18, completion: 64, status: 'active' },
  { id: 'TR-04', program: 'Data Privacy & Security', department: 'All', enrolled: 31, completion: 100, status: 'completed' },
]

export const HR_APPRAISAL_STATS = { currentCycle: 'H2 2026', employeesDue: 61, completed: 24, salaryRevisions: 8, promotions: 3, inProgress: 29 }

export const HR_APPRAISAL_CYCLES = [
  { id: 'AP-01', cycle: 'H2 2026', period: 'Jul – Dec 2026', stage: 'self-review', employees: 61, status: 'active' },
  { id: 'AP-02', cycle: 'H1 2026', period: 'Jan – Jun 2026', stage: 'closed', employees: 58, status: 'closed' },
  { id: 'AP-03', cycle: 'FY 2025', period: 'Jan – Dec 2025', stage: 'closed', employees: 52, status: 'closed' },
]

export const HR_SALARY_REVISIONS = [
  { id: 'SR-01', employee: 'Ananya Rao', current: '₹18.5L', revised: '₹20.5L', pct: 10.8, reason: 'High performer', status: 'approved', effective: '2026-10-01' },
  { id: 'SR-02', employee: 'Karan Mehta', current: '₹20.0L', revised: '₹21.5L', pct: 7.5, reason: 'Promotion', status: 'pending', effective: '2026-10-01' },
  { id: 'SR-03', employee: 'Priya Nair', current: '₹12.0L', revised: '₹13.2L', pct: 10.0, reason: 'High performer', status: 'pending', effective: '2026-10-01' },
  { id: 'SR-04', employee: 'Sara Thomas', current: '₹8.5L', revised: '₹8.9L', pct: 4.7, reason: 'Market correction', status: 'approved', effective: '2026-10-01' },
]

export const HR_PROMOTIONS = [
  { id: 'PM-01', employee: 'Divya Menon', from: 'HRBP', to: 'Senior HRBP', effective: '2026-10-01', status: 'approved' },
  { id: 'PM-02', employee: 'Karan Mehta', from: 'DevOps Engineer', to: 'Senior DevOps Engineer', effective: '2026-10-01', status: 'pending' },
  { id: 'PM-03', employee: 'Neha Verma', from: 'Brand Designer', to: 'Lead Designer', effective: '2027-01-01', status: 'pending' },
]

export const HR_APPRAISAL_APPROVALS = [
  { id: 'AA-01', employee: 'Rohit Sen', rating: 4.0, revision: '6%', manager: 'Ishaan Gupta', status: 'pending' },
  { id: 'AA-02', employee: 'Fatima Sheikh', rating: 3.9, revision: '5%', manager: 'Divya Menon', status: 'approved' },
  { id: 'AA-03', employee: 'Aditya Kulkarni', rating: 4.3, revision: '8%', manager: 'Kiran Shetty', status: 'pending' },
  { id: 'AA-04', employee: 'Sara Thomas', rating: 4.1, revision: '4.7%', manager: 'Divya Menon', status: 'approved' },
]
