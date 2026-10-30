import { useState } from 'react'
import { User, Bell, Shield, Palette, Save, RotateCcw, Key } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@shared/components/Modal'

export default function EmployeeSettings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [passwordModal, setPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [profileForm, setProfileForm] = useState({
    firstName: 'Employee',
    lastName: 'User',
    email: 'employee@kinieduhub.io',
    phone: '+1 (555) 123-4567',
  })
  const [notificationPrefs, setNotificationPrefs] = useState({
    assignments: true,
    reminders: true,
    announcements: true,
  })
  const [appearanceSettings, setAppearanceSettings] = useState({
    darkMode: false,
    compactView: false,
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  const handleSaveProfile = async () => {
    if (!profileForm.firstName.trim() || !profileForm.email.trim()) {
      toast.error('First name and email are required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      toast.error('Please enter a valid email')
      return
    }
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    toast.success('Profile updated successfully')
    setSaving(false)
  }

  const handleResetProfile = () => {
    setProfileForm({ firstName: 'Employee', lastName: 'User', email: 'employee@kinieduhub.io', phone: '+1 (555) 123-4567' })
    toast.success('Profile reset to defaults')
  }

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved')
  }

  const handleChangePassword = async () => {
    if (!passwordForm.current) { toast.error('Current password is required'); return }
    if (!passwordForm.newPass) { toast.error('New password is required'); return }
    if (passwordForm.newPass.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (passwordForm.newPass !== passwordForm.confirm) { toast.error('Passwords do not match'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    toast.success('Password updated successfully')
    setPasswordForm({ current: '', newPass: '', confirm: '' })
    setPasswordModal(false)
    setSaving(false)
  }

  const handleSaveAppearance = () => {
    toast.success('Appearance settings saved')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/40 bg-white dark:bg-slate-900/60 p-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:text-slate-400'}`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/40 bg-white dark:bg-slate-900/60 p-6">
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div><h2 className="text-base font-bold text-slate-900 dark:text-white">Profile Information</h2><p className="text-xs text-slate-400 mt-0.5">Update your personal details</p></div>
                  <button onClick={handleResetProfile} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[{ label: 'First Name', key: 'firstName' }, { label: 'Last Name', key: 'lastName' }, { label: 'Email', key: 'email' }, { label: 'Phone', key: 'phone' }].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{f.label}</label>
                      <input type={f.key === 'email' ? 'email' : f.key === 'phone' ? 'tel' : 'text'} value={profileForm[f.key]}
                        onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button onClick={handleSaveProfile} disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-60">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <div><h2 className="text-base font-bold text-slate-900 dark:text-white">Notification Preferences</h2><p className="text-xs text-slate-400 mt-0.5">Choose what you receive</p></div>
                {[{ label: 'Assignment updates', desc: 'When assignments are posted or graded', key: 'assignments' },
                  { label: 'Live class reminders', desc: 'Before scheduled classes', key: 'reminders' },
                  { label: 'Announcements', desc: 'Important platform updates', key: 'announcements' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
                    <div><p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p><p className="text-xs text-slate-400 mt-0.5">{item.desc}</p></div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notificationPrefs[item.key]}
                        onChange={(e) => setNotificationPrefs(p => ({ ...p, [item.key]: e.target.checked }))}
                        className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-teal-600" />
                    </label>
                  </div>
                ))}
                <div className="flex justify-end">
                  <button onClick={handleSaveNotifications}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg transition-all">
                    <Save className="w-4 h-4" /> Save Preferences
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <div><h2 className="text-base font-bold text-slate-900 dark:text-white">Security</h2><p className="text-xs text-slate-400 mt-0.5">Manage your password</p></div>
                <div className="space-y-4">
                  {[{ label: 'Current Password', key: 'current' }, { label: 'New Password', key: 'newPass' }, { label: 'Confirm New Password', key: 'confirm' }].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{f.label}</label>
                      <input type="password" value={passwordForm[f.key]} placeholder="••••••••"
                        onChange={e => setPasswordForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button onClick={() => setPasswordModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg transition-all">
                    <Key className="w-4 h-4" /> Update Password
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <div><h2 className="text-base font-bold text-slate-900 dark:text-white">Appearance</h2><p className="text-xs text-slate-400 mt-0.5">Customize your interface</p></div>
                {[{ label: 'Dark Mode', desc: 'Toggle dark mode', key: 'darkMode' },
                  { label: 'Compact View', desc: 'Show more content', key: 'compactView' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
                    <div><p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p><p className="text-xs text-slate-400 mt-0.5">{item.desc}</p></div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={appearanceSettings[item.key]}
                        onChange={(e) => setAppearanceSettings(p => ({ ...p, [item.key]: e.target.checked }))}
                        className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-teal-600" />
                    </label>
                  </div>
                ))}
                <div className="flex justify-end">
                  <button onClick={handleSaveAppearance}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg transition-all">
                    <Save className="w-4 h-4" /> Save Appearance
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Confirmation Modal */}
      <Modal open={passwordModal} onClose={() => setPasswordModal(false)} title="Confirm Password Change"
        description="Are you sure you want to update your password?" size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setPasswordModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button onClick={handleChangePassword} disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg disabled:opacity-60 transition-all">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Key className="w-4 h-4" />}
              {saving ? 'Updating...' : 'Confirm'}
            </button>
          </div>
        }>
        <p className="text-sm text-slate-600 dark:text-slate-400">You are about to change your password. Make sure you remember your new password.</p>
      </Modal>
    </div>
  )
}
