'use client'

import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'

const PEOPLE = [
  { x: 115, shirt: '#2563eb', pants: '#1e293b', bag: 'suitcase', speed: 0.35, phase: 0 },
  { x: 205, shirt: '#f97316', pants: '#334155', bag: 'backpack', speed: 0, phase: 1.1 },
  { x: 295, shirt: '#ec4899', pants: '#1e293b', bag: 'none', speed: -0.25, phase: 2.2 },
  { x: 390, shirt: '#1a428a', pants: '#0f172a', bag: 'officer', speed: 0, phase: 0.5 },
  { x: 510, shirt: '#10b981', pants: '#334155', bag: 'suitcase', speed: 0.28, phase: 3.1 },
  { x: 635, shirt: '#6366f1', pants: '#1e293b', bag: 'backpack', speed: -0.2, phase: 1.8 },
]

function PlatformPerson({ person, frame, isDay }) {
  const walkX = person.speed !== 0 ? Math.sin((frame / 300) * Math.PI * 2 + person.phase) * 22 * Math.sign(person.speed) : 0
  const bobY = Math.abs(Math.sin(frame * 0.14 + person.phase)) * (person.speed !== 0 ? 2.5 : 0.8)
  const px = person.x + walkX
  const py = 178 - bobY
  const isOfficer = person.bag === 'officer'

  return (
    <g transform={`translate(${px}, ${py})`}>
      {/* Shadow */}
      <ellipse cx="0" cy="36" rx="8" ry="2.5" fill="rgba(15,23,42,0.22)" />
      {/* Legs */}
      <rect x="-4.5" y="21" width="3.5" height="14" rx="1.5" fill={person.pants} />
      <rect x="1" y="21" width="3.5" height="14" rx="1.5" fill={person.pants} />
      {/* Torso */}
      <rect x="-6.5" y="7" width="13" height="16" rx="4" fill={person.shirt} />
      {isOfficer && (
        <>
          {/* Officer orange sash & cap */}
          <rect x="-6.5" y="13" width="13" height="2.5" fill="#f97316" />
          <rect x="-5.5" y="-2" width="11" height="3.5" rx="1.5" fill="#1a428a" />
          <rect x="-6" y="0.5" width="12" height="1.5" fill="#f59e0b" />
        </>
      )}
      {/* Head */}
      <circle cx="0" cy="2" r="4.8" fill="#fcd34d" stroke={isDay ? '#eab308' : '#ca8a04'} strokeWidth="0.6" />
      {/* Luggage */}
      {person.bag === 'suitcase' && (
        <g transform="translate(8, 20)">
          <rect x="0" y="0" width="9" height="13" rx="2" fill="#475569" />
          <line x1="4.5" y1="-5" x2="4.5" y2="0" stroke="#94a3b8" strokeWidth="1.4" />
          <circle cx="2" cy="14" r="1.5" fill="#0f172a" />
          <circle cx="7" cy="14" r="1.5" fill="#0f172a" />
        </g>
      )}
      {person.bag === 'backpack' && (
        <rect x="-9" y="9" width="3.5" height="10" rx="1.5" fill="#0f172a" opacity="0.85" />
      )}
    </g>
  )
}

