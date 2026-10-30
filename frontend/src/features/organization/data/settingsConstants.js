/**
 * Organization Settings — shared constants
 *
 * Single source of truth for the Settings hub (Organization, Invoice,
 * Email Templates, General, Roles & Permissions, Notifications).
 * Nothing here is hardcoded per-organization: values are option lists and
 * defaults that the backend may override with stored organization settings.
 */

/* ─────────────────────────────────────────────
   Settings tabs
   ───────────────────────────────────────────── */
export const SETTINGS_TABS = [
  { id: 'organization', label: 'Organization' },
  { id: 'invoice', label: 'Invoice' },
  { id: 'email-templates', label: 'Email Templates' },
  { id: 'general', label: 'General' },
  { id: 'roles', label: 'Roles & Permissions' },
  { id: 'notifications', label: 'Notifications' },
]

/* ─────────────────────────────────────────────
   Roles & Permissions
   ───────────────────────────────────────────── */

// Actual application modules surfaced in the Organization Admin dashboard.
// Only modules that exist in this product are listed.
export const PERMISSION_MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'students', label: 'Students' },
  { id: 'courses', label: 'Courses' },
  { id: 'batches', label: 'Batches' },
  { id: 'classes', label: 'Classes' },
  { id: 'live-classes', label: 'Live Classes' },
  { id: 'tutors', label: 'Mentors' },
  { id: 'courseMaterials', label: 'Course Materials' },
  { id: 'employees', label: 'Employees' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'payroll', label: 'Payroll' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'reports', label: 'Reports' },
  { id: 'roles', label: 'Roles & Permissions' },
  { id: 'settings', label: 'Settings' },
]

export const PERMISSION_ACTIONS = ['view', 'add', 'edit', 'delete', 'export', 'approve']

export const PERMISSION_ACTION_LABELS = {
  view: 'View',
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  export: 'Export',
  approve: 'Approve',
}

// Modules whose action keys follow `module.action` (singular).
const ACTION_KEY_OVERRIDES = {
  courseMaterials: 'course-materials',
}

export const permissionKey = (moduleId, action) => {
  const moduleKey = ACTION_KEY_OVERRIDES[moduleId] || moduleId
  return `${moduleKey}.${action}`
}

// System roles are seeded by the platform and cannot be deleted/renamed by an
// organization admin. Super Admin is platform-level and is never assignable here.
export const SYSTEM_ROLES = [
  { id: 'org-admin', name: 'Organization Admin', description: 'Full access to the organization workspace.' },
  { id: 'mentor', name: 'Mentor', description: 'Manages assigned batches, classes, assignments and student progress.' },
  { id: 'student', name: 'Student', description: 'Access to enrolled courses, classes and learning content.' },
]

export const CUSTOM_ROLE_EXAMPLES = [
  'Finance Manager',
  'Academic Coordinator',
  'Operations Manager',
]

export const BLOCKED_ROLE_NAMES = ['super admin', 'superadmin']

// Default permission matrix used for a brand-new custom role (nothing granted).
export const emptyPermissionMatrix = () =>
  PERMISSION_MODULES.reduce((matrix, module) => {
    matrix[module.id] = PERMISSION_ACTIONS.reduce((actions, action) => {
      actions[action] = false
      return actions
    }, {})
    return matrix
  }, {})

/* ─────────────────────────────────────────────
   Notifications
   ───────────────────────────────────────────── */

export const NOTIFICATION_EVENTS = [
  { id: 'student_registration', label: 'Student Registration', inApp: true, email: true },
  { id: 'payment_successful', label: 'Payment Successful', inApp: true, email: true },
  { id: 'enrollment_confirmation', label: 'Enrollment Confirmation', inApp: true, email: true },
  { id: 'batch_assignment', label: 'Batch Assignment', inApp: true, email: true },
  { id: 'student_credentials', label: 'Student Credentials', inApp: false, email: true },
  { id: 'tutor_credentials', label: 'Mentor Credentials', inApp: false, email: true },
  { id: 'employee_credentials', label: 'Employee Credentials', inApp: false, email: true },
  { id: 'subscription_expiry', label: 'Subscription Expiry', inApp: true, email: true, timing: { unit: 'days', value: 7 } },
  { id: 'payment_pending', label: 'Payment Pending', inApp: true, email: true, timing: { unit: 'days', value: 3 } },
  { id: 'class_reminder', label: 'Class Reminder', inApp: true, email: true, timing: { unit: 'minutes', value: 30 } },
  { id: 'quiz_availability', label: 'Quiz Availability', inApp: true, email: true },
  { id: 'payslip_availability', label: 'Payslip Availability', inApp: true, email: true },
]

