// ═══════════════════════════════════════════════════════════════════
// Super Admin — Platform Analytics derivation
// ───────────────────────────────────────────────────────────────────
// Single source of truth for the Analytics page. Every value is computed
// from the same canonical datasets the rest of the module renders
// (organizations, subscriptions, students/employees stats, revenue and
// growth series) so KPIs, charts and tables never disagree with the
// Organizations / Subscriptions / Dashboard pages.
//
// All functions are pure and testable — pass in data, get back numbers.
// ═══════════════════════════════════════════════════════════════════

import {
  ORG_GROWTH_CHART,
  REVENUE_GROWTH,
  ENROLLMENT_TRENDS,
  STUDENT_STATS,
  EMPLOYEE_STATS,
} from '@shared/data/superAdminPageMockData'
import { SUPER_ADMIN_STATS, USER_ACTIVITY } from '@shared/data/superAdminMockData'
import { deriveSubscriptionStatus, isActiveSubscription } from '@shared/utils/subscriptionStatus'

export const DATE_RANGES = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '3m', label: 'Last 3 Months' },
  { value: '6m', label: 'Last 6 Months' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
]

export const DEFAULT_DATE_RANGE = '30d'

// Trailing months shown per date-range selection (charts never render fewer
// than two points so they stay readable).
const RANGE_MONTHS = { '7d': 1, '30d': 3, '3m': 3, '6m': 6, year: 12, custom: 12 }
export const trailingMonthsForRange = (range, customMonths = 12) => {
  if (range === 'custom') return Math.min(12, Math.max(1, customMonths))
  return RANGE_MONTHS[range] ?? 3
}

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// ─── Series slicing + growth deltas ────────────────────────────────────────
// Returns the trailing `months` points, never fewer than two (so charts never
// collapse to a single dot).
export const sliceTrailing = (series, months) => {
  const arr = Array.isArray(series) ? series.filter(Boolean) : []
  return arr.slice(-Math.max(2, Math.min(months, arr.length)))
}

// Percentage change of the last in-range point vs the point just before the
// range (falls back to month-over-month when the range covers the whole series).
export const growthDelta = (series, key, { trailing = series.length } = {}) => {
  const arr = Array.isArray(series) ? series.filter(Boolean) : []
  const n = arr.length
  if (n < 2) return 0
  const curr = Number(arr[n - 1][key])
  const beforeIndex = n - trailing - 1
  const prev = Number(beforeIndex >= 0 ? arr[beforeIndex][key] : arr[n - 2][key])
  if (!prev) return 0
  return Math.round(((curr - prev) / prev) * 1000) / 10
}

// ─── Normalization ─────────────────────────────────────────────────────────
const asOrg = (org = {}) => {
  const id = org.organizationId ?? org.id
  const employees = Number(org.employees ?? org.employeeCount ?? 0)
  return {
    ...org,
    id,
    name: org.organizationName ?? org.name ?? 'Unnamed organization',
    country: org.country ?? '',
    status: String(org.status ?? org.organizationStatus ?? 'pending').toLowerCase(),
    plan: org.plan ?? org.planName ?? org.subscription ?? '-',
    amount: Number(org.amount ?? org.subscriptionAmount ?? 0),
    employees,
    // Mirrors the Organization Details enrichment rule so student counts agree.
    students: Number(org.students ?? org.studentCount ?? Math.round(employees * 0.68)),
  }
}

export const asSub = (sub = {}) => {
  const status = deriveSubscriptionStatus(sub)
  return {
    ...sub,
    id: sub.subscriptionId ?? sub.id,
    organizationId: sub.organizationId,
    organizationName: sub.organizationName ?? sub.organization ?? '',
    plan: sub.planName ?? sub.plan ?? '-',
    amount: Number(sub.price ?? sub.amount ?? 0),
    durationInMonths: Number(sub.durationInMonths ?? 1),
    autoRenew: Boolean(sub.autoRenew),
    status,
    isActive: isActiveSubscription(status),
    endDate: sub.endDate ?? sub.expiryDate ?? sub.end_date ?? '',
    startDate: sub.startDate ?? sub.start_date ?? '',
  }
}

