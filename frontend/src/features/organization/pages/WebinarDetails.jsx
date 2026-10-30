import { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Video,
  Calendar,
  Clock,
  MapPin,
  Users,
  Download,
  Share2,
  Edit3,
  FileText,
  Image,
  Archive,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  XCircle,
  BookOpen,
  Target,
  ListChecks,
  Monitor,
} from 'lucide-react'
import {
  WEBINARS,
  WEBINAR_TYPES,
  getWebinarStatusStyle,
} from '../data/webinarMockData'

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-700" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-200 dark:bg-slate-700" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-slate-200 dark:bg-slate-700" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const style = getWebinarStatusStyle(status)
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  )
}

// ─── INFO CARD ────────────────────────────────────────────────────────────────

function InfoCard({ icon: Icon, label, value, className = '' }) {
  return (
    <div className={`rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{value || '—'}</p>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function WebinarDetails() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const event = useMemo(() => WEBINARS.find(w => w.id === eventId), [eventId])

  if (loading) {
    return (
      <div className="w-full px-4 py-4 sm:px-5 lg:px-6">
        <DetailSkeleton />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="w-full px-4 py-4 sm:px-5 lg:px-6">
        <button onClick={() => navigate('/organization/webinars')} className="inline-flex items-center gap-2 text-sm text-[#0f55f7] hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Webinars
        </button>
        <div className="flex flex-col items-center justify-center py-16">
          <XCircle className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Event Not Found</h2>
          <p className="mt-1 text-sm text-slate-400">The webinar or meeting you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const statusStyle = getWebinarStatusStyle(event.status)
  const hostInitials = event.hostName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // Mock attendees list
  const attendeeList = useMemo(() => {
    const names = [
      { name: 'Rahul Sharma', dept: 'Engineering', desig: 'Senior Developer' },
      { name: 'Priya Patel', dept: 'Design', desig: 'UX Designer' },
      { name: 'Amit Kumar', dept: 'Engineering', desig: 'Backend Developer' },
      { name: 'Sneha Reddy', dept: 'Data Science', desig: 'Data Analyst' },
      { name: 'Kabir Das', dept: 'Engineering', desig: 'DevOps Engineer' },
      { name: 'Ananya Singh', dept: 'HR', desig: 'HR Manager' },
      { name: 'Vikram Joshi', dept: 'Engineering', desig: 'Frontend Developer' },
      { name: 'Neha Gupta', dept: 'Sales', desig: 'Account Executive' },
    ]
    return names.slice(0, Math.min(event.attendees || 8, 8))
  }, [event])

  return (
    <div className="w-full px-4 py-4 sm:px-5 lg:px-6">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/organization/webinars')}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#0f55f7] hover:underline mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Webinars
      </motion.button>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f55f7] via-[#0f55f7]/90 to-[#06b6a8]/80 p-6 sm:p-8"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Video className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={event.status} />
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                {event.type}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{event.title}</h1>
            <p className="mt-2 text-sm text-white/80 max-w-2xl">{event.description}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Info Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            <InfoCard icon={Calendar} label="Date" value={event.date} />
            <InfoCard icon={Clock} label="Time" value={`${event.startTime} - ${event.endTime}`} />
            <InfoCard icon={Clock} label="Duration" value={event.duration} />
            <InfoCard icon={MapPin} label="Location" value={event.location} />
            <InfoCard icon={Users} label="Capacity" value={`${event.attendees} / ${event.capacity}`} />
            <InfoCard icon={Users} label="Available" value={event.capacity - event.attendees} />
            <InfoCard icon={Globe} label="Timezone" value={event.timezone} />
            <InfoCard icon={Monitor} label="Platform" value={event.meetingPlatform} />
          </motion.div>

          {/* Event Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5"
          >
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0f55f7]" />
              Event Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Description</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{event.description}</p>
              </div>
              {event.objectives && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Objectives
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{event.objectives}</p>
                </div>
              )}
              {event.learningOutcomes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <ListChecks className="w-3 h-3" /> Learning Outcomes
                  </p>
                  <ul className="space-y-1">
                    {event.learningOutcomes.map((lo, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                        {lo}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {event.requirements && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Requirements</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{event.requirements}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-xs">
                <span className="flex items-center gap-1 text-slate-400">
                  <Globe className="w-3 h-3" /> Language: {event.language}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" /> {event.timezone}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Video className="w-3 h-3" /> Recording: {event.recordingAvailable ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Agenda Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5"
          >
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0f55f7]" />
              Agenda Timeline
            </h2>
            <div className="space-y-0">
              {event.agenda.map((item, idx) => (
                <div key={idx} className="flex gap-3 pb-4 last:pb-0 relative">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                      idx === 0 ? 'bg-[#0f55f7] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {idx + 1}
                    </div>
                    {idx < event.agenda.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-100 dark:bg-slate-700/50 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-xs font-semibold text-[#0f55f7]">{item.time}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Attendee List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5"
          >
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0f55f7]" />
              Attendees
              <span className="text-xs font-normal text-slate-400">({event.attendees} registered)</span>
            </h2>
            <div className="space-y-2">
              {attendeeList.map((a, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {a.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{a.name}</p>
                    <p className="text-xs text-slate-400">{a.desig} · {a.dept}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Materials */}
          {event.materials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5"
            >
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0f55f7]" />
                Materials & Resources
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {event.materials.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-700/50 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f55f7]/10">
                      {m.type === 'pdf' ? <FileText className="w-4 h-4 text-red-500" /> :
                       m.type === 'zip' ? <Archive className="w-4 h-4 text-amber-500" /> :
                       m.type === 'image' ? <Image className="w-4 h-4 text-blue-500" /> :
                       m.type === 'video' ? <Video className="w-4 h-4 text-purple-500" /> :
                       m.type === 'ppt' ? <FileText className="w-4 h-4 text-orange-500" /> :
                       <FileText className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{m.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{m.type}</p>
                    </div>
                    <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Action Buttons */}
          {event.meetingLink && event.status !== 'Cancelled' && (
            <motion.a
              href={event.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all ${
                event.status === 'Live Now'
                  ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30 animate-pulse'
                  : 'bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] hover:shadow-xl shadow-[#0f55f7]/20'
              }`}
            >
              <Video className="w-5 h-5" />
              {event.status === 'Live Now' ? 'Join Live Now' : 'Join Meeting'}
            </motion.a>
          )}

          {/* Event Details Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Event Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Status</span>
                <StatusBadge status={event.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Type</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{event.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Category</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{event.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Department</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{event.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Created By</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{event.createdBy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Created Date</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{event.createdDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Registered</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{event.attendees} / {event.capacity}</span>
              </div>
            </div>
          </motion.div>

          {/* Host Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Host Information</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] flex items-center justify-center text-sm font-bold text-white shrink-0">
                {hostInitials}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{event.hostName}</p>
                <p className="text-xs text-slate-400">{event.hostDesignation}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <Mail className="w-3.5 h-3.5" />
                {event.hostEmail || '—'}
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Phone className="w-3.5 h-3.5" />
                {event.hostPhone || '—'}
              </div>
              {event.hostExperience && (
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  {event.hostExperience} experience
                </div>
              )}
            </div>
            {event.hostBio && (
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">{event.hostBio}</p>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-2"
          >
            <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Edit3 className="w-4 h-4" />
              Edit Event
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Share2 className="w-4 h-4" />
              Share Event
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Download className="w-4 h-4" />
              Download Details
            </button>
            <button
              onClick={() => navigate('/organization/webinars')}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-[#0f55f7] hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Webinars
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
