/**
 * AnimatedCounter — smooth count-up animation for numeric stats.
 * Uses Framer Motion's useMotionValue + useSpring for buttery animation.
 *
 * Usage:
 *   <AnimatedCounter value={247} duration={1.2} />
 *   <AnimatedCounter value={94.5} decimals={1} prefix="" suffix="%" />
 */
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export function AnimatedCounter({
  value,
  duration = 1.0,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const rafRef = useRef(null)

  useEffect(() => {
    if (!inView) return

    const start = 0
    const end = Number(value)
    const startTime = performance.now()
    const durationMs = duration * 1000

    const easeOut = (t) => 1 - Math.pow(1 - t, 3)

    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const current = start + (end - start) * easeOut(progress)
      setDisplay(parseFloat(current.toFixed(decimals)))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [inView, value, duration, decimals])

  const formatted = typeof display === 'number'
    ? display.toLocaleString('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })
    : display

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${value}${suffix}`}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
