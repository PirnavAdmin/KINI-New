 
import { useState } from 'react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Shield, Bell, Clock, Mail, Phone, MapPin,
  Calendar, Smartphone, Monitor, CheckCircle,
  XCircle, Key, Lock, LogOut, DollarSign
} from 'lucide-react'
import { useAuth } from '@shared/hooks/useAuth'
import { Button, Input } from '@shared/components/FormElements'
import ToggleSwitch from '@shared/components/ToggleSwitch'
import { SUPER_ADMIN_PROFILE } from '@shared/data/superAdminPageMockData'
import { changePassword, updateUserProfile } from '@shared/services/authApi'
import { getApiErrorMessage } from '@shared/services/apiServices'
 
// =================================
// TODO: API Integration
// PUT /api/v1/super-admin/profile
// POST /api/v1/super-admin/profile/change-password
// POST /api/v1/super-admin/profile/2fa/toggle
// PUT /api/v1/super-admin/profile/notifications
// GET /api/v1/super-admin/profile/activity-logs
// =================================
 
const TABS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'activity', label: 'Activity Log', icon: Clock },
]
 
export default function SuperAdminProfile() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('personal')
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordSaving, setPasswordSaving] = useState(false)
 
  // Use authenticated user data from login, fall back to mock data
  // Handles both camelCase (JS) and PascalCase (.NET backend) property names
  const getVal = (obj, ...keys) => {
    for (const key of keys) {
      const val = obj[key]
      if (val !== null && val !== undefined) return val
    }
    return ''
  }
 
  const authProfile = user
    ? {
        firstName: getVal(user, 'firstName', 'FirstName', 'first_name') || 'User',
        lastName: getVal(user, 'lastName', 'LastName', 'last_name') || '',
        email: getVal(user, 'email', 'Email', 'email_address'),
        phone: getVal(user, 'phone', 'Phone', 'phone_number', 'mobileNumber', 'MobileNumber'),
        address: getVal(user, 'address', 'Address'),
        role: getVal(user, 'role', 'Role') || 'Super Admin',
        joinedDate: getVal(user, 'joinedDate', 'JoinedDate', 'joined_date', 'createdAt', 'CreatedAt'),
      }
    : null
 
  // Merge auth data into mock data so richer properties (sessions, logs, prefs) are preserved
  const profile = user && authProfile
    ? { ...SUPER_ADMIN_PROFILE, ...authProfile }
    : SUPER_ADMIN_PROFILE
  const [profileForm, setProfileForm] = useState({ firstName: profile.firstName, lastName: profile.lastName, email: profile.email, phone: profile.phone })
  const [saving, setSaving] = useState(false)

  const saveProfile = async () => {
    const userId = user?.userId ?? user?.id
    if (!userId) return toast.error('User profile ID is unavailable. Please sign in again.')
    setSaving(true)
    try {
      await updateUserProfile(userId, profileForm)
      updateUser(profileForm)
      toast.success('Profile updated successfully')
    } catch (error) { toast.error(getApiErrorMessage(error, 'Unable to update profile')) }
    finally { setSaving(false) }
  }

  const savePassword = async () => {
    if (!user?.email || !passwordForm.oldPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Enter the current password and matching new passwords')
      return
    }
    setPasswordSaving(true)
    try {
      await changePassword({ userId: user?.userId ?? user?.id, email: user.email, ...passwordForm })
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password updated successfully')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to update password'))
    } finally {
      setPasswordSaving(false)
    }
  }
 
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-slate-700/40 rounded-2xl p-6 sm:p-8 mb-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-teal flex items-center justify-center shadow-xl shadow-brand/20 shrink-0">
            <span className="text-3xl font-bold text-white">A</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-teal bg-clip-text text-transparent">{profile.firstName} {profile.lastName}</h1>
            <p className="text-sm text-brand font-semibold">{profile.role}</p>
            <p className="text-sm text-slate-400 mt-1">{profile.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                Joined {profile.joinedDate}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-500">
                <CheckCircle className="w-3.5 h-3.5" />
                Active
              </span>
            </div>
          </div>
          <Button variant="outline" icon={User} onClick={() => setActiveTab('personal')}>Edit Profile</Button>
        </div>
      </motion.div>
 
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl mb-6 overflow-x-auto"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand text-white shadow-md shadow-brand/20'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>
 
      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'personal' && (
          <motion.div
            key="personal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-slate-700/40 rounded-2xl p-6 sm:p-8 space-y-6"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <h2 className="text-lg font-bold text-teal dark:text-teal-300">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" value={profileForm.firstName} icon={User} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} />
              <Input label="Last Name" value={profileForm.lastName} icon={User} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} />
              <Input label="Email" value={profileForm.email} type="email" icon={Mail} disabled onChange={() => {}} />
              <Input label="Phone" value={profileForm.phone} icon={Phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
            </div>
            <Input label="Address" value={profile.address} icon={MapPin} onChange={() => {}} />
            <div className="flex justify-end">
              <Button onClick={saveProfile} loading={saving}>Save Changes</Button>
            </div>
          </motion.div>
        )}
 
        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Change Password */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-slate-700/40 rounded-2xl p-6 sm:p-8 space-y-4"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 className="text-lg font-bold text-teal dark:text-teal-300">Change Password</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Current Password" type="password" icon={Lock} value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} />
                <div className="relative">
                  <Input
                    label="New Password"
                    type="password"
                    icon={Key}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <Input
                    label="Confirm New Password"
                    type="password"
                    icon={Key}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={savePassword} loading={passwordSaving}>Update Password</Button>
              </div>
            </div>
 
            {/* Two-Factor Auth */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-slate-700/40 rounded-2xl p-6 sm:p-8 space-y-4"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-teal dark:text-teal-300">Two-Factor Authentication</h2>
                  <p className="text-sm text-slate-400">Add an extra layer of security to your account</p>
                </div>
                <ToggleSwitch checked={profile.twoFactorEnabled} onChange={() => {}} />
              </div>
              {profile.twoFactorEnabled && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">Two-factor authentication is enabled</p>
                </div>
              )}
            </div>
 
            {/* Login Sessions */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-slate-700/40 rounded-2xl p-6 sm:p-8 space-y-4"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 className="text-lg font-bold text-teal dark:text-teal-300">Active Sessions</h2>
              <div className="space-y-3">
                {profile.loginSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        {session.device.includes('iPhone') || session.device.includes('Mobile')
                          ? <Smartphone className="w-4 h-4 text-slate-500" />
                          : <Monitor className="w-4 h-4 text-slate-500" />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{session.device}</p>
                          {session.current && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-brand/10 text-brand">Current</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{session.location} · {session.ip}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{session.lastActive}</span>
                      {!session.current && (
                        <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                          <XCircle className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button variant="outline" icon={LogOut} onClick={() => toast.success('All other sessions signed out')}>Sign Out All Devices</Button>
              </div>
            </div>
          </motion.div>
        )}
 
        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-slate-700/40 rounded-2xl p-6 sm:p-8 space-y-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <h2 className="text-lg font-bold text-teal dark:text-teal-300">Notification Preferences</h2>
            <p className="text-sm text-slate-400">Manage how you receive notifications and alerts</p>
            <div className="space-y-3">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email updates about platform activity' },
                { key: 'loginAlerts', label: 'Login Alerts', description: 'Get notified when someone logs into your account' },
                { key: 'orgChanges', label: 'Organization Changes', description: 'Alerts when organizations are created or modified' },
                { key: 'billingAlerts', label: 'Billing & Subscription Alerts', description: 'Payment failures, renewals, and plan changes' },
                { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Weekly summary of platform activity and metrics' },
                { key: 'marketingEmails', label: 'Marketing Emails', description: 'Product updates, tips, and promotional content' },
                { key: 'systemUpdates', label: 'System Updates', description: 'Maintenance notices, feature releases, and downtime alerts' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                  <ToggleSwitch
                    checked={profile.notificationPreferences[item.key]}
                    onChange={() => {}}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => toast.success('Notification preferences saved')}>Save Preferences</Button>
            </div>
          </motion.div>
        )}
 
        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-slate-700/40 rounded-2xl p-6 sm:p-8 space-y-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <h2 className="text-lg font-bold text-teal dark:text-teal-300">Activity Log</h2>
            <p className="text-sm text-slate-400">A chronological record of account activity</p>
            <div className="space-y-1">
              {profile.activityLogs.map((log, i) => (
                <div key={log.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="relative flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      log.type === 'login' ? 'bg-brand/10 text-brand' :
                      log.type === 'security' ? 'bg-amber-50 text-amber-500' :
                      log.type === 'billing' ? 'bg-emerald-50 text-emerald-500' :
                      'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {log.type === 'login' ? <LogOut className="w-4 h-4" /> :
                       log.type === 'security' ? <Shield className="w-4 h-4" /> :
                       log.type === 'billing' ? <DollarSign className="w-4 h-4" /> :
                       <Clock className="w-4 h-4" />}
                    </div>
                    {i < profile.activityLogs.length - 1 && (
                      <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700/50 min-h-[12px]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-4">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{log.action}</p>
                    <p className="text-xs text-slate-400">{log.details}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
