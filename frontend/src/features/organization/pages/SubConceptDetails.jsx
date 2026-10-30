import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, BookOpen, Clock, DollarSign, Layers, Star, CheckCircle2, ChevronRight, Code2, Database, Server, GraduationCap, Award, Target } from 'lucide-react'
import { COURSES_DATA } from '@shared/data/orgBatchesMockData'
import { ROUTES } from '@shared/constants/routeConstants'
import StatusBadge from '@shared/components/StatusBadge'
import EmptyState from '@shared/components/EmptyState'
import { Button } from '@shared/components/FormElements'

const fmt = (v) => Number.isNaN(Number(v)) ? '-' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(v))

// ─── Sub-Concept Data with rich sub-topics ────────────────────────────────
const SUB_CONCEPT_DETAILS = {
  'HTML': {
    duration: '2 Weeks', price: 2000,
    description: 'Master the foundation of web development with HTML5. Learn semantic markup, accessible document structure, form creation, and multimedia integration to build professional web pages.',
    icon: Code2, category: 'Frontend',
    outcomes: [
      'Understand HTML5 document structure and semantics',
      'Build accessible web pages with proper landmarks',
      'Create forms with validation and multimedia elements',
      'Implement SEO-friendly meta tags and structured data',
    ],
    subTopics: [
      'HTML5 Semantic Elements',
      'Forms & Input Validation',
      'Multimedia & Embedding',
      'SEO & Accessibility',
      'SVG & Canvas Graphics',
    ],
  },
  'CSS': {
    duration: '2 Weeks', price: 2500,
    description: 'Transform web pages with modern CSS3. Master layouts, responsive design, animations, and custom properties for professional-grade styling.',
    icon: Code2, category: 'Frontend',
    outcomes: [
      'Master CSS3 layout techniques (Flexbox, Grid)',
      'Build responsive designs with media queries',
      'Create animations and transitions',
      'Implement CSS custom properties and modern selectors',
    ],
    subTopics: [
      'Flexbox & Grid Layouts',
      'Responsive Design & Media Queries',
      'CSS Animations & Transitions',
      'Custom Properties & Theming',
      'Preprocessors (SASS/SCSS)',
    ],
  },
  'JavaScript': {
    duration: '3 Weeks', price: 3500,
    description: 'Dive deep into the language of the web. From fundamentals to advanced concepts including closures, promises, and DOM manipulation.',
    icon: Code2, category: 'Frontend',
    outcomes: [
      'Master core JavaScript concepts and ES6+ features',
      'Understand closures, promises, and async/await',
      'Manipulate the DOM effectively',
      'Implement modern module patterns and bundling',
    ],
    subTopics: [
      'ES6+ Syntax & Features',
      'DOM Manipulation & Events',
      'Asynchronous JavaScript',
      'Closures & Scope',
      'Modules & Bundlers',
    ],
  },
  'React JS': {
    duration: '3 Weeks', price: 4000,
    description: 'Build modern user interfaces with React. Learn component architecture, hooks, state management, and production deployment workflows.',
    icon: Code2, category: 'Frontend',
    outcomes: [
      'Build component-based UIs with React',
      'Master hooks, context API, and state management',
      'Implement routing with React Router',
      'Deploy production-ready React applications',
    ],
    subTopics: [
      'Components & JSX',
      'React Hooks (useState, useEffect)',
      'State Management & Context API',
      'React Router & Navigation',
      'Performance Optimization',
    ],
  },
  'Python': {
    duration: '3 Weeks', price: 3000,
    description: 'Start your programming journey with Python. Cover syntax, data structures, OOP principles, and build real-world command-line applications.',
    icon: Server, category: 'Backend',
    outcomes: [
      'Master Python syntax and core programming concepts',
      'Work with data structures and file I/O',
      'Understand OOP principles in Python',
      'Build command-line applications and scripts',
    ],
    subTopics: [
      'Python Basics & Syntax',
      'Data Structures & Collections',
      'Object-Oriented Programming',
      'File I/O & Exception Handling',
      'Modules & Packages',
    ],
  },
  'Django': {
    duration: '3 Weeks', price: 4000,
    description: 'Build robust web applications with Django. Master the MVT architecture, ORM, REST APIs, and authentication systems.',
    icon: Server, category: 'Backend',
    outcomes: [
      'Build full-stack web apps with Django framework',
      'Implement MVT architecture and ORM',
      'Create RESTful APIs with Django REST Framework',
      'Handle authentication, authorization, and middleware',
    ],
    subTopics: [
      'Django MVT Architecture',
      'Models & ORM',
      'Views & Templates',
      'Django REST Framework',
      'Authentication & Authorization',
    ],
  },
  'Django REST Framework': {
    duration: '2 Weeks', price: 3000,
    description: 'Create powerful REST APIs with DRF. Learn serializers, viewsets, authentication, and comprehensive API documentation.',
    icon: Server, category: 'Backend',
    outcomes: [
      'Build robust REST APIs with DRF',
      'Implement serializers, viewsets, and routers',
      'Handle authentication with JWT and permissions',
      'Create API documentation with Swagger/OpenAPI',
    ],
    subTopics: [
      'Serializers & Viewsets',
      'Routers & URLs',
      'Authentication & Permissions',
      'Filtering & Pagination',
      'API Documentation & Testing',
    ],
  },
  'REST APIs': {
    duration: '2 Weeks', price: 2500,
    description: 'Design and implement production-ready REST APIs. Learn HTTP methods, error handling, security, and API best practices.',
    icon: Server, category: 'Backend',
    outcomes: [
      'Design RESTful API architectures',
      'Implement CRUD operations with proper HTTP methods',
      'Handle error responses and status codes',
      'Secure APIs with authentication and rate limiting',
    ],
    subTopics: [
      'HTTP Methods & Status Codes',
      'CRUD Operations',
      'Error Handling & Validation',
      'Authentication & Rate Limiting',
      'API Versioning & Documentation',
    ],
  },
  'JWT Authentication': {
    duration: '1 Week', price: 1500,
    description: 'Secure your applications with JWT-based authentication. Understand token lifecycle, refresh flows, and security best practices.',
    icon: Server, category: 'Backend',
    outcomes: [
      'Understand JWT structure and token lifecycle',
      'Implement access and refresh token flow',
      'Secure APIs with token-based authentication',
      'Handle token storage and rotation securely',
    ],
    subTopics: [
      'JWT Structure & Claims',
      'Access & Refresh Tokens',
      'Token-Based Authentication',
      'Secure Token Storage',
      'Token Rotation & Revocation',
    ],
  },
  'SQL': {
    duration: '2 Weeks', price: 2500,
    description: 'Master database querying with SQL. Learn complex queries, database design, performance optimization, and advanced database features.',
    icon: Database, category: 'Database',
    outcomes: [
      'Write complex SQL queries with joins and subqueries',
      'Design normalized database schemas',
      'Optimize query performance with indexing',
      'Implement stored procedures and triggers',
    ],
    subTopics: [
      'SELECT Queries & Filtering',
      'JOINs & Subqueries',
      'Database Design & Normalization',
      'Indexing & Performance',
      'Stored Procedures & Triggers',
    ],
  },
  'PostgreSQL': {
    duration: '2 Weeks', price: 2500,
    description: 'Harness the power of PostgreSQL. Explore advanced features, full-text search, replication, and performance tuning.',
    icon: Database, category: 'Database',
    outcomes: [
      'Master PostgreSQL advanced features',
      'Implement full-text search and JSON operations',
      'Configure replication and backup strategies',
      'Optimize performance with query analysis',
    ],
    subTopics: [
      'PostgreSQL Advanced Features',
      'Full-Text Search & JSON',
      'Replication & Backup',
      'Performance Tuning',
      'Extensions & Tools',
    ],
  },
  'Database Design': {
    duration: '2 Weeks', price: 2000,
    description: 'Learn fundamental database design principles. Master entity-relationship modeling, normalization, schema design, and best practices for data integrity.',
    icon: Database, category: 'Database',
    outcomes: [
      'Design robust entity-relationship models',
      'Apply normalization rules for data integrity',
      'Create efficient database schemas',
      'Understand indexing strategies and trade-offs',
    ],
    subTopics: [
      'Entity-Relationship Modeling',
      'Normalization & Denormalization',
      'Schema Design Patterns',
      'Indexing Strategies',
      'Data Integrity & Constraints',
    ],
  },
  'Relationships & Queries': {
    duration: '2 Weeks', price: 2000,
    description: 'Master database relationships and complex queries. Learn one-to-one, one-to-many, many-to-many relationships and advanced query patterns.',
    icon: Database, category: 'Database',
    outcomes: [
      'Model one-to-one, one-to-many, and many-to-many relationships',
      'Write complex multi-table queries',
      'Implement efficient join strategies',
      'Optimize query execution plans',
    ],
    subTopics: [
      'Table Relationships',
      'Complex JOIN Queries',
      'Subqueries & CTEs',
      'Query Optimization',
      'Execution Plan Analysis',
    ],
  },
  'MongoDB': {
    duration: '2 Weeks', price: 2500,
    description: 'Master NoSQL databases with MongoDB. Learn document modeling, aggregation pipelines, indexing, and production deployment strategies.',
    icon: Database, category: 'Database',
    outcomes: [
      'Design document-based data models',
      'Write aggregation pipelines for reporting',
      'Implement indexing for query optimization',
      'Handle replication, sharding, and backups',
    ],
    subTopics: [
      'Document Data Modeling',
      'CRUD Operations',
      'Aggregation Pipeline',
      'Indexing & Performance',
      'Replication & Sharding',
    ],
  },
}