export const NOTIFICATION_TIMING_EVENTS = ['subscription_expiry', 'payment_pending', 'class_reminder']

/* ─────────────────────────────────────────────
   Email Templates
   ───────────────────────────────────────────── */

export const EMAIL_TEMPLATES = [
  {
    id: 'student_credentials',
    name: 'Student Credentials',
    description: 'Sent when student login credentials are created or reset.',
    subject: 'Welcome to {{organizationName}}',
    body: `Hello {{studentName}},

Welcome to {{organizationName}}! Your account has been created for {{courseName}} ({{batchName}}).

Login: {{loginUrl}}
Email: {{email}}

To set your password, use this secure link: {{passwordSetupLink}}

We look forward to learning with you.

Regards,
{{organizationName}}`,
    variables: ['studentName', 'organizationName', 'email', 'loginUrl', 'courseName', 'batchName', 'passwordSetupLink'],
    status: 'active',
  },
  {
    id: 'tutor_credentials',
    name: 'Mentor Credentials',
    description: 'Sent when mentor login credentials are created or reset.',
    subject: 'Your {{organizationName}} mentor account',
    body: `Hello {{tutorName}},

Your mentor account for {{organizationName}} is ready.

Login: {{loginUrl}}
Email: {{email}}

Assigned course: {{assignedCourse}}
Assigned batch: {{assignedBatch}}

Set your password here: {{passwordSetupLink}}

Regards,
{{organizationName}}`,
    variables: ['tutorName', 'organizationName', 'email', 'loginUrl', 'assignedCourse', 'assignedBatch', 'passwordSetupLink'],
    status: 'active',
  },
  {
    id: 'employee_credentials',
    name: 'Employee Credentials',
    description: 'Sent when employee login credentials are created or reset.',
    subject: 'Your {{organizationName}} employee account',
    body: `Hello {{employeeName}},

Your employee account ({{employeeCode}}) for {{organizationName}} is ready.

Role: {{role}}
Login: {{loginUrl}}
Email: {{email}}

Set your password here: {{passwordSetupLink}}

Regards,
{{organizationName}}`,
    variables: ['employeeName', 'employeeCode', 'organizationName', 'email', 'role', 'loginUrl', 'passwordSetupLink'],
    status: 'active',
  },
  {
    id: 'payment_confirmation',
    name: 'Payment Confirmation',
    description: 'Sent after a payment is successfully recorded.',
    subject: 'Payment received — Invoice {{invoiceNumber}}',
    body: `Hello {{studentName}},

We received your payment of {{paymentAmount}} on {{paymentDate}} via {{paymentMethod}}.

Invoice: {{invoiceNumber}}
Remaining balance: {{remainingBalance}}

Download your receipt: {{receiptUrl}}

Thank you,
{{organizationName}}`,
    variables: ['studentName', 'invoiceNumber', 'paymentAmount', 'paymentDate', 'paymentMethod', 'remainingBalance', 'receiptUrl'],
    status: 'active',
  },
  {
    id: 'enrollment_confirmation',
    name: 'Enrollment Confirmation',
    description: 'Sent when a student is enrolled in a course/batch.',
    subject: 'Enrollment confirmed — {{courseName}}',
    body: `Hello {{studentName}},

Your enrollment in {{courseName}} ({{batchName}}) has been confirmed.

Start date: {{startDate}}
Mentor: {{tutorName}}

Access your learning portal: {{loginUrl}}

Regards,
{{organizationName}}`,
    variables: ['studentName', 'courseName', 'batchName', 'startDate', 'tutorName', 'loginUrl'],
    status: 'active',
  },
  {
    id: 'subscription_notification',
    name: 'Subscription Notification',
    description: 'Sent by the platform when the organization subscription is nearing expiry.',
    subject: 'Your {{organizationName}} subscription renews soon',
    body: `Hello {{organizationName}},

Your {{planName}} subscription expires on {{expiryDate}} ({{daysRemaining}} days remaining).

Renew now to avoid interruption: {{renewalUrl}}

Regards,
Platform Team`,
    variables: ['organizationName', 'planName', 'expiryDate', 'daysRemaining', 'renewalUrl'],
    status: 'active',
  },
  {
    id: 'batch_assignment',
    name: 'Batch Assignment',
    description: 'Sent when a student is assigned to a batch.',
    subject: 'You have been assigned to {{batchName}}',
    body: `Hello {{studentName}},

You have been assigned to batch {{batchName}} for {{courseName}}.

Batch starts: {{startDate}}

Login to view your schedule: {{loginUrl}}

Regards,
{{organizationName}}`,
    variables: ['studentName', 'courseName', 'batchName', 'startDate', 'loginUrl'],
    status: 'active',
  },
  {
    id: 'payment_pending',
    name: 'Payment Pending',
    description: 'Reminder sent when a payment is due.',
    subject: 'Payment reminder — Invoice {{invoiceNumber}}',
    body: `Hello {{studentName}},

This is a reminder that {{paymentAmount}} for invoice {{invoiceNumber}} is due on {{dueDate}}.

Pay online: {{paymentUrl}}

If you have already paid, please ignore this email.

Regards,
{{organizationName}}`,
    variables: ['studentName', 'invoiceNumber', 'paymentAmount', 'dueDate', 'paymentUrl'],
    status: 'active',
  },
  {
    id: 'class_reminder',
    name: 'Class Reminder',
    description: 'Reminder sent before a scheduled class.',
    subject: 'Upcoming class — {{className}}',
    body: `Hello {{studentName}},

Reminder: {{className}} starts at {{classTime}} on {{classDate}}.

Mentor: {{tutorName}}
Join link: {{joinLink}}

See you there!
{{organizationName}}`,
    variables: ['studentName', 'className', 'classDate', 'classTime', 'tutorName', 'joinLink'],
    status: 'active',
  },
  {
    id: 'quiz_availability',
    name: 'Quiz Availability',
    description: 'Sent when a quiz becomes available to a student.',
    subject: 'A new quiz is available — {{quizName}}',
    body: `Hello {{studentName}},

The quiz "{{quizName}}" is now available for {{courseName}}.

Deadline: {{deadline}}
Start quiz: {{quizUrl}}

Good luck!
{{organizationName}}`,
    variables: ['studentName', 'quizName', 'courseName', 'deadline', 'quizUrl'],
    status: 'active',
  },
  {
    id: 'payslip_availability',
    name: 'Payslip Availability',
    description: 'Sent when a payslip is generated for an employee.',
    subject: 'Your payslip for {{month}} is available',
    body: `Hello {{employeeName}},

Your payslip for {{month}} {{year}} is now available.

View payslip: {{payslipUrl}}

Regards,
{{organizationName}}`,
    variables: ['employeeName', 'month', 'year', 'payslipUrl'],
    status: 'active',
  },
]

