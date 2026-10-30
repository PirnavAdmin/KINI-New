import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Clock, Coins, Globe2 } from 'lucide-react'
import { fetchGeneralSettings, saveGeneralSettings } from '@shared/services/organizationSettingsService'
import { readLocalSettings, writeLocalSettings } from '@shared/services/localSettingsStore'
import {
  CURRENCIES, DATE_FORMATS, mergeDefined, TIMEZONES, TIME_FORMATS,
} from '@features/organization/data/settingsConstants'
import {
  SelectField, SectionHeader, SettingsErrorState, SettingsSkeleton,
} from './settingsUi'

const LOCAL_KEY = 'general'

const DEFAULT_FORM = {
  dateFormat: 'DD MMM YYYY',
  timeFormat: '12h',
  currency: 'INR',
  timeZone: 'Asia/Kolkata',
}

const PreviewChip = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
    <p className="text-xs font-medium text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</p>
  </div>
)

export default function GeneralTab({ onNotify, onDirtyChange, editable = true }) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [saving, setSaving] = useState(false)
  const baselineRef = useRef(DEFAULT_FORM)

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setLoadError(false)
      let data
      try {
        data = await fetchGeneralSettings()
        const source = data?.general ?? data?.data ?? data
        if (source && typeof source === 'object') data = source
      } catch {
        data = readLocalSettings(LOCAL_KEY, {})
      }
      if (active) {
        const merged = mergeDefined(DEFAULT_FORM, data)
        setForm(merged)
        baselineRef.current = merged
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

  const handleSave = async () => {
    setSaving(true)
    const payload = { ...form }
    try {
      await saveGeneralSettings(payload)
      notify('General settings updated successfully.')
    } catch {
      writeLocalSettings(LOCAL_KEY, payload)
      notify('General settings saved locally. The settings API is not connected yet.', 'info')
    }
    baselineRef.current = { ...form }
    setSaving(false)
  }

  const notify = (message, type = 'success') => onNotify?.(message, type)

  if (loading) return <SettingsSkeleton />
  if (loadError) {
    return <SettingsErrorState message="Unable to load general settings." onRetry={() => { setLoadError(false); setLoading(true); window.location.reload() }} />
  }

  const dateOption = DATE_FORMATS.find((option) => option.value === form.dateFormat)
  const timeOption = TIME_FORMATS.find((option) => option.value === form.timeFormat)
  const currencyOption = CURRENCIES.find((option) => option.value === form.currency)
  const timeZoneOption = TIMEZONES.find((option) => option.value === form.timeZone)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <SectionHeader
        title="Localization"
        description="How dates, times, currency and time zones are displayed across classes, attendance, invoices, payments, notifications and reports."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-4">
          <SelectField
            label="Date Format"
            value={form.dateFormat}
            onChange={(event) => setField('dateFormat', event.target.value)}
            options={DATE_FORMATS.map((option) => ({ value: option.value, label: option.label }))}
            icon={CalendarDays}
          />
          <SelectField
            label="Time Format"
            value={form.timeFormat}
            onChange={(event) => setField('timeFormat', event.target.value)}
            options={TIME_FORMATS.map((option) => ({ value: option.value, label: option.label }))}
            icon={Clock}
          />
        </div>
        <div className="space-y-4">
          <SelectField
            label="Currency"
            value={form.currency}
            onChange={(event) => setField('currency', event.target.value)}
            options={CURRENCIES.map((option) => ({ value: option.value, label: option.label }))}
            icon={Coins}
          />
          <SelectField
            label="Time Zone"
            value={form.timeZone}
            onChange={(event) => setField('timeZone', event.target.value)}
            options={TIMEZONES.map((option) => ({ value: option.value, label: option.label }))}
            icon={Globe2}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PreviewChip label="Date Preview" value={dateOption?.example || '—'} />
        <PreviewChip label="Time Preview" value={timeOption?.example || '—'} />
        <PreviewChip label="Currency" value={currencyOption?.label || '—'} />
        <PreviewChip label="Time Zone" value={timeZoneOption?.label || form.timeZone || '—'} />
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-500 dark:border-slate-700/50 dark:bg-slate-800/30 dark:text-slate-400">
        Changing the currency does not convert historical financial records. It controls display and new financial configuration per backend business rules.
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !editable}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0f55f7] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
        >
          {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <SaveIcon />}
          {saving ? 'Saving...' : 'Save General Settings'}
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
