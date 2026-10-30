import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail } from 'lucide-react'
import { getApiErrorMessage } from '@shared/services/apiServices'
import { fetchNotificationPreferences, saveNotificationPreferences } from '@shared/services/organizationSettingsService'
import { readLocalSettings, writeLocalSettings } from '@shared/services/localSettingsStore'
import { NOTIFICATION_EVENTS, NOTIFICATION_TIMING_EVENTS } from '@features/organization/data/settingsConstants'
import { SectionHeader, SettingsErrorState, SettingsSkeleton, Toggle } from './settingsUi'

const LOCAL_KEY = 'notifications'

const buildDefaultPrefs = () =>
  NOTIFICATION_EVENTS.reduce((prefs, event) => {
    prefs[event.id] = {
      inApp: event.inApp,
      email: event.email,
      timing: event.timing ? { ...event.timing } : null,
    }
    return prefs
  }, {})

const TIMING_OPTIONS = {
  subscription_expiry: [
    { value: 3, label: '3 days before' },
    { value: 7, label: '7 days before' },
    { value: 14, label: '14 days before' },
    { value: 30, label: '30 days before' },
  ],
  payment_pending: [
    { value: 1, label: '1 day before due date' },
    { value: 3, label: '3 days before due date' },
    { value: 7, label: '7 days before due date' },
  ],
  class_reminder: [
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 1440, label: '1 day before' },
  ],
}

const TimingSelect = ({ eventId, timing, onChange }) => {
  const unit = timing?.unit || 'days'
  const options = TIMING_OPTIONS[eventId] || []
  return (
    <select
      value={String(timing?.value ?? '')}
      onChange={(event) => onChange(eventId, Number(event.target.value), unit)}
      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 focus:border-[#0f55f7]/40 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      aria-label={`Timing for ${eventId}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  )
}

export default function NotificationsTab({ onNotify, onDirtyChange, editable = true }) {
  const [prefs, setPrefs] = useState(buildDefaultPrefs)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [usingLocalFallback, setUsingLocalFallback] = useState(false)
  const baselineRef = useRef(buildDefaultPrefs())

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setLoadError(false)
      let data
      let local = false
      try {
        data = await fetchNotificationPreferences()
        const source = data?.notifications ?? data?.preferences ?? data?.data ?? data
        if (source && typeof source === 'object') data = source
      } catch {
        data = readLocalSettings(LOCAL_KEY, {})
        local = true
      }
      if (active) {
        const merged = buildDefaultPrefs()
        Object.entries(data).forEach(([eventId, value]) => {
          if (!merged[eventId] || !value || typeof value !== 'object') return
          merged[eventId] = {
            inApp: value.inApp ?? value.in_app ?? merged[eventId].inApp,
            email: value.email ?? merged[eventId].email,
            timing: value.timing ? { ...value.timing } : merged[eventId].timing,
          }
        })
        setPrefs(merged)
        baselineRef.current = JSON.parse(JSON.stringify(merged))
        setUsingLocalFallback(local)
        setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const hasChanges = () => JSON.stringify(prefs) !== JSON.stringify(baselineRef.current)

  useEffect(() => {
    onDirtyChange?.(hasChanges())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs])

  const setEventField = (eventId, field, value) => {
    setPrefs((current) => ({
      ...current,
      [eventId]: { ...current[eventId], [field]: value },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = { preferences: prefs }
    try {
      await saveNotificationPreferences(payload)
      onNotify?.('Notification preferences updated successfully.')
    } catch (error) {
      writeLocalSettings(LOCAL_KEY, prefs)
      onNotify?.(getApiErrorMessage(error, 'Notification preferences saved locally. The notifications API is not connected yet.'), 'info')
      setUsingLocalFallback(true)
    }
    baselineRef.current = JSON.parse(JSON.stringify(prefs))
    setSaving(false)
  }

  if (loading) return <SettingsSkeleton />
  if (loadError) {
    return <SettingsErrorState message="Unable to load notification preferences." onRetry={() => { setLoadError(false); setLoading(true); window.location.reload() }} />
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <SectionHeader
        title="Notification Preferences"
        description="Choose which business events generate in-app and email notifications. Timing applies where the backend supports scheduled reminders."
      />

      <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700/50">
        <div className="hidden grid-cols-[minmax(0,1fr)_120px_120px_180px] gap-4 border-b border-slate-100 bg-slate-50/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-700/50 dark:bg-slate-800/40 md:grid">
          <span>Event</span>
          <span className="text-center">In-App</span>
          <span className="text-center">Email</span>
          <span className="text-right">Timing</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {NOTIFICATION_EVENTS.map((event) => {
            const preference = prefs[event.id]
            if (!preference) return null
            const timingEnabled = NOTIFICATION_TIMING_EVENTS.includes(event.id)
            return (
              <div
                key={event.id}
                className="grid grid-cols-1 gap-3 px-5 py-3.5 md:grid-cols-[minmax(0,1fr)_120px_120px_180px] md:items-center md:gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{event.label}</p>
                  <p className="text-xs text-slate-400">
                    {preference.inApp && 'In-app'} {preference.inApp && preference.email && '·'} {preference.email && 'Email'}
                    {!preference.inApp && !preference.email && 'Disabled'}
                  </p>
                </div>
                <div className="flex items-center justify-between md:justify-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 md:hidden">
                    <Bell className="w-3.5 h-3.5" /> In-App
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preference.inApp}
                    aria-label={`${event.label} in-app notifications`}
                    onClick={() => setEventField(event.id, 'inApp', !preference.inApp)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${preference.inApp ? 'bg-[#0f55f7]' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${preference.inApp ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between md:justify-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 md:hidden">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preference.email}
                    aria-label={`${event.label} email notifications`}
                    onClick={() => setEventField(event.id, 'email', !preference.email)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${preference.email ? 'bg-[#0f55f7]' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${preference.email ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex justify-start md:justify-end">
                  {timingEnabled ? (
                    <TimingSelect
                      eventId={event.id}
                      timing={preference.timing}
                      onChange={(id, value, unit) => setEventField(id, 'timing', { unit, value })}
                    />
                  ) : (
                    <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-500 dark:border-slate-700/50 dark:bg-slate-800/30 dark:text-slate-400">
        <Toggle
          label="Email Digest"
          description="Receive a single daily digest instead of instant emails for non-critical events."
          checked={prefs.digest?.enabled ?? false}
          onChange={() =>
            setPrefs((current) => ({
              ...current,
              digest: { enabled: !(current.digest?.enabled ?? false) },
            }))
          }
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !editable}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0f55f7] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
        >
          {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <SaveIcon />}
          {saving ? 'Saving...' : 'Save Notification Preferences'}
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
