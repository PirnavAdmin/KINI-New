import { motion } from 'framer-motion'
 
export default function NotificationSettings({ data, onChange, markDirty }) {
  const toggle = (field) => {
    onChange(field, !data[field])
    markDirty()
  }
 
  const sections = [
    {
      title: 'Delivery Channels',
      items: [
        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
        { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
      ],
    },
    {
      title: 'Reports & Summaries',
      items: [
        { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Organization activity summary every Monday' },
      ],
    },
    {
      title: 'Alerts',
      items: [
        { key: 'newMemberAlerts', label: 'New Member Alerts', desc: 'When someone joins the organization' },
        { key: 'leaveRequestAlerts', label: 'Leave Request Alerts', desc: 'When time-off is submitted or approved' },
        { key: 'securityAlerts', label: 'Security Alerts', desc: 'Login attempts and permission changes' },
      ],
    },
  ]
 
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50
        dark:border-slate-700/50 shadow-sm rounded-[20px] p-6 sm:p-8 space-y-6"
    >
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Notification Preferences</h3>
        <p className="text-xs text-slate-400 mt-0.5">Control how and when you receive updates</p>
      </div>
 
      {sections.map((section) => (
        <div key={section.title}>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            {section.title}
          </p>
          <div className="space-y-4">
            {section.items.map((item) => (
              <ToggleSwitch
                key={item.key}
                checked={data[item.key]}
                onChange={() => toggle(item.key)}
                label={item.label}
                description={item.desc}
              />
            ))}
          </div>
          {sections.indexOf(section) < sections.length - 1 && (
            <div className="my-5 border-t border-slate-100 dark:border-slate-700/50" />
          )}
        </div>
      ))}
    </motion.div>
  )
}
 
function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
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
 