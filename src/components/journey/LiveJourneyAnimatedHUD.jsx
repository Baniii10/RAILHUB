'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Train,
  Gauge,
  Sun,
  Moon,
  Play,
  Pause,
  MapPin,
  Clock,
  Wifi,
  Radio,
  CheckCircle2,
  Zap,
  Volume2,
  VolumeX,
  Share2,
} from 'lucide-react'
import TrainWifiHub from './TrainWifiHub'
import { formatTime } from '@/lib/utils/formatters'

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
}) {
  const [isRunning, setIsRunning] = useState(true)
  const [isDay, setIsDay] = useState(true)
  const [speed, setSpeed] = useState(112)
  const [currentStationIdx, setCurrentStationIdx] = useState(1) // Stopped at or approaching Cirebon
  const [showWifi, setShowWifi] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)

  // Speedometer fluctuation physics
  useEffect(() => {
    let interval = null
    if (isRunning) {
      interval = setInterval(() => {
        // Random fluctuation between 106 and 118 km/h
        const jitter = Math.floor(Math.random() * 9) - 4
        setSpeed(prev => Math.min(120, Math.max(98, prev + jitter)))
      }, 1200)
    } else {
      // Smooth deceleration to 0
      setSpeed(0)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const currentStop = stops[currentStationIdx] || stops[1]
  const nextStop = stops[currentStationIdx + 1] || stops[stops.length - 1]

  function handleToggleRunning() {
    setIsRunning(prev => !prev)
  }

  return (
    <div className="rh-card rh-live-journey-hud" style={{
      borderRadius: '24px',
      overflow: 'hidden',
      background: isDay ? '#ffffff' : '#081226',
      border: isDay ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: isDay ? '0 16px 40px rgba(0, 0, 0, 0.08)' : '0 20px 50px rgba(0, 0, 0, 0.55)',
      color: isDay ? '#0f172a' : '#ffffff',
      transition: 'background 0.5s ease, border-color 0.5s ease',
    }}>
      {/* ── TOP HUD BAR (Status, Mode Toggle & Controls) ── */}
      <div style={{
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        borderBottom: isDay ? '1px solid #f1f5f9' : '1px solid rgba(255, 255, 255, 0.1)',
        background: isDay ? 'rgba(248, 250, 252, 0.8)' : 'rgba(15, 23, 42, 0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: isRunning ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isRunning ? '#10b981' : '#f59e0b',
            display: 'grid',
            placeItems: 'center',
          }}>
            <Train size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: isRunning ? '#10b981' : '#f59e0b',
                boxShadow: isRunning ? '0 0 8px #10b981' : '0 0 8px #f59e0b',
                display: 'inline-block',
              }} className="animate-pulse" />
              <strong style={{ fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                {trainName}
              </strong>
            </div>
            <small style={{ color: isDay ? '#64748b' : '#94a3b8', fontSize: '0.75rem' }}>
              {routeTitle}
            </small>
          </div>
        </div>

        {/* HUD Quick Controls: Day/Night, Run/Stop, Wi-Fi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Day / Night Toggle */}
          <button
            type="button"
            onClick={() => setIsDay(d => !d)}
            className="rh-btn rh-btn-sm"
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 8,
              background: isDay ? '#eff6ff' : 'rgba(255, 255, 255, 0.1)',
              color: isDay ? '#2563eb' : '#facc15',
              border: isDay ? '1px solid #bfdbfe' : '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title={isDay ? 'Ubah ke Mode Malam' : 'Ubah ke Mode Siang'}
          >
            {isDay ? <Sun size={13} /> : <Moon size={13} />}
            <span>{isDay ? 'Siang' : 'Malam'}</span>
          </button>

          {/* Speed / Running Simulation Toggle */}
          <button
            type="button"
            onClick={handleToggleRunning}
            className="rh-btn rh-btn-sm"
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 8,
              background: isRunning ? '#ef4444' : '#10b981',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
            }}
          >
            {isRunning ? (
              <>
                <Pause size={13} />
                <span>Simulasi Berhenti</span>
              </>
            ) : (
              <>
                <Play size={13} />
                <span>Lanjut Melaju</span>
              </>
            )}
          </button>

          {/* Wi-Fi Toggle */}
          <button
            type="button"
            onClick={() => setShowWifi(v => !v)}
            className="rh-btn rh-btn-sm"
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 8,
              background: showWifi ? '#2563eb' : isDay ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)',
              color: showWifi ? '#ffffff' : isDay ? '#334155' : '#e2e8f0',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Wifi size={13} />
            <span>Wi-Fi Kabin</span>
          </button>
        </div>
      </div>

      {/* ── EXPANDABLE WI-FI HUB DRAWER ── */}
      {showWifi && (
        <div style={{ padding: '1rem', borderBottom: isDay ? '1px solid #f1f5f9' : '1px solid rgba(255, 255, 255, 0.1)' }}>
          <TrainWifiHub trainName={trainName} />
        </div>
      )}

      {/* ── MAIN SCENERY & ANIMATED TRAIN CANVAS (VECTOR PARALLAX) ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '240px',
        overflow: 'hidden',
        background: isDay
          ? 'linear-gradient(180deg, #38bdf8 0%, #7dd3fc 45%, #bae6fd 80%, #94a3b8 100%)'
          : 'linear-gradient(180deg, #030712 0%, #0a1733 45%, #0f2c59 80%, #1e293b 100%)',
        transition: 'background 0.5s ease',
      }}>
        {/* Dynamic Celestial Body: Radiant Sun or Luminous Moon */}
        {isDay ? (
          <div style={{
            position: 'absolute',
            top: 24,
            right: 60,
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fde047 30%, #f59e0b 80%)',
            boxShadow: '0 0 35px #fde047, 0 0 70px rgba(253, 224, 71, 0.5)',
          }} />
        ) : (
          <div style={{
            position: 'absolute',
            top: 22,
            right: 70,
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: '0 0 25px rgba(255, 255, 255, 0.8), 0 0 50px rgba(96, 165, 250, 0.4)',
          }}>
            {/* Crescent mask */}
            <div style={{
              position: 'absolute',
              top: -3,
              left: -5,
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#0a1733',
            }} />
          </div>
        )}

        {/* Night Stars (when Night Mode) */}
        {!isDay && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {[
              { x: 15, y: 20 }, { x: 35, y: 45 }, { x: 60, y: 15 }, { x: 80, y: 35 },
              { x: 120, y: 55 }, { x: 170, y: 25 }, { x: 230, y: 40 }, { x: 300, y: 18 },
              { x: 420, y: 50 }, { x: 520, y: 30 }, { x: 640, y: 65 }, { x: 740, y: 22 }
            ].map((star, sIdx) => (
              <span
                key={sIdx}
                className="animate-pulse"
                style={{
                  position: 'absolute',
                  top: star.y,
                  left: star.x,
                  width: 2.5,
                  height: 2.5,
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
            bottom: 60,
            left: 0,
            width: '200%',
            height: '110px',
            opacity: isDay ? 0.6 : 0.35,
            animation: isRunning ? 'rhScrollMountains 18s linear infinite' : 'none',
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
            bottom: 40,
            left: 0,
            width: '200%',
            height: '80px',
            opacity: isDay ? 0.85 : 0.5,
            animation: isRunning ? 'rhScrollHills 8s linear infinite' : 'none',
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
          bottom: 28,
          left: 0,
          right: 0,
          height: 100,
          pointerEvents: 'none',
          overflow: 'hidden',
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
              <div key={i} style={{ width: 4, height: '100%', background: isDay ? '#64748b' : '#334155', position: 'relative' }}>
                {/* Horizontal catenary arm */}
                <div style={{ position: 'absolute', top: 12, right: 0, width: 34, height: 2, background: isDay ? '#64748b' : '#475569' }} />
                {/* Catenary wire snippet */}
                <div style={{ position: 'absolute', top: 22, left: -60, right: -60, height: 1, background: isDay ? 'rgba(100,116,139,0.4)' : 'rgba(148,163,184,0.3)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Transit Station Platform (Appears when Kereta Berhenti) */}
        {!isRunning && (
          <div style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: isDay ? 'rgba(255, 255, 255, 0.96)' : 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(8px)',
            border: isDay ? '1.5px solid #2563eb' : '1.5px solid #38bdf8',
            borderRadius: '12px',
            padding: '0.45rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            zIndex: 10,
            animation: 'fadeIn 0.3s ease-out',
          }}>
            <span style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#f59e0b',
              boxShadow: '0 0 10px #f59e0b',
            }} className="animate-pulse" />
            <div style={{ textAlign: 'left' }}>
              <strong style={{ fontSize: '0.85rem', color: isDay ? '#0f172a' : '#ffffff', display: 'block' }}>
                Transit: {currentStop.name} ({currentStop.code})
              </strong>
              <small style={{ color: isDay ? '#64748b' : '#94a3b8', fontSize: '0.72rem' }}>
                Kereta Berhenti · Pintu Kabin Terbuka · Boarding Selesai {currentStop.dep} WIB
              </small>
            </div>
          </div>
        )}

        {/* ── THE TRAIN COMPOSITION (Locomotive + Passenger Carriages) ── */}
        <div style={{
          position: 'absolute',
          bottom: 22,
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
            width: 110,
            height: 38,
            background: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 70%, #94a3b8 100%)',
            borderRadius: '5px 5px 2px 2px',
            position: 'relative',
            border: '1px solid #475569',
            boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
          }}>
            {/* Orange-Blue signature KAI Livery stripe */}
            <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 4, background: '#ea580c' }} />
            <div style={{ position: 'absolute', top: 16, left: 0, right: 0, height: 3, background: '#1e3a8a' }} />
            {/* Windows */}
            <div style={{ position: 'absolute', top: 4, left: 8, right: 8, display: 'flex', justifyContent: 'space-between' }}>
              {[...Array(5)].map((_, w) => (
                <div key={w} style={{
                  width: 14,
                  height: 9,
                  borderRadius: 2,
                  background: !isDay ? '#fde047' : '#38bdf8',
                  boxShadow: !isDay ? '0 0 8px rgba(253, 224, 71, 0.8)' : 'none',
                }} />
              ))}
            </div>
            {/* Wheels */}
            <div style={{ position: 'absolute', bottom: -5, left: 14, width: 10, height: 10, borderRadius: '50%', background: '#1e293b', border: '2px solid #94a3b8' }} />
            <div style={{ position: 'absolute', bottom: -5, right: 14, width: 10, height: 10, borderRadius: '50%', background: '#1e293b', border: '2px solid #94a3b8' }} />
          </div>

          {/* Passenger Carriage 1 */}
          <div style={{
            width: 110,
            height: 38,
            background: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 70%, #94a3b8 100%)',
            borderRadius: '5px 5px 2px 2px',
            position: 'relative',
            border: '1px solid #475569',
            boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
          }}>
            <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 4, background: '#ea580c' }} />
            <div style={{ position: 'absolute', top: 16, left: 0, right: 0, height: 3, background: '#1e3a8a' }} />
            <div style={{ position: 'absolute', top: 4, left: 8, right: 8, display: 'flex', justifyContent: 'space-between' }}>
              {[...Array(5)].map((_, w) => (
                <div key={w} style={{
                  width: 14,
                  height: 9,
                  borderRadius: 2,
                  background: !isDay ? '#fde047' : '#38bdf8',
                  boxShadow: !isDay ? '0 0 8px rgba(253, 224, 71, 0.8)' : 'none',
                }} />
              ))}
            </div>
            <div style={{ position: 'absolute', bottom: -5, left: 14, width: 10, height: 10, borderRadius: '50%', background: '#1e293b', border: '2px solid #94a3b8' }} />
            <div style={{ position: 'absolute', bottom: -5, right: 14, width: 10, height: 10, borderRadius: '50%', background: '#1e293b', border: '2px solid #94a3b8' }} />
          </div>

          {/* Locomotive (CC 206 Style Aerodynamic Cab) */}
          <div style={{
            width: 130,
            height: 44,
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
              width: 22,
              height: 14,
              borderRadius: '2px 10px 2px 2px',
              background: !isDay ? '#fde047' : '#0284c7',
              boxShadow: !isDay ? '0 0 10px #fde047' : 'none',
            }} />

            {/* Locomotive Headlight */}
            <div style={{
              position: 'absolute',
              bottom: 12,
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
                left: 128,
                width: 280,
                height: 46,
                background: 'linear-gradient(90deg, rgba(254, 240, 138, 0.55) 0%, rgba(250, 204, 21, 0.22) 40%, transparent 100%)',
                clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%)',
                pointerEvents: 'none',
              }} />
            )}

            {/* Livery Stripes */}
            <div style={{ position: 'absolute', top: 18, left: 0, right: 10, height: 4, background: '#ea580c' }} />
            <div style={{ position: 'absolute', top: 22, left: 0, right: 6, height: 4, background: '#1e3a8a' }} />

            {/* Locomotive Bogie & Wheels */}
            <div style={{ position: 'absolute', bottom: -5, left: 18, width: 11, height: 11, borderRadius: '50%', background: '#0f172a', border: '2px solid #cbd5e1' }} />
            <div style={{ position: 'absolute', bottom: -5, left: 34, width: 11, height: 11, borderRadius: '50%', background: '#0f172a', border: '2px solid #cbd5e1' }} />
            <div style={{ position: 'absolute', bottom: -5, right: 18, width: 11, height: 11, borderRadius: '50%', background: '#0f172a', border: '2px solid #cbd5e1' }} />
            <div style={{ position: 'absolute', bottom: -5, right: 34, width: 11, height: 11, borderRadius: '50%', background: '#0f172a', border: '2px solid #cbd5e1' }} />
          </div>
        </div>

        {/* Continuous Steel Track & Gliding Ballast Ties */}
        <div style={{
          position: 'absolute',
          bottom: 14,
          left: 0,
          right: 0,
          height: 8,
          background: isDay ? '#475569' : '#1e293b',
          borderTop: '2px solid #94a3b8',
        }}>
          {/* Animated rail ties */}
          <div style={{
            width: '200%',
            height: '100%',
            backgroundImage: `repeating-linear-gradient(90deg, ${isDay ? '#334155' : '#0f172a'} 0px, ${isDay ? '#334155' : '#0f172a'} 4px, transparent 4px, transparent 18px)`,
            animation: isRunning ? 'rhScrollTies 0.28s linear infinite' : 'none',
          }} />
        </div>
      </div>

      {/* ── DIGITAL SPEEDOMETER & HUD TELEMETRY ── */}
      <div style={{
        padding: '1.25rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: '1rem',
        alignItems: 'center',
        background: isDay ? '#ffffff' : '#0a1733',
        borderBottom: isDay ? '1px solid #f1f5f9' : '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        {/* Speedometer Gauge HUD */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: 16,
          background: isDay ? '#f8fafc' : 'rgba(255, 255, 255, 0.05)',
          border: isDay ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          {/* Circular Gauge Graphic */}
          <div style={{ position: 'relative', width: 62, height: 62, flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isDay ? '#e2e8f0' : 'rgba(255, 255, 255, 0.12)'}
                strokeWidth="3.2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isRunning ? '#2563eb' : '#f59e0b'}
                strokeWidth="3.2"
                strokeDasharray={`${(speed / 120) * 100}, 100`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: '0.82rem',
              color: isRunning ? (isDay ? '#2563eb' : '#60a5fa') : '#f59e0b',
            }}>
              <Gauge size={18} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{
                fontSize: '1.9rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono, monospace)',
                color: isRunning ? (isDay ? '#1e3a8a' : '#ffffff') : '#f59e0b',
                lineHeight: 1,
              }}>
                {speed}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isDay ? '#64748b' : '#94a3b8' }}>
                km/jam
              </span>
            </div>
            <small style={{
              display: 'block',
              marginTop: 4,
              fontSize: '0.72rem',
              fontWeight: 650,
              color: isRunning ? '#10b981' : '#f59e0b'
            }}>
              {isRunning ? '● Kecepatan Jelajah Stabil' : '⏸ Sedang Transit di Peron'}
            </small>
          </div>
        </div>

        {/* Current Segment & Next Arrival */}
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 16,
          background: isDay ? '#f8fafc' : 'rgba(255, 255, 255, 0.05)',
          border: isDay ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <small style={{ color: isDay ? '#64748b' : '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
            Stasiun Berikutnya
          </small>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <strong style={{ fontSize: '0.98rem', color: isDay ? '#0f172a' : '#ffffff' }}>
              {nextStop.name} ({nextStop.code})
            </strong>
            <span style={{
              padding: '2px 8px',
              borderRadius: 6,
              background: 'rgba(37, 99, 235, 0.15)',
              color: isDay ? '#1d4ed8' : '#93c5fd',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono, monospace)'
            }}>
              {nextStop.arr} WIB
            </span>
          </div>
          <small style={{ color: isDay ? '#475569' : '#cbd5e1', fontSize: '0.75rem', display: 'block', marginTop: 4 }}>
            {isRunning ? 'Estimasi tiba dalam ~45 menit' : 'Pemberangkatan kereta sesaat lagi'}
          </small>
        </div>
      </div>

      {/* ── TRANSIT ROUTE TIMELINE (Stops, Arrival/Departure Times) ── */}
      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <strong style={{ fontSize: '0.88rem', letterSpacing: '-0.01em', color: isDay ? '#0f172a' : '#ffffff' }}>
            Jadwal Pemberhentian & Transit Perjalanan
          </strong>
          <span style={{ fontSize: '0.75rem', color: isDay ? '#64748b' : '#94a3b8' }}>
            {stops.length} Stasiun Sepanjang Rute
          </span>
        </div>

        {/* Horizontal Timeline Track */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${stops.length}, minmax(130px, 1fr))`,
          gap: '0.75rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}>
          {stops.map((stop, idx) => {
            const isPassed = idx < currentStationIdx
            const isCurrent = idx === currentStationIdx
            const isDestination = idx === stops.length - 1

            return (
              <div
                key={stop.id}
                style={{
                  padding: '0.75rem',
                  borderRadius: 12,
                  background: isCurrent
                    ? (isDay ? 'rgba(37, 99, 235, 0.08)' : 'rgba(56, 189, 248, 0.15)')
                    : (isDay ? '#f8fafc' : 'rgba(255, 255, 255, 0.04)'),
                  border: isCurrent
                    ? '1.5px solid #2563eb'
                    : (isDay ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)'),
                  position: 'relative',
                  minWidth: 130,
                }}
              >
                {/* Node icon & line */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: isPassed ? '#10b981' : isCurrent ? '#2563eb' : (isDay ? '#cbd5e1' : '#475569'),
                    color: '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                  }}>
                    {isPassed ? <CheckCircle2 size={14} /> : (idx + 1)}
                  </span>

                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: isCurrent ? '#2563eb' : (isDay ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)'),
                    color: isCurrent ? '#ffffff' : (isDay ? '#475569' : '#94a3b8'),
                  }}>
                    {stop.code}
                  </span>
                </div>

                <strong style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: isCurrent ? (isDay ? '#1d4ed8' : '#38bdf8') : (isDay ? '#0f172a' : '#ffffff'),
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: 2,
                }}>
                  {stop.name}
                </strong>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: isDay ? '#64748b' : '#94a3b8' }}>
                  <Clock size={11} />
                  <span>{stop.arr} — {stop.dep}</span>
                </div>

                {isCurrent && (
                  <span style={{
                    display: 'inline-block',
                    marginTop: 6,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#10b981',
                  }}>
                    ● Posisi Saat Ini
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

