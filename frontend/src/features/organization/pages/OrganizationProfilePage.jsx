import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import KPI from "@/components/common/KPI";
import {
  Building2, Users, MapPin, Clock, Globe, Mail, Phone, Calendar,
  Edit3, Download,

  Briefcase
} from 'lucide-react'
import { getApiErrorMessage, normalizeOrganization, organizationApi, readStoredOrganizationId } from '@shared/services/apiServices'
import { branchApi } from '@shared/services/apiServices'
import { employeeService } from '@shared/services/employeeService'
import { coalesceNumber, formatNumber } from '@shared/utils/formatters'
import Modal from '@shared/components/Modal'
import { Button, Input } from '@shared/components/FormElements'
import toast from 'react-hot-toast'

/* ──────────── MOCK DATA ──────────── */
const ORG_DATA = {
  id: null, name: '', email: '', phone: '', website: '', industry: '', size: '—', country: '', timezone: '—',
  address: '—', contactPerson: '—', foundedYear: '—', registrationNumber: '—', description: '',
  employeeCount: 0, activeBranches: 0, departments: 0, activeTeams: 0, growthRate: 0, branchGrowth: 0,
  deptGrowth: 0, teamGrowth: 0, healthScore: 0, profileCompletion: 0, branchSetup: 0, departmentSetup: 0, teamSetup: 0,
}

const toDisplayOrganization = (organization) => {
  const normalized = normalizeOrganization(organization)
  return {
    ...ORG_DATA,
    ...normalized,
    employeeCount: coalesceNumber(normalized.employeeCount, ORG_DATA.employeeCount),
    activeBranches: coalesceNumber(normalized.activeBranches, ORG_DATA.activeBranches),
    departments: coalesceNumber(normalized.departments, ORG_DATA.departments),
    activeTeams: coalesceNumber(normalized.activeTeams, ORG_DATA.activeTeams),
    growthRate: coalesceNumber(normalized.growthRate, ORG_DATA.growthRate),
    branchGrowth: coalesceNumber(normalized.branchGrowth, ORG_DATA.branchGrowth),
    deptGrowth: coalesceNumber(normalized.deptGrowth, ORG_DATA.deptGrowth),
    teamGrowth: coalesceNumber(normalized.teamGrowth, ORG_DATA.teamGrowth),
    healthScore: coalesceNumber(normalized.healthScore, ORG_DATA.healthScore),
    profileCompletion: coalesceNumber(normalized.profileCompletion, ORG_DATA.profileCompletion),
    branchSetup: coalesceNumber(normalized.branchSetup, ORG_DATA.branchSetup),
    departmentSetup: coalesceNumber(normalized.departmentSetup, ORG_DATA.departmentSetup),
    teamSetup: coalesceNumber(normalized.teamSetup, ORG_DATA.teamSetup),
    name: normalized.name || ORG_DATA.name,
    description: normalized.description || '',
    size: normalized.size || ORG_DATA.size,
    timezone: normalized.timezone || ORG_DATA.timezone,
    address: normalized.address || ORG_DATA.address,
    contactPerson: normalized.contactPerson || ORG_DATA.contactPerson,
    foundedYear: normalized.createdDate ? new Date(normalized.createdDate).getFullYear() : ORG_DATA.foundedYear,
    registrationNumber: normalized.organizationId ? `ORG-${normalized.organizationId}` : ORG_DATA.registrationNumber,
  }
}

