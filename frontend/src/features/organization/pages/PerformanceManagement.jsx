import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  TrendingUp, Search, Star, CheckCircle, Clock, AlertCircle,
  Edit3, User, BarChart3, ChevronRight, ArrowUp, ArrowDown
} from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
import DataTable from '@shared/components/DataTable'
import StatusBadge from '@shared/components/StatusBadge'
import Modal from '@shared/components/Modal'
import { Input, Select, Button } from '@shared/components/FormElements'
import { employeeApi, getApiErrorMessage, reportsApi } from '@shared/services/apiServices'

// =================================
// TODO: API Integration
// GET /api/v1/performance/reviews
// POST /api/v1/performance/reviews
// PUT /api/v1/performance/reviews/:id
// =================================

const REVIEWS_DATA = [
  { id: 'rev-001', employee: 'Alice Johnson', department: 'Engineering', reviewer: 'Jane Smith', period: 'Q4 2024', score: 92, status: 'completed', dueDate: 'Dec 15, 2024', type: 'Annual' },
  { id: 'rev-002', employee: 'Bob Smith', department: 'Sales', reviewer: 'Alex Thompson', period: 'Q4 2024', score: 88, status: 'completed', dueDate: 'Dec 15, 2024', type: 'Quarterly' },
  { id: 'rev-003', employee: 'Carol Davis', department: 'Marketing', reviewer: 'Emily Rodriguez', period: 'Q1 2025', score: null, status: 'scheduled', dueDate: 'Jan 30, 2025', type: 'Quarterly' },
  { id: 'rev-004', employee: 'David Lee', department: 'Engineering', reviewer: 'Sarah Chen', period: 'Q1 2025', score: null, status: 'pending', dueDate: 'Feb 15, 2025', type: 'Annual' },
  { id: 'rev-005', employee: 'Eva Martinez', department: 'HR', reviewer: 'Jessica Park', period: 'Q4 2024', score: 85, status: 'completed', dueDate: 'Dec 15, 2024', type: 'Quarterly' },
  { id: 'rev-006', employee: 'Raj Patel', department: 'Engineering', reviewer: 'Sarah Chen', period: 'Q1 2025', score: null, status: 'pending', dueDate: 'Mar 1, 2025', type: 'Quarterly' },
]

export default function PerformanceManagement() {
  const [reviews, setReviews] = useState(REVIEWS_DATA)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true)
      try {
        const [employeeRows, performanceData] = await Promise.all([
          employeeApi.list(),
          reportsApi.performanceAnalytics(),
        ])
        setAnalytics(performanceData)
        const apiReviews = (Array.isArray(employeeRows) ? employeeRows : []).map((employee) => ({
          id: employee.employeeId,
          employee: [employee.firstName, employee.lastName].filter(Boolean).join(' ') || employee.email,
          department: employee.departmentName || `Department ${employee.departmentId || '-'}`,
          reviewer: 'Organization Admin',
          period: 'Current',
          score: employee.performanceScore ?? null,
          status: employee.status?.toLowerCase() === 'inactive' ? 'pending' : 'completed',
          dueDate: '',
          type: 'Performance',
        }))
        if (apiReviews.length) setReviews(apiReviews)
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to load performance management'))
      } finally {
        setLoading(false)
      }
    }
    fetchPerformance()
  }, [])

  const filtered = useMemo(() => {
    return reviews.filter(r => {
      if (filter !== 'all' && r.status !== filter) return false
      if (search && !r.employee.toLowerCase().includes(search.toLowerCase()) && !r.department.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [search, filter])

  const avgScore = analytics?.averagePerformance ?? (reviews.filter(r => r.score).reduce((a, r) => a + r.score, 0) / reviews.filter(r => r.score).length || 0)

  const columns = [
    { header: 'Employee', accessor: 'employee', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#06B6D4]/20 to-[#0f55f7]/20 flex items-center justify-center">
          <span className="text-xs font-bold text-[#06B6D4]">{row.employee.split(' ').map(n => n[0]).join('')}</span>
        </div>
        <div><p className="text-sm font-semibold text-slate-900 dark:text-white">{row.employee}</p><p className="text-xs text-slate-400">{row.department}</p></div>
      </div>
    )},
    { header: 'Period', accessor: 'period' },
    { header: 'Reviewer', accessor: 'reviewer' },
    { header: 'Score', accessor: 'score', render: (row) => row.score ? (
      <span className={`text-sm font-bold ${row.score >= 90 ? 'text-emerald-500' : row.score >= 75 ? 'text-amber-500' : 'text-red-500'}`}>{row.score}%</span>
    ) : <span className="text-xs text-slate-400">—</span> },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Reviews', value: reviews.length, color: '#0f55f7', icon: TrendingUp },
          { label: 'Completed', value: reviews.filter(r => r.status === 'completed').length, color: '#10B981', icon: CheckCircle },
          { label: 'Pending', value: reviews.filter(r => r.status === 'pending').length, color: '#F59E0B', icon: Clock },
          { label: 'Avg Score', value: avgScore ? `${Math.round(avgScore)}%` : '—', color: '#06b6a8', icon: BarChart3 },
        ].map((stat, i) => (
          <Card key={stat.label} delay={i * 0.05} padding="p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}08)` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p><p className="text-xs text-slate-400">{stat.label}</p></div>
            </div>
          </Card>
        ))}
      </div>

      <PageHeader title="Performance Management" subtitle="Employee performance reviews and evaluations" icon={TrendingUp} />

      <div className="flex gap-2 mb-6">
        {['all', 'completed', 'pending', 'scheduled'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filter === f ? 'bg-[#0f55f7] text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} pageSize={5} searchable searchPlaceholder="Search by employee or department..."
        emptyTitle="No reviews found" emptyDescription="Adjust your filter criteria." emptyIcon={TrendingUp} />
    </div>
  )
}
