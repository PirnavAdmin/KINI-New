import { useEffect, useMemo, useState } from 'react'

export default function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return useMemo(() => {
    const total = Math.max(0, new Date(target).getTime() - now)
    const seconds = Math.floor(total / 1000)
    return { total, days: Math.floor(seconds / 86400), hours: Math.floor((seconds % 86400) / 3600), minutes: Math.floor((seconds % 3600) / 60), seconds: seconds % 60 }
  }, [target, now])
}
