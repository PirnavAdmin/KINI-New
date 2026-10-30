import { useMemo, useRef, useState } from 'react'
import useAddIntent from '@features/hr/hooks/useAddIntent'
import { motion } from 'framer-motion'
import {
  Briefcase, Users2, UserCheck, FileCheck2, Clock3, Plus, KanbanSquare, Eye, Phone, Star, Mail,
} from 'lucide-react'
import { toast } from 'sonner'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import usePageSearch from '@features/hr/hooks/usePageSearch'
import StatsCard from '@shared/components/StatsCard'
import Button from '@shared/components/Button'
import HRPage from '@features/hr/components/HRPage'
import HRDrawer from '@features/hr/components/HRDrawer'
import HREntityForm from '@features/hr/components/HREntityForm'
import HRQuickActions from '@features/hr/components/HRQuickActions'
import HRMiniBars from '@features/hr/components/HRMiniBars'
import HRDataTable from '@features/hr/components/HRDataTable'
import { HRSection, HRAvatar, HRStatusBadge, HRProgressBar } from '@features/hr/components/hrPrimitives'
import {
  HR_RECRUITMENT_STATS, HR_VACANCIES, HR_CANDIDATES, HR_PIPELINE, HR_INTERVIEWS, HR_OFFERS,
} from '@features/hr/data/hrTalent'

const STAGE_BADGE = {
  Applied: 'pending', Screening: 'active', Interview: 'warning', Offer: 'active', Hired: 'success', Rejected: 'danger',
}

