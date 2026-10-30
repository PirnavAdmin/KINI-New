import { useState } from 'react'
import {
  User, Building2, BookOpen, CalendarDays, Users2, CalendarCheck, TrendingUp,
  ClipboardCheck, Archive, Wallet, History, Star, Briefcase, Mail, Phone, MapPin,
  Home, Globe, CreditCard, FileText, Clock, BadgeCheck, Award, GraduationCap,
  Video, Heart, Target, MessageSquare, Pencil, Download, Printer, UserPlus,
  CheckSquare, Banknote,
} from 'lucide-react'
import { toast } from 'sonner'
import Button from '@shared/components/Button'
import HRDrawer from '@features/hr/components/HRDrawer'
import HRTimeline from '@features/hr/components/HRTimeline'
import { HRAvatar, HRStatusBadge, HRProgressBar } from '@features/hr/components/hrPrimitives'

/**
 * MentorProfileDrawer — right-side, 12-tab mentor profile experience for the
 * Mentors page (~40–45% viewport width on desktop, full width on mobile).
 * Reuses HRDrawer (portal, ESC + backdrop close), HR primitives and HRTimeline.
 * All data is local mock state — no API calls.
 */

// Masks a sensitive value, keeping only the last `visible` characters.
const maskValue = (value, visible = 4) => {
  const text = String(value ?? '').trim()
  if (!text || text === '—') return '—'
  const clean = text.replace(/[^0-9A-Za-z]/g, '')
  if (clean.length <= visible) return text
  const shown = clean.slice(-visible)
  const masked = 'X'.repeat(clean.length - visible).replace(/(.{4})/g, '$1 ').trim()
  return `${masked} ${shown}`
}

// ── Small reusable blocks ──────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40">
      <header className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0f55f7]/10 text-[#0f55f7] dark:bg-[#0f55f7]/20 dark:text-blue-300">
          {Icon && <Icon className="h-4 w-4" />}
        </span>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
          {subtitle && <p className="truncate text-[11px] text-slate-400">{subtitle}</p>}
        </div>
      </header>
      {children}
    </section>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3 text-slate-400" />}
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      </div>
      <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  )
}

function InfoGrid({ items }) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {items.map((item) => <InfoItem key={item.label} {...item} />)}
    </div>
  )
}

function Chip({ children, accent = '#0f55f7' }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: `${accent}14`, color: accent }}
    >
      {children}
    </span>
  )
}

function Widget({ icon: Icon, label, value, suffix = '', color, progress }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
          <p className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        </div>
        <p className="shrink-0 text-xs font-bold text-slate-800 dark:text-slate-100">{value}{suffix}</p>
      </div>
      <div className="mt-2">
        <HRProgressBar value={progress} color={color} height="h-1" />
      </div>
    </div>
  )
}

const TABS = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'personal', label: 'Personal', icon: User },
  { key: 'professional', label: 'Professional', icon: Building2 },
  { key: 'courses', label: 'Courses', icon: BookOpen },
  { key: 'batches', label: 'Batches', icon: CalendarDays },
  { key: 'students', label: 'Students', icon: Users2 },
  { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { key: 'performance', label: 'Performance', icon: TrendingUp },
  { key: 'leave', label: 'Leave', icon: ClipboardCheck },
  { key: 'documents', label: 'Documents', icon: Archive },
  { key: 'payroll', label: 'Payroll', icon: Wallet },
  { key: 'timeline', label: 'Timeline', icon: History },
]

const TIMELINE_ICONS = {
  notice: UserPlus, approval: BadgeCheck, document: Award, checklist: CheckSquare,
  payroll: Wallet, kt: MessageSquare, interview: Video,
}

