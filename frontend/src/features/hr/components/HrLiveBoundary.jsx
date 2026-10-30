import { useState } from 'react'
import { useAuth } from '@shared/hooks/useAuth'
import { isHrModuleUser } from '../constants/hrPermissions'
import HrApiModule from './HrApiModule'
import HrApiSettings from './HrApiSettings'
import Button from '@shared/components/Button'

// Existing personal/teaching screens remain available for non-HR sessions.
export default function HrLiveBoundary({ module, legacy }) {
  const { user } = useAuth()
  const [personal, setPersonal] = useState(false)
  // Leave Management uses API permissions even when the login role is Employee.
  const live = (module === 'leave' || isHrModuleUser(user)) && localStorage.getItem('isDemo') !== 'true'
  if (!live) return legacy
  const content = module === 'settings' ? <HrApiSettings /> : <HrApiModule key={module} module={module} />
  if (module !== 'attendance' || !location.pathname.endsWith('/attendance')) return content
  return <><div className="mb-3 flex gap-2"><Button variant={personal ? 'secondary' : 'primary'} onClick={() => setPersonal(false)}>Team attendance</Button><Button variant={personal ? 'primary' : 'secondary'} onClick={() => setPersonal(true)}>My attendance</Button></div>{personal ? legacy : content}</>
}
