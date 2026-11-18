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
    text: 'CC 206 13 55 baru melintas Jembatan Cisomang, aman lancar!',
    reaction: '🔥 14',
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
    text: 'Malam ini KA Taksaka dari Gambir dinas seri apa ya?',
    reaction: '👀 5',
    enterFrame: 65,
  },
  {
    id: 3,
    user: 'Masinis_Argo',
    role: 'Verified Crew',
    roleColor: '#38BDF8',
    avatarBg: '#EA580C',
    initials: 'MA',
    time: '14:04',
    text: 'Info dinas: CC 201 83 25 siap berangkat di jalur 2 Stasiun Tugu.',
    reaction: '🚆 21',
    enterFrame: 125,
  },
]

export function DiscordChatBumper({ frame: forcedFrame }) {
  const hookFrame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const frame = forcedFrame !== undefined ? forcedFrame : hookFrame

  // Fade out smoothly at loop end (270 -> 300)
  const loopOpacity = interpolate(frame, [0, 10, 275, 298], [0.4, 1, 1, 0.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Typing indicator visible between messages
  const showTyping =
    (frame >= 42 && frame < 65) ||
    (frame >= 96 && frame < 125) ||
    (frame >= 175 && frame < 235)

  const typingDot1 = Math.sin(frame * 0.25) * 3
  const typingDot2 = Math.sin(frame * 0.25 + 1.1) * 3
  const typingDot3 = Math.sin(frame * 0.25 + 2.2) * 3

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0b1626',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        padding: '22px 26px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: loopOpacity,
      }}
    >
      {/* Top Channel Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 14,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#FF8C00', fontWeight: 800, fontSize: 20 }}>#</span>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>
            spotting-dan-dinas-loko
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#22C55E',
              display: 'inline-block',
            }}
          />
          <span>1.480+ online</span>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 14,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        {CHAT_MESSAGES.map((msg) => {
          const progress = spring({
            frame: Math.max(0, frame - msg.enterFrame),
            fps,
            config: { damping: 14, stiffness: 120, mass: 0.7 },
          })
          const visible = frame >= msg.enterFrame
          const translateY = interpolate(progress, [0, 1], [18, 0])
          const opacity = visible ? interpolate(progress, [0, 1], [0, 1]) : 0

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                opacity,
                transform: `translateY(${translateY}px)`,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  backgroundColor: msg.avatarBg,
                  border: '1px solid rgba(255,255,255,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {msg.initials}
              </div>

              {/* Message Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF' }}>{msg.user}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: msg.roleColor,
                    }}
                  >
                    {msg.role}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{msg.time}</span>
                </div>

                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 1.4 }}>
                  {msg.text}
                </div>

                <div
                  style={{
                    display: 'inline-block',
                    marginTop: 5,
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    padding: '2px 8px',
                    borderRadius: 6,
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  {msg.reaction}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Typing Bar */}
      <div
        style={{
          height: 36,
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: 10,
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
          {showTyping ? (
            <>
              <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF8C00', transform: `translateY(${typingDot1}px)` }} />
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF8C00', transform: `translateY(${typingDot2}px)` }} />
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF8C00', transform: `translateY(${typingDot3}px)` }} />
              </span>
              <span>Railfans sedang mengetik...</span>
            </>
          ) : (
            <span>Kirim foto hunting atau info dinas lokomotif...</span>
          )}
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#FF8C00' }}>LIVE</span>
      </div>
    </AbsoluteFill>
  )
}
