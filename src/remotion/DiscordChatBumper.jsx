'use client'

import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

const CHAT_MESSAGES = [
  {
    id: 1,
    user: 'Raka_SpotterBD',
    role: 'Spotter Jabar',
    roleColor: '#FF8C00',
    avatarBg: '#1A428A',
    initials: 'RK',
    time: '14:02',
    text: 'CC 206 13 55 baru melintas Jembatan Cisomang narik Argo Parahyangan!',
    attachment: {
      title: 'Argo Parahyangan · Km 110',
      tag: 'CC 206 13 55',
    },
    reaction: '🔥 24',
    enterFrame: 12,
  },
  {
    id: 2,
    user: 'Dinda_Railfan',
    role: 'Member',
    roleColor: '#94A3B8',
    avatarBg: '#0F2D59',
    initials: 'DR',
    time: '14:03',
    text: 'Cakep banget anglenya! Malam ini KA Taksaka dinas seri apa ya?',
    reaction: '👀 8',
    enterFrame: 110,
  },
  {
    id: 3,
    user: 'Masinis_Argo',
    role: 'Verified Crew',
    roleColor: '#38BDF8',
    avatarBg: '#EA580C',
    initials: 'MA',
    time: '14:04',
    text: 'Info dinas: CC 201 83 25 livery klasik siap di jalur 2 Stasiun Tugu.',
    reaction: '🚆 31',
    enterFrame: 215,
  },
  {
    id: 4,
    user: 'Bagas_YK',
    role: 'Spotter Jateng',
    roleColor: '#FF8C00',
    avatarBg: '#1E3A8A',
    initials: 'BY',
    time: '14:05',
    text: 'OTW ke perlintasan barat Tugu, ada yang mau bareng hunting sore?',
    reaction: '🙌 16',
    enterFrame: 325,
  },
]

export function DiscordChatBumper() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Smooth fade in/out at loop boundaries (540 frames = 18s)
  const loopOpacity = interpolate(frame, [0, 14, 515, 539], [0.35, 1, 1, 0.35], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Gentle scroll upward when 4th message arrives so everything stays framed
  const feedScrollY = interpolate(
    spring({
      frame: Math.max(0, frame - 318),
      fps,
      config: { damping: 18, stiffness: 90 },
    }),
    [0, 1],
    [0, -76]
  )

  const showTyping =
    (frame >= 72 && frame < 110) ||
    (frame >= 170 && frame < 215) ||
    (frame >= 280 && frame < 325) ||
    (frame >= 400 && frame < 490)

  const dot1 = Math.sin(frame * 0.28) * 3
  const dot2 = Math.sin(frame * 0.28 + 1.1) * 3
  const dot3 = Math.sin(frame * 0.28 + 2.2) * 3

  // Subtle CTA highlight banner at the end (frames 420-520)
  const ctaProgress = spring({
    frame: Math.max(0, frame - 420),
    fps,
    config: { damping: 14, stiffness: 100 },
  })
  const showCta = frame >= 420

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0b1626',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: loopOpacity,
      }}
    >
      {/* Top Server Channel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 12,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: 2,
          backgroundColor: '#0b1626',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#FF8C00', fontWeight: 800, fontSize: 19 }}>#</span>
          <span style={{ fontWeight: 700, fontSize: 15 }}>spotting-dan-dinas-loko</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
          <span style={{ color: '#38BDF8', fontWeight: 600 }}>🔊 Radio Lintas</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22C55E' }} />
            <span>1.480+ online</span>
          </span>
        </div>
      </div>

      {/* Scrolling Chat Feed */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', margin: '10px 0' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            transform: `translateY(${feedScrollY}px)`,
          }}
        >
          {CHAT_MESSAGES.map((msg) => {
            const p = spring({
              frame: Math.max(0, frame - msg.enterFrame),
              fps,
              config: { damping: 14, stiffness: 115, mass: 0.7 },
            })
            const visible = frame >= msg.enterFrame
            const ty = interpolate(p, [0, 1], [20, 0])
            const op = visible ? interpolate(p, [0, 1], [0, 1]) : 0

            const reactPop = spring({
              frame: Math.max(0, frame - (msg.enterFrame + 18)),
              fps,
              config: { damping: 10, stiffness: 160 },
            })

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 11,
                  opacity: op,
                  transform: `translateY(${ty}px)`,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    backgroundColor: msg.avatarBg,
                    border: '1px solid rgba(255,255,255,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {msg.initials}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: '#FFFFFF' }}>{msg.user}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: msg.roleColor }}>{msg.role}</span>
                    <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)' }}>{msg.time}</span>
                  </div>

                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.38 }}>
                    {msg.text}
                  </div>

                  {msg.attachment && (
                    <div
                      style={{
                        marginTop: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: 'rgba(26, 66, 138, 0.35)',
                        borderLeft: '3px solid #FF8C00',
                        padding: '5px 10px',
                        borderRadius: 6,
                        fontSize: 11.5,
                      }}
                    >
                      <span style={{ fontWeight: 700, color: '#FF8C00' }}>{msg.attachment.tag}</span>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>{msg.attachment.title}</span>
                    </div>
                  )}

                  {frame >= msg.enterFrame + 18 && (
                    <div
                      style={{
                        display: 'inline-block',
                        marginTop: 4,
                        marginLeft: msg.attachment ? 8 : 0,
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        padding: '2px 7px',
                        borderRadius: 6,
                        color: 'rgba(255,255,255,0.9)',
                        transform: `scale(${interpolate(reactPop, [0, 1], [0.6, 1])})`,
                      }}
                    >
                      {msg.reaction}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Typing Bar or Join Prompt */}
      <div
        style={{
          height: 36,
          backgroundColor: showCta ? 'rgba(255, 140, 0, 0.16)' : 'rgba(255,255,255,0.06)',
          borderRadius: 10,
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: showCta ? '1px solid rgba(255, 140, 0, 0.45)' : '1px solid rgba(255,255,255,0.08)',
          zIndex: 2,
          transform: showCta ? `scale(${interpolate(ctaProgress, [0, 1], [0.97, 1])})` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
          {showCta ? (
            <span style={{ fontWeight: 700, color: '#FFFFFF' }}>
              Gabung diskusi & pantau jadwal dinas hari ini →
            </span>
          ) : showTyping ? (
            <>
              <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF8C00', transform: `translateY(${dot1}px)` }} />
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF8C00', transform: `translateY(${dot2}px)` }} />
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF8C00', transform: `translateY(${dot3}px)` }} />
              </span>
              <span>Railfans sedang mengetik...</span>
            </>
          ) : (
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Kirim foto hunting atau info dinas lokomotif...</span>
          )}
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#FF8C00' }}>LIVE</span>
      </div>
    </AbsoluteFill>
  )
}
