import { Download, FileSpreadsheet, Inbox, Loader2, Mic, Send, Sparkles, Trash2, Upload, X } from 'lucide-react'
import Modal from '@shared/components/Modal'
import EmptyState from '@shared/components/EmptyState'
import { CardSkeleton } from '@shared/ui/Skeleton'
import { TinyButton } from './LiveClassPrimitives'

const inputClass = 'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#0f55f7] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100'
const labelClass = 'block space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300'

// Reads only fields the /dashboard response actually sends — never invents a
// stat. A field this deployment's dashboard doesn't return simply isn't
// shown, instead of rendering a fabricated 0.
const DASHBOARD_STAT_FIELDS = [
  { label: 'Total', keys: ['totalStudents', 'TotalStudents', 'total', 'Total', 'totalCount'] },
  { label: 'Present', keys: ['present', 'Present', 'presentCount', 'PresentCount', 'totalPresent'] },
  { label: 'Absent', keys: ['absent', 'Absent', 'absentCount', 'AbsentCount', 'totalAbsent'] },
  { label: 'Late', keys: ['late', 'Late', 'lateCount', 'LateCount'] },
  { label: 'Pending', keys: ['pending', 'Pending', 'pendingCount', 'PendingCount', 'notMarked'] },
  { label: 'Attendance %', keys: ['attendancePercentage', 'AttendancePercentage', 'percentage', 'Percentage', 'attendanceRate'], suffix: '%' },
];

const pickDashboardStats = (dashboard) => {
  if (!dashboard || typeof dashboard !== 'object') return [];
  return DASHBOARD_STAT_FIELDS
    .map(({ label, keys, suffix }) => {
      const key = keys.find((candidate) => dashboard[candidate] !== undefined && dashboard[candidate] !== null);
      if (!key) return null;
      return { label, value: `${dashboard[key]}${suffix || ''}` };
    })
    .filter(Boolean);
};

