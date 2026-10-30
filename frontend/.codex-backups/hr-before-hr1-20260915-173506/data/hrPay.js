// KINI HRMS — mock data: payroll, payslips.

export const HR_PAYROLL_STATS = {
  grossPay: '₹42.6L', netPay: '₹34.1L', taxes: '₹6.2L', processedEmployees: 151,
  nextRun: 'Aug 5, 2026', ytdGross: '₹2.84Cr', overtime: '₹1.8L',
}

export const HR_PAYROLL_HISTORY = [
  { id: 'PR-01', period: 'July 2026', employees: 151, gross: '₹42.6L', net: '₹34.1L', taxes: '₹6.2L', status: 'processed', processedOn: '2026-08-01', runBy: 'Kavya Menon' },
  { id: 'PR-02', period: 'June 2026', employees: 149, gross: '₹41.9L', net: '₹33.6L', taxes: '₹6.1L', status: 'processed', processedOn: '2026-07-01', runBy: 'Kavya Menon' },
  { id: 'PR-03', period: 'May 2026', employees: 146, gross: '₹40.8L', net: '₹32.7L', taxes: '₹5.9L', status: 'processed', processedOn: '2026-06-01', runBy: 'Kavya Menon' },
  { id: 'PR-04', period: 'August 2026', employees: 153, gross: '—', net: '—', taxes: '—', status: 'scheduled', processedOn: '—', runBy: '—' },
]

export const HR_SALARY_STRUCTURES = [
  { id: 'SS-01', employee: 'Ananya Rao', band: 'L3 — Engineer', ctc: 18.5, basic: 7.4, hra: 3.7, allowances: 4.2, bonus: 1.5, deductions: 1.7, netMonthly: 1.39 },
  { id: 'SS-02', employee: 'Vikram Shah', band: 'M2 — Senior Mentor', ctc: 24.0, basic: 9.6, hra: 4.8, allowances: 5.5, bonus: 2.0, deductions: 2.1, netMonthly: 1.83 },
  { id: 'SS-03', employee: 'Priya Nair', band: 'L2 — Recruiter', ctc: 12.0, basic: 4.8, hra: 2.4, allowances: 2.8, bonus: 1.0, deductions: 1.0, netMonthly: 0.92 },
  { id: 'SS-04', employee: 'Karan Mehta', band: 'L3 — DevOps', ctc: 20.0, basic: 8.0, hra: 4.0, allowances: 4.6, bonus: 1.7, deductions: 1.7, netMonthly: 1.53 },
  { id: 'SS-05', employee: 'Divya Menon', band: 'M1 — HRBP', ctc: 22.0, basic: 8.8, hra: 4.4, allowances: 5.1, bonus: 1.8, deductions: 1.9, netMonthly: 1.68 },
]

export const HR_PAYROLL_COMPONENTS = [
  { label: 'Basic Salary', amount: 62, color: '#0f55f7' },
  { label: 'HRA', amount: 21, color: '#06b6a8' },
  { label: 'Allowances', amount: 12, color: '#8b5cf6' },
  { label: 'Bonus & Incentives', amount: 5, color: '#F59E0B' },
]

export const HR_PAYROLL_BONUSES = [
  { id: 'BN-01', employee: 'Vikram Shah', type: 'Performance Bonus', amount: 25000, month: 'July 2026', status: 'approved' },
  { id: 'BN-02', employee: 'Ananya Rao', type: 'Referral Bonus', amount: 8000, month: 'July 2026', status: 'paid' },
  { id: 'BN-03', employee: 'Nikhil Verma', type: 'Quarterly Incentive', amount: 18000, month: 'August 2026', status: 'pending' },
  { id: 'BN-04', employee: 'Ishaan Gupta', type: 'Sales Target', amount: 32000, month: 'July 2026', status: 'paid' },
]

export const HR_PAYROLL_DEDUCTIONS = [
  { id: 'DN-01', employee: 'Karan Mehta', type: 'TDS', amount: 14500, month: 'July 2026', status: 'applied' },
  { id: 'DN-02', employee: 'Vikram Shah', type: 'PF', amount: 11500, month: 'July 2026', status: 'applied' },
  { id: 'DN-03', employee: 'Rohit Sen', type: 'Salary Advance', amount: 10000, month: 'August 2026', status: 'pending' },
  { id: 'DN-04', employee: 'Sara Thomas', type: 'Insurance', amount: 2400, month: 'July 2026', status: 'applied' },
]

export const HR_PAYROLL_CALENDAR = [
  { date: 5, label: 'Payroll run', kind: 'run' },
  { date: 10, label: 'Salary credit', kind: 'pay' },
  { date: 15, label: 'TDS deposit', kind: 'tax' },
  { date: 20, label: 'Reimbursements', kind: 'pay' },
  { date: 28, label: 'Attendance lock', kind: 'lock' },
]

export const HR_PAYSLIPS = [
  { id: 'PS-2407-101', employee: 'Ananya Rao', period: 'July 2026', gross: 154170, net: 121820, status: 'generated', generatedOn: '2026-08-01' },
  { id: 'PS-2407-102', employee: 'Vikram Shah', period: 'July 2026', gross: 200000, net: 158400, status: 'generated', generatedOn: '2026-08-01' },
  { id: 'PS-2407-103', employee: 'Karan Mehta', period: 'July 2026', gross: 166670, net: 131800, status: 'sent', generatedOn: '2026-08-01' },
  { id: 'PS-2407-104', employee: 'Priya Nair', period: 'July 2026', gross: 100000, net: 78900, status: 'sent', generatedOn: '2026-08-01' },
  { id: 'PS-2407-105', employee: 'Divya Menon', period: 'July 2026', gross: 183330, net: 145200, status: 'generated', generatedOn: '2026-08-01' },
  { id: 'PS-2408-101', employee: 'Ananya Rao', period: 'August 2026', gross: 154170, net: 121820, status: 'draft', generatedOn: '—' },
]

export const HR_PAYSLIP_BREAKDOWN = [
  { label: 'Basic', amount: 74000, type: 'earning' },
  { label: 'HRA', amount: 37000, type: 'earning' },
  { label: 'Special Allowance', amount: 21000, type: 'earning' },
  { label: 'Travel Allowance', amount: 3000, type: 'earning' },
  { label: 'Performance Bonus', amount: 8000, type: 'earning' },
  { label: 'TDS', amount: -14450, type: 'deduction' },
  { label: 'Provident Fund', amount: -8890, type: 'deduction' },
  { label: 'Professional Tax', amount: -200, type: 'deduction' },
  { label: 'Insurance', amount: -1800, type: 'deduction' },
]

export const HR_PAYSLIP_PREVIEW = {
  company: 'Kini EdX Hub Private Limited',
  companyAddr: 'Level 4, Tech Tower, Koramangala, Bengaluru 560034',
  pan: 'AAACK1234F', tan: 'BLRX12345A', cin: 'U80301KA2016PTC092101',
  employee: 'Ananya Rao', empId: 'EMP-101', designation: 'Frontend Engineer', dept: 'Engineering',
  bank: 'HDFC Bank ······4521', uan: 'IN/BNG/123456/789', doj: '2024-03-18',
  period: 'July 2026', daysPaid: 31, payDate: '2026-08-10',
}
