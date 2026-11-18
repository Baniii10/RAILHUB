'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { DiscordChatBumper } from '@/remotion/DiscordChatBumper'

const Player = dynamic(
  () => import('@remotion/player').then((mod) => mod.Player),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#0b1626] flex items-center justify-center text-xs text-white/50">
        Memuat pratinjau chat Discord...
      </div>
    ),
  }
)

export default function DiscordChatBumperPlayer() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className="relative w-full h-[270px] sm:h-[310px] rounded-xl overflow-hidden bg-[#0b1626] border border-white/10 select-none"
      aria-label="Pratinjau obrolan Discord Komunitas Railfans"
    >
      {mounted ? (
        <Player
          component={DiscordChatBumper}
          durationInFrames={300}
          compositionWidth={720}
          compositionHeight={340}
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
        <div className="w-full h-full bg-[#0b1626]" />
      )}
    </div>
  )
}