// Safe sample values used to render template previews (never persisted).
export const TEMPLATE_SAMPLE_VALUES = {
  studentName: 'Rahul Kumar',
  tutorName: 'Anita Sharma',
  employeeName: 'Priya Nair',
  employeeCode: 'EMP-1024',
  organizationName: 'Your Organization',
  email: 'student@example.com',
  loginUrl: 'https://app.example.com/login',
  courseName: 'Full Stack Development',
  batchName: 'FSD Batch 7',
  passwordSetupLink: 'https://app.example.com/set-password',
  assignedCourse: 'Full Stack Development',
  assignedBatch: 'FSD Batch 7',
  role: 'HR Manager',
  invoiceNumber: 'INV-2026-00125',
  paymentAmount: '₹15,000',
  paymentDate: '18 Aug 2026',
  paymentMethod: 'UPI',
  remainingBalance: '₹0',
  receiptUrl: 'https://app.example.com/receipts/125',
  startDate: '01 Sep 2026',
  planName: 'Growth Plan',
  expiryDate: '30 Sep 2026',
  daysRemaining: '7',
  renewalUrl: 'https://app.example.com/renew',
  dueDate: '25 Aug 2026',
  paymentUrl: 'https://app.example.com/pay',
  className: 'React Hooks Masterclass',
  classDate: '21 Aug 2026',
  classTime: '6:00 PM',
  joinLink: 'https://meet.example.com/class',
  quizName: 'React Fundamentals Quiz',
  deadline: '28 Aug 2026',
  quizUrl: 'https://app.example.com/quiz/42',
  month: 'August',
  year: '2026',
  payslipUrl: 'https://app.example.com/payslips/88',
}

