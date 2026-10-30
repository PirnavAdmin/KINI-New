import { useMemo, useState } from 'react'
import useAddIntent from '@features/hr/hooks/useAddIntent'
import {
  Clock4, Users2, CalendarDays, Repeat, Plus, TrendingUp, Layers,
} from 'lucide-react'
import { toast } from 'sonner'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import Button from '@shared/components/Button'
import usePageSearch from '@features/hr/hooks/usePageSearch'
import DataTable from '@shared/components/DataTable'
import HRPage from '@features/hr/components/HRPage'
import HRQuickActions from '@features/hr/components/HRQuickActions'
import HREntityForm from '@features/hr/components/HREntityForm'
import HRDrawer from '@features/hr/components/HRDrawer'
import HRMiniBars from '@features/hr/components/HRMiniBars'
import { HRSection, HRAvatar, HRProgressBar } from '@features/hr/components/hrPrimitives'
import { HR_SHIFTS, HR_SHIFT_ASSIGNMENTS, HR_SHIFT_ROTATION, HR_SHIFT_COVERAGE } from '@features/hr/data/hrTime'

export default function ShiftManagement() {
  // KINI HRMS RBAC — assignments and edits follow the shifts module permissions.
  const { can } = useHrPermissions()
  const [assignments, setAssignments] = useState(HR_SHIFT_ASSIGNMENTS)
  const [formOpen, setFormOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [plannerOpen, setPlannerOpen] = useState(false)
  useAddIntent(() => setFormOpen(true))
  const pageSearch = usePageSearch()
  const filteredShifts = useMemo(() => HR_SHIFTS.filter(pageSearch.matches), [pageSearch.matches])
  const filteredAssignments = useMemo(() => assignments.filter(pageSearch.matches), [assignments, pageSearch.matches])

  const assignmentColumns = [
    {
      accessor: 'employee', header: 'Employee', sortable: true, minWidth: 180,
      render: (row) => (
        <div className="flex items-center gap-3">
          <HRAvatar name={row.employee} size="sm" />
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.employee}</span>
        </div>
      ),
    },
    { accessor: 'shift', header: 'Shift', sortable: true, render: (row) => {
      const shift = HR_SHIFTS.find((s) => s.name === row.shift)
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: shift?.color }}>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: shift?.color }} />{row.shift}
        </span>
      )
    }},
    { accessor: 'from', header: 'From', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.from}</span> },
    { accessor: 'to', header: 'To', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.to}</span> },
    { accessor: 'assignedBy', header: 'Assigned By', sortable: true, render: (row) => <span className="text-xs text-slate-600 dark:text-slate-300">{row.assignedBy}</span> },
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 90, render: (row) => (
      can('shifts', 'edit') && <Button variant="secondary" size="xs" onClick={() => { setEditingAssignment(row); setFormOpen(true) }}>Edit</Button>
    )},
  ]

  return (
    <HRPage
      moduleId="shifts"
      title="Shift Management"
      subtitle="Rosters, assignments, weekly rotation and coverage."
      icon={Clock4}
      lastUpdated="Aug 4, 2026"
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search shifts…' }}
      actions={
        <HRQuickActions
          can={can}
          actions={[
            { key: 'assign', label: 'Assign Shift', icon: Plus, variant: 'primary', permission: ['shifts', 'assign'], onClick: () => { setEditingAssignment(null); setFormOpen(true) } },
            { key: 'planner', label: 'Weekly Planner', icon: CalendarDays, permission: ['shifts', 'view'], onClick: () => setPlannerOpen(true) },
          ]}
        />
      }
    >
      <div className="mb-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
        {filteredShifts.map((shift, i) => (
          <HRSection key={shift.id} padding="p-2.5" delay={i * 0.04}>
            <div className="flex items-start justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${shift.color}, ${shift.color}bb)` }}>
                <Clock4 className="h-4.5 w-4.5" />
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-500 dark:bg-slate-800 dark:text-slate-300">{shift.code}</span>
            </div>
            <h3 className="mt-2 text-sm font-extrabold text-slate-900 dark:text-white">{shift.name}</h3>
            <p className="mt-0.5 text-xs text-slate-400">{shift.start === '—' ? 'Flexible hours' : `${shift.start} – ${shift.end}`} · {shift.grace}m grace</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Users2 className="h-3.5 w-3.5 text-slate-400" />{shift.employees} employees
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${shift.coverage >= 80 ? 'text-emerald-600' : 'text-amber-500'}`}>
                <TrendingUp className="h-3 w-3" />{shift.coverage}% cover
              </span>
            </div>
            <div className="mt-1.5"><HRProgressBar value={shift.coverage} color={shift.color} /></div>
          </HRSection>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-1.5 lg:grid-cols-3">
        <HRSection title="Shift Coverage" subtitle="Staffed % through the day" icon={TrendingUp} padding="p-3">
          <HRMiniBars
            data={HR_SHIFT_COVERAGE.map((d) => ({ label: d.time, value: d.coverage }))}
            color="#6366f1"
            barHeight="h-36"
            valueFormatter={(v) => `${v}%`}
          />
        </HRSection>

        <HRSection title="Rotation Plans" subtitle="Team shift patterns" icon={Repeat} padding="p-3">
          <ul className="space-y-2">
            {HR_SHIFT_ROTATION.map((rotation) => (
              <li key={rotation.id} className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{rotation.team}</p>
                  <span className="rounded-full bg-[#6366f1]/10 px-2 py-0.5 text-[10px] font-bold text-[#6366f1]">{rotation.members} members</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{rotation.pattern}</p>
                {rotation.nextRotation !== '—' && (
                  <p className="mt-1 text-[10px] font-semibold text-slate-400">Next: {rotation.nextRotation}</p>
                )}
              </li>
            ))}
          </ul>
        </HRSection>

        <HRSection title="Assignments" subtitle="Current shift roster" icon={Layers} className="lg:col-span-1" padding="p-3">
          <DataTable columns={assignmentColumns} data={filteredAssignments} searchable={false} pageSize={6} />
        </HRSection>
      </div>

      {/* Assign / edit shift form */}
      <HREntityForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingAssignment(null) }}
        title={editingAssignment ? 'Edit Shift Assignment' : 'Assign Shift'}
        subtitle={editingAssignment ? `Updating ${editingAssignment.employee}` : 'Add an employee to a shift pattern'}
        icon={Clock4}
        accent="#6366f1"
        saveLabel={editingAssignment ? 'Save Changes' : 'Assign Shift'}
        values={editingAssignment || {}}
        fields={[
          { key: 'employee', label: 'Employee', type: 'text', required: true, placeholder: 'Employee name' },
          { key: 'shift', label: 'Shift Pattern', type: 'select', required: true, options: HR_SHIFTS.map((s) => ({ value: s.name, label: s.name })) },
          { key: 'from', label: 'From', type: 'text', required: true, placeholder: 'e.g. 9:00 AM' },
          { key: 'to', label: 'To', type: 'text', required: true, placeholder: 'e.g. 5:00 PM' },
          { key: 'assignedBy', label: 'Assigned By', type: 'text', required: true, placeholder: 'Your name' },
        ]}
        onSave={(values) => {
          if (editingAssignment) {
            setAssignments((prev) => prev.map((a) => (a.id === editingAssignment.id ? { ...a, ...values } : a)))
            toast.success(`Shift assignment updated for ${values.employee}`)
          } else {
            const id = `SA-${String(assignments.length + 1).padStart(2, '0')}`
            setAssignments((prev) => [{ id, ...values }, ...prev])
            toast.success(`Shift assigned to ${values.employee}`)
          }
        }}
      />

      {/* Weekly planner drawer */}
      <HRDrawer
        open={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        title="Weekly Planner"
        subtitle="Rotation plans and coverage for the coming week"
        icon={CalendarDays}
        accent="#6366f1"
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-[#6366f1]/10 to-[#0f55f7]/10 p-4">
            <p className="text-sm font-bold text-slate-900 dark:text-white">This Week at a Glance</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {HR_SHIFT_COVERAGE.length} coverage windows tracked · average{' '}
              {Math.round(HR_SHIFT_COVERAGE.reduce((s, d) => s + d.coverage, 0) / HR_SHIFT_COVERAGE.length)}% staffed.
            </p>
          </div>
          <ul className="space-y-2.5">
            {HR_SHIFT_ROTATION.map((rotation) => (
              <li key={rotation.id} className="rounded-xl border border-slate-100 px-3.5 py-3 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{rotation.team}</p>
                  <span className="rounded-full bg-[#6366f1]/10 px-2 py-0.5 text-[10px] font-bold text-[#6366f1]">{rotation.members} members</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{rotation.pattern}</p>
                {rotation.nextRotation !== '—' && (
                  <p className="mt-1 text-[10px] font-semibold text-slate-400">Next: {rotation.nextRotation}</p>
                )}
              </li>
            ))}
          </ul>
          <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] leading-5 text-slate-500 dark:bg-slate-800/40">
            Use <strong>Assign Shift</strong> to roster an employee now — the assignment appears in the roster table
            immediately.
          </p>
        </div>
      </HRDrawer>
    </HRPage>
  )
}
