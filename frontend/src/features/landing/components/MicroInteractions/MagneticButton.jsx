import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

/**
 * MagneticButton — Button with magnetic hover effect, glow, and gradient borders.
 *
 * Features:
 * - Magnetic pull toward cursor on hover
 * - Glow effect with gradient border
 * - Smooth spring animations
 * - Hover scale effect
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - 'primary' | 'secondary' | 'outline'
 * @param {Function} props.onClick
 * @param {string} props.className
 * @param {number} props.strength - Magnetic pull strength (default: 0.3)
 */
export default function MagneticButton({
  children,
  variant = 'primary',
  onClick,
  className = '',
  strength = 0.3,
  ...rest
}) {
  const buttonRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback(
    (e) => {
      if (!buttonRef.current) return
      const rect = buttonRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distX = e.clientX - centerX
      const distY = e.clientY - centerY
      setPosition({ x: distX * strength, y: distY * strength })
    },
    [strength]
  )

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 })
    setIsHovered(false)
  }, [])

  // Variant styles
  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#6366f1] via-[#818cf8] to-[#06b6d4] text-white shadow-lg shadow-[#6366f1]/25',
    secondary:
      'bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10',
    outline:
      'bg-transparent border border-[#6366f1]/30 text-[#6366f1] hover:border-[#6366f1]/60',
  }

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{
        x: position.x,
        y: position.y,
        scale: isHovered ? 1.05 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 15,
        mass: 0.1,
      }}
      className={`
        relative inline-flex items-center gap-2 px-8 py-4 
        rounded-2xl font-semibold text-sm
        transition-shadow duration-300
        cursor-pointer select-none
        ${variantStyles[variant]}
        ${className}
      `}
      {...rest}
    >
      {/* Glow effect on hover */}
      {isHovered && variant === 'primary' && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(99,102,241,0.4) 0%, transparent 70%)',
            filter: 'blur(8px)',
            zIndex: -1,
          }}
        />
      )}
      {children}
    </motion.button>
  )
}
