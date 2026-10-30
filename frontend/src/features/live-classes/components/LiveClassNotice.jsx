import { AlertCircle, LogIn, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TinyButton } from './LiveClassPrimitives'

/**
 * Compact inline notice for dashboard/tab-level errors.
 * Auth failures (401/403) never surface the raw backend message —
 * only a short, human explanation plus Log In / Retry actions.
 */
export default function LiveClassNotice({ isAuthError, onRetry }) {
  const navigate = useNavigate()

  return (
    <div
      className={`flex min-h-[48px] items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm ${
        isAuthError
          ? 'border-warning/25 bg-warning/10 text-warning-dark dark:text-warning-light'
          : 'border-danger/25 bg-danger/10 text-danger-dark dark:text-danger-light'
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <p className="truncate font-medium">
          {isAuthError
            ? 'Your session has expired. Please log in again to continue.'
            : 'We could not load live classes right now.'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isAuthError ? (
          <TinyButton variant="primary" icon={LogIn} onClick={() => navigate('/login')} className="h-8 px-3 text-xs">
            Log In
          </TinyButton>
        ) : null}
        <TinyButton
          variant={isAuthError ? 'secondary' : 'primary'}
          icon={RefreshCw}
          onClick={onRetry}
          className="h-8 px-3 text-xs"
        >
          Retry
        </TinyButton>
      </div>
    </div>
  )
}
