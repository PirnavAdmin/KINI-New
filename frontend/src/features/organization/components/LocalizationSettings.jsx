import { motion } from 'framer-motion'
import { COUNTRIES, LANGUAGES, TIMEZONES, CURRENCIES } from '@shared/data/organizationMockData'
 
export default function LocalizationSettings({ data, onChange, markDirty }) {
  const handleChange = (field, value) => {
    onChange(field, value)
    markDirty()
  }
 
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50
        dark:border-slate-700/50 shadow-sm rounded-[20px] p-6 sm:p-8 space-y-5"
    >
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Localization Settings</h3>
        <p className="text-xs text-slate-400 mt-0.5">Configure regional preferences for your workspace</p>
      </div>
 
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Country" options={COUNTRIES} value={data.country} onChange={(e) => handleChange('country', e.target.value)} />
        <SelectField label="Language" options={LANGUAGES} value={data.language} onChange={(e) => handleChange('language', e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Timezone" options={TIMEZONES} value={data.timezone} onChange={(e) => handleChange('timezone', e.target.value)} />
        <SelectField label="Currency" options={CURRENCIES} value={data.currency} onChange={(e) => handleChange('currency', e.target.value)} />
      </div>
    </motion.div>
  )
}
 
function SelectField({ label, options, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700
          rounded-xl text-sm text-slate-900 dark:text-white appearance-none cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 focus:border-[#0f55f7] transition-all duration-200"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
 