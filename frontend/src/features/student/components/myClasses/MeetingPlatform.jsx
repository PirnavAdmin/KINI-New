import { FaMicrosoft } from 'react-icons/fa'
import { SiZoom, SiGooglemeet } from 'react-icons/si'
import { Video } from 'lucide-react'

const PLATFORM_MAP = {
  'google meet': { icon: SiGooglemeet, label: 'Google Meet', color: 'text-[#0f55f7]' },
  meet: { icon: SiGooglemeet, label: 'Google Meet', color: 'text-[#0f55f7]' },
  zoom: { icon: SiZoom, label: 'Zoom', color: 'text-sky-500' },
  'microsoft teams': { icon: FaMicrosoft, label: 'Microsoft Teams', color: 'text-indigo-500' },
  teams: { icon: FaMicrosoft, label: 'Microsoft Teams', color: 'text-indigo-500' },
}

export default function MeetingPlatform({ platform, fallbackLabel = 'Online class', className = '' }) {
  const key = String(platform || '').trim().toLowerCase()
  const entry = PLATFORM_MAP[key] || { icon: Video, label: platform || fallbackLabel, color: 'text-slate-500' }
  const Icon = entry.icon

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-2.5 py-1 text-[10px] text-slate-700 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-200 ${className}`}>
      <Icon className={`h-3.5 w-3.5 ${entry.color}`} />
      <span className="font-medium">{entry.label}</span>
    </div>
  )
}
