export const SUPER_ADMIN_STATS = {
  totalOrganizations: 128,
  activeOrganizations: 104,
  totalSubscriptions: 128,
  activeSubscriptions: 104,
  upcomingSubscriptions: 12,
  totalStudents: 28430,
  totalTutors: 1280,
  orgGrowth: 18.5,
  activeUsers: 12840,
  userChange: 12.3,
  totalEmployees: 45230,
  employeeGrowth: 8.7,
  monthlyRevenue: 284500,
  mrrTrend: 14.2,
}

export const SUBSCRIPTION_DATA = [
  { name: 'Free Plan', value: 32, color: '#94A3B8' },
  { name: 'Starter Plan', value: 48, color: '#3B82F6' },
  { name: 'Professional Plan', value: 35, color: '#8B5CF6' },
  { name: 'Enterprise Plan', value: 13, color: '#10B981' },
]

export const ORGANIZATION_GROWTH = [
  { month: 'Jan', registrations: 8 },
  { month: 'Feb', registrations: 12 },
  { month: 'Mar', registrations: 15 },
  { month: 'Apr', registrations: 10 },
  { month: 'May', registrations: 18 },
  { month: 'Jun', registrations: 22 },
  { month: 'Jul', registrations: 16 },
  { month: 'Aug', registrations: 20 },
  { month: 'Sep', registrations: 25 },
  { month: 'Oct', registrations: 19 },
  { month: 'Nov', registrations: 28 },
  { month: 'Dec', registrations: 24 },
]

export const USER_ACTIVITY = [
  { day: 'Mon', logins: 1240, sessions: 980, registrations: 45, updates: 320 },
  { day: 'Tue', logins: 1380, sessions: 1050, registrations: 52, updates: 380 },
  { day: 'Wed', logins: 1520, sessions: 1180, registrations: 48, updates: 410 },
  { day: 'Thu', logins: 1450, sessions: 1120, registrations: 56, updates: 390 },
  { day: 'Fri', logins: 1310, sessions: 1020, registrations: 61, updates: 360 },
  { day: 'Sat', logins: 890, sessions: 720, registrations: 38, updates: 280 },
  { day: 'Sun', logins: 760, sessions: 610, registrations: 29, updates: 240 },
]

export const RECENT_ORGANIZATIONS = [
  { id: 'org-001', name: 'Acme Corp', industry: 'Technology', employees: 843, subscription: 'Enterprise', status: 'active', createdDate: 'Jan 15, 2024' },
  { id: 'org-002', name: 'Globex Inc', industry: 'Finance', employees: 1250, subscription: 'Professional', status: 'active', createdDate: 'Feb 3, 2024' },
  { id: 'org-003', name: 'Initech', industry: 'Manufacturing', employees: 520, subscription: 'Starter', status: 'active', createdDate: 'Mar 12, 2024' },
  { id: 'org-004', name: 'Hooli', industry: 'Technology', employees: 2100, subscription: 'Enterprise', status: 'active', createdDate: 'Apr 8, 2024' },
  { id: 'org-005', name: 'Umbrella Corp', industry: 'Healthcare', employees: 980, subscription: 'Professional', status: 'suspended', createdDate: 'May 20, 2024' },
]

export const INSIGHTS_DATA = [
  { icon: 'trending-up', label: 'Organization growth increased by 18% this month', type: 'positive' },
  { icon: 'trending-up', label: 'Enterprise subscriptions increased by 12%', type: 'positive' },
  { icon: 'users', label: 'User engagement improved by 22% week-over-week', type: 'positive' },
  { icon: 'alert', label: '3 organizations have inactive subscriptions', type: 'warning' },
  { icon: 'trending-up', label: 'Monthly recurring revenue up 14.2%', type: 'positive' },
]
