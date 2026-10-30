import { motion } from 'framer-motion'

/**
 * Card — Reusable card component with consistent styling
 *
 * Usage:
 *   <Card variant="default" padding="md" hover>
 *     <p>Content</p>
 *   </Card>
 *
 * Variants:
 *   default    → Glass card (transparent + backdrop-blur)
 *   elevated   → Stronger shadow, solid background
 *   glass      → Glass morphism style
 *   outlined   → No background, just border
 *   interactive → Has hover lift effect
 *
 * Padding:
 *   none, sm (p-4), md (p-6), lg (p-8)
 */
export default function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false,
  onClick,
  animate = true,
  delay = 0,
  dataUi,
}) {
  const variants = {
    default: `
      bg-white dark:bg-slate-900/70
      backdrop-blur-xl
      border border-slate-200/90 dark:border-slate-700/80
      shadow-[0_10px_26px_rgba(15,23,42,0.065),inset_0_1px_0_rgba(255,255,255,.8)]
    `,
    elevated: `
      bg-white dark:bg-slate-800
      border border-slate-200/90 dark:border-slate-700/80
      shadow-elevated
    `,
    glass: `
      bg-glass
      border border-slate-200/90 dark:border-slate-700/80
      shadow-glass
    `,
    outlined: `
      bg-transparent
      border border-slate-300/90 dark:border-slate-600/80
    `,
    interactive: `
      bg-white dark:bg-slate-900/70
      backdrop-blur-xl
      border border-slate-200/90 dark:border-slate-700/80
      shadow-[0_10px_26px_rgba(15,23,42,0.065),inset_0_1px_0_rgba(255,255,255,.8)]
      hover:shadow-lg hover:-translate-y-0.5
      transition-all duration-300
    `,
  }

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-10',
  }

  const variantClass = variants[variant] || variants.default
  // Accept both named sizes and explicit Tailwind padding classes used by pages.
  const paddingClass = paddings[padding] || padding || paddings.md

  const baseClasses = `
    ${variantClass}
    ${paddingClass}
    rounded-xl
    ${hover ? 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `

  if (animate) {
    return (
      <motion.div
        data-ui={dataUi}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3 }}
        className={baseClasses}
        onClick={onClick}
        onKeyDown={onClick ? (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick()
          }
        } : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      data-ui={dataUi}
      className={baseClasses}
      onClick={onClick}
      onKeyDown={onClick ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      } : undefined}
      role={onClick ? 'link' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}