export default function MentorProfileDrawer({ open, mentor, onClose, onEdit }) {
  const [activeTab, setActiveTab] = useState('overview')
  if (!mentor) return null

  const handlePrint = () => {
    toast.success('Opening print dialog…')
    window.setTimeout(() => window.print(), 250)
  }

  const quickActions = [
    { label: 'Edit', icon: Pencil, onClick: onEdit },
    { label: 'Assign Batch', icon: CalendarDays, onClick: () => toast.success(`Assign batch for ${mentor.name} (demo)`) },
    { label: 'Assign Course', icon: BookOpen, onClick: () => toast.success(`Assign course for ${mentor.name} (demo)`) },
    { label: 'Message', icon: MessageSquare, onClick: () => toast.success(`Opening chat with ${mentor.name}`) },
    { label: 'Schedule Meeting', icon: Video, onClick: () => toast.success(`Scheduling meeting with ${mentor.name} (demo)`) },
    { label: 'Attendance', icon: CalendarCheck, onClick: () => toast.success(`Opening attendance for ${mentor.name} (demo)`) },
    { label: 'Download', icon: Download, onClick: () => toast.success(`${mentor.name}'s profile downloaded (demo)`) },
    { label: 'Print', icon: Printer, onClick: handlePrint },
  ]

  const footer = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button variant="ghost" size="sm" icon={Printer} onClick={handlePrint}>Print</Button>
      <Button variant="secondary" size="sm" icon={Download} onClick={() => toast.success(`${mentor.name}'s profile downloaded (demo)`)}>Download Profile</Button>
      <Button variant="secondary" size="sm" icon={MessageSquare} onClick={() => toast.success(`Opening chat with ${mentor.name}`)}>Message</Button>
      <Button variant="primary" size="sm" icon={Pencil} onClick={onEdit}>Edit Mentor</Button>
    </div>
  )

  const widgets = [
    {
      label: 'Students Progress', value: mentor.mentees?.length ? Math.round(mentor.mentees.reduce((s, m) => s + m.progress, 0) / mentor.mentees.length) : 0, suffix: '%',
      icon: Users2, color: '#0f55f7', progress: mentor.mentees?.length ? mentor.mentees.reduce((s, m) => s + m.progress, 0) / mentor.mentees.length : 0,
    },
    { label: 'Attendance', value: mentor.attendancePercentage, suffix: '%', icon: CalendarCheck, color: '#06b6a8', progress: mentor.attendancePercentage },
    { label: 'Assignments Reviewed', value: mentor.assignmentsReviewed, icon: ClipboardCheck, color: '#8b5cf6', progress: Math.min(100, (mentor.assignmentsReviewed / 500) * 100) },
    { label: 'Classes Conducted', value: mentor.completedSessions, icon: Video, color: '#EC4899', progress: Math.min(100, (mentor.completedSessions / 400) * 100) },
    { label: 'Average Feedback', value: mentor.averageFeedback, suffix: ' / 5', icon: Star, color: '#F59E0B', progress: (mentor.averageFeedback / 5) * 100 },
    { label: 'Course Completion', value: mentor.courseCompletion, suffix: '%', icon: BookOpen, color: '#10b981', progress: mentor.courseCompletion },
    { label: 'Monthly Rating', value: mentor.monthlyRating, suffix: ' / 5', icon: TrendingUp, color: '#6366f1', progress: (mentor.monthlyRating / 5) * 100 },
    { label: 'Upcoming Sessions', value: mentor.upcomingSessions, icon: CalendarDays, color: '#EF4444', progress: Math.min(100, (mentor.upcomingSessions / 10) * 100) },
  ]

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-[#0f55f7]/8 via-[#06b6a8]/5 to-transparent p-5 dark:border-slate-700 dark:from-[#0f55f7]/15 dark:via-[#06b6a8]/10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <HRAvatar name={mentor.name} size="xl" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{mentor.name}</h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {mentor.employeeId} · {mentor.employeeCode}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                    {mentor.role} · {mentor.designation} · {mentor.department}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <HRStatusBadge status={mentor.status} />
                    <HRStatusBadge status={mentor.availability} />
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                      <Star className="h-3 w-3 fill-current" />{mentor.rating.toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                      {mentor.employmentType}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {[
                  [Briefcase, 'Experience', `${mentor.experience} yrs`],
                  [Users2, 'Students', mentor.studentsAssigned],
                  [CalendarCheck, 'Attendance', `${mentor.attendancePercentage}%`],
                  [Star, 'Rating', mentor.rating.toFixed(1)],
                ].map(([Icon, label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-white/80 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/40">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3 w-3 text-[#0f55f7]" />
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                    </div>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <SectionCard icon={Building2} title="Key Information" subtitle="Reporting, batch and course context">
              <InfoGrid
                items={[
                  { icon: User, label: 'Reporting Manager', value: mentor.reportingManager },
                  { icon: CalendarDays, label: 'Current Batch', value: mentor.currentBatch },
                  { icon: CalendarCheck, label: 'Joining Date', value: mentor.joiningDate },
                  { icon: Home, label: 'Work Mode', value: mentor.workMode },
                ]}
              />
              <div className="mt-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Current Courses</p>
                <div className="flex flex-wrap gap-1.5">
                  {mentor.assignedCourses.map((course) => <Chip key={course}>{course}</Chip>)}
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={Video} title="Quick Actions" subtitle="Common mentor management tasks">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <Button key={action.label} variant="secondary" size="xs" icon={action.icon} onClick={action.onClick}>
                    {action.label}
                  </Button>
                ))}
              </div>
            </SectionCard>
          </div>
        )

      case 'personal':
        return (
          <div className="space-y-4">
            <SectionCard icon={User} title="Personal Information" subtitle="Identity, contact and emergency details">
              <InfoGrid
                items={[
                  { icon: User, label: 'Full Name', value: mentor.name },
                  { icon: User, label: 'Gender', value: mentor.gender },
                  { icon: CalendarDays, label: 'Date of Birth', value: mentor.dob },
                  { icon: Heart, label: 'Blood Group', value: mentor.bloodGroup },
                  { icon: Heart, label: 'Marital Status', value: mentor.maritalStatus },
                  { icon: Globe, label: 'Nationality', value: mentor.nationality },
                  { icon: CreditCard, label: 'Aadhaar Number', value: maskValue(mentor.aadhaar) },
                  { icon: FileText, label: 'PAN Number', value: maskValue(mentor.pan) },
                  { icon: Mail, label: 'Personal Email', value: mentor.personalEmail },
                  { icon: Mail, label: 'Official Email', value: mentor.officialEmail || mentor.email },
                  { icon: Phone, label: 'Mobile Number', value: mentor.phone },
                  { icon: Phone, label: 'Alternate Number', value: mentor.alternateNumber },
                  { icon: Phone, label: 'Emergency Contact', value: mentor.emergencyContact },
                  { icon: User, label: 'Emergency Contact Person', value: mentor.emergencyContactPerson },
                ]}
              />
            </SectionCard>
            <SectionCard icon={MapPin} title="Address Information" subtitle="Current and permanent residence">
              <InfoGrid
                items={[
                  { icon: MapPin, label: 'Current Address', value: mentor.currentAddress },
                  { icon: Home, label: 'Permanent Address', value: mentor.permanentAddress },
                  { icon: MapPin, label: 'City', value: mentor.city },
                  { icon: MapPin, label: 'State', value: mentor.state },
                  { icon: Globe, label: 'Country', value: mentor.country },
                  { icon: MapPin, label: 'Postal Code', value: mentor.postalCode },
                ]}
              />
            </SectionCard>
          </div>
        )

      case 'professional':
        return (
          <div className="space-y-4">
            <SectionCard icon={Building2} title="Organization Details" subtitle="Employment and company information">
              <InfoGrid
                items={[
                  { icon: FileText, label: 'Employee Code', value: mentor.employeeCode },
                  { icon: Building2, label: 'Department', value: mentor.department },
                  { icon: Briefcase, label: 'Designation', value: mentor.designation },
                  { icon: User, label: 'Role', value: mentor.role },
                  { icon: User, label: 'Reporting Manager', value: mentor.reportingManager },
                  { icon: MapPin, label: 'Branch', value: mentor.branch },
                  { icon: Building2, label: 'Office Location', value: mentor.officeLocation },
                  { icon: Briefcase, label: 'Employment Type', value: mentor.employmentType },
                  { icon: Clock, label: 'Shift', value: mentor.shift },
                  { icon: Home, label: 'Work Mode', value: mentor.workMode },
                  { icon: CalendarDays, label: 'Joining Date', value: mentor.joiningDate },
                  { icon: CalendarCheck, label: 'Confirmation Date', value: mentor.confirmationDate },
                  { icon: TrendingUp, label: 'Experience', value: `${mentor.experience} yrs` },
                  { icon: ClipboardCheck, label: 'Probation Status', value: mentor.probationStatus },
                  { icon: Clock, label: 'Notice Period', value: mentor.noticePeriod },
                ]}
              />
            </SectionCard>
            <SectionCard icon={BadgeCheck} title="Skills" subtitle="Core competencies">
              <div className="flex flex-wrap gap-2">
                {mentor.skills.map((skill) => <Chip key={skill} accent="#06b6a8">{skill}</Chip>)}
              </div>
            </SectionCard>
            <SectionCard icon={Award} title="Certifications" subtitle="Professional credentials">
              <div className="space-y-2.5">
                {mentor.certifications.map((cert) => (
                  <div key={cert.name} className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-500/10">
                        <Award className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{cert.name}</p>
                        <p className="text-[11px] font-medium text-slate-400">Issued by {cert.issuedBy}</p>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          Issued <b className="text-slate-700 dark:text-slate-200">{cert.issueDate}</b> · Expires <b className="text-slate-700 dark:text-slate-200">{cert.expiryDate || '—'}</b>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
            <SectionCard icon={GraduationCap} title="Education" subtitle="Academic qualifications">
              <div className="space-y-2.5">
                {mentor.education.map((edu) => (
                  <div key={`${edu.qualification}-${edu.year}`} className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{edu.qualification}</p>
                    <p className="text-[11px] font-medium text-slate-400">{edu.university}</p>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Year <b className="text-slate-700 dark:text-slate-200">{edu.year}</b> · Grade <b className="text-slate-700 dark:text-slate-200">{edu.grade}</b>
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )

      case 'courses':
        return (
          <SectionCard icon={BookOpen} title="Assigned Courses" subtitle={`${mentor.assignedCourses.length} active courses · ${mentor.courseCompletion}% completion`}>
            <div className="space-y-2.5">
              {mentor.assignedCourses.map((course, i) => {
                const progress = Math.min(100, Math.max(10, (mentor.courseCompletion || 0) + ((i % 3) - 1) * 5))
                return (
                  <div key={course} className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <BookOpen className="h-4 w-4 shrink-0 text-[#0f55f7]" />
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{course}</p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-slate-700 dark:text-slate-200">{progress}%</span>
                    </div>
                    <div className="mt-2">
                      <HRProgressBar value={progress} color="#0f55f7" height="h-1" />
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionCard>
        )

      case 'batches':
        return (
          <SectionCard icon={CalendarDays} title="Assigned Batches" subtitle={`${mentor.assignedBatches.length} batches · ${mentor.studentsAssigned} students`}>
            <div className="space-y-2.5">
              {mentor.assignedBatches.map((batch) => {
                const isCurrent = batch === mentor.currentBatch
                const students = Math.round(mentor.studentsAssigned / mentor.assignedBatches.length)
                return (
                  <div key={batch} className={`flex items-center justify-between gap-2 rounded-xl border p-3 dark:bg-slate-900/50 ${isCurrent ? 'border-[#0f55f7]/40 bg-[#0f55f7]/5 dark:border-[#0f55f7]/40' : 'border-slate-100 bg-white dark:border-slate-700'}`}>
                    <div className="flex min-w-0 items-center gap-2">
                      <CalendarDays className={`h-4 w-4 shrink-0 ${isCurrent ? 'text-[#0f55f7]' : 'text-slate-400'}`} />
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{batch}</p>
                      {isCurrent && (
                        <span className="rounded-full bg-[#0f55f7]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0f55f7] dark:bg-[#0f55f7]/20 dark:text-blue-300">Current</span>
                      )}
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">{students} students</span>
                  </div>
                )
              })}
            </div>
          </SectionCard>
        )

      case 'students':
        return (
          <div className="space-y-4">
            <SectionCard icon={Users2} title="Students" subtitle={`${mentor.studentsAssigned} students assigned · ${mentor.currentBatch}`}>
              <div className="space-y-2.5">
                {mentor.mentees.map((mentee) => (
                  <div key={mentee.name} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
                    <HRAvatar name={mentee.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{mentee.name}</p>
                        <span className="shrink-0 text-[11px] font-semibold text-slate-400">{mentee.batch}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1">
                          <HRProgressBar value={mentee.progress} color="#06b6a8" height="h-1" />
                        </div>
                        <span className="shrink-0 text-[11px] font-bold text-slate-600 dark:text-slate-300">{mentee.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )

      case 'attendance':
        return (
          <SectionCard icon={CalendarCheck} title="Attendance Summary" subtitle="Current fiscal year attendance">
            <div className="mb-4 rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Attendance Rate</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{mentor.attendancePercentage}%</p>
              </div>
              <div className="mt-2">
                <HRProgressBar value={mentor.attendancePercentage} color="#06b6a8" showLabel={false} />
              </div>
            </div>
            <InfoGrid
              items={[
                { icon: CalendarCheck, label: 'Present Days', value: mentor.attendance.presentDays },
                { icon: CalendarDays, label: 'Absent Days', value: mentor.attendance.absentDays },
                { icon: Clock, label: 'Half Days', value: mentor.attendance.halfDays },
                { icon: Clock, label: 'Late Entries', value: mentor.attendance.lateEntries },
                { icon: Clock, label: 'Working Hours', value: mentor.attendance.workingHours },
                { icon: CalendarDays, label: 'Leaves Taken', value: mentor.attendance.leavesTaken },
              ]}
            />
          </SectionCard>
        )

      case 'performance':
        return (
          <div className="space-y-4">
            <SectionCard icon={TrendingUp} title="Performance Widgets" subtitle="Live delivery and engagement metrics">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {widgets.map((widget) => <Widget key={widget.label} {...widget} />)}
              </div>
            </SectionCard>
            <SectionCard icon={TrendingUp} title="Performance Review" subtitle="Ratings and manager feedback">
              <InfoGrid
                items={[
                  { icon: Star, label: 'Overall Rating', value: `${mentor.performance.overallRating} / 5` },
                  { icon: TrendingUp, label: 'Quarterly Rating', value: `${mentor.performance.quarterlyRating} / 5` },
                  { icon: CalendarCheck, label: 'Last Appraisal', value: mentor.performance.lastAppraisal },
                ]}
              />
              <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
                  <div className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Achievements</p>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {mentor.performance.achievements.map((item) => (
                      <li key={item} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
                  <div className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-[#0f55f7]" />
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Goals</p>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {mentor.performance.goals.map((item) => (
                      <li key={item} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#0f55f7]" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-2.5 rounded-xl border border-slate-100 bg-white p-3 text-xs italic leading-5 text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                {mentor.performance.managerRemarks}
              </p>
            </SectionCard>
          </div>
        )

      case 'leave':
        return (
          <SectionCard icon={ClipboardCheck} title="Leave Summary" subtitle="Leave balances for the current year">
            <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Remaining Leave</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">{mentor.leave.remainingLeave} days</p>
            </div>
            <InfoGrid
              items={[
                { icon: CalendarDays, label: 'Annual Leave', value: mentor.leave.annualLeave },
                { icon: CalendarCheck, label: 'Casual Leave', value: mentor.leave.casualLeave },
                { icon: Heart, label: 'Sick Leave', value: mentor.leave.sickLeave },
                { icon: TrendingUp, label: 'Remaining Leave', value: mentor.leave.remainingLeave },
              ]}
            />
          </SectionCard>
        )

      case 'documents':
        return (
          <SectionCard icon={Archive} title="Documents" subtitle="HR document repository">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {mentor.documents.map((doc) => (
                <button
                  key={doc.name}
                  type="button"
                  onClick={() => toast.success(`Opening ${doc.name} (demo)`)}
                  className="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-white px-3 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0f55f7]/40 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-[#0f55f7]/50"
                >
                  <FileText className="h-5 w-5 text-slate-400 transition-colors group-hover:text-[#0f55f7]" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{doc.name}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:bg-slate-800">{doc.type}</span>
                </button>
              ))}
            </div>
          </SectionCard>
        )

      case 'payroll':
        return (
          <SectionCard icon={Wallet} title="Payroll Information" subtitle="Compensation and statutory details">
            <InfoGrid
              items={[
                { icon: Wallet, label: 'Salary Grade', value: mentor.payroll.salaryGrade },
                { icon: Banknote, label: 'Bank Name', value: mentor.payroll.bankName },
                { icon: CreditCard, label: 'Account Number', value: maskValue(mentor.payroll.accountNumber) },
                { icon: FileText, label: 'IFSC Code', value: mentor.payroll.ifsc },
                { icon: FileText, label: 'PF Number', value: mentor.payroll.pfNumber },
                { icon: FileText, label: 'ESI Number', value: mentor.payroll.esiNumber },
              ]}
            />
          </SectionCard>
        )

      case 'timeline':
        return (
          <div className="space-y-4">
            <SectionCard icon={History} title="Activity Timeline" subtitle="Key events in this mentor's journey">
              <HRTimeline items={mentor.timeline} iconFor={(item) => TIMELINE_ICONS[item.type] || History} />
            </SectionCard>
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-400 dark:bg-slate-800/40">
              All entries are illustrative mock data. Live history will stream from the employee API.
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <HRDrawer
      open={open}
      onClose={onClose}
      title={mentor.name}
      subtitle={`${mentor.employeeId} · ${mentor.designation}`}
      icon={GraduationCap}
      accent="#0f55f7"
      width="max-w-[560px] xl:max-w-[46vw]"
      footer={footer}
    >
      {/* Tab bar */}
      <div className="mb-4 flex gap-1 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
        {TABS.map((tab) => {
          const active = tab.key === activeTab
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              aria-pressed={active}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 ${
                active
                  ? 'bg-[#0f55f7] text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {renderTab()}
    </HRDrawer>
  )
}