const DEFAULT_OUTCOMES = [
  'Understand core concepts and best practices',
  'Build practical projects with hands-on exercises',
  'Implement industry-standard design patterns',
  'Troubleshoot and debug common issues',
]

const getSubConceptIcon = (category) => {
  if (category === 'Frontend') return Code2
  if (category === 'Backend') return Server
  if (category === 'Database') return Database
  return BookOpen
}

const getCategoryColor = (category) => {
  if (category === 'Frontend') return 'from-blue-500/10 to-cyan-500/10'
  if (category === 'Backend') return 'from-emerald-500/10 to-teal-500/10'
  if (category === 'Database') return 'from-violet-500/10 to-purple-500/10'
  return 'from-slate-500/10 to-slate-400/10'
}

const getCategoryIconColor = (category) => {
  if (category === 'Frontend') return 'text-blue-600'
  if (category === 'Backend') return 'text-emerald-600'
  if (category === 'Database') return 'text-violet-600'
  return 'text-slate-600'
}

export default function SubConceptDetails() {
  const { courseId, moduleId, topicName } = useParams()
  const navigate = useNavigate()
  const decodedTopic = decodeURIComponent(topicName || '')
  const [activeSubTopic, setActiveSubTopic] = useState(0)

  const data = useMemo(() => {
    const course = COURSES_DATA.find((c) => c.courseId === Number(courseId))
    const mod = course?.modules.find((m) => m.id === moduleId)
    const topicDetails = SUB_CONCEPT_DETAILS[decodedTopic]
    return { course, module: mod, topicDetails }
  }, [courseId, moduleId, decodedTopic])

  const { course, module: mod, topicDetails } = data

  if (!course || !mod || !topicDetails) {
    return (
      <div className="px-4 py-12">
        <EmptyState
          icon={BookOpen}
          title="Sub-concept not found"
          action={<Button onClick={() => navigate(ROUTES.ORG_ADMIN.COURSES)}><ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Courses</Button>}
        />
      </div>
    )
  }

  const ConceptIcon = getSubConceptIcon(topicDetails.category)

  return (
    <div className="w-full px-4 py-3 sm:px-5 lg:px-6 space-y-4">
      {/* Breadcrumb */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
        <button onClick={() => navigate(ROUTES.ORG_ADMIN.COURSES)} className="hover:text-[#0f55f7] transition-colors">Courses</button>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <button onClick={() => navigate(`/organization/courses/${courseId}/details`)} className="hover:text-[#0f55f7] transition-colors truncate max-w-[120px]">{course.courseName}</button>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <button onClick={() => navigate(`/organization/courses/${courseId}/modules/${moduleId}`)} className="hover:text-[#0f55f7] transition-colors truncate max-w-[120px]">{mod.name}</button>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px]">{decodedTopic}</span>
      </motion.div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/organization/courses/${courseId}/modules/${moduleId}`)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#0f55f7]/30 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${getCategoryColor(topicDetails.category)}`}>
            <ConceptIcon className={`w-4.5 h-4.5 ${getCategoryIconColor(topicDetails.category)}`} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-950 dark:text-white truncate">{decodedTopic}</h1>
            <p className="text-xs text-slate-400 truncate">{course.courseName} · {mod.name} · {topicDetails.category}</p>
          </div>
          <StatusBadge status="success" label={topicDetails.category} size="sm" className="shrink-0" />
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid gap-2.5 grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Price', value: fmt(topicDetails.price), icon: DollarSign, color: 'from-[#0f55f7]/10 to-[#06b6a8]/10', iconColor: 'text-[#0f55f7]' },
          { label: 'Duration', value: topicDetails.duration, icon: Clock, color: 'from-emerald-500/10 to-emerald-400/10', iconColor: 'text-emerald-600' },
          { label: 'Sub-Topics', value: topicDetails.subTopics.length, icon: Layers, color: 'from-violet-500/10 to-violet-400/10', iconColor: 'text-violet-600' },
          { label: 'Module', value: mod.name, icon: BookOpen, color: 'from-cyan-500/10 to-cyan-400/10', iconColor: 'text-cyan-600' },
          { label: 'Course', value: course.courseName, icon: GraduationCap, color: 'from-amber-500/10 to-amber-400/10', iconColor: 'text-amber-600' },
        ].map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="rounded-[14px] border border-slate-200/70 bg-white/95 p-3 dark:border-slate-700/60 dark:bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${c.color}`}>
                  <Icon className={`h-4 w-4 ${c.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{c.label}</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Description */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">Concept Overview</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{topicDetails.description}</p>
        {/* Learning Outcomes */}
        <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {topicDetails.outcomes.map((outcome, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{outcome}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sub-Topics Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700/60">
        <nav className="flex gap-0 -mb-px overflow-x-auto scrollbar-hide">
          {topicDetails.subTopics.map((subTopic, i) => (
            <button
              key={subTopic}
              onClick={() => setActiveSubTopic(i)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeSubTopic === i
                  ? 'border-[#0f55f7] text-[#0f55f7]'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              {subTopic}
            </button>
          ))}
        </nav>
      </div>

      {/* Sub-Topic Content + Sidebar */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTopic}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="grid gap-4 lg:grid-cols-3"
        >
          <div className="lg:col-span-2 space-y-4">
            {/* Sub-Topic Detail */}
            <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2">{topicDetails.subTopics[activeSubTopic]}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Deep dive into {topicDetails.subTopics[activeSubTopic]}. Master practical skills through hands-on exercises and real-world projects within the {decodedTopic} ecosystem.
              </p>
              <div className="grid grid-cols-3 gap-2.5 mt-4">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Est. Time</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">2-3 Days</p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Practicals</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{((i + activeSubTopic) % 4) + 3} Exercises</p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Difficulty</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {activeSubTopic < 2 ? 'Beginner' : activeSubTopic < 4 ? 'Intermediate' : 'Advanced'}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Key Takeaways</h3>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {[
                  `Understand ${topicDetails.subTopics[activeSubTopic]} core principles`,
                  `Apply ${topicDetails.subTopics[activeSubTopic]} in real projects`,
                  `Best practices for ${topicDetails.subTopics[activeSubTopic].toLowerCase()}`,
                  `Debug and optimize ${topicDetails.subTopics[activeSubTopic].toLowerCase()} implementations`,
                  `Integrate with existing ${decodedTopic.toLowerCase()} projects`,
                  `Build portfolio-ready examples using ${topicDetails.subTopics[activeSubTopic].toLowerCase()}`,
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            {/* All Sub-Topics */}
            <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
              <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2.5">All Sub-Topics</h3>
              <div className="space-y-1.5">
                {topicDetails.subTopics.map((subTopic, i) => (
                  <button
                    key={subTopic}
                    onClick={() => setActiveSubTopic(i)}
                    className={`w-full flex items-center gap-2.5 rounded-lg p-2.5 text-left transition-all ${
                      activeSubTopic === i
                        ? 'bg-[#0f55f7]/10 text-[#0f55f7] dark:bg-[#0f55f7]/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      activeSubTopic === i ? 'bg-[#0f55f7] text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}>
                      <Target className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold truncate">{subTopic}</p>
                    </div>
                    <ChevronRight className="w-3 h-3 shrink-0 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
              <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2.5">Price Breakdown</h3>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] py-1">
                  <span className="text-slate-600 dark:text-slate-400">{decodedTopic} Core</span>
                  <span className="font-bold text-slate-900 dark:text-white">{fmt(Math.round(topicDetails.price * 0.6))}</span>
                </div>
                <div className="flex justify-between text-[11px] py-1">
                  <span className="text-slate-600 dark:text-slate-400">Hands-on Projects</span>
                  <span className="font-bold text-slate-900 dark:text-white">{fmt(Math.round(topicDetails.price * 0.25))}</span>
                </div>
                <div className="flex justify-between text-[11px] py-1">
                  <span className="text-slate-600 dark:text-slate-400">Assessment & Support</span>
                  <span className="font-bold text-slate-900 dark:text-white">{fmt(Math.round(topicDetails.price * 0.15))}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 mt-1.5 flex justify-between text-[11px]">
                  <span className="font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="font-black text-[#0f55f7]">{fmt(topicDetails.price)}</span>
                </div>
              </div>
            </div>

            {/* Module Info */}
            <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
              <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2.5">Module Info</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0f55f7]/10">
                    <BookOpen className="w-3.5 h-3.5 text-[#0f55f7]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-slate-900 dark:text-white truncate">{mod.name}</p>
                    <p className="text-[9px] text-slate-400">{mod.topics.length} topics</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-slate-900 dark:text-white truncate">{course.courseName}</p>
                    <p className="text-[9px] text-slate-400">{course.totalModules} modules</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/organization/courses/${courseId}/modules/${moduleId}`)}
                className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0f55f7]/10 px-3 py-2 text-[10px] font-semibold text-[#0f55f7] hover:bg-[#0f55f7]/20 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                View Module Details
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