function StationBackdrop({ frame, isDay, stationName, stationCode }) {
  const cleanName = String(stationName || 'Gambir').replace(/^Stasiun\s+/i, '').toUpperCase()
  const label = stationCode ? `STASIUN ${cleanName} (${stationCode})` : `STASIUN ${cleanName}`

  return (
    <g>
      {/* Full-Width Station Hall Backdrop */}
      <rect x="0" y="82" width="800" height="132" fill={isDay ? '#e2e8f0' : '#1e293b'} />
      <rect x="0" y="94" width="800" height="120" fill={isDay ? '#f1f5f9' : '#0f172a'} />

      {/* Arched Station Windows */}
      {[42, 148, 254, 498, 604, 710].map((wx) => (
        <g key={wx}>
          <path
            d={`M${wx} 178 V126 A24 24 0 0 1 ${wx + 48} 126 V178 Z`}
            fill={isDay ? '#bae6fd' : '#fbbf24'}
            opacity={isDay ? 0.65 : 0.25}
            stroke={isDay ? '#94a3b8' : '#334155'}
            strokeWidth="2"
          />
          <line x1={wx + 24} y1="102" x2={wx + 24} y2="178" stroke={isDay ? '#94a3b8' : '#334155'} strokeWidth="1.5" />
          <line x1={wx} y1="142" x2={wx + 48} y2="142" stroke={isDay ? '#94a3b8' : '#334155'} strokeWidth="1.5" />
        </g>
      ))}

      {/* Full-Width Peron Canopy Roof */}
      <rect x="0" y="80" width="800" height="16" fill={isDay ? '#1e3a8a' : '#0b1933'} />
      <rect x="0" y="94" width="800" height="5" fill="#f97316" />

      {/* Support Pillars */}
      {[36, 224, 576, 764].map((px) => (
        <g key={px}>
          <rect x={px - 4} y="99" width="8" height="118" fill={isDay ? '#64748b' : '#334155'} />
          <circle cx={px} cy="110" r="5" fill="#fde68a" />
          {!isDay && <circle cx={px} cy="110" r="16" fill="#fde68a" opacity="0.2" />}
        </g>
      ))}

      {/* Hanging Station Signboard */}
      <g transform="translate(270, 99)">
        <line x1="30" y1="0" x2="30" y2="14" stroke="#475569" strokeWidth="2.5" />
        <line x1="230" y1="0" x2="230" y2="14" stroke="#475569" strokeWidth="2.5" />
        <rect x="0" y="14" width="260" height="32" rx="7" fill="#0f295c" stroke="#fbbf24" strokeWidth="2" />
        <text
          x="130"
          y="34"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="12.5"
          fontWeight="800"
          letterSpacing="0.8"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {label.slice(0, 28)}
        </text>
      </g>

      {/* Platform Floor */}
      <rect x="0" y="210" width="800" height="18" fill={isDay ? '#cbd5e1' : '#334155'} />
      {/* Tactile Yellow Safety Line */}
      <rect x="0" y="224" width="800" height="4" fill="#facc15" />

      {/* Animated Passengers & Officer on Platform */}
      {PEOPLE.map((person, i) => (
        <PlatformPerson key={i} person={person} frame={frame} isDay={isDay} />
      ))}
    </g>
  )
}

function RunningScenery({ frame, isDay }) {
  const hillOffset = -(frame * 2.2) % 800
  const poleOffset = -(frame * 9.5) % 240

  return (
    <g>
      {/* Parallax Rolling Hills */}
      <g transform={`translate(${hillOffset}, 0)`}>
        {[0, 800].map((ox) => (
          <g key={ox} transform={`translate(${ox}, 0)`}>
            <path
              d="M0 220 Q140 155 290 198 T580 185 T800 210 V245 H0 Z"
              fill={isDay ? '#64748b' : '#0f172a'}
              opacity={isDay ? 0.35 : 0.7}
            />
            <path
              d="M0 230 Q190 178 380 212 T720 195 T800 225 V245 H0 Z"
              fill={isDay ? '#15803d' : '#064e3b'}
              opacity={isDay ? 0.55 : 0.65}
            />
          </g>
        ))}
      </g>

      {/* Overhead Catenary Wire */}
      <line x1="0" y1="106" x2="800" y2="106" stroke={isDay ? 'rgba(15,23,42,0.3)' : 'rgba(148,163,184,0.35)'} strokeWidth="1.5" />

      {/* Rushing Catenary Poles */}
      <g transform={`translate(${poleOffset}, 0)`}>
        {[0, 240, 480, 720, 960].map((px) => (
          <g key={px} transform={`translate(${px}, 95)`}>
            <rect x="0" y="0" width="5" height="142" fill={isDay ? '#475569' : '#334155'} />
            <rect x="-12" y="10" width="24" height="3.5" fill={isDay ? '#475569' : '#334155'} />
          </g>
        ))}
      </g>
    </g>
  )
}

