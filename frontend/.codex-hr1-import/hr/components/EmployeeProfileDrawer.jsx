import { useEffect, useState } from 'react'
import {
  User, Building2, BookOpen, CalendarDays, Users2, CalendarCheck, TrendingUp,
  ClipboardCheck, Archive, Wallet, History, Star, Briefcase, Mail, Phone, MapPin,
  Home, Globe, CreditCard, FileText, Clock, BadgeCheck, Award, GraduationCap,
  Video, Heart, Target, MessageSquare, Pencil, Download, Printer, UserPlus,
  CheckSquare, Banknote, Package, School, ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import Button from '@shared/components/Button'
import HRDrawer from '@features/hr/components/HRDrawer'
import HRTimeline from '@features/hr/components/HRTimeline'
import HrTooltip from '@features/hr/components/HrTooltip'
import { HRAvatar, HRStatusBadge, HRProgressBar, HRRoleBadge } from '@features/hr/components/hrPrimitives'
import { USER_ROLE_LABELS, HR_ROLE_LABELS } from '@shared/constants/roles'
import { HR_ROLE_META } from '@features/hr/data/hrEmployees'

/**
 * EmployeeProfileDrawer — unified enterprise profile for EVERY workforce member
 * (employees, mentors, HR staff, recruiters, payroll, managers, trainers,
 * admins, department heads).
 *
 * Common sections: Overview, Personal, Employment, Attendance, Leave, Payroll,
 * Performance, Assets, Documents, Timeline.
 * When the person is a Mentor (role = 'Mentor') the drawer additionally shows:
 * Assigned Courses, Assigned Batches, Teaching Schedule, Students Assigned,
 * Course Completion, Average Student Rating and Mentor Performance.
 *
 * All data is local mock state — no API calls. Reuses HRDrawer, HR primitives
 * and HRTimeline.
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
function SectionCard({ icon: Icon, title, subtitle, children, accent = '#0f55f7' }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40">
      <header className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${accent}14`, color: accent }}>
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
      <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-100">{value || '—'}</p>
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

const COMMON_TABS = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'personal', label: 'Personal', icon: User },
  { key: 'employment', label: 'Employment', icon: Building2 },
  { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { key: 'leave', label: 'Leave', icon: ClipboardCheck },
  { key: 'payroll', label: 'Payroll', icon: Wallet },
  { key: 'performance', label: 'Performance', icon: TrendingUp },
  { key: 'assets', label: 'Assets', icon: Package },
  { key: 'documents', label: 'Documents', icon: Archive },
  { key: 'timeline', label: 'Timeline', icon: History },
]

const MENTOR_TABS = [
  { key: 'courses', label: 'Courses', icon: BookOpen },
  { key: 'batches', label: 'Batches', icon: CalendarDays },
  { key: 'schedule', label: 'Teaching Schedule', icon: Video },
  { key: 'students', label: 'Students', icon: Users2 },
  { key: 'mentorPerformance', label: 'Mentor Performance', icon: GraduationCap },
]

const TIMELINE_ICONS = {
  notice: UserPlus, approval: BadgeCheck, document: Award, checklist: CheckSquare,
  payroll: Wallet, kt: MessageSquare, interview: Video,
}

// KINI HRMS RBAC — which module each profile section belongs to, so sections
// follow the HR level's module view (the least-privilege level sees
// personal/employment/timeline; Manager sees payroll/documents/performance too).
const TAB_MODULE = {
  overview: 'employees',
  personal: 'employees',
  employment: 'employees',
  attendance: 'attendance',
  leave: 'leave',
  payroll: 'payroll',
  performance: 'performance',
  assets: 'assets',
  documents: 'documents',
  timeline: 'employees',
  courses: 'employees',
  batches: 'employees',
  schedule: 'employees',
  students: 'employees',
  mentorPerformance: 'employees',
}

export default function EmployeeProfileDrawer({
  open, employee, onClose, onEdit,
  initialTab = 'overview',
  // KINI HRMS RBAC — permission flags (default true keeps other callers unchanged).
  canEdit = true, canExport = true, canPrint = true, canAssign = true,
  // KINI HRMS RBAC — module-view gate; defaults to a pass-through so existing
  // callers (MentorManagement, etc.) keep showing every section.
  canModule = () => true,
  // ENTERPRISE RBAC — canonical access of HR users ({ role, hrRole }) surfaced in
  // the profile header. Null/omitted for non-HR workforce members.
  hrAccess = null,
}) {
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (open) setActiveTab(initialTab)
  }, [initialTab, open, employee?.id])

  if (!employee) return null

  const isMentor = employee.role === 'Mentor'
  const baseTabs = isMentor ? [...COMMON_TABS.slice(0, 3), ...MENTOR_TABS, ...COMMON_TABS.slice(3)] : COMMON_TABS
  // PERMISSION-AWARE — hide sections whose module the HR user cannot view.
  const tabs = baseTabs.filter((tab) => canModule(TAB_MODULE[tab.key] || 'employees'))

  // If the active section is invisible (permission change), render the first
  // visible tab instead — pure derivation, no state writes during render.
  const effectiveTab = tabs.some((tab) => tab.key === activeTab) ? activeTab : (tabs[0]?.key || 'overview')

  const rating = employee.rating || employee.mentorRating || 0
  const attendancePct = employee.attendancePercentage || employee.attendance?.attendancePercentage || 0
  const mentorColor = '#8b5cf6'

  const handlePrint = () => {
    toast.success('Opening print dialog…')
    window.setTimeout(() => window.print(), 250)
  }

  // PERMISSION-AWARE — locked actions show disabled with a tooltip instead of
  // disappearing, so users understand what a Manager/Coordinator could do.
  const lockedHint = "You don't have permission to perform this action."
  const quickActions = [
    { label: 'Edit', icon: Pencil, onClick: onEdit, disabled: !canEdit },
    { label: 'Message', icon: MessageSquare, onClick: () => toast.success(`Opening chat with ${employee.name}`), disabled: false },
    { label: 'Schedule Meeting', icon: Video, onClick: () => toast.success(`Scheduling meeting with ${employee.name} (demo)`), disabled: false },
    { label: 'Attendance', icon: CalendarCheck, onClick: () => toast.success(`Opening attendance for ${employee.name} (demo)`), disabled: false },
    ...(isMentor
      ? [
          { label: 'Assign Batch', icon: CalendarDays, onClick: () => toast.success(`Assign batch for ${employee.name} (demo)`), disabled: !canAssign },
          { label: 'Assign Course', icon: BookOpen, onClick: () => toast.success(`Assign course for ${employee.name} (demo)`), disabled: !canAssign },
        ]
      : []),
    { label: 'Download', icon: Download, onClick: () => toast.success(`${employee.name}'s profile downloaded (demo)`), disabled: !canExport },
    { label: 'Print', icon: Printer, onClick: handlePrint, disabled: !canPrint },
  ]

  const footer = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <HrTooltip text={!canPrint ? lockedHint : undefined} side="top">
        <Button variant="ghost" size="sm" icon={Printer} onClick={handlePrint} disabled={!canPrint}>Print</Button>
      </HrTooltip>
      <HrTooltip text={!canExport ? lockedHint : undefined} side="top">
        <Button variant="secondary" size="sm" icon={Download} onClick={() => toast.success(`${employee.name}'s profile downloaded (demo)`)} disabled={!canExport}>Download</Button>
      </HrTooltip>
      <Button variant="secondary" size="sm" icon={MessageSquare} onClick={() => toast.success(`Opening chat with ${employee.name}`)}>Message</Button>
      <HrTooltip text={!canEdit ? lockedHint : undefined} side="top">
        <Button variant="primary" size="sm" icon={Pencil} onClick={onEdit} disabled={!canEdit}>Edit</Button>
      </HrTooltip>
    </div>
  )

  const renderTab = () => {
    switch (effectiveTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-[#0f55f7]/8 via-[#06b6a8]/5 to-transparent p-5 dark:border-slate-700 dark:from-[#0f55f7]/15 dark:via-[#06b6a8]/10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <HRAvatar name={employee.name} size="xl" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{employee.name}</h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {employee.employeeId} · {employee.employeeCode || '—'}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                    {employee.designation} · {employee.department}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <HRRoleBadge role={employee.role} />
                    {/* ENTERPRISE RBAC — canonical User Role + HR Role of HR users
                        (designation above remains the job title). */}
                    {hrAccess && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#0f55f7]/25 bg-[#0f55f7]/5 px-2.5 py-1 text-[11px] font-bold text-[#0f55f7]">
                        <ShieldCheck className="h-3 w-3" />
                        {USER_ROLE_LABELS[hrAccess.role] || 'HR'}
                        {hrAccess.hrRole && (
                          <span className="ml-0.5 rounded-full bg-[#0f55f7]/10 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                            {HR_ROLE_LABELS[hrAccess.hrRole] || hrAccess.hrRole}
                          </span>
                        )}
                      </span>
                    )}
                    <HRStatusBadge status={employee.status} />
                    {employee.availability && <HRStatusBadge status={employee.availability} />}
                    {rating > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                        <Star className="h-3 w-3 fill-current" />{rating.toFixed(1)}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                      {employee.type || employee.employmentType}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {[
                  [Briefcase, 'Experience', `${employee.experience} yrs`],
                  [Users2, isMentor ? 'Students' : 'Team', isMentor ? employee.studentsAssigned : employee.department],
                  [CalendarCheck, 'Attendance', `${attendancePct}%`],
                  [Star, 'Rating', rating > 0 ? rating.toFixed(1) : '—'],
                ].map(([Icon, label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-white/80 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/40">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3 w-3 text-[#0f55f7]" />
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                    </div>
                    <p className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <SectionCard icon={Building2} title="Key Information" subtitle="Reporting, work context and role">
              <InfoGrid
                items={[
                  { icon: User, label: 'Role', value: employee.role },
                  { icon: User, label: 'Reporting Manager', value: employee.reportingManager || employee.manager },
                  { icon: CalendarCheck, label: 'Joining Date', value: employee.joinDate || employee.joiningDate },
                  { icon: Home, label: 'Work Mode', value: employee.workMode || '—' },
                  { icon: Clock, label: 'Shift', value: employee.shift || '—' },
                  { icon: MapPin, label: 'Branch', value: employee.branch },
                ]}
              />
              {isMentor && (
                <div className="mt-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Current Courses</p>
                  <div className="flex flex-wrap gap-1.5">
                    {employee.assignedCourses?.length
                      ? employee.assignedCourses.map((course) => <Chip key={course} accent={mentorColor}>{course}</Chip>)
                      : <p className="text-xs text-slate-400">No courses assigned</p>}
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard icon={Video} title="Quick Actions" subtitle="Common people-management tasks">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <HrTooltip key={action.label} text={action.disabled ? lockedHint : undefined} side="top">
                    <Button variant="secondary" size="xs" icon={action.icon} onClick={action.onClick} disabled={action.disabled}>
                      {action.label}
                    </Button>
                  </HrTooltip>
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
                  { icon: User, label: 'Full Name', value: employee.name },
                  { icon: User, label: 'Gender', value: employee.gender },
                  { icon: CalendarDays, label: 'Date of Birth', value: employee.dob },
                  { icon: Heart, label: 'Blood Group', value: employee.bloodGroup },
                  { icon: Heart, label: 'Marital Status', value: employee.maritalStatus },
                  { icon: Globe, label: 'Nationality', value: employee.nationality },
                  { icon: CreditCard, label: 'Aadhaar Number', value: maskValue(employee.aadhaar) },
                  { icon: FileText, label: 'PAN Number', value: maskValue(employee.pan) },
                  { icon: Mail, label: 'Personal Email', value: employee.personalEmail },
                  { icon: Mail, label: 'Official Email', value: employee.officialEmail || employee.email },
                  { icon: Phone, label: 'Mobile Number', value: employee.phone },
                  { icon: Phone, label: 'Alternate Number', value: employee.alternateNumber },
                  { icon: Phone, label: 'Emergency Contact', value: employee.emergencyContact },
                  { icon: User, label: 'Emergency Contact Person', value: employee.emergencyContactPerson },
                ]}
              />
            </SectionCard>
            <SectionCard icon={MapPin} title="Address Information" subtitle="Current and permanent residence">
              <InfoGrid
                items={[
                  { icon: MapPin, label: 'Current Address', value: employee.currentAddress },
                  { icon: Home, label: 'Permanent Address', value: employee.permanentAddress },
                  { icon: MapPin, label: 'City', value: employee.city },
                  { icon: MapPin, label: 'State', value: employee.state },
                  { icon: Globe, label: 'Country', value: employee.country },
                  { icon: MapPin, label: 'Postal Code', value: employee.postalCode },
                ]}
              />
            </SectionCard>
          </div>
        )

      case 'employment':
        return (
          <div className="space-y-4">
            <SectionCard icon={Building2} title="Employment Details" subtitle="Organization and company information">
              <InfoGrid
                items={[
                  { icon: FileText, label: 'Employee Code', value: employee.employeeCode },
                  { icon: Building2, label: 'Department', value: employee.department },
                  { icon: Briefcase, label: 'Designation', value: employee.designation },
                  { icon: User, label: 'Role', value: employee.role },
                  { icon: User, label: 'Reporting Manager', value: employee.reportingManager || employee.manager },
                  { icon: MapPin, label: 'Branch', value: employee.branch },
                  { icon: Building2, label: 'Office Location', value: employee.officeLocation },
                  { icon: Briefcase, label: 'Employment Type', value: employee.type || employee.employmentType },
                  { icon: Clock, label: 'Shift', value: employee.shift },
                  { icon: Home, label: 'Work Mode', value: employee.workMode },
                  { icon: CalendarDays, label: 'Joining Date', value: employee.joinDate || employee.joiningDate },
                  { icon: CalendarCheck, label: 'Confirmation Date', value: employee.confirmationDate },
                  { icon: TrendingUp, label: 'Experience', value: `${employee.experience} yrs` },
                  { icon: ClipboardCheck, label: 'Probation Status', value: employee.probationStatus },
                  { icon: Clock, label: 'Notice Period', value: employee.noticePeriod },
                ]}
              />
            </SectionCard>
            <SectionCard icon={BadgeCheck} title="Skills" subtitle="Core competencies">
              <div className="flex flex-wrap gap-2">
                {employee.skills?.length
                  ? employee.skills.map((skill) => <Chip key={skill} accent="#06b6a8">{skill}</Chip>)
                  : <p className="text-xs text-slate-400">No skills recorded</p>}
              </div>
            </SectionCard>
            <SectionCard icon={Award} title="Certifications" subtitle="Professional credentials">
              <div className="space-y-2.5">
                {employee.certifications?.length
                  ? employee.certifications.map((cert) => (
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
                    ))
                  : <p className="text-xs text-slate-400">No certifications on file</p>}
              </div>
            </SectionCard>
            <SectionCard icon={GraduationCap} title="Education" subtitle="Academic qualifications">
              <div className="space-y-2.5">
                {employee.education?.length
                  ? employee.education.map((edu) => (
                      <div key={`${edu.qualification}-${edu.year}`} className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{edu.qualification}</p>
                        <p className="text-[11px] font-medium text-slate-400">{edu.university}</p>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          Year <b className="text-slate-700 dark:text-slate-200">{edu.year}</b> · Grade <b className="text-slate-700 dark:text-slate-200">{edu.grade}</b>
                        </p>
                      </div>
                    ))
                  : <p className="text-xs text-slate-400">No education records</p>}
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
                <p className="text-lg font-bold text-slate-900 dark:text-white">{attendancePct}%</p>
              </div>
              <div className="mt-2">
                <HRProgressBar value={attendancePct} color="#06b6a8" showLabel={false} />
              </div>
            </div>
            <InfoGrid
              items={[
                { icon: CalendarCheck, label: 'Present Days', value: employee.attendance?.presentDays },
                { icon: CalendarDays, label: 'Absent Days', value: employee.attendance?.absentDays },
                { icon: Clock, label: 'Half Days', value: employee.attendance?.halfDays },
                { icon: Clock, label: 'Late Entries', value: employee.attendance?.lateEntries },
                { icon: Clock, label: 'Working Hours', value: employee.attendance?.workingHours },
                { icon: CalendarDays, label: 'Leaves Taken', value: employee.attendance?.leavesTaken },
              ]}
            />
          </SectionCard>
        )

      case 'leave':
        return (
          <SectionCard icon={ClipboardCheck} title="Leave Summary" subtitle="Leave balances for the current year">
            <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Remaining Leave</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">{employee.leave?.remainingLeave ?? '—'} days</p>
            </div>
            <InfoGrid
              items={[
                { icon: CalendarDays, label: 'Annual Leave', value: employee.leave?.annualLeave },
                { icon: CalendarCheck, label: 'Casual Leave', value: employee.leave?.casualLeave },
                { icon: Heart, label: 'Sick Leave', value: employee.leave?.sickLeave },
                { icon: TrendingUp, label: 'Remaining Leave', value: employee.leave?.remainingLeave },
              ]}
            />
          </SectionCard>
        )

      case 'payroll':
        return (
          <SectionCard icon={Wallet} title="Payroll Information" subtitle="Compensation and statutory details">
            <div className="mb-3 rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Current CTC</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {employee.salary ? `₹${employee.salary} LPA` : (employee.payroll?.salaryGrade || '—')}
                </p>
              </div>
            </div>
            <InfoGrid
              items={[
                { icon: Wallet, label: 'Salary Grade', value: employee.payroll?.salaryGrade },
                { icon: Banknote, label: 'Bank Name', value: employee.payroll?.bankName },
                { icon: CreditCard, label: 'Account Number', value: maskValue(employee.payroll?.accountNumber) },
                { icon: FileText, label: 'IFSC Code', value: employee.payroll?.ifsc },
                { icon: FileText, label: 'PF Number', value: employee.payroll?.pfNumber },
                { icon: FileText, label: 'ESI Number', value: employee.payroll?.esiNumber },
              ]}
            />
          </SectionCard>
        )

      case 'performance':
        return (
          <div className="space-y-4">
            <SectionCard icon={TrendingUp} title="Performance Widgets" subtitle="Live delivery and engagement metrics">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Widget label="Attendance" value={attendancePct} suffix="%" icon={CalendarCheck} color="#06b6a8" progress={attendancePct} />
                <Widget label="Overall Rating" value={rating} suffix=" / 5" icon={Star} color="#F59E0B" progress={(rating / 5) * 100} />
                {isMentor && (
                  <>
                    <Widget label="Course Completion" value={employee.courseCompletion} suffix="%" icon={BookOpen} color="#10b981" progress={employee.courseCompletion} />
                    <Widget label="Assignments Reviewed" value={employee.assignmentsReviewed} icon={ClipboardCheck} color="#8b5cf6" progress={Math.min(100, (employee.assignmentsReviewed / 500) * 100)} />
                    <Widget label="Average Student Rating" value={employee.averageFeedback} suffix=" / 5" icon={Star} color="#6366f1" progress={(employee.averageFeedback / 5) * 100} />
                    <Widget label="Monthly Rating" value={employee.monthlyRating} suffix=" / 5" icon={TrendingUp} color="#EC4899" progress={(employee.monthlyRating / 5) * 100} />
                  </>
                )}
              </div>
            </SectionCard>
            <SectionCard icon={TrendingUp} title="Performance Review" subtitle="Ratings and manager feedback">
              <InfoGrid
                items={[
                  { icon: Star, label: 'Overall Rating', value: `${employee.performance?.overallRating ?? rating} / 5` },
                  { icon: TrendingUp, label: 'Quarterly Rating', value: `${employee.performance?.quarterlyRating ?? '—'} / 5` },
                  { icon: CalendarCheck, label: 'Last Appraisal', value: employee.performance?.lastAppraisal },
                ]}
              />
              <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
                  <div className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Achievements</p>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {(employee.performance?.achievements || []).map((item) => (
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
                    {(employee.performance?.goals || []).map((item) => (
                      <li key={item} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#0f55f7]" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {employee.performance?.managerRemarks && (
                <p className="mt-2.5 rounded-xl border border-slate-100 bg-white p-3 text-xs italic leading-5 text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                  {employee.performance.managerRemarks}
                </p>
              )}
            </SectionCard>
          </div>
        )

      case 'assets':
        return (
          <SectionCard icon={Package} title="Assets" subtitle="Issued company assets">
            <div className="space-y-2.5">
              {(employee.assets?.length
                ? employee.assets
                : [{ name: 'No assets assigned', category: '—', status: '—' }]
              ).map((asset) => (
                <div key={`${asset.name}-${asset.category}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0f55f7]/10 text-[#0f55f7]">
                      <Package className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{asset.name}</p>
                      <p className="truncate text-[11px] text-slate-400">{asset.category}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#06b6a8]/10 px-2.5 py-1 text-[10px] font-bold text-[#06b6a8]">{asset.status}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        )

      case 'documents':
        return (
          <SectionCard icon={Archive} title="Documents" subtitle="HR document repository">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {(employee.documents || []).map((doc) => (
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

      case 'timeline':
        return (
          <div className="space-y-4">
            <SectionCard icon={History} title="Activity Timeline" subtitle="Key events in this person's journey">
              <HRTimeline
                items={(employee.timeline || []).length ? employee.timeline : [{
                  date: employee.joinDate || employee.joiningDate || '—',
                  title: 'Joined Organization',
                  desc: `Onboarded as ${employee.designation} · ${employee.department}`,
                  type: 'notice',
                }]}
                iconFor={(item) => TIMELINE_ICONS[item.type] || History}
              />
            </SectionCard>
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-400 dark:bg-slate-800/40">
              All entries are illustrative mock data. Live history will stream from the employee API.
            </p>
          </div>
        )

      // ── Mentor-only sections ──────────────────────────────────────────
      case 'courses':
        return (
          <SectionCard icon={BookOpen} title="Assigned Courses" subtitle={`${employee.assignedCourses?.length || 0} active courses · ${employee.courseCompletion}% completion`} accent={mentorColor}>
            <div className="space-y-2.5">
              {(employee.assignedCourses || []).map((course, i) => {
                const progress = Math.min(100, Math.max(10, (employee.courseCompletion || 0) + ((i % 3) - 1) * 5))
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
                      <HRProgressBar value={progress} color={mentorColor} height="h-1" />
                    </div>
                  </div>
                )
              })}
              {!employee.assignedCourses?.length && <p className="text-xs text-slate-400">No courses assigned</p>}
            </div>
          </SectionCard>
        )

      case 'batches':
        return (
          <SectionCard icon={CalendarDays} title="Assigned Batches" subtitle={`${employee.assignedBatches?.length || 0} batches · ${employee.studentsAssigned || 0} students`} accent={mentorColor}>
            <div className="space-y-2.5">
              {(employee.assignedBatches || []).map((batch) => {
                const isCurrent = batch === employee.currentBatch
                const students = Math.max(1, Math.round((employee.studentsAssigned || 0) / Math.max(1, employee.assignedBatches?.length || 1)))
                return (
                  <div key={batch} className={`flex items-center justify-between gap-2 rounded-xl border p-3 dark:bg-slate-900/50 ${isCurrent ? 'border-[#8b5cf6]/40 bg-[#8b5cf6]/5 dark:border-[#8b5cf6]/40' : 'border-slate-100 bg-white dark:border-slate-700'}`}>
                    <div className="flex min-w-0 items-center gap-2">
                      <CalendarDays className={`h-4 w-4 shrink-0 ${isCurrent ? 'text-[#8b5cf6]' : 'text-slate-400'}`} />
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{batch}</p>
                      {isCurrent && (
                        <span className="rounded-full bg-[#8b5cf6]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8b5cf6] dark:bg-[#8b5cf6]/20">Current</span>
                      )}
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">{students} students</span>
                  </div>
                )
              })}
              {!employee.assignedBatches?.length && <p className="text-xs text-slate-400">No batches assigned</p>}
            </div>
          </SectionCard>
        )

      case 'schedule':
        return (
          <SectionCard icon={Video} title="Teaching Schedule" subtitle="Sessions, classes and availability" accent={mentorColor}>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                [Video, 'Completed Sessions', employee.completedSessions],
                [CalendarDays, 'Upcoming Sessions', employee.upcomingSessions],
                [CalendarCheck, 'Last Session', employee.lastSession],
                [CalendarDays, 'Next Session', employee.nextSession],
              ].map(([Icon, label, value]) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-[#8b5cf6]" />
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                  </div>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{value || '—'}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Chip accent={mentorColor}>Current Batch: {employee.currentBatch || '—'}</Chip>
              {employee.availability && <Chip accent={employee.availability === 'available' ? '#06b6a8' : '#F59E0B'}>Availability: {employee.availability}</Chip>}
            </div>
          </SectionCard>
        )

      case 'students':
        return (
          <SectionCard icon={Users2} title="Students Assigned" subtitle={`${employee.studentsAssigned || 0} students · ${employee.currentBatch || '—'}`} accent={mentorColor}>
            <div className="space-y-2.5">
              {(employee.mentees || []).map((mentee) => (
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
              {!employee.mentees?.length && <p className="text-xs text-slate-400">No students assigned</p>}
            </div>
          </SectionCard>
        )

      case 'mentorPerformance':
        return (
          <div className="space-y-4">
            <SectionCard icon={GraduationCap} title="Mentor Performance" subtitle="Course completion, ratings and delivery metrics" accent={mentorColor}>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Widget label="Course Completion" value={employee.courseCompletion} suffix="%" icon={BookOpen} color="#10b981" progress={employee.courseCompletion} />
                <Widget label="Average Student Rating" value={employee.averageFeedback || employee.mentorRating} suffix=" / 5" icon={Star} color="#F59E0B" progress={((employee.averageFeedback || employee.mentorRating || 0) / 5) * 100} />
                <Widget label="Assignments Reviewed" value={employee.assignmentsReviewed} icon={ClipboardCheck} color="#8b5cf6" progress={Math.min(100, (employee.assignmentsReviewed / 500) * 100)} />
                <Widget label="Classes Conducted" value={employee.completedSessions} icon={Video} color="#EC4899" progress={Math.min(100, (employee.completedSessions / 400) * 100)} />
                <Widget label="Monthly Rating" value={employee.monthlyRating} suffix=" / 5" icon={TrendingUp} color="#6366f1" progress={(employee.monthlyRating / 5) * 100} />
                <Widget label="Upcoming Sessions" value={employee.upcomingSessions} icon={CalendarDays} color="#EF4444" progress={Math.min(100, (employee.upcomingSessions / 10) * 100)} />
              </div>
            </SectionCard>
            <SectionCard icon={TrendingUp} title="Performance Review" subtitle="Ratings and manager feedback" accent={mentorColor}>
              <InfoGrid
                items={[
                  { icon: Star, label: 'Overall Rating', value: `${employee.performance?.overallRating || employee.mentorRating || rating} / 5` },
                  { icon: TrendingUp, label: 'Quarterly Rating', value: `${employee.performance?.quarterlyRating || '—'} / 5` },
                  { icon: CalendarCheck, label: 'Last Appraisal', value: employee.performance?.lastAppraisal },
                ]}
              />
              {employee.performance?.managerRemarks && (
                <p className="mt-2.5 rounded-xl border border-slate-100 bg-white p-3 text-xs italic leading-5 text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                  {employee.performance.managerRemarks}
                </p>
              )}
            </SectionCard>
            <SectionCard icon={School} title="Assigned Courses & Batches" subtitle="Current teaching load" accent={mentorColor}>
              <div className="flex flex-wrap gap-1.5">
                {(employee.assignedCourses || []).map((course) => <Chip key={course} accent={mentorColor}>{course}</Chip>)}
                {(employee.assignedBatches || []).map((batch) => <Chip key={batch} accent="#06b6a8">{batch}</Chip>)}
              </div>
            </SectionCard>
          </div>
        )

      default:
        return null
    }
  }

  const accent = HR_ROLE_META[employee.role]?.color || '#0f55f7'

  return (
    <HRDrawer
      open={open}
      onClose={onClose}
      title={employee.name}
      subtitle={`${employee.employeeId} · ${employee.designation}`}
      icon={isMentor ? GraduationCap : User}
      accent={accent}
      width="max-w-[540px]"
      footer={footer}
    >
      {/* Tab bar */}
      <div className="mb-3 flex gap-1 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
        {tabs.map((tab) => {
          const active = tab.key === effectiveTab
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              aria-pressed={active}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 ${
                active
                  ? 'text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300'
              }`}
              style={active ? { backgroundColor: accent } : undefined}
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
