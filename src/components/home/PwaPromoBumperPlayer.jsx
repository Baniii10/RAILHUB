'use client'

import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { PwaPromoBumper } from '@/remotion/PwaPromoBumper'

const Player = dynamic(
  () => import('@remotion/player').then((mod) => mod.Player),
  {
    ssr: false,
    loading: () => <PwaPromoBumper frame={30} width={760} height={440} />,
  }
)

export default function PwaPromoBumperPlayer() {
  const containerRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [dims, setDims] = useState({ width: 760, height: 440 })

  useEffect(() => {
    setMounted(true)
    const el = containerRef.current
    if (!el) return

    const updateDims = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        const compW = rect.width < 460 ? 440 : 760
        const compH = Math.max(300, Math.min(640, Math.round(compW * (rect.height / rect.width))))
        setDims((prev) =>
          Math.abs(prev.width - compW) > 10 || Math.abs(prev.height - compH) > 10
            ? { width: compW, height: compH }
            : prev
        )
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
      className="rh-pwa-bumper-stage"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 280,
        overflow: 'hidden',
        background: '#eff6ff',
      }}
      aria-label="Animasi Promosi Aplikasi PWA RailHub Responsif Desktop dan Mobile"
    >
      {mounted ? (
        <Player
          key={`${dims.width}x${dims.height}`}
          component={PwaPromoBumper}
          durationInFrames={300}
          compositionWidth={dims.width}
          compositionHeight={dims.height}
          fps={30}
          style={{ width: '100%', height: '100%' }}
          controls={false}
          autoPlay
          loop
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
        />
      ) : (
        <PwaPromoBumper frame={30} width={dims.width} height={dims.height} />
      )}
    </div>
  )
}
