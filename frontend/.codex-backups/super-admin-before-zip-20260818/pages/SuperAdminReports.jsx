import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FileText, Download, Calendar, Eye, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
import StatusBadge from '@shared/components/StatusBadge'
import { getApiErrorMessage, reportsApi } from '@shared/services/apiServices'
 
const INITIAL_REPORTS = [
  { id: 1, name: 'Monthly Platform Summary - Dec 2024', type: 'Summary', generated: 'Dec 20, 2024', status: 'ready', size: '3.2 MB', pages: 24, author: 'System' },
  { id: 2, name: 'Organization Growth Q4 2024', type: 'Growth', generated: 'Dec 18, 2024', status: 'ready', size: '2.8 MB', pages: 18, author: 'System' },
  { id: 3, name: 'Revenue Report - December 2024', type: 'Financial', generated: 'Dec 15, 2024', status: 'ready', size: '4.1 MB', pages: 32, author: 'System' },
  { id: 4, name: 'User Activity Analysis', type: 'Analytics', generated: 'Dec 12, 2024', status: 'ready', size: '1.5 MB', pages: 12, author: 'System' },
  { id: 5, name: 'Subscription Renewal Forecast', type: 'Forecast', generated: 'Dec 10, 2024', status: 'ready', size: '5.3 MB', pages: 28, author: 'System' },
  { id: 6, name: 'Compliance Audit Report', type: 'Compliance', generated: 'Nov 30, 2024', status: 'ready', size: '6.7 MB', pages: 45, author: 'System' },
  { id: 7, name: 'Employee Skills Heatmap', type: 'Analytics', generated: 'Nov 28, 2024', status: 'ready', size: '3.9 MB', pages: 20, author: 'System' },
  { id: 8, name: 'Course Completion Analytics', type: 'Learning', generated: 'Nov 25, 2024', status: 'ready', size: '2.1 MB', pages: 15, author: 'System' },
  { id: 9, name: 'Annual Platform Report 2024', type: 'Annual', generated: 'Dec 22, 2024', status: 'generating', size: '-', pages: 0, author: 'System' },
]
 
const TODAY = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
let nextId = 10
 
const TYPE_FILTERS = ['All', 'Summary', 'Growth', 'Financial', 'Analytics', 'Forecast', 'Compliance', 'Learning', 'Annual']
 
export default function SuperAdminReports() {
  const [typeFilter, setTypeFilter] = useState('All')
  const [reports, setReports] = useState(INITIAL_REPORTS)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [hr, skills, performance, workforce] = await Promise.all([
          reportsApi.hrAnalytics(),
          reportsApi.skillsAnalytics(),
          reportsApi.performanceAnalytics(),
          reportsApi.workforceAnalytics(),
        ])
        const apiReports = [
          { id: 'api-hr', name: `HR Analytics - ${hr.totalEmployees ?? 0} employees`, type: 'Analytics', generated: TODAY, status: 'ready', size: 'API', pages: 1, author: 'Backend' },
          { id: 'api-skills', name: 'Skills Analytics', type: 'Analytics', generated: TODAY, status: 'ready', size: 'API', pages: 1, author: 'Backend' },
          { id: 'api-performance', name: 'Performance Analytics', type: 'Analytics', generated: TODAY, status: 'ready', size: 'API', pages: 1, author: 'Backend' },
          { id: 'api-workforce', name: 'Workforce Analytics', type: 'Analytics', generated: TODAY, status: 'ready', size: 'API', pages: 1, author: 'Backend' },
        ]
        setReports(apiReports)
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to load reports'))
      }
    }
    fetchReports()
  }, [])
 
  const handleGenerateReport = () => {
    if (generating) return
    setGenerating(true)
    toast.success('Report generation started! You will be notified when ready.')
 
    const newReport = {
      id: nextId++,
      name: `Custom Report - ${TODAY}`,
      type: 'Summary',
      generated: TODAY,
      status: 'generating',
      size: '-',
      pages: 0,
      author: 'Admin',
    }
    setReports((prev) => [newReport, ...prev])
 
    // Simulate completion after 3 seconds
    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === newReport.id
            ? { ...r, status: 'ready', size: `${(Math.random() * 5 + 1).toFixed(1)} MB`, pages: Math.floor(Math.random() * 30) + 10 }
            : r
        )
      )
      toast.success(`"${newReport.name}" is now ready for download!`)
      setGenerating(false)
    }, 3000)
  }
 
  const handleDownload = (report) => {
    toast.success(`Downloading "${report.name}"...`)
  }
 
  const handleView = (report) => {
    toast.success(`Opening "${report.name}"...`)
  }
 
  const handleDelete = (report) => {
    setReports((prev) => prev.filter((r) => r.id !== report.id))
    toast.error(`"${report.name}" deleted`)
  }
 
  const filtered = typeFilter === 'All' ? reports : reports.filter(r => r.type === typeFilter)
 
  const totalSize = reports.filter(r => r.status === 'ready').reduce((a, r) => a + (Number.parseFloat(r.size) || 0), 0).toFixed(1)
 
  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-7">
      <PageHeader title="Reports" subtitle="System-generated reports and exports" icon={FileText} showBreadcrumb={false} titleClassName="!text-xl !leading-7" subtitleClassName="!mt-0 !text-sm !leading-5" containerClassName="!mb-4"
        actions={            <button onClick={handleGenerateReport} disabled={generating} className="inline-flex h-9 items-center gap-2 px-3.5 text-xs font-semibold text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #0f55f7, #06b6a8)', boxShadow: '0 4px 16px rgba(15,85,247,0.25)' }}>
            {generating ? (
              <><Clock className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Calendar className="w-4 h-4" /> Generate Report</>
            )}
          </button>
        }
      />
 
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Reports', value: reports.length, icon: FileText, color: '#0f55f7' },
          { label: 'Available', value: reports.filter(r => r.status === 'ready').length, icon: CheckCircle2, color: '#06b6a8' },
          { label: 'Generating', value: reports.filter(r => r.status === 'generating').length, icon: Clock, color: '#0f55f7' },
          { label: 'Total Size', value: `${totalSize} MB`, icon: Download, color: '#06b6a8' },
        ].map((stat, i) => (
          <Card key={stat.label} delay={i * 0.05} padding="p-3" className="h-[88px]">
            <div className="flex h-full items-center gap-3">
              <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-[17px] h-[17px]" style={{ color: stat.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold leading-5 text-slate-900 dark:text-white">{stat.value}</p>
                <p className="mt-1 truncate text-[11px] text-slate-400">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
 
      <div className="flex gap-1.5 flex-wrap mb-3">
        {TYPE_FILTERS.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${typeFilter === t ? 'bg-brand text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>
 
      <Card padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
                {['Report Name', 'Type', 'Generated', 'Size', 'Pages', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((report, i) => (
                <motion.tr key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-brand" />
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5"><span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg font-medium">{report.type}</span></td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">{report.generated}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">{report.size}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">{report.pages}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={report.status} /></td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      {report.status === 'ready' && (
                        <button onClick={() => handleDownload(report)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Download">
                          <Download className="w-3.5 h-3.5 text-slate-400 hover:text-brand" />
                        </button>
                      )}
                      <button onClick={() => handleView(report)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="View">
                        <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-brand" />
                      </button>
                      {report.status !== 'generating' && (
                        <button onClick={() => handleDelete(report)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Delete">
                          <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
 