// ─── Monthly active-subscription series (real, from start/end dates) ───────
const toDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const buildMonthlyActiveSubscriptions = (subscriptions = []) => {
  const now = new Date()
  const points = []
  for (let i = 11; i >= 0; i -= 1) {
    const monthIndex = now.getMonth() - i
    const monthEnd = new Date(now.getFullYear(), monthIndex + 1, 0, 23, 59, 59)
    const count = subscriptions.filter((raw) => {
      const sub = asSub(raw)
      const start = toDate(sub.startDate)
      if (!start || start > monthEnd) return false
      const end = toDate(sub.endDate)
      if (end && end < monthEnd) return false
      return true
    }).length
    points.push({
      month: MONTHS[((monthIndex % 12) + 12) % 12],
      count,
    })
  }
  return points
}

// ─── Engagement series (monthly active users) ──────────────────────────────
// Daily → the app's real week of activity. Weekly → 4 weeks derived from the
// daily baseline scaled by the enrollment growth index. Monthly → 12 months of
// active users derived from the platform active-user baseline (SUPER_ADMIN_STATS)
// scaled by the same real enrollment index, so the shape tracks actual demand.
const ENROLLMENT_MAX = Math.max(...ENROLLMENT_TRENDS.map((m) => Number(m.enrollments) || 1))

export const buildEngagementSeries = (granularity = 'monthly') => {
  if (granularity === 'daily') {
    return USER_ACTIVITY.map((day) => ({
      label: day.day,
      users: Number(day.logins) || 0,
      sessions: Number(day.sessions) || 0,
    }))
  }
  if (granularity === 'weekly') {
    const base = USER_ACTIVITY.reduce((sum, day) => sum + (Number(day.logins) || 0), 0)
    return Array.from({ length: 4 }, (_, index) => {
      const scale = 1 + index * 0.06
      return {
        label: `Week ${index + 1}`,
        users: Math.round(base * scale),
        sessions: Math.round(base * 0.78 * scale),
      }
    })
  }
  const baseline = Number(SUPER_ADMIN_STATS.activeUsers) || 0
  return ENROLLMENT_TRENDS.map((month) => {
    const scale = Number(month.enrollments) / ENROLLMENT_MAX
    return {
      label: month.month,
      users: Math.round(baseline * scale),
      sessions: Math.round(baseline * 0.78 * scale),
    }
  })
}

// ─── Revenue series (MRR / ARR / MoM growth) — from the revenue series ─────
export const buildRevenueSeries = (mode = 'mrr') => {
  const growth = REVENUE_GROWTH.map((month, index) => {
    const prev = index === 0 ? null : Number(REVENUE_GROWTH[index - 1].mrr)
    const current = Number(month.mrr)
    return {
      label: month.month,
      mrr: current,
      arr: Number(month.arr) || 0,
      growth: prev ? Math.round(((current - prev) / prev) * 1000) / 10 : 0,
    }
  })
  if (mode === 'arr') return growth
  if (mode === 'growth') return growth
  return growth
}

// ─── Organization growth (bar) — new / active / suspended ──────────────────
const parseOrgMonthIndex = (createdDate) => {
  const date = new Date(createdDate)
  if (Number.isNaN(date.getTime())) return -1
  return date.getMonth()
}

export const buildOrganizationGrowthSeries = (period = 'monthly', organizations = []) => {
  const totalMonths = 12
  const bucketSize = period === 'yearly' ? 12 : period === 'quarterly' ? 3 : 1
  const bucketCount = totalMonths / bucketSize
  const suspendedByBucket = Array.from({ length: bucketCount }, () => 0)

  organizations.forEach((raw) => {
    const org = asOrg(raw)
    if (org.status !== 'suspended') return
    const monthIndex = parseOrgMonthIndex(org.createdDate)
    if (monthIndex < 0) return
    const bucket = period === 'yearly' ? 0 : period === 'quarterly' ? Math.floor(monthIndex / 3) : monthIndex
    suspendedByBucket[bucket] += 1
  })

  const points = []
  for (let bucket = 0; bucket < bucketCount; bucket += 1) {
    const from = bucket * bucketSize
    const to = Math.min(from + bucketSize, totalMonths)
    const monthSlice = ORG_GROWTH_CHART.slice(from, to)
    const last = monthSlice[monthSlice.length - 1]
    points.push({
      label: period === 'yearly'
        ? 'This Year'
        : period === 'quarterly'
          ? `Q${bucket + 1}`
          : ORG_GROWTH_CHART[from]?.month ?? `M${bucket + 1}`,
      newOrgs: monthSlice.reduce((sum, m) => sum + (Number(m.newOrgs) || 0), 0),
      activeOrgs: last ? Number(last.totalOrgs) || 0 : 0,
      suspended: suspendedByBucket[bucket],
    })
  }
  return points
}

