import HrLiveBoundary from '@features/hr/components/HrLiveBoundary'
import './hrEmployeesDensity.css'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Users2, UserPlus, FileSpreadsheet, FileText,
  Eye, Pencil, Trash2, History, Building2, Briefcase, MapPin,
  BadgeCheck, Copy, Save, Import as ImportIcon,
  GraduationCap, Ban, UserCheck, Rocket, Clock, ArrowUpRight,
  ShieldCheck, LockKeyhole, Check, ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@shared/services/apiServices'
import { employeeService } from '@shared/services/employeeService'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import usePageSearch from '@features/hr/hooks/usePageSearch'
import HrUserForm from '@features/hr/components/HrUserForm'
import { USER_ROLES, HR_ROLE_IDS, HR_ROLE_LABELS } from '@shared/constants/roles'
import { useHrUsers, findHrUserByEmail, upsertHrUser, removeHrUser } from '@features/hr/services/hrUserStore'
import { emptyPermissions, countGranted } from '@features/hr/constants/hrPermissionMatrix'
import Button from '@shared/components/Button'
import HRPage from '@features/hr/components/HRPage'
import { HrBreadcrumb, HrHero, HrKpis } from '@features/hr/components/portal/HrPortalKit'
import { heroProps } from '@features/hr/components/portal/hrHeroes'
import { ROUTES } from '@shared/constants/routeConstants'
import HRDrawer from '@features/hr/components/HRDrawer'
import HRFilterBar from '@features/hr/components/HRFilterBar'
import HRTimeline from '@features/hr/components/HRTimeline'
import HRQuickActions from '@features/hr/components/HRQuickActions'
import HRDataTable from '@features/hr/components/HRDataTable'
import HRActionMenu from '@features/hr/components/HRActionMenu'
import EmployeeProfileDrawer from '@features/hr/components/EmployeeProfileDrawer'
import AccountCreatedModal from '@shared/components/AccountCreatedModal'
import { HRStatusBadge, HRRoleBadge } from '@features/hr/components/hrPrimitives'
import { exportCSV, exportPDF } from '@features/hr/components/hrExport'
import {
  HR_WORKFORCE, HR_ROLES, HR_ROLE_OPTIONS, HR_EXPERIENCE_OPTIONS, HR_JOINING_OPTIONS,
  HR_BRANCHES, HR_DEPARTMENT_LIST, HR_STATUS_OPTIONS,
} from '@features/hr/data/hrEmployees'
import { HR_EXITS } from '@features/hr/data/hrWorkforce'

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Intern', label: 'Intern' },
]

