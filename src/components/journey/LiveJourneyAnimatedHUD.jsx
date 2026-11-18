'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { LiveTrainScene } from '@/remotion/LiveTrainScene'

const Player = dynamic(
  () => import('@remotion/player').then((mod) => mod.Player),
  { ssr: false }
)

const DEFAULT_STOPS = [
  { id: 'gmr', name: 'Stasiun Gambir', code: 'GMR', city: 'Jakarta', arr: '08:00', dep: '08:15', status: 'passed' },
  { id: 'cn', name: 'Stasiun Cirebon', code: 'CN', city: 'Cirebon', arr: '10:45', dep: '10:52', status: 'transit' },
  { id: 'pwt', name: 'Stasiun Purwokerto', code: 'PWT', city: 'Purwokerto', arr: '12:30', dep: '12:36', status: 'upcoming' },
  { id: 'yk', name: 'Stasiun Yogyakarta', code: 'YK', city: 'Yogyakarta', arr: '14:52', dep: '14:52', status: 'upcoming' },
]

export default function LiveJourneyAnimatedHUD({
  trainName = 'KA Argo Bromo Anggrek',
  routeTitle = 'Gambir (GMR) — Yogyakarta (YK)',
  stops = DEFAULT_STOPS,
  countdown = null,
  isDeparted = false,
  isCompleted = false,
  departureTime = null,
  arrivalTime = null,
}) {
  const isRunning = Boolean(isDeparted && !isCompleted)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isDay, setIsDay] = useState(true)
  const [speed, setSpeed] = useState(isRunning ? 101 : 0)
  const [currentStationIdx, setCurrentStationIdx] = useState(isDeparted ? 1 : 0)

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Speed fluctuation physics: only runs when train has departed and not yet completed
  useEffect(() => {
    let interval = null
    if (isRunning) {
      setSpeed(101)
      interval = setInterval(() => {
        // Natural speed jitter around 98 - 108 km/h
        const jitter = Math.floor(Math.random() * 7) - 3
        setSpeed(prev => Math.min(115, Math.max(94, prev + jitter)))
      }, 1400)
    } else {
      setSpeed(0)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const currentStop = stops[currentStationIdx] || stops[1]
  const nextStop = stops[currentStationIdx + 1] || stops[stops.length - 1]

  return (
    <div className="rh-card rh-live-journey-hud" style={{
      borderRadius: '20px',
      overflow: 'hidden',
      background: isDay ? '#ffffff' : '#081226',
      border: isDay ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: isDay ? '0 12px 36px rgba(0, 0, 0, 0.06)' : '0 20px 50px rgba(0, 0, 0, 0.55)',
      color: isDay ? '#0f172a' : '#ffffff',
      transition: 'background 0.5s ease, border-color 0.5s ease',
      width: '100%',
    }}>
      {/* ── TOP HUD HEADER: Minimalist Title (No button clutter) ── */}
      <div style={{
        padding: '0.75rem 1.15rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        borderBottom: isDay ? '1px solid #f1f5f9' : '1px solid rgba(255, 255, 255, 0.08)',
        background: isDay ? 'rgba(248, 250, 252, 0.9)' : 'rgba(15, 23, 42, 0.75)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isRunning ? '#10b981' : '#f59e0b',
            boxShadow: isRunning ? '0 0 10px #10b981' : '0 0 10px #f59e0b',
            display: 'inline-block',
            flexShrink: 0,
          }} className="animate-pulse" />
          <div>
            <strong style={{ fontSize: '1.05rem', letterSpacing: '-0.01em', color: isDay ? '#0f172a' : '#ffffff', display: 'block', lineHeight: 1.25 }}>
              {trainName}
            </strong>
            <small style={{ color: isDay ? '#64748b' : '#94a3b8', fontSize: '0.84rem', display: 'block' }}>
              {routeTitle}
            </small>
          </div>
        </div>

        {/* Right: Standby / Status Pill (tidak menutupi kereta) + Day/Night Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {!isDeparted && (
            <div style={{
              background: isDay ? '#0f172a' : 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              padding: '0.25rem 0.7rem',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap',
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#f59e0b',
                boxShadow: '0 0 8px #f59e0b',
                display: 'inline-block',
              }} className="animate-pulse" />
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)' }}>
                Standby Peron ·
              </span>
              <strong style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono, monospace)', color: '#fbbf24' }}>
                {countdown && typeof countdown === 'object' && countdown.hours != null
                  ? `${String(countdown.hours).padStart(2, '0')}j ${String(countdown.minutes || 0).padStart(2, '0')}m ${String(countdown.seconds || 0).padStart(2, '0')}d`
                  : (typeof countdown === 'string' ? countdown : 'Standby')}
              </strong>
            </div>
          )}

          {isCompleted && (
            <div style={{
              background: 'rgba(5, 150, 105, 0.14)',
              color: '#059669',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}>
              Tiba di Tujuan
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsDay(d => !d)}
            style={{
              background: isDay ? 'rgba(37, 99, 235, 0.08)' : 'rgba(255, 255, 255, 0.08)',
              border: isDay ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid rgba(255, 255, 255, 0.15)',
              color: isDay ? '#1e40af' : '#93c5fd',
              borderRadius: 8,
              padding: '3px 9px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
            title={isDay ? 'Klik untuk suasana malam' : 'Klik untuk suasana siang'}
          >
            <span>{isDay ? 'Siang' : 'Malam'}</span>
          </button>
        </div>
      </div>

      {/* ── CLEAN TRANSIT STOPS TIMELINE BAR (Di atas canvas, tidak menutupi atap stasiun) ── */}
      <div style={{
        padding: '0.6rem 1.15rem',
        background: isDay ? '#ffffff' : '#0f172a',
        borderBottom: isDay ? '1px solid #f1f5f9' : '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '0.25rem',
        }}>
          {/* Dashed connector line passing through behind the stops */}
          <div style={{
            position: 'absolute',
            top: '7px',
            left: '16px',
            right: '16px',
            height: 0,
            borderTop: `2px dashed ${isDay ? '#cbd5e1' : 'rgba(255, 255, 255, 0.25)'}`,
            zIndex: 1,
          }} />

          {stops.map((stop, idx) => {
            const isPassed = idx < currentStationIdx
            const isCurrent = idx === currentStationIdx
            const timeStr = stop.arr || stop.dep || stop.time || '-'

            return (
              <div
                key={stop.id || idx}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <div style={{
                  width: isCurrent ? 15 : 11,
                  height: isCurrent ? 15 : 11,
                  borderRadius: '50%',
                  background: isPassed
                    ? (isDay ? '#059669' : '#10b981')
                    : isCurrent
                      ? (isDay ? '#2563eb' : '#38bdf8')
                      : (isDay ? '#ffffff' : '#1e293b'),
                  border: isPassed
                    ? 'none'
                    : isCurrent
                      ? (isDay ? '2.5px solid #bfdbfe' : '2.5px solid rgba(56, 189, 248, 0.5)')
                      : `1.5px solid ${isDay ? '#94a3b8' : 'rgba(255,255,255,0.4)'}`,
                  boxShadow: isCurrent ? (isDay ? '0 0 8px rgba(37,99,235,0.45)' : '0 0 10px #38bdf8') : 'none',
                  display: 'grid',
                  placeItems: 'center',
                  marginTop: isCurrent ? 0 : 2,
                }}>
                  {isPassed && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#ffffff' }} />}
                  {isCurrent && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ffffff' }} />}
                </div>

                <span style={{
                  marginTop: 4,
                  fontSize: '0.8rem',
                  fontWeight: isCurrent ? 800 : 700,
                  color: isCurrent
                    ? (isDay ? '#1d4ed8' : '#38bdf8')
                    : isPassed
                      ? (isDay ? '#047857' : '#34d399')
                      : (isDay ? '#334155' : '#cbd5e1'),
                  lineHeight: 1.15,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}>
                  {stop.code || stop.name?.split(' ')?.[1] || stop.name}
                </span>

                <span style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                  color: isCurrent
                    ? (isDay ? '#1e40af' : '#67e8f9')
                    : (isDay ? '#64748b' : '#94a3b8'),
                  marginTop: 2,
                  lineHeight: 1.1,
                }}>
                  {timeStr}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── MAIN SCENERY & ANIMATED TRAIN CANVAS (FULL-BLEED REMOTION) ── */}
      <div
        className="rh-live-hud-canvas"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: isMobile ? '560 / 310' : '800 / 310',
          overflow: 'hidden',
          background: isDay ? '#38bdf8' : '#020617',
          transition: 'background 0.5s ease',
        }}
      >
        {/* REMOTION LIVE TRAIN & STATION PERON SCENE */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          {mounted && (
            <Player
              component={LiveTrainScene}
              inputProps={{
                isDay,
                isRunning,
                stationName: isCompleted ? (stops[stops.length - 1]?.name || 'Tujuan') : (currentStop?.name || stops[0]?.name || 'Gambir'),
                stationCode: isCompleted ? (stops[stops.length - 1]?.code || '') : (currentStop?.code || stops[0]?.code || 'GMR'),
              }}
              durationInFrames={300}
              compositionWidth={isMobile ? 560 : 800}
              compositionHeight={310}
              fps={30}
              style={{ width: '100%', height: '100%', display: 'block' }}
              controls={false}
              autoPlay
              loop
              clickToPlay={false}
              doubleClickToFullscreen={false}
              spaceKeyToPlayOrPause={false}
            />
          )}
        </div>
      </div>

      {/* ── MINIMALIST TELEMETRY & SPEEDOMETER STRIP (Dikecilin & Minimalis) ── */}
      <div style={{
        padding: '0.65rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        background: isDay ? '#f8fafc' : '#0a1733',
        borderTop: isDay ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        {/* Minimal Speed Display */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
          <span style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            fontFamily: 'var(--font-mono, monospace)',
            color: isRunning ? (isDay ? '#1e3a8a' : '#60a5fa') : (isCompleted ? '#059669' : '#f59e0b'),
            lineHeight: 1,
          }}>
            {speed}
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isDay ? '#64748b' : '#94a3b8' }}>
            km/jam
          </span>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            padding: '3px 9px',
            borderRadius: 6,
            marginLeft: '0.35rem',
            background: isRunning ? 'rgba(16, 185, 129, 0.12)' : (isCompleted ? 'rgba(5, 150, 105, 0.12)' : 'rgba(245, 158, 11, 0.12)'),
            color: isRunning ? '#059669' : (isCompleted ? '#059669' : '#d97706'),
          }}>
            {isRunning ? '● Sedang Melaju di Jalur' : (isCompleted ? '🏁 Tiba di Tujuan' : '⏸ Standby di Peron')}
          </span>
        </div>

        {/* Station Status Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem' }}>
          {!isDeparted ? (
            <>
              <span style={{ color: isDay ? '#64748b' : '#94a3b8' }}>Stasiun Asal:</span>
              <strong style={{ color: isDay ? '#0f172a' : '#ffffff' }}>
                {stops[0]?.name} ({stops[0]?.code || ''})
              </strong>
              <span style={{
                padding: '2px 6px',
                borderRadius: 5,
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#d97706',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                fontSize: '0.7rem'
              }}>
                Berangkat {stops[0]?.dep || stops[0]?.time} WIB
              </span>
            </>
          ) : isCompleted ? (
            <>
              <span style={{ color: isDay ? '#64748b' : '#94a3b8' }}>Stasiun Akhir:</span>
              <strong style={{ color: isDay ? '#0f172a' : '#ffffff' }}>
                {stops[stops.length - 1]?.name} ({stops[stops.length - 1]?.code || ''})
              </strong>
              <span style={{
                padding: '2px 6px',
                borderRadius: 5,
                background: 'rgba(5, 150, 105, 0.12)',
                color: '#059669',
                fontWeight: 700,
                fontSize: '0.7rem'
              }}>
                Selesai
              </span>
            </>
          ) : (
            <>
              <span style={{ color: isDay ? '#64748b' : '#94a3b8' }}>Berikutnya:</span>
              <strong style={{ color: isDay ? '#0f172a' : '#ffffff' }}>
                {nextStop.name} ({nextStop.code || ''})
              </strong>
              <span style={{
                padding: '2px 6px',
                borderRadius: 5,
                background: 'rgba(37, 99, 235, 0.12)',
                color: isDay ? '#1d4ed8' : '#93c5fd',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                fontSize: '0.7rem'
              }}>
                {nextStop.arr || nextStop.time} WIB
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
