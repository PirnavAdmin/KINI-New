import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

/**
 * GlassCard — Glassmorphism card with 3D tilt on hover.
 *
 * Features:
 * - Glass morphism backdrop blur + transparency
 * - 3D tilt effect that follows cursor
 * - Gradient border
 * - Smooth spring animation
 * - Optional glow on hover
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.className
 * @param {number} props.tiltFactor - Max tilt degrees (default: 8)
 * @param {boolean} props.glowOnHover - Show glow ring on hover (default: true)
 */
export default function GlassCard({
  children,
  className = '',
  tiltFactor = 8,
  glowOnHover = true,
  ...rest
}) {
  const cardRef = useRef(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback(
    (e) => {
      if (!cardRef.current || tiltFactor === 0) return
      const rect = cardRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const rotateY = ((e.clientX - centerX) / rect.width) * tiltFactor
      const rotateX = -((e.clientY - centerY) / rect.height) * tiltFactor
      setRotate({ x: rotateX, y: rotateY })
    },
    [tiltFactor]
  )

  const handleMouseLeave = useCallback(() => {
    setRotate({ x: 0, y: 0 })
    setIsHovered(false)
  }, [])

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: rotate.x,
        rotateY: rotate.y,
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        mass: 0.5,
      }}
      className={`
        relative rounded-2xl p-6
        bg-white/5 backdrop-blur-xl
        border border-white/10
        shadow-xl shadow-black/10
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 800,
      }}
      {...rest}
    >
      {/* Glow rim on hover */}
      {glowOnHover && isHovered && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
    </motion.div>
  )
}