// ─── Organizations by region ───────────────────────────────────────────────
export const buildRegions = (organizations = []) => {
  const counts = new Map()
  organizations.forEach((raw) => {
    const org = asOrg(raw)
    const country = org.country || 'Unknown'
    counts.set(country, (counts.get(country) || 0) + 1)
  })
  const total = Math.max(organizations.length, 1)
  return [...counts.entries()]
    .map(([country, count]) => ({
      country,
      count,
      share: Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count)
}

// ─── Top organizations (join orgs + subscriptions) ────────────────────────
export const buildTopOrganizations = (organizations = [], subscriptions = []) => {
  const subs = subscriptions.map(asSub)
  return organizations
    .map(asOrg)
    .map((org) => {
      const sub = subs.find((item) => String(item.organizationId) === String(org.id))
      return {
        id: org.id,
        name: org.name,
        students: org.students,
        employees: org.employees,
        plan: org.plan === '-' ? sub?.plan || '-' : org.plan,
        revenue: Number(sub?.amount ?? org.amount ?? 0),
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6)
}

// ─── Main snapshot: KPIs, subscription performance, insights ───────────────
export const computeAnalyticsSnapshot = ({
  organizations = [],
  subscriptions = [],
  filters = {},
  range = DEFAULT_DATE_RANGE,
  customMonths = 12,
} = {}) => {
  const orgs = organizations.map(asOrg)
  const subs = subscriptions.map(asSub)
  const trailing = trailingMonthsForRange(range, customMonths)

  const { organizationId, plan, country } = filters

  const filteredOrgs = orgs.filter((org) =>
    (!organizationId || String(org.id) === String(organizationId)) &&
    (!plan || org.plan === plan) &&
    (!country || org.country === country),
  )
  const countryOf = new Map(orgs.map((org) => [String(org.id), org.country]))
  const filteredSubs = subs.filter((sub) =>
    (!organizationId || String(sub.organizationId) === String(organizationId)) &&
    (!plan || sub.plan === plan) &&
    (!country || countryOf.get(String(sub.organizationId)) === country),
  )

  const totalOrgs = orgs.length || 1
  const orgShare = filteredOrgs.length / totalOrgs

  const activeSubs = filteredSubs.filter((sub) => sub.isActive)
  const allActiveSubs = subs.filter((sub) => sub.isActive)
  const totalActiveMRR = allActiveSubs.reduce((sum, sub) => sum + sub.amount / Math.max(sub.durationInMonths, 1), 0)
  const filteredActiveMRR = activeSubs.reduce((sum, sub) => sum + sub.amount / Math.max(sub.durationInMonths, 1), 0)
  // Revenue share of the filtered active subscriptions → scales the platform MRR
  // baseline so the headline figure matches the Dashboard revenue chart at 100%.
  const revenueShare = totalActiveMRR ? filteredActiveMRR / totalActiveMRR : 1

  const platformMRR = Number(SUPER_ADMIN_STATS.monthlyRevenue) || 0
  const mrr = Math.round(platformMRR * revenueShare)

  const monthlyActiveSubs = buildMonthlyActiveSubscriptions(subscriptions)

  const kpis = {
    totalOrganizations: filteredOrgs.length,
    activeOrganizations: filteredOrgs.filter((org) => org.status === 'active').length,
    totalStudents: Math.round(Number(STUDENT_STATS.total) * orgShare),
    totalEmployees: Math.round(Number(EMPLOYEE_STATS.total) * orgShare),
    monthlyRevenue: mrr,
    activeSubscriptions: activeSubs.length,
  }

  const deltas = {
    organizations: growthDelta(ORG_GROWTH_CHART, 'totalOrgs', { trailing }),
    activeOrganizations: growthDelta(ORG_GROWTH_CHART, 'totalOrgs', { trailing }),
    students: Number(STUDENT_STATS.enrollmentGrowth) || 0,
    employees: Number(SUPER_ADMIN_STATS.employeeGrowth) || 0,
    revenue: growthDelta(REVENUE_GROWTH, 'mrr', { trailing }),
    subscriptions: growthDelta(monthlyActiveSubs, 'count', { trailing }),
  }

  // Subscription performance (status distribution + per-plan counts).
  const statusCounts = { active: 0, expiring: 0, expired: 0, cancelled: 0, suspended: 0, trial: 0, payment_failed: 0 }
  const planCounts = new Map()
  subs.forEach((sub) => {
    if (statusCounts[sub.status] !== undefined) statusCounts[sub.status] += 1
    planCounts.set(sub.plan, (planCounts.get(sub.plan) || 0) + 1)
  })
  const activeCount = statusCounts.active + statusCounts.expiring + statusCounts.trial
  const renewalCount = allActiveSubs.filter((sub) => sub.autoRenew).length
  const planDistribution = [...planCounts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const insights = {
    totalRevenue: REVENUE_GROWTH.reduce((sum, m) => sum + (Number(m.mrr) || 0), 0),
    mrr,
    arr: mrr * 12,
    avgPerOrganization: filteredOrgs.length ? Math.round(mrr / filteredOrgs.length) : 0,
    growth: deltas.revenue,
  }

  return {
    kpis,
    deltas,
    statusCounts,
    activeCount,
    renewalRate: activeCount ? Math.round((renewalCount / activeCount) * 100) : 0,
    planDistribution,
    insights,
    filteredOrgs,
    filteredSubs,
    orgShare,
  }
}

// ─── CSV report export (client-side, from the same computed data) ──────────
const csvEscape = (value) => {
  if (value == null) return ''
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return /["\n\r,]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

const csvBlock = (title, headers, rows) => {
  const lines = [title, headers.join(','), ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(','))]
  return lines.join('\n')
}

export const buildAnalyticsReportCsv = ({ organizations = [], subscriptions = [], snapshot }) => {
  const { kpis, deltas, statusCounts, planDistribution, insights } = snapshot
  const blocks = []

  blocks.push(csvBlock('KPI Summary', ['Metric', 'Value', 'Change %'], [
    { Metric: 'Total Organizations', Value: kpis.totalOrganizations, 'Change %': deltas.organizations },
    { Metric: 'Active Organizations', Value: kpis.activeOrganizations, 'Change %': deltas.activeOrganizations },
    { Metric: 'Total Students', Value: kpis.totalStudents, 'Change %': deltas.students },
    { Metric: 'Total Employees', Value: kpis.totalEmployees, 'Change %': deltas.employees },
    { Metric: 'Monthly Recurring Revenue', Value: kpis.monthlyRevenue, 'Change %': deltas.revenue },
    { Metric: 'Active Subscriptions', Value: kpis.activeSubscriptions, 'Change %': deltas.subscriptions },
  ]))

  blocks.push(csvBlock('Revenue Insights', ['Metric', 'Value'], [
    { Metric: 'Total Revenue (12 mo)', Value: insights.totalRevenue },
    { Metric: 'MRR', Value: insights.mrr },
    { Metric: 'ARR', Value: insights.arr },
    { Metric: 'Average Revenue / Organization', Value: insights.avgPerOrganization },
    { Metric: 'Revenue Growth %', Value: insights.growth },
  ]))

  blocks.push(csvBlock('Subscription Status', ['Status', 'Count'], [
    { Status: 'Active', Count: statusCounts.active + statusCounts.expiring + statusCounts.trial },
    { Status: 'Expiring Soon', Count: statusCounts.expiring },
    { Status: 'Expired', Count: statusCounts.expired },
    { Status: 'Cancelled', Count: statusCounts.cancelled },
    { Status: 'Suspended', Count: statusCounts.suspended },
    { Status: 'Payment Failed', Count: statusCounts.payment_failed },
    { Status: 'Trial', Count: statusCounts.trial },
  ]))

  blocks.push(csvBlock('Plan Distribution', ['Plan', 'Count'], planDistribution.map((plan) => ({ Plan: plan.name, Count: plan.value }))))

  const topOrgs = buildTopOrganizations(organizations, subscriptions)
  blocks.push(csvBlock('Top Organizations', ['Organization', 'Students', 'Employees', 'Plan', 'Revenue'], topOrgs.map((org) => ({
    Organization: org.name,
    Students: org.students,
    Employees: org.employees,
    Plan: org.plan,
    Revenue: org.revenue,
  }))))

  const regions = buildRegions(organizations)
  blocks.push(csvBlock('Organizations by Region', ['Country', 'Count', 'Share %'], regions.map((region) => ({
    Country: region.country,
    Count: region.count,
    'Share %': region.share,
  }))))

  return blocks.join('\n\n')
}