function Section({ title, subtitle, icon: Icon, children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-700/40
        shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]
        rounded-[24px] p-6 sm:p-8 ${className}`}
      style={{ boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08) inset' }}
    >
      {title && (
        <div className="flex items-start gap-3 mb-6 sm:mb-7">
          {Icon && (
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10
              flex items-center justify-center shrink-0 ring-1 ring-[#0f55f7]/10">
              <Icon className="w-5 h-5 text-[#0f55f7]" />
            </div>
          )}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </motion.div>
  )
}

function Badge({ icon: Icon, label, className = '' }) {
  const value = String(label ?? '').trim();
  if (!value || ['—', '–', '-', '--', 'n/a', ORG_DATA.size, ORG_DATA.timezone].includes(value.toLowerCase())) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest
      rounded-full bg-white/15 dark:bg-white/10 text-white/90 backdrop-blur-sm border border-white/20 ${className}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  )
}

/* ──────────── SECTION 1 \u2014 HERO ──────────── */
function HeroSection({ org, onEdit, onExport }) {
  return (
    <div className="relative mb-4 overflow-hidden rounded-[22px] sm:mb-5">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#0f55f7]/90 to-[#06b6a8]/80" />
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'400\' height=\'400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'40\' height=\'40\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 40 0 L 0 0 0 40\' fill=\'none\' stroke=\'rgba(255,255,255,0.05)\' stroke-width=\'1\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")' }} />
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#06b6a8]/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-[18px] bg-white/20 backdrop-blur-md sm:h-20 sm:w-20
              flex items-center justify-center shadow-xl border border-white/20 shrink-0">
              <Building2 className="h-9 w-9 text-white sm:h-10 sm:w-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {org.name}
              </h1>
              <p className="text-white/70 text-sm mt-1 max-w-md leading-relaxed">
                {org.description}
              </p>
            </div>
          </div>
          <div className="hidden lg:block flex-1" />
          <div className="flex flex-wrap gap-2">
            <Badge icon={Briefcase} label={org.industry} />
            <Badge icon={Users} label={org.size} />
            <Badge icon={MapPin} label={org.country} />
            <Badge icon={Clock} label={org.timezone} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white
             bg-white/15 hover:bg-white/25 rounded-xl transition-all duration-200 backdrop-blur-sm
             border border-white/10 hover:border-white/20 active:scale-95">
            <Edit3 className="w-4 h-4" /> Edit Organization
          </button>
          <button type="button" onClick={onExport} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white
             bg-white/15 hover:bg-white/25 rounded-xl transition-all duration-200 backdrop-blur-sm
             border border-white/10 hover:border-white/20 active:scale-95">
            <Download className="w-4 h-4" /> Export Details
          </button>
        </div>
      </div>
    </div>
  )
}

/* ──────────── SECTION 2 \u2014 KPI METRICS ──────────── */
function KPIMetricsRow({ org }) {
  const metrics = useMemo(() => [
    { icon: Users, label: 'Total Employees', value: org.employeeCount, growth: org.growthRate, accent: '#0f55f7' },
    { icon: Building2, label: 'Branches', value: org.activeBranches, growth: org.branchGrowth, accent: '#06b6a8' },
  ], [org])

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:mb-5">
      {metrics.map((m) => (
        <KPI key={m.label} value={m.value == null ? '—' : formatNumber(m.value)} label={m.label} icon={m.icon} accent={m.accent} size="compact" className="h-full" />
      ))}
    </div>
  )
}

/* ──────────── SECTION 3 \u2014 ORGANIZATION INFO ──────────── */
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3 group">
      <div className="w-9 h-9 rounded-[10px] bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center
        shrink-0 group-hover:bg-[#0f55f7]/10 transition-colors duration-200">
        <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-[#0f55f7] transition-colors duration-200" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5 truncate">
          {value || <span className="text-slate-400 italic">Not set</span>}
        </p>
      </div>
    </div>
  )
}

function OrganizationInfo({ org }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <Section title="Company Information" subtitle="Core organization details" className="!p-0">
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 divide-y divide-slate-100 dark:divide-slate-700/30">
          <InfoRow icon={Building2} label="Company Name" value={org.name} />
          <InfoRow icon={Mail} label="Email" value={org.email} />
          <InfoRow icon={Briefcase} label="Industry" value={org.industry} />
          <InfoRow icon={Globe} label="Website" value={org.website} />
          <InfoRow icon={Calendar} label="Founded" value={String(org.foundedYear)} />
          <InfoRow icon={FileText} label="Registration No." value={org.registrationNumber} />
        </div>
      </Section>
      <Section title="Contact Information" subtitle="Primary contact details" className="!p-0">
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 divide-y divide-slate-100 dark:divide-slate-700/30">
          <InfoRow icon={UserIcon} label="Contact Person" value={org.contactPerson} />
          <InfoRow icon={Phone} label="Phone" value={org.phone} />
          <InfoRow icon={MapPin} label="Country" value={org.country} />
          <InfoRow icon={Clock} label="Timezone" value={org.timezone} />
          <InfoRow icon={MapPin} label="Address" value={org.address} />
        </div>
      </Section>
    </div>
  )
}

function FileText(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  )
}

function UserIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

/* ──────────── SECTION 4 \u2014 HEALTH SCORE ──────────── */
export default function OrganizationProfilePage() {
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [metricsError, setMetricsError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ name:'', email:'', phone:'', industry:'', country:'', website:'' })

  const fetchOrganization = useCallback(async () => {
    setLoading(true)
    setError('')
    setMetricsError('')
    try {
      const storedId = readStoredOrganizationId()
      if (!storedId) throw new Error('Your organization session is missing an organization ID. Please sign in again.')
      const row = await organizationApi.getById(storedId)
      if (row) {
        const normalized = normalizeOrganization(row)
        localStorage.setItem('organizationId', String(normalized.organizationId ?? normalized.id))
        const params = { organizationId: storedId, pageNumber: 1, pageSize: 1000 };
        const results = await Promise.allSettled([
          employeeService.getEmployees(params),
          branchApi.list(params),
        ]);
        const countRows = result => result.status === 'fulfilled' && Array.isArray(result.value)
          ? result.value.length : null;
        const employeeResult = results[0];
        const employees = employeeResult.status === 'fulfilled' ? employeeResult.value : null;
        const employeeCount = employees
          ? Number(employees.totalRecords ?? employees.totalCount ?? employees.data?.length ?? 0) : null;
        setOrganization({ ...toDisplayOrganization(normalized), employeeCount,
          activeBranches: countRows(results[1]) });
        if (results.some(result => result.status === 'rejected'))
          setMetricsError('Some organization counts could not be loaded. Refresh to try again.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load organization profile'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(fetchOrganization)
  }, [fetchOrganization])

  const openEdit = () => {
    setEditForm({ name:organization.name || '', email:organization.email || '', phone:organization.phone || '', industry:organization.industry || '', country:organization.country || '', website:organization.website || '' })
    setEditOpen(true)
  }

  const saveOrganization = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) { toast.error('Organization name and email are required.'); return }
    setSaving(true)
    try {
      await organizationApi.update(organization.organizationId ?? organization.id, editForm)
      await fetchOrganization()
      setEditOpen(false)
      toast.success('Organization updated successfully.')
    } catch (requestError) { toast.error(getApiErrorMessage(requestError, 'Unable to update organization.')) }
    finally { setSaving(false) }
  }

  const exportDetails = () => {
    try {
      const fields = [['Organization Name',organization.name],['Email',organization.email],['Phone',organization.phone],['Industry',organization.industry],['Country',organization.country],['Website',organization.website],['Address',organization.address],['Timezone',organization.timezone],['Employees',organization.employeeCount],['Active Branches',organization.activeBranches]]
      const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
      const blob = new Blob([`Field,Value\n${fields.map(([label,value]) => `${escape(label)},${escape(value)}`).join('\n')}`], { type:'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${String(organization.name || 'organization').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-profile.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url)
      toast.success('Organization details exported successfully.')
    } catch { toast.error('Unable to export organization details.') }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-400">
        Loading organization profile...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {organization ? <>
        <HeroSection org={organization} onEdit={openEdit} onExport={exportDetails} />
        <KPIMetricsRow org={organization} />
        {metricsError && <p role="status" className="mb-4 text-sm text-amber-700">{metricsError}</p>}
        <OrganizationInfo org={organization} />
      </> : !error ? <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-500">Organization details are unavailable.</div> : null}
      <Modal open={editOpen} onClose={() => !saving && setEditOpen(false)} title="Edit Organization" description="Update your organization profile details." size="lg" footer={<div className="flex justify-end gap-3"><Button variant="secondary" disabled={saving} onClick={() => setEditOpen(false)}>Cancel</Button><Button loading={saving} onClick={saveOrganization}>Save Changes</Button></div>}>
        <div className="grid gap-4 sm:grid-cols-2"><Input label="Organization Name" required value={editForm.name} onChange={(event) => setEditForm((current) => ({...current,name:event.target.value}))}/><Input label="Email" type="email" required value={editForm.email} onChange={(event) => setEditForm((current) => ({...current,email:event.target.value}))}/><Input label="Phone" value={editForm.phone} onChange={(event) => setEditForm((current) => ({...current,phone:event.target.value}))}/><Input label="Industry" value={editForm.industry} onChange={(event) => setEditForm((current) => ({...current,industry:event.target.value}))}/><Input label="Country" value={editForm.country} onChange={(event) => setEditForm((current) => ({...current,country:event.target.value}))}/><Input label="Website" type="url" value={editForm.website} onChange={(event) => setEditForm((current) => ({...current,website:event.target.value}))}/></div>
      </Modal>
    </div>
  )
}