function SleekExpressTrain({ frame, isDay, isRunning }) {
  const bounceY = isRunning ? Math.sin(frame * 0.45) * 1.1 : Math.sin(frame * 0.08) * 0.35
  const wheelRot = isRunning ? (frame * 18) % 360 : 0

  return (
    <g transform={`translate(88, ${172 + bounceY})`}>
      {/* Headlight Beam */}
      {(isRunning || !isDay) && (
        <polygon
          points="625,52 800,14 800,88"
          fill="url(#rh-headlight-grad)"
          opacity={isDay ? 0.32 : 0.65}
        />
      )}

      {/* ── PASSENGER COACH (REAR) ── */}
      <g transform="translate(0, 6)">
        {/* Roof & AC Unit */}
        <rect x="0" y="0" width="290" height="58" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="52" y="-5" width="76" height="6" rx="3" fill="#94a3b8" />
        <rect x="178" y="-5" width="60" height="6" rx="3" fill="#94a3b8" />
        {/* Navy & Orange Livery */}
        <rect x="0" y="34" width="290" height="13" fill="#1a428a" />
        <rect x="0" y="47" width="290" height="5" fill="#f97316" />
        {/* Illuminated Coach Windows */}
        {[18, 58, 98, 138, 178, 218, 254].map((wx) => (
          <rect
            key={wx}
            x={wx}
            y="12"
            width="28"
            height="17"
            rx="4"
            fill={isDay ? '#bae6fd' : '#fde68a'}
            stroke="#1e3a8a"
            strokeWidth="1.4"
          />
        ))}
        {/* Bogies & Wheels */}
        {[46, 232].map((bx) => (
          <g key={bx} transform={`translate(${bx}, 58)`}>
            <rect x="-24" y="-2" width="48" height="7" rx="3" fill="#1e293b" />
            {[-14, 14].map((wx) => (
              <g key={wx} transform={`translate(${wx}, 6) rotate(${wheelRot})`}>
                <circle r="7.5" fill="#0f172a" stroke="#64748b" strokeWidth="1.8" />
                <line x1="-5" y1="0" x2="5" y2="0" stroke="#94a3b8" strokeWidth="1.2" />
                <line x1="0" y1="-5" x2="0" y2="5" stroke="#94a3b8" strokeWidth="1.2" />
              </g>
            ))}
          </g>
        ))}
      </g>

      {/* Accordion Connector */}
      <rect x="290" y="14" width="12" height="46" fill="#334155" />

      {/* ── AERODYNAMIC EXPRESS LOCOMOTIVE (FRONT) ── */}
      <g transform="translate(302, 4)">
        {/* Pantograph */}
        <path d="M54 2 L70 -18 L92 -18 L76 2" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinejoin="round" />
        <line x1="60" y1="-19" x2="102" y2="-19" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

        {/* Sleek Nose Body */}
        <path
          d="M0 10 Q0 2 10 2 H222 C268 2 308 22 326 50 C330 56 326 62 318 62 H0 Z"
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />

        {/* Navy & Orange Livery Stripe */}
        <path
          d="M0 36 H298 C312 36 320 44 326 52 H0 Z"
          fill="#1a428a"
        />
        <path
          d="M0 49 H324 C326 53 324 57 318 57 H0 Z"
          fill="#f97316"
        />

        {/* Panoramic Cockpit Windshield */}
        <path
          d="M224 10 C258 10 288 22 302 38 H234 Z"
          fill="#0f172a"
          stroke="#38bdf8"
          strokeWidth="1.4"
        />

        {/* Side Cabin Windows */}
        {[20, 62, 104, 146, 186].map((wx) => (
          <rect
            key={wx}
            x={wx}
            y="14"
            width="30"
            height="17"
            rx="4"
            fill={isDay ? '#bae6fd' : '#fde68a'}
            stroke="#1e3a8a"
            strokeWidth="1.4"
          />
        ))}

        {/* Railhub Logo Mark on Nose */}
        <rect x="190" y="40" width="54" height="6" rx="3" fill="#fbbf24" />

        {/* LED Headlight */}
        <circle cx="316" cy="46" r="4.5" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.2" />

        {/* Locomotive Bogies & Spinning Wheels */}
        {[58, 238].map((bx) => (
          <g key={bx} transform={`translate(${bx}, 60)`}>
            <rect x="-26" y="-2" width="52" height="7" rx="3" fill="#1e293b" />
            {[-15, 15].map((wx) => (
              <g key={wx} transform={`translate(${wx}, 6) rotate(${wheelRot})`}>
                <circle r="8" fill="#0f172a" stroke="#64748b" strokeWidth="1.8" />
                <line x1="-5" y1="0" x2="5" y2="0" stroke="#94a3b8" strokeWidth="1.2" />
                <line x1="0" y1="-5" x2="0" y2="5" stroke="#94a3b8" strokeWidth="1.2" />
              </g>
            ))}
          </g>
        ))}
      </g>
    </g>
  )
}

