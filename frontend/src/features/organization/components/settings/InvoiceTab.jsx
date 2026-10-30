import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Image as ImageIcon, Upload, Trash2, Receipt, Building2,
} from 'lucide-react'
import { getApiErrorMessage, normalizeOrganization, organizationApi, readStoredOrganizationId } from '@shared/services/apiServices'
import { fetchInvoiceSettings, saveInvoiceSettings, uploadOrganizationLogo } from '@shared/services/organizationSettingsService'
import { readLocalSettings, writeLocalSettings } from '@shared/services/localSettingsStore'
import {
  buildInvoiceNumberPreview, INVOICE_NUMBER_FORMATS, mergeDefined,
} from '@features/organization/data/settingsConstants'
import {
  InputField, SelectField, SectionHeader, SettingsErrorState, SettingsSkeleton, TextareaField, Toggle,
} from './settingsUi'

const LOCAL_KEY = 'invoice'

const DEFAULT_FORM = {
  useOrganizationLogo: true,
  invoiceLogoUrl: '',
  invoiceTitle: 'COURSE FEE INVOICE',
  headerText: '',
  footerText: 'Thank you for choosing our organization.',
  numberFormat: 'INV-{YEAR}-{NUMBER}',
  termsAndConditions: 'All fees once paid are non-refundable. Please retain this invoice for your records.',
  organizationName: '',
  logoUrl: '',
  address: '',
  city: '',
  state: '',
  country: '',
  phone: '',
  email: '',
  currency: 'INR',
}

const MAX_LOGO_SIZE = 2 * 1024 * 1024
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']