export function AttendanceModal({ open, onClose, loading, rows, dashboard, edits, onEditChange, saving, onSubmit, generating, onGenerate, exporting, onExport }) {
  const stats = pickDashboardStats(dashboard);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Attendance"
      description="Edit attendance status for the selected live class."
      size="xl"
      footer={(
        <div className="flex items-center justify-end gap-3">
          <TinyButton variant="secondary" icon={X} onClick={onClose}>Close</TinyButton>
          <TinyButton variant="primary" icon={saving ? Loader2 : Send} disabled={saving} onClick={onSubmit}>{saving ? 'Saving...' : 'Save Attendance'}</TinyButton>
        </div>
      )}
    >
      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        <TinyButton
          variant="secondary"
          icon={generating ? Loader2 : Sparkles}
          disabled={generating}
          onClick={onGenerate}
        >
          {generating ? 'Generating...' : 'Generate from Join Logs'}
        </TinyButton>
        <TinyButton
          variant="secondary"
          icon={exporting === 'pdf' ? Loader2 : Download}
          disabled={Boolean(exporting)}
          onClick={() => onExport('pdf')}
        >
          {exporting === 'pdf' ? 'Exporting...' : 'PDF Report'}
        </TinyButton>
        <TinyButton
          variant="secondary"
          icon={exporting === 'excel' ? Loader2 : FileSpreadsheet}
          disabled={Boolean(exporting)}
          onClick={() => onExport('excel')}
        >
          {exporting === 'excel' ? 'Exporting...' : 'Excel Report'}
        </TinyButton>
      </div>
      {stats.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-slate-200/70 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 text-xs">
              <span className="text-slate-400 font-medium">{stat.label}:</span>{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{stat.value}</span>
            </div>
          ))}
        </div>
      )}
      {loading ? (
        <CardSkeleton count={2} />
      ) : rows.length === 0 ? (
        <EmptyState compact title="No attendance data" description="Attendance entries will appear here once students join the class, or use Generate from Join Logs." icon={Inbox} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/70 dark:border-slate-700/60">
          <div className="grid grid-cols-[1.4fr_1.2fr_1fr_0.8fr] gap-2 border-b border-slate-200/70 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400 dark:border-slate-700/60 dark:bg-slate-900/90">
            <span>Student</span>
            <span>Email</span>
            <span>Join Time</span>
            <span>Status</span>
          </div>
          <div className="max-h-[50vh] overflow-y-auto">
            {rows.map((row) => (
              <div key={row.id} className="grid grid-cols-[1.4fr_1.2fr_1fr_0.8fr] gap-2 border-b border-slate-100 px-3 py-2 last:border-0 dark:border-slate-800/60">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{row.name}</p>
                  <p className="truncate text-[13px] text-slate-400">Duration: {row.durationLabel}</p>
                </div>
                <p className="truncate text-sm text-slate-600 dark:text-slate-300">{row.email}</p>
                <p className="truncate text-sm text-slate-600 dark:text-slate-300">{row.joinedAtLabel}</p>
                <select
                  value={edits[row.studentId] ?? row.status}
                  onChange={(event) => onEditChange(row.studentId, event.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#0f55f7] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                >
                  {['present', 'late', 'absent'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}

export function PdfUploadModal({ open, onClose, form, onFormChange, saving, onSubmit }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload Study Material"
      description="Attach a PDF or study note for the selected class."
      size="lg"
      footer={(
        <div className="flex items-center justify-end gap-3">
          <TinyButton variant="secondary" icon={X} onClick={onClose}>Cancel</TinyButton>
          <TinyButton variant="primary" icon={saving ? Loader2 : Upload} disabled={saving || !form.file} onClick={onSubmit}>{saving ? 'Uploading...' : 'Upload PDF'}</TinyButton>
        </div>
      )}
    >
      <div className="space-y-4">
        <label className={labelClass}>
          <span>Title</span>
          <input value={form.title} onChange={(event) => onFormChange({ title: event.target.value })} className={inputClass} placeholder="Study notes title" />
        </label>
        <label className={labelClass}>
          <span>File</span>
          <input type="file" accept="application/pdf" onChange={(event) => onFormChange({ file: event.target.files?.[0] || null })} className="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#0f55f7] file:px-3 file:py-1.5 file:text-white hover:border-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" />
        </label>
      </div>
    </Modal>
  )
}

export function RecordingUploadModal({ open, onClose, form, onFormChange, saving, onSubmit }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload Recording"
      description="Attach a recording link from YouTube, Zoom, Google Drive, or Vimeo."
      size="lg"
      footer={(
        <div className="flex items-center justify-end gap-3">
          <TinyButton variant="secondary" icon={X} onClick={onClose}>Cancel</TinyButton>
          <TinyButton variant="primary" icon={saving ? Loader2 : Mic} disabled={saving || !form.url} onClick={onSubmit}>{saving ? 'Saving...' : 'Save Recording'}</TinyButton>
        </div>
      )}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className={`${labelClass} md:col-span-2`}>
          <span>Source</span>
          <select value={form.source} onChange={(event) => onFormChange({ source: event.target.value })} className={inputClass}>
            {['youtube', 'zoom', 'google-drive', 'vimeo'].map((source) => <option key={source} value={source}>{source}</option>)}
          </select>
        </label>
        <label className={`${labelClass} md:col-span-2`}>
          <span>Recording URL</span>
          <input value={form.url} onChange={(event) => onFormChange({ url: event.target.value })} className={inputClass} placeholder="https://..." />
        </label>
        <label className={`${labelClass} md:col-span-2`}>
          <span>Title</span>
          <input value={form.title} onChange={(event) => onFormChange({ title: event.target.value })} className={inputClass} placeholder="Recording title" />
        </label>
        <label className={`${labelClass} md:col-span-2`}>
          <span>Notes</span>
          <textarea rows={3} value={form.notes} onChange={(event) => onFormChange({ notes: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0f55f7] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Optional notes" />
        </label>
      </div>
    </Modal>
  )
}

export function DeleteConfirmModal({ open, onClose, target, saving, onSubmit }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Live Class"
      description="This will permanently remove the live class from the schedule."
      size="sm"
      footer={(
        <div className="flex items-center justify-end gap-3">
          <TinyButton variant="secondary" icon={X} onClick={onClose}>Cancel</TinyButton>
          <TinyButton variant="danger" icon={saving ? Loader2 : Trash2} disabled={saving} onClick={onSubmit}>{saving ? 'Deleting...' : 'Delete'}</TinyButton>
        </div>
      )}
    >
      <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
        Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{target?.title}</strong>? This action can not be undone.
      </p>
    </Modal>
  )
}

export function CancelClassModal({ open, onClose, target, reason, onReasonChange, saving, onSubmit }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancel Live Class"
      description="Provide a cancellation reason before updating the class status."
      size="md"
      footer={(
        <div className="flex items-center justify-end gap-3">
          <TinyButton variant="secondary" icon={X} onClick={onClose}>Close</TinyButton>
          <TinyButton variant="primary" icon={saving ? Loader2 : Trash2} disabled={saving || !reason.trim()} onClick={onSubmit}>{saving ? 'Cancelling...' : 'Cancel Class'}</TinyButton>
        </div>
      )}
    >
      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">You are cancelling <strong className="text-slate-900 dark:text-white">{target?.title}</strong>.</p>
        <label className={labelClass}>
          <span>Reason</span>
          <textarea rows={3} value={reason} onChange={(event) => onReasonChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0f55f7] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Reason for cancelling this class" />
        </label>
      </div>
    </Modal>
  )
}
