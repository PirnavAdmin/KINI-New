export const INDUSTRIES = [
  { value: 'technology', label: 'Technology & Software' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'healthcare', label: 'Healthcare & Pharma' },
  { value: 'education', label: 'Education & E-Learning' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail & E-Commerce' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'consulting', label: 'Consulting & Professional Services' },
]

export const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1,000 employees' },
  { value: '1001-5000', label: '1,001-5,000 employees' },
  { value: '5001+', label: '5,001+ employees' },
]

export const COUNTRIES = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'in', label: 'India' },
  { value: 'sg', label: 'Singapore' },
  { value: 'ae', label: 'UAE' },
  { value: 'br', label: 'Brazil' },
]

export const TIMEZONES = [
  { value: 'utc-8', label: '(UTC-8) Pacific Time' },
  { value: 'utc-5', label: '(UTC-5) Eastern Time' },
  { value: 'utc+0', label: '(UTC+0) GMT' },
  { value: 'utc+1', label: '(UTC+1) CET' },
  { value: 'utc+5:30', label: '(UTC+5:30) India Standard Time' },
  { value: 'utc+8', label: '(UTC+8) Singapore / China' },
  { value: 'utc+10', label: '(UTC+10) AEST' },
  { value: 'utc+4', label: '(UTC+4) Dubai / Gulf' },
]

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese (Simplified)' },
  { value: 'ja', label: 'Japanese' },
]

export const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'SGD', label: 'SGD (S$)' },
  { value: 'AED', label: 'AED (د.إ)' },
]

export const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY' },
]

export const THEMES = [
  { value: 'system', label: 'System Default' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export const MOCK_COMPANY = {
  id: '1',
  name: 'Acme Corp',
  email: 'hello@acmecorp.com',
  industry: 'Technology & Software',
  size: '501-1,000 employees',
  country: 'United States',
  timezone: '(UTC-5) Eastern Time',
  phone: '+1 (555) 123-4567',
  website: 'https://acmecorp.com',
  address: '350 5th Avenue, Suite 300',
  city: 'New York',
  state: 'NY',
  zip: '10118',
  foundedYear: 2018,
  description:
    'Acme Corp is a leading technology company specializing in enterprise SaaS solutions for HR and people operations.',
  contactPerson: 'Jane Smith',
  employeeCount: 843,
  activeBranches: 12,
  departments: 8,
  activeTeams: 24,
}

export const ACTIVITY_DATA = [
  {
    id: 'a1',
    action: 'Organization profile updated',
    description: 'Company timezone changed to Eastern Time (UTC-5)',
    timestamp: '2 hours ago',
    type: 'update',
  },
  {
    id: 'a2',
    action: 'New branch added',
    description: 'London office registered as a new branch location',
    timestamp: '1 day ago',
    type: 'add',
  },
  {
    id: 'a3',
    action: 'Department restructured',
    description: 'Engineering split into Frontend, Backend, and DevOps',
    timestamp: '3 days ago',
    type: 'update',
  },
  {
    id: 'a4',
    action: 'Company logo changed',
    description: 'New brand logo uploaded by the design team',
    timestamp: '1 week ago',
    type: 'update',
  },
  {
    id: 'a5',
    action: 'Security policy updated',
    description: 'Two-factor authentication enabled for all admin accounts',
    timestamp: '2 weeks ago',
    type: 'security',
  },
]

export const SETTINGS_DEFAULTS = {
  general: {
    organizationName: 'Acme Corp',
    website: 'https://acmecorp.com',
    description:
      'Leading enterprise SaaS platform for HR and people operations.',
  },
  localization: {
    country: 'us',
    language: 'en',
    timezone: 'utc-5',
    currency: 'USD',
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    newMemberAlerts: true,
    leaveRequestAlerts: true,
    securityAlerts: true,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: true,
    ipRestriction: false,
  },
}