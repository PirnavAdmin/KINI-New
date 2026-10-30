import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Layers,
  Users,
  GraduationCap,
  Code2,
  Server,
  Database,
  Star,
  ArrowRight,
  CheckCircle2,
  Plus,
  CalendarRange,
} from 'lucide-react'
import StatsCard from '@shared/components/StatsCard'
import SearchInput from '@shared/components/SearchInput'
import Button from '@shared/components/Button'
import usePermission from '@shared/hooks/usePermission'
import { ROUTES } from '@shared/constants/routeConstants'
import { COURSES_DATA } from '@shared/data/orgBatchesMockData'

const formatCurrency = (value) => {
  const amount = Number(value)
  if (Number.isNaN(amount)) return '-'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

const CARD_ICONS = {
  'Python Full Stack Development': Code2,
  'Java Full Stack Development': Server,
  'MERN Stack Development': BookOpen,
  'Data Science': Database,
  'UI/UX Design': Star,
  'AI & Machine Learning': GraduationCap,
  'DevOps Engineering': Layers,
  'Cloud Computing (AWS)': Server,
  'Cyber Security': Star,
  'AWS Developer (Solutions Architect)': Server,
  'Flutter Mobile Development': Code2,
  'Digital Marketing': Star,
  'Salesforce Developer': Server,
  'Testing & Automation': CheckCircle2,
  'Business Analytics': Database,
  'Power BI': Database,
  'React JS Development': Code2,
  'Angular Development': Code2,
  'Blockchain Development': Layers,
  'Prompt Engineering & Generative AI': Star,
}

const CARD_GRADIENTS = {
  'Python Full Stack Development': 'from-blue-500 to-cyan-500',
  'Java Full Stack Development': 'from-orange-500 to-red-500',
  'MERN Stack Development': 'from-green-500 to-emerald-500',
  'Data Science': 'from-violet-500 to-purple-500',
  'UI/UX Design': 'from-pink-500 to-rose-500',
  'AI & Machine Learning': 'from-indigo-500 to-blue-600',
  'DevOps Engineering': 'from-amber-500 to-yellow-600',
  'Cloud Computing (AWS)': 'from-sky-500 to-blue-600',
  'Cyber Security': 'from-red-500 to-rose-600',
  'AWS Developer (Solutions Architect)': 'from-blue-600 to-indigo-600',
  'Flutter Mobile Development': 'from-cyan-500 to-teal-500',
  'Digital Marketing': 'from-orange-400 to-pink-500',
  'Salesforce Developer': 'from-blue-500 to-purple-600',
  'Testing & Automation': 'from-teal-500 to-green-500',
  'Business Analytics': 'from-slate-500 to-slate-600',
  'Power BI': 'from-yellow-500 to-amber-600',
  'React JS Development': 'from-blue-400 to-cyan-500',
  'Angular Development': 'from-red-500 to-pink-500',
  'Blockchain Development': 'from-purple-500 to-indigo-600',
  'Prompt Engineering & Generative AI': 'from-emerald-500 to-teal-600',
}

export default function CourseManagement() {
  const navigate = useNavigate()
  const { hasPermission } = usePermission() // RBAC UPGRADE — was role === ROLES.ORG_ADMIN
  const [searchQuery, setSearchQuery] = useState('')
  const canCreateCourse = hasPermission('course.create')

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return COURSES_DATA
    const q = searchQuery.toLowerCase()
    return COURSES_DATA.filter(
      (c) =>
        c.courseName.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.level?.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const totalTopics = useMemo(
    () => COURSES_DATA.reduce((s, c) => s + c.modules.reduce((m, mod) => m + mod.topics.length, 0), 0),
    []
  )
  const totalModules = useMemo(() => COURSES_DATA.reduce((s, c) => s + c.totalModules, 0), [])
  const totalEnrolled = useMemo(() => COURSES_DATA.reduce((s, c) => s + c.totalStudentsEnrolled, 0), [])
  const courseCount = COURSES_DATA.length

  const summaryStats = [
    { label: 'Total Courses', value: courseCount, icon: BookOpen, color: '#0f55f7' },
    { label: 'Total Modules', value: totalModules, icon: Layers, color: '#8b5cf6' },
    { label: 'Total Topics', value: totalTopics, icon: CheckCircle2, color: '#10B981' },
    { label: 'Total Enrolled', value: totalEnrolled, icon: Users, color: '#F59E0B' },
  ]

  // Collect all unique technology topics for a course (uncapped — the caller decides how many to show)
  const getTechTags = (course) => {
    const allTopics = course.modules.flatMap((m) => m.topics || [])
    return [...new Set(allTopics)]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-[1440px] min-w-0 px-1 pb-4 pt-0 sm:px-1.5 sm:pb-6"
    >
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-cyan-50 shadow-inner dark:from-blue-500/20 dark:to-cyan-500/10">
            <BookOpen className="h-5 w-5 text-[#0f55f7]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
              Course Management
            </h1>
            <p className="truncate text-sm text-slate-400">
              Browse and manage your catalog of {courseCount} industry-focused courses.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="md"
            icon={CalendarRange}
            onClick={() => navigate(ROUTES.ORG_ADMIN.BATCHES)}
            className="min-h-10 rounded-xl px-4 text-sm font-medium"
          >
            <span className="hidden sm:inline">View Batches</span>
            <span className="sm:hidden">Batches</span>
          </Button>
          {canCreateCourse && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => navigate(ROUTES.ORG_ADMIN.COURSE_CREATE)}
              aria-label="Create Course"
              className="min-h-10 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-4 text-sm font-semibold text-white shadow-lg shadow-[#0f55f7]/20"
            >
              Create Course
            </Button>
          )}
        </div>
      </motion.header>

      {/* Summary metrics — -mt-2 trims PageHeader's built-in mb-6 (24px) down to the 16px target */}
      <div className="mb-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {summaryStats.map((stat, i) => (
          <StatsCard
            key={stat.label}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            accentColor={stat.color}
            delay={i * 0.05}
            compact
          />
        ))}
      </div>

      {/* Search toolbar */}
      <div className="mb-3 rounded-xl border border-slate-200/70 bg-white/70 p-2 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/50">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder="Search courses..."
          className="w-full"
        />
      </div>

      {/* Course Cards Grid — compact 5-column layout */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
            {courseCount === 0 ? (
              <>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">You haven't created any courses yet.</p>
                {canCreateCourse && (
                  <Button
                    variant="primary"
                    size="md"
                    icon={Plus}
                    onClick={() => navigate(ROUTES.ORG_ADMIN.COURSE_CREATE)}
                    aria-label="Create Course"
                    className="mt-4 text-base shadow-sm hover:-translate-y-px"
                  >
                    Create Course
                  </Button>
                )}
              </>
            ) : (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No courses match your search.</p>
            )}
          </div>
        ) : (
          filteredCourses.map((course, index) => {
            const IconComp = CARD_ICONS[course.courseName] || GraduationCap
            const gradient = CARD_GRADIENTS[course.courseName] || 'from-slate-500 to-slate-600'
            const allTags = getTechTags(course)
            const visibleTags = allTags.slice(0, 3)
            const moreTagsCount = allTags.length - visibleTags.length

            const isLive = course.status === 'Active'

            return (
              <motion.div
                key={course.courseId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index % 20) * 0.03, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                role="button"
                tabIndex={0}
                aria-label={`View ${course.courseName} course details`}
                onClick={() => navigate(`/organization/courses/${course.courseId}/details`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/organization/courses/${course.courseId}/details`)
                  }
                }}
                className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-slate-200/70 bg-white shadow-card transition-all duration-300 hover:border-[#0f55f7]/25 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/60 focus-visible:ring-offset-2 dark:border-slate-700/60 dark:bg-slate-900/80 dark:focus-visible:ring-offset-slate-900"
              >
                {/* Header banner */}
                <div className={`flex items-center justify-between bg-gradient-to-br ${gradient} px-3.5 py-3`}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
                    <IconComp className="h-4 w-4 text-white" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ${
                      isLive ? 'bg-emerald-700' : 'bg-amber-700'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full bg-white ${isLive ? 'animate-pulse' : ''}`} />
                    {isLive ? 'Live' : 'Upcoming'}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-3.5">
                  {/* Course Name */}
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 transition-colors group-hover:text-[#0f55f7]">
                    {course.courseName}
                  </h3>

                  {/* Level */}
                  {course.level && (
                    <p className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">{course.level}</p>
                  )}

                  {/* Description — max 2 lines */}
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-2 dark:text-slate-400">
                    {course.description}
                  </p>

                  {/* Stat grid */}
                  <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 border-y border-slate-100 py-3 dark:border-slate-700/40">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Price</p>
                      <p className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(course.totalPrice)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Duration</p>
                      <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{course.totalDuration}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Modules</p>
                      <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{course.totalModules}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Enrolled</p>
                      <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{course.totalStudentsEnrolled}</p>
                    </div>
                  </div>

                  {/* Technology tags — first 3, plus a count of any remainder instead of dumping every tag */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {visibleTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold leading-tight text-slate-500 dark:bg-slate-800/70 dark:text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                    {moreTagsCount > 0 && (
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold leading-tight text-slate-400 dark:bg-slate-800/70 dark:text-slate-500">
                        +{moreTagsCount} more
                      </span>
                    )}
                  </div>

                  {/* View Course CTA — pinned to the card's bottom edge so rows stay aligned regardless of description/tag length */}
                  <div className="mt-auto pt-4">
                    <Button
                      variant="primary"
                      icon={ArrowRight}
                      iconPosition="right"
                      className="w-full"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      View Course
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}