const InvoicePreview = ({ form, currencySymbol }) => {
  const numberPreview = buildInvoiceNumberPreview(form.numberFormat)
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-700/50">
        <div className="flex items-center gap-3">
          {(form.useOrganizationLogo && form.logoUrl) || (!form.useOrganizationLogo && form.invoiceLogoUrl) ? (
            <img
              src={form.useOrganizationLogo ? form.logoUrl : form.invoiceLogoUrl}
              alt="Invoice logo"
              className="h-12 w-12 rounded-lg object-contain"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
              <Building2 className="h-6 w-6 text-slate-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{form.organizationName || 'Your Organization'}</p>
            <p className="text-xs text-slate-400">{form.addressLine1 || ''}{form.addressLine1 && form.city ? `, ${form.city}` : ''}</p>
            <p className="text-xs text-slate-400">{form.phone ? `Phone: ${form.phone}` : ''}{form.email ? ` · ${form.email}` : ''}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black tracking-wide text-slate-900 dark:text-white">{form.invoiceTitle || 'INVOICE'}</p>
          <p className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {numberPreview}
          </p>
        </div>
      </div>

      {form.headerText && <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{form.headerText}</p>}

      <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="font-semibold uppercase tracking-wider text-slate-400">Billed To</p>
          <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">Sample Customer</p>
          <p className="text-slate-400">customer@example.com</p>
        </div>
        <div className="text-right">
          <p className="font-semibold uppercase tracking-wider text-slate-400">Invoice Date</p>
          <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>

      <table className="mt-5 w-full text-xs">
        <thead>
          <tr className="border-b border-slate-100 text-left text-slate-400 dark:border-slate-700/50">
            <th className="pb-2 font-semibold">Description</th>
            <th className="pb-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody className="text-slate-700 dark:text-slate-300">
          <tr className="border-b border-slate-50 dark:border-slate-700/30">
            <td className="py-2.5">Sample Course — Course Fee</td>
            <td className="py-2.5 text-right">{currencySymbol}12,000</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-4 ml-auto w-full max-w-[220px] space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex justify-between"><span>Subtotal</span><span>{currencySymbol}12,000</span></div>
        <div className="flex justify-between"><span>Discount</span><span>-{currencySymbol}1,000</span></div>
        <div className="flex justify-between"><span>Tax (18%)</span><span>{currencySymbol}1,980</span></div>
        <div className="flex justify-between border-t border-slate-100 pt-1.5 text-sm font-bold text-slate-900 dark:border-slate-700/50 dark:text-white">
          <span>Total</span><span>{currencySymbol}12,980</span>
        </div>
      </div>

      {form.termsAndConditions && (
        <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
          <p className="font-semibold text-slate-600 dark:text-slate-300">Terms & Conditions</p>
          <p className="mt-1 whitespace-pre-line">{form.termsAndConditions}</p>
        </div>
      )}

      {form.footerText && (
        <div className="mt-5 border-t border-slate-100 pt-3 text-center text-[11px] text-slate-400 dark:border-slate-700/50">
          {form.footerText}
        </div>
      )}
    </div>
  )
}

const InvoiceLogoUploader = ({ logoUrl, onUploaded, onRemove, notify }) => {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setError('Please upload a PNG, JPG, WebP or SVG image.')
      return
    }
    if (file.size > MAX_LOGO_SIZE) {
      setError('Logo must be 2 MB or smaller.')
      return
    }
    setError('')
    setUploading(true)
    const objectUrl = URL.createObjectURL(file)
    try {
      const result = await uploadOrganizationLogo(file)
      onUploaded(result?.logoUrl || result?.url || objectUrl)
      notify('Invoice logo updated successfully.')
    } catch (uploadError) {
      notify(getApiErrorMessage(uploadError, 'Unable to upload invoice logo.'), 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={handleFile} />
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
          {logoUrl ? <img src={logoUrl} alt="Invoice logo" className="h-full w-full object-contain" /> : <ImageIcon className="h-6 w-6 text-slate-300 dark:text-slate-600" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Upload className="w-3.5 h-3.5" />
            {logoUrl ? 'Replace' : 'Upload'}
          </button>
          {logoUrl && (
            <button
              type="button"
              onClick={() => { onRemove(); setError('') }}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-slate-400">PNG, JPG, WebP or SVG · max 2 MB.</p>
    </div>
  )
}

export default function InvoiceTab({ onNotify, onDirtyChange, editable = true }) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [usingLocalFallback, setUsingLocalFallback] = useState(false)
  const baselineRef = useRef(DEFAULT_FORM)

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const notify = (message, type = 'success') => onNotify?.(message, type)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setLoadError(false)
      let data
      let local = false
      try {
        data = await fetchInvoiceSettings()
        const source = data?.invoice ?? data?.data ?? data
        if (source && typeof source === 'object') data = source
      } catch {
        data = readLocalSettings(LOCAL_KEY, {})
        local = true
      }
      // Organization context shown in the invoice preview (logo, name, address, contact).
      try {
        const storedId = readStoredOrganizationId()
        if (storedId) {
          const organization = normalizeOrganization(await organizationApi.getById(storedId))
          data = {
            ...data,
            organizationName: organization.name,
            logoUrl: organization.logoUrl ?? organization.logo ?? '',
            addressLine1: organization.addressLine1 ?? organization.address ?? '',
            city: organization.city ?? '',
            phone: organization.phone ?? '',
            email: organization.email ?? '',
          }
        }
      } catch {
        /* Organization profile unavailable — preview uses defaults. */
      }
      if (active) {
        const merged = mergeDefined(DEFAULT_FORM, data)
        setForm(merged)
        baselineRef.current = merged
        setUsingLocalFallback(local)
        setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const hasChanges = () =>
    Object.entries(form).some(([key, value]) => String(baselineRef.current[key] ?? '') !== String(value ?? ''))

  useEffect(() => {
    onDirtyChange?.(hasChanges())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  const currencySymbol = useMemo(() => {
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED ' }
    return symbols[form.currency] || ''
  }, [form.currency])

  const handleSave = async () => {
    setSaving(true)
    const payload = { ...form }
    try {
      await saveInvoiceSettings(payload)
      notify('Invoice settings updated successfully.')
    } catch {
      writeLocalSettings(LOCAL_KEY, payload)
      notify('Invoice preview preferences saved in this browser. Invoice records and email delivery remain API-connected.', 'info')
      setUsingLocalFallback(true)
    }
    baselineRef.current = { ...form }
    setSaving(false)
  }

  if (loading) return <SettingsSkeleton />
  if (loadError) {
    return <SettingsErrorState message="Unable to load invoice settings." onRetry={() => { setLoadError(false); setLoading(true); window.location.reload() }} />
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left: settings */}
        <div className="space-y-6">
          <section>
            <SectionHeader title="Branding" description="Choose which logo appears on generated invoices." />
            <div className="rounded-xl border border-slate-100 px-4 dark:border-slate-700/50">
              <Toggle
                label="Use Organization Logo"
                description="Reuse the logo configured in Organization settings."
                checked={form.useOrganizationLogo}
                onChange={() => setField('useOrganizationLogo', !form.useOrganizationLogo)}
              />
            </div>
            {!form.useOrganizationLogo && (
              <div className="mt-3 rounded-xl border border-slate-100 p-4 dark:border-slate-700/50">
                <InvoiceLogoUploader
                  logoUrl={form.invoiceLogoUrl}
                  onUploaded={(url) => setField('invoiceLogoUrl', url)}
                  onRemove={() => setField('invoiceLogoUrl', '')}
                  notify={onNotify}
                />
              </div>
            )}
          </section>

          <section>
            <SectionHeader title="Invoice Header" description="The title and lead text at the top of the invoice." />
            <div className="space-y-4">
              <InputField label="Invoice Title" value={form.invoiceTitle} onChange={(event) => setField('invoiceTitle', event.target.value)} icon={FileText} hint="Example: COURSE FEE INVOICE" />
              <TextareaField label="Header Text" rows={2} value={form.headerText} onChange={(event) => setField('headerText', event.target.value)} placeholder="Optional short message under the header" />
            </div>
          </section>

          <section>
            <SectionHeader title="Invoice Footer" description="Closing message shown at the bottom of the invoice." />
            <TextareaField label="Footer Text" rows={2} value={form.footerText} onChange={(event) => setField('footerText', event.target.value)} placeholder="Thank you for choosing our organization." />
          </section>

          <section>
            <SectionHeader title="Invoice Number Format" description="The backend generates final unique numbers; this preview shows how they will look." />
            <div className="space-y-4">
              <SelectField
                label="Format"
                value={form.numberFormat}
                onChange={(event) => setField('numberFormat', event.target.value)}
                options={INVOICE_NUMBER_FORMATS.map((format) => ({ value: format.value, label: format.label }))}
                placeholder="Select a format"
              />
              <InputField label="Custom Format" value={form.numberFormat} onChange={(event) => setField('numberFormat', event.target.value)} icon={Receipt} hint="Tokens: {YEAR}, {ORG}, {NUMBER}" />
              <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
                <p className="text-xs font-medium text-slate-400">Preview</p>
                <p className="mt-1 font-mono text-sm font-bold text-[#0f55f7]">{buildInvoiceNumberPreview(form.numberFormat)}</p>
              </div>
            </div>
          </section>

          <section>
            <SectionHeader title="Terms & Conditions" description="Legal text printed at the bottom of every invoice." />
            <TextareaField rows={4} value={form.termsAndConditions} onChange={(event) => setField('termsAndConditions', event.target.value)} />
          </section>
        </div>

        {/* Right: live preview */}
        <div className="xl:sticky xl:top-20 xl:self-start">
          <SectionHeader title="Invoice Preview" description="Live preview — nothing here is stored." />
          <InvoicePreview form={form} currencySymbol={currencySymbol} />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !editable}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0f55f7] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
        >
          {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <SaveIcon />}
          {saving ? 'Saving...' : 'Save Invoice Settings'}
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
