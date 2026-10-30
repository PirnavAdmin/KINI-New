import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

/**
 * Button — Standardized UI button component
 *
 * Variants:
 *   primary   → Gradient blue-purple (default)
 *   secondary → Ghost/outline style
 *   danger    → Red destructive style
 *   ghost     → Minimal transparent style
 *
 * Sizes:
 *   sm  → Compact (for tables, filters)
 *   md  → Default (for forms, CTAs)
 *   lg  → Large (for hero sections)
 *
 * States:
 *   loading → Shows spinner, disables interaction
 *   disabled → Reduced opacity, no hover effects
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}, ref) => {
  // ── Variant Styles ──────────────────────────────────────────
  const variants = {
    primary: `
      text-[#133B5D] font-semibold
      bg-[#F39924] hover:bg-[#D97F0D]
      shadow-lg shadow-[#F39924]/20 hover:shadow-xl hover:shadow-[#F39924]/30
      active:scale-[0.98]
    `,
    secondary: `
      text-text-secondary font-semibold
      bg-white dark:bg-slate-800
      border border-border
      hover:bg-slate-50 dark:hover:bg-slate-700
      hover:border-border-hover
      shadow-sm
      active:scale-[0.98]
    `,
    danger: `
      text-white font-semibold
      bg-gradient-to-r from-danger to-danger-dark
      hover:from-[#DC2626] hover:to-[#B91C1C]
      shadow-lg shadow-danger/20 hover:shadow-xl hover:shadow-danger/30
      active:scale-[0.98]
    `,
    ghost: `
      text-text-muted font-medium
      hover:bg-slate-100 dark:hover:bg-slate-800
      active:scale-[0.98]
    `,
  }

  // ── Size Styles ─────────────────────────────────────────────
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'h-11 px-4 text-sm gap-2 rounded-xl',
    lg: 'px-6 py-3 text-button-lg gap-2.5 rounded-xl',
  }

  const variantClass = variants[variant] || variants.primary
  const sizeClass = sizes[size] || sizes.md

  const isDisabled = disabled || loading

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      onClick={isDisabled ? undefined : onClick}
      className={`
        inline-flex items-center justify-center
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900
        ${variantClass}
        ${sizeClass}
        ${isDisabled ? 'opacity-50 cursor-not-allowed hover:shadow-none hover:scale-100' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children && <span>{children}</span>}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4" />
      )}
    </motion.button>
  )
})

Button.displayName = 'Button'

export default Button

