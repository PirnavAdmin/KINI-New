import { useEffect, useState } from 'react'

const formatParts = (remainingMs) => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [
    `${String(hours).padStart(2, '0')}h`,
    `${String(minutes).padStart(2, '0')}m`,
    `${String(seconds).padStart(2, '0')}s`,
  ]
}

export default function CountdownTimer({ targetDate, className = '', onComplete }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!targetDate) return undefined

    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [targetDate])

  useEffect(() => {
    if (!targetDate) return
    if (new Date(targetDate).getTime() - now <= 0) {
      onComplete?.()
    }
  }, [now, onComplete, targetDate])

  if (!targetDate) {
    return <span className={`text-xs text-slate-400 ${className}`}>Schedule unavailable</span>
  }

  const remaining = new Date(targetDate).getTime() - now

  if (remaining <= 0) {
    return <span className={`text-xs font-semibold text-emerald-600 dark:text-emerald-300 ${className}`}>LIVE</span>
  }

  const [hours, minutes, seconds] = formatParts(remaining)

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-slate-950/5 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-200 ${className}`}>
      Starts in <span className="font-bold text-slate-900 dark:text-white">{hours} {minutes} {seconds}</span>
    </span>
  )
}
