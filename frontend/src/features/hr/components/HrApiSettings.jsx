import { useEffect, useRef, useState } from 'react'
import { Settings, RefreshCw, User, Bell, ShieldCheck, Monitor, KeyRound, Pencil, Mail, Globe, Phone, Droplets, Briefcase, Landmark, Camera, CalendarDays } from 'lucide-react'
import { HrBreadcrumb, HrHero } from './portal/HrPortalKit'
import { heroProps } from './portal/hrHeroes'
import { hrField } from '../services/hrApi'
import { notifyProfilePhotoChanged, resolvePhotoUrl, extractProfilePhotoUrl, embeddedPhotoUrl } from '@shared/services/profilePhotoService'
import { AvatarPhoto } from '@/components/common/ProfileImage'
import './portal/hr-settings.css'
import { toast } from 'sonner'
import { useAuth } from '@shared/hooks/useAuth'
import usePermission from '@shared/hooks/usePermission'
import { permissionApi } from '@shared/services/platformModulesApi'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import HRPage from './HRPage'
import HrApiForm from './HrApiForm'
import { fieldLabel } from '../services/hrFormOptions'
import { HrRecord } from './HrApiData'
import { hrRequest, hrList, hrError } from '../services/hrApi'

const TAB_ICONS = { profile: User, notifications: Bell, security: ShieldCheck, sessions: Monitor, permissions: KeyRound }
const tabs = { profile: 'Profile', notifications: 'Notifications', security: 'Security', sessions: 'Sessions', permissions: 'Permissions' }
const pathFor = tab => `/api/hr/settings/${tab === 'sessions' ? 'security/sessions' : tab}`

