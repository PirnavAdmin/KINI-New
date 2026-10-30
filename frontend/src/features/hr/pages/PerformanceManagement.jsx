import HrLiveBoundary from '@features/hr/components/HrLiveBoundary'
import { useMemo, useState } from 'react'
import useAddIntent from '@features/hr/hooks/useAddIntent'
import {
  Target, Star, FileCheck2, TrendingUp, GraduationCap, Award, Plus, BarChart3,
} from 'lucide-react'
import { toast } from 'sonner'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import usePageSearch from '@features/hr/hooks/usePageSearch'
import HRPage from '@features/hr/components/HRPage'
import { HrBreadcrumb, HrHero, HrKpis } from '@features/hr/components/portal/HrPortalKit'
import { heroProps } from '@features/hr/components/portal/hrHeroes'
import { ROUTES } from '@shared/constants/routeConstants'
import HRQuickActions from '@features/hr/components/HRQuickActions'
import HREntityForm from '@features/hr/components/HREntityForm'
import HRMiniBars from '@features/hr/components/HRMiniBars'
import HRDataTable from '@features/hr/components/HRDataTable'
import DataTable from '@shared/components/DataTable'
import { HRSection, HRStatusBadge, HRProgressBar } from '@features/hr/components/hrPrimitives'
import { HR_PERFORMANCE_STATS, HR_GOALS, HR_REVIEWS, HR_RATING_DISTRIBUTION, HR_PERFORMANCE_TREND, HR_TRAINING } from '@features/hr/data/hrTalent'

const GOAL_BADGE = { 'on-track': 'success', 'at-risk': 'danger', completed: 'success', pending: 'pending' }
const REVIEW_BADGE = { completed: 'success', 'in-progress': 'active', pending: 'pending' }
const TRAINING_BADGE = { active: 'active', completed: 'success' }

