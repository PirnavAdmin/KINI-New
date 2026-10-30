import { useMemo, useState } from 'react'
import useAddIntent from '@features/hr/hooks/useAddIntent'
import {
  Package, Laptop, Smartphone, Monitor, Armchair, Camera, Headphones, Plus, Wrench, ShieldCheck, Download,
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
import { exportCSV } from '@features/hr/components/hrExport'
import HRDataTable from '@features/hr/components/HRDataTable'
import DataTable from '@shared/components/DataTable'
import { HRSection, HRStatusBadge } from '@features/hr/components/hrPrimitives'
import { HR_ASSET_STATS, HR_ASSETS, HR_ASSET_MAINTENANCE } from '@features/hr/data/hrWorkforce'

const CATEGORY_ICON = {
  Laptop: Laptop, Mobile: Smartphone, Display: Monitor, Furniture: Armchair,
  Accessory: Headphones, Camera: Camera,
}

const ASSET_BADGE = { assigned: 'active', available: 'success', maintenance: 'warning' }
const MAINTENANCE_BADGE = { 'in-progress': 'warning', scheduled: 'pending', completed: 'success' }

export default function AssetManagement() {
  // KINI HRMS RBAC — assignments, maintenance and exports follow the assets module permissions.
  const { can } = useHrPermissions()
  const [assets, setAssets] = useState(HR_ASSETS)
  const [maintenance, setMaintenance] = useState(HR_ASSET_MAINTENANCE)
  const [formOpen, setFormOpen] = useState(false)
  const [assignRow, setAssignRow] = useState(null)
  const [historyRow, setHistoryRow] = useState(null)
  const [maintenanceOpen, setMaintenanceOpen] = useState(false)
  useAddIntent(() => setFormOpen(true))
  const pageSearch = usePageSearch()
  const filteredAssets = useMemo(() => assets.filter(pageSearch.matches), [assets, pageSearch.matches])

  const columns = [
    { accessor: 'asset', header: 'Asset', sortable: true, minWidth: 220, render: (row) => {
      const Icon = CATEGORY_ICON[row.category] || Package
      return (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6366f1]/10 text-[#6366f1]">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{row.asset}</p>
            <p className="text-[11px] text-slate-400">{row.serial} · {row.category}</p>
          </div>
        </div>
      )
    }},
    { accessor: 'assignedTo', header: 'Assigned To', sortable: true, render: (row) => <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{row.assignedTo}</span> },
    { accessor: 'condition', header: 'Condition', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.condition}</span> },
    { accessor: 'warranty', header: 'Warranty', sortable: true, render: (row) => (
      <span className={`text-xs font-semibold ${row.warranty < '2026-09-01' ? 'text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}>
        {row.warranty}{row.warranty < '2026-09-01' ? ' · expiring' : ''}
      </span>
    )},
    { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={ASSET_BADGE[row.status]} label={row.status} /> },
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 130, render: (row) => (
      <div className="flex items-center gap-1">
        {can('assets', 'view') && (
          <Button
            variant="secondary"
            size="xs"
            onClick={() => (row.status === 'available' ? setAssignRow(row) : setHistoryRow(row))}
          >
            {row.status === 'available' ? 'Assign' : 'History'}
          </Button>
        )}
      </div>
    )},
  ]

  return (
    <HRPage
      moduleId="assets"
      title="Asset Management"
      subtitle="Inventory, assignments, returns, maintenance, warranty and asset history."
      icon={Package}
      lastUpdated="Aug 4, 2026"
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search assets…' }}
      actions={
        <HRQuickActions
          can={can}
          actions={[
            { key: 'add', label: 'Add Asset', icon: Plus, variant: 'primary', permission: ['assets', 'add'], onClick: () => setFormOpen(true) },
            { key: 'maintenance', label: 'Raise Maintenance', icon: Wrench, permission: ['assets', 'edit'], onClick: () => setMaintenanceOpen(true) },
            { key: 'export', label: 'Export', icon: Download, permission: ['assets', 'export'], onClick: () => {
              exportCSV({
                filename: 'asset-register',
                headers: ['Asset', 'Serial', 'Category', 'Assigned To', 'Condition', 'Warranty', 'Status'],
                rows: assets.map((a) => [a.asset, a.serial, a.category, a.assignedTo, a.condition, a.warranty, a.status]),
              })
              toast.success('Asset register exported to Excel')
            } },
          ]}
        />
      }
    >
      <div className="mb-2 grid grid-cols-2 gap-2 lg:grid-cols-3">
        <StatsCard compact icon={Package} value={HR_ASSET_STATS.total} label="Total Assets" accentColor="#6366f1" className="!min-h-[66px] !rounded-xl !p-2.5 shadow-sm" />
        <StatsCard compact icon={Laptop} value={HR_ASSET_STATS.assigned} label="Assigned" accentColor="#0f55f7" className="!min-h-[66px] !rounded-xl !p-2.5 shadow-sm" />
        <StatsCard compact icon={Package} value={HR_ASSET_STATS.available} label="Available" accentColor="#06b6a8" className="!min-h-[66px] !rounded-xl !p-2.5 shadow-sm" />
        <StatsCard compact icon={Wrench} value={HR_ASSET_STATS.underMaintenance} label="In Maintenance" accentColor="#F59E0B" className="!min-h-[66px] !rounded-xl !p-2.5 shadow-sm" />
        <StatsCard compact icon={ShieldCheck} value={HR_ASSET_STATS.expiringWarranty} label="Expiring Warranty" accentColor="#EF4444" className="!min-h-[66px] !rounded-xl !p-2.5 shadow-sm" />
        <StatsCard compact icon={Monitor} value="6" label="Categories" accentColor="#8b5cf6" className="!min-h-[66px] !rounded-xl !p-2.5 shadow-sm" />
      </div>

      {/* Inventory */}
      <HRSection title="Asset Inventory" subtitle={`${HR_ASSETS.length} assets shown · full register available`} icon={Package} padding="p-3">
        <HRDataTable
          columns={columns}
          data={filteredAssets}
          searchable={false}
          pageSize={8}
          exportable={false}
        />
      </HRSection>

      {/* Maintenance */}
      <HRSection title="Maintenance Queue" subtitle="Open repairs and service tickets" icon={Wrench} padding="p-4">
        <DataTable
          columns={[
            { accessor: 'asset', header: 'Asset', sortable: true, minWidth: 200, render: (row) => <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.asset}</span> },
            { accessor: 'issue', header: 'Issue', sortable: true, render: (row) => <span className="text-xs text-slate-600 dark:text-slate-300">{row.issue}</span> },
            { accessor: 'raised', header: 'Raised', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.raised}</span> },
            { accessor: 'vendor', header: 'Vendor', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.vendor}</span> },
            { accessor: 'eta', header: 'ETA', sortable: true, render: (row) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{row.eta}</span> },
            { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={MAINTENANCE_BADGE[row.status]} label={row.status} /> },
          ]}
          data={maintenance}
          searchable={false}
          pageSize={4}
        />
      </HRSection>

      {/* Add asset form */}
      <HREntityForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add Asset"
        subtitle="Register a new asset in the inventory"
        icon={Package}
        accent="#6366f1"
        saveLabel="Add Asset"
        fields={[
          { key: 'asset', label: 'Asset Name', type: 'text', required: true, placeholder: 'e.g. MacBook Pro 14"' },
          { key: 'category', label: 'Category', type: 'select', required: true, options: ['Laptop', 'Mobile', 'Display', 'Furniture', 'Accessory', 'Camera'].map((c) => ({ value: c, label: c })) },
          { key: 'serial', label: 'Serial Number', type: 'text', required: true, placeholder: 'e.g. C02XK3JQH1G5' },
          { key: 'condition', label: 'Condition', type: 'select', required: true, defaultValue: 'New', options: ['New', 'Good', 'Fair', 'Damaged'].map((c) => ({ value: c, label: c })) },
          { key: 'warranty', label: 'Warranty Until', type: 'date', required: true },
        ]}
        onSave={(values) => {
          const id = `AST-${String(assets.length + 1).padStart(3, '0')}`
          setAssets((prev) => [{
            id,
            asset: values.asset,
            serial: values.serial,
            category: values.category,
            assignedTo: '—',
            condition: values.condition,
            warranty: values.warranty,
            status: 'available',
          }, ...prev])
          toast.success(`${values.asset} added to inventory`)
        }}
      />

      {/* Assign asset form */}
      <HREntityForm
        open={Boolean(assignRow)}
        onClose={() => setAssignRow(null)}
        title="Assign Asset"
        subtitle={assignRow ? `Assigning ${assignRow.asset}` : undefined}
        icon={Laptop}
        accent="#06b6a8"
        saveLabel="Assign"
        fields={[
          { key: 'employee', label: 'Employee', type: 'text', required: true, placeholder: 'Employee name' },
          { key: 'assignedBy', label: 'Assigned By', type: 'text', required: true, placeholder: 'Your name' },
        ]}
        onSave={(values) => {
          setAssets((prev) => prev.map((a) => (a.id === assignRow.id ? { ...a, assignedTo: values.employee, status: 'assigned' } : a)))
          toast.success(`${assignRow.asset} assigned to ${values.employee}`)
        }}
      />

      {/* Maintenance form */}
      <HREntityForm
        open={maintenanceOpen}
        onClose={() => setMaintenanceOpen(false)}
        title="Raise Maintenance"
        subtitle="Open a repair ticket for an asset"
        icon={Wrench}
        accent="#F59E0B"
        saveLabel="Raise Request"
        fields={[
          { key: 'asset', label: 'Asset', type: 'select', required: true, options: assets.map((a) => ({ value: a.asset, label: a.asset })) },
          { key: 'issue', label: 'Issue', type: 'textarea', required: true, placeholder: 'Describe the problem' },
          { key: 'vendor', label: 'Vendor', type: 'text', required: true, placeholder: 'Service vendor' },
          { key: 'eta', label: 'Estimated Fix (ETA)', type: 'text', required: true, placeholder: 'e.g. Aug 12' },
        ]}
        onSave={(values) => {
          const id = `MNT-${String(maintenance.length + 1).padStart(2, '0')}`
          setMaintenance((prev) => [{ id, ...values, raised: 'Aug 4, 2026', status: 'in-progress' }, ...prev])
          setAssets((prev) => prev.map((a) => (a.asset === values.asset ? { ...a, status: 'maintenance' } : a)))
          toast.success(`Maintenance raised for ${values.asset}`)
        }}
      />

      {/* Asset history drawer */}
      <HRDrawer
        open={Boolean(historyRow)}
        onClose={() => setHistoryRow(null)}
        title={historyRow?.asset || 'Asset History'}
        subtitle={`${historyRow?.serial} · ${historyRow?.category}`}
        icon={Package}
        accent="#6366f1"
      >
        {historyRow && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Status', historyRow.status],
                ['Assigned To', historyRow.assignedTo],
                ['Condition', historyRow.condition],
                ['Warranty', `${historyRow.warranty}${historyRow.warranty < '2026-09-01' ? ' · expiring' : ''}`],
                ['Serial', historyRow.serial],
                ['Category', historyRow.category],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
                  <p className="mt-0.5 truncate text-xs font-bold text-slate-800 dark:text-slate-200">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 text-xs leading-5 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
              Full assignment history (issues, transfers, returns) syncs here when the asset register is connected
              to the maintenance queue.
            </div>
          </div>
        )}
      </HRDrawer>
    </HRPage>
  )
}
