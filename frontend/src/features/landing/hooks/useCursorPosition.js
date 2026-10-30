import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * useCursorPosition — Tracks mouse position and hover states for the custom cursor.
 * Returns mouse coords, hover target type, and visibility.
 * Uses a ref for hoverTarget to avoid re-rendering on every mouse move.
 */
export default function useCursorPosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const hoverRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [, forceUpdate] = useState(0)

  const handleMouseMove = useCallback((e) => {
    setPosition({ x: e.clientX, y: e.clientY })

    // Determine if hovering a clickable element
    const el = e.target
    const tag = el?.tagName
    const role = el?.getAttribute?.('role')
    const isClickable =
      tag === 'BUTTON' ||
      tag === 'A' ||
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      role === 'button' ||
      role === 'link' ||
      el?.closest('[data-cursor-hover]') !== null ||
      el?.closest('button') !== null ||
      el?.closest('a') !== null

    const newTarget = isClickable ? 'clickable' : null
    if (hoverRef.current !== newTarget) {
      hoverRef.current = newTarget
      forceUpdate((n) => n + 1)
    }
  }, [])

  const handleMouseEnter = useCallback(() => setIsVisible(true), [])
  const handleMouseLeave = useCallback(() => setIsVisible(false), [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave])

  return { position, hoverTarget: hoverRef.current, isVisible }
}
