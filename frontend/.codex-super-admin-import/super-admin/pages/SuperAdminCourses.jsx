import { useEffect, useState } from 'react'
import { BookOpen, Search, Users, GraduationCap, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import { courseApi, getApiErrorMessage } from '@shared/services/apiServices'
import { useAuth } from '@shared/hooks/useAuth'
import coursesData from '@shared/data/coursesData'
import toast from 'react-hot-toast'

const COURSE_STATUS = ['published', 'draft', 'archived']

const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

// Normalizes a course record (backend or static dataset) into the shape the
// table renders, so both sources stay consistent on this page.
const normalizeCourse = (course = {}) => ({
  id: course.courseId ?? course.id ?? course.slug,
  title: course.title ?? course.name ?? 'Untitled course',
  instructor: course.instructor ?? course.trainer ?? course.instructorName ?? '—',
  students: Number(course.students ?? course.enrollments ?? course.studentCount ?? course.enrolledStudents ?? 0),
  status: String(course.status ?? course.publishStatus ?? 'published').toLowerCase(),
  image: course.image ?? course.thumbnail ?? course.coverImage ?? null,
  price: Number(course.price ?? course.fees ?? course.courseFee ?? 0),
  duration: course.duration ?? course.durationInWeeks ? `${course.duration ?? course.durationInWeeks} weeks` : '—',
  level: course.level ?? '—',
  category: course.category ?? '—',
  feeStructure: course.feeStructure ?? 'One-time',
})

const COURSE_STATS = [
  { key: 'total', label: 'Total Courses', icon: BookOpen, color: '#0f55f7' },
  { key: 'enrollments', label: 'Total Enrollments', icon: Users, color: '#06b6a8' },
  { key: 'published', label: 'Published Courses', icon: CheckCircle2, color: '#10b981' },
  { key: 'drafts', label: 'Drafts', icon: GraduationCap, color: '#f59e0b' },
]

const COURSE_STATUS_STYLES = {
  published: { label: 'Published', classes: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-[#06b6a8]/20' },
  draft: { label: 'Draft', classes: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
  archived: { label: 'Archived', classes: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600' },
}

const CourseStatusBadge = ({ status }) => {
  const config = COURSE_STATUS_STYLES[status] || COURSE_STATUS_STYLES.archived
  return (
    <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${config.classes}`}>
      {config.label}
    </span>
  )
}

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums dark:text-white">{value.toLocaleString('en-IN')}</p>
      </div>
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${color}14` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
    </div>
  </div>
)

export default function SuperAdminCourses() {
  const { user } = useAuth()
  const isDemoSession = Boolean(user?.isDemo || String(user?.email || '').includes('demo'))
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    let cancelled = false
    // Sync state setup is wrapped in a function (matching the other Super Admin
    // pages) so the demo branch stays side-effect free.
    const applyDemoCourses = () => {
      setCourses(coursesData.map(normalizeCourse))
      setLoading(false)
    }
    if (isDemoSession) {
      applyDemoCourses()
      return undefined
    }
    courseApi.list()
      .then((rows) => {
        if (cancelled) return
        const normalized = Array.isArray(rows) && rows.length > 0
          ? rows.map(normalizeCourse)
          : coursesData.map(normalizeCourse)
        setCourses(normalized)
      })
      .catch((error) => {
        if (cancelled) return
        setCourses(coursesData.map(normalizeCourse))
        toast.error(getApiErrorMessage(error, 'Live course data unavailable. Showing demo data.'))
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [isDemoSession])

  const filteredCourses = courses.filter((course) =>
    (!statusFilter || course.status === statusFilter) &&
    (!searchQuery || String(course.title).toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const stats = {
    total: courses.length,
    enrollments: courses.reduce((sum, course) => sum + Number(course.students || 0), 0),
    published: courses.filter((course) => course.status === 'published').length,
    drafts: courses.filter((course) => course.status === 'draft').length,
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      <PageHeader
        title="Courses"
        subtitle="Overview of every course published across the platform"
        showBreadcrumb={false}
        titleClassName="!text-2xl !leading-8"
        containerClassName="!mb-5"
      />

      {/* KPI Cards */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COURSE_STATS.map((stat) => (
          <StatCard key={stat.key} label={stat.label} value={stats[stat.key]} icon={stat.icon} color={stat.color} />
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-9 w-56 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white"
          />
        </div>
        <div className="ml-auto flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-700 dark:bg-slate-800/60">
          {['', ...COURSE_STATUS].map((status) => (
            <button
              key={status || 'all'}
              onClick={() => setStatusFilter(status)}
              className={`rounded-md px-3 py-1 text-[10px] font-bold capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-white hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white'
              }`}
            >
              {status || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Table */}
      <div className="custom-scrollbar max-h-[560px] w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full min-w-[640px] text-left">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm dark:bg-slate-800/95">
            <tr>
              <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Course</th>
              <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Price</th>
              <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Duration</th>
              <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Fee Structure</th>
              <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Enrollments</th>
              <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <RefreshCw className="mx-auto h-7 w-7 animate-spin text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-500">Loading courses...</p>
                </td>
              </tr>
            ) : filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <tr key={course.id ?? course.title} className="group transition-all duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {course.image ? (
                        <img src={course.image} alt="" className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 object-cover dark:border-slate-700" />
                      ) : (
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10">
                          <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                        </div>
                      )}
                      <span className="block max-w-[280px] truncate text-sm font-bold text-slate-900 group-hover:text-blue-800 dark:text-white dark:group-hover:text-blue-300">
                        {course.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold tabular-nums text-slate-700 dark:text-slate-200">{course.price > 0 ? formatINR(course.price) : 'Free'}</span>
                    {course.category !== '—' && <span className="mt-0.5 block text-[11px] text-slate-400">{course.category}</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{course.duration}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">{course.feeStructure}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 tabular-nums dark:text-slate-300">{course.students.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <CourseStatusBadge status={course.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <p className="mt-3 text-sm text-slate-400">{searchQuery || statusFilter ? 'No courses match your filters' : 'No courses available yet'}</p>
                  {(searchQuery || statusFilter) && (
                    <button onClick={() => { setSearchQuery(''); setStatusFilter('') }} className="mt-2 text-xs text-[#0f55f7] hover:underline">
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
