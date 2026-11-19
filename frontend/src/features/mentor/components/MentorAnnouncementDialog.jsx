import { useEffect, useState } from 'react'
import Modal from '@shared/components/Modal'
import { mentorAnnouncementService } from '@shared/services/mentorAnnouncementService'

export default function MentorAnnouncementDialog({ announcement, onClose }) {
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!announcement) return undefined
    const controller = new AbortController()
    mentorAnnouncementService.detail(announcement.announcementId, controller.signal)
      .then(value => { if (!controller.signal.aborted) setDetail(value) })
      .catch(failure => { if (!controller.signal.aborted) setError(failure.response?.data?.message || failure.message || 'Unable to load announcement.') })
    return () => controller.abort()
  }, [announcement])
  return <Modal open={Boolean(announcement)} onClose={onClose} title={announcement?.title || 'HR announcement'}>
    {error ? <p role="alert">{error}</p> : detail
      ? <div className="space-y-4"><p className="whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-200">{detail.content}</p><p className="text-xs text-slate-500">{detail.createdBy || 'HR'} · {new Date(detail.publishDate).toLocaleString('en-IN')}</p></div>
      : <p role="status">Loading announcement…</p>}
  </Modal>
}
