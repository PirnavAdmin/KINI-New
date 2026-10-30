import { useEffect, useState } from 'react'
import { deriveSessionStatus } from '../../../utils/sessionLifecycle'

export default function useSessionStatus(session) {
  const [status, setStatus] = useState(() => deriveSessionStatus(session))
  useEffect(() => {
    const update = () => setStatus(deriveSessionStatus(session))
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [session])
  return status
}
