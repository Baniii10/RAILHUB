'use client'

import React from 'react'
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion'

export function DayTrainBumper(props = {}) {
  let frame = 0
  let width = 800
  let height = 450

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    frame = useCurrentFrame()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const config = useVideoConfig()
    width = config.width || 800
    height = config.height || 450
  } catch {
    frame = typeof props.frame === 'number' ? props.frame : 0
    width = props.width || 800
    height = props.height || 450
  }

  // 1. High-speed continuous loop offsets
  const tiesOffset = (frame * 24) % 90
  const poleOffset = (frame * 14) % 360
  const hillsOffset = (frame * 4) % 800
  const mountainOffset = (frame * 1.2) % 800
  const cloudOffset1 = (frame * 0.8) % 800
  const cloudOffset2 = (frame * 0.5) % 800
  const trainChugY = Math.sin((frame / 3.5) * Math.PI) * 1.2

  // Sun warm radiant pulse
  const sunPulse = Math.sin((frame / 18) * Math.PI) * 0.08 + 0.95
  const sunRayRotate = (frame * 0.6) % 360

  // Bird soaring animation
  const birdFlapY = Math.sin((frame / 6) * Math.PI) * 3
  const birdFlyX = (frame * 1.5) % 900

  // Signal aspect beacon (steady green)
  const signalBlink = Math.sin((frame / 8) * Math.PI) > -0.3 ? 1 : 0.6

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#0284c7',
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid slice"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      >
        <defs>
          {/* Azure Daytime Sky */}
          <linearGradient id="rhDaySky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="30%" stopColor="#0ea5e9" />
            <stop offset="60%" stopColor="#38bdf8" />
            <stop offset="85%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>

          {/* Golden Sun Radiant Glow */}
          <radialGradient id="rhSunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbeb" stopOpacity="1" />
            <stop offset="35%" stopColor="#fef08a" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#facc15" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          {/* Far Mountains Silhouette */}
          <linearGradient id="rhDayFarMountain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.95" />
          </linearGradient>

          {/* Midground Emerald Hills */}
          <linearGradient id="rhDayMidHills" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Near Valley Hills */}
          <linearGradient id="rhDayNearHills" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>

          {/* Daytime Tinted Train Windows */}
          <linearGradient id="rhDayWindow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="60%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Train Aerodynamic Body Gradient */}
          <linearGradient id="rhDayLocoBody" x1="0%" y1="0%" x2="100%" y2="30%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#f8fafc" />
            <stop offset="75%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Train Stripes */}
          <linearGradient id="rhStripeBlue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="rhStripeOrange" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          {/* Headlight Soft Daylight Glow */}
          <radialGradient id="rhDayHeadlightCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="45%" stopColor="#fef08a" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          {/* Polished Steel Rail */}
          <linearGradient id="rhDaySteelRail" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="40%" stopColor="#ffffff" />
            <stop offset="75%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Ballast Stone Ground Bed */}
          <linearGradient id="rhDayGroundBed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="35%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Logo Drop Shadow */}
          <filter id="rhDayLogoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* 1. Backdrop Daytime Sky */}
        <rect x="0" y="0" width={width} height={height} fill="url(#rhDaySky)" />

        {/* 2. Radiant Golden Sun */}
        <g transform="translate(680, 75)" opacity={sunPulse}>
          <circle cx="36" cy="36" r="64" fill="url(#rhSunGlow)" />
          <circle cx="36" cy="36" r="26" fill="#fbbf24" />
          <circle cx="36" cy="36" r="20" fill="#fffbeb" />
          {/* Rotating Sun Rays */}
          <g
            transform={`rotate(${sunRayRotate} 36 36)`}
            stroke="#fde047"
            strokeWidth="2.5"
            opacity="0.8"
            strokeLinecap="round"
          >
            <line x1="36" y1="-8" x2="36" y2="4" />
            <line x1="36" y1="68" x2="36" y2="80" />
            <line x1="-8" y1="36" x2="4" y2="36" />
            <line x1="68" y1="36" x2="80" y2="36" />
            <line x1="5" y1="5" x2="14" y2="14" />
            <line x1="58" y1="58" x2="67" y2="67" />
            <line x1="5" y1="67" x2="14" y2="58" />
            <line x1="58" y1="14" x2="67" y2="5" />
          </g>
        </g>

        {/* 3. Drifting Fluffy White Cumulus Clouds */}
        <g transform={`translate(${-cloudOffset1}, 0)`} fill="#ffffff" opacity="0.85">
          <path d="M120 70 Q150 45 190 70 Q225 55 255 75 Q275 88 240 96 Q180 100 135 94 Z" />
          <path d="M920 70 Q950 45 990 70 Q1025 55 1055 75 Q1075 88 1040 96 Q980 100 935 94 Z" />
          <path d="M480 95 Q515 70 560 95 Q595 80 625 102 Q645 115 610 122 Q545 125 495 118 Z" opacity="0.7" />
          <path d="M1280 95 Q1315 70 1360 95 Q1395 80 1425 102 Q1445 115 1410 122 Q1345 125 1295 118 Z" opacity="0.7" />
        </g>

        {/* 4. Soaring Flock of Birds */}
        <g transform={`translate(${birdFlyX - 100}, ${birdFlapY})`} stroke="#1e3a8a" strokeWidth="1.8" fill="none" opacity="0.65" strokeLinecap="round">
          <path d="M80 85 Q88 77 96 85 Q104 77 112 85" />
          <path d="M120 98 Q126 91 132 98 Q138 91 144 98" />
          <path d="M60 104 Q66 98 72 104 Q78 98 84 104" />
        </g>

        {/* 5. Parallax Far Mountains (Slow: 1.2 px/frame) */}
        <g transform={`translate(${-mountainOffset}, 0)`}>
          <path
            d="M-40 240 L60 140 L160 210 L280 120 L400 230 L540 110 L680 220 L820 130 L960 225 L1080 120 L1200 230 L1340 110 L1480 220 L1640 240 L1640 330 L-40 330 Z"
            fill="url(#rhDayFarMountain)"
          />
          {/* Mountain highlights */}
          <polygon points="540,110 522,145 558,145" fill="rgba(255,255,255,0.3)" />
          <polygon points="280,120 266,150 294,150" fill="rgba(255,255,255,0.25)" />
          <polygon points="820,130 806,160 834,160" fill="rgba(255,255,255,0.25)" />
          <polygon points="1340,110 1322,145 1358,145" fill="rgba(255,255,255,0.3)" />
        </g>

        {/* 6. Parallax Midground Emerald Hills & Forests (Medium: 4 px/frame) */}
        <g transform={`translate(${-hillsOffset}, 0)`}>
          <path
            d="M-40 280 Q80 215 220 250 Q360 205 500 245 Q640 200 780 240 Q920 195 1060 245 Q1200 205 1340 245 Q1480 200 1640 250 L1640 340 L-40 340 Z"
            fill="url(#rhDayMidHills)"
          />
          {/* Forest trees on ridges */}
          <g fill="#047857" opacity="0.8">
            <polygon points="120,240 126,220 132,240" />
            <polygon points="130,238 136,215 142,238" />
            <polygon points="340,225 346,206 352,225" />
            <polygon points="350,223 356,202 362,223" />
            <polygon points="620,220 626,202 632,220" />
            <polygon points="900,215 906,196 912,215" />
            <polygon points="910,213 916,192 922,213" />
            <polygon points="1180,225 1186,206 1192,225" />
            <polygon points="1460,220 1466,202 1472,220" />
          </g>
        </g>

        {/* 7. Scenic Curved Railway Viaduct Base */}
        <path
          d="M0 290 Q200 278 400 280 Q600 278 800 290 L800 310 Q600 298 400 300 Q200 298 0 310 Z"
          fill="#64748b"
        />
        {/* Viaduct Piers */}
        <g fill="#475569" opacity="0.95">
          <rect x="50" y="295" width="40" height="40" rx="3" />
          <rect x="180" y="293" width="40" height="42" rx="3" />
          <rect x="310" y="292" width="40" height="43" rx="3" />
          <rect x="440" y="292" width="40" height="43" rx="3" />
          <rect x="570" y="293" width="40" height="42" rx="3" />
          <rect x="700" y="295" width="40" height="40" rx="3" />
        </g>

        {/* 8. Parallax Catenary Masts & Electrification Poles (Fast: 14 px/frame) */}
        <g transform={`translate(${-poleOffset}, 0)`}>
          {[-1, 0, 1, 2].map((idx) => {
            const baseX = idx * 360 + 80
            return (
              <g key={idx} stroke="#1e3a8a" strokeWidth="2.4" strokeLinecap="round">
                {/* Vertical steel mast */}
                <line x1={baseX} y1={175} x2={baseX} y2={305} />
                {/* Horizontal cantilever arm */}
                <line x1={baseX - 12} y1={185} x2={baseX + 28} y2={185} strokeWidth="2" stroke="#0284c7" />
                {/* Diagonal support bracket */}
                <line x1={baseX} y1={205} x2={baseX + 22} y2={185} strokeWidth="1.6" stroke="#38bdf8" />
                {/* Insulator bell */}
                <rect x={baseX + 24} y={181} width="6" height="8" rx="1.5" fill="#e2e8f0" stroke="none" />
                {/* Steady railway signal beacon */}
                <circle cx={baseX - 6} cy={220} r="3.5" fill="#15803d" stroke="none" />
                <circle
                  cx={baseX - 6}
                  cy={220}
                  r="2"
                  fill="#4ade80"
                  stroke="none"
                  opacity={signalBlink}
                />
              </g>
            )
          })}
        </g>

        {/* Continuous Overhead Power Contact Wire */}
        <path d="M0 188 Q200 190 400 188 Q600 190 800 188" stroke="rgba(71, 85, 105, 0.7)" strokeWidth="1.2" fill="none" />

        {/* 9. Ballast Bed Ground */}
        <rect x="0" y="298" width={width} height={height - 298} fill="url(#rhDayGroundBed)" />

        {/* 10. Rapid Running Sleepers / Ties (Ultra-fast: 24 px/frame) */}
        <g transform={`translate(${-tiesOffset}, 0)`}>
          {Array.from({ length: 32 }).map((_, i) => {
            const x = i * 30 - 30
            return (
              <rect
                key={i}
                x={x}
                y={297}
                width="14"
                height="6"
                rx="1"
                fill="#334155"
                stroke="#1e293b"
                strokeWidth="0.8"
              />
            )
          })}
        </g>

        {/* Twin Continuous Steel Rails */}
        <line x1="0" y1="295" x2={width} y2="295" stroke="url(#rhDaySteelRail)" strokeWidth="3" />
        <line x1="0" y1="298" x2={width} y2="298" stroke="url(#rhDaySteelRail)" strokeWidth="2.2" />

        {/* 11. High-Speed Aerodynamic Bullet Train (Center Stage) */}
        <g transform={`translate(210, ${216 + trainChugY})`}>
          {/* Passenger Carriage (Rear) */}
          <g>
            <rect x="-140" y="44" width="130" height="34" rx="4" fill="url(#rhDayLocoBody)" />
            {/* Livery Stripes */}
            <rect x="-140" y="58" width="130" height="5" fill="url(#rhStripeBlue)" />
            <rect x="-140" y="64" width="130" height="3" fill="url(#rhStripeOrange)" />
            {/* Windows */}
            {[-126, -100, -74, -48, -22].map((wx, i) => (
              <rect key={i} x={wx} y="48" width="16" height="8" rx="2" fill="url(#rhDayWindow)" />
            ))}
            {/* Bogie wheels */}
            <rect x="-132" y="77" width="34" height="4" rx="1.5" fill="#0f172a" />
            <rect x="-42" y="77" width="34" height="4" rx="1.5" fill="#0f172a" />
            <circle cx="-125" cy="80" r="3.5" fill="#475569" />
            <circle cx="-105" cy="80" r="3.5" fill="#475569" />
            <circle cx="-35" cy="80" r="3.5" fill="#475569" />
            <circle cx="-15" cy="80" r="3.5" fill="#475569" />
          </g>

          {/* Flexible Gangway */}
          <rect x="-8" y="47" width="8" height="28" rx="1.5" fill="#334155" />

          {/* Lead Bullet Locomotive */}
          <g>
            {/* Aerodynamic Body Profile */}
            <path
              d="M0 44 H160 Q215 46 250 63 Q265 71 270 78 L265 80 H0 Z"
              fill="url(#rhDayLocoBody)"
            />
            {/* Swept Dynamic Stripes */}
            <path
              d="M0 58 H155 Q205 60 236 69 L230 74 H0 Z"
              fill="url(#rhStripeBlue)"
            />
            <path
              d="M0 64 H150 Q195 65 224 73 L218 77 H0 Z"
              fill="url(#rhStripeOrange)"
            />

            {/* Aerodynamic Windshield */}
            <path
              d="M170 48 L220 57 Q226 59 218 63 L165 61 Z"
              fill="url(#rhDayWindow)"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="0.8"
            />

            {/* Locomotive Passenger Windows */}
            {[18, 44, 70, 96, 122].map((wx, i) => (
              <rect key={i} x={wx} y="48" width="16" height="8" rx="2" fill="url(#rhDayWindow)" />
            ))}

            {/* Twin High-Intensity LED Headlights */}
            <circle cx="260" cy="72" r="4.2" fill="url(#rhDayHeadlightCore)" />
            <circle cx="264" cy="76" r="3.8" fill="url(#rhDayHeadlightCore)" />
            <circle cx="260" cy="72" r="2" fill="#ffffff" />

            {/* High-speed Single-Arm Pantograph */}
            <g stroke="#1d4ed8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="70" y1="44" x2="84" y2="30" />
              <line x1="84" y1="30" x2="100" y2="17" />
              <line x1="90" y1="17" x2="110" y2="17" strokeWidth="2.8" stroke="#ea580c" />
            </g>

            {/* Bogies & Wheels */}
            <rect x="18" y="77" width="38" height="4.5" rx="1.5" fill="#0f172a" />
            <rect x="180" y="77" width="42" height="4.5" rx="1.5" fill="#0f172a" />
            <circle cx="27" cy="80" r="3.5" fill="#475569" />
            <circle cx="47" cy="80" r="3.5" fill="#475569" />
            <circle cx="190" cy="80" r="3.5" fill="#475569" />
            <circle cx="212" cy="80" r="3.5" fill="#475569" />
          </g>

          {/* Aerodynamic Speed Trails */}
          <g stroke="rgba(255, 255, 255, 0.75)" strokeWidth="1.4" strokeLinecap="round">
            <line x1="275" y1="72" x2="335" y2="72" />
            <line x1="268" y1="77" x2="315" y2="77" />
            <line x1="250" y1="81" x2="350" y2="81" stroke="#38bdf8" strokeWidth="1.8" />
          </g>
        </g>

        {/* 12. Floating Top Banner: Official RAILHUB Logo */}
        <g transform={`translate(${width / 2 - 95}, 20)`} filter="url(#rhDayLogoShadow)">
          {/* Frosted Glass Pill Behind Logo */}
          <rect
            x="-16"
            y="-6"
            width="222"
            height="56"
            rx="28"
            fill="rgba(255, 255, 255, 0.85)"
            stroke="rgba(255, 255, 255, 0.95)"
            strokeWidth="1.5"
          />
          {/* Official RAILHUB Logo */}
          <image
            href="/images/Fix logo railhub.png"
            x="0"
            y="2"
            width="190"
            height="40"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      </svg>
    </div>
  )
}
export default DayTrainBumper

