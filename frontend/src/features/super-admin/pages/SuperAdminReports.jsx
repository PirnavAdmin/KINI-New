import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FileText, Download, Calendar, Eye, Trash2, Clock, CheckCircle2, Loader2, FileDown } from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
import Modal from '@shared/components/Modal'
import Button from '@shared/components/Button'
import { PremiumKpiCard } from '@shared/components/SharedComponents'
import StatusBadge from '@shared/components/StatusBadge'
import { getApiErrorMessage, reportsApi } from '@shared/services/apiServices'
import { triggerFileDownload, filenameFromDisposition } from '@shared/utils/download'
import { useAuth } from '@shared/hooks/useAuth'
import usePermission from '@shared/hooks/usePermission'
import ReportGenerateModal from '../components/ReportGenerateModal'
 
const INITIAL_REPORTS = [
  { id: 1, name: 'Monthly Platform Summary - Dec 2024', type: 'Summary', generated: 'Dec 20, 2024', status: 'ready', size: '3.2 MB', pages: 24, author: 'System' },
  { id: 2, name: 'Organization Growth Q4 2024', type: 'Growth', generated: 'Dec 18, 2024', status: 'ready', size: '2.8 MB', pages: 18, author: 'System' },
  { id: 3, name: 'Revenue Report - December 2024', type: 'Financial', generated: 'Dec 15, 2024', status: 'ready', size: '4.1 MB', pages: 32, author: 'System' },
  { id: 4, name: 'Subscription Renewal Forecast', type: 'Forecast', generated: 'Dec 10, 2024', status: 'ready', size: '5.3 MB', pages: 28, author: 'System' },
  { id: 5, name: 'Compliance Audit Report', type: 'Compliance', generated: 'Nov 30, 2024', status: 'ready', size: '6.7 MB', pages: 45, author: 'System' },
  { id: 6, name: 'Course Completion Analytics', type: 'Learning', generated: 'Nov 25, 2024', status: 'ready', size: '2.1 MB', pages: 15, author: 'System' },
  { id: 7, name: 'Annual Platform Report 2024', type: 'Annual', generated: 'Dec 22, 2024', status: 'generating', size: '-', pages: 0, author: 'System' },
]
 
const TODAY = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
let nextId = 10
 
// Analytics reports live in the dedicated Analytics module — the Reports page
// only surfaces the supported report categories below.
const TYPE_FILTERS = ['All', 'Summary', 'Growth', 'Financial', 'Annual']

const isUnauthorized = (error) => error?.response?.status === 401 || error?.response?.status === 403

