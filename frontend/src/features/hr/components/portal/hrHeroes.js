import {
  BarChart3, Bell, BookOpen, Code, Briefcase, CalendarCheck, CalendarDays, CheckCircle2, ClipboardCheck,
  FileText, FolderOpen, GraduationCap, Layers3, Link2, Megaphone, RefreshCw, Route, ShieldCheck, Target, Timer,
  TrendingUp, Users,
} from 'lucide-react'
import { HR_BANNERS } from './hrBanners'

/**
 * HR portal hero copy per screen (v22). Spread into <HrHero {...heroProps('employees')} />.
 * title: [dark, accent]; tight joins them without a space ("Employ" + "ees").
 */
export const HR_HEROES = {
  // v24 — image 11: plain title, no eyebrow / chips; the artwork carries its own sticky note.
  employees: { eyebrow: null, title: 'Employees', subtitle: "Manage your organization's workforce, roles, and access.", art: 'employees', script: [], features: [] },
  batches: { eyebrow: 'Training Management', title: ['Training', 'Batches'], subtitle: 'Manage and track your training batches, monitor progress, attendance, and keep learning plans on track.', art: 'batches', script: [], features: [[TrendingUp, 'Track Progress', 'blue'], [CalendarCheck, 'Manage Attendance', 'sky'], [Users, 'Assign Mentors', 'purple'], [Layers3, 'Organize Learning', 'green']] },
  syllabus: { title: ['Syllabus', 'Management'], subtitle: "Add modules, topics and lessons for a course or a batch's linked course. Keep your learning content organized and up to date.", art: 'syllabus', script: ['Structured', 'Learning', 'Better', 'Results'], features: [[FolderOpen, 'Organize Content', 'orange'], [Link2, 'Link with Batches', 'blue'], [Route, 'Track Learning Path', 'purple'], [RefreshCw, 'Keep Updated', 'green']] },
  students: { title: ['Students', 'Management'], subtitle: 'Manage student enrollments, track progress, monitor performance and keep your learning community engaged.', art: 'students', script: [], features: [[Users, 'Track Enrollments', 'blue'], [ShieldCheck, 'Monitor Progress', 'sky'], [BarChart3, 'Analyze Performance', 'purple'], [GraduationCap, 'Build Better Learners', 'green']] },
  attendance: { title: ['Attendance', 'Management'], subtitle: "Track your team's attendance, working hours, and stay consistent with your organization's goals.", art: 'attendance', script: ['Discipline', 'Today', 'Stronger Teams', 'Tomorrow'], features: [[CalendarCheck, 'Track Attendance', 'blue'], [Timer, 'Monitor Hours', 'sky'], [BarChart3, 'View Reports', 'purple'], [TrendingUp, 'Improve Productivity', 'green']] },
  leave: { title: ['Leave', 'Management'], subtitle: 'Manage employee leave requests, track approvals, and maintain leave balances for a healthier and more productive workplace.', art: 'leave', script: ['Healthy', 'People', 'Build', 'Stronger Teams'], features: [[ClipboardCheck, 'Streamline Requests', 'blue'], [CheckCircle2, 'Multi-Level Approval', 'blue'], [CalendarDays, 'Track Leave Balance', 'green'], [FileText, 'Generate Reports', 'purple']] },
  performance: { title: ['Performance', 'Management'], subtitle: 'Track employee performance, conduct reviews, set goals, and build a high-performing team.', art: 'performance', script: ['Growth', 'Feedback', 'Better', 'Tomorrow'], features: [] },
  calendar: { title: ['Calendar &', 'Events'], accentTone: 'orange', subtitle: 'View and manage all important events, classes, meetings, leaves and holidays in one place. Stay organized and never miss anything.', art: 'calendar', script: ['Plan', 'Organize', 'Collaborate', 'Stay Ahead'], features: [] },
  resources: { title: ['Learning', 'Resources'], subtitle: 'Access learning materials, guides, templates, and code examples to support your professional growth.', art: 'resources', script: ['Learn', 'Apply', 'Grow', 'Succeed'], scriptStyle: 'note', features: [[BookOpen, 'Curated Content', 'blue'], [Users, 'Expert Guides', 'purple'], [Code, 'Hands-on Examples', 'green'], [TrendingUp, 'Career Growth', 'orange']] },
  announcements: { title: ['Announce', 'ments'], tight: true, subtitle: 'Create, manage and share important updates, news and notifications with your employees.', art: 'announcements', script: ['Inform', 'Engage', 'Align', 'Grow Together'], features: [] },
  settings: { title: ['HR', 'Settings'], accentTone: 'orange', subtitle: 'Manage your profile, security, notifications and preferences.', art: 'settings', script: ['Customize', 'Secure', 'Stay Updated', 'Your Way'], features: [] },
}

const ICONS = { Megaphone, Bell, Target, Briefcase, BookOpen }
export { ICONS as HR_HERO_ICONS }

export function heroProps(key) {
  const config = HR_HEROES[key]
  if (!config) return null
  return {
    eyebrow: 'eyebrow' in config ? config.eyebrow : 'HR Portal',
    title: config.title,
    tight: Boolean(config.tight),
    accentTone: config.accentTone ?? 'blue',
    subtitle: config.subtitle,
    art: HR_BANNERS[config.art],
    script: config.script,
    scriptStyle: config.scriptStyle ?? 'plain',
    features: config.features.map(([icon, label, tone]) => ({ icon, label, tone })),
  }
}
