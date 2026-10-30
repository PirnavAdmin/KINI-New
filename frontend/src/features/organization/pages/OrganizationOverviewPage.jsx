import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import KPI from "@/components/common/KPI";
import {
  Building2, Users, MapPin, Clock, Globe, Mail, Phone, Calendar,
  Edit3, Share2, Download, LayoutGrid, Layers,
  CheckCircle, Circle, ChevronRight, UserPlus,
  Briefcase, ArrowUpRight
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { getApiErrorMessage, normalizeOrganization, organizationApi, readStoredOrganizationId } from '@shared/services/apiServices'
import { coalesceNumber, formatNumber } from '@shared/utils/formatters'

/* ──────────── MOCK DATA ──────────── */
const ORG_DATA = {
  id: 'org-001',
  name: 'Acme Corp',
  email: 'hello@acmecorp.com',
  phone: '+1 (555) 123-4567',
  website: 'https://acmecorp.com',
  industry: 'Technology & Software',
  size: '501\u20131,000 employees',
  country: 'United States',
  timezone: 'Eastern Time (UTC-5)',
  address: '350 5th Avenue, Suite 300, New York, NY 10118',
  contactPerson: 'Jane Smith',
  foundedYear: 2018,
  registrationNumber: 'HRMS-ORG-2024-00142',
  description: 'Acme Corp is a leading enterprise technology company specialising in SaaS solutions for HR and people operations, serving over 500 organisations worldwide.',
  employeeCount: 843,
  activeBranches: 7,
  departments: 8,
  activeTeams: 24,
  growthRate: 12.5,
  branchGrowth: 8.3,
  deptGrowth: 4.2,
  teamGrowth: 15.7,
  healthScore: 92,
  profileCompletion: 100,
  branchSetup: 88,
  departmentSetup: 92,
  teamSetup: 85,
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
    description: normalized.description || `${normalized.name || ORG_DATA.name} organization overview`,
    size: normalized.size || ORG_DATA.size,
    timezone: normalized.timezone || ORG_DATA.timezone,
    address: normalized.address || ORG_DATA.address,
    contactPerson: normalized.contactPerson || ORG_DATA.contactPerson,
    foundedYear: normalized.createdDate ? new Date(normalized.createdDate).getFullYear() : ORG_DATA.foundedYear,
    registrationNumber: normalized.organizationId ? `ORG-${normalized.organizationId}` : ORG_DATA.registrationNumber,
  }
}

const RECENT_ACTIVITY = [
  { id: 'a1', user: 'Jane Smith', action: 'updated the organization profile', target: 'Timezone & Contact Info', timestamp: '2 hours ago', initials: 'JS', color: 'from-[#0f55f7] to-[#0f55f7]' },
  { id: 'a2', user: 'David Williams', action: 'added a new branch', target: 'London Office', timestamp: '1 day ago', initials: 'DW', color: 'from-emerald-500 to-[#06b6a8]' },
  { id: 'a3', user: 'Sarah Chen', action: 'restructured department', target: 'Engineering \u2192 Frontend, Backend, DevOps', timestamp: '3 days ago', initials: 'SC', color: 'from-[#06b6a8] to-[#06b6a8]' },
  { id: 'a4', user: 'Marcus Johnson', action: 'assigned a new team', target: 'Product Design Team', timestamp: '5 days ago', initials: 'MJ', color: 'from-amber-500 to-orange-500' },
  { id: 'a5', user: 'Raj Patel', action: 'enabled security policy', target: 'Two-Factor Authentication', timestamp: '1 week ago', initials: 'RP', color: 'from-rose-500 to-pink-500' },
]

const QUICK_ACTIONS = [
  { label: 'Add Branch', icon: Building2, gradient: 'from-[#0f55f7] to-[#0f55f7]', desc: 'Register a new office location' },
  { label: 'Add Department', icon: Layers, gradient: 'from-[#06b6a8] to-[#06b6a8]', desc: 'Create a new department' },
  { label: 'Create Team', icon: Users, gradient: 'from-emerald-600 to-[#06b6a8]', desc: 'Assemble a new team' },
  { label: 'Invite Employees', icon: UserPlus, gradient: 'from-amber-600 to-orange-400', desc: 'Onboard new members' },
]

const DEPARTMENT_DISTRIBUTION = [
  { name: 'Engineering', value: 156, color: '#0f55f7' },
  { name: 'Design', value: 34, color: '#06b6a8' },
  { name: 'Marketing', value: 28, color: '#10B981' },
  { name: 'Sales', value: 45, color: '#F59E0B' },
  { name: 'HR', value: 18, color: '#EF4444' },
  { name: 'Finance', value: 22, color: '#06B6D4' },
  { name: 'Customer Success', value: 38, color: '#06b6a8' },
]