export function LiveTrainScene({
  isDay = true,
  isRunning = false,
  stationName = 'Gambir',
  stationCode = 'GMR',
}) {
  const frame = useCurrentFrame()
  const sleeperOffset = isRunning ? -(frame * 12) % 24 : 0

  return (
    <AbsoluteFill
      style={{
        background: isDay
          ? 'linear-gradient(180deg, #38bdf8 0%, #7dd3fc 45%, #e0f2fe 82%, #cbd5e1 100%)'
          : 'linear-gradient(180deg, #020617 0%, #0a192f 50%, #112240 85%, #1e293b 100%)',
        overflow: 'hidden',
      }}
    >
      <svg viewBox="0 0 800 310" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="rh-headlight-grad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Sky Elements (Sun / Clouds or Stars / Moon) */}
        {isDay ? (
          <g>
            <circle cx="715" cy="52" r="22" fill="#fde047" opacity="0.92" />
            <circle cx="715" cy="52" r="32" fill="#fde047" opacity="0.22" />
            <g transform={`translate(${(frame * 0.35) % 860 - 60}, 44)`} opacity="0.78">
              <ellipse cx="40" cy="14" rx="28" ry="11" fill="#ffffff" />
              <ellipse cx="62" cy="12" rx="22" ry="9" fill="#ffffff" />
            </g>
          </g>
        ) : (
          <g>
            <circle cx="715" cy="50" r="16" fill="#fef3c7" />
            <circle cx="722" cy="46" r="14" fill="#0a192f" />
            {[80, 165, 250, 340, 440, 530, 620].map((sx, idx) => (
              <circle
                key={sx}
                cx={sx}
                cy={24 + (idx % 3) * 18}
                r={idx % 2 === 0 ? 1.5 : 1}
                fill="#ffffff"
                opacity={0.4 + Math.abs(Math.sin(frame * 0.08 + idx)) * 0.55}
              />
            ))}
          </g>
        )}

        {/* Background: Station + Peron + People when Stopped/Standby; Parallax Hills when Running */}
        {isRunning ? (
          <RunningScenery frame={frame} isDay={isDay} />
        ) : (
          <StationBackdrop
            frame={frame}
            isDay={isDay}
            stationName={stationName}
            stationCode={stationCode}
          />
        )}

        {/* Ballast, Full Sleepers & Dual Steel Rails */}
        <rect x="0" y="242" width="800" height="68" fill={isDay ? '#475569' : '#0f172a'} />
        <rect x="0" y="242" width="800" height="6" fill={isDay ? '#334155' : '#020617'} opacity="0.45" />
        <g transform={`translate(${sleeperOffset}, 252)`}>
          {Array.from({ length: 38 }).map((_, i) => (
            <rect
              key={i}
              x={i * 24 - 24}
              y="0"
              width="9"
              height="26"
              rx="2"
              fill={isDay ? '#1e293b' : '#020617'}
            />
          ))}
        </g>
        <rect x="0" y="247" width="800" height="4.5" fill={isDay ? '#e2e8f0' : '#94a3b8'} />
        <rect x="0" y="274" width="800" height="3.5" fill={isDay ? '#cbd5e1' : '#64748b'} />
        <rect x="0" y="286" width="800" height="24" fill={isDay ? '#334155' : '#020617'} />

        {/* Upgraded Aerodynamic Express Train */}
        <SleekExpressTrain frame={frame} isDay={isDay} isRunning={isRunning} />
      </svg>
    </AbsoluteFill>
  )
}
