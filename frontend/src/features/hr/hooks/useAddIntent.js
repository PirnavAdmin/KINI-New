import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * useAddIntent — lets any HR page consume a "open the add form" intent sent by
 * the HR Workspace quick actions (which navigate with `state: { openAdd }`).
 *
 * The intent is consumed exactly once (location state is cleared after firing)
 * so a page refresh never re-opens the form.
 *
 * @param {Function} openAdd - called when an add intent is pending
 */
export default function useAddIntent(openAdd, { enabled = true } = {}) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!enabled || !location.state?.openAdd) return undefined
    openAdd?.()
    navigate(location.pathname, { replace: true, state: null })
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, enabled])
}
