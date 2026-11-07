'use client'

/**
 * RailLoader - Custom RailHub Themed Loading Animation & Skeleton System
 * Styled in RailHub Brand Colors:
 * Royal Blue: #1A428A
 * Sunset Orange: #FF8C00
 * Surface: #E7ECF6
 */

export function TrainTrackLoader({ text = 'Mencari jadwal terbaik…', subtext = 'Menghubungkan ke sistem RAILHUB…' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      {/* Animated SVG Track & Train */}
      <div style={{ position: 'relative', width: 220, height: 70, marginBottom: '1.25rem' }}>
        <svg
          width="220"
          height="70"
          viewBox="0 0 220 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rails */}
          <line x1="10" y1="52" x2="210" y2="52" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
          <line x1="10" y1="58" x2="210" y2="58" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />

          {/* Sleepers / Ties (moving animation effect) */}
          <g className="rh-loader-ties">
            <line x1="25" y1="50" x2="25" y2="60" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="55" y1="50" x2="55" y2="60" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="85" y1="50" x2="85" y2="60" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="115" y1="50" x2="115" y2="60" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="145" y1="50" x2="145" y2="60" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="175" y1="50" x2="175" y2="60" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="205" y1="50" x2="205" y2="60" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Gliding Train Nose in RailHub Palette */}
          <g className="rh-loader-train">
            <path
              d="M30 48C30 38 35 30 50 30H115C122 30 126 34 128 40L130 48H30Z"
              fill="#1A428A"
            />
            <path
              d="M48 34C52 32 60 32 70 32H90V40H44L48 34Z"
              fill="#E7ECF6"
            />
            <path d="M30 42H130V45H30V42Z" fill="#FF8C00" />
            <circle cx="34" cy="45" r="3" fill="#FFE500" />
            <circle cx="34" cy="45" r="5" fill="#FFE500" fillOpacity="0.4" />
            <circle cx="50" cy="52" r="3.5" fill="#4F4F4F" />
            <circle cx="70" cy="52" r="3.5" fill="#4F4F4F" />
            <circle cx="95" cy="52" r="3.5" fill="#4F4F4F" />
            <circle cx="115" cy="52" r="3.5" fill="#4F4F4F" />
          </g>
        </svg>

        <style jsx>{`
          .rh-loader-train {
            animation: rh-glide 2s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
            transform-box: fill-box;
            transform-origin: center;
          }
          .rh-loader-ties {
            animation: rh-track-move 1.2s linear infinite;
          }
          @keyframes rh-glide {
            0% { transform: translateX(0px); }
            100% { transform: translateX(65px); }
          }
          @keyframes rh-track-move {
            0% { transform: translateX(0px); }
            100% { transform: translateX(-30px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .rh-loader-train,
            .rh-loader-ties {
              animation: none;
            }
          }
        `}</style>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--rh-primary)', margin: 0 }}>
          {text}
        </h2>
        {subtext && (
          <p style={{ fontSize: '0.85rem', color: 'var(--rh-text-3)', margin: 0 }}>
            {subtext}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Fullscreen Interactive Loading Overlay
 * Prevents user interaction, shows animated train loader, lock body interactions
 */
export function FullScreenAuthLoadingOverlay({
  title = 'Memverifikasi Akses…',
  subtitle = 'Menyiapkan sesi & memuat dashboard Anda, mohon tunggu.',
}) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'rhFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        touchAction: 'none',
        userSelect: 'none',
        pointerEvents: 'all',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          padding: '2rem 2.25rem',
          maxWidth: 380,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          position: 'relative',
        }}
      >
        <div style={{ width: 180, height: 58, position: 'relative', marginBottom: '1rem' }}>
          <svg width="180" height="58" viewBox="0 0 220 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="10" y1="52" x2="210" y2="52" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
            <line x1="10" y1="58" x2="210" y2="58" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
            <g className="rh-loader-ties">
              <line x1="25" y1="50" x2="25" y2="60" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="55" y1="50" x2="55" y2="60" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="85" y1="50" x2="85" y2="60" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="115" y1="50" x2="115" y2="60" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="145" y1="50" x2="145" y2="60" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="175" y1="50" x2="175" y2="60" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="205" y1="50" x2="205" y2="60" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <g className="rh-loader-train">
              <path d="M30 48C30 38 35 30 50 30H115C122 30 126 34 128 40L130 48H30Z" fill="#1A428A" />
              <path d="M48 34C52 32 60 32 70 32H90V40H44L48 34Z" fill="#E7ECF6" />
              <path d="M30 42H130V45H30V42Z" fill="#FF8C00" />
              <circle cx="34" cy="45" r="3.5" fill="#FFE500" />
              <circle cx="34" cy="45" r="6" fill="#FFE500" fillOpacity="0.4" />
              <circle cx="50" cy="52" r="3.5" fill="#334155" />
              <circle cx="70" cy="52" r="3.5" fill="#334155" />
              <circle cx="95" cy="52" r="3.5" fill="#334155" />
              <circle cx="115" cy="52" r="3.5" fill="#334155" />
            </g>
          </svg>
        </div>

        <h3
          style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 0.35rem',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '0.84rem',
            color: '#64748b',
            lineHeight: 1.45,
            margin: '0 0 1.25rem',
          }}
        >
          {subtitle}
        </p>

        {/* Pulsing Loading Status Bar */}
        <div
          style={{
            width: '100%',
            height: 6,
            background: '#f1f5f9',
            borderRadius: 999,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '45%',
              background: 'linear-gradient(90deg, #1A428A, #FF8C00)',
              borderRadius: 999,
              animation: 'rhProgressIndeterminate 1.4s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        .rh-loader-train {
          animation: rh-glide 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
          transform-box: fill-box;
          transform-origin: center;
        }
        .rh-loader-ties {
          animation: rh-track-move 1.1s linear infinite;
        }
        @keyframes rhProgressIndeterminate {
          0% { left: -45%; }
          100% { left: 100%; }
        }
        @keyframes rhFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes rh-glide {
          0% { transform: translateX(0px); }
          100% { transform: translateX(65px); }
        }
        @keyframes rh-track-move {
          0% { transform: translateX(0px); }
          100% { transform: translateX(-30px); }
        }
      `}</style>
    </div>
  )
}

/**
 * Dashboard Shell Skeleton
 * For immediate high-fidelity placeholder rendering during dashboard fetch
 */
export function DashboardShellSkeleton({ role = 'admin' }) {
  return (
    <div style={{ display: 'grid', gap: '1.25rem', width: '100%' }}>
      {/* 4 Stat Cards Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
          gap: '0.85rem',
        }}
      >
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            className="rh-card"
            style={{
              padding: '1.15rem',
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <div
              className="rh-skeleton"
              style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="rh-skeleton"
                style={{ width: '60%', height: 12, borderRadius: 4, marginBottom: 8 }}
              />
              <div
                className="rh-skeleton"
                style={{ width: '40%', height: 22, borderRadius: 6 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton Area */}
      <div
        className="rh-card"
        style={{
          padding: '1.5rem',
          background: '#ffffff',
          borderRadius: 18,
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div className="rh-skeleton" style={{ width: 180, height: 22, borderRadius: 6 }} />
          <div className="rh-skeleton" style={{ width: 100, height: 32, borderRadius: 10 }} />
        </div>
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                padding: '1rem',
                borderRadius: 12,
                border: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                <div className="rh-skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
                <div>
                  <div className="rh-skeleton" style={{ width: 150, height: 14, borderRadius: 4, marginBottom: 6 }} />
                  <div className="rh-skeleton" style={{ width: 90, height: 11, borderRadius: 4 }} />
                </div>
              </div>
              <div className="rh-skeleton" style={{ width: 80, height: 26, borderRadius: 999 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Passenger Transit Tracking Skeleton
 */
export function PassengerTrackingSkeleton() {
  return (
    <div style={{ display: 'grid', gap: '1.25rem', width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      <div
        className="rh-card"
        style={{
          padding: '1.5rem',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0b192e 0%, #153e78 100%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          minHeight: 220,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="rh-skeleton" style={{ width: 160, height: 22, borderRadius: 8, background: 'rgba(255,255,255,0.15)' }} />
          <div className="rh-skeleton" style={{ width: 90, height: 26, borderRadius: 999, background: 'rgba(255,255,255,0.15)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center', margin: '1.5rem 0' }}>
          <div>
            <div className="rh-skeleton" style={{ width: 70, height: 26, borderRadius: 6, marginBottom: 6, background: 'rgba(255,255,255,0.2)' }} />
            <div className="rh-skeleton" style={{ width: 120, height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.12)' }} />
          </div>
          <div className="rh-skeleton" style={{ width: 80, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.18)' }} />
          <div style={{ textAlign: 'right' }}>
            <div className="rh-skeleton" style={{ width: 70, height: 26, borderRadius: 6, marginBottom: 6, marginLeft: 'auto', background: 'rgba(255,255,255,0.2)' }} />
            <div className="rh-skeleton" style={{ width: 120, height: 14, borderRadius: 4, marginLeft: 'auto', background: 'rgba(255,255,255,0.12)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton Loader matching ticket search result cards
 */
export function ScheduleCardSkeleton() {
  return (
    <div
      className="rh-card"
      style={{
        padding: '1.25rem',
        marginBottom: '0.875rem',
        background: '#ffffff',
        border: '1px solid var(--rh-border)',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ width: 140, height: 18, background: 'var(--rh-primary-light)', borderRadius: 6 }} className="rh-skeleton" />
        <div style={{ width: 100, height: 22, background: 'var(--rh-primary-light)', borderRadius: 6 }} className="rh-skeleton" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'center', margin: '1rem 0' }}>
        <div>
          <div style={{ width: 60, height: 22, background: 'var(--rh-surface-2)', borderRadius: 4, marginBottom: 6 }} className="rh-skeleton" />
          <div style={{ width: 110, height: 14, background: 'var(--rh-surface-2)', borderRadius: 4 }} className="rh-skeleton" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 50, height: 12, background: 'var(--rh-surface-2)', borderRadius: 4 }} className="rh-skeleton" />
          <div style={{ width: 80, height: 2, background: 'var(--rh-border)' }} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ width: 60, height: 22, background: 'var(--rh-surface-2)', borderRadius: 4, marginBottom: 6, marginLeft: 'auto' }} className="rh-skeleton" />
          <div style={{ width: 110, height: 14, background: 'var(--rh-surface-2)', borderRadius: 4, marginLeft: 'auto' }} className="rh-skeleton" />
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--rh-border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 90, height: 14, background: 'var(--rh-surface-2)', borderRadius: 4 }} className="rh-skeleton" />
        <div style={{ width: 110, height: 36, background: 'var(--rh-primary-light)', borderRadius: 8 }} className="rh-skeleton" />
      </div>

      <style jsx>{`
        .rh-skeleton {
          animation: rh-shimmer 1.5s infinite ease-in-out;
        }
        @keyframes rh-shimmer {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
