import { useMemo, useRef, useState } from 'react'
import useAddIntent from '@features/hr/hooks/useAddIntent'
import {
  FolderOpen, Upload, FileText, ShieldCheck, AlertTriangle, Download, History, CheckCircle2, Clock3,
} from 'lucide-react'
import { toast } from 'sonner'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import StatsCard from '@shared/components/StatsCard'
import usePageSearch from '@features/hr/hooks/usePageSearch'
import Button from '@shared/components/Button'
import HRPage from '@features/hr/components/HRPage'
import HRQuickActions from '@features/hr/components/HRQuickActions'
import HREntityForm from '@features/hr/components/HREntityForm'
import HRDrawer from '@features/hr/components/HRDrawer'
import { exportPDF } from '@features/hr/components/hrExport'
import HRTimeline from '@features/hr/components/HRTimeline'
import HRDataTable from '@features/hr/components/HRDataTable'
import { HRSection, HRAvatar, HRStatusBadge } from '@features/hr/components/hrPrimitives'
import { HR_DOCUMENTS, HR_DOC_AUDIT } from '@features/hr/data/hrWorkforce'
import { documentCategoryForType } from '@features/hr/constants/hrPermissions'

const DOC_BADGE = { verified: 'success', pending: 'pending', expiring: 'warning', rejected: 'danger' }
const DOCUMENT_TYPE_OPTIONS = ['PAN Card', 'Aadhaar', 'Passport', 'Degree Certificate', 'Offer Letter', 'Joining Form', 'Pay Slip', 'Relieving Letter', 'Visa / Work Permit', 'Address Proof']