export default function RecruitmentManagement() {
  // KINI HRMS RBAC — vacancies, pipeline moves and exports follow the HR level.
  const { can } = useHrPermissions()
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [view, setView] = useState('list') // list | kanban
  const [candidates, setCandidates] = useState(HR_CANDIDATES)
  const [vacancies, setVacancies] = useState(HR_VACANCIES)
  const [vacancyFormOpen, setVacancyFormOpen] = useState(false)
  const [vacancyView, setVacancyView] = useState(null)
  const vacanciesRef = useRef(null)
  const candidatesRef = useRef(null)
  useAddIntent(() => setVacancyFormOpen(true))
  const pageSearch = usePageSearch()
  const filteredCandidates = useMemo(() => candidates.filter(pageSearch.matches), [candidates, pageSearch.matches])
  const focusCandidates = (search = '') => {
    pageSearch.setSearch(search)
    window.requestAnimationFrame(() => candidatesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  const focusVacancies = () => vacanciesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const vacancyColumns = [
    { accessor: 'title', header: 'Position', sortable: true, minWidth: 240, render: (row) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{row.title}</p>
        <p className="text-[11px] text-slate-400">{row.department} · {row.location}</p>
      </div>
    )},
    { accessor: 'openings', header: 'Openings', sortable: true, render: (row) => (
      <span className="rounded-full bg-[#0f55f7]/10 px-2.5 py-0.5 text-xs font-bold text-[#0f55f7]">{row.openings}</span>
    )},
    { accessor: 'applicants', header: 'Applicants', sortable: true, render: (row) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{row.applicants}</span> },
    { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={row.status} /> },
    { accessor: 'posted', header: 'Posted', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.posted}</span> },
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 100, render: (row) => (
      can('recruitment', 'view') && <Button variant="secondary" size="xs" icon={Eye} onClick={() => setVacancyView(row)}>View</Button>
    )},
  ]

  const candidateColumns = [
    {
      accessor: 'name', header: 'Candidate', sortable: true, minWidth: 200,
      render: (row) => (
        <div className="flex items-center gap-3">
          <HRAvatar name={row.name} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{row.name}</p>
            <p className="truncate text-[11px] text-slate-400">{row.role}</p>
          </div>
        </div>
      ),
    },
    { accessor: 'stage', header: 'Stage', sortable: true, render: (row) => <HRStatusBadge status={STAGE_BADGE[row.stage]} label={row.stage} /> },
    { accessor: 'source', header: 'Source', sortable: true, render: (row) => <span className="text-xs text-slate-600 dark:text-slate-300">{row.source}</span> },
    { accessor: 'rating', header: 'Rating', sortable: true, render: (row) => (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{row.rating.toFixed(1)}
      </span>
    )},
    { accessor: 'owner', header: 'Owner', sortable: true, render: (row) => <span className="text-xs text-slate-600 dark:text-slate-300">{row.owner}</span> },
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 100, render: (row) => (
      can('recruitment', 'view') && <Button variant="secondary" size="xs" onClick={() => setSelectedCandidate(row)}>Profile</Button>
    )},
  ]

  const kanbanStages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired']

  return (
    <HRPage
      moduleId="recruitment"
      title="Recruitment"
      subtitle="Vacancies, candidates, interviews, offers and the hiring pipeline."
      icon={Briefcase}
      lastUpdated="Aug 4, 2026"
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search candidates…' }}
      actions={
        <HRQuickActions
          can={can}
          actions={[
            { key: 'add', label: 'New Vacancy', icon: Plus, variant: 'primary', permission: ['recruitment', 'add'], onClick: () => setVacancyFormOpen(true) },
            { key: 'kanban', label: view === 'kanban' ? 'List View' : 'Kanban View', icon: KanbanSquare, onClick: () => setView(view === 'kanban' ? 'list' : 'kanban') },
          ]}
        />
      }
    >
      <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatsCard compact icon={Briefcase} value={HR_RECRUITMENT_STATS.openPositions} label="Open Positions" accentColor="#0f55f7" onClick={focusVacancies} />
        <StatsCard compact icon={Users2} value={HR_RECRUITMENT_STATS.totalCandidates} label="Total Candidates" accentColor="#06b6a8" onClick={() => focusCandidates()} />
        <StatsCard compact icon={FileCheck2} value={HR_RECRUITMENT_STATS.screening} label="Screening" accentColor="#8b5cf6" onClick={() => focusCandidates('screening')} />
        <StatsCard compact icon={UserCheck} value={HR_RECRUITMENT_STATS.interviews} label="Interviews" accentColor="#F59E0B" onClick={() => focusCandidates('interview')} />
        <StatsCard compact icon={FileCheck2} value={HR_RECRUITMENT_STATS.offersOut} label="Offers Out" accentColor="#EC4899" onClick={() => focusCandidates('offer')} />
        <StatsCard compact icon={Clock3} value={HR_RECRUITMENT_STATS.timeToHire} suffix="d" label="Time to Hire" accentColor="#10b981" onClick={() => focusCandidates()} />
      </div>

      {/* Funnel */}
      <HRSection title="Hiring Funnel" subtitle="Candidate movement across stages" icon={KanbanSquare} padding="p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-3">
            {HR_PIPELINE.map((stage, i) => (
              <div key={stage.stage} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs font-bold text-slate-600 dark:text-slate-300">{stage.stage}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stage.count / HR_PIPELINE[0].count) * 100}%` }}
                    transition={{ delay: i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, #0f55f7, #06b6a8)` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-extrabold text-slate-800 dark:text-slate-200">{stage.count}</span>
              </div>
            ))}
          </div>
          <HRMiniBars
            data={HR_PIPELINE.map((s) => ({ label: s.stage, value: s.count }))}
            color="#8b5cf6"
            barHeight="h-32"
            valueFormatter={(v) => v}
          />
        </div>
      </HRSection>

      {/* Vacancies */}
      <div ref={vacanciesRef} className="scroll-mt-4">
        <HRSection title="Vacancies" subtitle={`${HR_VACANCIES.length} active requisitions`} icon={Briefcase} padding="p-4">          <HRDataTable
            columns={vacancyColumns}
            data={vacancies}
            searchPlaceholder="Search positions…"
            pageSize={5}
            exportFileName="vacancies"
            exportTitle="Open Vacancies"
            exportable={can('recruitment', 'export')}
          />
        </HRSection>
      </div>

      {/* Candidates: list or kanban */}
      <div ref={candidatesRef} className="scroll-mt-4">
        <HRSection title="Candidates" subtitle="Every applicant in the pipeline" icon={Users2} padding="p-4">
        {view === 'kanban' ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {kanbanStages.map((stage) => (
              <div key={stage} className="rounded-2xl bg-slate-50/80 p-2.5 dark:bg-slate-800/40">
                <div className="mb-2 flex items-center justify-between px-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{stage}</p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                    {filteredCandidates.filter((c) => c.stage === stage).length}
                  </span>
                </div>
                <div className="space-y-2">
                  {filteredCandidates.filter((c) => c.stage === stage).map((candidate) => (
                    <button
                      key={candidate.id}
                      onClick={() => setSelectedCandidate(candidate)}
                      className="w-full rounded-xl border border-slate-200/70 bg-white p-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex items-center gap-2">
                        <HRAvatar name={candidate.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{candidate.name}</p>
                          <p className="truncate text-[10px] text-slate-400">{candidate.role}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500">
                          <Star className="h-3 w-3 fill-current" />{candidate.rating.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-400">{candidate.source}</span>
                      </div>
                    </button>
                  ))}
                  {filteredCandidates.filter((c) => c.stage === stage).length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-[10px] text-slate-400 dark:border-slate-700">
                      Drop candidate here
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <HRDataTable
            columns={candidateColumns}
            data={filteredCandidates}
            searchable={false}
            pageSize={8}
            exportFileName="candidates"
            exportTitle="Candidate Pipeline"
            exportable={can('recruitment', 'export')}
          />
        )}
        </HRSection>
      </div>

      {/* Interviews + Offers */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <HRSection title="Interview Schedule" subtitle="Upcoming and recent interviews" icon={Clock3} padding="p-4">
          <ul className="space-y-2">
            {HR_INTERVIEWS.map((interview) => (
              <li key={interview.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{interview.candidate}</p>
                  <p className="truncate text-[11px] text-slate-400">{interview.role} · {interview.panel}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-500">{interview.date} · {interview.time} · {interview.mode}</p>
                </div>
                <HRStatusBadge status={interview.status} />
              </li>
            ))}
          </ul>
        </HRSection>

        <HRSection title="Offers" subtitle="Sent, accepted and drafted offers" icon={FileCheck2} padding="p-4">
          <ul className="space-y-2">
            {HR_OFFERS.map((offer) => (
              <li key={offer.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{offer.candidate}</p>
                  <p className="truncate text-[11px] text-slate-400">{offer.role} · {offer.ctc}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-500">Valid till {offer.validTill}</p>
                </div>
                <HRStatusBadge status={offer.status} />
              </li>
            ))}
          </ul>
        </HRSection>
      </div>

      {/* Candidate profile drawer */}
      <HRDrawer
        open={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        title={selectedCandidate?.name || 'Candidate Profile'}
        subtitle={selectedCandidate ? `${selectedCandidate.role}` : undefined}
        icon={Briefcase}
        accent="#8b5cf6"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" icon={Phone} onClick={() => {
              const subject = encodeURIComponent(`Interview update — ${selectedCandidate?.name || 'candidate'}`)
              const body = encodeURIComponent(`Hi ${selectedCandidate?.name || 'there'},\n\nRegarding your application for ${selectedCandidate?.role || 'the role'}…`)
              window.location.href = `mailto:?subject=${subject}&body=${body}`
              toast.success('Email draft opened')
            }}>Contact</Button>
            {can('recruitment', 'edit') && (
              <Button
                variant="primary"
                size="sm"
                icon={Mail}
                onClick={() => {
                  const idx = kanbanStages.indexOf(selectedCandidate?.stage)
                  const next = kanbanStages[Math.min(idx + 1, kanbanStages.length - 1)]
                  setCandidates((prev) => prev.map((c) => (c.id === selectedCandidate?.id ? { ...c, stage: next } : c)))
                  toast.success(`${selectedCandidate?.name} moved to ${next}`)
                  setSelectedCandidate(null)
                }}
              >
                Move to Next Stage
              </Button>
            )}
          </div>
        }
      >
        {selectedCandidate && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/10 to-[#0f55f7]/10 p-4">
              <HRAvatar name={selectedCandidate.name} size="xl" />
              <div>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">{selectedCandidate.name}</p>
                <p className="text-xs text-slate-500">{selectedCandidate.role} · {selectedCandidate.location}</p>
                <div className="mt-2 flex gap-1.5">
                  <HRStatusBadge status={STAGE_BADGE[selectedCandidate.stage]} label={selectedCandidate.stage} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                    <Star className="h-3 w-3 fill-current" />{selectedCandidate.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Source', selectedCandidate.source],
                ['Applied', selectedCandidate.applied],
                ['Interviews', selectedCandidate.interviews],
                ['Owner', selectedCandidate.owner],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
                  <p className="mt-0.5 truncate text-xs font-bold text-slate-800 dark:text-slate-200">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Application Fit</p>
              <HRProgressBar value={Math.round(selectedCandidate.rating * 20)} showLabel color="#8b5cf6" />
            </div>
          </div>
        )}
      </HRDrawer>

      {/* New vacancy form */}
      <HREntityForm
        open={vacancyFormOpen}
        onClose={() => setVacancyFormOpen(false)}
        title="New Vacancy"
        subtitle="Open a new requisition"
        icon={Briefcase}
        accent="#EC4899"
        saveLabel="Post Vacancy"
        fields={[
          { key: 'title', label: 'Position', type: 'text', required: true, placeholder: 'e.g. Senior React Engineer' },
          { key: 'department', label: 'Department', type: 'text', required: true, placeholder: 'e.g. Engineering' },
          { key: 'location', label: 'Location', type: 'text', required: true, placeholder: 'e.g. Bengaluru' },
          { key: 'openings', label: 'Openings', type: 'number', required: true, defaultValue: 1 },
          { key: 'status', label: 'Status', type: 'select', required: true, defaultValue: 'Open', options: ['Open', 'On Hold', 'Closed'].map((s) => ({ value: s, label: s })) },
        ]}
        onSave={(values) => {
          const id = `VAC-${String(vacancies.length + 1).padStart(3, '0')}`
          setVacancies((prev) => [{
            id,
            title: values.title,
            department: values.department,
            location: values.location,
            openings: Number(values.openings) || 1,
            applicants: 0,
            status: values.status,
            posted: 'Aug 4, 2026',
          }, ...prev])
          toast.success(`${values.title} posted`)
        }}
      />

      {/* Vacancy detail drawer */}
      <HRDrawer
        open={Boolean(vacancyView)}
        onClose={() => setVacancyView(null)}
        title={vacancyView?.title || 'Vacancy'}
        subtitle={`${vacancyView?.department} · ${vacancyView?.location}`}
        icon={Briefcase}
        accent="#EC4899"
      >
        {vacancyView && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Openings', vacancyView.openings],
                ['Applicants', vacancyView.applicants],
                ['Status', vacancyView.status],
                ['Posted', vacancyView.posted],
                ['Department', vacancyView.department],
                ['Location', vacancyView.location],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
                  <p className="mt-0.5 truncate text-xs font-bold text-slate-800 dark:text-slate-200">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#8b5cf6]/10 to-[#0f55f7]/10 p-3.5 text-xs leading-5 text-slate-600 dark:text-slate-300">
              Candidates who apply to this vacancy flow straight into the pipeline below — move them stage by
              stage from the candidate drawer.
            </div>
          </div>
        )}
      </HRDrawer>
    </HRPage>
  )
}
