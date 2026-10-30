import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, Globe, Mail, MapPin, Phone, User, Upload, Image as ImageIcon, Trash2, ShieldCheck,
} from 'lucide-react'
import {
  getApiErrorMessage, normalizeOrganization, organizationApi, readStoredOrganizationId,
} from '@shared/services/apiServices'
import {
  fetchOrganizationSettings, saveOrganizationSettings, uploadOrganizationLogo, removeOrganizationLogo,
} from '@shared/services/organizationSettingsService'
import { readLocalSettings, writeLocalSettings } from '@shared/services/localSettingsStore'
import { INDUSTRIES } from '@features/organization/data/settingsConstants'
import {
  InputField, SelectField, SearchableCountrySelect, SectionHeader, SettingsErrorState,
  SettingsSkeleton,
} from './settingsUi'

const normalizePhone = (value) => String(value ?? '').replace(/\D/g, '').slice(0, 15)
const isValidPhone = (value) => /^\d{7,15}$/.test(value)

const MAX_LOGO_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']

const DEFAULT_FORM = {
  organizationName: '',
  organizationCode: '',
  industry: '',
  website: '',
  email: '',
  phone: '',
  status: 'Active',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  contactPerson: '',
  alternatePhone: '',
  supportEmail: '',
  logoUrl: '',
}

const readStoredJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null')
  } catch {
    return null
  }
}

const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== ''

const organizationToForm = (organization = {}) => ({
  organizationName: organization.organizationName ?? organization.name ?? '',
  email: organization.email ?? organization.organizationEmail ?? '',
  phone: normalizePhone(organization.phone),
  website: organization.website ?? '',
  industry: organization.industry ?? '',
  country: organization.country ?? '',
  status: organization.status ?? organization.organizationStatus ?? '',
  organizationCode: organization.organizationCode ?? organization.code ?? '',
  logoUrl: organization.logoUrl ?? organization.logo ?? '',
  addressLine1: organization.addressLine1 ?? organization.address ?? '',
  addressLine2: organization.addressLine2 ?? '',
  city: organization.city ?? '',
  state: organization.state ?? '',
  postalCode: organization.postalCode ?? organization.zipCode ?? '',
  contactPerson: organization.contactPerson ?? organization.contactName ?? '',
  alternatePhone: normalizePhone(organization.alternatePhone),
  supportEmail: organization.supportEmail ?? '',
})

// API settings may contain blank placeholders. Never let those erase a known organization value.
const mergePopulatedFormValues = (...sources) => sources.reduce((merged, source) => {
  Object.entries(source || {}).forEach(([key, value]) => {
    if (hasValue(value)) merged[key] = value
  })
  return merged
}, { ...DEFAULT_FORM })

const getSessionOrganization = () => {
  const storedOrganization = readStoredJson('organization') || {}
  const storedUser = readStoredJson('user') || {}
  return {
    ...storedUser,
    ...storedOrganization,
    organizationName: storedOrganization.organizationName
      ?? storedOrganization.name
      ?? storedUser.organizationName
      ?? storedUser.organisationName
      ?? localStorage.getItem('organizationName')
      ?? localStorage.getItem('organization_name')
      ?? '',
    email: storedOrganization.email
      ?? storedOrganization.organizationEmail
      ?? storedUser.organizationEmail
      ?? localStorage.getItem('organizationEmail')
      ?? '',
  }
}

