'use client'

import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { NightTrainBumper } from '@/remotion/NightTrainBumper'

// Dynamically import Remotion Player to ensure zero SSR hydration mismatch on Next.js/Vercel
const Player = dynamic(
  () => import('@remotion/player').then((mod) => mod.Player),
  {
    ssr: false,
    loading: () => <NightTrainBumper frame={36} width={800} height={800} />,
  }
)

export default function NightTrainBumperPlayer() {
  const containerRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [compHeight, setCompHeight] = useState(450)

  useEffect(() => {
    setMounted(true)
    const el = containerRef.current
    if (!el) return

    const updateDims = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        const nextH = Math.max(420, Math.min(1200, Math.round(800 * (rect.height / rect.width))))
        setCompHeight((prev) => (Math.abs(prev - nextH) > 8 ? nextH : prev))
      }
    }

    updateDims()
    const ro = new ResizeObserver(updateDims)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="rh-login-remotion-stage"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 270,
        overflow: 'hidden',
        backgroundColor: '#050813',
        userSelect: 'none',
      }}
      aria-label="Animasi Kereta Malam RAILHUB"
    >
      {mounted ? (
        <Player
          key={compHeight}
          component={NightTrainBumper}
          durationInFrames={360}
          compositionWidth={800}
          compositionHeight={compHeight}
          fps={30}
          style={{
            width: '100%',
            height: '100%',
          }}
          controls={false}
          autoPlay
          loop
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
        />
      ) : (
        <NightTrainBumper frame={36} width={800} height={compHeight} />
      )}
    </div>
  )
}

