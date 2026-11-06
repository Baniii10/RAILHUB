'use client'

import React from 'react'
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion'

// Predefined static star positions for consistent rendering across frames
const STARS = [
  { x: 35, y: 30, size: 2.2, phase: 0 },
  { x: 75, y: 75, size: 1.5, phase: 1.2 },
  { x: 120, y: 40, size: 2.5, phase: 2.4 },
  { x: 165, y: 85, size: 1.2, phase: 0.8 },
  { x: 210, y: 25, size: 3.0, phase: 3.1 },
  { x: 260, y: 65, size: 1.8, phase: 1.9 },
  { x: 310, y: 35, size: 2.2, phase: 2.7 },
  { x: 360, y: 90, size: 1.4, phase: 0.5 },
  { x: 410, y: 20, size: 2.8, phase: 1.5 },
  { x: 460, y: 60, size: 1.6, phase: 3.4 },
  { x: 510, y: 45, size: 2.4, phase: 2.1 },
  { x: 560, y: 80, size: 1.3, phase: 0.9 },
  { x: 610, y: 28, size: 2.9, phase: 1.8 },
  { x: 660, y: 70, size: 1.7, phase: 3.0 },
  { x: 710, y: 40, size: 2.2, phase: 0.4 },
  { x: 755, y: 85, size: 1.5, phase: 2.3 },
  { x: 95, y: 110, size: 1.6, phase: 1.7 },
  { x: 235, y: 115, size: 2.0, phase: 0.3 },
  { x: 395, y: 105, size: 1.4, phase: 2.9 },
  { x: 545, y: 110, size: 1.8, phase: 1.1 },
  { x: 685, y: 115, size: 2.1, phase: 3.5 },
  { x: 740, y: 30, size: 2.6, phase: 0.6 },
  { x: 180, y: 55, size: 1.5, phase: 1.4 },
  { x: 480, y: 35, size: 2.2, phase: 2.8 },
  { x: 630, y: 50, size: 1.7, phase: 0.7 },
]

