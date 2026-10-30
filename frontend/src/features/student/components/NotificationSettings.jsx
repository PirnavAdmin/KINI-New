import { useState } from 'react'

export default function NotificationSettings() {
  const [settings, setSettings] = useState({ email: true, push: true, classReminders: true, careerUpdates: false })
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Notification Settings</h2>
      <div className="space-y-3">
        {Object.entries(settings).map(([key, enabled]) => (
          <label key={key} className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            <input className="peer sr-only" type="checkbox" checked={enabled} onChange={() => setSettings((current) => ({ ...current, [key]: !current[key] }))} />
            <span className="relative h-5 w-9 shrink-0 rounded-full bg-slate-200 transition peer-checked:bg-blue-600 dark:bg-slate-700 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-4" />
          </label>
        ))}
      </div>
    </section>
  )
}
