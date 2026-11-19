import { useEffect, useState } from 'react'
import { Megaphone } from 'lucide-react'
import { useAuth } from '@shared/hooks/useAuth'
import { mentorAnnouncementService } from '@shared/services/mentorAnnouncementService'
import { mentorNotificationRecipient, subscribeNotificationRefresh } from '@shared/utils/notificationRefresh'
import MentorAnnouncementDialog from './MentorAnnouncementDialog'
import { notificationLoadError } from '@shared/utils/notificationLoadError'

export default function MentorAnnouncements() {
  const { user } = useAuth()
  const mentorId = mentorNotificationRecipient(user)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  useEffect(() => {
    if (!mentorId) return undefined
    const controller = new AbortController()
    let pending = false
    const load = async () => {
      if (pending) return
      pending = true
      try {
        const result = await mentorAnnouncementService.list(mentorId, controller.signal)
        if (!controller.signal.aborted) { setRows(result); setError('') }
      } catch (failure) {
        if (!controller.signal.aborted) setError(notificationLoadError(failure, 'HR announcements'))
      } finally { pending = false; if (!controller.signal.aborted) setLoading(false) }
    }
    load()
    const unsubscribe = subscribeNotificationRefresh(load)
    return () => { controller.abort(); unsubscribe() }
  }, [mentorId])
  const open = row => {
    setSelected(row)
    mentorAnnouncementService.markRead(row.id)
    setRows(current => current.map(item => item.id === row.id ? { ...item, isRead: true } : item))
    window.dispatchEvent(new Event('kini:notifications-changed'))
  }
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900" aria-label="HR announcements">
    <h2 className="mb-3 flex items-center gap-3 text-lg font-bold text-[#143957] dark:text-white"><Megaphone className="h-5 w-5 text-orange-500" />HR Announcements</h2>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {!mentorId ? <p className="text-sm text-slate-500">Waiting for mentor profile…</p> : loading ? <p role="status">Loading announcements…</p>
      : !error && !rows.length ? <p className="text-sm text-slate-500">No active HR announcements.</p> : null}
    <div className="divide-y divide-slate-100 dark:divide-slate-800">{rows.map(row => <button key={row.id} type="button" onClick={() => open(row)} className="flex w-full items-start justify-between gap-3 py-3 text-left">
      <span><span className="block font-semibold text-slate-900 dark:text-white">{row.title}</span><span className="mt-1 block text-xs text-slate-500">{row.createdBy || 'HR'} · {new Date(row.publishDate).toLocaleString('en-IN')}</span></span>
      {!row.isRead && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">New</span>}
    </button>)}</div>
    {selected && <MentorAnnouncementDialog key={selected.announcementId} announcement={selected} onClose={() => setSelected(null)} />}
  </section>
}
