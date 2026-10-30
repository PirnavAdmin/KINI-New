import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@shared/constants/routeConstants'
import { navigateBackOrFallback } from '@features/super-admin/utils/navigation'

export default function SuperAdminBackButton({
  fallback = ROUTES.SUPER_ADMIN.DASHBOARD,
  label = 'Back',
  className = '',
}) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigateBackOrFallback(navigate, fallback)}
      className={`inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-[#0f55f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/40 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 ${className}`.trim()}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  )
}
