import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'

export default function OrganizationApiReadyPage({
  title,
  subtitle,
  icon: Icon,
  backendStatus,
  requirements = [],
  linkedRoutes = [],
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:py-10 [&>div:first-child]:!mb-6"
    >
      <PageHeader title={title} subtitle={subtitle} icon={Icon} />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card className="border border-amber-200 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Backend requirement report</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {backendStatus}
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-amber-200/60 bg-white/80 p-4 dark:border-amber-500/20 dark:bg-slate-900/60">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Required backend support</p>
            <ul className="mt-3 space-y-2">
              {requirements.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="border border-slate-200 bg-white dark:border-slate-700">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Quick links</p>
          <div className="mt-4 space-y-2">
            {linkedRoutes.map((route) => (
              <Link
                key={route.to}
                to={route.to}
                className="flex items-center justify-between rounded-xl border border-slate-200/80 px-4 py-3 text-sm text-slate-700 transition-colors hover:border-[#0f55f7]/30 hover:bg-[#0f55f7]/5 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60"
              >
                <span>{route.label}</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
