import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ArrowRight, Ban, BarChart3, BriefcaseBusiness, Building2, CalendarDays, Check, CheckCircle2,
  ChevronDown, Copy, CreditCard, Download, Edit3, Eye, Globe, Globe2, GraduationCap, Hash, Image,
  Lock, Mail, MapPin, MapPinned, Phone, Plus, RotateCcw, Search, Trash2, TrendingUp, UserRound, X
} from 'lucide-react'
import Confetti from 'react-confetti'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { PremiumKpiCard, DashboardSection } from '@shared/components/SharedComponents'
import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/DataTable'
import StatusBadge from '@shared/components/StatusBadge'
import { Button, Input, Select } from '@shared/components/FormElements'
import Modal from '@shared/components/Modal'
import {
  ORG_GROWTH_CHART, INDUSTRY_DISTRIBUTION, ORGANIZATIONS, STUDENTS, GLOBAL_EMPLOYEES
} from '@shared/data/superAdminPageMockData'
import {
  COUNTRY_DIALING_CODES,
  DEFAULT_COUNTRY_CODE,
  DEFAULT_COUNTRY_NAME,
  findCountryByCode,
  findCountryByName,
  getDialByCode,
  getMaxPhoneDigits,
  getPhoneValidationError,
  parsePhoneParts,
} from '@shared/data/countryDialingData'
import { getApiErrorMessage, normalizeOrganization, organizationApi } from '@shared/services/apiServices'
import { ROUTES } from '@shared/constants/routeConstants'
import {
  createMockOrganization,
  getStoredMockOrganizations,
  isStoredMockOrganization,
  removeStoredMockOrganization,
  updateStoredMockOrganization,
  applyStatusOverrides,
  setOrganizationStatusOverride,
} from '@shared/services/mockOrganizationService'
import { useAuth } from '@shared/hooks/useAuth'
 
// =================================
// TODO: API Integration
// GET /api/v1/super-admin/organizations
// POST /api/v1/super-admin/organizations
// PUT /api/v1/super-admin/organizations/:id
// DELETE /api/v1/super-admin/organizations/:id
// GET /api/v1/super-admin/organizations/stats
// =================================
 
const TOOLTIP_STYLE = {
  background: 'rgba(255,255,255,0.95)',
  border: 'none',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  padding: '8px 12px',
  fontSize: '12px',
}
 
const STATUS_FILTERS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'expired', label: 'Expired' },
  { value: 'suspended', label: 'Suspended' },
]
 
const PLAN_FILTERS = [
  { value: '', label: 'All Plans' },
  { value: 'Free', label: 'Free' },
  { value: 'Starter', label: 'Starter' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Enterprise', label: 'Enterprise' },
]

const SUBSCRIPTION_PLAN_OPTIONS = [
  { value: 'Free', label: 'Free' },
  { value: 'Starter', label: 'Starter' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Enterprise', label: 'Enterprise' },
]

const ORGANIZATION_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'expired', label: 'Expired' },
]

// Country dropdown options for the Create/Edit Organization modal. Values use
// the readable country name (matching the directory/detail display format),
// with the dialing code shown as a hint so the country↔code sync is visible.
const COUNTRY_OPTIONS = COUNTRY_DIALING_CODES.map((country) => ({
  value: country.name,
  label: country.name,
  search: `${country.name} ${country.dial}`,
  hint: country.dial,
}))

// Country-code selector options for the phone field. The value is the ISO
// code (shared dials like +1 keep the exact country selected); the trigger
// shows the compact dialing code via `valueLabel`.
const COUNTRY_CODE_OPTIONS = COUNTRY_DIALING_CODES.map((country) => ({
  value: country.code,
  label: country.name,
  valueLabel: country.dial,
  search: `${country.name} ${country.dial}`,
  hint: country.dial,
}))
 
