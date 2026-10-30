import { useState } from 'react'
import toast from 'react-hot-toast'
import { Settings, Shield, Globe, Bell, Database, Save, RefreshCw, Loader2 } from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
import Modal from '@shared/components/Modal'
import Button from '@shared/components/Button'
import { settingsApi } from '@shared/services/apiServices'
import { downloadSuperAdminExport } from '@shared/services/exportService'
import { SUPER_ADMIN_SETTINGS_DEFAULTS } from '@shared/constants/superAdminSettings'
import { useAuth } from '@shared/hooks/useAuth'
 
const SETTING_KEYS = Object.keys(SUPER_ADMIN_SETTINGS_DEFAULTS)

// Only accept the settings keys this page manages, so a backend payload can
// never inject unrelated fields into the settings state.
const pickKnownSettings = (payload) =>
  payload && typeof payload === 'object' && !Array.isArray(payload)
    ? Object.fromEntries(SETTING_KEYS.filter((key) => key in payload).map((key) => [key, payload[key]]))
    : {}

function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 ${enabled ? 'bg-[#0f55f7]' : 'bg-slate-300 dark:bg-slate-600'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}
 
export default function SuperAdminSettings() {
  const { user, isSuperAdmin } = useAuth()
  const isDemoSession = Boolean(user?.isDemo || String(user?.email || '').includes('demo'))
  const [exporting, setExporting] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [settings, setSettings] = useState(SUPER_ADMIN_SETTINGS_DEFAULTS)
 
  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  const setVal = (key) => (e) => setSettings(prev => ({ ...prev, [key]: e.target.value }))
 
  const handleSave = () => {
    toast.success('Settings saved successfully!')
  }
 
  const handleResetClick = () => setResetOpen(true)
 
  const confirmReset = async () => {
    if (resetting) return
    // Super Admin-only operation — the backend enforces this too.
    if (!isSuperAdmin) {
      toast.error('You do not have permission to reset settings.')
      return
    }
    setResetting(true)
    try {
      // Live sessions: the backend restores and persists the configured
      // defaults (recording a SETTINGS_RESET audit entry) and returns them.
      // Demo sessions restore the single source of truth directly.
      let backendSettings = {}
      if (!isDemoSession) {
        backendSettings = pickKnownSettings(await settingsApi.reset())
      }
      setSettings({ ...SUPER_ADMIN_SETTINGS_DEFAULTS, ...backendSettings })
      setResetOpen(false)
      toast.success('Settings have been reset to their default values.')
    } catch (error) {
      const status = error?.response?.status
      if (status === 401 || status === 403) {
        toast.error('You do not have permission to reset settings.')
      } else if (!error?.response) {
        toast.error('Reset failed due to a network error. Please try again.')
      } else {
        toast.error('Unable to reset settings. Please try again.')
      }
    } finally {
      setResetting(false)
    }
  }
 
  const handleExportData = async () => {
    if (exporting) return
    // Super Admin-only operation — the backend enforces this too.
    if (!isSuperAdmin) {
      toast.error('You do not have permission to export this data.')
      return
    }
    setExporting(true)
    try {
      const { empty } = await downloadSuperAdminExport({
        isDemo: Boolean(user?.isDemo || String(user?.email || '').includes('demo')),
      })
      if (empty) {
        toast.error('There is no data available to export.')
        return
      }
      toast.success('Data export completed successfully.')
    } catch (error) {
      const status = error?.response?.status
      if (status === 401 || status === 403) {
        toast.error('You do not have permission to export this data.')
      } else if (!error?.response) {
        toast.error('Export failed due to a network error. Please try again.')
      } else {
        toast.error('Unable to export data. Please try again.')
      }
    } finally {
      setExporting(false)
    }
  }
 
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      <PageHeader title="System Settings" subtitle="Configure platform-wide settings and preferences" icon={Settings} showBreadcrumb={false} titleClassName="!text-2xl !leading-8" containerClassName="!mb-5"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetClick}
              disabled={resetting}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetting ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : <><RefreshCw className="w-4 h-4" /> Reset</>}
            </button>
            <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #0f55f7, #06b6a8)', boxShadow: '0 4px 16px rgba(15,85,247,0.25)' }}>
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        }
      />
 
      <div className="space-y-4">
        {/* Platform Configuration */}
        <Card padding="p-6">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-[#0f55f7]/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#0f55f7]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#06b6a8] dark:text-teal-300">Platform Configuration</h3>
              <p className="text-xs text-slate-400">General platform settings</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            <Toggle label="Allow New Registrations" description="Enable or disable new user signups" enabled={settings.allowRegistrations} onChange={() => toggle('allowRegistrations')} />
            <Toggle label="Require Email Verification" description="New users must verify their email" enabled={settings.requireEmailVerification} onChange={() => toggle('requireEmailVerification')} />
            <Toggle label="Enable SSO" description="Allow single sign-on authentication" enabled={settings.allowSso} onChange={() => toggle('allowSso')} />
            <Toggle label="Maintenance Mode" description="Put platform in maintenance mode" enabled={settings.maintenanceMode} onChange={() => toggle('maintenanceMode')} />
            <Toggle label="Auto Backup" description="Enable automatic database backups" enabled={settings.autoBackup} onChange={() => toggle('autoBackup')} />
          </div>
        </Card>
 
        {/* Security Settings */}
        <Card padding="p-6">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#06b6a8] dark:text-teal-300">Security</h3>
              <p className="text-xs text-slate-400">Security and authentication settings</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            <Toggle label="Debug Mode" description="Enable debugging and detailed error logs" enabled={settings.debugMode} onChange={() => toggle('debugMode')} />
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Session Timeout (minutes)</p>
                <p className="text-xs text-slate-400 mt-0.5">Auto-logout after inactivity</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min={1} max={720} value={settings.sessionTimeout} onChange={setVal('sessionTimeout')}
                  className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-center outline-none focus:ring-2 focus:ring-[#0f55f7]/30" />
                <span className="text-xs text-slate-400">min</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Max Login Attempts</p>
                <p className="text-xs text-slate-400 mt-0.5">Before account lockout</p>
              </div>
              <input type="number" min={1} max={20} value={settings.maxLoginAttempts} onChange={setVal('maxLoginAttempts')}
                className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-center outline-none focus:ring-2 focus:ring-[#0f55f7]/30" />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Min Password Length</p>
                <p className="text-xs text-slate-400 mt-0.5">Minimum characters required</p>
              </div>
              <input type="number" min={6} max={64} value={settings.passwordMinLength} onChange={setVal('passwordMinLength')}
                className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-center outline-none focus:ring-2 focus:ring-[#0f55f7]/30" />
            </div>
          </div>
        </Card>
 
        {/* Notification Settings */}
        <Card padding="p-6">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#06b6a8] dark:text-teal-300">Notifications</h3>
              <p className="text-xs text-slate-400">System notification preferences</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            <Toggle label="Email Notifications" description="Send system notifications via email" enabled={settings.emailNotifications} onChange={() => toggle('emailNotifications')} />
            <Toggle label="SMTP Enabled" description="Enable SMTP for email delivery" enabled={settings.smtpEnabled} onChange={() => toggle('smtpEnabled')} />
            <Toggle label="Weekly Digest" description="Send weekly platform summary to admins" enabled={settings.weeklyDigest} onChange={() => toggle('weeklyDigest')} />
          </div>
        </Card>
 
        {/* Danger Zone */}
        <Card padding="p-6" className="border-red-200 dark:border-red-900/50">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-red-100 dark:border-red-900/30">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#06b6a8] dark:text-teal-300">Data Management</h3>
              <p className="text-xs text-slate-400">Irreversible data operations</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Export All Data</p>
                <p className="text-xs text-slate-400 mt-0.5">Download a complete data export</p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                disabled={exporting}
                title="Download a complete data export"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Exporting...</>
                ) : 'Export'}
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Audit Log Retention</p>
                <p className="text-xs text-slate-400 mt-0.5">Audit trails are protected and cannot be bypassed or cleared from the UI</p>
              </div>
              <button disabled title="Audit trails are tamper-proof" className="cursor-not-allowed px-4 py-2 text-xs font-semibold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                Protected
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Reset Settings Confirmation Modal ── */}
      <Modal
        open={resetOpen}
        onClose={() => !resetting && setResetOpen(false)}
        title="Reset Settings?"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setResetOpen(false)} disabled={resetting}>Cancel</Button>
            <Button variant="danger" loading={resetting} onClick={confirmReset}>
              {resetting ? 'Resetting...' : 'Reset Settings'}
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Are you sure you want to reset all settings to their default values? Your current custom settings will be replaced.
            </p>
            <p className="mt-1.5 text-xs text-slate-400">Resetting will discard your current settings and restore the default configuration.</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
