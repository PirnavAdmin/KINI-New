import { useState } from 'react'
import { UserCog, ShieldCheck, Mail, Phone, BadgeCheck } from 'lucide-react'
import { HR_ROLE_OPTIONS, HR_ROLE_IDS } from '@shared/constants/roles'
import PermissionMatrix from '@features/hr/components/PermissionMatrix'
import { emptyHrUser } from '@features/hr/services/hrUserStore'

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all focus:border-[#0f55f7] focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white'
const fieldLabel = 'mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const EMPLOYEE_TYPE_OPTIONS = [
  { value: 'Full-Time', label: 'Full-Time' },
  { value: 'Part-Time', label: 'Part-Time' },
]

// ENTERPRISE RBAC — User Role options relevant to the HR settings surface.
// Super Admin is platform-level and is not assignable from an organization's
// HR workspace, so only HR and Organization Admin are offered here.
/**
 * HrUserForm — the HR account creation/edit surface used by Employee
 * Management (Role = HR) and HR Settings. Combines the account details
 * (name, lastName, email, mobile, designation, status, role, hrRole, password, confirm
 * password) with the enterprise Permission Matrix.
 *
 * ENTERPRISE RBAC — User Role + HR Role:
 *   • role    — canonical platform User Role (HR / Organization Admin). Only
 *                HR is relevant to HR-account creation, so it is the default.
 *   • hrRole  — canonical HR role tier, shown ONLY when User Role = HR
 *                (required). Switching User Role away from HR clears it.
 *
 * Controlled component:
 *   value    → HR user draft ({ name, lastName, email, mobile, designation, status,
 *              role, hrRole, password, confirmPassword, permissions })
 *   onChange → (nextDraft) => void
 */
export default function HrUserForm({ value, onChange }) {
  const [localDraft, setLocalDraft] = useState(() => value || emptyHrUser())
  const draft = localDraft
  // This form is only used to create HR accounts. The platform role is fixed
  // to HR; the HR Role selector is the only access-level choice the admin needs.
  const isHrUserRole = true

  const set = (key, normalize = (nextValue) => nextValue) => (event) => {
    const nextDraft = { ...draft, [key]: normalize(event.target.value) }
    setLocalDraft(nextDraft)
    onChange?.(nextDraft)
  }
  const setPermissions = (permissions) => {
    const nextDraft = { ...draft, permissions }
    setLocalDraft(nextDraft)
    onChange?.(nextDraft)
  }

  const renderField = ({
    label, name, type = 'text', placeholder, value: fieldValue,
    inputMode, maxLength, normalize,
  }) => (
    <label className="block" key={name}>
      <span className={fieldLabel}>{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        onFocus={(event) => event.currentTarget.setAttribute('autocomplete', 'off')}
        value={fieldValue ?? ''}
        onChange={set(name, normalize)}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className={inputCls}
      />
    </label>
  )

  return (
    <div className="space-y-5">
      {/* Account details */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0f55f7]/10 text-[#0f55f7]">
            <UserCog className="h-3.5 w-3.5" />
          </span>
          <div>
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">Account Details</h3>
            <p className="text-[10px] font-medium text-slate-400">Used to sign in to the HR dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {renderField({ label: 'Name', name: 'name', value: draft.name, placeholder: 'e.g. Kavya Menon' })}
          {renderField({ label: 'Last Name', name: 'lastName', value: draft.lastName, placeholder: 'e.g. Menon' })}
          <label className="block">
            <span className={fieldLabel}>Status</span>
            <select name="status" value={draft.status} onChange={set('status')} className={inputCls}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={fieldLabel}>Employee Type <span className="text-[#0f55f7]">· required</span></span>
            <select
              name="employeeType"
              value={draft.employeeType || 'Full-Time'}
              onChange={set('employeeType')}
              className={inputCls}
            >
              {EMPLOYEE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            {renderField({
              label: 'Email', name: 'email', type: 'email', value: draft.email,
              placeholder: 'hr.user@kinieduhub.io',
            })}
          </div>
          {renderField({
            label: 'Mobile', name: 'mobile', type: 'tel', inputMode: 'numeric', maxLength: 10,
            value: draft.mobile, placeholder: '9876543210',
            normalize: (nextValue) => nextValue.replace(/\D/g, '').slice(0, 10),
          })}

          {/* HR accounts always use the HR platform role; choose only the access tier. */}
          {isHrUserRole ? (
            <label className="block">
              <span className={fieldLabel}>
                HR Role <span className="text-[#0f55f7]">· required</span>
              </span>
              <select name="hrRole" value={draft.hrRole || HR_ROLE_IDS.EXECUTIVE} onChange={set('hrRole')} className={inputCls}>
                {HR_ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <span className="mt-1 block text-[10px] font-medium text-slate-400">
                Determines default permissions before custom overrides.
              </span>
            </label>
          ) : (
            <label className="block">
              <span className={fieldLabel}>HR Role</span>
              <select name="hrRole" value="" disabled className={`${inputCls} cursor-not-allowed opacity-60`}>
                <option value="">Not required for this role</option>
              </select>
            </label>
          )}

        </div>
      </section>

      {/* Permission matrix */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#06b6a8]/10 text-[#06b6a8]">
            <ShieldCheck className="h-3.5 w-3.5" />
          </span>
          <div>
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">HR Access &amp; Permissions</h3>
            <p className="text-[10px] font-medium text-slate-400">
              Controls what this HR user sees after login — menus, buttons and actions adapt automatically.
            </p>
          </div>
        </div>
        <PermissionMatrix value={draft.permissions} onChange={setPermissions} />
      </section>

      {/* Help hints */}
      <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-400 dark:bg-slate-800/40">
        <p className="flex items-center gap-1.5">
          <BadgeCheck className="h-3.5 w-3.5 text-[#0f55f7]" />
          A module appears in the sidebar only when at least one permission is granted for it.
        </p>
        <p className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 text-[#06b6a8]" />
          This HR user signs in with the email above; the employee API stores the account and permission profile.
        </p>
        <p className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-[#8b5cf6]" />
          If the API is unavailable during development, the profile is kept in this browser as a temporary fallback.
        </p>
        <p className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 text-[#F59E0B]" />
          Passwords are validated on save but never persisted — RBAC profiles don't store credentials.
        </p>
      </div>
    </div>
  )
}