const TEAM_DISTRIBUTION = [
  { name: 'Frontend', employees: 12 },
  { name: 'Backend', employees: 18 },
  { name: 'Design', employees: 8 },
  { name: 'Sales', employees: 15 },
  { name: 'Marketing', employees: 6 },
  { name: 'Data', employees: 10 },
]

const SETUP_STEPS = [
  { label: 'Organization Registration', completed: true, date: 'Jan 15, 2024' },
  { label: 'Organization Profile', completed: true, date: 'Jan 18, 2024' },
  { label: 'Branch Management', completed: true, date: 'Feb 2, 2024' },
  { label: 'Department Management', completed: true, date: 'Feb 14, 2024' },
  { label: 'Team Management', completed: false, date: 'In progress' },
]

const healthMetrics = [
  { label: 'Profile Completion', value: ORG_DATA.profileCompletion, color: '#0f55f7' },
  { label: 'Branch Setup', value: ORG_DATA.branchSetup, color: '#06b6a8' },
  { label: 'Department Setup', value: ORG_DATA.departmentSetup, color: '#10B981' },
  { label: 'Team Setup', value: ORG_DATA.teamSetup, color: '#F59E0B' },
]

/* ──────────── SHARED COMPONENTS ──────────── */

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
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest
      rounded-full bg-white/15 dark:bg-white/10 text-white/90 backdrop-blur-sm border border-white/20 ${className}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  )
}