export default function HrApiSettings({ profileOnly = false }) {
  const { user, updateStoredUser } = useAuth()
  const permissions = usePermission()
  const allowed = permissions.hasPermission(profileOnly ? 'profile' : 'settings')
  const editable = permissions.can(profileOnly ? 'profile' : 'settings', 'edit')
  const [tab, setTab] = useState('profile')
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState({ loading: true })
  const [dialog, setDialog] = useState(null)
  const [busy, setBusy] = useState(false)
  const [uploadedPhoto, setUploadedPhoto] = useState('')
  const lock = useRef(false)
  useEffect(() => {
    if (!allowed || permissions.isLoading) return
    const controller = new AbortController()
    const jobs = [hrRequest('GET', pathFor(tab), { signal: controller.signal })]
    if (tab === 'permissions') jobs.push(hrRequest('GET', '/api/hr/settings/permissions/modules', { signal: controller.signal }))
    Promise.allSettled(jobs).then(results => {
      if (controller.signal.aborted) return
      setState({ loading: false, value: results[0].value, error: results[0].status === 'rejected' ? hrError(results[0].reason) : null, modules: results[1]?.value, modulesError: results[1]?.status === 'rejected' ? hrError(results[1].reason) : null })
    })
    return () => controller.abort()
  }, [allowed, permissions.isLoading, tab, revision])
  const refresh = () => { setState({ loading: true }); setRevision(value => value + 1) }
  const perform = async request => {
    if (lock.current) return
    lock.current = true; setBusy(true)
    try { const result = await request(); setDialog(result?.qrCodeUrl ? { kind: 'qr', url: result.qrCodeUrl } : null); refresh(); toast.success('Changes saved.') }
    catch (error) { toast.error(hrError(error)) }
    finally { lock.current = false; setBusy(false) }
  }
  const edit = operation => setDialog({ kind: 'form', operation })
  if (permissions.isLoading) return <p role="status">Loading permissions...</p>
  if (!allowed) return <p role="alert">{permissions.error ? hrError(permissions.error) : 'You do not have permission to access this module.'}</p>
  const refreshButton = <button type="button" className="hrp-btn hrp-btn--white" disabled={state.loading || busy} onClick={refresh}><RefreshCw className={state.loading ? 'animate-spin' : ''} />Refresh</button>
  const hero = profileOnly ? null : <>
    <HrBreadcrumb items={[{ label: 'Home', to: '/employee/hr-dashboard' }, { label: 'Organization' }, { label: 'HR Settings' }]} />
    <HrHero {...heroProps('settings')} actions={refreshButton} />
  </>
  return <HRPage moduleId={profileOnly ? 'profile' : 'settings'} title={profileOnly ? 'Profile' : 'Settings'} className="hst-page" icon={Settings} hero={hero} actions={<Button variant="secondary" icon={RefreshCw} disabled={state.loading || busy} onClick={refresh}>Refresh</Button>}>
    {!profileOnly && <div role="tablist" aria-label="Settings sections" className="hst-tabs">{Object.entries(tabs).map(([key, label]) => { const Icon = TAB_ICONS[key]; return <button type="button" key={key} role="tab" aria-selected={key === tab} onClick={() => { setDialog(null); setState({ loading: true }); setTab(key) }}><Icon aria-hidden="true" />{label}</button> })}</div>}
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 dark:bg-slate-900 dark:text-white">
      {state.loading ? <p role="status">Loading {tabs[tab].toLowerCase()}...</p> : state.error ? <p role="alert">{state.error}</p> : <>
        {tab === 'sessions' ? <div className="space-y-3">{hrList(state.value).map(session => <div key={session.sessionId} className="flex flex-wrap justify-between gap-3 rounded-xl border p-3"><HrRecord value={session} />{editable && session.sessionId != null && <Button variant="secondary" disabled={busy} onClick={() => setDialog({ kind: 'revoke', id: session.sessionId })}>Revoke session</Button>}</div>)}{!hrList(state.value).length && <p>No active sessions available.</p>}</div> : tab === 'profile' ? <ProfilePanel value={state.value} photoOverride={uploadedPhoto || embeddedPhotoUrl(state.value) || embeddedPhotoUrl(user)} onEdit={editable ? () => edit(`PUT ${pathFor('profile')}`) : null} onPhoto={editable ? () => edit('POST /api/hr/settings/profile/photo') : null} /> : <HrRecord value={state.value} />}
        {tab === 'permissions' && <><h2 className="font-semibold">Available modules</h2>{state.modulesError ? <p role="alert">{state.modulesError}</p> : <HrRecord value={state.modules} />}{permissions.can('permissions', 'edit') && <HrPermissionEditor />}</>}
        {editable && tab === 'notifications' && <Button onClick={() => edit(`PUT ${pathFor(tab)}`)}>Edit {tabs[tab].toLowerCase()}</Button>}
        {editable && tab === 'security' && <div className="flex flex-wrap gap-2"><Button onClick={() => edit('PUT /api/hr/settings/security/password')}>Change password</Button><Button variant="secondary" disabled={busy} onClick={() => setDialog({ kind: state.value?.twoFactorEnabled ? 'disable2fa' : 'enable2fa' })}>{state.value?.twoFactorEnabled ? 'Disable' : 'Enable'} two-factor authentication</Button></div>}
      </>}
    </section>
    {dialog?.kind === 'form' && <HrApiForm title={dialog.operation.includes('/photo') ? 'Upload profile photo' : dialog.operation.includes('/password') ? 'Change password' : `Edit ${tabs[tab].toLowerCase()}`} operation={dialog.operation} values={dialog.operation.includes('/password') ? {} : state.value} onClose={() => setDialog(null)} onSave={async data => {
      if (data.newPassword && state.value?.passwordPolicy) {
        const p = state.value.passwordPolicy
        const missing = []
        if (data.newPassword.length < p.minLength) missing.push(`at least ${p.minLength} characters`)
        if (p.requireUppercase && !/[A-Z]/.test(data.newPassword)) missing.push('an uppercase letter')
        if (p.requireLowercase && !/[a-z]/.test(data.newPassword)) missing.push('a lowercase letter')
        if (p.requireNumber && !/\d/.test(data.newPassword)) missing.push('a number')
        if (p.requireSpecialChar && !/[^a-zA-Z0-9]/.test(data.newPassword)) missing.push('a special character')
        if (missing.length) throw new Error(`New Password: include ${missing.join(', ')}.`)
      }
      const [method, path] = dialog.operation.split(' ')
      const saved = await hrRequest(method, path, { data })
      if (path === '/api/hr/settings/profile') {
        const profile = { ...data, ...(saved && typeof saved === 'object' ? saved : {}) }
        updateStoredUser({ firstName: profile.firstName, lastName: profile.lastName, fullName: [profile.firstName, profile.lastName].filter(Boolean).join(' '), email: profile.email, phone: profile.phone })
      }
      if (path === '/api/hr/settings/profile/photo') {
        const returned = extractProfilePhotoUrl(saved)
        const url = returned && /^(https?:\/\/|\/|uploads\/|data:image\/)/i.test(returned) ? resolvePhotoUrl(returned) : ''
        let displayedPhoto = ''
        if (url) {
          const photoUrl = url.startsWith('data:') ? url : `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`
          setUploadedPhoto(photoUrl)
          displayedPhoto = photoUrl
          updateStoredUser({ photoUrl, profilePhotoUrl: photoUrl })
        } else {
          const file = data.get?.('photo')
          if (file instanceof Blob && file.type.startsWith('image/')) {
            const preview = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file) })
            setUploadedPhoto(preview)
            displayedPhoto = preview
          }
        }
        // Navbar and other avatars of the signed-in user re-fetch their photo.
        notifyProfilePhotoChanged({ photoUrl: displayedPhoto })
      }
      refresh(); toast.success('Changes saved.')
    }} />}
    {['revoke', 'enable2fa', 'disable2fa'].includes(dialog?.kind) && <Modal open title={dialog.kind === 'revoke' ? 'Revoke session' : 'Update two-factor authentication'} onClose={() => { if (!busy) setDialog(null) }}><p className="mb-4">Confirm this security change for your account.</p><Button disabled={busy} onClick={() => perform(async () => {
      if (dialog.kind === 'revoke') await hrRequest('DELETE', '/api/hr/settings/security/sessions/{sessionId}', { id: dialog.id })
      else {
        const value = await hrRequest('POST', `/api/hr/settings/security/2fa/${dialog.kind === 'enable2fa' ? 'enable' : 'disable'}`)
        return value
      }
    })}>{busy ? 'Saving...' : 'Confirm'}</Button></Modal>}
    {dialog?.kind === 'qr' && <Modal open title="Set up two-factor authentication" onClose={() => setDialog(null)}><p>Scan this code with your authenticator app.</p>{/^(https:\/\/|data:image\/png;base64,)/i.test(dialog.url) && <img src={dialog.url} alt="Authenticator setup QR code" className="mx-auto max-w-64" />}</Modal>}
  </HRPage>
}

