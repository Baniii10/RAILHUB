'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function TrainBumperBanner() {
  const scrollToSearch = (e) => {
    const el = document.querySelector('.rh-search-card')
    if (el) {
      e.preventDefault()
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div
      className="rh-bumper-banner-wrapper"
      style={{
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <Link
        href="/trains"
        onClick={scrollToSearch}
        aria-label="Animasi Bumper Jadwal Kereta RAILHUB"
        style={{
          display: 'block',
          width: '100%',
          aspectRatio: '8 / 2',
          borderRadius: 16,
          overflow: 'hidden',
          position: 'relative',
          textDecoration: 'none',
          boxShadow: '0 8px 24px rgba(10, 25, 47, 0.35)',
          background: 'linear-gradient(135deg, #07152B 0%, #0F2552 45%, #1A428A 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Hardware-accelerated CSS animations (Zero lag, pure GPU transform) */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes rhBumperTrackLoop {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-100px, 0, 0); }
          }
          @keyframes rhBumperTrainSpeed {
            0% { transform: translate3d(-240px, 0, 0); }
            45% { transform: translate3d(180px, 0, 0); }
            55% { transform: translate3d(180px, 0, 0); }
            100% { transform: translate3d(880px, 0, 0); }
          }
          @keyframes rhBumperPulseLight {
            0%, 100% { opacity: 0.85; filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.9)); }
            50% { opacity: 1; filter: drop-shadow(0 0 20px rgba(255, 140, 0, 1)); }
          }
          @keyframes rhBumperBoardTicker {
            0%, 20% { opacity: 1; transform: translate3d(0, 0, 0); }
            25%, 45% { opacity: 0.95; transform: translate3d(0, -18px, 0); }
            50%, 70% { opacity: 1; transform: translate3d(0, -36px, 0); }
            75%, 95% { opacity: 0.95; transform: translate3d(0, -54px, 0); }
            100% { opacity: 1; transform: translate3d(0, 0, 0); }
          }
          @keyframes rhSpeedLine {
            0% { transform: scaleX(0.2) translate3d(100px, 0, 0); opacity: 0; }
            50% { opacity: 0.8; }
            100% { transform: scaleX(1.4) translate3d(-100px, 0, 0); opacity: 0; }
          }
          .rh-bumper-track-ties {
            animation: rhBumperTrackLoop 0.45s linear infinite;
            will-change: transform;
          }
          .rh-bumper-train-unit {
            animation: rhBumperTrainSpeed 7s cubic-bezier(0.25, 1, 0.5, 1) infinite;
            will-change: transform;
          }
          .rh-bumper-light-glow {
            animation: rhBumperPulseLight 2s ease-in-out infinite;
          }
          .rh-bumper-board-rows {
            animation: rhBumperBoardTicker 8s steps(1) infinite;
            will-change: transform;
          }
        ` }} />

        {/* Scalable SVG Canvas (Strict 8:2 Aspect Ratio: 800 width x 200 height) */}
        <svg
          viewBox="0 0 800 200"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
          aria-hidden="true"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="bgSky" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#061224" />
              <stop offset="40%" stopColor="#0B1E40" />
              <stop offset="80%" stopColor="#122E63" />
              <stop offset="100%" stopColor="#0A1830" />
            </linearGradient>

            <linearGradient id="trainBodyGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1A428A" />
              <stop offset="60%" stopColor="#1A428A" />
              <stop offset="85%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#FF8C00" />
            </linearGradient>

            <linearGradient id="headlightBeam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.85)" />
              <stop offset="50%" stopColor="rgba(255, 230, 100, 0.35)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </linearGradient>

            <linearGradient id="railGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            <linearGradient id="boardFrame" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>

          {/* Background backdrop */}
          <rect width="800" height="200" fill="url(#bgSky)" />

          {/* Perspective Grid & Speed Streaks */}
          <g opacity="0.35">
            <line x1="0" y1="40" x2="800" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 8" />
            <line x1="0" y1="80" x2="800" y2="80" stroke="rgba(255,255,255,0.08)" strokeDasharray="6 12" />
            <line x1="0" y1="120" x2="800" y2="120" stroke="rgba(255,255,255,0.12)" />
            <line x1="0" y1="150" x2="800" y2="150" stroke="rgba(56,189,248,0.25)" strokeWidth="1.5" />
          </g>

          {/* Distant skyline silhouettes */}
          <g opacity="0.25" fill="#1E3A6D">
            <polygon points="120,150 135,90 145,90 160,150" />
            <polygon points="180,150 190,110 215,110 225,150" />
            <polygon points="260,150 270,75 285,75 295,150" />
            <polygon points="340,150 355,100 370,100 385,150" />
          </g>

          {/* ── RAILWAY TRACKS (Infinite Loop Ties) ────────────────────────── */}
          <g id="railwayTrack">
            {/* Gravel ballast foundation */}
            <rect x="0" y="162" width="800" height="38" fill="#091424" />
            <rect x="0" y="162" width="800" height="3" fill="#1E293B" />

            {/* Moving ties/sleepers (grouped to animate smoothly via CSS) */}
            <g className="rh-bumper-track-ties">
              {Array.from({ length: 45 }).map((_, i) => (
                <rect
                  key={i}
                  x={i * 24 - 40}
                  y="166"
                  width="12"
                  height="7"
                  rx="1.5"
                  fill="#334155"
                  stroke="#1E293B"
                  strokeWidth="0.5"
                />
              ))}
            </g>

            {/* Steel rails (Dual parallel shiny rails) */}
            <rect x="0" y="164" width="800" height="3" fill="url(#railGrad)" />
            <rect x="0" y="174" width="800" height="3" fill="url(#railGrad)" opacity="0.85" />
            {/* Glowing neon reflection line on rail */}
            <line x1="0" y1="164" x2="800" y2="164" stroke="#38BDF8" strokeWidth="0.8" opacity="0.6" />
          </g>

          {/* ── THE HIGH-SPEED TRAIN (Cruising to Schedule Board) ──────────── */}
          <g className="rh-bumper-train-unit">
            {/* Headlight Cone of Light (Forward illumination) */}
            <polygon
              points="245,156 460,135 460,185 245,166"
              fill="url(#headlightBeam)"
              className="rh-bumper-light-glow"
            />

            {/* Motion speed particles under train */}
            <line x1="-30" y1="168" x2="60" y2="168" stroke="#FF8C00" strokeWidth="2" strokeDasharray="10 20" opacity="0.7" />
            <line x1="20" y1="160" x2="110" y2="160" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="8 16" opacity="0.6" />

            {/* Carriage 2 (Trailing Passenger Coach) */}
            <g transform="translate(0, 126)">
              {/* Bogie & Wheels */}
              <circle cx="20" cy="38" r="6" fill="#0F172A" stroke="#94A3B8" strokeWidth="1.5" />
              <circle cx="35" cy="38" r="6" fill="#0F172A" stroke="#94A3B8" strokeWidth="1.5" />
              <circle cx="75" cy="38" r="6" fill="#0F172A" stroke="#94A3B8" strokeWidth="1.5" />
              <circle cx="90" cy="38" r="6" fill="#0F172A" stroke="#94A3B8" strokeWidth="1.5" />
              {/* Carriage Body */}
              <rect x="10" y="6" width="95" height="30" rx="3" fill="#1E3A8A" stroke="#38BDF8" strokeWidth="1" />
              {/* Vibrant Orange Accent Stripe */}
              <rect x="10" y="27" width="95" height="4" fill="#FF8C00" />
              {/* Windows with Warm Interior Glow */}
              <rect x="18" y="12" width="12" height="10" rx="2" fill="#FEF08A" opacity="0.9" />
              <rect x="36" y="12" width="12" height="10" rx="2" fill="#FEF08A" opacity="0.9" />
              <rect x="54" y="12" width="12" height="10" rx="2" fill="#FEF08A" opacity="0.9" />
              <rect x="72" y="12" width="12" height="10" rx="2" fill="#FEF08A" opacity="0.9" />
              <rect x="90" y="12" width="10" height="10" rx="2" fill="#FEF08A" opacity="0.9" />
              {/* Gangway Coupler */}
              <rect x="105" y="16" width="8" height="16" fill="#0F172A" />
            </g>

            {/* Carriage 1: Aerodynamic Bullet Locomotive (Front Engine) */}
            <g transform="translate(112, 122)">
              {/* Bogie & Wheels */}
              <circle cx="25" cy="42" r="6.5" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1.5" />
              <circle cx="42" cy="42" r="6.5" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1.5" />
              <circle cx="92" cy="42" r="6.5" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1.5" />
              <circle cx="110" cy="42" r="6.5" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1.5" />

              {/* Aerodynamic Locomotive Shell */}
              <path
                d="M0,10 L85,10 Q118,10 132,24 L138,36 Q139,40 135,42 L0,42 Z"
                fill="url(#trainBodyGrad)"
                stroke="#60A5FA"
                strokeWidth="1.2"
              />

              {/* Aerodynamic Windshield Cockpit */}
              <path
                d="M92,14 L114,14 Q124,16 128,24 L110,24 Q100,16 92,14 Z"
                fill="#0F172A"
                stroke="#38BDF8"
                strokeWidth="1"
              />
              <path
                d="M94,15 L112,15 Q120,17 124,22 L112,22 Q102,17 94,15 Z"
                fill="#38BDF8"
                opacity="0.65"
              />

              {/* Passenger Windows */}
              <rect x="15" y="16" width="14" height="10" rx="2" fill="#FEF08A" opacity="0.9" />
              <rect x="36" y="16" width="14" height="10" rx="2" fill="#FEF08A" opacity="0.9" />
              <rect x="57" y="16" width="14" height="10" rx="2" fill="#FEF08A" opacity="0.9" />

              {/* Speed Racing Livery Line */}
              <path d="M0,32 L110,32 Q125,32 135,39 L0,39 Z" fill="#FF8C00" />
              <path d="M0,29 L90,29 Q105,29 115,32 L0,32 Z" fill="#ffffff" opacity="0.85" />

              {/* Dual Glowing Front Headlamps */}
              <circle cx="134" cy="38" r="3.5" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1.5" className="rh-bumper-light-glow" />
              <circle cx="128" cy="34" r="2" fill="#FEF08A" />

              {/* Roof Pantograph (Electricity connector) */}
              <path d="M40,10 L50,2 L62,2 L70,10" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
              <line x1="46" y1="2" x2="66" y2="2" stroke="#EF4444" strokeWidth="2" />
            </g>
          </g>

          {/* ── RIGHT SIDE: DIGITAL DEPARTURE BOARD ("Kek mau ke daftar jadwal") ── */}
          <g transform="translate(520, 24)">
            {/* Board Frame / Stanchion */}
            <rect x="0" y="0" width="260" height="126" rx="10" fill="url(#boardFrame)" stroke="#38BDF8" strokeWidth="1.5" />
            <rect x="4" y="4" width="252" height="118" rx="8" fill="#020617" />

            {/* Board Header Lamp & Indicator */}
            <rect x="4" y="4" width="252" height="24" rx="6" fill="#0F172A" />
            <circle cx="16" cy="16" r="4" fill="#22C55E" className="rh-bumper-light-glow" />
            <text x="26" y="20" fill="#38BDF8" fontSize="10" fontWeight="800" fontFamily="monospace" letterSpacing="1">
              PAPAN JADWAL KA · PULAU JAWA
            </text>

            {/* Clip path for rolling LED ticker rows */}
            <clipPath id="boardContentClip">
              <rect x="8" y="32" width="244" height="84" />
            </clipPath>

            <g clipPath="url(#boardContentClip)">
              <g className="rh-bumper-board-rows">
                {/* Row 1: Jakarta - Surabaya */}
                <g transform="translate(10, 52)">
                  <text x="0" y="0" fill="#FEF08A" fontSize="11" fontWeight="800" fontFamily="monospace">
                    KA 1 ARGO BROMO
                  </text>
                  <text x="140" y="0" fill="#22C55E" fontSize="10" fontWeight="700" fontFamily="monospace">
                    TERSEDIA ➔
                  </text>
                  <text x="0" y="14" fill="#94A3B8" fontSize="9" fontFamily="sans-serif">
                    PSE ➔ SGU (17:10 WIB) · Eksekutif
                  </text>
                </g>

                {/* Row 2: Gambir - Bandung */}
                <g transform="translate(10, 88)">
                  <text x="0" y="0" fill="#FEF08A" fontSize="11" fontWeight="800" fontFamily="monospace">
                    KA 34 PARAHYANGAN
                  </text>
                  <text x="140" y="0" fill="#22C55E" fontSize="10" fontWeight="700" fontFamily="monospace">
                    TEPAT WAKTU
                  </text>
                  <text x="0" y="14" fill="#94A3B8" fontSize="9" fontFamily="sans-serif">
                    GMR ➔ BD (06:30 WIB) · Panoramic
                  </text>
                </g>

                {/* Row 3: Jakarta - Yogyakarta */}
                <g transform="translate(10, 124)">
                  <text x="0" y="0" fill="#FEF08A" fontSize="11" fontWeight="800" fontFamily="monospace">
                    KA 68 TAKSAKA HYPE
                  </text>
                  <text x="140" y="0" fill="#38BDF8" fontSize="10" fontWeight="700" fontFamily="monospace">
                    BOARDING 🟢
                  </text>
                  <text x="0" y="14" fill="#94A3B8" fontSize="9" fontFamily="sans-serif">
                    GMR ➔ YK (09:20 WIB) · Luxury
                  </text>
                </g>

                {/* Row 4: Call to action */}
                <g transform="translate(10, 160)">
                  <text x="0" y="0" fill="#FF8C00" fontSize="11" fontWeight="800" fontFamily="monospace">
                    CARI TIKET RESMI
                  </text>
                  <text x="140" y="0" fill="#FEF08A" fontSize="10" fontWeight="700" fontFamily="monospace">
                    50 STASIUN
                  </text>
                  <text x="0" y="14" fill="#E2E8F0" fontSize="9" fontFamily="sans-serif">
                    Klik untuk pilih jadwal & kursi atomik
                  </text>
                </g>
              </g>
            </g>

            {/* Bottom Status Ticker Bar */}
            <rect x="4" y="104" width="252" height="18" fill="#0B132B" />
            <text x="12" y="117" fill="#38BDF8" fontSize="8" fontWeight="700" fontFamily="monospace">
              STATUS PERJALANAN · PILIH KURSI PER GERBONG
            </text>
          </g>

          {/* ── LEFT / OVERLAY BRANDING: "RAILHUB" ─────────────────────────── */}
          <g transform="translate(35, 30)">
            {/* Luminous Logo Badge */}
            <g transform="translate(0, 0)">
              {/* Glow backdrop behind text */}
              <ellipse cx="110" cy="30" rx="95" ry="25" fill="#1A428A" opacity="0.35" filter="blur(10px)" />

              {/* RAILHUB Wordmark */}
              <text
                x="0"
                y="36"
                fill="#FFFFFF"
                fontSize="38"
                fontWeight="900"
                letterSpacing="-1"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                RAIL<tspan fill="#FF8C00">HUB</tspan>
              </text>

              {/* Subtitle Badge */}
              <rect x="2" y="47" width="195" height="18" rx="9" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
              <text x="12" y="60" fill="#E2E8F0" fontSize="8.5" fontWeight="700" letterSpacing="0.8" fontFamily="system-ui, sans-serif">
                SISTEM JADWAL & TIKET KERETA API
              </text>
            </g>

          </g>
        </svg>
      </Link>
    </div>
  )
}