const LogoUploader = ({ logoUrl, onUploaded, onRemove, notify }) => {
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const validateFile = (file) => {
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      return 'Please upload a PNG, JPG, WebP or SVG image.'
    }
    if (file.size > MAX_LOGO_SIZE) {
      return 'Logo must be 2 MB or smaller.'
    }
    return ''
  }

  const readDimensions = (file) =>
    new Promise((resolve) => {
      const image = new Image()
      const url = URL.createObjectURL(file)
      image.onload = () => {
        URL.revokeObjectURL(url)
        resolve({ width: image.width, height: image.height })
      }
      image.onerror = () => resolve(null)
      image.src = url
    })

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    const dimensions = await readDimensions(file)
    if (dimensions && (dimensions.width < 64 || dimensions.height < 64)) {
      setError('Logo should be at least 64×64 pixels for crisp previews.')
      return
    }
    setError('')
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setUploading(true)
    try {
      const result = await uploadOrganizationLogo(file)
      onUploaded(result?.logoUrl || result?.url || objectUrl)
      notify('Organization logo updated successfully.')
    } catch (uploadError) {
      notify(getApiErrorMessage(uploadError, 'Unable to upload logo. Please try again.'), 'error')
      // Keep the local preview so the admin can retry without re-selecting.
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    try {
      await removeOrganizationLogo()
      onRemove()
      notify('Organization logo removed.')
    } catch (removeError) {
      notify(getApiErrorMessage(removeError, 'Unable to remove logo. Please try again.'), 'error')
    }
  }

  const displayUrl = preview || logoUrl

  return (
    <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-700/50">
      <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Organization Logo</p>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
          {displayUrl ? (
            <img src={displayUrl} alt="Organization logo preview" className="h-full w-full object-contain" />
          ) : (
            <ImageIcon className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={handleFile} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Upload className="w-4 h-4" />
            {logoUrl || preview ? 'Replace Logo' : 'Upload Logo'}
          </button>
          {(logoUrl || preview) && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        PNG, JPG, WebP or SVG · max 2 MB · at least 64×64 px. Used across the navbar, invoices, email templates, reports and PDF exports.
      </p>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

export default function OrganizationTab({ onNotify, onDirtyChange, editable = true }) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settingsApiAvailable, setSettingsApiAvailable] = useState(false)
  const baselineRef = useRef(DEFAULT_FORM)

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const hasChanges = () =>
    Object.entries(form).some(([key, value]) => String(baselineRef.current[key] ?? '') !== String(value ?? ''))

  const notify = useCallback((message, type = 'success') => onNotify?.(message, type), [onNotify])

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setLoadError(false)
      try {
        const storedId = readStoredOrganizationId()
        if (!storedId) throw new Error('Your organization session is missing an organization ID. Please sign in again.')
        const sessionValues = organizationToForm(getSessionOrganization())
        let apiValues = {}
        try {
          apiValues = organizationToForm(normalizeOrganization(await organizationApi.getById(storedId)))
        } catch {
          // A partial session still provides the organization identity while the API is unavailable.
        }
        let extendedValues = {}
            /* Base profile API unavailable — continue with defaults. */
        try {
          const extended = await fetchOrganizationSettings()
          if (active && extended && typeof extended === 'object') {
            setSettingsApiAvailable(true)
            extendedValues = normalizeExtendedSettings(extended)
          }
        } catch {
          // Extended settings endpoint not deployed — use locally saved values (if any)
          // so previously entered address/contact fields are not lost.
          const local = readLocalSettings('organization', {})
          extendedValues = normalizeExtendedSettings(local)
        }
        if (active) {
          const merged = mergePopulatedFormValues(sessionValues, apiValues, extendedValues)
          setForm(merged)
          baselineRef.current = merged
        }
      } catch {
        if (active) setLoadError(true)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  useEffect(() => {
    onDirtyChange?.(hasChanges())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  const phoneError = form.phone && !isValidPhone(form.phone) ? 'Enter a valid phone number with 7 to 15 digits.' : ''
  const alternatePhoneError = form.alternatePhone && !isValidPhone(form.alternatePhone) ? 'Enter a valid phone number with 7 to 15 digits.' : ''
  const emailError = form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Enter a valid email address.' : ''
  const supportEmailError = form.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.supportEmail) ? 'Enter a valid email address.' : ''

  const handleSave = async () => {
    if (!(form.organizationName ?? '').trim()) {
      notify('Organization name is required.', 'error')
      return
    }
    if (phoneError || alternatePhoneError || emailError || supportEmailError) {
      notify('Please fix the highlighted fields before saving.', 'error')
      return
    }
    setSaving(true)
    const payload = {
      organizationName: form.organizationName.trim(),
      organizationCode: form.organizationCode,
      industry: form.industry,
      website: form.website,
      email: form.email,
      phone: form.phone,
      status: form.status,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      country: form.country,
      contactPerson: form.contactPerson,
      alternatePhone: form.alternatePhone,
      supportEmail: form.supportEmail,
    }
    try {
      if (settingsApiAvailable) {
        await saveOrganizationSettings(payload)
      } else {
        const storedId = readStoredOrganizationId()
        if (!storedId) throw new Error('Your organization session is missing an organization ID. Please sign in again.')
        await organizationApi.update(storedId, {
          organizationName: payload.organizationName,
          email: payload.email,
          phone: payload.phone,
          industry: payload.industry,
          country: payload.country,
          website: payload.website,
        })
        // Extended fields (address, contact) persist locally until the settings API is deployed.
        writeLocalSettings('organization', payload)
      }
      notify('Organization settings updated successfully.')
      baselineRef.current = { ...form }
    } catch (error) {
      notify(getApiErrorMessage(error, 'Unable to save organization settings.'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUploaded = (url) => {
    setField('logoUrl', url)
  }
  const handleLogoRemoved = () => {
    setField('logoUrl', '')
  }

  if (loading) return <SettingsSkeleton />
  if (loadError) {
    return <SettingsErrorState message="Unable to load organization settings." onRetry={() => { setLoadError(false); setLoading(true); window.location.reload() }} />
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Organization Profile */}
      <section>
        <SectionHeader title="Organization Profile" description="Core identity used across invoices, emails and reports." />
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField label="Organization Name *" value={form.organizationName ?? ''} onChange={(event) => setField('organizationName', event.target.value)} icon={Building2} error={!(form.organizationName ?? '').trim() ? 'Organization name is required.' : ''} />
            <InputField label="Organization Code" value={form.organizationCode} onChange={(event) => setField('organizationCode', event.target.value)} icon={ShieldCheck} hint="Short code used in invoice number formats (e.g. {ORG})." />
            <SelectField label="Industry" value={form.industry} onChange={(event) => setField('industry', event.target.value)} options={INDUSTRIES} icon={Globe} />
            <InputField label="Website" type="url" value={form.website} onChange={(event) => setField('website', event.target.value)} icon={Globe} placeholder="https://example.com" />
            <InputField label="Primary Email *" type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} icon={Mail} error={emailError} />
            <InputField label="Primary Phone *" type="tel" inputMode="numeric" maxLength={15} value={form.phone} onChange={(event) => setField('phone', normalizePhone(event.target.value))} icon={Phone} error={phoneError} />
            <SelectField label="Status" value={form.status} onChange={(event) => setField('status', event.target.value)} options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
              { value: 'Suspended', label: 'Suspended' },
            ]} icon={ShieldCheck} />
          </div>
        </div>
      </section>

      {/* Branding */}
      <section>
        <SectionHeader title="Branding" description="Your logo is reused in the navbar, invoices, email templates, reports and PDF exports." />
        <LogoUploader
          logoUrl={form.logoUrl}
          onUploaded={handleLogoUploaded}
          onRemove={handleLogoRemoved}
          notify={notify}
        />
      </section>

      {/* Address */}
      <section>
        <SectionHeader title="Address" description="Primary organization address shown on invoices and documents." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField label="Address Line 1" value={form.addressLine1} onChange={(event) => setField('addressLine1', event.target.value)} icon={MapPin} />
          <InputField label="Address Line 2" value={form.addressLine2} onChange={(event) => setField('addressLine2', event.target.value)} />
          <InputField label="City" value={form.city} onChange={(event) => setField('city', event.target.value)} />
          <InputField label="State" value={form.state} onChange={(event) => setField('state', event.target.value)} />
          <InputField label="Postal Code" value={form.postalCode} onChange={(event) => setField('postalCode', event.target.value)} />
          <SearchableCountrySelect label="Country" value={form.country} onChange={(value) => setField('country', value)} icon={MapPin} />
        </div>
      </section>

      {/* Contact Information */}
      <section>
        <SectionHeader title="Contact Information" description="Who customers and the platform should reach for support." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField label="Contact Person" value={form.contactPerson} onChange={(event) => setField('contactPerson', event.target.value)} icon={User} />
          <InputField label="Alternate Phone" type="tel" inputMode="numeric" maxLength={15} value={form.alternatePhone} onChange={(event) => setField('alternatePhone', normalizePhone(event.target.value))} icon={Phone} error={alternatePhoneError} />
          <InputField label="Support Email" type="email" value={form.supportEmail} onChange={(event) => setField('supportEmail', event.target.value)} icon={Mail} error={supportEmailError} />
        </div>
      </section>

      {/* Save */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !editable}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0f55f7] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
        >
          {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <SaveIcon />}
          {saving ? 'Saving...' : 'Save Organization Settings'}
        </button>
      </div>
    </motion.div>
  )
}

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
)

/* Normalize the extended settings payload so every field is a safe string —
   an empty/missing object must never inject `undefined` into the form. */
const normalizeExtendedSettings = (settings) => {
  const source = settings?.organization ?? settings?.data ?? settings
  if (!source || typeof source !== 'object') return {}
  return {
    organizationName: source.organizationName ?? source.name ?? '',
    organizationCode: source.organizationCode ?? source.code ?? '',
    industry: source.industry ?? '',
    website: source.website ?? '',
    email: source.email ?? '',
    phone: source.phone ? String(source.phone).replace(/\D/g, '') : '',
    status: source.status ?? '',
    addressLine1: source.addressLine1 ?? source.address ?? '',
    addressLine2: source.addressLine2 ?? '',
    city: source.city ?? '',
    state: source.state ?? '',
    postalCode: source.postalCode ?? source.zipCode ?? '',
    country: source.country ?? '',
    contactPerson: source.contactPerson ?? source.contactName ?? '',
    alternatePhone: source.alternatePhone ? String(source.alternatePhone).replace(/\D/g, '') : '',
    supportEmail: source.supportEmail ?? '',
    logoUrl: source.logoUrl ?? source.logo ?? '',
  }
}
