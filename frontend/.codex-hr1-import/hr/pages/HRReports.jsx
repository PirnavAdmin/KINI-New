import {
  FileText, Users2, CalendarCheck, CreditCard, ClipboardCheck, Briefcase, Download, FileSpreadsheet,
  Printer, BarChart3, Send,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Button from '@shared/components/Button'
import useAddIntent from '@features/hr/hooks/useAddIntent'
import HREntityForm from '@features/hr/components/HREntityForm'
import { exportCSV, exportPDF, printPDF } from '@features/hr/components/hrExport'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import { HR_LEVELS } from '@features/hr/constants/hrPermissions'
import usePageSearch from '@features/hr/hooks/usePageSearch'
import HRPage from '@features/hr/components/HRPage'
import HRQuickActions from '@features/hr/components/HRQuickActions'
import HRMiniBars from '@features/hr/components/HRMiniBars'
import { HRSection } from '@features/hr/components/hrPrimitives'
import { HR_EMPLOYEE_STATS } from '@features/hr/data/hrEmployees'
import { HR_LEAVE_TREND, HR_ATTENDANCE_TREND } from '@features/hr/data/hrTime'
import { HR_DASHBOARD } from '@features/hr/data/hrWorkforce'
import { HR_PAYROLL_HISTORY } from '@features/hr/data/hrPay'
import { HR_RECRUITMENT_STATS } from '@features/hr/data/hrTalent'
import { ROUTES } from '@shared/constants/routeConstants'

const REPORT_TYPES = [
  {
    id: 'employees', label: 'Employee Reports', desc: 'Headcount, attrition, tenure and diversity',
    icon: Users2, color: '#0f55f7', schedules: ['Monthly', 'Quarterly'], path: ROUTES.EMPLOYEE.HR_EMPLOYEES,
  },
  {
    id: 'attendance', label: 'Attendance Reports', desc: 'Presence, late arrivals, WFH and leave patterns',
    icon: CalendarCheck, color: '#06b6a8', schedules: ['Daily', 'Weekly'], path: ROUTES.EMPLOYEE.HR_ATTENDANCE,
  },
  {
    id: 'payroll', label: 'Payroll Reports', desc: 'Run summaries, TDS, PF and net pay trends',
    icon: CreditCard, color: '#8b5cf6', schedules: ['Monthly'], path: ROUTES.EMPLOYEE.HR_PAYROLL,
  },
  {
    id: 'leave', label: 'Leave Reports', desc: 'Balances, usage and department leave load',
    icon: ClipboardCheck, color: '#F59E0B', schedules: ['Monthly'], path: ROUTES.EMPLOYEE.HR_LEAVE,
  },
  {
    id: 'recruitment', label: 'Recruitment Reports', desc: 'Pipeline, time-to-hire and source mix',
    icon: Briefcase, color: '#EC4899', schedules: ['Weekly', 'Monthly'], path: ROUTES.EMPLOYEE.HR_RECRUITMENT,
  },
]

export default function HRReports() {
  // KINI HRMS RBAC — export & schedule actions follow the reports module permissions.
  const { can, hrRole } = useHrPermissions()
  const navigate = useNavigate()
  const isRecruiter = hrRole === HR_LEVELS.COORDINATOR
  const canExport = can('reports', 'export')
  const [scheduleOpen, setScheduleOpen] = useState(false)
  useAddIntent(() => setScheduleOpen(true))
  const pageSearch = usePageSearch()
  const availableReportTypes = isRecruiter
    ? REPORT_TYPES.filter((report) => report.id === 'recruitment')
    : REPORT_TYPES
  const filteredReportTypes = useMemo(() => availableReportTypes.filter(pageSearch.matches), [availableReportTypes, pageSearch.matches])

  const recentRuns = (isRecruiter ? [
    ['Recruitment Funnel — July 2026', 'Priya Nair · 3d ago', HR_RECRUITMENT_STATS.totalCandidates, 'candidates'],
  ] : [
    ['Employee Master — Aug 2026', 'Kavya Menon · 2h ago', HR_EMPLOYEE_STATS.total, 'rows'],
    ['Payroll Summary — July 2026', 'Kavya Menon · 1d ago', HR_PAYROLL_HISTORY[0].gross, 'gross'],
    ['Attendance — Week 31', 'Divya Menon · 2d ago', `${HR_ATTENDANCE_TREND.reduce((s, d) => s + d.present, 0)}`, 'present'],
    ['Recruitment Funnel — July', 'Priya Nair · 3d ago', HR_RECRUITMENT_STATS.totalCandidates, 'candidates'],
  ])

  return (
    <HRPage
      moduleId="reports"
      title="HR Reports"
      subtitle={isRecruiter ? 'Recruitment pipeline, interviews and hiring analytics.' : 'Employee, attendance, payroll, leave and recruitment analytics with exports.'}
      icon={FileText}
      lastUpdated="Aug 4, 2026"
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search reports…' }}
      actions={
        <HRQuickActions
          can={can}
          actions={[
            { key: 'excel', label: 'Export Excel', icon: FileSpreadsheet, permission: ['reports', 'export'], onClick: () => {
              exportCSV({ filename: 'hr-reports', headers: ['Report', 'Type', 'Schedule'], rows: REPORT_TYPES.map((r) => [r.label, r.id, r.schedules.join(', ')]) })
              toast.success('HR reports exported to Excel')
            } },
            { key: 'pdf', label: 'Export PDF', icon: Download, permission: ['reports', 'export'], onClick: () => {
              exportPDF({ filename: 'hr-reports', title: 'HR Reports', headers: ['Report', 'Type'], rows: REPORT_TYPES.map((r) => [r.label, r.id]), subtitle: 'Kini HRMS · Report catalogue' })
              toast.success('HR reports exported to PDF')
            } },
            { key: 'schedule', label: 'Schedule Report', icon: Send, variant: 'primary', permission: ['reports', 'manage'], onClick: () => setScheduleOpen(true) },
          ]}
        />
      }
    >
      {/* Report type cards */}
      <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {filteredReportTypes.map((report, i) => (
          <HRSection
            key={report.id}
            padding="p-3"
            delay={i * 0.04}
            onClick={(event) => {
              if (event?.target?.closest?.('button')) return
              navigate(report.path)
            }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${report.color}, ${report.color}bb)` }}
            >
              <report.icon className="h-4.5 w-4.5" />
            </span>
            <h3 className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white">{report.label}</h3>
            <p className="mt-1 text-[11px] leading-4 text-slate-400">{report.desc}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {report.schedules.map((schedule) => (
                <span key={schedule} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {schedule}
                </span>
              ))}
            </div>
            {canExport && (
              <div className="mt-2 flex gap-1.5">
                <Button variant="secondary" size="xs" icon={FileSpreadsheet} onClick={() => {
                  exportCSV({ filename: `${report.id}-report`, headers: ['Report', 'Type', 'Schedule'], rows: [[report.label, report.id, report.schedules.join(', ')]] })
                  toast.success(`${report.label} exported to Excel`)
                }}>Excel</Button>
                <Button variant="secondary" size="xs" icon={Download} onClick={() => {
                  exportPDF({ filename: `${report.id}-report`, title: report.label, headers: ['Report', 'Type'], rows: [[report.label, report.id]], subtitle: report.desc })
                  toast.success(`${report.label} exported to PDF`)
                }}>PDF</Button>
              </div>
            )}
          </HRSection>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
        <HRSection title="Employee Growth" subtitle="Headcount over 6 months" icon={Users2} padding="p-3">
          <HRMiniBars
            data={HR_DASHBOARD.employeeGrowth.map((d) => ({ label: d.month, value: d.count }))}
            color="#0f55f7"
            barHeight="h-36"
            valueFormatter={(v) => v}
          />
        </HRSection>
        <HRSection title="Attendance Trend" subtitle="Present per day this week" icon={CalendarCheck} padding="p-3">
          <HRMiniBars
            data={HR_ATTENDANCE_TREND.map((d) => ({ label: d.day, value: d.present }))}
            color="#06b6a8"
            barHeight="h-36"
            valueFormatter={(v) => v}
          />
        </HRSection>
        <HRSection title="Leave Usage" subtitle="Days used per month" icon={ClipboardCheck} padding="p-3">
          <HRMiniBars
            data={HR_LEAVE_TREND.map((d) => ({ label: d.month, value: d.used }))}
            color="#F59E0B"
            barHeight="h-36"
            valueFormatter={(v) => v}
          />
        </HRSection>
      </div>

      {/* Recent runs */}
      <HRSection title="Recent Report Runs" subtitle="Last generated reports" icon={BarChart3} padding="p-4">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {recentRuns.map(([title, meta, value, suffix]) => (
            <div key={title} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3.5 py-3 dark:border-slate-800">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0f55f7]/10 text-[#0f55f7]">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{title}</p>
                  <p className="text-[10px] text-slate-400">{meta}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {value} {suffix}
                </span>
                {canExport && (
                  <button
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0f55f7] dark:hover:bg-slate-800"
                    aria-label="Download report"
                    onClick={() => {
                      exportCSV({ filename: title.replace(/[^a-z0-9]+/gi, '-').toLowerCase(), headers: ['Report', 'Meta'], rows: [[title, meta]] })
                      toast.success(`Downloading “${title}”…`)
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                )}
                {canExport && (
                  <button
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0f55f7] dark:hover:bg-slate-800"
                    aria-label="Print report"
                    onClick={() => {
                      printPDF({ title, headers: ['Report', 'Meta'], rows: [[title, meta]], subtitle: 'Kini HRMS · Recent report runs' })
                    }}
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </HRSection>

      {/* Schedule report form */}
      <HREntityForm
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Schedule Report"
        subtitle="Set up a recurring report delivery"
        icon={Send}
        accent="#0f55f7"
        saveLabel="Schedule"
        fields={[
          { key: 'report', label: 'Report', type: 'select', required: true, options: REPORT_TYPES.map((r) => ({ value: r.label, label: r.label })) },
          { key: 'frequency', label: 'Frequency', type: 'select', required: true, defaultValue: 'Monthly', options: ['Daily', 'Weekly', 'Monthly', 'Quarterly'].map((f) => ({ value: f, label: f })) },
          { key: 'email', label: 'Deliver To (Email)', type: 'email', required: true, placeholder: 'hr@kinieduhub.io' },
        ]}
        onSave={(values) => {
          toast.success(`${values.report} scheduled ${values.frequency.toLowerCase()} → ${values.email}`)
        }}
      />
    </HRPage>
  )
}
