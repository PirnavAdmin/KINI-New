import { motion } from 'framer-motion'
import { Shield, Clock, Key, Globe } from 'lucide-react'
 
export default function SecuritySettings({ data, onChange, markDirty }) {
  const toggle = (field) => {
    onChange(field, !data[field])
    markDirty()
  }
 
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50
          dark:border-slate-700/50 shadow-sm rounded-[20px] p-6 sm:p-8 space-y-5"
      >
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Authentication</h3>
          <p className="text-xs text-slate-400 mt-0.5">Manage login and access policies</p>
        </div>
 
        <ToggleSwitch
          checked={data.twoFactorAuth}
          onChange={() => toggle('twoFactorAuth')}
          label="Two-Factor Authentication (2FA)"
          description="Require 2FA for all admin accounts"
          icon={Shield}
        />
        <ToggleSwitch
          checked={data.passwordExpiry}
          onChange={() => toggle('passwordExpiry')}
          label="Password Expiry"
          description="Force password reset every 90 days"
          icon={Key}
        />
      </motion.div>
 
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50
          dark:border-slate-700/50 shadow-sm rounded-[20px] p-6 sm:p-8 space-y-5"
      >
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Session & Access</h3>
          <p className="text-xs text-slate-400 mt-0.5">Configure session behavior and access control</p>
        </div>
 
        <ToggleSwitch
          checked={data.ipRestriction}
          onChange={() => toggle('ipRestriction')}
          label="IP Restriction"
          description="Limit access to trusted IP ranges"
          icon={Globe}
        />
 
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Session Timeout (minutes)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="number"
              value={data.sessionTimeout}
              onChange={(e) => { onChange('sessionTimeout', e.target.value); markDirty() }}
              className="w-full px-4 py-3 pl-10 bg-white dark:bg-slate-800/50 border border-slate-200
                dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 focus:border-[#0f55f7]
                transition-all duration-200"
            />
          </div>
          <p className="text-xs text-slate-400">Users will be logged out after this period of inactivity</p>
        </div>
      </motion.div>
 
      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-[#EF4444]/20
          shadow-sm rounded-[20px] p-6 sm:p-8"
      >
        <h3 className="text-base font-semibold text-[#EF4444] mb-1">Danger Zone</h3>
        <p className="text-xs text-slate-400 mb-4">Irreversible actions that affect your entire organization</p>
        <div className="flex items-center justify-between p-4 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-xl">
          <div>
            <p className="text-sm font-medium text-[#EF4444]">Delete Organization</p>
            <p className="text-xs text-slate-400 mt-0.5">Permanently delete your organization and all data</p>
          </div>
          <button className="px-4 py-2 text-xs font-semibold text-white bg-[#EF4444] hover:brightness-110
            rounded-xl transition-all shrink-0">
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  )
}
 
function ToggleSwitch({ checked, onChange, label, description, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30
          ${checked ? 'bg-[#0f55f7]' : 'bg-slate-200 dark:bg-slate-700'}
          cursor-pointer`}
      >
        <motion.span
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0"
        />
      </button>
    </div>
  )
}
 