function HrPermissionEditor() {
  const { user, role } = useAuth()
  const [target, setTarget] = useState('employee')
  const [id, setId] = useState(String(user?.employeeId ?? ''))
  const [selectedRole, setSelectedRole] = useState(user?.userRole ?? user?.role ?? role ?? '')
  const [state, setState] = useState({ rows: null })
  const [busy, setBusy] = useState(false)
  const [moduleDetails, setModuleDetails] = useState(null)
  const run = async fn => { setBusy(true); try { await fn() } catch (error) { toast.error(hrError(error)) } finally { setBusy(false) } }
  const load = async () => {
    const modules = await permissionApi.modules()
    const rows = await (target === 'employee' ? permissionApi.byEmployee(id) : permissionApi.byRole(selectedRole))
    setState({ rows, modules, target, id, role: selectedRole })
  }
  return <section className="space-y-3 border-t pt-4"><h2 className="font-semibold">Manage permissions</h2><div className="flex flex-wrap gap-2"><select aria-label="Permission target" value={target} disabled={busy} onChange={e => { setTarget(e.target.value); setState({ rows: null }) }}><option value="employee">Employee</option><option value="role">Role</option></select>{target === 'employee' ? <input aria-label="Permission employee ID" value={id} disabled={busy} onChange={e => { setId(e.target.value); setState({ rows: null }) }} /> : <input aria-label="Permission role" value={selectedRole} disabled={busy} onChange={e => { setSelectedRole(e.target.value); setState({ rows: null }) }} />}<Button disabled={busy || !(target === 'employee' ? id : selectedRole)} onClick={() => run(load)}>Load permissions</Button></div>
    {state.rows && <><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th>Module</th>{['canAccess', 'canView', 'canAdd', 'canEdit', 'canDelete'].map(key => <th key={key}>{fieldLabel(key)}</th>)}<th>Details</th></tr></thead><tbody>{(state.modules ?? []).map(module => {
      const permissionId = module.permissionId ?? module.moduleId ?? module.id
      const row = state.rows.find(item => String(item.permissionId) === String(permissionId)) ?? { permissionId, module: module.moduleName ?? module.name ?? module.module }
      return <tr key={permissionId}><td>{row.module ?? module.name}</td>{['canAccess', 'canView', 'canAdd', 'canEdit', 'canDelete'].map(key => <td key={key}><input type="checkbox" aria-label={`${row.module} ${key}`} checked={Boolean(row[key])} disabled={busy} onChange={e => setState(current => ({ ...current, rows: [...current.rows.filter(item => item.permissionId !== permissionId), { ...row, [key]: e.target.checked }] }))} /></td>)}<td>{target === 'employee' && permissionId != null && <Button size="xs" disabled={busy} onClick={() => run(async () => setModuleDetails(await permissionApi.employeeModule(id, permissionId)))}>Inspect</Button>}</td></tr>
    })}</tbody></table></div><Button disabled={busy} onClick={() => run(async () => { await (state.target === 'employee' ? permissionApi.updateEmployee(state.id, state.rows) : permissionApi.updateRole(state.role, state.rows)); await load(); window.dispatchEvent(new Event('hr-permissions-updated')); toast.success('Permissions saved.') })}>Save permissions</Button></>}
    {moduleDetails && <Modal open title="Employee module permissions" onClose={() => setModuleDetails(null)}><HrRecord value={moduleDetails} /></Modal>}
  </section>
}

