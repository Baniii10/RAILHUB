'use client'

/**
 * RailLoader - Custom RailHub Themed Loading Animation
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
            {/* Streamlined train body */}
            <path
              d="M30 48C30 38 35 30 50 30H115C122 30 126 34 128 40L130 48H30Z"
              fill="#1A428A"
            />
            {/* Aerodynamic windshield */}
            <path
              d="M48 34C52 32 60 32 70 32H90V40H44L48 34Z"
              fill="#E7ECF6"
            />
            {/* Orange speed stripe */}
            <path d="M30 42H130V45H30V42Z" fill="#FF8C00" />
            {/* Headlight with glow */}
            <circle cx="34" cy="45" r="3" fill="#FFE500" />
            <circle cx="34" cy="45" r="5" fill="#FFE500" fillOpacity="0.4" />
            {/* Wheels */}
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
            0% {
              transform: translateX(0px);
            }
            100% {
              transform: translateX(65px);
            }
          }
          @keyframes rh-track-move {
            0% {
              transform: translateX(0px);
            }
            100% {
              transform: translateX(-30px);
            }
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