const ADD_ROLE_OPTIONS = [
  { value: 'Employee', label: 'Employee' },
  { value: 'Mentor', label: 'Mentor' },
  { value: 'Recruiter', label: 'Recruiter' },
  { value: 'Payroll', label: 'Payroll' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Trainer', label: 'Mentor' },
  { value: 'Admin', label: 'Admin' },
]

const EMPLOYEE_DOCUMENTS = [
  { name: 'Resume', type: 'PDF' }, { name: 'Offer Letter', type: 'PDF' }, { name: 'Aadhaar', type: 'PDF' },
  { name: 'PAN', type: 'PDF' }, { name: 'ID Card', type: 'PNG' }, { name: 'Bank Details', type: 'PDF' },
  { name: 'Certificates', type: 'PDF' }, { name: 'Experience Letter', type: 'PDF' },
]

const splitList = (value) => String(value || '').split(',').map((s) => s.trim()).filter(Boolean)

const todayISO = () => new Date().toISOString().slice(0, 10)

// Default rich profile for rows created through the Add form, so the unified
// profile drawer renders every section even before a backend record exists.
const makeDefaultProfile = (overrides = {}) => ({
  employeeCode: 'KIN-E000', gender: '—', dob: '—', bloodGroup: 'O+', maritalStatus: '—', nationality: 'Indian',
  aadhaar: '000000000000', pan: 'AAAAA0000A', personalEmail: '—', officialEmail: '—',
  alternateNumber: '—', emergencyContact: '—', emergencyContactPerson: '—',
  currentAddress: '—', permanentAddress: '—', city: '—', state: '—', country: 'India', postalCode: '—',
  officeLocation: 'Kini EdX Hub · Koramangala', workMode: 'On-site', confirmationDate: '—',
  probationStatus: 'Under Probation', noticePeriod: '30 days', skills: [], certifications: [], education: [],
  documents: EMPLOYEE_DOCUMENTS,
  payroll: { salaryGrade: '—', bankName: '—', accountNumber: '00000000000', ifsc: '—', pfNumber: '—', esiNumber: '—' },
  attendance: { presentDays: 0, absentDays: 0, halfDays: 0, lateEntries: 0, workingHours: '—', leavesTaken: 0, attendancePercentage: 0 },
  leave: { annualLeave: 20, casualLeave: 8, sickLeave: 6, remainingLeave: 20 },
  performance: { overallRating: 4, quarterlyRating: 4, lastAppraisal: '—', achievements: [], goals: [], managerRemarks: '—' },
  assets: [],
  courseCompletion: 0, assignmentsReviewed: 0, averageFeedback: 0, monthlyRating: 0,
  lastSession: '—', nextSession: '—', mentees: [], timeline: [
    { date: todayISO(), title: 'Joined Organization', desc: 'Onboarded as a new workforce member', type: 'notice' },
  ],
  ...overrides,
})

const emptyForm = (role = 'Employee') => ({
  fullName: '', lastName: '', email: '', phone: '', department: 'Engineering', designation: '', branch: 'Bengaluru',
  type: 'Full-time', shift: 'General', manager: '', experience: '', salary: '', joinDate: todayISO(), role,
  courseExpertise: '', teachingExperience: '', assignedCourses: '', assignedBatches: '',
  maxBatchCapacity: '', teachingCertifications: '', mentoringSkills: '',
  // ENTERPRISE RBAC — HR account fields (used when role === 'HR').
  status: 'active', password: '', confirmPassword: '', permissions: emptyPermissions(),
  userRole: role === 'HR' ? USER_ROLES.HR : '', hrRole: role === 'HR' ? HR_ROLE_IDS.EXECUTIVE : '',
})

const formFromRow = (row) => {
  // ENTERPRISE RBAC — HR account fields (role, hrRole, permissions) are restored
  // from the custom profile store so edits never clobber them. Legacy HR rows
  // without a store record fall back to HR + least-privilege HR Executive.
  const hrRecord = row.role === 'HR' ? findHrUserByEmail(row.email) : null
  return {
    fullName: row.name, lastName: row.lastName || '', email: row.email, phone: row.phone, department: row.department, designation: row.designation,
    branch: row.branch, type: row.type, shift: row.shift, manager: row.manager === '—' ? '' : row.manager,
    experience: String(row.experience ?? ''), salary: String(row.salary ?? ''), joinDate: row.joinDate, role: row.role,
    courseExpertise: row.specialization || '',
    teachingExperience: String(row.teachingExperience ?? ''),
    assignedCourses: (row.assignedCourses || []).join(', '),
    assignedBatches: (row.assignedBatches || []).join(', '),
    maxBatchCapacity: String(row.maxBatchCapacity ?? ''),
    teachingCertifications: (row.teachingCertifications || []).join(', '),
    mentoringSkills: (row.mentoringSkills || []).join(', '),
    // ENTERPRISE RBAC — HR account fields restored from the custom profile store.
    status: row.status || 'active',
    password: '',
    confirmPassword: '',
    userRole: hrRecord?.role || USER_ROLES.HR,
    hrRole: hrRecord?.hrRole || HR_ROLE_IDS.EXECUTIVE,
    permissions: hrRecord?.permissions || emptyPermissions(),
  }
}

const INITIAL_FILTERS = {
  department: 'all', designation: 'all', role: 'all', status: 'all', type: 'all',
  branch: 'all', manager: 'all', experience: 'all', joining: 'all',
}

function LegacyEmployeeManagement() {
  // KINI HRMS RBAC — every action on this page follows the HR level's permissions.
  // ENTERPRISE RBAC — custom HR profiles (admin-assigned) are read from the store.
  const { can, canModule, canAccessModule } = useHrPermissions()
  const { users: hrUsers, refresh: refreshHrUsers } = useHrUsers()
  const customHrEmails = useMemo(
    () => new Set(hrUsers.map((u) => String(u.email || '').trim().toLowerCase())),
    [hrUsers],
  )
  // ENTERPRISE RBAC — canonical HR role tier per stored HR user (used for the
  // roster's role chip and the profile drawer's access display).
  const customHrRoles = useMemo(() => {
    const map = {}
    for (const u of hrUsers) map[String(u.email || '').trim().toLowerCase()] = u.hrRole
    return map
  }, [hrUsers])
  // Mentor rows are governed by the Mentors module permissions; everything else by Employees.
  const permModule = (row) => (row?.role === 'Mentor' ? 'mentors' : 'employees')
  const [searchParams, setSearchParams] = useSearchParams()
  // Support deep links: ?role=Mentor pre-filters the roster and ?addRole=Mentor
  // opens the same Add Employee form with the Role pre-selected. Params are
  // consumed once via lazy initializers (no setState inside effects).
  const urlRole = searchParams.get('role')
  const urlAddRole = searchParams.get('addRole')
  const validUrlRole = HR_ROLES.includes(urlRole) ? urlRole : 'all'
  const validUrlAddRole = ADD_ROLE_OPTIONS.some((option) => option.value === urlAddRole) ? urlAddRole : null

  const [rows, setRows] = useState(HR_WORKFORCE)
  // RBAC — a deep link may only auto-open the Add form when the user may add.
  const [drawer, setDrawer] = useState(validUrlAddRole && can('employees', 'add') ? 'add' : null) // 'add' | 'edit' | 'view'
  // UI — compact step wizard for the Add/Edit drawer so the popup never feels
  // taller than the screen (Personal → Employment → Role Details).
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState(null)
  const [profileTab, setProfileTab] = useState('overview')
  const [showTimeline, setShowTimeline] = useState(false)
  const [filters, setFilters] = useState(() => ({ ...INITIAL_FILTERS, role: validUrlRole }))
  const [form, setForm] = useState(() => emptyForm(validUrlAddRole || 'Employee'))
  const [createdAccount, setCreatedAccount] = useState(null)
  const isMentorForm = form.role === 'Mentor'
  const isHrForm = form.role === 'HR'
  // Step wizard — Employee: Personal + Employment. Mentor: + Role Details. HR: Personal + Role Details.
  const stepLabels = isHrForm ? ['Personal', 'Role Details'] : isMentorForm ? ['Personal', 'Employment', 'Role Details'] : ['Personal', 'Employment']
  const totalSteps = stepLabels.length

  // After consuming the deep-link params, clean them from the URL (external system).
  useEffect(() => {
    if (validUrlRole !== 'all' || validUrlAddRole) setSearchParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = useMemo(() => {
    const active = rows.filter((r) => r.status === 'active')
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 90)
    return {
      total: rows.length,
      activeEmployees: active.length,
      activeMentors: active.filter((r) => r.role === 'Mentor').length,
      hrStaff: rows.filter((r) => r.role === 'HR').length,
      recruiters: rows.filter((r) => r.role === 'Recruiter').length,
      managers: rows.filter((r) => r.role === 'Manager' || r.role === 'Department Head').length,
      onLeave: rows.filter((r) => r.status === 'on-leave').length,
      newJoiners: rows.filter((r) => {
        const d = new Date(`${r.joinDate}T00:00:00`)
        return d.getTime() && d >= cutoff
      }).length,
      upcomingExits: HR_EXITS.length,
    }
  }, [rows])

  const departmentStats = useMemo(() => {
    const counts = rows.reduce((result, row) => {
      const key = row.department || 'Other'
      result[key] = (result[key] || 0) + 1
      return result
    }, {})
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [rows])
  const typeStats = useMemo(() => {
    const counts = rows.reduce((result, row) => {
      const key = row.role === 'Mentor' || row.role === 'Trainer' ? 'Trainers & Mentors' : row.role === 'HR' || row.role === 'Recruiter' ? 'Administrative Staff' : 'Academic Staff'
      result[key] = (result[key] || 0) + 1
      return result
    }, {})
    return Object.entries(counts)
  }, [rows])

  const designationOptions = useMemo(() => {
    const values = [...new Set(rows.map((r) => r.designation).filter(Boolean))]
    return [{ value: 'all', label: 'All Designations' }, ...values.map((v) => ({ value: v, label: v }))]
  }, [rows])

  const managerOptions = useMemo(() => {
    const values = [...new Set(rows.map((r) => r.manager).filter((m) => m && m !== '—'))]
    return [{ value: 'all', label: 'All Managers' }, ...values.map((v) => ({ value: v, label: v }))]
  }, [rows])

  const pageSearch = usePageSearch()
  const { matches: pageMatches } = pageSearch

  const filtered = useMemo(() => rows.filter((e) => {
    if (filters.department !== 'all' && e.department !== filters.department) return false
    if (filters.designation !== 'all' && e.designation !== filters.designation) return false
    if (filters.role !== 'all' && e.role !== filters.role && e.designation !== filters.role) return false
    if (filters.status !== 'all' && String(e.status || '').toLowerCase() !== filters.status.toLowerCase()) return false
    if (filters.type !== 'all' && e.type !== filters.type) return false
    if (filters.branch !== 'all' && e.branch !== filters.branch) return false
    if (filters.manager !== 'all' && e.manager !== filters.manager) return false
    if (filters.experience !== 'all') {
      const exp = Number(e.experience) || 0
      if (filters.experience === 'lt3' && exp >= 3) return false
      if (filters.experience === '3to5' && (exp < 3 || exp > 5)) return false
      if (filters.experience === 'gt5' && exp <= 5) return false
    }
    if (filters.joining !== 'all') {
      const d = new Date(`${e.joinDate}T00:00:00`)
      const now = new Date()
      const d30 = new Date(); d30.setDate(now.getDate() - 30)
      const d90 = new Date(); d90.setDate(now.getDate() - 90)
      if (filters.joining === 'last30' && (!d.getTime() || d < d30)) return false
      if (filters.joining === 'last90' && (!d.getTime() || d < d90)) return false
      if (filters.joining === 'year' && (!d.getTime() || d.getFullYear() !== now.getFullYear())) return false
      if (filters.joining === 'older' && (!d.getTime() || d.getFullYear() >= now.getFullYear())) return false
    }
    if (!pageMatches(e)) return false
    return true
  }), [filters, rows, pageMatches])

  const activeFilterCount = Object.values(filters).filter((v) => v !== 'all').length

  // ENTERPRISE RBAC — mentor rows require an explicit Mentors.View action; other
  // rows require Employees.View. The table card itself is gated in the render below.
  const tableRows = filtered.filter((row) =>
    row.role === 'Mentor' ? canAccessModule('mentors') : canAccessModule('employees'),
  )

  const setFilter = (key) => (event) => setFilters((prev) => ({ ...prev, [key]: event.target.value }))
  const resetFilters = () => setFilters(INITIAL_FILTERS)
  const applyKpiFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    requestAnimationFrame(() => document.querySelector('.hre-table-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const openAdd = (role = 'Employee') => {
    setSelected(null)
    setForm(emptyForm(role))
    setStep(1)
    setDrawer('add')
  }

  const openEdit = (row) => {
    setSelected(row)
    setForm(formFromRow(row))
    setStep(1)
    setDrawer('edit')
  }

  const handleSave = async () => {
    const invalid = []
    if (!String(form.fullName || '').trim() || !/^[A-Za-z][A-Za-z .'-]*$/.test(String(form.fullName || '').trim())) invalid.push('First Name')
    if (form.lastName && !/^[A-Za-z][A-Za-z .'-]*$/.test(String(form.lastName).trim())) invalid.push('Last Name')
    if (form.phone && !/^\d{10}$/.test(String(form.phone).replace(/\D/g, ''))) invalid.push('Phone Number (10 digits)')
    if (invalid.length) { toast.error(`Please correct: ${invalid.join(', ')}`); return }
    // ENTERPRISE RBAC — validate the HR account before persisting a custom profile
    // (an email-less record could never match a login; mismatched passwords are a typo).
    if (form.role === 'HR') {
      if (!String(form.email || '').trim()) {
        toast.error('Email is required to create an HR user')
        return
      }
      if (!String(form.lastName || '').trim()) {
        toast.error('Last Name is required to create an HR user')
        return
      }
      // Canonical User Role = HR requires an HR Role tier (defensive — the form
      // defaults it). Non-HR user roles (e.g. Organization Admin) must NOT carry one.
      if (form.userRole === USER_ROLES.HR && !form.hrRole) {
        toast.error('HR Role is required for HR users')
        return
      }
    }
    if (drawer === 'add') {
      let persistedEmployee = null
      if (isHrForm) {
        const nameParts = String(form.fullName || '').trim().split(/\s+/).filter(Boolean)
        try {
          persistedEmployee = await employeeService.createEmployee({
            firstName: nameParts[0] || form.fullName || 'HR User',
          lastName: String(form.lastName || '').trim(),
            email: String(form.email || '').trim().toLowerCase(),
            phone: String(form.phone || '').trim(),
            role: 'HR',
            hrRole: form.hrRole || HR_ROLE_IDS.EXECUTIVE,
            employeeType: form.type || 'Full-Time',
            status: form.status || 'Active',
            createLogin: true,
            sendCredentialsEmail: true,
          })
        } catch (error) {
          toast.error(getApiErrorMessage(error, 'Unable to create HR employee account.'))
          return
        }
      }
      const id = persistedEmployee?.employeeId ?? persistedEmployee?.id ?? nextEmployeeId()
      const isMentor = form.role === 'Mentor'
      const newRow = makeDefaultProfile({
        id,
        employeeId: id,
        name: form.fullName || 'New Employee',
        email: persistedEmployee?.email ?? form.email ?? 'new.hire@kinieduhub.io',
        phone: form.phone || '+91 90000 00000',
        department: form.role === 'HR' ? 'HR' : form.department,
        designation: form.designation || 'Associate',
        branch: form.role === 'HR' ? 'Bengaluru' : form.branch,
        type: form.role === 'HR' ? 'Full-time' : form.type,
        shift: form.role === 'HR' ? 'General' : form.shift,
        manager: form.manager || '—',
        experience: Number(form.experience) || 0,
        salary: Number(form.salary) || 0,
        joinDate: form.joinDate || todayISO(),
        status: form.role === 'HR' ? (form.status || 'active') : 'active',
        rating: 4.0,
        role: persistedEmployee?.role ?? form.role,
        ...(isMentor
          ? {
              specialization: form.courseExpertise,
              assignedCourses: splitList(form.assignedCourses),
              assignedBatches: splitList(form.assignedBatches),
              maxBatchCapacity: Number(form.maxBatchCapacity) || 0,
              teachingCertifications: splitList(form.teachingCertifications),
              mentoringSkills: splitList(form.mentoringSkills),
              teachingExperience: form.teachingExperience,
              availability: 'available',
              studentsAssigned: 0,
              currentBatch: '—',
              completedSessions: 0,
              upcomingSessions: 0,
              courseCompletion: 0,
            }
          : {}),
      })
      // ENTERPRISE RBAC — an HR user also gets a custom permission profile in the store,
      // which drives their dashboard after login. CRUD logic for the employee row is untouched.
      if (form.role === 'HR') {
        const existing = findHrUserByEmail(form.email)
        upsertHrUser({
          id: existing?.id || '',
          name: form.fullName || 'New HR User',
          email: form.email,
          mobile: form.phone,
          designation: form.designation,
          status: form.status || 'active',
          role: form.userRole || USER_ROLES.HR,
          hrRole: form.hrRole || HR_ROLE_IDS.EXECUTIVE,
          permissions: form.permissions,
        })
        const granted = countGranted(form.permissions)
        refreshHrUsers()
        toast.success(`HR user ${form.fullName || id} created · ${granted} permission${granted === 1 ? '' : 's'} granted`)
      } else {
        toast.success(`${isMentor ? 'Mentor' : 'Employee'} ${id} added successfully`)
      }
      setRows((prev) => [newRow, ...prev])
      setCreatedAccount({
        entityType: form.role === 'HR' ? 'hr' : isMentor ? 'mentor' : 'employee',
        name: newRow.name,
        id: newRow.employeeId,
        email: newRow.email,
        password: '',
        record: newRow,
      })
    } else if (drawer === 'edit' && selected) {
      const isMentor = form.role === 'Mentor'
      setRows((prev) => prev.map((r) => (r.id === selected.id ? {
        ...r,
        name: form.fullName || r.name,
        email: form.email || r.email,
        phone: form.phone || r.phone,
        department: form.department,
        designation: form.designation,
        branch: form.branch,
        type: form.type,
        shift: form.shift,
        manager: form.manager || '—',
        experience: Number(form.experience) || r.experience,
        salary: Number(form.salary) || r.salary,
        joinDate: form.joinDate || r.joinDate,
        role: form.role,
        ...(isMentor
          ? {
              specialization: form.courseExpertise,
              assignedCourses: splitList(form.assignedCourses),
              assignedBatches: splitList(form.assignedBatches),
              maxBatchCapacity: Number(form.maxBatchCapacity) || 0,
              teachingCertifications: splitList(form.teachingCertifications),
              mentoringSkills: splitList(form.mentoringSkills),
              teachingExperience: form.teachingExperience,
              availability: r.availability || 'available',
            }
          : {
              specialization: undefined,
              assignedCourses: [],
              assignedBatches: [],
              maxBatchCapacity: 0,
              teachingCertifications: [],
              mentoringSkills: [],
              teachingExperience: '',
            }),
      } : r)))
      // ENTERPRISE RBAC — keep the HR user's custom profile in sync when an HR row is edited.
      if (selected.role === 'HR' || form.role === 'HR') {
        const existing = findHrUserByEmail(selected.email || form.email)
        upsertHrUser({
          id: existing?.id || '',
          name: form.fullName || selected.name,
          email: form.email || selected.email,
          mobile: form.phone || selected.phone,
          designation: form.designation || selected.designation,
          status: form.status || selected.status || 'active',
          role: form.userRole || USER_ROLES.HR,
          hrRole: form.hrRole || HR_ROLE_IDS.EXECUTIVE,
          permissions: form.permissions,
        })
        const granted = countGranted(form.permissions)
        refreshHrUsers()
        toast.success(`${form.fullName || selected.name} updated · ${granted} permission${granted === 1 ? '' : 's'} granted`)
      } else {
        toast.success(`${selected.name} updated successfully`)
      }
    }
    setDrawer(null)
  }

  // Monotonic employee id — never collides with existing rows after deletions.
  const nextEmployeeId = () => {
    const maxId = rows.reduce((max, r) => {
      const num = Number.parseInt(String(r.employeeId || r.id || '').replace(/[^0-9]/g, ''), 10)
      return Number.isFinite(num) ? Math.max(max, num) : max
    }, 100)
    return `EMP-${maxId + 1}`
  }

  const handleDelete = (row) => {
    if (!window.confirm(`Delete ${row.name}? This action cannot be undone.`)) return
    setRows((prev) => prev.filter((r) => r.id !== row.id))
    // ENTERPRISE RBAC — deleting an HR user also revokes their custom access profile.
    if (row.role === 'HR') {
      const record = findHrUserByEmail(row.email)
      if (record) {
        removeHrUser(record.id)
        refreshHrUsers()
      }
    }
    toast.success(`${row.name} deleted`)
  }

  const handleDuplicate = (row) => {
    setRows((prev) => [
      { ...row, id: `EMP-${Date.now()}`, employeeId: `EMP-${Date.now()}`, name: `${row.name} (Copy)`, status: 'pending' },
      ...prev,
    ])
    toast.success(`${row.name} duplicated`)
  }

  const handleArchive = (row) => {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: 'inactive' } : r)))
    toast.success(`${row.name} deactivated`)
  }

  const handleActivate = (row) => {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: 'active' } : r)))
    toast.success(`${row.name} activated`)
  }

  const handleTransfer = (row) => {
    const branches = HR_BRANCHES.filter((b) => b.value !== 'all').map((b) => b.value)
    const idx = branches.indexOf(row.branch)
    const nextBranch = branches[(idx + 1) % branches.length]
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, branch: nextBranch } : r)))
    toast.success(`${row.name} transferred to ${nextBranch}`)
  }

  const handlePromote = (row) => {
    const prefix = 'Senior '
    const nextDesignation = row.designation?.startsWith(prefix) ? row.designation : `${prefix}${row.designation || 'Associate'}`
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, designation: nextDesignation } : r)))
    toast.success(`${row.name} promoted to ${nextDesignation} 🎉`)
  }

  const handleExportExcel = () => {
    exportCSV({
      filename: 'employees',
      headers: ['ID', 'Name', 'Email', 'Role', 'Department', 'Designation', 'Type', 'Manager', 'Branch', 'Status', 'Joining Date', 'Phone'],
      rows: filtered.map((r) => [r.employeeId, r.name, r.email, r.role, r.department, r.designation, r.type, r.manager, r.branch, r.status, r.joinDate, r.phone]),
    })
    toast.success(`Exported ${filtered.length} workforce members to Excel`)
  }

  const handleExportPdf = () => {
    exportPDF({
      filename: 'employees',
      title: 'Employee Register',
      headers: ['ID', 'Name', 'Role', 'Department', 'Designation', 'Branch', 'Status'],
      rows: filtered.map((r) => [r.employeeId, r.name, r.role, r.department, r.designation, r.branch, r.status]),
      subtitle: `${filtered.length} workforce members · Kini HRMS`,
    })
    toast.success(`Exported ${filtered.length} workforce members to PDF`)
  }

  const formatShortDate = (iso) => {
    if (!iso || iso === '—') return '—'
    const date = new Date(`${iso}T00:00:00`)
    if (Number.isNaN(date.getTime())) return iso
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const columns = [
    {
      accessor: 'employeeId', header: 'Employee ID', sortable: true, width: 104,
      render: (row) => <span className="text-xs font-bold text-[#0f55f7] dark:text-blue-300">{row.employeeId}</span>,
    },
    {
      accessor: 'name', header: 'Employee Name', sortable: true, minWidth: 200,
      render: (row) => (
        <div className="min-w-0">
          {can(permModule(row), 'view') ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setSelected(row); setProfileTab('overview'); setDrawer('view') }}
              className="block max-w-full truncate text-left text-sm font-semibold text-slate-900 transition-colors hover:text-[#0f55f7] dark:text-white dark:hover:text-blue-300"
            >
              {row.name}
            </button>
          ) : (
            <span className="block max-w-full truncate text-sm font-semibold text-slate-900 dark:text-white">{row.name}</span>
          )}
          <p className="truncate text-[11px] text-slate-400">{row.email}</p>
        </div>
      ),
    },
    { accessor: 'department', header: 'Department', sortable: true, render: (row) => (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
        <Building2 className="h-3.5 w-3.5 text-slate-400" />{row.department}
      </span>
    )},
    { accessor: 'designation', header: 'Designation', sortable: true, render: (row) => (
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{row.designation}</span>
    )},
    { accessor: 'role', header: 'Role', sortable: true, render: (row) => (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <HRRoleBadge role={row.role} />
        {/* ENTERPRISE RBAC — HR rows with a custom permission profile get a Custom Access chip. */}
        {row.role === 'HR' && customHrEmails.has(String(row.email || '').trim().toLowerCase()) && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#0f55f7]/25 bg-[#0f55f7]/5 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#0f55f7]">
            <ShieldCheck className="h-2.5 w-2.5" /> Custom
          </span>
        )}
        {/* ENTERPRISE RBAC — the canonical HR role tier (e.g. HR Manager) for HR users. */}
        {row.role === 'HR' && customHrRoles[String(row.email || '').trim().toLowerCase()] && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {HR_ROLE_LABELS[customHrRoles[String(row.email || '').trim().toLowerCase()]]}
          </span>
        )}
      </span>
    ) },
    { accessor: 'type', header: 'Employment Type', sortable: true, render: (row) => (
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{row.type}</span>
    )},
    { accessor: 'manager', header: 'Reporting Manager', sortable: true, render: (row) => (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <UserCheck className="h-3.5 w-3.5" />{row.manager}
      </span>
    )},
    { accessor: 'branch', header: 'Branch', sortable: true, render: (row) => (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <MapPin className="h-3.5 w-3.5" />{row.branch}
      </span>
    )},
    { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={row.status} /> },
    { accessor: 'joinDate', header: 'Joining Date', sortable: true, render: (row) => (
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{formatShortDate(row.joinDate)}</span>
    )},
    { accessor: 'contact', header: 'Contact', sortable: true, minWidth: 150, render: (row) => (
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">{row.phone}</p>
        <p className="truncate text-[11px] text-slate-400">{row.email}</p>
      </div>
    )},
    {
      accessor: '__actions', header: 'Actions', sortable: false, sticky: 'right', width: 96,
      render: (row) => {
        const perm = permModule(row)
        // ENTERPRISE RBAC — unauthorized actions are hidden entirely (never disabled).
        const items = [
          { label: 'View', icon: Eye, onClick: () => { setSelected(row); setProfileTab('overview'); setDrawer('view') }, visible: can(perm, 'view') },
          { label: 'Edit', icon: Pencil, onClick: () => openEdit(row), visible: can(perm, 'edit') },
          { label: 'Transfer', icon: ArrowUpRight, onClick: () => handleTransfer(row), visible: can(perm, 'edit') },
          { label: 'Promote', icon: Rocket, onClick: () => handlePromote(row), visible: can(perm, 'edit') },
          { label: 'View Timeline', icon: History, onClick: () => { setSelected(row); setShowTimeline(true) }, visible: can(perm, 'view') },
          { label: 'Documents', icon: FileText, onClick: () => { setSelected(row); setProfileTab('documents'); setDrawer('view') }, visible: canModule('documents') },
          ...(row.status === 'inactive'
            ? [{ label: 'Activate', icon: BadgeCheck, onClick: () => handleActivate(row), visible: can(perm, 'edit') }]
            : [{ label: 'Deactivate', icon: Ban, onClick: () => handleArchive(row), visible: can(perm, 'edit') }]),
          { label: 'Duplicate', icon: Copy, onClick: () => handleDuplicate(row), visible: can(perm, 'add') },
          { label: 'Delete', icon: Trash2, danger: true, onClick: () => handleDelete(row), visible: can(perm, 'delete') },
        ].filter((item) => item.visible)
        return (
          <div className="flex items-center gap-1">
            {can(perm, 'view') && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelected(row); setProfileTab('overview'); setDrawer('view') }}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0f55f7] dark:hover:bg-slate-800"
                aria-label={`View profile of ${row.name}`}
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            {canModule('documents') && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelected(row); setProfileTab('documents'); setDrawer('view') }}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0f55f7] dark:hover:bg-slate-800"
                aria-label={`Open documents for ${row.name}`}
                title="Employee documents"
              >
                <FileText className="h-4 w-4" />
              </button>
            )}
            {items.length > 0 && <HRActionMenu items={items} />}
          </div>
        )
      },
    },
  ]

  const drawerTitle = drawer === 'add'
    ? isHrForm ? 'Create HR User' : form.role === 'Mentor' ? 'Add Mentor' : 'Add Employee'
    : drawer === 'edit'
      ? `Edit ${selected?.name || 'Employee'}`
      : selected?.name || 'Employee Profile'
  const drawerSubtitle = drawer === 'add'
    ? isHrForm ? 'Create an HR account and assign custom permissions' : form.role === 'Mentor' ? 'Create a new mentor · role pre-selected' : 'Create a new employee profile'
    : drawer === 'edit'
      ? isHrForm ? 'Update HR account details and permissions' : 'Update profile, employment and role details'
      : `${selected?.designation} · ${selected?.department}`

  // ENTERPRISE RBAC — unauthorized actions are hidden entirely (never disabled),
  // per the custom permission profile of the logged-in HR user.
  const quickActions = [
    can('employees', 'add') && { key: 'add-employee', label: 'Add Employee', icon: UserPlus, onClick: () => openAdd('Employee'), variant: 'primary' },
    can('employees', 'export') && { key: 'export-excel', label: 'Export Excel', icon: FileSpreadsheet, onClick: handleExportExcel },
    can('employees', 'export') && { key: 'export-pdf', label: 'Export PDF', icon: FileText, onClick: handleExportPdf },
    can('employees', 'import') && { key: 'import', label: 'Import', icon: ImportIcon, onClick: () => toast.success('Import dialog opened (demo)') },
  ].filter(Boolean)

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all focus:border-[#0f55f7] focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white'
  const fieldLabel = 'mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400'

  const updateForm = (key) => (event) => {
    let value = event.target.value
    if (key === 'fullName' || key === 'lastName') value = value.replace(/[^A-Za-z .'-]/g, '')
    if (key === 'phone') value = value.replace(/\D/g, '').slice(0, 10)
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const renderField = ({ label, name, type = 'text', value, onChange, options }) => (
    <label className="block" key={name}>
      <span className={fieldLabel}>{label}</span>
      {options ? (
        <select name={name} value={value} onChange={onChange} className={inputCls}>
          {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={`Enter ${label.toLowerCase()}`}
          className={inputCls}
        />
      )}
    </label>
  )

  return (
    <HRPage
      className="hrp-employees-pg"
      moduleId="employees"
      title="Employee Management"
      subtitle="Every person in the organisation — employees, mentors, HR staff, recruiters, payroll staff, managers and department heads — managed from one centralized workspace."
      icon={Users2}
      lastUpdated="Aug 6, 2026 · 09:12 AM"
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search employees…' }}
      actions={<HRQuickActions actions={quickActions} />}
      hero={
        <>
          <HrBreadcrumb items={[{ label: 'Employees' }]} />
          <HrHero
            {...heroProps('employees')}
            actions={<HRQuickActions actions={quickActions} />}
          />
        </>
      }
    >
      {/* Workforce analytics */}
      <HrKpis
        items={[
          { label: 'Total Employees', value: stats.total, icon: Users2, tone: 'blue', onClick: () => applyKpiFilter('status', 'all') },
          { label: 'Active Employees', value: stats.activeEmployees, icon: UserCheck, tone: 'green', onClick: () => applyKpiFilter('status', 'active') },
          { label: 'Mentors', value: stats.activeMentors, icon: GraduationCap, tone: 'purple', onClick: () => applyKpiFilter('role', 'Mentor') },
          { label: 'HR Employees', value: stats.hrStaff, icon: Briefcase, tone: 'orange', onClick: () => applyKpiFilter('role', 'HR') },
          { label: 'On Leave Today', value: stats.onLeave, icon: Clock, tone: 'red', onClick: () => applyKpiFilter('status', 'on-leave') },
        ]}
      />
      <div className="mb-4" />
      {/* Filters + table — ENTERPRISE RBAC: the whole card is hidden without Employees.View */}
      {canAccessModule('employees') ? (
      <div className="hre-table-card rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 sm:p-5">
        <div className="hre-list-head">
          <span className="hre-list-head__icon" aria-hidden="true"><Users2 /></span>
          <div className="min-w-0 flex-1"><h2>Employee List</h2><p>View and manage all employees</p></div>
        </div>
        <HRFilterBar
          filters={[
            { key: 'department', label: 'Department', value: filters.department, onChange: setFilter('department'), options: HR_DEPARTMENT_LIST },
            { key: 'designation', label: 'Designation', value: filters.designation, onChange: setFilter('designation'), options: designationOptions },
            { key: 'role', label: 'Role', value: filters.role, onChange: setFilter('role'), options: HR_ROLE_OPTIONS },
            { key: 'status', label: 'Status', value: filters.status, onChange: setFilter('status'), options: HR_STATUS_OPTIONS },
            { key: 'type', label: 'Employment Type', value: filters.type, onChange: setFilter('type'), options: TYPE_OPTIONS },
            { key: 'branch', label: 'Branch', value: filters.branch, onChange: setFilter('branch'), options: HR_BRANCHES },
            { key: 'manager', label: 'Reporting Manager', value: filters.manager, onChange: setFilter('manager'), options: managerOptions },
            { key: 'experience', label: 'Experience', value: filters.experience, onChange: setFilter('experience'), options: HR_EXPERIENCE_OPTIONS },
            { key: 'joining', label: 'Joining Date', value: filters.joining, onChange: setFilter('joining'), options: HR_JOINING_OPTIONS },
          ]}
          onReset={resetFilters}
          onSave={() => toast.success(`${activeFilterCount} filters applied`)}
        />
        <p className="mt-3 text-[11px] font-medium text-slate-400">
          {tableRows.length} of {rows.length} workforce members
          {filters.role !== 'all' && ` · showing role: ${filters.role}`}
          {activeFilterCount > 0 && ` · ${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}`}
        </p>
        <div className="mt-3">
          {/* UI cleanup — row-selection checkboxes + bulk bar and the Photo column are
              removed; all operations remain available via the row ⋯ menu and quick actions. */}
          <HRDataTable
            columns={columns}
            data={tableRows}
            searchable={false}
            pageSize={8}
            exportFileName="employees"
            exportTitle="Employee Register"
            onRowClick={(row) => { setSelected(row); setProfileTab('overview'); setDrawer('view') }}
            emptyTitle={filters.role !== 'all' ? `No ${filters.role.toLowerCase()} found` : 'No workforce members found'}
            emptyDescription="Try adjusting your search or filters."
            emptyIcon={Users2}
            exportable={false}
          />
        </div>
      </div>
      ) : (
        <div className="flex min-h-[36vh] flex-col items-center justify-center rounded-2xl border border-slate-200/70 bg-white p-10 text-center shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">View access required</h2>
          <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Your HR access does not include viewing the Employees module. Ask the Organization Admin to grant the
            View permission for Employees.
          </p>
        </div>
      )}

      {canAccessModule('employees') && (
      <div className="hre-analytics mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-bold text-slate-900 dark:text-white">Department Distribution</h2><p className="mt-0.5 text-[11px] text-slate-400">Current workforce distribution</p></div><Building2 className="h-4 w-4 text-[#0f55f7]" /></div>
          <div className="space-y-3">{departmentStats.map(([department, count]) => <div key={department}><div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-500"><span className="truncate">{department}</span><span className="text-slate-700 dark:text-slate-200">{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-[#0f55f7]" style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }} /></div></div>)}{!departmentStats.length && <p className="py-6 text-center text-xs text-slate-400">No department data available.</p>}</div>
        </section>
        <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-bold text-slate-900 dark:text-white">Staff Categories</h2><p className="mt-0.5 text-[11px] text-slate-400">Role mix across the workforce</p></div><Users2 className="h-4 w-4 text-[#06b6a8]" /></div>
          <div className="flex items-center gap-5">{typeStats.length ? <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#0f55f7 0 ${stats.total ? (typeStats[0][1] / stats.total) * 100 : 0}%, #06b6a8 0 ${stats.total ? ((typeStats[0][1] + (typeStats[1]?.[1] || 0)) / stats.total) * 100 : 0}%, #f59e0b 0 100%)` }}><div className="grid h-16 w-16 place-items-center rounded-full bg-white text-center dark:bg-slate-900"><b className="text-xl text-slate-900 dark:text-white">{stats.total}</b><span className="text-[9px] text-slate-400">Total</span></div></div> : null}<div className="min-w-0 flex-1 space-y-2.5">{typeStats.map(([type, count], index) => <div key={type} className="flex items-center justify-between gap-2 text-[11px]"><span className="flex min-w-0 items-center gap-2 truncate"><i className={`h-2 w-2 shrink-0 rounded-full ${index === 0 ? 'bg-[#0f55f7]' : index === 1 ? 'bg-[#06b6a8]' : 'bg-amber-400'}`} />{type}</span><b className="text-slate-700 dark:text-slate-200">{count} ({stats.total ? Math.round((count / stats.total) * 100) : 0}%)</b></div>)}</div></div>
        </section>
        <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-bold text-slate-900 dark:text-white">Attendance Overview</h2><p className="mt-0.5 text-[11px] text-slate-400">Today&apos;s workforce status</p></div><UserCheck className="h-4 w-4 text-emerald-500" /></div><div className="flex items-center gap-5"><div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#06b6a8 0 ${stats.total ? (stats.activeEmployees / stats.total) * 100 : 0}%, #f59e0b 0 ${stats.total ? ((stats.activeEmployees + stats.onLeave) / stats.total) * 100 : 0}%, #ef4444 0 100%)` }}><div className="grid h-16 w-16 place-items-center rounded-full bg-white text-center dark:bg-slate-900"><b className="text-xl text-slate-900 dark:text-white">{stats.total ? Math.round((stats.activeEmployees / stats.total) * 100) : 0}%</b><span className="text-[9px] text-slate-400">Present</span></div></div><div className="flex-1 space-y-2.5 text-[11px]">{[['Present', stats.activeEmployees, 'bg-emerald-500'], ['On Leave', stats.onLeave, 'bg-amber-400'], ['Other', Math.max(0, stats.total - stats.activeEmployees - stats.onLeave), 'bg-slate-400']].map(([label, count, tone]) => <div key={label} className="flex items-center justify-between"><span className="flex items-center gap-2"><i className={`h-2 w-2 rounded-full ${tone}`} />{label}</span><b className="text-slate-700 dark:text-slate-200">{count}</b></div>)}</div></div></section>
      </div>
      )}

      {/* Add / Edit drawer — compact step wizard so the popup fits any screen */}
      <HRDrawer
        open={drawer === 'add' || drawer === 'edit'}
        onClose={() => setDrawer(null)}
        title={drawerTitle}
        subtitle={drawerSubtitle}
        icon={drawer === 'add' && isHrForm ? ShieldCheck : drawer === 'add' && isMentorForm ? GraduationCap : UserPlus}
        width="max-w-[560px]"
        footer={
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              {step > 1 && (
                <Button variant="secondary" size="sm" onClick={() => setStep((s) => Math.max(1, s - 1))}>Back</Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setDrawer(null)}>Cancel</Button>
            </div>
            {step < totalSteps ? (
              <Button variant="primary" size="sm" onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}>
                Next <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button variant="primary" size="sm" icon={Save} onClick={handleSave}>
                {drawer === 'add' ? (isHrForm ? 'Create HR User' : `Add ${form.role === 'Mentor' ? 'Mentor' : 'Employee'}`) : 'Save Changes'}
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {stepLabels.map((label, i) => {
              const stepNo = i + 1
              const active = step === stepNo
              const done = step > stepNo
              return (
                <Fragment key={label}>
                  {i > 0 && <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />}
                  <button
                    type="button"
                    onClick={() => setStep(stepNo)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] text-white shadow-sm'
                        : done
                          ? 'bg-[#0f55f7]/10 text-[#0f55f7]'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                    }`}
                  >
                    {done ? <Check className="h-3 w-3" /> : <span className="leading-none">{stepNo}</span>}
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                </Fragment>
              )
            })}
          </div>

          {/* Step 1 — Personal */}
          {step === 1 && (
            <form id="employee-form" onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block">
                  <span className={fieldLabel}>Role</span>
                  <select name="role" value={form.role} onChange={(e) => { setForm((prev) => ({ ...prev, role: e.target.value })); setStep(1) }} className={inputCls}>
                    {ADD_ROLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </label>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  {isHrForm
                    ? 'HR users get an account + custom permission profile on the next step.'
                    : isMentorForm
                      ? 'Mentor-specific fields (courses, batches, capacity) come on the last step.'
                      : 'Selecting Mentor or HR reveals role-specific steps.'}
                </p>
              </div>
              {isHrForm ? (
                <div className="sm:col-span-2 rounded-xl bg-gradient-to-br from-[#0f55f7]/8 to-[#06b6a8]/8 p-4">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">HR account setup</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Name, email, mobile, designation, status and the permission matrix are configured on the
                    <strong> Role Details</strong> step.
                  </p>
                </div>
              ) : (
                <>
                  {renderField({ label: 'Full Name', name: 'full_name', value: form.fullName, onChange: updateForm('fullName') })}
                  {renderField({ label: 'Email', name: 'email', type: 'email', value: form.email, onChange: updateForm('email') })}
                  {renderField({ label: 'Phone', name: 'phone', value: form.phone, onChange: updateForm('phone') })}
                  {renderField({
                    label: 'Department', name: 'department', value: form.department, onChange: updateForm('department'),
                    options: HR_DEPARTMENT_LIST.filter((o) => o.value !== 'all').map((o) => ({ value: o.value, label: o.label })),
                  })}
                  {renderField({ label: 'Designation', name: 'designation', value: form.designation, onChange: updateForm('designation') })}
                  {renderField({
                    label: 'Branch', name: 'branch', value: form.branch, onChange: updateForm('branch'),
                    options: HR_BRANCHES.filter((o) => o.value !== 'all').map((o) => ({ value: o.value, label: o.label })),
                  })}
                </>
              )}
            </form>
          )}

          {/* Step 2 — Employment (not shown for HR accounts) */}
          {step === 2 && !isHrForm && (
            <form id="employee-form" onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {renderField({
                label: 'Employment Type', name: 'employee_type', value: form.type, onChange: updateForm('type'),
                options: TYPE_OPTIONS.filter((o) => o.value !== 'all').map((o) => ({ value: o.value, label: o.label })),
              })}
              {renderField({
                label: 'Shift', name: 'shift', value: form.shift, onChange: updateForm('shift'),
                options: [{ value: 'General', label: 'General' }, { value: 'Morning', label: 'Morning' }, { value: 'Night', label: 'Night' }, { value: 'Flexible', label: 'Flexible' }],
              })}
              {renderField({ label: 'Reporting Manager', name: 'manager', value: form.manager, onChange: updateForm('manager') })}
              {renderField({ label: 'Experience (yrs)', name: 'experience_yrs', type: 'number', value: form.experience, onChange: updateForm('experience') })}
              {renderField({ label: 'Salary (LPA)', name: 'salary_lpa', type: 'number', value: form.salary, onChange: updateForm('salary') })}
              {renderField({ label: 'Joining Date', name: 'join_date', type: 'date', value: form.joinDate, onChange: updateForm('joinDate') })}
            </form>
          )}

          {/* Step 3 — Role details (mentor fields or HR permission matrix) */}
          {step === 3 && isMentorForm && (
            <form id="employee-form" onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 rounded-xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/5 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-[#8b5cf6] dark:border-[#8b5cf6]/30 dark:bg-[#8b5cf6]/10">
                Mentor Details
              </div>
              {renderField({ label: 'Course Expertise', name: 'course_expertise', value: form.courseExpertise, onChange: updateForm('courseExpertise') })}
              {renderField({ label: 'Teaching Experience (yrs)', name: 'teaching_experience', type: 'number', value: form.teachingExperience, onChange: updateForm('teachingExperience') })}
              {renderField({ label: 'Assigned Courses (comma separated)', name: 'assigned_courses', value: form.assignedCourses, onChange: updateForm('assignedCourses') })}
              {renderField({ label: 'Assigned Batches (comma separated)', name: 'assigned_batches', value: form.assignedBatches, onChange: updateForm('assignedBatches') })}
              {renderField({ label: 'Maximum Batch Capacity', name: 'max_batch_capacity', type: 'number', value: form.maxBatchCapacity, onChange: updateForm('maxBatchCapacity') })}
              {renderField({ label: 'Teaching Certifications (comma separated)', name: 'teaching_certifications', value: form.teachingCertifications, onChange: updateForm('teachingCertifications') })}
              <div className="sm:col-span-2">
                {renderField({ label: 'Mentoring Skills (comma separated)', name: 'mentoring_skills', value: form.mentoringSkills, onChange: updateForm('mentoringSkills') })}
              </div>
            </form>
          )}
          {step === totalSteps && isHrForm && (
            <HrUserForm
              key={`${drawer}-${selected?.id || 'new'}`}
              // ENTERPRISE RBAC — HrUserForm uses store-shaped keys (name/mobile);
              // map them onto the unified employee form keys (fullName/phone).
              value={{
                name: form.fullName, lastName: form.lastName, email: form.email, mobile: form.phone,
                designation: form.designation, status: form.status,
                role: form.userRole || USER_ROLES.HR,
                hrRole: form.hrRole || HR_ROLE_IDS.EXECUTIVE,
                password: form.password, confirmPassword: form.confirmPassword,
                permissions: form.permissions,
              }}
              onChange={(draft) => setForm((prev) => ({
                ...prev,
                fullName: draft.name, lastName: draft.lastName, phone: draft.mobile, email: draft.email,
                designation: draft.designation, status: draft.status,
                userRole: draft.role, hrRole: draft.hrRole,
                password: draft.password, confirmPassword: draft.confirmPassword,
                permissions: draft.permissions,
              }))}
            />
          )}

          <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-400 dark:bg-slate-800/40">
            Demo form — no API calls are made. Save updates the local workspace state with a success toast.
          </p>
        </div>
      </HRDrawer>

      {/* Unified profile drawer */}
      <EmployeeProfileDrawer
        open={drawer === 'view'}
        employee={selected}
        initialTab={profileTab}
        onClose={() => setDrawer(null)}
        onEdit={() => selected && openEdit(selected)}
        // ENTERPRISE RBAC — surface the canonical User Role + HR Role for HR rows
        // that have a stored RBAC profile (legacy rows without one show no tier chip,
        // since their access derives from the level resolver, not a canonical hrRole).
        hrAccess={selected?.role === 'HR' && customHrEmails.has(String(selected.email || '').trim().toLowerCase())
          ? { role: USER_ROLES.HR, hrRole: customHrRoles[String(selected.email || '').trim().toLowerCase()] }
          : null}
        canEdit={can(permModule(selected), 'edit')}
        canExport={can(permModule(selected), 'export')}
        canPrint={can(permModule(selected), 'print')}
        canAssign={can(permModule(selected), 'assign')}
        // KINI HRMS RBAC — sections follow the HR level's module view.
        canModule={canModule}
      />

      {/* Timeline drawer */}
      <HRDrawer
        open={showTimeline}
        onClose={() => setShowTimeline(false)}
        title="Employee Timeline"
        subtitle={selected?.name ? `${selected.name} · ${selected.employeeId}` : undefined}
        icon={History}
        width="max-w-[440px]"
      >
        <HRTimeline
          items={(selected?.timeline || []).length ? selected.timeline : [{
            date: selected?.joinDate || '—',
            title: 'Joined Organization',
            desc: `Onboarded as ${selected?.designation} · ${selected?.department}`,
            type: 'notice',
          }]}
        />
        <div className="mt-5 rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-400 dark:bg-slate-800/40">
          All entries are illustrative mock data for the enhanced HRMS UI. Live history will stream from the employee API.
        </div>
      </HRDrawer>
      <AccountCreatedModal
        open={Boolean(createdAccount)}
        {...createdAccount}
        onClose={() => setCreatedAccount(null)}
        onView={() => { setSelected(createdAccount?.record); setProfileTab('overview'); setDrawer('view'); setCreatedAccount(null) }}
        onDashboard={() => setCreatedAccount(null)}
      />
    </HRPage>
  )
}

export default function EmployeeManagement(props) {
  return <HrLiveBoundary module="employees" legacy={<LegacyEmployeeManagement {...props} />} />
}
