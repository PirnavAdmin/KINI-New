import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, DollarSign, Layers, CheckCircle2, BookOpen, ChevronRight, Target, GraduationCap, Award } from 'lucide-react'
import { COURSES_DATA } from '@shared/data/orgBatchesMockData'
import { ROUTES } from '@shared/constants/routeConstants'
import EmptyState from '@shared/components/EmptyState'

const fmt = (v) => Number.isNaN(Number(v)) ? '-' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(v))

// Rich topic details mock data with learning outcomes, duration, price, and description
const TOPIC_DETAILS = {
  'HTML': { duration: '2 Weeks', price: 2000, description: 'Master the foundation of web development with HTML5. Learn semantic markup, accessible document structure, form creation, and multimedia integration.', outcomes: ['Understand HTML5 document structure and semantics', 'Build accessible web pages with proper landmarks', 'Create forms with validation and multimedia elements', 'Implement SEO-friendly meta tags and structured data'] },
  'CSS': { duration: '2 Weeks', price: 2500, description: 'Transform web pages with modern CSS3. Master layouts, responsive design, animations, and custom properties for professional-grade styling.', outcomes: ['Master CSS3 layout techniques (Flexbox, Grid)', 'Build responsive designs with media queries', 'Create animations and transitions', 'Implement CSS custom properties and modern selectors'] },
  'JavaScript': { duration: '3 Weeks', price: 3500, description: 'Dive deep into the language of the web. From fundamentals to advanced concepts including closures, promises, and DOM manipulation.', outcomes: ['Master core JavaScript concepts and ES6+ features', 'Understand closures, promises, and async/await', 'Manipulate the DOM effectively', 'Implement modern module patterns and bundling'] },
  'React JS': { duration: '3 Weeks', price: 4000, description: 'Build modern user interfaces with React. Learn component architecture, hooks, state management, and production deployment workflows.', outcomes: ['Build component-based UIs with React', 'Master hooks, context API, and state management', 'Implement routing with React Router', 'Deploy production-ready React applications'] },
  'Python': { duration: '3 Weeks', price: 3000, description: 'Start your programming journey with Python. Cover syntax, data structures, OOP principles, and build real-world command-line applications.', outcomes: ['Master Python syntax and core programming concepts', 'Work with data structures and file I/O', 'Understand OOP principles in Python', 'Build command-line applications and scripts'] },
  'Django': { duration: '3 Weeks', price: 4000, description: 'Build robust web applications with Django. Master the MVT architecture, ORM, REST APIs, and authentication systems.', outcomes: ['Build full-stack web apps with Django framework', 'Implement MVT architecture and ORM', 'Create RESTful APIs with Django REST Framework', 'Handle authentication, authorization, and middleware'] },
  'Django REST Framework': { duration: '2 Weeks', price: 3000, description: 'Create powerful REST APIs with DRF. Learn serializers, viewsets, authentication, and comprehensive API documentation.', outcomes: ['Build robust REST APIs with DRF', 'Implement serializers, viewsets, and routers', 'Handle authentication with JWT and permissions', 'Create API documentation with Swagger/OpenAPI'] },
  'REST APIs': { duration: '2 Weeks', price: 2500, description: 'Design and implement production-ready REST APIs. Learn HTTP methods, error handling, security, and API best practices.', outcomes: ['Design RESTful API architectures', 'Implement CRUD operations with proper HTTP methods', 'Handle error responses and status codes', 'Secure APIs with authentication and rate limiting'] },
  'JWT Authentication': { duration: '1 Week', price: 1500, description: 'Secure your applications with JWT-based authentication. Understand token lifecycle, refresh flows, and security best practices.', outcomes: ['Understand JWT structure and token lifecycle', 'Implement access and refresh token flow', 'Secure APIs with token-based authentication', 'Handle token storage and rotation securely'] },
  'SQL': { duration: '2 Weeks', price: 2500, description: 'Master database querying with SQL. Learn complex queries, database design, performance optimization, and advanced database features.', outcomes: ['Write complex SQL queries with joins and subqueries', 'Design normalized database schemas', 'Optimize query performance with indexing', 'Implement stored procedures and triggers'] },
  'PostgreSQL': { duration: '2 Weeks', price: 2500, description: 'Harness the power of PostgreSQL. Explore advanced features, full-text search, replication, and performance tuning.', outcomes: ['Master PostgreSQL advanced features', 'Implement full-text search and JSON operations', 'Configure replication and backup strategies', 'Optimize performance with query analysis'] },
  'MongoDB': { duration: '2 Weeks', price: 2500, description: 'Master NoSQL databases with MongoDB. Learn document modeling, aggregation pipelines, indexing, and production deployment strategies.', outcomes: ['Design document-based data models', 'Write aggregation pipelines for reporting', 'Implement indexing for query optimization', 'Handle replication, sharding, and backups'] },
}