export const renderTemplatePreview = (template, values = TEMPLATE_SAMPLE_VALUES) =>
  String(template ?? '').replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) =>
    values[key] !== undefined ? values[key] : match,
  )

/* ─────────────────────────────────────────────
   General settings
   ───────────────────────────────────────────── */

export const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '18/08/2026' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '08/18/2026' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2026-08-18' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY', example: '18 Aug 2026' },
]

export const TIME_FORMATS = [
  { value: '12h', label: '12 Hour', example: '10:30 AM' },
  { value: '24h', label: '24 Hour', example: '22:30' },
]

export const CURRENCIES = [
  { value: 'INR', label: 'INR — ₹', symbol: '₹' },
  { value: 'USD', label: 'USD — $', symbol: '$' },
  { value: 'EUR', label: 'EUR — €', symbol: '€' },
  { value: 'GBP', label: 'GBP — £', symbol: '£' },
  { value: 'AED', label: 'AED — د.إ', symbol: 'AED ' },
]

export const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (UTC+05:30)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (UTC+04:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC+08:00)' },
  { value: 'UTC', label: 'UTC (UTC+00:00)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+00:00)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (UTC+01:00)' },
  { value: 'America/New_York', label: 'America/New_York (UTC-05:00)' },
  { value: 'America/Chicago', label: 'America/Chicago (UTC-06:00)' },
  { value: 'America/Denver', label: 'America/Denver (UTC-07:00)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC-08:00)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (UTC+10:00)' },
]

/* ─────────────────────────────────────────────
   Invoice settings
   ───────────────────────────────────────────── */

export const INVOICE_NUMBER_FORMATS = [
  { value: 'INV-{YEAR}-{NUMBER}', label: 'INV-{YEAR}-{NUMBER}', example: 'INV-2026-00125' },
  { value: '{ORG}/INV/{YEAR}/{NUMBER}', label: '{ORG}/INV/{YEAR}/{NUMBER}', example: 'ABC/INV/2026/00125' },
  { value: '{YEAR}/{NUMBER}', label: '{YEAR}/{NUMBER}', example: '2026/00125' },
  { value: 'INV-{NUMBER}', label: 'INV-{NUMBER}', example: 'INV-00125' },
]

/**
 * mergeDefined — spread `source` over `defaults`, skipping null/undefined so an
 * incomplete API response can never overwrite safe defaults with undefined.
 */
export const mergeDefined = (defaults, source = {}) => {
  const clean = Object.entries(source || {}).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) acc[key] = value
    return acc
  }, {})
  return { ...defaults, ...clean }
}

export const buildInvoiceNumberPreview = (format, organizationCode = 'ORG', sequence = 125) =>
  String(format || '')
    .replace(/\{YEAR\}/g, new Date().getFullYear())
    .replace(/\{ORG\}/g, organizationCode || 'ORG')
    .replace(/\{NUMBER\}/g, String(sequence).padStart(5, '0'))

/* ─────────────────────────────────────────────
   Countries (used by the searchable country select)
   ───────────────────────────────────────────── */
