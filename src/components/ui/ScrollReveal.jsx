'use client'

import { useEffect, useRef, useState } from 'react'

const OFFSETS = {
  up: 'translate3d(0, 18px, 0)',
  down: 'translate3d(0, -18px, 0)',
  left: 'translate3d(-20px, 0, 0)',
  right: 'translate3d(20px, 0, 0)',
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px 40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`overflow-x-clip rh-defer-section ${className}`}>
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translate3d(0, 0, 0)' : (OFFSETS[direction] || OFFSETS.up),
          transition: `opacity 0.34s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.34s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
