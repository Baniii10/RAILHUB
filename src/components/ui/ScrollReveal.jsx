'use client'

import { motion, useReducedMotion } from 'framer-motion'

const OFFSETS = {
  up: { x: 0, y: 22 },
  down: { x: 0, y: -22 },
  left: { x: -24, y: 0 },
  right: { x: 24, y: 0 },
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
}) {
  const prefersReduced = useReducedMotion()
  const offset = OFFSETS[direction] || OFFSETS.up

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={`overflow-x-clip ${className}`}>
      <motion.div
        initial={{ opacity: 0, x: offset.x, y: offset.y }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{
          duration: 0.38,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
