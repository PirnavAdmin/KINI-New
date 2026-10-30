import { motion } from 'framer-motion'
import { Building2, Link, FileText } from 'lucide-react'
 
export default function GeneralSettings({ data, onChange, markDirty }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50
        dark:border-slate-700/50 shadow-sm rounded-[20px] p-6 sm:p-8 space-y-5"
    >
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">General Settings</h3>
        <p className="text-xs text-slate-400 mt-0.5">Manage your organization's basic information</p>
      </div>
 
      <InputField
        label="Organization Name"
        value={data.organizationName}
        onChange={(e) => { onChange('organizationName', e.target.value); markDirty() }}
        Icon={Building2}
      />
      <InputField
        label="Website"
        value={data.website}
        onChange={(e) => { onChange('website', e.target.value); markDirty() }}
        Icon={Link}
      />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
        <div className="relative">
          <div className="absolute top-3 left-3.5 pointer-events-none">
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <textarea
            value={data.description}
            onChange={(e) => { onChange('description', e.target.value); markDirty() }}
            rows={3}
            className="w-full px-4 py-3 pl-10 bg-white dark:bg-slate-800/50 border border-slate-200
              dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white
              placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30
              focus:border-[#0f55f7] transition-all duration-200 resize-none"
          />
        </div>
      </div>
    </motion.div>
  )
}
 
function InputField({ label, type = 'text', value, onChange, placeholder, Icon }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-10 bg-white dark:bg-slate-800/50 border border-slate-200
            dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white
            placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30
            focus:border-[#0f55f7] transition-all duration-200"
        />
      </div>
    </div>
  )
}
 