'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { AboutNetworkBumper } from '@/remotion/AboutNetworkBumper'

const Player = dynamic(
  () => import('@remotion/player').then((mod) => mod.Player),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-gradient-to-br from-[#f8fafc] to-[#eff6ff]" />,
  }
)

export default function AboutNetworkBumperPlayer() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className="relative w-full aspect-[7/3] min-h-[200px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#f8fafc] to-[#eff6ff] border border-[var(--rh-border)] shadow-[0_8px_24px_rgba(26,66,138,0.06)] select-none"
      aria-label="Animasi jaringan kereta api RAILHUB Pulau Jawa"
    >
      {mounted ? (
        <Player
          component={AboutNetworkBumper}
          durationInFrames={270}
          compositionWidth={700}
          compositionHeight={300}
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
        <div className="w-full h-full bg-gradient-to-br from-[#f8fafc] to-[#eff6ff]" />
      )}
    </div>
  )
}
