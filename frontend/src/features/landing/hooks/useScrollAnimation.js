import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * useScrollAnimation — GSAP-powered scroll-triggered animation
 *
 * @param {Object} options
 * @param {string} options.animation - 'fadeUp' | 'fadeIn' | 'scaleIn' | 'slideLeft' | 'slideRight'
 * @param {number} options.delay - stagger delay in seconds
 * @param {number} options.duration - animation duration
 * @param {number} options.start - ScrollTrigger start (e.g. "top 85%")
 * @returns {React.RefObject} ref to attach to the element
 */
export default function useScrollAnimation({
  animation = 'fadeUp',
  delay = 0,
  duration = 0.7,
  start = 'top 85%',
} = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const fromVars = {
      fadeUp: { opacity: 0, y: 50 },
      fadeIn: { opacity: 0 },
      scaleIn: { opacity: 0, scale: 0.9 },
      slideLeft: { opacity: 0, x: -60 },
      slideRight: { opacity: 0, x: 60 },
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        fromVars[animation] || fromVars.fadeUp,
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: 'play none none reverse',
          },
        }
      )
    })

    return () => ctx.revert()
  }, [animation, delay, duration, start])

  return ref
}