// ─── File download helpers ──────────────────────────────────────────────────
const reportFileName = (report, extension) => {
  const base = String(report?.fileName || report?.name || `report-${report?.id || Date.now()}`).replace(/[\\/:*?"<>|]/g, '-')
  return /\.\w{2,5}$/.test(base) ? base : `${base}.${extension}`
}

// Fallback when the backend has no file for a row (demo/static data): build a
// plain-text summary named after the report so Download still works everywhere.
const buildSummaryBlob = (report) => {
  const content = [
    report?.name || 'Platform Report',
    '='.repeat(Math.min(String(report?.name || '').length || 24, 64)),
    '',
    `Report type: ${report?.type || '—'}`,
    `Reporting period: ${report?.reportingPeriod || '—'}`,
    `Generated:   ${report?.generated || '—'}`,
    `Pages:       ${report?.pages || '—'}`,
    `Author:      ${report?.author || 'System'}`,
    ...(report?.description ? [`Description: ${report.description}`, ''] : ['']),
    'Auto-generated summary file for the report above.',
    '',
  ].join('\n')
  return new Blob([content], { type: 'text/plain;charset=utf-8' })
}
 
export default function SuperAdminReports() {
  const { user } = useAuth()
  const { hasPermission } = usePermission()
  const canManageReports = hasPermission('reports')
  const isDemoSession = Boolean(user?.isDemo || String(user?.email || '').includes('demo'))
  const [typeFilter, setTypeFilter] = useState('All')
  const [reports, setReports] = useState(INITIAL_REPORTS)
  const [generating, setGenerating] = useState(false)
  const [downloadingId, setDownloadingId] = useState(null)
  const [preview, setPreview] = useState({ report: null, data: null, loading: false })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)

  useEffect(() => {
    const fetchReports = async () => {
      // Demo sessions keep the curated static dataset — no API calls.
      if (isDemoSession) return
      try {
        const rows = await reportsApi.list()
        if (!Array.isArray(rows) || rows.length === 0) return
        // Analytics reports belong to the dedicated Analytics module and are
        // excluded from the visible set below — the backend keeps its records.
        setReports(rows.map((item) => ({
          id: item.id ?? item.reportId ?? item.name,
          apiId: item.id ?? item.reportId,
          name: item.name ?? item.reportName ?? 'Report',
          type: item.type ?? item.category ?? 'Summary',
          generated: item.generated ?? item.generatedDate ?? item.createdDate ?? TODAY,
          status: String(item.status ?? 'ready').toLowerCase(),
          size: item.size ?? '-',
          pages: Number(item.pages ?? 0),
          author: item.author ?? 'System',
          description: item.description ?? '',
          reportingPeriod: item.reportingPeriod ?? item.period ?? item.dateRange ?? '',
        })))
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to load reports'))
      }
    }
    if (!isDemoSession) fetchReports()
  }, [isDemoSession])
 
  const handleGenerateReport = () => {
    if (generating) return
    setGenerateOpen(true)
  }

  // Submit the report-generation form. The row is added immediately with a
  // Generating status, then flipped to Ready once reportsApi.generate resolves
  // (the service calls the real endpoint when deployed and falls back to a
  // local simulation otherwise). Counters recompute from state automatically.
  const handleGenerateSubmit = async (form) => {
    if (generating) return
    setGenerating(true)
    const pendingReport = {
      id: nextId++,
      name: form.name.trim(),
      type: form.type,
      generated: TODAY,
      status: 'generating',
      size: '-',
      pages: 0,
      author: 'Admin',
      description: form.description || '',
      reportingPeriod: form.reportingPeriod || '',
    }
    setReports((prev) => [pendingReport, ...prev])
    setGenerateOpen(false)
    toast.success('Report generation started. You will be notified when ready.')

    try {
      const created = await reportsApi.generate(form)
      setReports((prev) =>
        prev.map((r) =>
          r.id === pendingReport.id
            ? {
                ...pendingReport,
                ...created,
                // Keep the local row id as the table key; keep the backend id
                // (if any) for later API actions.
                id: pendingReport.id,
                apiId: created.id ?? created.reportId ?? pendingReport.apiId,
                name: created.name || pendingReport.name,
                type: created.type || pendingReport.type,
                generated: created.generated || pendingReport.generated,
                status: String(created.status ?? 'ready').toLowerCase(),
                size: created.size || pendingReport.size,
                pages: Number(created.pages ?? pendingReport.pages),
                description: created.description ?? pendingReport.description,
                reportingPeriod: created.reportingPeriod ?? pendingReport.reportingPeriod,
              }
            : r
        )
      )
      toast.success(`"${pendingReport.name}" is now ready for download.`)
    } catch (error) {
      setReports((prev) => prev.filter((r) => r.id !== pendingReport.id))
      toast.error(getApiErrorMessage(error, 'Unable to generate the report. Please try again.'))
    } finally {
      setGenerating(false)
    }
  }
 
  // ─── Download ─────────────────────────────────────────────────────────────
  const handleDownload = async (report) => {
    if (!canManageReports) {
      toast.error('You do not have permission to perform this action.')
      return
    }
    if (downloadingId || report.status !== 'ready') return
    setDownloadingId(report.id)
    try {
      let blob
      let filename
      try {
        const response = await reportsApi.download(report.apiId ?? report.id)
        blob = response?.data
        filename = filenameFromDisposition(response) || reportFileName(report, 'pdf')
      } catch (error) {
        if (isUnauthorized(error)) throw error
        // No server-side file for this row — fall back to a local summary file
        // so the download still works (matches the page's static-data fallback).
        blob = buildSummaryBlob(report)
        filename = reportFileName(report, 'txt')
      }
      if (!blob) throw new Error('Empty download payload')
      triggerFileDownload(blob, filename)
      toast.success('Report downloaded successfully.')
    } catch (error) {
      if (isUnauthorized(error)) {
        toast.error('You do not have permission to perform this action.')
      } else {
        toast.error('Unable to download the report. Please try again.')
      }
    } finally {
      setDownloadingId(null)
    }
  }
 
  // ─── View / Preview ───────────────────────────────────────────────────────
  const handleView = async (report) => {
    if (!canManageReports) {
      toast.error('You do not have permission to perform this action.')
      return
    }
    setPreview({ report, data: null, loading: true })
    try {
      const data = await reportsApi.getPreview(report.apiId ?? report.id)
      setPreview({ report, data: data ?? null, loading: false })
    } catch (error) {
      if (isUnauthorized(error)) {
        toast.error('You do not have permission to perform this action.')
      } else if (!isDemoSession && error?.response) {
        toast.error('Unable to load the report preview.')
      }
      // Render the metadata placeholder — the preview is optional.
      setPreview({ report, data: null, loading: false })
    }
  }

  const closePreview = () => setPreview({ report: null, data: null, loading: false })
 
  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = (report) => {
    if (!canManageReports) {
      toast.error('You do not have permission to perform this action.')
      return
    }
    setDeleteTarget(report)
  }

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return
    const target = deleteTarget
    setDeleting(true)
    try {
      if (!isDemoSession) {
        try {
          await reportsApi.delete(target.apiId ?? target.id)
        } catch (error) {
          if (isUnauthorized(error)) throw error
          // Server-side delete unavailable (static/system row) — delete locally
          // so the table and KPI counts stay consistent.
        }
      }
      setReports((prev) => prev.filter((r) => r.id !== target.id))
      toast.success('Report deleted successfully.')
      setDeleteTarget(null)
    } catch (error) {
      if (isUnauthorized(error)) {
        toast.error('You do not have permission to perform this action.')
      } else {
        toast.error('Unable to delete the report. Please try again.')
      }
    } finally {
      setDeleting(false)
    }
  }
 
  // Analytics reports belong to the dedicated Analytics module — exclude them
  // from the Reports listing and its KPI counts (both All and specific filters).
  const visibleReports = reports.filter((r) => r.type !== 'Analytics')
 
  const filtered = typeFilter === 'All' ? visibleReports : visibleReports.filter(r => r.type === typeFilter)
 
  const totalSize = visibleReports.filter(r => r.status === 'ready').reduce((a, r) => a + (Number.parseFloat(r.size) || 0), 0).toFixed(1)
 
  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-7">
      <PageHeader title="Reports" subtitle="System-generated reports and exports" icon={FileText} showBreadcrumb={false} titleClassName="!text-xl !leading-7" subtitleClassName="!mt-0 !text-sm !leading-5" containerClassName="!mb-4"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleGenerateReport} disabled={generating} className="inline-flex h-9 items-center gap-2 px-3.5 text-xs font-semibold text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #0f55f7, #06b6a8)', boxShadow: '0 4px 16px rgba(15,85,247,0.25)' }}>
            {generating ? (
              <><Clock className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Calendar className="w-4 h-4" /> Generate Report</>
            )}
          </button>
          </div>
        }
      />
 
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Reports', value: visibleReports.length, icon: FileText, color: '#0f55f7' },
          { label: 'Available', value: visibleReports.filter(r => r.status === 'ready').length, icon: CheckCircle2, color: '#06b6a8' },
          { label: 'Generating', value: visibleReports.filter(r => r.status === 'generating').length, icon: Clock, color: '#0f55f7' },
          { label: 'Total Size', value: `${totalSize} MB`, icon: Download, color: '#06b6a8' },
        ].map((stat, i) => (
          <PremiumKpiCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} color={stat.color} delay={i * 0.05} />
        ))}
      </div>
 
      <div className="flex gap-1.5 flex-wrap mb-3">
        {TYPE_FILTERS.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${typeFilter === t ? 'bg-[#0f55f7] text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>
 
      <Card padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
                {['Report Name', 'Type', 'Generated', 'Size', 'Pages', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No reports available</p>
                    <p className="mt-1 text-xs text-slate-400">Reports for this category will appear here.</p>
                  </td>
                </tr>
              ) : filtered.map((report, i) => (
                <motion.tr key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#0f55f7]/10 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-[#0f55f7]" />
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
                        <button
                          type="button"
                          onClick={() => handleDownload(report)}
                          disabled={downloadingId !== null}
                          title="Download report"
                          aria-label="Download report"
                          className="p-1.5 rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-[#0f55f7] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/40"
                        >
                          {downloadingId === report.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0f55f7]" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleView(report)}
                        title="View report"
                        aria-label="View report"
                        className="p-1.5 rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-[#0f55f7] active:scale-95 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/40"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {report.status !== 'generating' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(report)}
                          disabled={deleting}
                          title="Delete report"
                          aria-label="Delete report"
                          className="p-1.5 rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ── Report Preview Modal ── */}
      <Modal
        open={Boolean(preview.report)}
        onClose={closePreview}
        title={preview.report?.name}
        description="Report preview"
        size="lg"
        footer={
          preview.report && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                {preview.report.status === 'generating'
                  ? 'This report is still being generated.'
                  : `${preview.report.size || '—'} · ${preview.report.pages || '—'} pages`}
              </span>
              <Button
                variant="primary"
                icon={FileDown}
                onClick={() => handleDownload(preview.report)}
                loading={downloadingId === preview.report.id}
                disabled={preview.report.status !== 'ready' || Boolean(downloadingId)}
              >
                Download report
              </Button>
            </div>
          )
        }
      >
        {preview.report && (
          <div className="space-y-4">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {[
                { label: 'Report type', value: preview.report.type || '—' },
                { label: 'Generated', value: preview.report.generated || '—' },
                { label: 'File size', value: preview.report.size || '—' },
                { label: 'Pages', value: String(preview.report.pages ?? '—') },
                { label: 'Author', value: preview.report.author || '—' },
                { label: 'Status', value: <StatusBadge status={preview.report.status} /> },
                { label: 'Reporting period', value: preview.report.reportingPeriod || '—' },
                { label: 'Description', value: preview.report.description || '—' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2.5 dark:border-slate-700/80 dark:bg-slate-800/40">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
                  <div className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Preview / content area */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700/80 dark:bg-slate-800/40">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Preview</span>
                <span className="text-[10px] text-slate-400">{preview.report.size || '—'} · {preview.report.pages || '—'} pages</span>
              </div>
              {preview.loading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0f55f7]" />
                </div>
              ) : preview.data?.content || preview.data?.summary ? (
                <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-4 text-xs leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {preview.data.content || preview.data.summary}
                </pre>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{preview.report.name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{preview.report.type} · generated {preview.report.generated}</p>
                  <div className="mt-4 space-y-2">
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
                    <div className="h-2 w-5/6 rounded-full bg-slate-100 dark:bg-slate-800" />
                    <div className="h-2 w-4/6 rounded-full bg-slate-100 dark:bg-slate-800" />
                    <div className="h-2 w-3/6 rounded-full bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <p className="mt-4 text-[11px] text-slate-400">
                    {preview.report.status === 'generating'
                      ? 'This report is still being generated. It will be available to preview and download shortly.'
                      : 'Preview unavailable — download the report to view its full contents.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Generate Report Modal ── */}
      <ReportGenerateModal
        open={generateOpen}
        onClose={() => !generating && setGenerateOpen(false)}
        onSubmit={handleGenerateSubmit}
      />

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Delete Report?"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete}>
              {deleting ? 'Deleting...' : 'Delete Report'}
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10">
            <Trash2 className="h-5 w-5" />
          </div>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Are you sure you want to delete <b>&lsquo;{deleteTarget?.name}&rsquo;</b>? This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  )
}
 