/* v22 — Profile tab laid out as in the HR Settings design. */
function ProfilePanel({ value = {}, photoOverride, onEdit, onPhoto }) {
  const text = (...keys) => {
    const raw = hrField(value, ...keys)
    return raw == null || raw === '' ? '—' : typeof raw === 'object' ? (hrField(raw, 'name', 'title', 'label') ?? '—') : String(raw)
  }
  const first = text('firstName')
  const last = text('lastName')
  const fullName = [first, last].filter((part) => part !== '—').join(' ') || text('fullName', 'name')
  const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?'
  // /api/hr/settings/profile returns a backend-relative /uploads/... path.
  const photo = photoOverride || embeddedPhotoUrl(value)
  const joined = hrField(value, 'joiningDate', 'joinedOn', 'createdAt')
  const joinedText = joined && !Number.isNaN(new Date(joined).getTime()) ? new Date(joined).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const rows = [
    [User, 'First Name', first], [User, 'Last Name', last],
    [Mail, 'Email', text('email')], [Globe, 'Country Code', text('countryCode')],
    [Phone, 'Phone', text('phone', 'mobileNumber')], [Droplets, 'Role', text('role', 'userRole')],
    [Briefcase, 'Designation', text('designation')], [Landmark, 'Department', text('department', 'departmentName')],
  ]
  return <div className="hst-profile">
    <div className="hst-profile__head">
      <span className="hst-profile__icon" aria-hidden="true"><User /></span>
      <div className="min-w-0 flex-1"><h2>Profile Information</h2><p>View and manage your personal and professional details.</p></div>
      {onEdit && <button type="button" className="hrp-btn hrp-btn--orange" onClick={onEdit}><Pencil />Edit Profile</button>}
    </div>
    <div className="hst-profile__grid">
      <div className="hst-card">
        <div className="hst-avatar">
          <AvatarPhoto src={photo} fallback={<span>{initials}</span>} />
          {onPhoto && <button type="button" onClick={onPhoto} aria-label="Upload profile photo"><Camera /></button>}
        </div>
        <h3>{fullName}</h3>
        <span className="hst-role">{text('role', 'userRole')}</span>
        <dl className="hst-meta"><div><dt>Employee ID</dt><dd>{text('employeeCode', 'employeeId')}</dd></div><div><dt>Joined On</dt><dd><CalendarDays aria-hidden="true" />{joinedText}</dd></div></dl>
      </div>
      <div className="hst-details">
        <h3><span aria-hidden="true"><User /></span>Personal Details</h3>
        <dl>{rows.map(([Icon, label, item]) => <div key={label}><span aria-hidden="true"><Icon /></span><span><dt>{label}</dt><dd>{item}</dd></span></div>)}</dl>
      </div>
    </div>
  </div>
}
