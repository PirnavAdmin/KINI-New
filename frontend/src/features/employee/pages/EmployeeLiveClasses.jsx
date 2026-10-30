import { useCallback, useEffect, useState } from 'react'
import { Calendar, Clock, ExternalLink, Play, RefreshCw, Video } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Modal from '@shared/components/Modal'
import { liveClassService } from '@features/live-classes/services/liveClassService'
import { isLiveClassClosed, normalizeLiveClassList } from '@features/live-classes/utils/liveClassMappers'

const JOINABLE_STATUSES = ['live', 'upcoming', 'scheduled']

const getJoinUrl = (payload) => {
  if (typeof payload === 'string') return payload
  return payload?.joinUrl || payload?.meetingUrl || payload?.meetingLink || payload?.url || payload?.link || ''
}

export default function EmployeeLiveClasses() {
  const [classes, setClasses] = useState([])
  const [viewingClass, setViewingClass] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [joiningId, setJoiningId] = useState(null)

  const loadClasses = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await liveClassService.list({ page: 1, pageSize: 1000 })
      setClasses(normalizeLiveClassList(response))
    } catch (requestError) {
      setClasses([])
      setError(requestError?.response?.data?.message || 'Live classes could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadClasses() }, [loadClasses])

  const openMeeting = (url, message = 'Opening meeting link...') => {
    if (!url) return toast.error('No meeting link is available for this class.')
    window.open(url, '_blank', 'noopener,noreferrer')
    toast.success(message)
  }

  const handleJoin = async (classItem, event) => {
    event?.stopPropagation()
    if (!classItem.id) return openMeeting(classItem.meetingUrl, 'Joining class...')
    setJoiningId(classItem.id)
    try {
      const response = await liveClassService.join(classItem.id)
      openMeeting(getJoinUrl(response) || classItem.meetingUrl, 'Joining class...')
    } catch (requestError) {
      toast.error(requestError?.response?.data?.message || 'Unable to join this class.')
    } finally {
      setJoiningId(null)
    }
  }

  const handleRefresh = async () => {
    await loadClasses()
    toast.success('Schedule refreshed')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div><h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Live Classes</h1><p className="text-sm text-slate-500">Upcoming and past live sessions</p></div>
        <button onClick={handleRefresh} disabled={loading} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 shadow-sm self-start"><RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
      </div>

      {loading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map((item) => <div key={item} className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse" />)}</div>}
      {!loading && error && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700"><p>{error}</p><button onClick={loadClasses} className="mt-3 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white">Try again</button></div>}
      {!loading && !error && classes.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Video className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-3 text-base font-bold text-slate-900">No live classes assigned</h2><p className="mt-1 text-sm text-slate-500">Your HR or mentor will publish live sessions here.</p></div>}

      {!loading && !error && classes.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((classItem, index) => <motion.div key={classItem.id || `${classItem.title}-${index}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * index }} className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md hover:border-blue-500/25 transition-all cursor-pointer" onClick={() => setViewingClass(classItem)}>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3"><Video className="w-5 h-5 text-blue-600" /></div>
          <div className="flex items-start justify-between gap-2"><div className="min-w-0 flex-1"><h3 className="text-sm font-bold text-slate-900 mb-1">{classItem.title}</h3><p className="text-xs text-slate-400 mb-2">{classItem.mentorName}</p><div className="space-y-1 text-xs text-slate-400 mb-3"><p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {classItem.dateLabel || 'Date not available'}</p><p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {classItem.timeLabel || 'Time not available'}</p></div></div><div className="flex items-center gap-1 shrink-0" onClick={event => event.stopPropagation()}>{JOINABLE_STATUSES.includes(classItem.status) && <button onClick={(event) => handleJoin(classItem, event)} disabled={joiningId === classItem.id} className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-60" title="Join Class"><Play className="w-4 h-4" /></button>}{classItem.meetingUrl && !isLiveClassClosed(classItem) && <button onClick={() => openMeeting(classItem.meetingUrl)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-500" title="Open Meeting Link"><ExternalLink className="w-4 h-4" /></button>}</div></div>
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-slate-100 text-slate-500">{classItem.statusLabel || classItem.status}</span>
        </motion.div>)}
      </div>}

      <Modal open={!!viewingClass} onClose={() => setViewingClass(null)} title={viewingClass?.title} description="Class details" size="md" footer={<div className="flex justify-end gap-3"><button onClick={() => setViewingClass(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Close</button>{viewingClass && JOINABLE_STATUSES.includes(viewingClass.status) && <button onClick={() => handleJoin(viewingClass)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold"><Play className="w-4 h-4" /> Join Class</button>}</div>}>
        {viewingClass && <div className="space-y-4"><div className="rounded-lg border border-slate-100 p-3"><p className="text-xs text-slate-400">Instructor</p><p className="text-sm font-medium text-slate-900 mt-0.5">{viewingClass.mentorName}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-lg border border-slate-100 p-3"><p className="text-xs text-slate-400">Date</p><p className="text-sm font-medium text-slate-900 mt-0.5">{viewingClass.dateLabel}</p></div><div className="rounded-lg border border-slate-100 p-3"><p className="text-xs text-slate-400">Time</p><p className="text-sm font-medium text-slate-900 mt-0.5">{viewingClass.timeLabel}</p></div></div><div className="rounded-lg border border-slate-100 p-3"><p className="text-xs text-slate-400">Status</p><p className="text-sm font-medium text-slate-900 mt-0.5">{viewingClass.statusLabel || viewingClass.status}</p></div>{viewingClass.meetingUrl && !isLiveClassClosed(viewingClass) && <button onClick={() => openMeeting(viewingClass.meetingUrl)} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-50 text-sm font-medium text-slate-700 hover:bg-slate-100"><ExternalLink className="w-4 h-4" /> Open Meeting Link</button>}</div>}
      </Modal>
    </div>
  )
}
