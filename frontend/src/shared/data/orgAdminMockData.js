export const ORG_ADMIN_STATS = {
  employeeCount: 843,
  departmentCount: 8,
  skillCoverage: 76,
  activeGoals: 24,
  openReviews: 12,
  avgPerformanceScore: 85,
  performanceChange: 4.2,
  employeeGrowth: 8.3,
  departmentGrowth: 14.3,
  goalCompletionRate: 68,
}

export const SKILL_COVERAGE = [
  { name: 'Technical Skills', value: 82, fullMark: 100, color: '#0f55f7' },
  { name: 'Soft Skills', value: 71, fullMark: 100, color: '#06b6a8' },
  { name: 'Leadership Skills', value: 63, fullMark: 100, color: '#06b6a8' },
  { name: 'Domain Skills', value: 78, fullMark: 100, color: '#F59E0B' },
]

export const PERFORMANCE_TREND = [
  { month: 'Jan', score: 72 },
  { month: 'Feb', score: 75 },
  { month: 'Mar', score: 74 },
  { month: 'Apr', score: 78 },
  { month: 'May', score: 76 },
  { month: 'Jun', score: 80 },
  { month: 'Jul', score: 82 },
  { month: 'Aug', score: 79 },
  { month: 'Sep', score: 83 },
  { month: 'Oct', score: 85 },
  { month: 'Nov', score: 84 },
  { month: 'Dec', score: 85 },
]

export const DEPARTMENT_DISTRIBUTION = [
  { name: 'Engineering', value: 312, color: '#0f55f7' },
  { name: 'HR', value: 45, color: '#06b6a8' },
  { name: 'Sales', value: 128, color: '#06b6a8' },
  { name: 'Marketing', value: 86, color: '#F59E0B' },
  { name: 'Finance', value: 52, color: '#EF4444' },
  { name: 'Operations', value: 78, color: '#06b6a8' },
]

export const GOAL_STATS = {
  completed: 16,
  pending: 8,
  overdue: 3,
  inProgress: 12,
}

export const TOP_PERFORMERS = [
  { id: 1, name: 'Alice Johnson', department: 'Engineering', score: 98, avatar: 'AJ', color: 'from-[#0f55f7] to-[#06b6a8]' },
  { id: 2, name: 'Bob Smith', department: 'Sales', score: 95, avatar: 'BS', color: 'from-[#06b6a8] to-[#0f55f7]' },
  { id: 3, name: 'Carol Davis', department: 'Marketing', score: 92, avatar: 'CD', color: 'from-[#0f55f7] to-[#06b6a8]' },
  { id: 4, name: 'David Lee', department: 'Engineering', score: 91, avatar: 'DL', color: 'from-amber-500 to-orange-500' },
  { id: 5, name: 'Eva Martinez', department: 'HR', score: 89, avatar: 'EM', color: 'from-rose-500 to-pink-500' },
]

export const ORG_RECENT_ACTIVITY = [
  { id: 'a1', user: 'Alice Johnson', action: 'completed a goal', target: 'Q4 Performance Review', time: '30 min ago', initials: 'AJ', color: 'from-[#0f55f7] to-[#06b6a8]' },
  { id: 'a2', user: 'Bob Smith', action: 'added a new skill', target: 'Advanced Negotiation', time: '2 hours ago', initials: 'BS', color: 'from-[#06b6a8] to-[#0f55f7]' },
  { id: 'a3', user: 'Carol Davis', action: 'submitted a review', target: 'Marketing Campaign Analysis', time: '5 hours ago', initials: 'CD', color: 'from-[#0f55f7] to-[#06b6a8]' },
  { id: 'a4', user: 'System', action: 'assigned promotion', target: 'David Lee → Senior Developer', time: '1 day ago', initials: 'SY', color: 'from-amber-500 to-orange-500' },
  { id: 'a5', user: 'Eva Martinez', action: 'started a new goal', target: 'Employee Wellness Program', time: '2 days ago', initials: 'EM', color: 'from-rose-500 to-pink-500' },
]

