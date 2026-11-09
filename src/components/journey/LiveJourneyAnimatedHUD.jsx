'use client'

import { useState, useEffect } from 'react'

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
  const [isDay, setIsDay] = useState(true)
  const [speed, setSpeed] = useState(isRunning ? 101 : 0)
  const [currentStationIdx, setCurrentStationIdx] = useState(isDeparted ? 1 : 0)

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
            <strong style={{ fontSize: '0.92rem', letterSpacing: '-0.01em', color: isDay ? '#0f172a' : '#ffffff', display: 'block', lineHeight: 1.2 }}>
              {trainName}
            </strong>
            <small style={{ color: isDay ? '#64748b' : '#94a3b8', fontSize: '0.74rem', display: 'block' }}>
              {routeTitle}
            </small>
          </div>
        </div>

        {/* Ambient indicator & day/night switcher */}
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

      {/* ── MAIN SCENERY & ANIMATED TRAIN CANVAS (VECTOR PARALLAX) ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '250px',
        overflow: 'hidden',
        background: isDay
          ? 'linear-gradient(180deg, #38bdf8 0%, #7dd3fc 40%, #bae6fd 75%, #94a3b8 100%)'
          : 'linear-gradient(180deg, #030712 0%, #0a1733 45%, #0f2c59 80%, #1e293b 100%)',
        transition: 'background 0.5s ease',
      }}>
        {/* ── IN-CANVAS TRANSIT STOPS TIMELINE (Dashed connectors, hours, day/night) ── */}
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          zIndex: 15,
          background: isDay ? 'rgba(255, 255, 255, 0.82)' : 'rgba(10, 23, 51, 0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: isDay ? '1px solid rgba(255, 255, 255, 0.7)' : '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 12,
          padding: '0.45rem 0.65rem',
          boxShadow: isDay ? '0 4px 16px rgba(0,0,0,0.06)' : '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.2rem',
          }}>
            {/* Dashed connector line passing through behind the stops */}
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '14px',
              right: '14px',
              height: 0,
              borderTop: `2px dashed ${isDay ? 'rgba(71, 85, 105, 0.4)' : 'rgba(255, 255, 255, 0.35)'}`,
              zIndex: 1,
            }} />

            {stops.map((stop, idx) => {
              const isPassed = idx < currentStationIdx
              const isCurrent = idx === currentStationIdx
              const isUpcoming = idx > currentStationIdx
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
                  {/* Station Node Indicator */}
                  <div style={{
                    width: isCurrent ? 16 : 12,
                    height: isCurrent ? 16 : 12,
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
                    boxShadow: isCurrent ? (isDay ? '0 0 10px #2563eb' : '0 0 12px #38bdf8') : 'none',
                    display: 'grid',
                    placeItems: 'center',
                    transition: 'all 0.3s ease',
                  }}>
                    {isPassed && (
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#ffffff' }} />
                    )}
                    {isCurrent && (
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ffffff' }} className="animate-ping" />
                    )}
                  </div>

                  {/* Station Code / Name */}
                  <span style={{
                    marginTop: 3,
                    fontSize: '0.68rem',
                    fontWeight: isCurrent ? 800 : 700,
                    color: isCurrent
                      ? (isDay ? '#1d4ed8' : '#38bdf8')
                      : isPassed
                        ? (isDay ? '#047857' : '#34d399')
                        : (isDay ? '#334155' : '#cbd5e1'),
                    lineHeight: 1.1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}>
                    {stop.code || stop.name?.split(' ')?.[1] || stop.name}
                  </span>

                  {/* Station Time ("ada jamnya") */}
                  <span style={{
                    fontSize: '0.62rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 700,
                    color: isCurrent
                      ? (isDay ? '#1e40af' : '#67e8f9')
                      : (isDay ? '#64748b' : '#94a3b8'),
                    marginTop: 1,
                    lineHeight: 1,
                  }}>
                    {timeStr}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dynamic Celestial Body: Radiant Sun or Luminous Moon */}
        {isDay ? (
          <div
            onClick={() => setIsDay(false)}
            style={{
              position: 'absolute',
              top: 75,
              right: 28,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #fde047 30%, #f59e0b 80%)',
              boxShadow: '0 0 30px #fde047, 0 0 60px rgba(253, 224, 71, 0.45)',
              cursor: 'pointer',
              zIndex: 3,
            }}
            title="Klik matahari untuk berganti ke mode malam"
          />
        ) : (
          <div
            onClick={() => setIsDay(true)}
            style={{
              position: 'absolute',
              top: 75,
              right: 32,
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 0 25px rgba(255, 255, 255, 0.8), 0 0 45px rgba(96, 165, 250, 0.4)',
              cursor: 'pointer',
              zIndex: 3,
            }}
            title="Klik bulan untuk berganti ke mode siang"
          >
            {/* Crescent mask */}
            <div style={{
              position: 'absolute',
              top: -3,
              left: -5,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#0a1733',
            }} />
          </div>
        )}

        {/* Night Stars */}
        {!isDay && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
            {[
              { x: 15, y: 80 }, { x: 45, y: 110 }, { x: 75, y: 78 }, { x: 110, y: 120 },
              { x: 150, y: 85 }, { x: 195, y: 105 }, { x: 245, y: 75 }, { x: 295, y: 115 },
              { x: 350, y: 80 }, { x: 410, y: 95 }, { x: 480, y: 75 }, { x: 550, y: 110 }
            ].map((star, sIdx) => (
              <span
                key={sIdx}
                className="animate-pulse"
                style={{
                  position: 'absolute',
                  top: star.y,
                  left: star.x,
                  width: 2.2,
                  height: 2.2,
                  borderRadius: '50%',
                  background: '#ffffff',
                  opacity: 0.85,
                  animationDelay: `${(sIdx % 4) * 0.4}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Distant Mountains (Parallax Layer 1) */}
        <svg
          viewBox="0 0 1000 120"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: 55,
            left: 0,
            width: '200%',
            height: '100px',
            opacity: isDay ? 0.6 : 0.35,
            animation: isRunning ? 'rhScrollMountains 18s linear infinite' : 'none',
            zIndex: 2,
          }}
        >
          <path
            d="M0,120 L0,50 Q120,10 240,60 T480,40 Q620,5 760,65 T1000,50 L1000,120 Z"
            fill={isDay ? '#0284c7' : '#091e42'}
          />
        </svg>

        {/* Midground Rolling Green Hills (Parallax Layer 2) */}
        <svg
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: 35,
            left: 0,
            width: '200%',
            height: '75px',
            opacity: isDay ? 0.85 : 0.5,
            animation: isRunning ? 'rhScrollHills 8s linear infinite' : 'none',
            zIndex: 3,
          }}
        >
          <path
            d="M0,100 L0,45 Q150,15 300,55 T600,35 Q750,15 900,60 T1000,45 L1000,100 Z"
            fill={isDay ? '#10b981' : '#06302b'}
          />
        </svg>

        {/* Electrical Catenary Poles (Zooming by when running) */}
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: 0,
          right: 0,
          height: 90,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 4,
        }}>
          <div
            style={{
              width: '200%',
              height: '100%',
              display: 'flex',
              justifyContent: 'space-around',
              animation: isRunning ? 'rhScrollPoles 2.5s linear infinite' : 'none',
            }}
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ width: 3.5, height: '100%', background: isDay ? '#64748b' : '#334155', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 10, right: 0, width: 30, height: 2, background: isDay ? '#64748b' : '#475569' }} />
                <div style={{ position: 'absolute', top: 20, left: -50, right: -50, height: 1, background: isDay ? 'rgba(100,116,139,0.4)' : 'rgba(148,163,184,0.3)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Transit Station Platform (Appears when Kereta Berhenti) */}
        {!isRunning && (
          <div style={{
            position: 'absolute',
            bottom: 22,
            left: '50%',
            transform: 'translateX(-50%)',
            background: isDay ? 'rgba(255, 255, 255, 0.96)' : 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(8px)',
            border: isDay ? '1.5px solid #2563eb' : '1.5px solid #38bdf8',
            borderRadius: '10px',
            padding: '0.35rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            zIndex: 10,
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#f59e0b',
              boxShadow: '0 0 10px #f59e0b',
            }} className="animate-pulse" />
            <div style={{ textAlign: 'left' }}>
              <strong style={{ fontSize: '0.8rem', color: isDay ? '#0f172a' : '#ffffff', display: 'block' }}>
                Transit: {currentStop.name} ({currentStop.code})
              </strong>
              <small style={{ color: isDay ? '#64748b' : '#94a3b8', fontSize: '0.7rem' }}>
                Kereta Berhenti · Pintu Terbuka · Selesai {currentStop.dep} WIB
              </small>
            </div>
          </div>
        )}

        {/* ── THE TRAIN COMPOSITION (Locomotive + Passenger Carriages) ── */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 3,
          zIndex: 5,
          animation: isRunning ? 'rhTrainChug 0.35s ease-in-out infinite alternate' : 'none',
        }}>
          {/* Passenger Carriage 2 */}
          <div style={{
            width: 105,
            height: 36,
            background: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 70%, #94a3b8 100%)',
            borderRadius: '5px 5px 2px 2px',
            position: 'relative',
            border: '1px solid #475569',
            boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
          }}>
            <div style={{ position: 'absolute', top: 11, left: 0, right: 0, height: 4, background: '#ea580c' }} />
            <div style={{ position: 'absolute', top: 15, left: 0, right: 0, height: 3, background: '#1e3a8a' }} />
            <div style={{ position: 'absolute', top: 4, left: 8, right: 8, display: 'flex', justifyContent: 'space-between' }}>
              {[...Array(5)].map((_, w) => (
                <div key={w} style={{
                  width: 13,
                  height: 8,
                  borderRadius: 2,
                  background: !isDay ? '#fde047' : '#38bdf8',
                  boxShadow: !isDay ? '0 0 8px rgba(253, 224, 71, 0.8)' : 'none',
                }} />
              ))}
            </div>
            <div style={{ position: 'absolute', bottom: -5, left: 14, width: 9, height: 9, borderRadius: '50%', background: '#1e293b', border: '2px solid #94a3b8' }} />
            <div style={{ position: 'absolute', bottom: -5, right: 14, width: 9, height: 9, borderRadius: '50%', background: '#1e293b', border: '2px solid #94a3b8' }} />
          </div>

          {/* Passenger Carriage 1 */}
          <div style={{
            width: 105,
            height: 36,
            background: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 70%, #94a3b8 100%)',
            borderRadius: '5px 5px 2px 2px',
            position: 'relative',
            border: '1px solid #475569',
            boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
          }}>
            <div style={{ position: 'absolute', top: 11, left: 0, right: 0, height: 4, background: '#ea580c' }} />
            <div style={{ position: 'absolute', top: 15, left: 0, right: 0, height: 3, background: '#1e3a8a' }} />
            <div style={{ position: 'absolute', top: 4, left: 8, right: 8, display: 'flex', justifyContent: 'space-between' }}>
              {[...Array(5)].map((_, w) => (
                <div key={w} style={{
                  width: 13,
                  height: 8,
                  borderRadius: 2,
                  background: !isDay ? '#fde047' : '#38bdf8',
                  boxShadow: !isDay ? '0 0 8px rgba(253, 224, 71, 0.8)' : 'none',
                }} />
              ))}
            </div>
            <div style={{ position: 'absolute', bottom: -5, left: 14, width: 9, height: 9, borderRadius: '50%', background: '#1e293b', border: '2px solid #94a3b8' }} />
            <div style={{ position: 'absolute', bottom: -5, right: 14, width: 9, height: 9, borderRadius: '50%', background: '#1e293b', border: '2px solid #94a3b8' }} />
          </div>

          {/* Locomotive (CC 206 Style Aerodynamic Cab) */}
          <div style={{
            width: 125,
            height: 42,
            background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 65%, #1e3a8a 100%)',
            borderRadius: '2px 18px 2px 2px',
            position: 'relative',
            border: '1px solid #334155',
            boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
          }}>
            {/* Aerodynamic windshield */}
            <div style={{
              position: 'absolute',
              top: 5,
              right: 12,
              width: 20,
              height: 13,
              borderRadius: '2px 9px 2px 2px',
              background: !isDay ? '#fde047' : '#0284c7',
              boxShadow: !isDay ? '0 0 10px #fde047' : 'none',
            }} />

            {/* Locomotive Headlight */}
            <div style={{
              position: 'absolute',
              bottom: 11,
              right: -3,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#fef08a',
              boxShadow: '0 0 12px #fef08a, 0 0 24px #facc15',
            }} />

            {/* Volumetric Forward Headlight Beam (Night Only) */}
            {!isDay && isRunning && (
              <div style={{
                position: 'absolute',
                bottom: -2,
                left: 124,
                width: 260,
                height: 44,
                background: 'linear-gradient(90deg, rgba(254, 240, 138, 0.55) 0%, rgba(250, 204, 21, 0.22) 40%, transparent 100%)',
                clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%)',
                pointerEvents: 'none',
              }} />
            )}

            {/* Livery Stripes */}
            <div style={{ position: 'absolute', top: 17, left: 0, right: 10, height: 4, background: '#ea580c' }} />
            <div style={{ position: 'absolute', top: 21, left: 0, right: 6, height: 3.5, background: '#1e3a8a' }} />

            {/* Locomotive Bogie & Wheels */}
            <div style={{ position: 'absolute', bottom: -5, left: 16, width: 10, height: 10, borderRadius: '50%', background: '#0f172a', border: '2px solid #cbd5e1' }} />
            <div style={{ position: 'absolute', bottom: -5, left: 32, width: 10, height: 10, borderRadius: '50%', background: '#0f172a', border: '2px solid #cbd5e1' }} />
            <div style={{ position: 'absolute', bottom: -5, right: 16, width: 10, height: 10, borderRadius: '50%', background: '#0f172a', border: '2px solid #cbd5e1' }} />
            <div style={{ position: 'absolute', bottom: -5, right: 32, width: 10, height: 10, borderRadius: '50%', background: '#0f172a', border: '2px solid #cbd5e1' }} />
          </div>
        </div>

        {/* Continuous Steel Track & Gliding Ballast Ties */}
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 0,
          right: 0,
          height: 8,
          background: isDay ? '#475569' : '#1e293b',
          borderTop: '2px solid #94a3b8',
          zIndex: 4,
        }}>
          <div style={{
            width: '200%',
            height: '100%',
            backgroundImage: `repeating-linear-gradient(90deg, ${isDay ? '#334155' : '#0f172a'} 0px, ${isDay ? '#334155' : '#0f172a'} 4px, transparent 4px, transparent 18px)`,
            animation: isRunning ? 'rhScrollTies 0.28s linear infinite' : 'none',
          }} />
        </div>

        {/* ── COUNTDOWN OVERLAY WHEN TRAIN HAS NOT DEPARTED YET ── */}
        {!isDeparted && (
          <div style={{
            position: 'absolute',
            bottom: 22,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            background: isDay ? 'rgba(15, 23, 42, 0.88)' : 'rgba(2, 6, 23, 0.94)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '0.5rem 1.15rem',
            borderRadius: '999px',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#f59e0b',
              boxShadow: '0 0 10px #f59e0b',
              display: 'inline-block',
            }} className="animate-pulse" />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.92)' }}>
              Kereta Standby di Peron · Berangkat:
            </span>
            <strong style={{ fontSize: '0.92rem', fontFamily: 'var(--font-mono, monospace)', color: '#fbbf24', letterSpacing: '0.04em' }}>
              {countdown && typeof countdown === 'object' && countdown.hours != null
                ? `${String(countdown.hours).padStart(2, '0')}j ${String(countdown.minutes || 0).padStart(2, '0')}m ${String(countdown.seconds || 0).padStart(2, '0')}d`
                : (typeof countdown === 'string' ? countdown : 'Sesuai Jadwal')}
            </strong>
          </div>
        )}

        {/* ── ARRIVAL BADGE WHEN TRIP IS COMPLETED ── */}
        {isCompleted && (
          <div style={{
            position: 'absolute',
            bottom: 22,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            background: 'rgba(5, 150, 105, 0.92)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '0.5rem 1.15rem',
            borderRadius: '999px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
          }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
              🏁 Perjalanan Selesai · Kereta Telah Tiba di Tujuan
            </span>
          </div>
        )}
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
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 900,
            fontFamily: 'var(--font-mono, monospace)',
            color: isRunning ? (isDay ? '#1e3a8a' : '#60a5fa') : (isCompleted ? '#059669' : '#f59e0b'),
            lineHeight: 1,
          }}>
            {speed}
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isDay ? '#64748b' : '#94a3b8' }}>
            km/jam
          </span>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: 6,
            marginLeft: '0.35rem',
            background: isRunning ? 'rgba(16, 185, 129, 0.12)' : (isCompleted ? 'rgba(5, 150, 105, 0.12)' : 'rgba(245, 158, 11, 0.12)'),
            color: isRunning ? '#059669' : (isCompleted ? '#059669' : '#d97706'),
          }}>
            {isRunning ? '● Sedang Melaju di Jalur' : (isCompleted ? '🏁 Tiba di Tujuan' : '⏸ Standby di Peron')}
          </span>
        </div>

        {/* Station Status Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem' }}>
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
