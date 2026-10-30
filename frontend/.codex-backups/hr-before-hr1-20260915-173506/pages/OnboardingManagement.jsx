import { useMemo, useState } from 'react'
import useAddIntent from '@features/hr/hooks/useAddIntent'
import { motion } from 'framer-motion'
import {
  UserPlus, Users2, ClipboardList, CheckCircle2, Package, ArrowRight, CalendarDays,
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
import HRDataTable from '@features/hr/components/HRDataTable'
import { HRSection, HRAvatar, HRStatusBadge, HRProgressBar } from '@features/hr/components/hrPrimitives'
import { HR_ONBOARDING, HR_ONBOARDING_STAGES, HR_WELCOME_KIT } from '@features/hr/data/hrTalent'

const STAGE_BADGE = {
  pending: 'pending', documents: 'active', verification: 'warning',
  approval: 'active', activation: 'success', welcome: 'success',
}

export default function OnboardingManagement() {
  // KINI HRMS RBAC — new hires, stage advances and exports follow the onboarding module permissions.
  const { can } = useHrPermissions()
  const [onboarding, setOnboarding] = useState(HR_ONBOARDING)
  const [formOpen, setFormOpen] = useState(false)
  const [kitOpen, setKitOpen] = useState(false)
  const [selectedHire, setSelectedHire] = useState(null)
  useAddIntent(() => setFormOpen(true))
  const pageSearch = usePageSearch()
  const filteredOnboarding = useMemo(() => onboarding.filter(pageSearch.matches), [onboarding, pageSearch.matches])

  const STAGE_KEYS = HR_ONBOARDING_STAGES.map((s) => s.key)
  const advanceStage = (row) => {
    const idx = STAGE_KEYS.indexOf(row.stage)
    const next = STAGE_KEYS[Math.min(idx + 1, STAGE_KEYS.length - 1)]
    const nextProgress = next === 'welcome' ? 100 : Math.min(row.progress + 20, 90)
    setOnboarding((prev) => prev.map((o) => (o.id === row.id ? { ...o, stage: next, progress: nextProgress } : o)))
    toast.success(`${row.candidate} advanced to ${HR_ONBOARDING_STAGES.find((s) => s.key === next)?.label}`)
  }

  // Live pipeline counts — derived from the working state so advancing a hire
  // immediately updates the stage cards (same pattern as the stats grid).
  const stageCounts = HR_ONBOARDING_STAGES.map((stage) => ({
    ...stage,
    count: onboarding.filter((o) => o.stage === stage.key).length,
  }))

  const columns = [
    {
      accessor: 'candidate', header: 'Candidate', sortable: true, minWidth: 220,
      render: (row) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setSelectedHire(row) }}
          className="flex items-center gap-3 text-left transition-opacity hover:opacity-80"
          aria-label={`View onboarding details of ${row.candidate}`}
        >
          <HRAvatar name={row.candidate} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 transition-colors hover:text-[#0f55f7] dark:text-white dark:hover:text-blue-300">{row.candidate}</p>
            <p className="truncate text-[11px] text-slate-400">{row.role} · {row.department}</p>
          </div>
        </button>
      ),
    },
    { accessor: 'stage', header: 'Stage', sortable: true, render: (row) => (
      <HRStatusBadge status={STAGE_BADGE[row.stage]} label={HR_ONBOARDING_STAGES.find((s) => s.key === row.stage)?.label || row.stage} />
    )},
    { accessor: 'progress', header: 'Progress', sortable: true, render: (row) => (
      <div className="w-28"><HRProgressBar value={row.progress} showLabel color="#06b6a8" /></div>
    )},
    { accessor: 'joining', header: 'Joining Date', sortable: true, render: (row) => (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />{row.joining}
      </span>
    )},
    { accessor: 'buddy', header: 'Buddy', sortable: true, render: (row) => (
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{row.buddy}</span>
    )},
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 110, render: (row) => (
      can('onboarding', 'edit') && <Button variant="secondary" size="xs" icon={ArrowRight} onClick={() => advanceStage(row)}>Advance</Button>
    )},
  ]

  return (
    <HRPage
      moduleId="onboarding"
      title="Onboarding"
      subtitle="Hire-to-welcome-kit pipeline: documents, verification, approval, activation."
      icon={UserPlus}
      lastUpdated="Aug 4, 2026"
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search onboarding…' }}
      actions={
        <HRQuickActions
          can={can}
          actions={[
            { key: 'add', label: 'Add New Hire', icon: UserPlus, variant: 'primary', permission: ['onboarding', 'add'], onClick: () => setFormOpen(true) },
            { key: 'kit', label: 'Welcome Kit', icon: Package, permission: ['onboarding', 'view'], onClick: () => setKitOpen(true) },
          ]}
        />
      }
    >
      <div className="mb-2 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatsCard compact icon={Users2} value={HR_ONBOARDING.length} label="Active Onboardings" accentColor="#0f55f7" />
        <StatsCard compact icon={ClipboardList} value={HR_ONBOARDING.filter((o) => o.progress < 100).length} label="In Progress" accentColor="#F59E0B" />
        <StatsCard compact icon={CheckCircle2} value={HR_ONBOARDING.filter((o) => o.progress === 100).length} label="Completed" accentColor="#06b6a8" />
        <StatsCard compact icon={CalendarDays} value="Aug 10" label="Next Joining" accentColor="#8b5cf6" />
      </div>

      {/* Pipeline stages */}
      <HRSection title="Onboarding Pipeline" subtitle="6-stage workflow tracker" icon={UserPlus} padding="p-3.5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {stageCounts.map((stage, i) => (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="relative rounded-xl border border-slate-200/90 bg-slate-50/40 p-2.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-800/30"
            >
              <span
                className="mx-auto flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${stage.color}, ${stage.color}bb)` }}
              >
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <p className="mt-1.5 text-lg font-extrabold text-slate-900 dark:text-white">{stage.count}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{stage.label}</p>
              {i < stageCounts.length - 1 && (
                <span className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-slate-300 dark:text-slate-600 lg:block">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </HRSection>

      {/* Table + welcome kit */}
      <div className="mt-2 grid grid-cols-1 gap-2.5 lg:grid-cols-3">
        <HRSection title="New Hires" subtitle="All active onboarding records" icon={Users2} className="lg:col-span-2" padding="p-4">
          <HRDataTable
            columns={columns}
            data={filteredOnboarding}
            searchable={false}
            pageSize={6}
            exportFileName="onboarding"
            exportTitle="Onboarding Pipeline"
            onRowClick={(row) => setSelectedHire(row)}
            exportable={can('onboarding', 'export')}
          />
        </HRSection>

        <HRSection title="Welcome Kit" subtitle="Assets ready for new joiners" icon={Package} padding="p-4">
          <ul className="space-y-2">
            {HR_WELCOME_KIT.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{item.item}</p>
                  <p className="text-[10px] text-slate-400">Owner · {item.owner}</p>
                </div>
                <HRStatusBadge status={item.status === 'ready' ? 'success' : 'pending'} label={item.status === 'ready' ? 'Ready' : 'Pending'} />
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 p-3.5">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Kit Readiness</p>
              <p className="text-xs font-extrabold text-[#0f55f7]">{Math.round((HR_WELCOME_KIT.filter((k) => k.status === 'ready').length / HR_WELCOME_KIT.length) * 100)}%</p>
            </div>
            <HRProgressBar value={Math.round((HR_WELCOME_KIT.filter((k) => k.status === 'ready').length / HR_WELCOME_KIT.length) * 100)} color="#06b6a8" />
          </div>
        </HRSection>
      </div>

      {/* Add new hire form */}
      <HREntityForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add New Hire"
        subtitle="Register a candidate into the onboarding pipeline"
        icon={UserPlus}
        accent="#06b6a8"
        saveLabel="Add New Hire"
        fields={[
          { key: 'candidate', label: 'Candidate Name', type: 'text', required: true, placeholder: 'Full name' },
          { key: 'role', label: 'Role', type: 'text', required: true, placeholder: 'e.g. Software Engineer' },
          { key: 'department', label: 'Department', type: 'text', required: true, placeholder: 'e.g. Engineering' },
          { key: 'joining', label: 'Joining Date', type: 'date', required: true },
          { key: 'buddy', label: 'Buddy', type: 'text', placeholder: 'Buddy / onboarding buddy' },
        ]}
        onSave={(values) => {
          const id = `OB-${String(onboarding.length + 1).padStart(2, '0')}`
          setOnboarding((prev) => [{
            id,
            candidate: values.candidate,
            role: values.role,
            department: values.department,
            stage: 'pending',
            progress: 0,
            joining: values.joining,
            buddy: values.buddy || '—',
          }, ...prev])
          toast.success(`${values.candidate} added to onboarding`)
        }}
      />

      {/* Candidate onboarding detail drawer */}
      <HRDrawer
        open={Boolean(selectedHire)}
        onClose={() => setSelectedHire(null)}
        title={selectedHire?.candidate || 'New Hire'}
        subtitle={`${selectedHire?.role} · ${selectedHire?.department}`}
        icon={UserPlus}
        accent="#06b6a8"
        footer={
          <div className="flex items-center justify-between gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedHire(null)}>Close</Button>
            {can('onboarding', 'edit') && selectedHire?.stage !== 'welcome' && (
              <Button variant="primary" size="sm" icon={ArrowRight} onClick={() => { advanceStage(selectedHire); setSelectedHire(null) }}>Advance Stage</Button>
            )}
          </div>
        }
      >
        {selectedHire && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#06b6a8]/10 to-[#0f55f7]/10 p-4">
              <HRAvatar name={selectedHire.candidate} size="xl" />
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold text-slate-900 dark:text-white">{selectedHire.candidate}</p>
                <p className="text-xs text-slate-500">{selectedHire.role} · {selectedHire.department}</p>
                <HRStatusBadge
                  status={STAGE_BADGE[selectedHire.stage]}
                  label={HR_ONBOARDING_STAGES.find((s) => s.key === selectedHire.stage)?.label || selectedHire.stage}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ['Joining Date', selectedHire.joining],
                ['Buddy', selectedHire.buddy],
                ['Stage', HR_ONBOARDING_STAGES.find((s) => s.key === selectedHire.stage)?.label || selectedHire.stage],
                ['Progress', `${selectedHire.progress}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
                  <p className="mt-0.5 truncate text-xs font-bold text-slate-800 dark:text-slate-200">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Onboarding Progress</p>
              <HRProgressBar value={selectedHire.progress} showLabel color="#06b6a8" />
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Pipeline</p>
              <div className="flex flex-wrap gap-1.5">
                {HR_ONBOARDING_STAGES.map((stage) => {
                  const reached = HR_ONBOARDING_STAGES.findIndex((s) => s.key === selectedHire.stage) >= HR_ONBOARDING_STAGES.findIndex((s) => s.key === stage.key)
                  return (
                    <span
                      key={stage.key}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        reached
                          ? 'bg-[#06b6a8]/10 text-[#06b6a8]'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                      }`}
                    >
                      {stage.label}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </HRDrawer>

      {/* Welcome kit drawer */}
      <HRDrawer
        open={kitOpen}
        onClose={() => setKitOpen(false)}
        title="Welcome Kit"
        subtitle="Assets and access ready for new joiners"
        icon={Package}
        accent="#06b6a8"
      >
        <div className="space-y-4">
          <ul className="space-y-2">
            {HR_WELCOME_KIT.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3.5 py-3 dark:border-slate-800">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{item.item}</p>
                  <p className="text-[10px] text-slate-400">Owner · {item.owner}</p>
                </div>
                <HRStatusBadge status={item.status === 'ready' ? 'success' : 'pending'} label={item.status === 'ready' ? 'Ready' : 'Pending'} />
              </li>
            ))}
          </ul>
          <div className="rounded-2xl bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 p-4">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Kit Readiness</p>
            <p className="mt-1 text-2xl font-extrabold text-[#0f55f7]">
              {Math.round((HR_WELCOME_KIT.filter((k) => k.status === 'ready').length / HR_WELCOME_KIT.length) * 100)}%
            </p>
            <p className="mt-1 text-[11px] text-slate-500">Ready items ship automatically on the joining date.</p>
          </div>
        </div>
      </HRDrawer>
    </HRPage>
  )
}