/* ──────────── SECTION 1 \u2014 HERO ──────────── */
function HeroSection({ org }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] mb-6 sm:mb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#0f55f7]/90 to-[#06b6a8]/80" />
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'400\' height=\'400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'40\' height=\'40\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 40 0 L 0 0 0 40\' fill=\'none\' stroke=\'rgba(255,255,255,0.05)\' stroke-width=\'1\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")' }} />
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#06b6a8]/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[20px] bg-white/20 backdrop-blur-md
              flex items-center justify-center shadow-xl border border-white/20 shrink-0">
              <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
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
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-white/10">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white
             bg-white/15 hover:bg-white/25 rounded-xl transition-all duration-200 backdrop-blur-sm
             border border-white/10 hover:border-white/20 active:scale-95">
            <Edit3 className="w-4 h-4" /> Edit Organization
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white
             bg-white/15 hover:bg-white/25 rounded-xl transition-all duration-200 backdrop-blur-sm
             border border-white/10 hover:border-white/20 active:scale-95">
            <Share2 className="w-4 h-4" /> Share Profile
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white
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
    { icon: Layers, label: 'Departments', value: org.departments, growth: org.deptGrowth, accent: '#10B981' },
    { icon: LayoutGrid, label: 'Active Teams', value: org.activeTeams, growth: org.teamGrowth, accent: '#F59E0B' },
  ], [org])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {metrics.map((m) => (
        <KPI key={m.label} value={formatNumber(m.value)} label={m.label} icon={m.icon} accent={m.accent} trend={`${m.growth}%`} trendType="positive" size="compact" className="h-full" />
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
function HealthScore({ org }) {
  const score = org.healthScore
  const circumference = 2 * Math.PI * 56
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <Section className="lg:col-span-2">
        <div className="flex flex-col items-center py-4 sm:py-6">
          <div className="relative w-40 h-40 sm:w-44 sm:h-44 mb-5">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor"
                className="text-slate-100 dark:text-slate-800" strokeWidth="8" />
              <circle cx="64" cy="64" r="56" fill="none" stroke="url(#healthGradient)"
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0f55f7" />
                  <stop offset="100%" stopColor="#06b6a8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">{score}%</span>
              <span className="text-xs font-medium text-slate-400 mt-1">Health Score</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="w-4 h-4" /> +4.2% from last month
            </span>
          </div>
        </div>
      </Section>
      <Section className="lg:col-span-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6">Performance Metrics</h3>
        <div className="space-y-5">
          {healthMetrics.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{m.label}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{m.value}%</span>
              </div>
              <div className="relative h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${m.value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${m.color}, ${m.color}dd)` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

/* ──────────── SECTION 5 \u2014 SETUP PROGRESS ──────────── */
function SetupProgress() {
  return (
    <Section title="Setup Progress" subtitle="Onboarding completion status">
      <div className="relative">
        <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#0f55f7] via-[#06b6a8] to-slate-200 dark:to-slate-700" />
        <div className="space-y-0">
          {SETUP_STEPS.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-start gap-5 pb-8 last:pb-0"
            >
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                step.completed
                  ? 'bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] shadow-lg shadow-[#0f55f7]/20'
                  : 'bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600'
              }`}>
                {step.completed ? <CheckCircle className="w-5 h-5 text-white" /> : <Circle className="w-5 h-5 text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0 pt-1.5">
                <p className={`text-sm font-semibold ${step.completed ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{step.date}</p>
              </div>
              {step.completed ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold
                  bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full shrink-0">
                  <CheckCircle className="w-3 h-3" /> Done
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold
                  bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full shrink-0">
                  <Circle className="w-3 h-3" /> Pending
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ──────────── SECTION 6 \u2014 RECENT ACTIVITY ──────────── */
function RecentActivity() {
  return (
    <Section title="Recent Activity" subtitle="Latest organization changes">
      <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
        {RECENT_ACTIVITY.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 * i, duration: 0.3 }}
            className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 group"
          >
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-sm`}>
              <span className="text-[11px] font-bold text-white">{item.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-white">{item.user}</span>
                {' '}{item.action}{' '}
                <span className="font-medium text-[#0f55f7]">{item.target}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">{item.timestamp}</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-2
              group-hover:scale-125 transition-transform duration-200" />
          </motion.div>
        ))}
      </div>
      <button className="mt-5 w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium
        text-slate-400 hover:text-[#0f55f7] transition-colors duration-200 py-2 rounded-xl
        hover:bg-slate-50 dark:hover:bg-slate-800/50">
        View All Activity <ChevronRight className="w-4 h-4" />
      </button>
    </Section>
  )
}

/* ──────────── SECTION 7 \u2014 QUICK ACTIONS ──────────── */
function QuickActions() {
  return (
    <Section title="Quick Actions" subtitle="Common tasks and operations" className="mb-6 sm:mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {QUICK_ACTIONS.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.06 * i, duration: 0.3 }}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex flex-col items-start gap-3 p-5 rounded-[20px] text-left
              bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl
              border border-white/20 dark:border-slate-700/40 transition-all duration-300
              hover:shadow-xl hover:shadow-[#0f55f7]/5"
            style={{ boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08) inset' }}
          >
            <div className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${action.gradient}
              flex items-center justify-center shadow-lg transition-transform duration-300
              group-hover:scale-110 group-hover:rotate-[-4deg]`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{action.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{action.desc}</p>
            </div>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300
              group-hover:text-[#0f55f7] group-hover:translate-x-0.5 transition-all duration-200 opacity-0 group-hover:opacity-100" />
          </motion.button>
        ))}
      </div>
    </Section>
  )
}

/* ──────────── SECTION 8 \u2014 ANALYTICS SNAPSHOT ──────────── */
function AnalyticsSnapshot() {
  return (
    <Section title="Analytics Snapshot" subtitle="Employee & team distribution">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0f55f7]" /> Department Distribution
          </h4>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={DEPARTMENT_DISTRIBUTION} cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85} paddingAngle={3}
                  dataKey="value" animationBegin={200} animationDuration={1000}>
                  {DEPARTMENT_DISTRIBUTION.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '8px 12px' }} labelStyle={{ fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
            {DEPARTMENT_DISTRIBUTION.map((d) => (
              <span key={d.name} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} <span className="font-medium text-slate-700 dark:text-slate-300">{d.value}</span>
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#06b6a8]" /> Team Size Breakdown
          </h4>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TEAM_DISTRIBUTION} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '8px 12px' }} />
                <Bar dataKey="employees" radius={[6, 6, 0, 0]} animationBegin={400} animationDuration={1000}>
                  {TEAM_DISTRIBUTION.map((_, idx) => (
                    <Cell key={idx} fill={`hsl(${240 + idx * 25}, 70%, 55%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ──────────── MAIN PAGE ──────────── */
export default function OrganizationProfilePage() {
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrganization = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const storedId = readStoredOrganizationId()
      if (!storedId) throw new Error('Your organization session is missing an organization ID. Please sign in again.')
      const row = await organizationApi.getById(storedId)
      if (row) {
        const normalized = normalizeOrganization(row)
        localStorage.setItem('organizationId', String(normalized.organizationId ?? normalized.id))
        setOrganization(toDisplayOrganization(normalized))
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load organization overview'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(fetchOrganization)
  }, [fetchOrganization])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-400">
        Loading organization overview...
      </div>
    )
  }

  if (!organization) {
    return <div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">Organization not found.</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <HeroSection org={organization} />
      <KPIMetricsRow org={organization} />
      <OrganizationInfo org={organization} />
      <HealthScore org={organization} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <SetupProgress />
        <RecentActivity />
      </div>
      <QuickActions />
      <AnalyticsSnapshot />
    </div>
  )
}
