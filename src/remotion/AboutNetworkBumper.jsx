'use client'

import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

const STATIONS = [
  { code: 'GMR', name: 'Gambir', x: 90 },
  { code: 'BD', name: 'Bandung', x: 250 },
  { code: 'YK', name: 'Yogyakarta', x: 430 },
  { code: 'SGU', name: 'Surabaya', x: 610 },
]

export function AboutNetworkBumper() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const trainProgress = interpolate(frame, [0, 270], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const trainX = interpolate(trainProgress, [0, 1], [90, 610])
  const titleIn = spring({ frame, fps, config: { damping: 16, stiffness: 100 } })

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f1f6ff 55%, #e8f0fe 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#0f172a',
        padding: '28px 32px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: interpolate(titleIn, [0, 1], [0, 1]),
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', color: '#1A428A', textTransform: 'uppercase' }}>
          Jaringan Lintas Jawa
        </div>
        <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace', fontWeight: 600 }}>
          50 STASIUN TERHUBUNG
        </div>
      </div>

      {/* Animated Corridor Track */}
      <div style={{ position: 'relative', height: 140, display: 'flex', alignItems: 'center' }}>
        <svg width="700" height="120" viewBox="0 0 700 120" style={{ width: '100%', height: 'auto' }}>
          {/* Base Track Line */}
          <line x1="90" y1="54" x2="610" y2="54" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" />

          {/* Active Progress Line */}
          <line x1="90" y1="54" x2={trainX} y2="54" stroke="#FF8C00" strokeWidth="4" strokeLinecap="round" />

          {/* Station Nodes */}
          {STATIONS.map((st) => {
            const reached = trainX >= st.x - 4
            return (
              <g key={st.code}>
                <circle
                  cx={st.x}
                  cy={54}
                  r={reached ? 8 : 6}
                  fill={reached ? '#FF8C00' : '#ffffff'}
                  stroke={reached ? '#1A428A' : '#94a3b8'}
                  strokeWidth="2.5"
                />
                <text
                  x={st.x}
                  y={84}
                  textAnchor="middle"
                  fill="#1A428A"
                  fontSize="13"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  {st.code}
                </text>
                <text
                  x={st.x}
                  y={102}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="11"
                  fontWeight="500"
                >
                  {st.name}
                </text>
              </g>
            )
          })}

          {/* Moving Train Indicator */}
          <g transform={`translate(${trainX}, 30)`}>
            <rect x="-18" y="0" width="36" height="16" rx="5" fill="#1A428A" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="12" cy="8" r="2.5" fill="#FF8C00" />
          </g>
        </svg>
      </div>

      {/* Bottom Metric Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #dbeafe',
          paddingTop: 14,
          fontSize: 13,
          fontWeight: 600,
          color: '#475569',
        }}
      >
        <span>Reservasi Kursi Atomik</span>
        <span>E-Boarding QR</span>
        <span style={{ color: '#ea580c', fontWeight: 700 }}>Real-Time Sync</span>
      </div>
    </AbsoluteFill>
  )
}
