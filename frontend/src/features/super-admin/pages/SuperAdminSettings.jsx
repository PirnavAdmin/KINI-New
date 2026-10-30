import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Settings, Shield, Globe, Bell, Database, Lock, Mail, Clock, Users, Key, Sliders, ChevronRight, Save, RefreshCw } from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
 
function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-600'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}
 
export default function SuperAdminSettings() {
  const [settings, setSettings] = useState({
    allowRegistrations: true, requireEmailVerification: true, allowSso: false,
    maintenanceMode: false, debugMode: false, autoBackup: true,
    emailNotifications: true, smtpEnabled: true, weeklyDigest: false,
    sessionTimeout: '60', maxLoginAttempts: '5', passwordMinLength: '8',
  })
  const [clearConfirm, setClearConfirm] = useState(false)
 
  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  const setVal = (key) => (e) => setSettings(prev => ({ ...prev, [key]: e.target.value }))
 
  const handleSave = () => {
    toast.success('Settings saved successfully!')
  }
 
  const handleReset = () => {
    setSettings({
      allowRegistrations: true, requireEmailVerification: true, allowSso: false,
      maintenanceMode: false, debugMode: false, autoBackup: true,
      emailNotifications: true, smtpEnabled: true, weeklyDigest: false,
      sessionTimeout: '60', maxLoginAttempts: '5', passwordMinLength: '8',
    })
    toast.success('Settings reset to defaults')
  }
 
  const handleExportData = () => {
    toast.success('Data export started. You will receive a download link shortly.')
  }
 
  const handleClearLogs = () => {
    toast.success('All system logs cleared successfully')
    setClearConfirm(false)
  }
 
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      <PageHeader title="System Settings" subtitle="Configure platform-wide settings and preferences" icon={Settings} showBreadcrumb={false} titleClassName="!text-2xl !leading-8" containerClassName="!mb-5"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-4 h-4" /> Reset
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
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-teal dark:text-teal-300">Platform Configuration</h3>
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
              <h3 className="text-sm font-semibold text-teal dark:text-teal-300">Security</h3>
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
                <input type="number" value={settings.sessionTimeout} onChange={setVal('sessionTimeout')}
                  className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-center outline-none focus:ring-2 focus:ring-brand/30" />
                <span className="text-xs text-slate-400">min</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Max Login Attempts</p>
                <p className="text-xs text-slate-400 mt-0.5">Before account lockout</p>
              </div>
              <input type="number" value={settings.maxLoginAttempts} onChange={setVal('maxLoginAttempts')}
                className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-center outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Min Password Length</p>
                <p className="text-xs text-slate-400 mt-0.5">Minimum characters required</p>
              </div>
              <input type="number" value={settings.passwordMinLength} onChange={setVal('passwordMinLength')}
                className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-center outline-none focus:ring-2 focus:ring-brand/30" />
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
              <h3 className="text-sm font-semibold text-teal dark:text-teal-300">Notifications</h3>
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
              <h3 className="text-sm font-semibold text-teal dark:text-teal-300">Data Management</h3>
              <p className="text-xs text-slate-400">Irreversible data operations</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Export All Data</p>
                <p className="text-xs text-slate-400 mt-0.5">Download a complete data export</p>
              </div>
              <button onClick={handleExportData} className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Export
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Audit Log Retention</p>
                <p className="text-xs text-slate-400 mt-0.5">Audit trails are protected and cannot be bypassed or cleared from the UI</p>
              </div>
              {clearConfirm ? (
                <div className="flex items-center gap-2">
                  <button onClick={handleClearLogs} className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Confirm</button>
                  <button onClick={() => setClearConfirm(false)} className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                </div>
              ) : (
                <button disabled className="cursor-not-allowed px-4 py-2 text-xs font-semibold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Protected
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