const DEFAULT_OUTCOMES = [
  'Understand core concepts and best practices',
  'Build practical projects with hands-on exercises',
  'Implement industry-standard design patterns',
  'Troubleshoot and debug common issues',
]

export default function ModuleDetails() {
  const { courseId, moduleId } = useParams()
  const navigate = useNavigate()
  const { course, module: mod } = useMemo(() => {
    const c = COURSES_DATA.find((co) => co.courseId === Number(courseId))
    return { course: c, module: c?.modules.find((m) => m.id === moduleId) }
  }, [courseId, moduleId])

  if (!course || !mod) return <div className="px-4 py-12"><EmptyState icon={BookOpen} title="Module not found" /></div>

  const getTopicDetails = (topic) => TOPIC_DETAILS[topic] || { duration: '1-2 Weeks', price: 2000, outcomes: DEFAULT_OUTCOMES }

  return (
    <div className="w-full px-4 py-3 sm:px-5 lg:px-6 space-y-4">
      {/* Breadcrumb */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-[11px] text-slate-400">
        <button onClick={() => navigate(ROUTES.ORG_ADMIN.COURSES)} className="hover:text-[#0f55f7] transition-colors">Courses</button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigate(`/organization/courses/${courseId}/details`)} className="hover:text-[#0f55f7] transition-colors">{course.courseName}</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-600 dark:text-slate-300 font-medium">{mod.name}</span>
      </motion.div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/organization/courses/${courseId}/details`)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#0f55f7]/30 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-950 dark:text-white">{mod.name}</h1>
          <p className="text-xs text-slate-400">{course.courseName} · {mod.topics.length} topics</p>
        </div>
      </div>

      {/* Module Stats */}
      <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Module Price', value: fmt(mod.price), icon: DollarSign, color: 'from-[#0f55f7]/10 to-[#06b6a8]/10', iconColor: 'text-[#0f55f7]' },
          { label: 'Duration', value: mod.duration, icon: Clock, color: 'from-emerald-500/10 to-emerald-400/10', iconColor: 'text-emerald-600' },
          { label: 'Total Topics', value: mod.topics.length, icon: Layers, color: 'from-violet-500/10 to-violet-400/10', iconColor: 'text-violet-600' },
          { label: 'Course', value: course.courseName, icon: BookOpen, color: 'from-amber-500/10 to-amber-400/10', iconColor: 'text-amber-600' },
        ].map((c) => {
          const Icon = c.icon
          return (
            <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[14px] border border-slate-200/70 bg-white/95 p-3 dark:border-slate-700/60 dark:bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${c.color}`}>
                  <Icon className={`h-4 w-4 ${c.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{c.label}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{c.value}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Module Description */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">Module Description</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{mod.description}</p>
      </motion.div>

      {/* Topic Details Cards */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-4 h-4 text-[#0f55f7]" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Topics & Learning Outcomes</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {mod.topics.map((topic, i) => {
            const details = getTopicDetails(topic)
            return (
              <motion.div
                key={topic}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate(`/organization/courses/${courseId}/modules/${mod.id}/topics/${encodeURIComponent(topic)}`)}
                className="group cursor-pointer rounded-[16px] border border-slate-200/70 bg-white/95 p-4 hover:shadow-lg hover:shadow-[#0f55f7]/5 hover:border-[#0f55f7]/20 transition-all duration-300 dark:border-slate-700/60 dark:bg-slate-900/80 dark:hover:border-[#0f55f7]/30"
              >
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 group-hover:scale-110 transition-transform">
                      <Target className="w-4 h-4 text-[#0f55f7]" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{topic}</h4>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <Clock className="w-2.5 h-2.5" />
                    {details.duration}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed mb-2.5 line-clamp-2">
                  {details.description || 'Learn core concepts and best practices for this topic.'}
                </p>

                <div className="flex items-center gap-3 mb-2.5 text-[10px]">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#0f55f7]">
                    <DollarSign className="w-3 h-3" />
                    {fmt(details.price)}
                  </span>
                </div>

                {/* Learning Outcomes */}
                <div className="space-y-1">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Learning Outcomes
                  </p>
                  <ul className="space-y-1">
                    {details.outcomes.map((outcome, oi) => (
                      <li key={oi} className="flex items-start gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
