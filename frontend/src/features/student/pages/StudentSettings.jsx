import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Settings, Bell, Shield, Eye, Lock, ChevronRight, AlertTriangle } from 'lucide-react'
import StudentPageBanner from '@features/student/components/StudentPageBanner'
import { STUDENT_BANNERS } from '@features/student/constants/studentBanners'
import Card from '@shared/components/Card'

function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button type="button" role="switch" aria-checked={enabled} aria-label={label} onClick={onChange} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${enabled ? 'bg-[#0f55f7]' : 'bg-slate-300 dark:bg-slate-600'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

const SECTIONS = [
  { id: 'notifications', label: 'Notifications', icon: Bell, color: '#0f55f7',
    items: [
      { label: 'Email Notifications', description: 'Course updates and announcements', key: 'emailNotif', enabled: true },
      { label: 'Push Notifications', description: 'Real-time updates on your learning', key: 'pushNotif', enabled: true },
      { label: 'Weekly Progress Report', description: 'Get a weekly summary of your learning', key: 'weeklyReport', enabled: false },
      { label: 'Course Reminders', description: 'Reminders for upcoming deadlines', key: 'reminders', enabled: true },
    ] },
  { id: 'privacy', label: 'Privacy', icon: Shield, color: '#06b6a8',
    items: [
      { label: 'Public Profile', description: 'Allow others to view your profile', key: 'publicProfile', enabled: true },
      { label: 'Show Learning Progress', description: 'Display your course progress publicly', key: 'showProgress', enabled: false },
      { label: 'Show Certificates', description: 'Display certificates on your profile', key: 'showCerts', enabled: true },
    ] },
  { id: 'preferences', label: 'Preferences', icon: Eye, color: '#F59E0B',
    items: [
      { label: 'Dark Mode', description: 'Use dark theme across the platform', key: 'darkMode', enabled: true },
      { label: 'Compact View', description: 'Display content in compact layout', key: 'compactView', enabled: false },
      { label: 'Auto-Play Videos', description: 'Automatically play course videos', key: 'autoPlay', enabled: true },
    ] },
]

export default function StudentSettings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    emailNotif: true, pushNotif: true, weeklyReport: false, reminders: true,
    publicProfile: true, showProgress: false, showCerts: true,
    darkMode: true, compactView: false, autoPlay: true,
  })
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <main className="ksl-page w-full px-2 py-2 sm:px-3">
      <StudentPageBanner
        banner={STUDENT_BANNERS.settings}
        icon={Settings}
        eyebrow="Settings"
        title="Make It Yours,"
        highlight="Learn Your Way!"
        description={<>Manage notifications, privacy and preferences<br className="ksl-hide-sm" /> to personalise your learning experience.</>}
        features={[
          { Icon: Bell, title: 'Notifications', text: 'Stay informed', tone: 'blue' },
          { Icon: Shield, title: 'Privacy', text: 'Control visibility', tone: 'green' },
          { Icon: Eye, title: 'Preferences', text: 'Your experience', tone: 'orange' },
          { Icon: Lock, title: 'Account', text: 'Keep it secure', tone: 'violet' },
        ]}
      />
      <div className="ksx-settings-grid items-start">
        {SECTIONS.map((sec) => (
          <Card key={sec.id} padding="p-4" className="border-transparent bg-white/95 shadow-[0_10px_28px_rgba(15,23,42,0.055)] ring-1 ring-slate-900/[0.05] dark:ring-white/[0.07]">
            <div className="mb-2 flex items-center gap-3 border-b border-slate-200/50 pb-3 dark:border-slate-700/50">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${sec.color}15` }}>
                <sec.icon className="w-5 h-5" style={{ color: sec.color }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{sec.label}</h3>
                <p className="text-xs text-slate-400">Configure your {sec.label.toLowerCase()} preferences</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {sec.items.map((item) => (
                <Toggle key={item.key} label={item.label} description={item.description}
                  enabled={settings[item.key]} onChange={() => toggle(item.key)} />
              ))}
            </div>
          </Card>
        ))}

        <Card padding="p-4" className="border-transparent bg-white/95 shadow-[0_10px_28px_rgba(15,23,42,0.055)] ring-1 ring-red-500/10 dark:ring-red-400/15">
          <div className="mb-2 flex items-center gap-3 border-b border-red-100 pb-3 dark:border-red-900/30">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Account</h3>
              <p className="text-xs text-slate-400">Manage your account settings</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Change Password</p>
                <p className="text-xs text-slate-400 mt-0.5">Update your account password</p>
              </div>
              <button onClick={() => navigate('/change-password')} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Update <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-slate-100 py-2.5 dark:border-slate-700/50">
              <div className="min-w-0">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Delete Account</p>
                <p className="text-xs text-slate-400 mt-0.5">Permanently delete your account and data</p>
              </div>
              {deleteConfirm ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => { toast.error('Account deleted'); setDeleteConfirm(false) }} className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
                    Confirm
                  </button>
                  <button onClick={() => setDeleteConfirm(false)} className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors">
                  <AlertTriangle className="w-3 h-3" /> Delete
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}

