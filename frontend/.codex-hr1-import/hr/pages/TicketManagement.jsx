import { useMemo, useState } from 'react'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import useAddIntent from '@features/hr/hooks/useAddIntent'
import usePageSearch from '@features/hr/hooks/usePageSearch'
import {
  Ticket, Clock3, CheckCircle2, ThumbsUp, Plus, MessageSquare, Paperclip, Send, Zap, ArrowUp,
  Eye, Check, Trash2, UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import StatsCard from '@shared/components/StatsCard'
import Button from '@shared/components/Button'
import HRPage from '@features/hr/components/HRPage'
import HRDrawer from '@features/hr/components/HRDrawer'
import HRQuickActions from '@features/hr/components/HRQuickActions'
import HREntityForm from '@features/hr/components/HREntityForm'
import HRDataTable from '@features/hr/components/HRDataTable'
import HRActionMenu from '@features/hr/components/HRActionMenu'
import { HRSection, HRAvatar, HRStatusBadge } from '@features/hr/components/hrPrimitives'
import { HR_TICKET_STATS, HR_TICKETS, HR_TICKET_COMMENTS } from '@features/hr/data/hrWorkforce'

const TICKET_BADGE = { open: 'pending', 'in-progress': 'warning', resolved: 'success' }
const PRIORITY_STYLE = {
  high: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  medium: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  low: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300',
}
const PRIORITY_ICON = { high: Zap, medium: Clock3, low: ArrowUp }

const AGENT_POOL = ['Support Desk', 'IT Helpdesk', 'Payroll Ops', 'People Ops']
const TICKET_CATEGORIES = ['Payroll', 'Leave', 'IT', 'Compliance', 'Benefits']

export default function TicketManagement() {
  // KINI HRMS RBAC — resolution, assignment and deletes follow the tickets module permissions.
  const { can } = useHrPermissions()
  const [selected, setSelected] = useState(null)
  const [tickets, setTickets] = useState(HR_TICKETS)
  const [comments, setComments] = useState(HR_TICKET_COMMENTS)
  const [replyText, setReplyText] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  useAddIntent(() => setFormOpen(true))
  const pageSearch = usePageSearch()
  const filteredTickets = useMemo(() => tickets.filter(pageSearch.matches), [tickets, pageSearch.matches])

  const resolveTicket = (row) => {
    setTickets((prev) => prev.map((t) => (t.id === row.id ? { ...t, status: 'resolved' } : t)))
    toast.success(`Ticket ${row.id} resolved`)
  }

  const deleteTicket = (row) => {
    setTickets((prev) => prev.filter((t) => t.id !== row.id))
    setSelected(null)
    toast.success(`Ticket ${row.id} deleted`)
  }

  const assignTicket = (row) => {
    const current = AGENT_POOL.indexOf(row.assignee)
    const next = AGENT_POOL[(current + 1) % AGENT_POOL.length]
    setTickets((prev) => prev.map((t) => (t.id === row.id ? { ...t, assignee: next } : t)))
    toast.success(`Ticket ${row.id} assigned to ${next}`)
  }

  const replyToTicket = () => {
    if (!selected || !replyText.trim()) return
    setComments((prev) => [
      { id: `c-${Date.now()}`, author: 'You (HR)', role: 'HR Team', at: 'Just now', text: replyText.trim() },
      ...prev,
    ])
    setReplyText('')
    toast.success('Reply posted to requester')
  }

  const columns = [
    { accessor: 'id', header: 'Ticket', sortable: true, width: 110, render: (row) => <span className="text-xs font-extrabold text-[#0f55f7]">{row.id}</span> },
    { accessor: 'subject', header: 'Subject', sortable: true, minWidth: 280, render: (row) => (
      <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.subject}</span>
    )},
    { accessor: 'category', header: 'Category', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.category}</span> },
    { accessor: 'priority', header: 'Priority', sortable: true, render: (row) => {
      const Icon = PRIORITY_ICON[row.priority]
      return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${PRIORITY_STYLE[row.priority]}`}>
          <Icon className="h-3 w-3" />{row.priority}
        </span>
      )
    }},
    { accessor: 'assignee', header: 'Assignee', sortable: true, render: (row) => <span className="text-xs text-slate-600 dark:text-slate-300">{row.assignee}</span> },
    { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={TICKET_BADGE[row.status]} label={row.status} /> },
    { accessor: 'created', header: 'Created', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.created}</span> },
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 64, render: (row) => (
      <HRActionMenu
        can={can}
        items={[
          { label: 'View', icon: Eye, permission: ['tickets', 'view'], onClick: () => setSelected(row) },
          { label: 'Resolve', icon: Check, permission: ['tickets', 'edit'], onClick: () => resolveTicket(row) },
          { label: 'Assign', icon: UserCheck, permission: ['tickets', 'edit'], onClick: () => assignTicket(row) },
          { label: 'Delete', icon: Trash2, danger: true, permission: ['tickets', 'delete'], onClick: () => deleteTicket(row) },
        ]}
      />
    )},
  ]

  return (
    <HRPage
      moduleId="tickets"
      title="HR Tickets"
      subtitle="Employee support, priorities, comments, attachments and resolution history."
      icon={Ticket}
      lastUpdated="Aug 4, 2026"
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search tickets…' }}
      actions={
        <HRQuickActions
          can={can}
          actions={[{ key: 'new', label: 'New Ticket', icon: Plus, variant: 'primary', permission: ['tickets', 'add'], onClick: () => setFormOpen(true) }]}
        />
      }
    >
      <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatsCard compact icon={Ticket} value={HR_TICKET_STATS.open} label="Open Tickets" accentColor="#F59E0B" />
        <StatsCard compact icon={Clock3} value={HR_TICKET_STATS.inProgress} label="In Progress" accentColor="#0f55f7" />
        <StatsCard compact icon={CheckCircle2} value={HR_TICKET_STATS.resolved} label="Resolved" accentColor="#06b6a8" />
        <StatsCard compact icon={ThumbsUp} value={HR_TICKET_STATS.satisfaction} suffix="/5" label="Satisfaction" accentColor="#8b5cf6" />
      </div>

      {/* SLA banner */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3.5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-500/10">
            <Clock3 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Avg response {HR_TICKET_STATS.avgResponse} · {HR_TICKET_STATS.resolved} resolved overall</p>
            <p className="text-xs text-slate-400">High priority tickets target a 4-hour first response.</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {['Payroll', 'Leave', 'IT', 'Compliance', 'Benefits'].map((category) => (
            <span key={category} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {category}
            </span>
          ))}
        </div>
      </div>

      <HRSection title="Ticket Queue" subtitle="All employee support tickets" icon={Ticket} padding="p-4">
        <HRDataTable
          columns={columns}
          data={filteredTickets}
          searchable={false}
          pageSize={8}
          exportFileName="hr-tickets"
          exportTitle="HR Ticket Queue"
          exportable={can('tickets', 'export')}
        />
      </HRSection>

      {/* Detail drawer */}
      <HRDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.id || 'Ticket'}
        subtitle={selected?.subject}
        icon={Ticket}
        accent="#F59E0B"
        width="max-w-[520px]"
        footer={
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              {can('tickets', 'edit') && (
                <Button variant="secondary" size="sm" onClick={() => selected && assignTicket(selected)}>Assign</Button>
              )}
              {can('tickets', 'edit') && (
                <Button variant="secondary" size="sm" onClick={() => selected && resolveTicket(selected)}>Resolve</Button>
              )}
            </div>
            {can('tickets', 'add') && (
              <Button variant="primary" size="sm" icon={Send} onClick={replyToTicket}>Reply</Button>
            )}
          </div>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <HRStatusBadge status={TICKET_BADGE[selected.status]} label={selected.status} />
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${PRIORITY_STYLE[selected.priority]}`}>
                {selected.priority} priority
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {selected.category}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Requester', selected.requester],
                ['Assignee', selected.assignee],
                ['Created', selected.created],
                ['ID', selected.id],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
                  <p className="mt-0.5 truncate text-xs font-bold text-slate-800 dark:text-slate-200">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                <MessageSquare className="h-3.5 w-3.5" /> Comments & Timeline
              </p>
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <HRAvatar name={comment.author} size="sm" />
                    <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/30">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{comment.author}</p>
                        <span className="text-[10px] text-slate-400">{comment.at}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{comment.role}</p>
                      <p className="mt-1.5 text-xs leading-5 text-slate-600 dark:text-slate-300">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                <Paperclip className="h-3.5 w-3.5" /> Attachments
              </p>
              <div className="flex flex-wrap gap-2">
                {['July-payslip.pdf', 'TDS-statement.pdf'].map((file) => (
                  <span key={file} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Paperclip className="h-3 w-3 text-slate-400" />{file}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">Add comment</label>
              <textarea
                rows="3"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type a reply for the requester…"
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all focus:border-[#F59E0B] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
              />
            </div>
          </div>
        )}
      </HRDrawer>

      {/* New ticket form */}
      <HREntityForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="New Support Ticket"
        subtitle="Raise an employee support ticket"
        icon={Ticket}
        accent="#F59E0B"
        saveLabel="Create Ticket"
        fields={[
          { key: 'subject', label: 'Subject', type: 'text', required: true, placeholder: 'e.g. Payslip discrepancy for July' },
          { key: 'category', label: 'Category', type: 'select', required: true, options: TICKET_CATEGORIES.map((c) => ({ value: c, label: c })) },
          { key: 'priority', label: 'Priority', type: 'select', required: true, defaultValue: 'medium', options: [
            { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' },
          ] },
          { key: 'requester', label: 'Requester', type: 'text', required: true, placeholder: 'Employee name' },
          { key: 'assignee', label: 'Assignee', type: 'select', required: true, options: AGENT_POOL.map((a) => ({ value: a, label: a })) },
        ]}
        onSave={(values) => {
          const id = `TK-${String(tickets.length + 1).padStart(3, '0')}`
          setTickets((prev) => [{
            id,
            subject: values.subject,
            category: values.category,
            priority: values.priority,
            requester: values.requester,
            assignee: values.assignee,
            status: 'open',
            created: 'Aug 4, 2026',
          }, ...prev])
          toast.success(`Ticket ${id} created`)
        }}
      />
    </HRPage>
  )
}