function LegacyPerformanceManagement() {
  // KINI HRMS RBAC — goals, reviews and exports follow the performance module permissions.
  const { can } = useHrPermissions()
  const [goals, setGoals] = useState(HR_GOALS)
  const [reviews, setReviews] = useState(HR_REVIEWS)
  const [goalFormOpen, setGoalFormOpen] = useState(false)
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  useAddIntent(() => setGoalFormOpen(true))
  const pageSearch = usePageSearch()
  const filteredGoals = useMemo(() => goals.filter(pageSearch.matches), [goals, pageSearch.matches])
  const filteredReviews = useMemo(() => reviews.filter(pageSearch.matches), [reviews, pageSearch.matches])

  const goalColumns = [
    {
      accessor: 'employee', header: 'Employee', sortable: true, minWidth: 160,
      render: (row) => <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.employee}</span>,
    },
    { accessor: 'goal', header: 'Goal', sortable: true, minWidth: 240, render: (row) => (
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{row.goal}</span>
    )},
    { accessor: 'type', header: 'Type', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.type}</span> },
    { accessor: 'progress', header: 'Progress', sortable: true, render: (row) => (
      <div className="w-28"><HRProgressBar value={row.progress} showLabel color={row.status === 'at-risk' ? '#EF4444' : '#06b6a8'} /></div>
    )},
    { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={GOAL_BADGE[row.status]} label={row.status} /> },
    { accessor: 'due', header: 'Due', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.due}</span> },
  ]

  const reviewColumns = [
    { accessor: 'employee', header: 'Employee', sortable: true, render: (row) => <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{row.employee}</span> },
    { accessor: 'reviewer', header: 'Reviewer', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.reviewer}</span> },
    { accessor: 'cycle', header: 'Cycle', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.cycle}</span> },
    { accessor: 'rating', header: 'Rating', sortable: true, render: (row) => (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
        <Star className="h-3.5 w-3.5 fill-current" />{row.rating.toFixed(1)}
      </span>
    )},
    { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={REVIEW_BADGE[row.status]} label={row.status} /> },
    { accessor: 'due', header: 'Due', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.due}</span> },
  ]

  return (
    <HRPage
      moduleId="performance"
      title="Performance"
      subtitle="Goals, KPIs, reviews, ratings, training and promotion readiness."
      icon={Target}
      lastUpdated="Aug 4, 2026"
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search performance…' }}
      actions={
        <HRQuickActions
          can={can}
          actions={[
            { key: 'goal', label: 'New Goal', icon: Plus, variant: 'primary', permission: ['performance', 'add'], onClick: () => setGoalFormOpen(true) },
            { key: 'review', label: 'Start Review', icon: FileCheck2, permission: ['performance', 'edit'], onClick: () => setReviewFormOpen(true) },
          ]}
        />
      }
      hero={
        <>
          <HrBreadcrumb items={[{ label: 'Home', to: ROUTES.EMPLOYEE.HR_DASHBOARD }, { label: 'Performance' }]} />
          <HrHero
            {...heroProps('performance')}
            actions={<HRQuickActions
          can={can}
          actions={[
            { key: 'goal', label: 'New Goal', icon: Plus, variant: 'primary', permission: ['performance', 'add'], onClick: () => setGoalFormOpen(true) },
            { key: 'review', label: 'Start Review', icon: FileCheck2, permission: ['performance', 'edit'], onClick: () => setReviewFormOpen(true) },
          ]}
        />}
          />
        </>
      }
    >
      <HrKpis columns={6}
        items={[
          { label: 'Avg Rating', value: `${HR_PERFORMANCE_STATS.avgRating}/5`, icon: Star, tone: 'blue' },
          { label: 'Goals On Track', value: `${HR_PERFORMANCE_STATS.goalsOnTrack}%`, icon: Target, tone: 'green' },
          { label: 'Reviews Due', value: HR_PERFORMANCE_STATS.reviewsDue, icon: FileCheck2, tone: 'orange' },
          { label: 'Promotion Ready', value: HR_PERFORMANCE_STATS.promotionReady, icon: Award, tone: 'purple' },
          { label: 'High Performers', value: HR_PERFORMANCE_STATS.highPerformers, icon: TrendingUp, tone: 'pink' },
          { label: 'Q3 Trend', value: `${"4.4"}→`, icon: BarChart3, tone: 'teal' },
        ]}
      />
      <div className="mb-3" />

      {/* Trend + distribution */}
      <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <HRSection title="Performance Trend" subtitle="Average rating by quarter" icon={TrendingUp} padding="p-4">
          <HRMiniBars
            data={HR_PERFORMANCE_TREND.map((d) => ({ label: d.quarter, value: d.rating }))}
            color="#0f55f7"
            barHeight="h-40"
            valueFormatter={(v) => v.toFixed(1)}
          />
        </HRSection>
        <HRSection title="Rating Distribution" subtitle="Employees by rating band" icon={Star} className="lg:col-span-2" padding="p-4">
          <div className="space-y-3">
            {HR_RATING_DISTRIBUTION.map((band) => {
              const max = HR_RATING_DISTRIBUTION[0].count
              return (
                <div key={band.range} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs font-bold text-slate-600 dark:text-slate-300">{band.range}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]"
                      style={{ width: `${(band.count / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs font-extrabold text-slate-800 dark:text-slate-200">{band.count}</span>
                </div>
              )
            })}
          </div>
        </HRSection>
      </div>

      {/* Goals + reviews */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <HRSection title="Goals & KPIs" subtitle="Tracked objectives" icon={Target} padding="p-4">
          <HRDataTable columns={goalColumns} data={filteredGoals} searchable={false} pageSize={6} exportFileName="goals" exportTitle="Goals & KPIs" exportable={can('performance', 'export')} />
        </HRSection>
        <HRSection title="Reviews" subtitle="Cycle review status" icon={FileCheck2} padding="p-4">
          <HRDataTable columns={reviewColumns} data={filteredReviews} searchable={false} pageSize={6} exportFileName="reviews" exportTitle="Performance Reviews" exportable={can('performance', 'export')} />
        </HRSection>
      </div>

      {/* Training */}
      <HRSection title="Training Programs" subtitle="L&D programs and completion" icon={GraduationCap} padding="p-4">
        <DataTable
          columns={[
            { accessor: 'program', header: 'Program', sortable: true, minWidth: 240, render: (row) => <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.program}</span> },
            { accessor: 'department', header: 'Department', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.department}</span> },
            { accessor: 'enrolled', header: 'Enrolled', sortable: true, render: (row) => <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{row.enrolled}</span> },
            { accessor: 'completion', header: 'Completion', sortable: true, render: (row) => (
              <div className="w-28"><HRProgressBar value={row.completion} showLabel color={row.completion === 100 ? '#06b6a8' : '#8b5cf6'} /></div>
            )},
            { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={TRAINING_BADGE[row.status]} label={row.status} /> },
          ]}
          data={HR_TRAINING}
          searchable={false}
          pageSize={4}
        />
      </HRSection>

      {/* New goal form */}
      <HREntityForm
        open={goalFormOpen}
        onClose={() => setGoalFormOpen(false)}
        title="New Goal"
        subtitle="Track a new objective or KPI"
        icon={Target}
        accent="#06b6a8"
        saveLabel="Create Goal"
        fields={[
          { key: 'employee', label: 'Employee', type: 'text', required: true, placeholder: 'Employee name' },
          { key: 'goal', label: 'Goal', type: 'text', required: true, placeholder: 'e.g. Ship the Q3 learning platform release' },
          { key: 'type', label: 'Type', type: 'select', required: true, options: ['OKR', 'KPI', 'Development', 'Project'].map((t) => ({ value: t, label: t })) },
          { key: 'due', label: 'Due Date', type: 'date', required: true },
          { key: 'progress', label: 'Initial Progress (%)', type: 'number', defaultValue: 0, placeholder: '0' },
        ]}
        onSave={(values) => {
          const id = `GL-${String(goals.length + 1).padStart(2, '0')}`
          setGoals((prev) => [{
            id,
            employee: values.employee,
            goal: values.goal,
            type: values.type,
            progress: Math.min(Number(values.progress) || 0, 100),
            status: Number(values.progress) >= 100 ? 'completed' : 'on-track',
            due: values.due,
          }, ...prev])
          toast.success('Goal created and added to the tracker')
        }}
      />

      {/* Start review form */}
      <HREntityForm
        open={reviewFormOpen}
        onClose={() => setReviewFormOpen(false)}
        title="Start Review"
        subtitle="Begin a performance review for an employee"
        icon={FileCheck2}
        accent="#0f55f7"
        saveLabel="Start Review"
        fields={[
          { key: 'employee', label: 'Employee', type: 'text', required: true, placeholder: 'Employee name' },
          { key: 'reviewer', label: 'Reviewer', type: 'text', required: true, placeholder: 'Manager or peer name' },
          { key: 'cycle', label: 'Cycle', type: 'select', required: true, options: ['H1 2026', 'H2 2026', 'Q3 2026'].map((c) => ({ value: c, label: c })) },
          { key: 'due', label: 'Due Date', type: 'date', required: true },
        ]}
        onSave={(values) => {
          const id = `RV-${String(reviews.length + 1).padStart(2, '0')}`
          setReviews((prev) => [{
            id,
            employee: values.employee,
            reviewer: values.reviewer,
            cycle: values.cycle,
            rating: 0,
            status: 'in-progress',
            due: values.due,
          }, ...prev])
          toast.success(`${values.cycle} review started for ${values.employee}`)
        }}
      />
    </HRPage>
  )
}

export default function PerformanceManagement(props) {
  return <HrLiveBoundary module="performance" legacy={<LegacyPerformanceManagement {...props} />} />
}
