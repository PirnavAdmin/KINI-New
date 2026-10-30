import { motion } from 'framer-motion'
import { Building2, Globe, Users, Calendar } from 'lucide-react'
import { formatNumber } from '@shared/utils/formatters'
 
export default function CompanyOverviewCard({ company }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50
        dark:border-slate-700/50 shadow-lg rounded-[20px] p-6 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* Logo */}
        <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10
          flex items-center justify-center shrink-0 shadow-sm">
          <Building2 className="w-10 h-10 text-[#0f55f7]" />
        </div>
 
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{company.name}</h2>
              <p className="text-sm text-slate-400 mt-0.5">{company.industry}</p>
            </div>
            <button className="px-3 py-1.5 text-xs font-medium text-[#0f55f7] hover:bg-[#0f55f7]/5
              rounded-xl transition-colors border border-[#0f55f7]/20">
              Edit
            </button>
          </div>
 
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
            <InfoItem icon={Globe} label="Website" value={company.website} />
            <InfoItem icon={Users} label="Employees" value={formatNumber(company.employeeCount)} />
            <InfoItem icon={Calendar} label="Founded" value={String(company.foundedYear)} />
          </div>
        </div>
      </div>
 
      {/* Description */}
      {company.description && (
        <p className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {company.description}
        </p>
      )}
    </motion.div>
  )
}
 
function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{value}</p>
      </div>
    </div>
  )
}
 
