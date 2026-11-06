'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { NightTrainBumper } from '@/remotion/NightTrainBumper'

// Dynamically import Remotion Player to ensure zero SSR hydration mismatch on Next.js/Vercel
const Player = dynamic(
  () => import('@remotion/player').then((mod) => mod.Player),
  {
    ssr: false,
    loading: () => <NightTrainBumper frame={24} width={800} height={450} />,
  }
)

export default function NightTrainBumperPlayer() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 270,
        overflow: 'hidden',
        backgroundColor: '#050813',
        userSelect: 'none',
      }}
      aria-label="Animasi Bumper Kereta Malam RAILHUB"
    >
      {mounted ? (
        <Player
          component={NightTrainBumper}
          durationInFrames={300}
          compositionWidth={800}
          compositionHeight={450}
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
        <NightTrainBumper frame={24} width={800} height={450} />
      )}
    </div>
  )
}

