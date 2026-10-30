import { useState } from 'react'
import { User, Bell, Shield, Palette, Save, RotateCcw, Key, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import MentorPageHeader from '../components/MentorPageHeader'
import { SettingsArt } from '../components/MentorHeroArt'
import Modal from '@shared/components/Modal'

export default function MentorSettings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [passwordModal, setPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [profileForm, setProfileForm] = useState({
    firstName: 'Mentor',
    lastName: 'User',
    email: 'mentor@kinieduhub.io',
    phone: '+1 (555) 123-4567',
    bio: 'Experienced mentor passionate about helping students master full-stack development and data science.',
  })
  const [notificationPrefs, setNotificationPrefs] = useState({
    assignments: true,
    messages: true,
    reminders: true,
    alerts: true,
    resources: false,
  })
  const [appearanceSettings, setAppearanceSettings] = useState({
    darkMode: false,
    compactView: false,
    reducedAnimations: false,
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
    setProfileForm({
      firstName: 'Mentor',
      lastName: 'User',
      email: 'mentor@kinieduhub.io',
      phone: '+1 (555) 123-4567',
      bio: 'Experienced mentor passionate about helping students master full-stack development and data science.',
    })
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
      <MentorPageHeader
        icon={Settings}
        title="Settings"
        subtitle="Manage your mentor profile and preferences"
        tagline={['Your', 'Profile, Your', 'Preferences']}
        art={<SettingsArt />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/40 bg-white dark:bg-slate-900/60 p-2.5 shadow-[0_4px_16px_rgba(15,42,74,.05)]">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#fff1dc] text-[#133b5d] dark:bg-[#f39924]/20 dark:text-[#133b5d]'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:text-slate-400'
                }`}>
                <tab.icon className={`w-[18px] h-[18px] ${activeTab === tab.id ? 'text-[#F39924]' : ''}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/40 bg-white dark:bg-slate-900/60 p-6 shadow-[0_4px_16px_rgba(15,42,74,.05)]">
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Profile Information</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Update your personal details</p>
                  </div>
                  <button onClick={handleResetProfile}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'First Name', key: 'firstName', type: 'text' },
                    { label: 'Last Name', key: 'lastName', type: 'text' },
                    { label: 'Email', key: 'email', type: 'email' },
                    { label: 'Phone', key: 'phone', type: 'tel' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{field.label}</label>
                      <input type={field.type} value={profileForm[field.key]}
                        onChange={(e) => setProfileForm(p => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F39924]/25 focus:border-[#F39924] transition-all" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Bio</label>
                  <textarea rows={3} value={profileForm.bio}
                    onChange={(e) => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F39924]/25 focus:border-[#F39924] transition-all resize-none" />
                </div>
                <div className="flex justify-end">
                  <button onClick={handleSaveProfile} disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F39924] hover:bg-[#e2860f] text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-60">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Choose what notifications you receive</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Assignment submissions', desc: 'When a student submits an assignment', key: 'assignments' },
                    { label: 'New student messages', desc: 'When a student sends you a message', key: 'messages' },
                    { label: 'Live session reminders', desc: 'Reminders before scheduled classes', key: 'reminders' },
                    { label: 'Performance alerts', desc: 'When students are falling behind', key: 'alerts' },
                    { label: 'Resource updates', desc: 'When resources are published or updated', key: 'resources' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={notificationPrefs[item.key]}
                          onChange={(e) => setNotificationPrefs(p => ({ ...p, [item.key]: e.target.checked }))}
                          className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F39924]/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#F39924]" />
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button onClick={handleSaveNotifications}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F39924] hover:bg-[#e2860f] text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all">
                    <Save className="w-4 h-4" /> Save Preferences
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Security Settings</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Manage your password and security</p>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Current Password', key: 'current', type: 'password' },
                    { label: 'New Password', key: 'newPass', type: 'password' },
                    { label: 'Confirm New Password', key: 'confirm', type: 'password' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{field.label}</label>
                      <input type={field.type} value={passwordForm[field.key]} placeholder="••••••••"
                        onChange={(e) => setPasswordForm(p => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F39924]/25 focus:border-[#F39924] transition-all" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button onClick={() => setPasswordModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F39924] hover:bg-[#e2860f] text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all">
                    <Key className="w-4 h-4" /> Update Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Appearance</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Customize your interface</p>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Dark Mode', desc: 'Toggle dark mode for reduced eye strain', key: 'darkMode' },
                    { label: 'Compact View', desc: 'Show more content with compact spacing', key: 'compactView' },
                    { label: 'Reduced Animations', desc: 'Minimize motion effects for accessibility', key: 'reducedAnimations' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={appearanceSettings[item.key]}
                          onChange={(e) => setAppearanceSettings(p => ({ ...p, [item.key]: e.target.checked }))}
                          className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F39924]/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#F39924]" />
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button onClick={handleSaveAppearance}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F39924] hover:bg-[#e2860f] text-white text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all">
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
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#F39924] hover:bg-[#e2860f] text-white text-sm font-semibold hover:shadow-lg disabled:opacity-60 transition-all">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Key className="w-4 h-4" />}
              {saving ? 'Updating...' : 'Confirm'}
            </button>
          </div>
        }>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          You are about to change your password. Make sure you remember your new password.
        </p>
      </Modal>
    </div>
  )
}
