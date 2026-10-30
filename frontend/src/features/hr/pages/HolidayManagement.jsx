import { useMemo, useState } from 'react'
import useAddIntent from '@features/hr/hooks/useAddIntent'
import {
  PartyPopper, CalendarDays, Plus, MapPin, Sun, Globe, Music4, Building2, Trash2, Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import StatsCard from '@shared/components/StatsCard'
import usePageSearch from '@features/hr/hooks/usePageSearch'
import Button from '@shared/components/Button'
import DataTable from '@shared/components/DataTable'
import HRPage from '@features/hr/components/HRPage'
import HRQuickActions from '@features/hr/components/HRQuickActions'
import HREntityForm from '@features/hr/components/HREntityForm'
import HRDrawer from '@features/hr/components/HRDrawer'
import { HRSection, HRStatusBadge } from '@features/hr/components/hrPrimitives'
import { HR_HOLIDAYS, HR_HOLIDAY_CATEGORIES } from '@features/hr/data/hrTime'

const CATEGORY_ICON = { National: Sun, Regional: MapPin, Festival: Music4, 'Company Special': Building2 }

export default function HolidayManagement() {
  // KINI HRMS RBAC — add and edit actions follow the holidays module permissions.
  const { can } = useHrPermissions()
  const [holidays, setHolidays] = useState(HR_HOLIDAYS)
  const [formOpen, setFormOpen] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState(null)
  const [selectedHoliday, setSelectedHoliday] = useState(null)
  useAddIntent(() => setFormOpen(true))
  const pageSearch = usePageSearch()
  const filteredHolidays = useMemo(() => holidays.filter(pageSearch.matches), [holidays, pageSearch.matches])

  // Live aggregates — computed from the working state so stats, categories and
  // the calendar all update the moment a holiday is added, edited or deleted.
  const liveStats = useMemo(() => ({
    total: holidays.length,
    upcoming: holidays.filter((h) => h.date >= '2026-08-04').length,
    companyWide: holidays.filter((h) => h.region === 'All Branches').length,
    regional: holidays.filter((h) => h.region !== 'All Branches').length,
  }), [holidays])
  const liveCategories = useMemo(() => HR_HOLIDAY_CATEGORIES.map((category) => ({
    ...category,
    count: holidays.filter((h) => h.type === category.name).length,
  })), [holidays])

  const handleDelete = (row) => {
    setHolidays((prev) => prev.filter((h) => h.id !== row.id))
    if (editingHoliday?.id === row.id) setEditingHoliday(null)
    toast.success(`${row.name} removed from the calendar`)
  }

  const holidayColumns = [
    { accessor: 'name', header: 'Holiday', sortable: true, minWidth: 220, render: (row) => (
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#EC4899]/90 to-[#F59E0B]/90 text-white shadow-sm">
          <PartyPopper className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.name}</p>
          <p className="text-[11px] text-slate-400">{row.type}</p>
        </div>
      </div>
    )},
    { accessor: 'date', header: 'Date', sortable: true, render: (row) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{row.date}</span> },
    { accessor: 'day', header: 'Day', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.day}</span> },
    { accessor: 'region', header: 'Region', sortable: true, render: (row) => (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
        <MapPin className="h-3.5 w-3.5 text-slate-400" />{row.region}
      </span>
    )},
    { accessor: 'recurring', header: 'Recurring', sortable: true, render: (row) => (
      <HRStatusBadge status={row.recurring ? 'success' : 'pending'} label={row.recurring ? 'Yearly' : 'One-off'} />
    )},
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 130, render: (row) => (
      <div className="flex items-center gap-1">
        {can('holidays', 'view') && (
          <Button variant="secondary" size="xs" icon={Eye} onClick={() => setSelectedHoliday(row)}>View</Button>
        )}
        {can('holidays', 'edit') && (
          <Button variant="secondary" size="xs" onClick={() => { setEditingHoliday(row); setFormOpen(true) }}>Edit</Button>
        )}
        {can('holidays', 'delete') && (!row.recurring || row.type === 'Company Special') && (
          <button
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            aria-label={`Delete ${row.name}`}
            onClick={() => handleDelete(row)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )},
  ]

  return (
    <HRPage
      moduleId="holidays"
      title="Holidays"
      subtitle="Company, regional and festival calendars for every branch."
      icon={PartyPopper}
      lastUpdated="Aug 4, 2026"
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search holidays…' }}
      actions={
        <HRQuickActions
          can={can}
          actions={[{ key: 'add', label: 'Add Holiday', icon: Plus, variant: 'primary', permission: ['holidays', 'add'], onClick: () => { setEditingHoliday(null); setFormOpen(true) } }]}
        />
      }
    >
      <div className="mb-3 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatsCard compact className="rounded-xl" icon={PartyPopper} value={liveStats.total} label="Holidays Scheduled" accentColor="#EC4899" />
        <StatsCard compact className="rounded-xl" icon={CalendarDays} value={liveStats.upcoming} label="Upcoming" accentColor="#0f55f7" />
        <StatsCard compact className="rounded-xl" icon={Globe} value={liveStats.companyWide} label="Company-wide" accentColor="#06b6a8" />
        <StatsCard compact className="rounded-xl" icon={MapPin} value={liveStats.regional} label="Regional Locations" accentColor="#F59E0B" />
        {liveCategories.map((category, i) => {
          const Icon = CATEGORY_ICON[category.name] || PartyPopper
          return (
            <StatsCard
              key={category.id}
              compact
              className="rounded-xl"
              icon={Icon}
              value={category.count}
              label={category.name}
              accentColor={category.color}
              delay={i * 0.04}
            />
          )
        })}
      </div>

      {/* Calendar list */}
      <HRSection title="Holiday Calendar" subtitle="2026–2027 · All branches" icon={CalendarDays} padding="p-3">
        <DataTable columns={holidayColumns} data={filteredHolidays} searchable={false} stickyHeader pageSize={7} />
      </HRSection>

      {/* Holiday details */}
      <HRDrawer
        open={Boolean(selectedHoliday)}
        onClose={() => setSelectedHoliday(null)}
        title={selectedHoliday?.name || 'Holiday Details'}
        subtitle={selectedHoliday ? `${selectedHoliday.type} · ${selectedHoliday.region}` : undefined}
        icon={PartyPopper}
        accent="#EC4899"
        width="max-w-[460px]"
        footer={
          <div className="flex items-center justify-between gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedHoliday(null)}>Close</Button>
            {can('holidays', 'edit') && selectedHoliday && (
              <Button variant="primary" size="sm" onClick={() => {
                setEditingHoliday(selectedHoliday)
                setSelectedHoliday(null)
                setFormOpen(true)
              }}>Edit Holiday</Button>
            )}
          </div>
        }
      >
        {selectedHoliday && (
          <div className="space-y-3.5">
            <div className="rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-amber-50 p-4 dark:border-pink-500/20 dark:from-pink-500/10 dark:to-amber-500/10">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#F59E0B] text-white shadow-md">
                  <PartyPopper className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">{selectedHoliday.name}</p>
                  <p className="text-xs text-slate-500">{selectedHoliday.day}, {selectedHoliday.date}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                ['Holiday type', selectedHoliday.type],
                ['Applicable region', selectedHoliday.region],
                ['Recurrence', selectedHoliday.recurring ? 'Every year' : 'One-time holiday'],
                ['Calendar year', selectedHoliday.date.slice(0, 4)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-100">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-blue-50 px-3.5 py-3 text-xs leading-5 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              {selectedHoliday.region === 'All Branches'
                ? 'This holiday applies to every branch and appears on all employee calendars.'
                : `This regional holiday applies to employees assigned to ${selectedHoliday.region}.`}
            </div>
          </div>
        )}
      </HRDrawer>

      {/* Add / edit holiday form */}
      <HREntityForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingHoliday(null) }}
        title={editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
        subtitle={editingHoliday ? `Updating ${editingHoliday.name}` : 'Schedule a company or regional holiday'}
        icon={PartyPopper}
        accent="#EC4899"
        saveLabel={editingHoliday ? 'Save Changes' : 'Add Holiday'}
        values={editingHoliday || {}}
        fields={[
          { key: 'name', label: 'Holiday Name', type: 'text', required: true, placeholder: 'e.g. Independence Day' },
          { key: 'type', label: 'Type', type: 'select', required: true, options: ['National', 'Regional', 'Festival', 'Company Special'].map((t) => ({ value: t, label: t })) },
          { key: 'date', label: 'Date', type: 'date', required: true },
          { key: 'day', label: 'Day', type: 'text', placeholder: 'e.g. Saturday' },
          { key: 'region', label: 'Region', type: 'select', required: true, defaultValue: 'All Branches', options: ['All Branches', 'North', 'South', 'East', 'West'].map((r) => ({ value: r, label: r })) },
        ]}
        onSave={(values) => {
          const payload = {
            name: values.name,
            type: values.type,
            date: values.date,
            day: values.day || new Date(`${values.date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' }),
            region: values.region,
            recurring: editingHoliday?.recurring ?? false,
          }
          if (editingHoliday) {
            setHolidays((prev) => prev.map((h) => (h.id === editingHoliday.id ? { ...h, ...payload } : h)))
            toast.success(`${payload.name} updated`)
          } else {
            const id = `HL-${String(holidays.length + 1).padStart(2, '0')}`
            setHolidays((prev) => [{ id, ...payload }, ...prev])
            toast.success(`${payload.name} added to the calendar`)
          }
        }}
      />
    </HRPage>
  )
}
