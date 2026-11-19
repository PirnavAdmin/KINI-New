import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

// Only dashboard quick actions opt in. Opening a form from its own list stays there.
export default function useDashboardFormReturn(open, openForm, trigger = 'create') {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const requestedReturn = location.state?.returnTo || params.get('returnTo')
  const returning = useRef(['/organization/dashboard', '/employee/hr-dashboard'].includes(requestedReturn) ? requestedReturn : null)
  const wasOpen = useRef(false)
  useEffect(() => {
    if (!openForm || params.get(trigger) !== 'true') return
    openForm()
    const next = new URLSearchParams(params)
    next.delete(trigger)
    setParams(next, { replace: true })
  }, [params, setParams, openForm, trigger])
  useEffect(() => {
    if (wasOpen.current && !open && returning.current) {
      const destination = returning.current
      returning.current = null
      navigate(destination, { replace: true })
    }
    wasOpen.current = open
  }, [open, navigate])
}