export default function SuperAdminOrganizations() {
  const { user } = useAuth()
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [ccDropdownOpen, setCcDropdownOpen] = useState(false)
  const ccDropdownPlacement = 'bottom'
  const [ccQuery, setCcQuery] = useState('')
  const ccContainerRef = useRef(null)
  const ccSearchRef = useRef(null)
  const phoneInputRef = useRef(null)
  const [deleteOrg, setDeleteOrg] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState(null)
  const [form, setForm] = useState({
    organizationName: '', organizationCode: '', logoUrl: '', email: '', industry: '', country: DEFAULT_COUNTRY_NAME, website: '',
    registeredAddress: '', contactPerson: '', subscriptionPlan: 'Free', startDate: '', endDate: '', status: 'active',
    password: '', confirmPassword: '',
    countryCode: DEFAULT_COUNTRY_CODE, phoneNumber: '',
  })
  const navigate = useNavigate()
  const [createdOrg, setCreatedOrg] = useState(null)
  const [successOpen, setSuccessOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiSize, setConfettiSize] = useState({ width: 0, height: 0 })
  const successCardRef = useRef(null)
  const formModalRef = useRef(null)
  const confettiTimer = useRef(null)
  const copiedTimer = useRef(null)

  // Country options for the modal. Editing an existing organization may hold a
  // country that isn't in the curated list — surface it as an extra option so
  // the saved value is never silently hidden.
  const countryOptions = useMemo(() => {
    const hasCurrent = COUNTRY_OPTIONS.some((option) => option.value === form.country)
    return hasCurrent || !form.country
      ? COUNTRY_OPTIONS
      : [...COUNTRY_OPTIONS, { value: form.country, label: form.country }]
  }, [form.country])

  const enrichOrganization = useCallback((row, index = 0) => {
    const normalized = normalizeOrganization(row)
    const name = normalized.name || row.name
    const matchedEmployees = GLOBAL_EMPLOYEES.filter((item) => item.organization === name)
    const employeeRecords = (matchedEmployees.length ? matchedEmployees : Array.from({ length: 3 }, (_, offset) => GLOBAL_EMPLOYEES[(index * 2 + offset) % GLOBAL_EMPLOYEES.length])).map((item) => ({ ...item, id: `${row.id || index}-${item.id}`, organization: name }))
    const studentRecords = Array.from({ length: 4 }, (_, offset) => STUDENTS[(index * 3 + offset) % STUDENTS.length]).map((item) => ({ ...item, id: `${row.id || index}-${item.id}`, organization: name }))
    const employees = Number(row.employees ?? row.employeeCount ?? employeeRecords.length ?? 0)
    const students = Number(row.students ?? row.studentCount ?? Math.max(24, Math.round(employees * 0.68)))
    const branches = Number(row.branches ?? row.branchCount ?? Math.max(1, Math.ceil(employees / 650)))
    return {
      ...normalized,
      ...row,
      name,
      size: row.size ?? row.organizationSize ?? '-',
      employees,
      students,
      branches,
      activeStudents: Number(row.activeStudents ?? Math.round(students * 0.86)),
      activeEmployees: Number(row.activeEmployees ?? Math.round(employees * 0.91)),
      studentRecords,
      employeeRecords,
      plan: row.subscriptionPlan ?? row.plan ?? row.planName ?? row.subscription ?? '-',
      amount: Number(row.amount ?? row.subscriptionAmount ?? 0),
      status: String(row.status ?? row.organizationStatus ?? row.approvalStatus ?? 'pending').toLowerCase(),
    }
  }, [])

  const fetchOrganizations = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    const isDemo = String(user?.email || '').includes('demo')
    // Organizations created through the Create Organization flow are persisted
    // in localStorage — merge them ahead of the seed/API records so they survive
    // refetches and page refreshes. (No-op once the real API takes over creation.)
    const mockCreated = getStoredMockOrganizations()
    const applyOverrides = (list) => applyStatusOverrides(list.map(enrichOrganization))
    if (isDemo) {
      setOrganizations(applyOverrides([...mockCreated, ...ORGANIZATIONS]))
      setLoading(false)
      return
    }
    try {
      const rows = await organizationApi.list()
      setOrganizations(applyOverrides([...mockCreated, ...(Array.isArray(rows) ? rows : [])]))
    } catch (error) {
      setOrganizations([])
      setLoadError(getApiErrorMessage(error, 'Unable to load organizations.'))
    } finally {
      setLoading(false)
    }
  }, [enrichOrganization, user?.email])

  useEffect(() => {
    const timer = window.setTimeout(fetchOrganizations, 0)
    return () => window.clearTimeout(timer)
  }, [fetchOrganizations])

  useEffect(() => {
    if (!formOpen) return undefined
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    // Move focus into the dialog so keyboard/screen-reader users land in the popup.
    formModalRef.current?.focus({ preventScroll: true })
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (ccDropdownOpen) { setCcDropdownOpen(false); return }
        setFormOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      // Restore focus to the trigger (only if it's still mounted).
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true })
      }
    }
  }, [formOpen, ccDropdownOpen])

  // Close the country-code dropdown when clicking outside.
  useEffect(() => {
    if (!ccDropdownOpen) return undefined
    const closeOnOutside = (event) => {
      if (ccContainerRef.current && !ccContainerRef.current.contains(event.target)) {
        setCcDropdownOpen(false)
      }
    }
    document.addEventListener('pointerdown', closeOnOutside)
    return () => document.removeEventListener('pointerdown', closeOnOutside)
  }, [ccDropdownOpen])

  // Focus the search input when the country-code dropdown opens.
  useEffect(() => {
    if (ccDropdownOpen) {
      const timer = window.setTimeout(() => ccSearchRef.current?.focus(), 0)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [ccDropdownOpen])

  useEffect(() => {
    if (!successOpen) return undefined
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    // Move focus into the dialog so keyboard/screen-reader users land in the popup.
    successCardRef.current?.focus({ preventScroll: true })
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSuccessOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      // Restore focus to the trigger (only if it's still mounted).
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true })
      }
    }
  }, [successOpen])

  // Navigate to the dedicated full-page Organization Details screen. The
  // selected record is passed via navigation state so the page renders
  // immediately; it also resolves the record from the route id / mock store
  // after a hard refresh.
  const navigateToOrganizationDetails = (organization) => {
    const orgId = organization.organizationId ?? organization.id
    navigate(
      ROUTES.SUPER_ADMIN.ORGANIZATION_DETAILS.replace(':organizationId', String(orgId)),
      { state: { organization } },
    )
  }

  const openForm = (organization = null) => {
    const country = organization?.country || DEFAULT_COUNTRY_NAME
    const { code, phoneNumber } = parsePhoneParts(organization?.phone, country)
    setEditingOrg(organization)
    setForm({
      organizationName: organization?.organizationName || organization?.name || '',
      organizationCode: organization?.organizationCode || organization?.code || '',
      logoUrl: organization?.logoUrl || organization?.logo || '',
      email: organization?.email || '',
      industry: organization?.industry || '', country,
      countryCode: code, phoneNumber,
      website: organization?.website || '',
      registeredAddress: organization?.registeredAddress || organization?.address || '',
      contactPerson: organization?.contactPerson || organization?.contactPersonName || '',
      subscriptionPlan: organization?.subscriptionPlan || organization?.plan || organization?.planName || 'Free',
      startDate: organization?.startDate || organization?.subscriptionStartDate || '',
      endDate: organization?.endDate || organization?.subscriptionEndDate || organization?.expiryDate || '',
      status: organization?.status || organization?.organizationStatus || 'active',
      password: '', confirmPassword: '',
    })
    setFormOpen(true)
    setFormErrors({})
    setCcDropdownOpen(false)
    setCcQuery('')
  }

  // Compose the full phone number (e.g. "+91 9876543210") from the selected
  // country code and the national-number input for the save payloads.
  const composePhone = () => {
    const dial = getDialByCode(form.countryCode)
    const number = String(form.phoneNumber || '').trim()
    return number ? `${dial || ''} ${number}`.trim() : ''
  }

  const handleCountryChange = (event) => {
    const name = event.target.value
    const country = findCountryByName(name)
    setForm((current) => ({
      ...current,
      country: name,
      countryCode: country?.code || current.countryCode,
    }))
  }

  const handleCountryCodeChange = (event) => {
    const code = event.target.value
    const country = findCountryByCode(code)
    setForm((current) => ({
      ...current,
      countryCode: code,
      country: country?.name || current.country,
    }))
  }

  const handlePhoneNumberChange = (event) => {
    let value = event.target.value.replace(/[^\d]/g, '')
    // Strip a pasted dialing code (e.g. "+91 9876543210" → "9876543210").
    const dialDigits = (getDialByCode(form.countryCode) || '').replace(/\D/g, '')
    const digits = value
    if (dialDigits && digits.length > dialDigits.length && digits.startsWith(dialDigits)) {
      value = value.slice(dialDigits.length)
    }
    // Enforce country-specific maximum digit length.
    const country = findCountryByCode(form.countryCode)
    const maxDigits = getMaxPhoneDigits(country)
    if (value.length > maxDigits) {
      value = value.slice(0, maxDigits)
    }
    setForm((current) => ({ ...current, phoneNumber: value }))
    // Clear phone error on change if the number is now potentially valid.
    if (formErrors.phone) {
      setFormErrors((current) => ({ ...current, phone: '' }))
    }
  }

  const handlePhoneBlur = () => {
    const raw = String(form.phoneNumber || '').trim()
    if (!raw) return
    const country = findCountryByCode(form.countryCode)
    const phoneError = getPhoneValidationError(country, raw)
    if (phoneError) {
      setFormErrors((current) => ({ ...current, phone: phoneError }))
    } else if (formErrors.phone) {
      setFormErrors((current) => ({ ...current, phone: '' }))
    }
  }

  const openSuccessPopup = (organization) => {
    setCreatedOrg(organization)
    setCopied(false)
    setSuccessOpen(true)
    setShowConfetti(true)
    setConfettiSize({ width: window.innerWidth, height: window.innerHeight })
    if (confettiTimer.current) window.clearTimeout(confettiTimer.current)
    confettiTimer.current = window.setTimeout(() => setShowConfetti(false), 6000)
  }

  const closeSuccessPopup = () => {
    setSuccessOpen(false)
    setCopied(false)
    setCreatedOrg(null)
    if (confettiTimer.current) {
      window.clearTimeout(confettiTimer.current)
      confettiTimer.current = null
    }
  }

  const copyOrganizationId = async () => {
    if (!createdOrg) return
    const id = String(createdOrg.organizationId ?? createdOrg.id ?? '')
    try {
      await navigator.clipboard.writeText(id)
    } catch {
      // Fallback for browsers/contexts without the async clipboard API.
      const textarea = document.createElement('textarea')
      textarea.value = id
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current)
    copiedTimer.current = window.setTimeout(() => setCopied(false), 2000)
  }

  const handleViewOrganization = () => {
    const organization = createdOrg
    closeSuccessPopup()
    const orgId = organization?.organizationId ?? organization?.id
    navigate(
      ROUTES.SUPER_ADMIN.ORGANIZATION_DETAILS.replace(':organizationId', String(orgId)),
      { state: { organization } },
    )
  }

  const handleGoToDashboard = () => {
    closeSuccessPopup()
    navigate(ROUTES.SUPER_ADMIN.DASHBOARD)
  }

  const saveOrganization = async () => {
    const errors = {}
    if (!form.organizationName.trim()) errors.organizationName = 'Organization name is required.'
    if (form.organizationCode && !/^[A-Za-z0-9_-]{2,32}$/.test(form.organizationCode.trim())) errors.organizationCode = 'Use 2-32 letters, numbers, hyphen or underscore.'
    if (!form.email.trim()) errors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address.'
    const rawPhoneNumber = String(form.phoneNumber || '').trim()
    if (!rawPhoneNumber) {
      errors.phone = 'Phone number is required.'
    } else {
      const phoneError = getPhoneValidationError(findCountryByCode(form.countryCode), rawPhoneNumber)
      if (phoneError) errors.phone = phoneError
    }
    if (form.website) { try { new URL(form.website) } catch { errors.website = 'Enter a complete URL, for example https://example.com.' } }
    if (form.logoUrl) { try { new URL(form.logoUrl) } catch { errors.logoUrl = 'Enter a complete logo URL, for example https://example.com/logo.png.' } }
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) errors.endDate = 'End date must be after the start date.'
    if (!editingOrg && !form.password) errors.password = 'Password is required.'
    else if (!editingOrg && form.password.length < 8) errors.password = 'Password must contain at least 8 characters.'
    if (!editingOrg && !form.confirmPassword) errors.confirmPassword = 'Confirm your password.'
    else if (!editingOrg && form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
    setFormErrors(errors)
    if (Object.keys(errors).length) return
    setSaving(true)
    try {
      if (editingOrg) {
        const updatePayload = { ...form, phone: composePhone() }
        delete updatePayload.password
        delete updatePayload.confirmPassword
        delete updatePayload.countryCode
        delete updatePayload.phoneNumber
        const orgId = editingOrg.organizationId ?? editingOrg.id
        if (isStoredMockOrganization(orgId)) {
          // Mock-created organization: persist the edit locally (no backend yet).
          // Keep the denormalized name/adminEmail fields in sync too.
          updateStoredMockOrganization(orgId, {
            ...updatePayload,
            name: updatePayload.organizationName,
            adminEmail: updatePayload.email,
          })
          setOrganizations((current) =>
            current.map((item) =>
              (item.organizationId ?? item.id) === orgId
                ? enrichOrganization({ ...item, ...updatePayload })
                : item,
            ),
          )
          toast.success('Organization updated')
          setFormOpen(false)
          return
        }
        await organizationApi.update(orgId, updatePayload)
        toast.success('Organization updated')
        setFormOpen(false)
        await fetchOrganizations()
      } else {
        // Static/mock creation for now â€” swap in organizationApi.create() when
        // the backend endpoint is ready (contract is identical).
        const created = await createMockOrganization({
          ...form,
          phone: composePhone(),
          organizationName: form.organizationName.trim(),
          email: form.email.trim(),
        })
        setOrganizations((current) => [enrichOrganization(created), ...current])
        toast.success('Organization created')
        setFormOpen(false)
        openSuccessPopup(created)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save organization'))
    } finally { setSaving(false) }
  }

  const confirmDeleteOrganization = async () => {
    if (!deleteOrg || deleting) return
    setDeleting(true)
    const orgId = deleteOrg.organizationId ?? deleteOrg.id
    try {
      if (isStoredMockOrganization(orgId)) {
        // Mock-created organization: remove from the local store (no backend yet).
        removeStoredMockOrganization(orgId)
      } else {
        await organizationApi.remove(orgId)
      }
      setOrganizations((current) => current.filter((item) => (item.organizationId ?? item.id) !== orgId))
      toast.success('Organization deleted successfully.')
      setDeleteOrg(null)
    } catch (error) { toast.error(getApiErrorMessage(error, 'Unable to delete organization.')) }
    finally { setDeleting(false) }
  }

  const changeOrganizationStatus = async (organization, nextStatus) => {
    const actionLabel = nextStatus === 'active' ? 'approve/activate' : 'suspend'
    const reason = window.prompt(`Reason to ${actionLabel} ${organization.name}:`)
    if (!reason?.trim()) return toast.error('A reason is required for audit compliance')
    const organizationId = organization.organizationId ?? organization.id
    const responsibleUserId = user?.userId ?? user?.id ?? localStorage.getItem('userId')
    const timestamp = new Date().toISOString()
    const statusPatch = {
      status: nextStatus,
      approvalStatus: nextStatus === 'active' ? 'approved' : 'suspended',
      approvalReason: reason.trim(),
      approvedBy: nextStatus === 'active' ? responsibleUserId : undefined,
      approvedAt: nextStatus === 'active' ? timestamp : undefined,
      suspendedBy: nextStatus === 'suspended' ? responsibleUserId : undefined,
      suspendedAt: nextStatus === 'suspended' ? timestamp : undefined,
      updatedAt: timestamp,
      auditAction: nextStatus === 'active' ? 'ORGANIZATION_APPROVED' : 'ORGANIZATION_SUSPENDED',
    }
    try {
      // Persist the status override for ALL organizations (both seed and
      // mock-created) so it survives refreshes, navigation, and table refetches.
      setOrganizationStatusOverride(organizationId, nextStatus)
      if (isStoredMockOrganization(organizationId)) {
        updateStoredMockOrganization(organizationId, statusPatch)
      } else {
        await organizationApi.update(organizationId, {
          ...organization,
          organizationName: organization.organizationName ?? organization.name,
          ...statusPatch,
        }).catch(() => { /* Demo fallback: status override is already persisted */ })
      }
      setOrganizations((current) =>
        current.map((item) =>
          (item.organizationId ?? item.id) === organizationId
            ? enrichOrganization({ ...item, ...statusPatch })
            : item,
        ),
      )
      toast.success(nextStatus === 'active' ? 'Organization approved and activated' : 'Organization suspended')
    } catch (error) { toast.error(getApiErrorMessage(error, `Unable to ${actionLabel} organization`)) }
  }
 
  const filteredOrgs = useMemo(() => {
    return organizations.filter((o) => {
      const matchStatus = !statusFilter || o.status === statusFilter
      const matchPlan = !planFilter || o.plan === planFilter
      return matchStatus && matchPlan
    })
  }, [organizations, statusFilter, planFilter])

  const orgStats = useMemo(() => ({
    total: organizations.length,
    active: organizations.filter((item) => item.status === 'active').length,
    trial: organizations.filter((item) => item.status === 'trial' || item.status === 'pending').length,
    expired: organizations.filter((item) => item.status === 'expired' || item.status === 'suspended').length,
    branches: organizations.reduce((sum, item) => sum + Number(item.branches || 0), 0),
    students: organizations.reduce((sum, item) => sum + Number(item.students || 0), 0),
    employees: organizations.reduce((sum, item) => sum + Number(item.employees || 0), 0),
  }), [organizations])
 
  const columns = [
    {
      header: 'Organization',
      accessor: 'name',
      width: '22%',
      // Email lives inside this column's render cell, so surface it explicitly
      // to the search filter — records are then found by name or email.
      searchValue: (row) => `${row.name} ${row.email}`,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50">
            <Building2 className="h-4 w-4 text-teal-700" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.name}</p>
            <p className="truncate text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    { header: 'Industry', accessor: 'industry', width: '13%' },
    { header: 'Branches', accessor: 'branches', width: '8%', render: (row) => <span className="font-bold text-slate-700 dark:text-slate-200">{row.branches}</span> },
    { header: 'Students', accessor: 'students', width: '10%', render: (row) => <span className="font-bold text-blue-600">{row.students.toLocaleString()}</span> },
    {
      header: 'Employees',
      accessor: 'employees',
      width: '11%',
      render: (row) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">{row.employees.toLocaleString()}</span>
      ),
    },
    { header: 'Plan', accessor: 'plan', width: '10%' },
    {
      header: 'Status',
      accessor: 'status',
      width: '11%',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      width: '15%',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); navigateToOrganizationDetails(row) }}
            className="group/action inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 transition-colors hover:bg-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10"
            aria-label="View organization"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600 group-hover/action:text-white" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); openForm(row) }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800" aria-label="Edit organization">
            <Edit3 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteOrg(row) }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 transition-colors hover:bg-red-100" aria-label="Delete organization"><Trash2 className="h-3.5 w-3.5 text-red-600" /></button>
          {row.status === 'active' ? (
            <button onClick={(e) => { e.stopPropagation(); changeOrganizationStatus(row, 'suspended') }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 transition-colors hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10" aria-label="Suspend organization" title="Suspend organization">
              <Ban className="w-3.5 h-3.5 text-red-500" />
            </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); changeOrganizationStatus(row, 'active') }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 transition-colors hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10" aria-label="Approve or reactivate organization" title="Approve or reactivate">
              {row.status === 'suspended' ? <RotateCcw className="w-3.5 h-3.5 text-emerald-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          )}
        </div>
      ),
    },
  ]
 
  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-7">
      {/* KPIs */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PremiumKpiCard icon={Building2} label="Total Organizations" value={orgStats.total} color="#0f55f7" delay={0} />
        <PremiumKpiCard icon={MapPin} label="Total Branches" value={orgStats.branches} color="#8b5cf6" delay={1} />
        <PremiumKpiCard icon={GraduationCap} label="Total Students" value={orgStats.students} color="#06b6a8" delay={2} />
        <PremiumKpiCard icon={BriefcaseBusiness} label="Total Employees" value={orgStats.employees} color="#f59e0b" delay={3} />
      </div>
 
      {/* Charts Row */}
      <div className="hidden grid-cols-1 gap-4 lg:grid-cols-5">
        <DashboardSection title="Organization Growth" subtitle="Monthly new registrations" icon={TrendingUp} className="lg:col-span-3">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ORG_GROWTH_CHART} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="orgGrowthGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f55f7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0f55f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="newOrgs" stroke="#0f55f7" strokeWidth={2} fill="url(#orgGrowthGrad2)" name="New Organizations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>
 
        <DashboardSection title="Industry Distribution" subtitle="By organization count" icon={BarChart3} className="lg:col-span-2">
          <div className="h-44 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={INDUSTRY_DISTRIBUTION} cx="50%" cy="50%" innerRadius={40} outerRadius={60}
                  paddingAngle={3} dataKey="value" animationBegin={200} animationDuration={1000}>
                  {INDUSTRY_DISTRIBUTION.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
              {INDUSTRY_DISTRIBUTION.map((d) => (
                <span key={d.name} className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name} <span className="font-medium text-slate-700 dark:text-slate-300">{d.value}</span>
                </span>
              ))}
            </div>
          </div>
        </DashboardSection>
      </div>
 
      <section className="organization-directory-workspace overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_12px_38px_-28px_rgba(15,23,42,.35)]">
      <div className="border-b border-slate-200 bg-white px-5 pt-5 sm:px-6">
      {/* Page Header */}
      <PageHeader
        showBreadcrumb={false}
        titleClassName="!text-2xl !leading-8"
        containerClassName="!mb-5"
        title="Organization Directory"
        subtitle={`${orgStats.active} active organizations · ${orgStats.students.toLocaleString()} students · ${orgStats.employees.toLocaleString()} employees`}
        icon={Building2}
        actions={
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800">
              <Download className="w-4 h-4" />
              Export
            </button>
            <Button icon={Plus} onClick={() => openForm()}>Create Organization</Button>
          </div>
        }
      />
      </div>
 
      {/* Table */}
      {loadError && <div className="m-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><span>{loadError}</span><Button variant="outline" onClick={fetchOrganizations}>Retry</Button></div>}
      <DataTable
        columns={columns}
        data={filteredOrgs}
        loading={loading}
        pageSize={8}
        searchPlaceholder="Search organizations by name, email, industry, or country..."
        emptyTitle="No organizations found"
        emptyDescription="Try adjusting your filters or create a new organization."
        emptyIcon={Building2}
        onRowClick={navigateToOrganizationDetails}
        fitToContainer
        tableStyle={{ tableLayout: 'fixed' }}
        tableClassName="organization-directory-table"
        toolbarClassName="organization-directory-toolbar"
        headerCellClassName="organization-directory-header-cell"
        cellClassName="organization-directory-cell"
        rowClassName="organization-directory-row"
        filters={
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
            >
              {PLAN_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        }
      />
      </section>
 
      {/* Organization Created Successfully Popup */}
      <AnimatePresence>
        {successOpen && createdOrg && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-slate-950/45 backdrop-blur-[3px]"
              onClick={closeSuccessPopup}
            />
            {showConfetti && (
              <Confetti
                width={confettiSize.width}
                height={confettiSize.height}
                numberOfPieces={220}
                recycle={false}
                gravity={0.18}
                colors={['#0f55f7', '#06b6a8', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e']}
                style={{ position: 'fixed', inset: 0, zIndex: 1002, pointerEvents: 'none' }}
              />
            )}
            <motion.div
              ref={successCardRef}
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="organization-success-title"
              tabIndex={-1}
              className="fixed inset-0 z-[1001] m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_28px_80px_-20px_rgba(15,23,42,.5)] outline-none dark:border-slate-700 dark:bg-slate-900 sm:w-[28rem]"
            >
              <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400" />
              <button
                type="button"
                onClick={closeSuccessPopup}
                className="absolute right-4 top-5 z-10 grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-teal-50 hover:text-teal-800 dark:hover:bg-slate-800"
                aria-label="Close success popup"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-8 text-center sm:px-8">
                {/* Success checkmark (decorative) */}
                <div aria-hidden="true" className="relative mx-auto grid h-20 w-20 place-items-center">
                  <motion.span
                    initial={{ opacity: 0.7, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full bg-teal-400/40"
                  />
                  <motion.span
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                    className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 shadow-[0_14px_32px_-10px_rgba(16,185,129,.6)]"
                  >
                    <motion.span
                      initial={{ scale: 0, rotate: -24 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.18, type: 'spring', stiffness: 300, damping: 15 }}
                      className="grid h-10 w-10 place-items-center rounded-full bg-white/20"
                    >
                      <Check className="h-6 w-6 text-white" strokeWidth={3} />
                    </motion.span>
                  </motion.span>
                </div>

                <h2 id="organization-success-title" className="mt-6 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                  Organization Created Successfully!
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">"{createdOrg.name}"</span> has been created and administrator access has been set up.
                </p>

                {/* Organization ID + Admin email */}
                <div className="mt-6 w-full space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left dark:border-slate-700 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Organization ID</p>
                      <p className="mt-1 truncate font-mono text-sm font-bold tracking-wide text-teal-700 dark:text-teal-300">
                        {createdOrg.organizationId}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={copyOrganizationId}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-50 dark:border-teal-500/30 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-teal-500/10"
                      aria-label="Copy organization ID"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Admin Email</p>
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{createdOrg.email}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex w-full flex-col-reverse gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    fullWidth
                    icon={Building2}
                    onClick={handleViewOrganization}
                    className="sm:flex-1"
                  >
                    View Organization
                  </Button>
                  <Button
                    variant="success"
                    fullWidth
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={handleGoToDashboard}
                    className="sm:flex-1"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create / Edit Organization popup */}
      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[1000] bg-[rgba(15,23,42,0.45)] backdrop-blur-[6px]"
              onClick={() => setFormOpen(false)}
            />
            <motion.div
              ref={formModalRef}
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-organization-title"
              tabIndex={-1}
              className="create-organization-modal fixed inset-0 z-[1001] m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[60rem] flex-col overflow-hidden rounded-[22px] border border-[#d7e3f0] bg-white shadow-[0_32px_80px_-20px_rgba(15,23,42,0.45)] outline-none"
            >
              {/* Gradient header */}
              <header className="create-organization-modal__header relative flex shrink-0 items-center gap-4 overflow-hidden px-6 py-6 sm:px-8">
                <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 h-44 w-44 rounded-full border border-white/10" />
                <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-10 h-24 w-24 rounded-full bg-white/5" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-40 rounded-full bg-white/5 blur-xl" />
                <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/25 bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="relative min-w-0 flex-1 pr-2">
                  <h2 id="create-organization-title" className="text-lg font-bold leading-6 text-white sm:text-xl">
                    {editingOrg ? 'Edit Organization' : 'Create Organization'}
                  </h2>
                  <p className="mt-1 truncate text-[13px] leading-5 text-white/85 sm:text-sm">
                    {editingOrg ? 'Update the organization profile and contact details.' : 'Add an organization and create its administrator access.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              {/* Form body */}
              <div className="create-organization-modal__body min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8 sm:py-7">
                <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
                  <div>
                    <Input className="create-organization-field" label="Organization Name" required icon={Building2} error={formErrors.organizationName} value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} />
                  </div>
                  <div>
                    <Input className="create-organization-field" label="Organization Code" icon={Hash} error={formErrors.organizationCode} value={form.organizationCode} onChange={(e) => setForm({ ...form, organizationCode: e.target.value })} />
                  </div>
                  <div>
                    <Input className="create-organization-field" label="Logo URL" type="url" icon={Image} error={formErrors.logoUrl} value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
                  </div>
                  <div>
                    <Input className="create-organization-field" label="Email" type="email" required icon={Mail} error={formErrors.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Phone <span className="text-[#EF4444] ml-0.5">*</span>
                      </label>
                      <div className="flex items-stretch gap-0">
                        {/* Compact country-code selector */}
                        <div ref={ccContainerRef} className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setCcDropdownOpen((prev) => !prev)
                              setCcQuery('')
                            }}
                            className={`create-organization-field flex h-full items-center gap-1.5 rounded-r-none border-r-0 px-3 pr-1.5 text-sm font-semibold tabular-nums ${
                              formErrors.phone ? 'border-[#EF4444]' : ''
                            }`}
                            style={{ minWidth: '72px' }}
                            aria-haspopup="listbox"
                            aria-expanded={ccDropdownOpen}
                          >
                            <span className="whitespace-nowrap text-slate-800">
                              {getDialByCode(form.countryCode) || '+…'}
                            </span>
                            <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${ccDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {ccDropdownOpen && (
                            <div
                              className={`absolute left-0 z-[1200] w-64 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800 ${
                                ccDropdownPlacement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                              }`}
                            >
                              <div className="sticky top-0 z-10 -mx-1.5 -mt-1.5 mb-1.5 border-b border-slate-200 bg-white p-1.5 pb-2 dark:border-slate-700 dark:bg-slate-800">
                                <div className="relative">
                                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                  <input
                                    ref={ccSearchRef}
                                    type="text"
                                    value={ccQuery}
                                    onChange={(e) => setCcQuery(e.target.value)}
                                    placeholder="Search country or code"
                                    aria-label="Search country codes"
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f55f7] focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Escape') { setCcDropdownOpen(false); phoneInputRef.current?.focus() }
                                    }}
                                  />
                                </div>
                              </div>
                              {COUNTRY_CODE_OPTIONS
                                .filter((opt) => {
                                  if (!ccQuery.trim()) return true
                                  const haystack = `${opt.label} ${opt.valueLabel} ${opt.search}`.toLowerCase()
                                  return haystack.includes(ccQuery.trim().toLowerCase())
                                })
                                .map((opt) => {
                                  const selected = opt.value === form.countryCode
                                  return (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      role="option"
                                      aria-selected={selected}
                                      onClick={() => {
                                        handleCountryCodeChange({ target: { value: opt.value } })
                                        setCcDropdownOpen(false)
                                        setCcQuery('')
                                        phoneInputRef.current?.focus()
                                      }}
                                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                        selected ? 'bg-[#0f55f7]/10 font-semibold text-[#0f55f7]' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
                                      }`}
                                    >
                                      <span className="min-w-0 flex-1 truncate text-left">{opt.label}</span>
                                      <span className="shrink-0 font-mono text-xs tabular-nums text-slate-400">{opt.valueLabel}</span>
                                      {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                                    </button>
                                  )
                                })
                              }
                            </div>
                          )}
                        </div>

                        {/* Phone number input */}
                        <div className="min-w-0 flex-1">
                          <Input
                            ref={phoneInputRef}
                            className="create-organization-field rounded-l-none !pl-3"
                            icon={Phone}
                            inputMode="tel"
                            autoComplete="tel-national"
                            maxLength={getMaxPhoneDigits(findCountryByCode(form.countryCode))}

                            error={formErrors.phone}
                            value={form.phoneNumber}
                            onChange={handlePhoneNumberChange}
                            onBlur={handlePhoneBlur}
                          />
                        </div>
                      </div>
                      {formErrors.phone && (
                        <p className="flex items-center gap-1 text-xs text-[#EF4444]">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Input className="create-organization-field" label="Industry" icon={BriefcaseBusiness} value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
                  </div>
                  <div>
                    <Select
                      className="create-organization-field"
                      label="Country"
                      icon={Globe}
                      searchable
                      searchPlaceholder="Search country"
                      searchAriaLabel="Search countries"
                      placeholder="Select country"
                      options={countryOptions}
                      value={form.country}
                      onChange={handleCountryChange}
                    />
                  </div>
                  <div>
                    <Input className="create-organization-field" label="Website" icon={Globe2} error={formErrors.website} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                  </div>
                  <div>
                    <Input className="create-organization-field" label="Contact Person" icon={UserRound} value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
                  </div>
                  <div>
                    <Select
                      className="create-organization-field"
                      label="Subscription Plan"
                      icon={CreditCard}
                      options={SUBSCRIPTION_PLAN_OPTIONS}
                      value={form.subscriptionPlan}
                      onChange={(e) => setForm({ ...form, subscriptionPlan: e.target.value })}
                    />
                  </div>
                  <div>
                    <Input className="create-organization-field" label="Start Date" type="date" icon={CalendarDays} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div>
                    <Input className="create-organization-field" label="End Date" type="date" icon={CalendarDays} error={formErrors.endDate} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                  <div>
                    <Select
                      className="create-organization-field"
                      label="Status"
                      icon={CheckCircle2}
                      options={ORGANIZATION_STATUS_OPTIONS}
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Registered Address</label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-0 top-0 flex pt-3.5 pl-3.5">
                          <MapPinned className="h-4 w-4 text-slate-400" />
                        </div>
                        <textarea
                          className="create-organization-field min-h-[88px] w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-[#0f55f7] focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                          value={form.registeredAddress}
                          onChange={(e) => setForm({ ...form, registeredAddress: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  {!editingOrg && (
                    <div>
                      <Input className="create-organization-field" label="Password" type="password" required icon={Lock} error={formErrors.password} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 characters" autoComplete="new-password" />
                    </div>
                  )}
                  {!editingOrg && (
                    <div>
                      <Input className="create-organization-field" label="Confirm Password" type="password" required icon={Lock} error={formErrors.confirmPassword} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Re-enter password" autoComplete="new-password" />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <footer className="create-organization-modal__footer flex shrink-0 flex-col-reverse items-stretch gap-3 border-t border-[#e2e8f0] bg-[#f8fafc] px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-8">
                <Button variant="secondary" className="create-organization-modal__cancel" onClick={() => setFormOpen(false)}>Cancel</Button>
                <Button variant="success" className="create-organization-modal__submit" onClick={saveOrganization} loading={saving} icon={editingOrg ? null : ArrowRight} iconPosition="right">{editingOrg ? 'Save Changes' : 'Create Organization'}</Button>
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Modal open={Boolean(deleteOrg)} onClose={() => !deleting && setDeleteOrg(null)} title="Delete organization?" size="sm" footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setDeleteOrg(null)} disabled={deleting}>Cancel</Button><Button variant="danger" loading={deleting} onClick={confirmDeleteOrganization}>{deleting ? 'Deleting...' : 'Delete Organization'}</Button></div>}><p className="text-sm leading-6 text-slate-600">Are you sure you want to delete <b>{deleteOrg?.name}</b>? This action cannot be undone.</p></Modal>
    </div>
  )
}
