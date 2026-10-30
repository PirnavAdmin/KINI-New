import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import usePageSearch from '@features/hr/hooks/usePageSearch'
import {
  GraduationCap, Star, BookOpen, Users2, CalendarDays, Eye, Pencil, TrendingUp,
  Building2, Briefcase, Download,
  CalendarCheck, Trash2, Ban, ClipboardCheck, Archive, Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import StatsCard from '@shared/components/StatsCard'
import HRPage from '@features/hr/components/HRPage'
import HREntityForm from '@features/hr/components/HREntityForm'
import HRDataTable from '@features/hr/components/HRDataTable'
import HRActionMenu from '@features/hr/components/HRActionMenu'
import MentorToolbar from '@features/hr/components/MentorToolbar'
import MentorSummaryCards from '@features/hr/components/MentorSummaryCards'
import MentorProfileDrawer from '@features/hr/components/MentorProfileDrawer'
import { HRSection, HRAvatar, HRStatusBadge, HRProgressBar } from '@features/hr/components/hrPrimitives'
import { exportCSV, exportPDF } from '@features/hr/components/hrExport'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import { HR_MENTOR_STATS, HR_DEPARTMENT_LIST, HR_MENTOR_EMPLOYEES } from '@features/hr/data/hrEmployees'

const formatShortDate = (iso) => {
  if (!iso || iso === '—') return '—'
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const COLUMN_OPTIONS = [
  { key: 'photo', label: 'Photo' },
  { key: 'employeeId', label: 'Employee ID' },
  { key: 'name', label: 'Mentor Name' },
  { key: 'department', label: 'Department' },
  { key: 'designation', label: 'Designation' },
  { key: 'specialization', label: 'Specialization' },
  { key: 'courses', label: 'Assigned Courses' },
  { key: 'batches', label: 'Batches' },
  { key: 'students', label: 'Students' },
  { key: 'attendance', label: 'Attendance %' },
  { key: 'completion', label: 'Completion %' },
  { key: 'rating', label: 'Rating' },
  { key: 'experience', label: 'Experience' },
  { key: 'availability', label: 'Availability' },
  { key: 'status', label: 'Employment Status' },
  { key: 'lastSession', label: 'Last Session' },
  { key: 'nextSession', label: 'Next Session' },
  { key: 'actions', label: 'Actions' },
]

const ALL_COLUMN_KEYS = COLUMN_OPTIONS.map((col) => col.key)

const INITIAL_FILTERS = {
  department: 'all', specialization: 'all', availability: 'all', status: 'all',
  experience: 'all', rating: 'all', workMode: 'all',
}

export default function MentorManagement() {
  // KINI HRMS RBAC — mentor actions follow the mentors module permissions.
  const { can } = useHrPermissions()

  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const { search, setSearch, debounced: debouncedSearch } = usePageSearch('')
  const [sortBy, setSortBy] = useState('default')
  const [visibleColumns, setVisibleColumns] = useState(() => new Set(ALL_COLUMN_KEYS))
  const [profileMentor, setProfileMentor] = useState(null)
  const [tableLoading, setTableLoading] = useState(true)
  const [mentors, setMentors] = useState(HR_MENTOR_EMPLOYEES)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('edit') // edit | batch | course
  const [editMentor, setEditMentor] = useState(null)
  const fileInputRef = useRef(null)

  // Rows carry an extra __searchText blob so search also covers course/batch names.
  const employees = useMemo(() => mentors.map((m) => ({
    ...m,
    __searchText: [
      m.employeeId, m.employeeCode, m.name, m.email, m.phone,
      m.department, m.designation, m.specialization,
      (m.assignedCourses || []).join(' '), (m.assignedBatches || []).join(' '),
    ].join(' ').toLowerCase(),
  })), [mentors])

  const addMentor = useCallback((values) => {
    const id = `EMP-${String(mentors.length + 1).padStart(4, '0')}`
    setMentors((prev) => [{
      id,
      employeeId: id,
      employeeCode: id,
      name: values.name,
      email: values.email,
      phone: '—',
      department: values.department,
      designation: values.designation,
      specialization: values.specialization,
      assignedCourses: [],
      assignedBatches: [],
      studentsAssigned: 0,
      attendancePercentage: 100,
      courseCompletion: 0,
      rating: 0,
      experience: Number(values.experience) || 0,
      availability: values.availability,
      status: values.status,
      workMode: 'on-site',
      joiningDate: new Date().toISOString().slice(0, 10),
      lastSession: '—',
      nextSession: '—',
    }, ...prev])
    toast.success(`${values.name} added as mentor`)
  }, [mentors.length])

  const updateMentor = useCallback((row, values) => {
    setMentors((prev) => prev.map((m) => (m.id === row.id ? { ...m, ...values } : m)))
    toast.success(`${values.name || row.name} updated`)
  }, [])

  const removeMentor = useCallback((row) => {
    setMentors((prev) => prev.filter((m) => m.id !== row.id))
    setProfileMentor((current) => (current?.id === row.id ? null : current))
    toast.success(`${row.name} deleted`)
  }, [])

  const toggleMentorStatus = useCallback((row) => {
    const next = row.status === 'active' ? 'inactive' : 'active'
    setMentors((prev) => prev.map((m) => (m.id === row.id ? { ...m, status: next } : m)))
    toast.success(`${row.name} ${next === 'inactive' ? 'deactivated' : 'reactivated'}`)
  }, [])

  const downloadProfile = useCallback((row) => {
    exportPDF({
      filename: `mentor-${row.employeeId}`,
      title: `Mentor Profile — ${row.name}`,
      headers: ['Field', 'Value'],
      rows: [
        ['Employee ID', row.employeeId], ['Name', row.name], ['Email', row.email],
        ['Department', row.department], ['Designation', row.designation],
        ['Specialization', row.specialization], ['Experience', `${row.experience} yrs`],
        ['Availability', row.availability], ['Status', row.status],
        ['Students', row.studentsAssigned], ['Rating', row.rating],
      ],
      subtitle: 'Kini HRMS · Mentor directory',
    })
    toast.success(`${row.name}'s profile downloaded`)
  }, [])

  const openAssign = useCallback((row, mode) => {
    setEditMentor(row)
    setFormMode(mode)
    setFormOpen(true)
  }, [])

  const assignValue = useCallback((row, key, value) => {
    setMentors((prev) => prev.map((m) => (m.id === row.id ? { ...m, [key]: [...(m[key] || []), value] } : m)))
    toast.success(`${value} assigned to ${row.name}`)
  }, [])

  const onImportFile = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const lines = String(reader.result || '').split(/\r?\n/).filter((l) => l.trim())
      const rows = lines.filter((l) => !/^name[,;]/i.test(l)) // skip header if present
      const imported = []
      let nextId = mentors.length + 1
      rows.forEach((line) => {
        const [name = '', email = '', department = 'General', designation = 'Mentor'] = line.split(/[,;]/).map((s) => s.trim())
        if (!name) return
        const id = `EMP-${String(nextId).padStart(4, '0')}`
        nextId += 1
        imported.push({
          id,
          employeeId: id,
          employeeCode: id,
          name,
          email,
          phone: '—',
          department,
          designation,
          specialization: 'General',
          assignedCourses: [],
          assignedBatches: [],
          studentsAssigned: 0,
          attendancePercentage: 100,
          courseCompletion: 0,
          rating: 0,
          experience: 1,
          availability: 'available',
          status: 'active',
          workMode: 'on-site',
          joiningDate: new Date().toISOString().slice(0, 10),
          lastSession: '—',
          nextSession: '—',
        })
      })
      if (!imported.length) {
        toast.error('No valid mentor rows found in the file')
        return
      }
      setMentors((prev) => [...imported, ...prev])
      toast.success(`Imported ${imported.length} mentor${imported.length === 1 ? '' : 's'} from ${file.name}`)
    }
    reader.readAsText(file)
  }

  // Brief simulated load for the table skeleton (no API involved).
  useEffect(() => {
    const timer = window.setTimeout(() => setTableLoading(false), 450)
    return () => window.clearTimeout(timer)
  }, [])

  const openProfile = useCallback((row) => setProfileMentor(row), [])

  const specializationOptions = useMemo(() => {
    const values = [...new Set(employees.map((e) => e.specialization).filter(Boolean))]
    return [{ value: 'all', label: 'All Specializations' }, ...values.map((v) => ({ value: v, label: v }))]
  }, [employees])

  const activeFilterCount = Object.values(filters).filter((v) => v !== 'all').length

  const filtered = useMemo(() => {
    let rows = employees

    const q = debouncedSearch.trim().toLowerCase()
    if (q) rows = rows.filter((e) => e.__searchText.includes(q))

    if (filters.department !== 'all') rows = rows.filter((e) => e.department === filters.department)
    if (filters.specialization !== 'all') rows = rows.filter((e) => e.specialization === filters.specialization)
    if (filters.availability !== 'all') rows = rows.filter((e) => e.availability === filters.availability)
    if (filters.status !== 'all') rows = rows.filter((e) => e.status === filters.status)
    if (filters.experience !== 'all') {
      rows = rows.filter((e) => (
        filters.experience === 'lt3' ? e.experience < 3
          : filters.experience === '3to5' ? e.experience >= 3 && e.experience <= 5
            : e.experience > 5
      ))
    }
    if (filters.rating !== 'all') {
      rows = rows.filter((e) => (
        filters.rating === 'high' ? e.rating >= 4.5
          : filters.rating === 'mid' ? e.rating >= 4 && e.rating < 4.5
            : e.rating < 4
      ))
    }
    if (filters.workMode !== 'all') rows = rows.filter((e) => e.workMode === filters.workMode)

    const sorted = [...rows]
    switch (sortBy) {
      case 'newest': sorted.sort((a, b) => String(b.joiningDate).localeCompare(String(a.joiningDate))); break
      case 'rating': sorted.sort((a, b) => b.rating - a.rating); break
      case 'students': sorted.sort((a, b) => (b.studentsAssigned || 0) - (a.studentsAssigned || 0)); break
      case 'courses': sorted.sort((a, b) => (b.assignedCourses?.length || 0) - (a.assignedCourses?.length || 0)); break
      case 'active': sorted.sort((a, b) => (
        Number(a.availability === 'available') - Number(b.availability === 'available')
        || (b.studentsAssigned || 0) - (a.studentsAssigned || 0)
      )); break
      default: break
    }
    return sorted
  }, [employees, filters, debouncedSearch, sortBy])

  const columnDefs = useMemo(() => [
    {
      key: 'photo', accessor: 'name', header: 'Photo', sortable: false, width: 56,
      render: (row) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); openProfile(row) }}
          className="shrink-0 rounded-full transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/50"
          aria-label={`View profile of ${row.name}`}
        >
          <HRAvatar name={row.name} size="sm" />
        </button>
      ),
    },
    {
      key: 'employeeId', accessor: 'employeeId', header: 'Employee ID', sortable: true, width: 100,
      render: (row) => <span className="text-xs font-bold text-[#0f55f7] dark:text-blue-300">{row.employeeId}</span>,
    },
    {
      key: 'name', accessor: 'name', header: 'Mentor Name', sortable: true, minWidth: 210,
      render: (row) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); openProfile(row) }}
            className="shrink-0 rounded-full transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/50"
            aria-label={`View profile of ${row.name}`}
          >
            <HRAvatar name={row.name} size="md" />
          </button>
          <div className="min-w-0">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); openProfile(row) }}
              className="block max-w-full truncate text-left text-sm font-semibold text-slate-900 transition-colors hover:text-[#0f55f7] dark:text-white dark:hover:text-blue-300"
            >
              {row.name}
            </button>
            <p className="truncate text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department', accessor: 'department', header: 'Department', sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
          <Building2 className="h-3.5 w-3.5 text-slate-400" />{row.department}
        </span>
      ),
    },
    {
      key: 'designation', accessor: 'designation', header: 'Designation', sortable: true,
      render: (row) => <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{row.designation}</span>,
    },
    {
      key: 'specialization', accessor: 'specialization', header: 'Specialization', sortable: true,
      render: (row) => <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{row.specialization}</span>,
    },
    {
      key: 'courses', accessor: 'courses', header: 'Courses', sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <BookOpen className="h-3.5 w-3.5 text-slate-400" />{row.assignedCourses?.length ?? row.courses}
        </span>
      ),
    },
    {
      key: 'batches', accessor: 'batches', header: 'Batches', sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />{row.assignedBatches?.length ?? row.batches}
        </span>
      ),
    },
    {
      key: 'students', accessor: 'students', header: 'Students', sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <Users2 className="h-3.5 w-3.5 text-slate-400" />{row.studentsAssigned}
        </span>
      ),
    },
    {
      key: 'attendance', accessor: 'attendancePercentage', header: 'Attendance %', sortable: true, minWidth: 110,
      render: (row) => (
        <div className="w-24">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{row.attendancePercentage}%</span>
          </div>
          <HRProgressBar value={row.attendancePercentage} color="#06b6a8" height="h-1" />
        </div>
      ),
    },
    {
      key: 'completion', accessor: 'courseCompletion', header: 'Completion %', sortable: true, minWidth: 110,
      render: (row) => (
        <div className="w-24">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{row.courseCompletion}%</span>
          </div>
          <HRProgressBar value={row.courseCompletion} color="#0f55f7" height="h-1" />
        </div>
      ),
    },
    {
      key: 'rating', accessor: 'rating', header: 'Rating', sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
          <Star className="h-3 w-3 fill-current" />{row.rating.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'experience', accessor: 'experience', header: 'Experience', sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <Briefcase className="h-3.5 w-3.5 text-slate-400" />{row.experience} yrs
        </span>
      ),
    },
    {
      key: 'availability', accessor: 'availability', header: 'Availability', sortable: true,
      render: (row) => <HRStatusBadge status={row.availability} />,
    },
    {
      key: 'status', accessor: 'status', header: 'Employment Status', sortable: true,
      render: (row) => <HRStatusBadge status={row.status} />,
    },
    {
      key: 'lastSession', accessor: 'lastSession', header: 'Last Session', sortable: true,
      render: (row) => <span className="text-xs text-slate-500 dark:text-slate-400">{formatShortDate(row.lastSession)}</span>,
    },
    {
      key: 'nextSession', accessor: 'nextSession', header: 'Next Session', sortable: true,
      render: (row) => <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{formatShortDate(row.nextSession)}</span>,
    },
    {
      key: 'actions', accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 96,
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); openProfile(row) }}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0f55f7] dark:hover:bg-slate-800"
            aria-label={`View profile of ${row.name}`}
          >
            <Eye className="h-4 w-4" />
          </button>
          <HRActionMenu
            can={can}
            items={[
              { label: 'View Profile', icon: Eye, permission: ['mentors', 'view'], onClick: () => openProfile(row) },
              { label: 'Edit', icon: Pencil, permission: ['mentors', 'edit'], onClick: () => { setEditMentor(row); setFormMode('edit'); setFormOpen(true) } },
              { label: 'Assign Batch', icon: CalendarDays, permission: ['mentors', 'edit'], onClick: () => openAssign(row, 'batch') },
              { label: 'Assign Course', icon: BookOpen, permission: ['mentors', 'edit'], onClick: () => openAssign(row, 'course') },
              { label: 'View Students', icon: Users2, permission: ['mentors', 'view'], onClick: () => openProfile(row) },
              { label: 'Attendance', icon: CalendarCheck, permission: ['mentors', 'view'], onClick: () => openProfile(row) },
              { label: 'Performance', icon: TrendingUp, permission: ['mentors', 'view'], onClick: () => openProfile(row) },
              { label: 'Leave', icon: ClipboardCheck, permission: ['mentors', 'view'], onClick: () => openProfile(row) },
              { label: 'Documents', icon: Archive, permission: ['mentors', 'view'], onClick: () => openProfile(row) },
              { label: 'Payroll', icon: Wallet, permission: ['mentors', 'view'], onClick: () => openProfile(row) },
              { label: 'Download Profile', icon: Download, permission: ['mentors', 'export'], onClick: () => downloadProfile(row) },
              { label: 'Deactivate', icon: Ban, permission: ['mentors', 'edit'], onClick: () => toggleMentorStatus(row) },
              { label: 'Delete', icon: Trash2, danger: true, permission: ['mentors', 'delete'], onClick: () => removeMentor(row) },
            ]}
          />
        </div>
      ),
    },
  ], [can, openProfile, removeMentor, toggleMentorStatus, downloadProfile, openAssign])

  const columns = useMemo(() => columnDefs.filter((col) => visibleColumns.has(col.key)), [columnDefs, visibleColumns])

  const handleExport = useCallback((rows) => {
    const list = rows || filtered
    exportCSV({
      filename: 'mentors',
      headers: ['Employee ID', 'Name', 'Email', 'Department', 'Designation', 'Specialization', 'Courses', 'Batches', 'Students', 'Attendance %', 'Completion %', 'Rating', 'Experience', 'Availability', 'Status'],
      rows: list.map((r) => [
        r.employeeId, r.name, r.email, r.department, r.designation, r.specialization,
        r.assignedCourses?.length ?? r.courses, r.assignedBatches?.length ?? r.batches,
        r.studentsAssigned, r.attendancePercentage, r.courseCompletion,
        r.rating, r.experience, r.availability, r.status,
      ]),
    })
    toast.success(`Exported ${list.length} mentors to Excel (CSV)`)
  }, [filtered])

  const handleImport = () => fileInputRef.current?.click()

  const handleRefresh = () => {
    setTableLoading(true)
    window.setTimeout(() => {
      setTableLoading(false)
      setSearch('')
      setSortBy('default')
      toast.success('Mentor data refreshed')
    }, 500)
  }

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS)
    setSearch('')
    setSortBy('default')
  }

  const toggleColumn = (key) => setVisibleColumns((prev) => {
    const next = new Set(prev)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    return next
  })

  const showAllColumns = () => setVisibleColumns(new Set(ALL_COLUMN_KEYS))

  return (
    <HRPage
      moduleId="mentors"
      title="Mentors"
      subtitle="Faculty profiles, batches, ratings, feedback and availability."
      icon={GraduationCap}
      lastUpdated="Aug 4, 2026"
      search={{ value: search, onChange: setSearch, placeholder: 'Search mentors…' }}
    >
      {/* KPI cards */}
      <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatsCard compact icon={GraduationCap} value={HR_MENTOR_STATS.total} label="Total Mentors" accentColor="#0f55f7" />
        <StatsCard compact icon={Users2} value={HR_MENTOR_STATS.active} label="Active" accentColor="#06b6a8" />
        <StatsCard compact icon={CalendarDays} value={HR_MENTOR_STATS.onLeave} label="On Leave" accentColor="#F59E0B" />
        <StatsCard compact icon={Star} value={HR_MENTOR_STATS.avgRating} suffix="/5" label="Avg Rating" accentColor="#8b5cf6" />
        <StatsCard compact icon={BookOpen} value={HR_MENTOR_STATS.totalBatches} label="Total Batches" accentColor="#EC4899" />
        <StatsCard compact icon={Users2} value={HR_MENTOR_STATS.totalStudents} label="Students Mentored" accentColor="#10b981" />
      </div>

      {/* Section 1 — Smart toolbar */}
      <MentorToolbar
        search={search}
        onSearchChange={setSearch}
        hideSearch
        filters={filters}
        onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onReset={resetFilters}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onExport={() => handleExport(filtered)}
        onImport={handleImport}
        onRefresh={handleRefresh}
        loading={tableLoading}
        columns={COLUMN_OPTIONS}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        onShowAllColumns={showAllColumns}
        departmentOptions={HR_DEPARTMENT_LIST}
        specializationOptions={specializationOptions}
        activeFilterCount={activeFilterCount}
      />

      {/* Section 2 — Mentor performance summary */}
      <div className="mt-3">
        <MentorSummaryCards employees={filtered} />
      </div>

      {/* Section 3 — Main mentor table */}
      <div className="mt-3">
        <HRSection title="Mentor Directory" subtitle="All faculty records" icon={Users2} padding="p-4">
          <HRDataTable
            columns={columns}
            data={filtered}
            loading={tableLoading}
            searchable={false}
            pageSize={8}
            stickyHeader
            resizable
            onRowClick={openProfile}
            exportFileName="mentors"
            exportTitle="Mentor Directory"
            exportable={can('mentors', 'export')}
            emptyTitle="No mentors found"
            emptyDescription="Try adjusting your search or filters."
            emptyIcon={Users2}
          />
        </HRSection>
      </div>

      {/* Profile drawer */}
      <MentorProfileDrawer
        open={Boolean(profileMentor)}
        mentor={profileMentor}
        onClose={() => setProfileMentor(null)}
        onEdit={() => { if (profileMentor) { setEditMentor(profileMentor); setFormMode('edit'); setFormOpen(true) } }}
      />

      {/* Mentor edit / assignment form. New mentors are created in Employee Management. */}
      <HREntityForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditMentor(null) }}
        title={
          formMode === 'add' ? 'Add Mentor'
            : formMode === 'batch' ? `Assign Batch — ${editMentor?.name || ''}`
              : formMode === 'course' ? `Assign Course — ${editMentor?.name || ''}`
                : `Edit Mentor — ${editMentor?.name || ''}`
        }
        subtitle={
          formMode === 'add' ? 'Add a faculty member to the mentor directory'
            : formMode === 'batch' ? 'Attach the mentor to a batch'
              : formMode === 'course' ? 'Assign a course to this mentor'
                : 'Update mentor profile details'
        }
        icon={GraduationCap}
        accent="#8b5cf6"
        saveLabel={formMode === 'add' ? 'Add Mentor' : formMode === 'edit' ? 'Save Changes' : 'Assign'}
        values={formMode === 'edit' ? editMentor || {} : {}}
        fields={
          formMode === 'add' ? [
            { key: 'name', label: 'Mentor Name', type: 'text', required: true, placeholder: 'Full name' },
            { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'name@kinieduhub.io' },
            { key: 'department', label: 'Department', type: 'select', required: true, options: HR_DEPARTMENT_LIST.map((d) => ({ value: d, label: d })) },
            { key: 'designation', label: 'Designation', type: 'text', required: true, placeholder: 'e.g. Senior Faculty' },
            { key: 'specialization', label: 'Specialization', type: 'text', required: true, placeholder: 'e.g. React & Node' },
            { key: 'experience', label: 'Experience (years)', type: 'number', required: true, defaultValue: 1 },
            { key: 'availability', label: 'Availability', type: 'select', required: true, defaultValue: 'available', options: [{ value: 'available', label: 'Available' }, { value: 'busy', label: 'Busy' }] },
            { key: 'status', label: 'Employment Status', type: 'select', required: true, defaultValue: 'active', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
          ] : formMode === 'batch' ? [
            { key: 'batch', label: 'Batch Name', type: 'text', required: true, placeholder: 'e.g. React Sep 2026' },
          ] : formMode === 'course' ? [
            { key: 'course', label: 'Course', type: 'text', required: true, placeholder: 'e.g. Full-Stack Web Development' },
          ] : [
            { key: 'name', label: 'Mentor Name', type: 'text', required: true },
            { key: 'email', label: 'Email', type: 'email', required: true },
            { key: 'designation', label: 'Designation', type: 'text', required: true },
            { key: 'specialization', label: 'Specialization', type: 'text', required: true },
            { key: 'availability', label: 'Availability', type: 'select', required: true, options: [{ value: 'available', label: 'Available' }, { value: 'busy', label: 'Busy' }] },
            { key: 'status', label: 'Employment Status', type: 'select', required: true, options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
          ]
        }
        onSave={(values) => {
          if (formMode === 'add') addMentor(values)
          else if (formMode === 'batch') assignValue(editMentor, 'assignedBatches', values.batch)
          else if (formMode === 'course') assignValue(editMentor, 'assignedCourses', values.course)
          else updateMentor(editMentor, values)
        }}
      />

      {/* Hidden CSV import input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        aria-hidden="true"
        onChange={onImportFile}
      />
    </HRPage>
  )
}