export const COUNTRIES = [
  { value: 'AF', label: 'Afghanistan' }, { value: 'AL', label: 'Albania' }, { value: 'DZ', label: 'Algeria' },
  { value: 'AD', label: 'Andorra' }, { value: 'AO', label: 'Angola' }, { value: 'AG', label: 'Antigua and Barbuda' },
  { value: 'AR', label: 'Argentina' }, { value: 'AM', label: 'Armenia' }, { value: 'AU', label: 'Australia' },
  { value: 'AT', label: 'Austria' }, { value: 'AZ', label: 'Azerbaijan' }, { value: 'BS', label: 'Bahamas' },
  { value: 'BH', label: 'Bahrain' }, { value: 'BD', label: 'Bangladesh' }, { value: 'BB', label: 'Barbados' },
  { value: 'BY', label: 'Belarus' }, { value: 'BE', label: 'Belgium' }, { value: 'BZ', label: 'Belize' },
  { value: 'BJ', label: 'Benin' }, { value: 'BT', label: 'Bhutan' }, { value: 'BO', label: 'Bolivia' },
  { value: 'BA', label: 'Bosnia and Herzegovina' }, { value: 'BW', label: 'Botswana' }, { value: 'BR', label: 'Brazil' },
  { value: 'BN', label: 'Brunei' }, { value: 'BG', label: 'Bulgaria' }, { value: 'BF', label: 'Burkina Faso' },
  { value: 'BI', label: 'Burundi' }, { value: 'CV', label: 'Cabo Verde' }, { value: 'KH', label: 'Cambodia' },
  { value: 'CM', label: 'Cameroon' }, { value: 'CA', label: 'Canada' }, { value: 'CF', label: 'Central African Republic' },
  { value: 'TD', label: 'Chad' }, { value: 'CL', label: 'Chile' }, { value: 'CN', label: 'China' },
  { value: 'CO', label: 'Colombia' }, { value: 'KM', label: 'Comoros' }, { value: 'CD', label: 'Congo, Democratic Republic of the' },
  { value: 'CG', label: 'Congo, Republic of the' }, { value: 'CR', label: 'Costa Rica' }, { value: 'CI', label: "Côte d'Ivoire" },
  { value: 'HR', label: 'Croatia' }, { value: 'CU', label: 'Cuba' }, { value: 'CY', label: 'Cyprus' },
  { value: 'CZ', label: 'Czech Republic' }, { value: 'DK', label: 'Denmark' }, { value: 'DJ', label: 'Djibouti' },
  { value: 'DM', label: 'Dominica' }, { value: 'DO', label: 'Dominican Republic' }, { value: 'EC', label: 'Ecuador' },
  { value: 'EG', label: 'Egypt' }, { value: 'SV', label: 'El Salvador' }, { value: 'GQ', label: 'Equatorial Guinea' },
  { value: 'ER', label: 'Eritrea' }, { value: 'EE', label: 'Estonia' }, { value: 'SZ', label: 'Eswatini' },
  { value: 'ET', label: 'Ethiopia' }, { value: 'FJ', label: 'Fiji' }, { value: 'FI', label: 'Finland' },
  { value: 'FR', label: 'France' }, { value: 'GA', label: 'Gabon' }, { value: 'GM', label: 'Gambia' },
  { value: 'GE', label: 'Georgia' }, { value: 'DE', label: 'Germany' }, { value: 'GH', label: 'Ghana' },
  { value: 'GR', label: 'Greece' }, { value: 'GD', label: 'Grenada' }, { value: 'GT', label: 'Guatemala' },
  { value: 'GN', label: 'Guinea' }, { value: 'GW', label: 'Guinea-Bissau' }, { value: 'GY', label: 'Guyana' },
  { value: 'HT', label: 'Haiti' }, { value: 'HN', label: 'Honduras' }, { value: 'HU', label: 'Hungary' },
  { value: 'IS', label: 'Iceland' }, { value: 'IN', label: 'India' }, { value: 'ID', label: 'Indonesia' },
  { value: 'IR', label: 'Iran' }, { value: 'IQ', label: 'Iraq' }, { value: 'IE', label: 'Ireland' },
  { value: 'IL', label: 'Israel' }, { value: 'IT', label: 'Italy' }, { value: 'JM', label: 'Jamaica' },
  { value: 'JP', label: 'Japan' }, { value: 'JO', label: 'Jordan' }, { value: 'KZ', label: 'Kazakhstan' },
  { value: 'KE', label: 'Kenya' }, { value: 'KI', label: 'Kiribati' }, { value: 'KW', label: 'Kuwait' },
  { value: 'KG', label: 'Kyrgyzstan' }, { value: 'LA', label: 'Laos' }, { value: 'LV', label: 'Latvia' },
  { value: 'LB', label: 'Lebanon' }, { value: 'LS', label: 'Lesotho' }, { value: 'LR', label: 'Liberia' },
  { value: 'LY', label: 'Libya' }, { value: 'LI', label: 'Liechtenstein' }, { value: 'LT', label: 'Lithuania' },
  { value: 'LU', label: 'Luxembourg' }, { value: 'MG', label: 'Madagascar' }, { value: 'MW', label: 'Malawi' },
  { value: 'MY', label: 'Malaysia' }, { value: 'MV', label: 'Maldives' }, { value: 'ML', label: 'Mali' },
  { value: 'MT', label: 'Malta' }, { value: 'MH', label: 'Marshall Islands' }, { value: 'MR', label: 'Mauritania' },
  { value: 'MU', label: 'Mauritius' }, { value: 'MX', label: 'Mexico' }, { value: 'FM', label: 'Micronesia' },
  { value: 'MD', label: 'Moldova' }, { value: 'MC', label: 'Monaco' }, { value: 'MN', label: 'Mongolia' },
  { value: 'ME', label: 'Montenegro' }, { value: 'MA', label: 'Morocco' }, { value: 'MZ', label: 'Mozambique' },
  { value: 'MM', label: 'Myanmar' }, { value: 'NA', label: 'Namibia' }, { value: 'NR', label: 'Nauru' },
  { value: 'NP', label: 'Nepal' }, { value: 'NL', label: 'Netherlands' }, { value: 'NZ', label: 'New Zealand' },
  { value: 'NI', label: 'Nicaragua' }, { value: 'NE', label: 'Niger' }, { value: 'NG', label: 'Nigeria' },
  { value: 'KP', label: 'North Korea' }, { value: 'MK', label: 'North Macedonia' }, { value: 'NO', label: 'Norway' },
  { value: 'OM', label: 'Oman' }, { value: 'PK', label: 'Pakistan' }, { value: 'PW', label: 'Palau' },
  { value: 'PS', label: 'Palestine' }, { value: 'PA', label: 'Panama' }, { value: 'PG', label: 'Papua New Guinea' },
  { value: 'PY', label: 'Paraguay' }, { value: 'PE', label: 'Peru' }, { value: 'PH', label: 'Philippines' },
  { value: 'PL', label: 'Poland' }, { value: 'PT', label: 'Portugal' }, { value: 'QA', label: 'Qatar' },
  { value: 'RO', label: 'Romania' }, { value: 'RU', label: 'Russia' }, { value: 'RW', label: 'Rwanda' },
  { value: 'KN', label: 'Saint Kitts and Nevis' }, { value: 'LC', label: 'Saint Lucia' }, { value: 'VC', label: 'Saint Vincent and the Grenadines' },
  { value: 'WS', label: 'Samoa' }, { value: 'SM', label: 'San Marino' }, { value: 'ST', label: 'Sao Tome and Principe' },
  { value: 'SA', label: 'Saudi Arabia' }, { value: 'SN', label: 'Senegal' }, { value: 'RS', label: 'Serbia' },
  { value: 'SC', label: 'Seychelles' }, { value: 'SL', label: 'Sierra Leone' }, { value: 'SG', label: 'Singapore' },
  { value: 'SK', label: 'Slovakia' }, { value: 'SI', label: 'Slovenia' }, { value: 'SB', label: 'Solomon Islands' },
  { value: 'SO', label: 'Somalia' }, { value: 'ZA', label: 'South Africa' }, { value: 'KR', label: 'South Korea' },
  { value: 'SS', label: 'South Sudan' }, { value: 'ES', label: 'Spain' }, { value: 'LK', label: 'Sri Lanka' },
  { value: 'SD', label: 'Sudan' }, { value: 'SR', label: 'Suriname' }, { value: 'SE', label: 'Sweden' },
  { value: 'CH', label: 'Switzerland' }, { value: 'SY', label: 'Syria' }, { value: 'TW', label: 'Taiwan' },
  { value: 'TJ', label: 'Tajikistan' }, { value: 'TZ', label: 'Tanzania' }, { value: 'TH', label: 'Thailand' },
  { value: 'TL', label: 'Timor-Leste' }, { value: 'TG', label: 'Togo' }, { value: 'TO', label: 'Tonga' },
  { value: 'TT', label: 'Trinidad and Tobago' }, { value: 'TN', label: 'Tunisia' }, { value: 'TR', label: 'Turkey' },
  { value: 'TM', label: 'Turkmenistan' }, { value: 'TV', label: 'Tuvalu' }, { value: 'UG', label: 'Uganda' },
  { value: 'UA', label: 'Ukraine' }, { value: 'AE', label: 'United Arab Emirates' }, { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' }, { value: 'UY', label: 'Uruguay' }, { value: 'UZ', label: 'Uzbekistan' },
  { value: 'VU', label: 'Vanuatu' }, { value: 'VA', label: 'Vatican City' }, { value: 'VE', label: 'Venezuela' },
  { value: 'VN', label: 'Vietnam' }, { value: 'YE', label: 'Yemen' }, { value: 'ZM', label: 'Zambia' },
  { value: 'ZW', label: 'Zimbabwe' },
]

/* ─────────────────────────────────────────────
   Industries
   ───────────────────────────────────────────── */
export const INDUSTRIES = [
  { value: 'education', label: 'Education' },
  { value: 'tech', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'other', label: 'Other' },
]
