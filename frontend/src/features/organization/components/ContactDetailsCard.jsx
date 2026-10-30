import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, User as UserIcon } from 'lucide-react'
 
export default function ContactDetailsCard({ company }) {
  const contacts = [
    { icon: UserIcon, label: 'Contact Person', value: company.contactPerson },
    { icon: Mail, label: 'Email', value: company.email },
    { icon: Phone, label: 'Phone', value: company.phone },
    { icon: MapPin, label: 'Address', value: `${company.address}, ${company.city}, ${company.state} ${company.zip}` },
  ]
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50
        dark:border-slate-700/50 shadow-lg rounded-[20px] p-6 sm:p-8"
    >
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-5">Contact Information</h3>
      <div className="space-y-4">
        {contacts.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <item.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
 