export function NightTrainBumper(props = {}) {
  let frame = 0
  let width = 800
  let height = 450

  try {
    // Attempt reading from Remotion context (Player / Composition)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    frame = useCurrentFrame()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const config = useVideoConfig()
    width = config.width || 800
    height = config.height || 450
  } catch {
    // Safe fallback when rendered outside Remotion context during SSR or static export
    frame = typeof props.frame === 'number' ? props.frame : 0
    width = props.width || 800
    height = props.height || 450
  }

  // 1. High-speed continuous loop offsets
  // Rail ties glide backward very fast (speed 22 px/frame)
  const tiesOffset = (frame * 24) % 90

  // Catenary poles zoom by at 12 px/frame
  const poleOffset = (frame * 14) % 360

  // Midground hills parallax at 3.5 px/frame
  const hillsOffset = (frame * 4) % 800

  // Far mountains parallax at 1 px/frame
  const mountainOffset = (frame * 1.2) % 800

  // Subtle rhythmic locomotive vertical rumble
  const trainChugY = Math.sin((frame / 3.5) * Math.PI) * 1.2

  // Glowing headlight volumetric pulse
  const beamPulse = Math.sin((frame / 12) * Math.PI) * 0.08 + 0.92

  // Moon soft ambient halo pulse
  const moonGlow = Math.sin((frame / 20) * Math.PI) * 0.15 + 0.85

  // Periodic shooting star across the top sky (every 110 frames)
  const meteorCycle = frame % 110
  const meteorActive = meteorCycle < 24
  const meteorX = interpolate(meteorCycle, [0, 24], [100, 380], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const meteorY = interpolate(meteorCycle, [0, 24], [20, 110], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const meteorOpacity = interpolate(meteorCycle, [0, 6, 18, 24], [0, 1, 0.8, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Signal aspect beacon (blinks steady high-priority green "Aman")
  const signalBlink = Math.sin((frame / 8) * Math.PI) > -0.3 ? 1 : 0.4

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#050813',
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
          {/* Deep Twilight to Midnight Sky */}
          <linearGradient id="rhNightSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#04060f" />
            <stop offset="35%" stopColor="#0a1228" />
            <stop offset="68%" stopColor="#141a3a" />
            <stop offset="90%" stopColor="#251b47" />
            <stop offset="100%" stopColor="#3b1d5c" />
          </linearGradient>

          {/* Far Mountain Silhouette */}
          <linearGradient id="rhFarMountain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#141a36" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0c0e1e" stopOpacity="0.95" />
          </linearGradient>

          {/* Midground Hills Silhouette */}
          <linearGradient id="rhMidHills" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0c1328" />
            <stop offset="100%" stopColor="#060914" />
          </linearGradient>

          {/* Golden Train Interior Cabin Glow */}
          <linearGradient id="rhCabinWindow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Train Aerodynamic Body Gradient */}
          <linearGradient id="rhLocoBody" x1="0%" y1="0%" x2="100%" y2="30%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="35%" stopColor="#1e293b" />
            <stop offset="65%" stopColor="#334155" />
            <stop offset="85%" stopColor="#ff7a00" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          {/* Whoosh / Argo Sleek Nose Livery */}
          <linearGradient id="rhLocoNose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e2e8f0" />
            <stop offset="70%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          {/* Headlight Intense Core Beam */}
          <radialGradient id="rhHeadlightCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          {/* Long Forward Volumetric Light Cone onto Rails */}
          <linearGradient id="rhVolumetricBeam" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.85" />
            <stop offset="25%" stopColor="#fef08a" stopOpacity="0.45" />
            <stop offset="65%" stopColor="#fde047" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
          </linearGradient>

          {/* Polished Steel Rail Reflection */}
          <linearGradient id="rhSteelRail" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="35%" stopColor="#f8fafc" />
            <stop offset="70%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Ballast / Ground Bed */}
          <linearGradient id="rhGroundBed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e1832" />
            <stop offset="30%" stopColor="#110d1f" />
            <stop offset="100%" stopColor="#05040a" />
          </linearGradient>

          {/* Neon Logo Glow Filter */}
          <filter id="rhLogoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.45" />
            <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#1e3a8a" floodOpacity="0.5" />
          </filter>

          {/* Headlight Bloom Filter */}
          <filter id="rhBloom" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. SKY BACKGROUND */}
        <rect width={width} height={height} fill="url(#rhNightSky)" />

        {/* 2. STARS FIELD */}
        {STARS.map((star, i) => {
          const starAlpha =
            Math.sin((frame / 15 + star.phase) * Math.PI) * 0.35 + 0.65
          return (
            <circle
              key={i}
              cx={star.x}
              cy={star.y}
              r={star.size}
              fill="#ffffff"
              opacity={starAlpha}
            />
          )
        })}

        {/* 3. SHOOTING METEOR (Periodic) */}
        {meteorActive && (
          <g opacity={meteorOpacity}>
            <line
              x1={meteorX - 60}
              y1={meteorY - 24}
              x2={meteorX}
              y2={meteorY}
              stroke="url(#rhHeadlightCore)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx={meteorX} cy={meteorY} r="3" fill="#ffffff" filter="url(#rhBloom)" />
          </g>
        )}

        {/* 4. CRESCENT MOON & LUNAR HALO */}
        <g transform="translate(670, 70)">
          {/* Outer Ambient Glow */}
          <circle cx="0" cy="0" r="46" fill="#f8fafc" opacity={moonGlow * 0.08} />
          <circle cx="0" cy="0" r="30" fill="#f8fafc" opacity={moonGlow * 0.15} />
          {/* Main Moon Disc */}
          <circle cx="0" cy="0" r="22" fill="#fffbeb" filter="url(#rhBloom)" opacity="0.95" />
          {/* Shadow creating glowing crescent */}
          <circle cx="8" cy="-6" r="19" fill="#0b1228" opacity="0.92" />
        </g>

        {/* 5. DISTANT MOUNTAIN PARALLAX (Layer 1) */}
        <g transform={`translate(${-mountainOffset}, 0)`}>
          <path
            d="M-200 290 L-80 200 L60 270 L220 180 L380 280 L520 190 L680 270 L840 185 L980 280 L1120 195 L1260 275 L1400 180 L1600 290 L1600 450 L-200 450 Z"
            fill="url(#rhFarMountain)"
          />
        </g>

        {/* 6. MIDGROUND HILLS & FORESTS (Layer 2) */}
        <g transform={`translate(${-hillsOffset}, 0)`}>
          <path
            d="M-100 310 Q60 240 220 300 T540 295 T860 300 T1180 295 T1500 300 L1700 450 L-100 450 Z"
            fill="url(#rhMidHills)"
          />
          {/* City Radio Towers with Blinking Red Beacons */}
          {[120, 480, 840, 1200].map((towerX, idx) => (
            <g key={idx} transform={`translate(${towerX}, 235)`}>
              <line x1="0" y1="0" x2="0" y2="60" stroke="#1e293b" strokeWidth="2.5" />
              <line x1="-8" y1="20" x2="8" y2="20" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="-12" y1="40" x2="12" y2="40" stroke="#1e293b" strokeWidth="1.5" />
              {/* Blinking Warning Beacon */}
              <circle
                cx="0"
                cy="0"
                r="3.5"
                fill="#ef4444"
                opacity={Math.sin((frame / 10 + idx) * Math.PI) > 0 ? 0.95 : 0.2}
                filter="url(#rhBloom)"
              />
            </g>
          ))}
        </g>

        {/* 7. GROUND & BALLAST (Layer 3) */}
        <rect x="0" y="325" width={width} height="125" fill="url(#rhGroundBed)" />

        {/* Rapid Rail Ties (Sleepers) */}
        <g transform={`translate(${-tiesOffset}, 0)`}>
          {Array.from({ length: 24 }).map((_, idx) => {
            const xPos = idx * 45
            return (
              <g key={idx} transform={`translate(${xPos}, 365)`}>
                {/* Wood/Concrete Tie */}
                <rect x="-8" y="0" width="22" height="18" rx="2" fill="#181329" />
                <rect x="-7" y="1" width="20" height="4" fill="#32294f" opacity="0.6" />
                {/* Steel Rail Fasteners */}
                <rect x="-5" y="4" width="4" height="6" fill="#64748b" />
                <rect x="7" y="4" width="4" height="6" fill="#64748b" />
              </g>
            )
          })}
        </g>

        {/* 8. STEEL RAILS (Polished reflective track tops) */}
        {/* Top Rail */}
        <line x1="0" y1="368" x2={width} y2="368" stroke="url(#rhSteelRail)" strokeWidth="6" />
        <line x1="0" y1="366" x2={width} y2="366" stroke="#ffffff" strokeWidth="1.2" opacity="0.75" />
        {/* Bottom Rail */}
        <line x1="0" y1="379" x2={width} y2="379" stroke="url(#rhSteelRail)" strokeWidth="4.5" />
        <line x1="0" y1="378" x2={width} y2="378" stroke="#ffffff" strokeWidth="1" opacity="0.6" />

        {/* 9. OVERHEAD CATENARY POLES (Layer 4 - Fast Parallax) */}
        <g transform={`translate(${-poleOffset}, 0)`}>
          {[0, 360, 720, 1080].map((poleX, idx) => (
            <g key={idx} transform={`translate(${poleX}, 130)`}>
              {/* Vertical Mast */}
              <rect x="0" y="0" width="7" height="240" rx="2" fill="#1e293b" />
              <rect x="1" y="0" width="2" height="240" fill="#475569" opacity="0.8" />
              {/* Horizontal Arm */}
              <line x1="-40" y1="40" x2="10" y2="40" stroke="#334155" strokeWidth="4" />
              <line x1="-35" y1="52" x2="0" y2="40" stroke="#475569" strokeWidth="2.5" />
              {/* Ceramic Insulator */}
              <circle cx="-35" cy="46" r="4.5" fill="#38bdf8" opacity="0.85" />
              {/* Signal aspect light */}
              <circle cx="12" cy="70" r="5" fill="#22c55e" opacity={signalBlink} filter="url(#rhBloom)" />
            </g>
          ))}
        </g>
        {/* Overhead Electric Contact Wires */}
        <line x1="0" y1="170" x2={width} y2="170" stroke="#64748b" strokeWidth="1.5" opacity="0.5" />
        <line x1="0" y1="182" x2={width} y2="182" stroke="#475569" strokeWidth="1.2" opacity="0.4" />

        {/* 10. THE NIGHT TRAIN (Cruising rightward / center stage) */}
        <g transform={`translate(0, ${trainChugY})`}>
          
          {/* VOLUMETRIC FORWARD HEADLIGHT BEAM (Casting forward into the right night) */}
          <polygon
            points="580,332 800,285 800,380 580,338"
            fill="url(#rhVolumetricBeam)"
            opacity={beamPulse}
          />
          <polygon
            points="580,332 800,310 800,365 580,336"
            fill="url(#rhVolumetricBeam)"
            opacity={beamPulse * 0.8}
          />

          {/* Reflective light pool on the ground ahead */}
          <ellipse
            cx="690"
            cy="374"
            rx="105"
            ry="18"
            fill="url(#rhVolumetricBeam)"
            opacity={beamPulse * 0.9}
          />

          {/* === PASSENGER CAR 3 (Left-most, entering frame) === */}
          <g transform="translate(10, 275)">
            {/* Coach Chassis */}
            <rect x="0" y="0" width="160" height="84" rx="8" fill="#1e243a" stroke="#0f172a" strokeWidth="2" />
            <rect x="0" y="62" width="160" height="8" fill="#ea580c" />
            <rect x="0" y="70" width="160" height="4" fill="#38bdf8" />
            {/* Windows with warm glowing interior */}
            {[14, 48, 82, 116].map((wx, idx) => (
              <g key={idx} transform={`translate(${wx}, 18)`}>
                <rect x="0" y="0" width="24" height="26" rx="4" fill="url(#rhCabinWindow)" />
                <rect x="2" y="2" width="20" height="10" fill="#ffffff" opacity="0.4" />
                {/* Silhouette of passenger */}
                <circle cx="12" cy="18" r="5" fill="#451a03" opacity="0.6" />
                <rect x="6" y="22" width="12" height="4" rx="2" fill="#451a03" opacity="0.6" />
              </g>
            ))}
            {/* Bogie Wheels */}
            <circle cx="32" cy="92" r="11" fill="#0f172a" stroke="#475569" strokeWidth="3.5" />
            <circle cx="32" cy="92" r="4" fill="#94a3b8" />
            <circle cx="128" cy="92" r="11" fill="#0f172a" stroke="#475569" strokeWidth="3.5" />
            <circle cx="128" cy="92" r="4" fill="#94a3b8" />
          </g>

          {/* Coupler 1-2 */}
          <rect x="170" y="325" width="14" height="12" rx="2" fill="#0f172a" />

          {/* === PASSENGER CAR 2 (Middle Coach) === */}
          <g transform="translate(184, 275)">
            <rect x="0" y="0" width="170" height="84" rx="8" fill="#1e243a" stroke="#0f172a" strokeWidth="2" />
            {/* Indonesian Modern Livery Stripes */}
            <rect x="0" y="62" width="170" height="8" fill="#ea580c" />
            <rect x="0" y="70" width="170" height="4" fill="#38bdf8" />
            {/* Windows */}
            {[14, 52, 90, 128].map((wx, idx) => (
              <g key={idx} transform={`translate(${wx}, 18)`}>
                <rect x="0" y="0" width="26" height="26" rx="4" fill="url(#rhCabinWindow)" />
                <rect x="2" y="2" width="22" height="10" fill="#ffffff" opacity="0.4" />
                <circle cx="13" cy="18" r="5" fill="#451a03" opacity="0.65" />
                <rect x="7" y="22" width="12" height="4" rx="2" fill="#451a03" opacity="0.65" />
              </g>
            ))}
            {/* Underbody Equipment & Battery Box */}
            <rect x="65" y="84" width="40" height="10" rx="2" fill="#090e17" />
            {/* Bogies */}
            <circle cx="35" cy="92" r="11" fill="#0f172a" stroke="#475569" strokeWidth="3.5" />
            <circle cx="35" cy="92" r="4" fill="#94a3b8" />
            <circle cx="135" cy="92" r="11" fill="#0f172a" stroke="#475569" strokeWidth="3.5" />
            <circle cx="135" cy="92" r="4" fill="#94a3b8" />
          </g>

          {/* Coupler 2-3 */}
          <rect x="354" y="325" width="14" height="12" rx="2" fill="#0f172a" />

          {/* === LOCOMOTIVE CC 206 / AERODYNAMIC LEADER === */}
          <g transform="translate(368, 260)">
            {/* Pantograph High-Speed Arm */}
            <path
              d="M35 0 L55 -32 L95 -32 L80 0 Z"
              fill="none"
              stroke="#ea580c"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <line x1="45" y1="-32" x2="105" y2="-32" stroke="#f8fafc" strokeWidth="3" />

            {/* Aerodynamic Body Shell */}
            <path
              d="M0 15 L140 15 Q195 25 215 55 L222 85 Q225 98 215 99 L0 99 Z"
              fill="url(#rhLocoBody)"
              stroke="#0f172a"
              strokeWidth="2"
            />

            {/* Sleek Aerodynamic Nose Cowling */}
            <path
              d="M130 18 L160 18 Q205 32 218 65 L222 85 Q224 95 210 96 L140 96 Z"
              fill="url(#rhLocoNose)"
            />

            {/* Windshield / Cab Glass */}
            <path
              d="M145 28 L175 28 Q198 38 206 54 L152 54 Z"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            {/* Cab Windshield Reflection */}
            <path
              d="M152 32 L168 32 L158 50 L148 50 Z"
              fill="#38bdf8"
              opacity="0.65"
            />

            {/* Driver Cab Interior Light */}
            <circle cx="172" cy="42" r="7" fill="#fef08a" opacity="0.75" filter="url(#rhBloom)" />
            <circle cx="172" cy="42" r="4" fill="#1e293b" />

            {/* Orange Livery Chevron Arrow on the Nose */}
            <polygon points="175,70 215,70 210,80 165,80" fill="#ea580c" />
            <polygon points="180,82 208,82 205,88 172,88" fill="#1a428a" />

            {/* Pilot / Cowcatcher Plow at base */}
            <path
              d="M200 95 L226 95 L222 106 L195 106 Z"
              fill="#dc2626"
              stroke="#7f1d1d"
              strokeWidth="1.5"
            />

            {/* MAIN DUAL HEADLIGHTS (High Intensity Piercing Beam) */}
            <g transform="translate(216, 72)">
              {/* Headlight Housing */}
              <rect x="-4" y="-8" width="10" height="16" rx="3" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Lamp 1 */}
              <circle cx="1" cy="-3" r="4" fill="#ffffff" filter="url(#rhBloom)" />
              <circle cx="1" cy="-3" r="7" fill="url(#rhHeadlightCore)" opacity={beamPulse} />
              {/* Lamp 2 */}
              <circle cx="1" cy="3" r="4" fill="#ffffff" filter="url(#rhBloom)" />
              <circle cx="1" cy="3" r="7" fill="url(#rhHeadlightCore)" opacity={beamPulse} />
            </g>

            {/* Center High Beam Lamp */}
            <g transform="translate(195, 23)">
              <circle cx="0" cy="0" r="3.5" fill="#ffffff" filter="url(#rhBloom)" />
              <circle cx="0" cy="0" r="6" fill="#fef08a" opacity={beamPulse * 0.9} />
            </g>

            {/* Locomotive Heavy Triple-Axle Bogies */}
            <circle cx="45" cy="107" r="12" fill="#0f172a" stroke="#475569" strokeWidth="4" />
            <circle cx="45" cy="107" r="4.5" fill="#94a3b8" />
            <circle cx="85" cy="107" r="12" fill="#0f172a" stroke="#475569" strokeWidth="4" />
            <circle cx="85" cy="107" r="4.5" fill="#94a3b8" />
            <circle cx="165" cy="107" r="12" fill="#0f172a" stroke="#475569" strokeWidth="4" />
            <circle cx="165" cy="107" r="4.5" fill="#94a3b8" />
          </g>

        </g>

        {/* 11. TOP VIGNETTE / LETTERBOX SHADOW */}
        <rect
          x="0"
          y="0"
          width={width}
          height="110"
          fill="url(#rhNightSky)"
          opacity="0.85"
        />

        {/* Ambient Spotlight Behind Logo */}
        <ellipse
          cx={width / 2}
          cy="48"
          rx="180"
          ry="40"
          fill="radial-gradient(ellipse at center, rgba(37, 99, 235, 0.45) 0%, rgba(15, 23, 42, 0) 70%)"
          opacity="0.95"
        />
      </svg>

      {/* 12. OFFICIAL FIX LOGO RAILHUB ON TOP ("logo diatasnya ya yg fix logo railhub") */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            padding: '7px 24px',
            borderRadius: 18,
            background: 'rgba(5, 10, 22, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(37, 99, 235, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/images/Fix logo railhub.png"
            alt="RAILHUB Official Logo"
            style={{
              height: 42,
              width: 'auto',
              maxWidth: 220,
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.65))',
            }}
          />
        </div>
      </div>
    </div>
  )
}
