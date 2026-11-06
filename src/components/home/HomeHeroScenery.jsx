'use client'

import React from 'react'

export default function HomeHeroScenery({ isDay = true }) {
  return (
    <div
      className="rh-home-hero-scenery"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'all 0.6s ease',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rhHeroSunRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rhHeroCloudDrift1 {
          0% { transform: translateX(0px); }
          50% { transform: translateX(35px); }
          100% { transform: translateX(0px); }
        }
        @keyframes rhHeroCloudDrift2 {
          0% { transform: translateX(0px); }
          50% { transform: translateX(-40px); }
          100% { transform: translateX(0px); }
        }
        @keyframes rhHeroCloudDrift3 {
          0% { transform: translateX(0px); }
          50% { transform: translateX(25px); }
          100% { transform: translateX(0px); }
        }
        @keyframes rhHeroStarBlink {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .rh-anim-hero-sun-rays {
          transform-origin: 1220px 90px;
          animation: rhHeroSunRotate 75s linear infinite;
        }
        .rh-anim-hero-cloud-1 {
          animation: rhHeroCloudDrift1 28s ease-in-out infinite;
        }
        .rh-anim-hero-cloud-2 {
          animation: rhHeroCloudDrift2 36s ease-in-out infinite;
        }
        .rh-anim-hero-cloud-3 {
          animation: rhHeroCloudDrift3 42s ease-in-out infinite;
        }
        .rh-anim-hero-star-1 {
          animation: rhHeroStarBlink 3s ease-in-out infinite;
        }
        .rh-anim-hero-star-2 {
          animation: rhHeroStarBlink 4.2s ease-in-out 1.2s infinite;
        }
      ` }} />

      <svg
        viewBox="0 0 1440 620"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      >
        <defs>
          {/* Sun Gradients */}
          <radialGradient id="heroSunCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF9C4" />
            <stop offset="45%" stopColor="#FEE140" />
            <stop offset="85%" stopColor="#FA709A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FA709A" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="heroSunHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF176" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#FDD835" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FBC02D" stopOpacity="0" />
          </radialGradient>

          {/* Cloud Gradients */}
          <linearGradient id="heroCloudGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f0f9ff" stopOpacity="0.75" />
          </linearGradient>

          <linearGradient id="heroCloudGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.65" />
          </linearGradient>

          {/* Night Moon Gradient */}
          <radialGradient id="heroMoonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#bae6fd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {isDay ? (
          /* ── SIANG: MATAHARI & SINAR MATAHARI ────────────────────────── */
          <g>
            {/* Sun Ambient Atmosphere Glow */}
            <circle cx="1220" cy="90" r="180" fill="url(#heroSunHalo)" />
            <circle cx="1220" cy="90" r="110" fill="url(#heroSunHalo)" opacity="0.7" />

            {/* Rotating Sun Rays */}
            <g className="rh-anim-hero-sun-rays" opacity="0.45">
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <line
                  key={deg}
                  x1="1220"
                  y1="90"
                  x2={1220 + 95 * Math.cos((deg * Math.PI) / 180)}
                  y2={90 + 95 * Math.sin((deg * Math.PI) / 180)}
                  stroke="#FFF59D"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              ))}
            </g>

            {/* Glowing Sun Core */}
            <circle cx="1220" cy="90" r="48" fill="url(#heroSunCore)" filter="drop-shadow(0 0 25px rgba(254, 240, 138, 0.9))" />
            <circle cx="1220" cy="90" r="38" fill="#ffffff" opacity="0.85" />
          </g>
        ) : (
          /* ── MALAM: BULAN SABIT & BINTANG ───────────────────────────── */
          <g>
            {/* Moon Glow Aura */}
            <circle cx="1210" cy="90" r="90" fill="url(#heroMoonGlow)" opacity="0.3" />
            {/* Crescent Moon */}
            <path
              d="M1235 60 A38 38 0 1 0 1235 120 A30 30 0 1 1 1235 60 Z"
              fill="#FFFDE7"
              filter="drop-shadow(0 0 12px rgba(254, 240, 138, 0.8))"
            />
            {/* Stars */}
            <g className="rh-anim-hero-star-1">
              <circle cx="340" cy="80" r="2.2" fill="#ffffff" />
              <circle cx="780" cy="65" r="2.5" fill="#ffffff" />
              <circle cx="1060" cy="110" r="2" fill="#ffffff" />
              <circle cx="150" cy="120" r="2.8" fill="#ffffff" />
            </g>
            <g className="rh-anim-hero-star-2">
              <circle cx="560" cy="95" r="2.2" fill="#ffffff" />
              <circle cx="920" cy="75" r="2" fill="#ffffff" />
              <circle cx="1340" cy="140" r="2.5" fill="#ffffff" />
            </g>
          </g>
        )}

        {/* ── AWAN-AWAN PUTIH (CLOUDS) ─────────────────────────────────── */}
        <g>
          {/* Cloud 1 (Kiri Atas) */}
          <g className="rh-anim-hero-cloud-1" opacity={isDay ? '0.9' : '0.45'}>
            <path
              d="M140 120 Q160 85 195 95 Q230 75 270 95 Q305 85 330 110 Q350 130 335 155 Q310 170 260 165 L170 165 Q135 160 140 120 Z"
              fill="url(#heroCloudGrad1)"
              filter="drop-shadow(0 4px 10px rgba(0, 0, 0, 0.06))"
            />
          </g>

          {/* Cloud 2 (Tengah) */}
          <g className="rh-anim-hero-cloud-2" opacity={isDay ? '0.82' : '0.35'}>
            <path
              d="M620 140 Q645 105 680 115 Q715 95 760 115 Q795 105 825 130 Q845 150 830 175 Q805 190 750 185 L650 185 Q615 180 620 140 Z"
              fill="url(#heroCloudGrad2)"
              filter="drop-shadow(0 4px 10px rgba(0, 0, 0, 0.05))"
            />
          </g>

          {/* Cloud 3 (Kanan Bawah Matahari) */}
          <g className="rh-anim-hero-cloud-3" opacity={isDay ? '0.88' : '0.4'}>
            <path
              d="M1020 155 Q1040 125 1075 135 Q1110 115 1150 135 Q1185 125 1210 150 Q1230 170 1215 195 Q1190 210 1130 205 L1050 205 Q1015 200 1020 155 Z"
              fill="url(#heroCloudGrad1)"
              filter="drop-shadow(0 4px 12px rgba(0, 0, 0, 0.06))"
            />
          </g>

          {/* Small cloud 4 (Far Left Ambient) */}
          <g className="rh-anim-hero-cloud-2" opacity={isDay ? '0.75' : '0.3'}>
            <path
              d="M-20 180 Q0 155 30 165 Q60 150 95 165 Q125 155 145 175 Q160 195 145 215 L10 215 Q-25 210 -20 180 Z"
              fill="url(#heroCloudGrad2)"
            />
          </g>
        </g>

        {/* ── PEMANDANGAN ALAM TRANSPARANSI 5% (OPACITY = 0.05) ───────────── */}
        <g opacity="0.05" fill="#ffffff" stroke="#ffffff">
          {/* Layer 1: Siluet Pegunungan Jauh (Gunung Megah) */}
          <path
            d="M-40 620 L-40 340 L160 210 L320 310 L480 230 L640 330 L820 190 L980 300 L1120 220 L1280 320 L1480 210 L1480 620 Z"
            fill="#ffffff"
            stroke="none"
          />

          {/* Layer 2: Puncak-puncak Gunung Detail Kontur */}
          <path
            d="M160 210 L190 240 L170 270 L210 300 M820 190 L850 230 L830 260 L870 300 M1120 220 L1145 250 L1130 280"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Layer 3: Perbukitan Menengah Bergelombang (Rolling Hills) */}
          <path
            d="M-40 620 L-40 400 Q120 330 280 390 Q440 450 620 380 Q800 310 980 390 Q1160 470 1320 390 Q1420 340 1480 380 L1480 620 Z"
            fill="#ffffff"
            stroke="none"
          />

          {/* Layer 4: Perbukitan Depan dengan Siluet Pohon & Alam */}
          <path
            d="M-40 620 L-40 470 Q140 410 320 480 Q520 540 700 470 Q900 400 1100 480 Q1260 540 1480 470 L1480 620 Z"
            fill="#ffffff"
            stroke="none"
          />

          {/* Siluet Pepohonan Hutan Alam di Sepanjang Bukit */}
          {[
            40, 70, 95, 130, 220, 250, 370, 400, 430, 520, 550, 680, 720, 760, 
            840, 880, 930, 1020, 1060, 1150, 1190, 1240, 1310, 1360, 1420
          ].map((x, i) => {
            const h = 26 + (i % 5) * 8
            const y = 460 + (Math.sin(i * 1.3) * 35)
            return (
              <g key={x} transform={`translate(${x}, ${y})`}>
                <polygon points={`0,0 -8,${h * 0.45} -4,${h * 0.45} -11,${h * 0.8} -6,${h * 0.8} -14,${h} 14,${h} 6,${h * 0.8} 11,${h * 0.8} 4,${h * 0.45} 8,${h * 0.45}`} />
                <rect x="-2" y={h} width="4" height={h * 0.25} />
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