export default function DocumentManagement() {
  // KINI HRMS RBAC — uploads, verification and exports follow the documents module permissions.
  const { can, canAccessDocumentCategory } = useHrPermissions()
  const [docs, setDocs] = useState(HR_DOCUMENTS)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [viewRow, setViewRow] = useState(null)
  const [verifyOpen, setVerifyOpen] = useState(false)
  const registerRef = useRef(null)
  useAddIntent(() => setUploadOpen(true))
  const pageSearch = usePageSearch()
  const visibleDocs = useMemo(
    () => docs.filter((doc) => canAccessDocumentCategory(documentCategoryForType(doc.type))),
    [docs, canAccessDocumentCategory],
  )
  const documentTypeOptions = DOCUMENT_TYPE_OPTIONS
    .filter((type) => canAccessDocumentCategory(documentCategoryForType(type)))
    .map((type) => ({ value: type, label: type }))
  const filteredDocs = useMemo(() => visibleDocs.filter(pageSearch.matches), [visibleDocs, pageSearch.matches])
  const focusRegister = (search = '') => {
    pageSearch.setSearch(search)
    window.requestAnimationFrame(() => registerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const columns = [
    {
      accessor: 'employee', header: 'Employee', sortable: true, minWidth: 180,
      render: (row) => (
        <div className="flex items-center gap-3">
          <HRAvatar name={row.employee} size="sm" />
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.employee}</span>
        </div>
      ),
    },
    { accessor: 'type', header: 'Document', sortable: true, minWidth: 180, render: (row) => (
      <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
        <FileText className="h-3.5 w-3.5 text-slate-400" />{row.type}
      </span>
    )},
    { accessor: 'uploaded', header: 'Uploaded', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.uploaded}</span> },
    { accessor: 'expires', header: 'Expires', sortable: true, render: (row) => (
      row.expires === '—'
        ? <span className="text-xs text-slate-400">—</span>
        : <span className={`text-xs font-semibold ${row.status === 'expiring' ? 'text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}>{row.expires}</span>
    )},
    { accessor: 'size', header: 'Size', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.size}</span> },
    { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={DOC_BADGE[row.status]} label={row.status} /> },
    { accessor: 'verifiedBy', header: 'Verified By', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.verifiedBy || '—'}</span> },
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 100, render: (row) => (
      can('documents', 'view') && <Button variant="secondary" size="xs" icon={Download} onClick={() => setViewRow(row)}>View</Button>
    )},
  ]

  const expiringCount = docs.filter((d) => d.status === 'expiring').length

  return (
    <HRPage
      moduleId="documents"
      title="Employee Documents"
      subtitle="Uploads, verification, expiry alerts, timelines and audit history."
      icon={FolderOpen}
      lastUpdated="Aug 4, 2026"
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search documents…' }}
      actions={
        <HRQuickActions
          can={can}
          actions={[
            { key: 'upload', label: 'Upload Document', icon: Upload, variant: 'primary', permission: ['documents', 'add'], onClick: () => setUploadOpen(true) },
            { key: 'verify', label: 'Verify Queue', icon: ShieldCheck, permission: ['documents', 'edit'], onClick: () => setVerifyOpen(true) },
          ]}
        />
      }
    >
      <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatsCard compact icon={FolderOpen} value={visibleDocs.length} label="Documents" accentColor="#0f55f7" onClick={() => focusRegister()} />
        <StatsCard compact icon={CheckCircle2} value={visibleDocs.filter((d) => d.status === 'verified').length} label="Verified" accentColor="#06b6a8" onClick={() => focusRegister('verified')} />
        <StatsCard compact icon={Clock3} value={visibleDocs.filter((d) => d.status === 'pending' || d.status === 'rejected').length} label="Action Needed" accentColor="#F59E0B" onClick={() => setVerifyOpen(true)} />
        <StatsCard compact icon={AlertTriangle} value={expiringCount} label="Expiry Alerts" accentColor="#EF4444" onClick={() => focusRegister('expiring')} />
      </div>

      <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-10">
        {/* Documents table */}
        <div ref={registerRef} className="scroll-mt-4 lg:col-span-7">
          <HRSection title="Document Register" subtitle="All employee documents" icon={FileText} className="h-full" padding="p-3">
          <HRDataTable
            columns={columns}
            data={filteredDocs}
            searchable={false}
            pageSize={8}
            exportFileName="employee-documents"
            exportTitle="Employee Documents"
            exportable={can('documents', 'export')}
          />
          </HRSection>
        </div>

        {/* Audit trail */}
        <HRSection title="Audit History" subtitle="Upload, verify and reject trail" icon={History} className="lg:col-span-3" padding="p-3">
          <HRTimeline
            items={HR_DOC_AUDIT.map((audit) => ({
              date: audit.at,
              title: `${audit.action} — ${audit.doc}`,
              desc: `${audit.by} · IP ${audit.ip}`,
              type: audit.action === 'Verified' ? 'approval' : audit.action === 'Rejected' ? 'notice' : 'document',
            }))}
          />
        </HRSection>
      </div>

      {/* Upload document form */}
      <HREntityForm
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Document"
        subtitle="Add a document to the employee register"
        icon={Upload}
        accent="#0f55f7"
        saveLabel="Upload"
        fields={[
          { key: 'employee', label: 'Employee', type: 'text', required: true, placeholder: 'Employee name' },
          { key: 'type', label: 'Document Type', type: 'select', required: true, options: documentTypeOptions },
          { key: 'uploaded', label: 'Uploaded On', type: 'date', required: true },
          { key: 'expires', label: 'Expiry Date', type: 'date', hint: 'Leave blank for documents that never expire' },
          { key: 'size', label: 'File Size', type: 'text', defaultValue: '—', placeholder: 'e.g. 1.2 MB' },
        ]}
        onSave={(values) => {
          const id = `DOC-${String(docs.length + 1).padStart(3, '0')}`
          setDocs((prev) => [{
            id,
            employee: values.employee,
            type: values.type,
            uploaded: values.uploaded,
            expires: values.expires || '—',
            size: values.size || '—',
            status: 'pending',
            verifiedBy: '',
          }, ...prev])
          toast.success(`${values.type} uploaded for ${values.employee}`)
        }}
      />

      {/* Verify queue drawer */}
      <HRDrawer
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        title="Verify Queue"
        subtitle="Documents awaiting verification"
        icon={ShieldCheck}
        accent="#F59E0B"
        width="max-w-[560px]"
      >
        {docs.filter((d) => d.status === 'pending').length === 0 ? (
          <div className="rounded-xl bg-emerald-50 px-4 py-6 text-center text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            All documents verified — nothing pending.
          </div>
        ) : (
          <ul className="space-y-2.5">
            {docs.filter((d) => d.status === 'pending').map((doc) => (
              <li key={doc.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3.5 py-3 dark:border-slate-800">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{doc.type}</p>
                  <p className="truncate text-[11px] text-slate-400">{doc.employee} · uploaded {doc.uploaded}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button variant="secondary" size="xs" onClick={() => {
                    setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: 'rejected' } : d)))
                    toast.success(`${doc.type} rejected`)
                  }}>Reject</Button>
                  <Button variant="primary" size="xs" onClick={() => {
                    setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: 'verified', verifiedBy: 'You' } : d)))
                    toast.success(`${doc.type} verified`)
                  }}>Verify</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </HRDrawer>

      {/* Document detail drawer */}
      <HRDrawer
        open={Boolean(viewRow)}
        onClose={() => setViewRow(null)}
        title={viewRow?.type || 'Document'}
        subtitle={viewRow?.employee}
        icon={FileText}
        accent="#0f55f7"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" icon={Download} onClick={() => {
              if (!viewRow) return
              exportPDF({
                filename: `${viewRow.type.replace(/\s+/g, '-').toLowerCase()}-${viewRow.employee.replace(/\s+/g, '-').toLowerCase()}`,
                title: viewRow.type,
                headers: ['Employee', 'Type', 'Uploaded', 'Expires', 'Size', 'Status', 'Verified By'],
                rows: [[viewRow.employee, viewRow.type, viewRow.uploaded, viewRow.expires, viewRow.size, viewRow.status, viewRow.verifiedBy || '—']],
                subtitle: `Kini HRMS · Document register`,
              })
              toast.success(`Downloading ${viewRow.type}…`)
            }}>Download</Button>
            {can('documents', 'edit') && viewRow?.status === 'pending' && (
              <Button variant="primary" size="sm" icon={ShieldCheck} onClick={() => {
                setDocs((prev) => prev.map((d) => (d.id === viewRow.id ? { ...d, status: 'verified', verifiedBy: 'You' } : d)))
                toast.success(`${viewRow.type} verified`)
                setViewRow(null)
              }}>Verify</Button>
            )}
          </div>
        }
      >
        {viewRow && (
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Employee', viewRow.employee],
              ['Type', viewRow.type],
              ['Uploaded', viewRow.uploaded],
              ['Expires', viewRow.expires],
              ['Size', viewRow.size],
              ['Status', viewRow.status],
              ['Verified By', viewRow.verifiedBy || '—'],
              ['ID', viewRow.id],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
                <p className="mt-0.5 truncate text-xs font-bold text-slate-800 dark:text-slate-200">{value}</p>
              </div>
            ))}
          </div>
        )}
      </HRDrawer>
    </HRPage>
  )
}
