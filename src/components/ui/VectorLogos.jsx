'use client'

import Image from 'next/image'

/**
 * Custom Vector Logos & SVG Iconography
 * Designed for RAILHUB design system:
 * Primary: #1A428A (Deep Royal Blue)
 * Accent: #FF8C00 (Vibrant Orange)
 * Secondary: #A83232 (Crimson)
 */

export function RailHubBrandLogo({ size = 32, className = '' }) {
  return (
    <Image
      src="/images/Fix logo railhub.png"
      alt="RAILHUB"
      width={950}
      height={275}
      unoptimized
      className={className}
      style={{
        height: `${size}px`,
        width: 'auto',
        objectFit: 'contain',
        display: 'inline-block',
      }}
    />
  )
}

/**
 * RailHub Train Logo for ticket cards (matches KAI vector badge in screenshot 2)
 */
export function RailHubTrainLogo({ height = 22, className = '' }) {
  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      aria-label="RAILHUB Operator"
    >
      <Image
        src="/images/Fix logo railhub.png"
        alt="RAILHUB"
        width={950}
        height={275}
        unoptimized
        style={{
          height: `${height}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  )
}

/**
 * RailPay Wallet Vector Logo (Screenshot 1)
 */
export function RailPayLogo({ height = 24, className = '' }) {
  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      className={className}
      aria-label="RailPay"
    >
      <svg
        width={height}
        height={height}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" fill="url(#rp-grad)" />
        {/* Stylized credit/payment wave */}
        <path
          d="M7 13C7 11.3431 8.34315 10 10 10H22C23.6569 10 25 11.3431 25 13V20C25 21.6569 23.6569 23 22 23H10C8.34315 23 7 21.6569 7 20V13Z"
          fill="white"
          fillOpacity="0.2"
        />
        <path
          d="M7 14H25V17H7V14Z"
          fill="white"
          fillOpacity="0.85"
        />
        <circle cx="20" cy="19" r="1.75" fill="#FFE500" />
        <path
          d="M10 20H15"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="rp-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1A428A" />
            <stop offset="0.6" stopColor="#1A428A" />
            <stop offset="1" stopColor="#FF8C00" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A428A', letterSpacing: '-0.02em' }}>
          Rail<span style={{ color: '#FF8C00' }}>Pay</span>
        </span>
      </div>
    </div>
  )
}

// ============================================================
// 9 SERVICE ICONS (Screenshot 1 circular vector buttons)
// ============================================================

export function IconAntarKota({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 6C7 4.34315 8.34315 3 10 3H18C19.6569 3 21 4.34315 21 6V19C21 20.6569 19.6569 22 18 22H10C8.34315 22 7 20.6569 7 19V6Z" fill="white" fillOpacity="0.95" />
      <path d="M9 7C9 6.44772 9.44772 6 10 6H18C18.5523 6 19 6.44772 19 7V11H9V7Z" fill="#1A428A" />
      <circle cx="10.5" cy="17.5" r="1.5" fill="#1A428A" />
      <circle cx="17.5" cy="17.5" r="1.5" fill="#1A428A" />
      <path d="M12 14H16" stroke="#1A428A" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 23L4 26M21 23L24 26" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconLokal({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="4" width="16" height="18" rx="4" fill="white" />
      <path d="M8 8H20V13H8V8Z" fill="#FF8C00" />
      <circle cx="10" cy="17.5" r="1.5" fill="#FF8C00" />
      <circle cx="18" cy="17.5" r="1.5" fill="#FF8C00" />
      <path d="M12 17.5H16" stroke="#FF8C00" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 22L7 25M19 22L21 25" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconKomuter({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Pantograph */}
      <path d="M10 2L14 5L18 2" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 5V7" stroke="white" strokeWidth="1.75" />
      {/* Train Body */}
      <rect x="6" y="7" width="16" height="16" rx="4" fill="white" />
      <rect x="8" y="10" width="12" height="5" rx="1.5" fill="#A83232" />
      <circle cx="10" cy="19" r="1.5" fill="#A83232" />
      <circle cx="18" cy="19" r="1.5" fill="#A83232" />
      <rect x="12.5" y="17.5" width="3" height="2" rx="0.5" fill="#A83232" />
    </svg>
  )
}

export function IconLRT({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 7C6 4.79086 7.79086 3 10 3H18C20.2091 3 22 4.79086 22 7V19C22 20.6569 20.6569 22 19 22H9C7.34315 22 6 20.6569 6 19V7Z" fill="white" />
      {/* Curved windshield */}
      <path d="M8 7C8 5.89543 8.89543 5 10 5H18C19.1046 5 20 5.89543 20 7V12H8V7Z" fill="#8B258F" />
      {/* Streamlined lights */}
      <path d="M8.5 17L11.5 17" stroke="#8B258F" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.5 17L19.5 17" stroke="#8B258F" strokeWidth="2" strokeLinecap="round" />
      {/* Monorail track beam */}
      <path d="M11 22V26M17 22V26M8 26H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconBandara({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="5" width="16" height="17" rx="4" fill="white" />
      <rect x="8" y="8" width="12" height="5" rx="1.5" fill="#0EA5E9" />
      <circle cx="10" cy="18" r="1.5" fill="#0EA5E9" />
      <circle cx="18" cy="18" r="1.5" fill="#0EA5E9" />
      {/* Plane badge */}
      <path
        d="M23 4L19 7L20 8.5L22 8L23 10L24 9.5L23.5 7L25 6L23 4Z"
        fill="#FFE500"
        stroke="#0284C7"
        strokeWidth="1"
      />
    </svg>
  )
}

export function IconSpaceByRail({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 11L14 4L23 11V22C23 22.5523 22.5523 23 22 23H6C5.44772 23 5 22.5523 5 22V11Z" fill="#1A428A" />
      <path d="M11 23V15H17V23" fill="white" />
      <path d="M14 8C14.8284 8 15.5 8.67157 15.5 9.5C15.5 10.3284 14.8284 11 14 11C13.1716 11 12.5 10.3284 12.5 9.5C12.5 8.67157 13.1716 8 14 8Z" fill="#FF8C00" />
    </svg>
  )
}

export function IconGrabFeeder({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 14L8 8C8.5 6.5 9.5 6 11 6H17C18.5 6 19.5 6.5 20 8L22 14V20C22 20.5523 21.5523 21 21 21H20C19.4477 21 19 20.5523 19 20V19H9V20C9 20.5523 8.55228 21 8 21H7C6.44772 21 6 20.5523 6 20V14Z" fill="#1A428A" />
      <path d="M8 13L9.5 8.5H18.5L20 13H8Z" fill="white" />
      <circle cx="9.5" cy="16" r="1.5" fill="#FF8C00" />
      <circle cx="18.5" cy="16" r="1.5" fill="#FF8C00" />
    </svg>
  )
}

export function IconMultiTrip({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="20" height="15" rx="3" fill="#1A428A" />
      <rect x="4" y="9" width="20" height="3" fill="#FF8C00" />
      <rect x="7" y="14" width="4" height="3.5" rx="0.75" fill="#FFE500" />
      {/* Contactless waves */}
      <path d="M17 13.5C18 14.5 18 16 17 17M19 12C20.5 13.5 20.5 17 19 18.5" stroke="white" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

export function IconLebihBanyak({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="7" height="7" rx="2" fill="#1A428A" />
      <rect x="16" y="5" width="7" height="7" rx="2" fill="#1A428A" />
      <rect x="5" y="16" width="7" height="7" rx="2" fill="#1A428A" />
      <rect x="16" y="16" width="7" height="7" rx="2" fill="#FF8C00" />
    </svg>
  )
}

/**
 * Modern Locomotive Vector Illustration for Live Tracking Banner (Screenshot 1)
 */
export function LocomotiveIllustration({ width = 160, height = 90 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
      aria-hidden="true"
    >
      {/* Track perspective */}
      <path d="M20 98L190 98" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
      <path d="M10 106L200 106" stroke="rgba(255,255,255,0.6)" strokeWidth="3.5" />
      <path d="M40 98L30 106M80 98L75 106M120 98L118 106M160 98L162 106" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />

      {/* Train shadow */}
      <ellipse cx="110" cy="98" rx="65" ry="5" fill="rgba(0,0,0,0.35)" />

      {/* Main Locomotive Body (Modern CC206 inspired aerodynamic shape) */}
      <path
        d="M50 82L62 46C64 39 70 34 78 34H140C148 34 155 40 157 48L165 82H50Z"
        fill="url(#loco-body)"
      />
      {/* Red/Crimson front bumper */}
      <path
        d="M48 80H167C169 80 171 82 171 84V88C171 90 169 92 167 92H48C46 92 44 90 44 88V84C44 82 46 80 48 80Z"
        fill="#A83232"
      />
      {/* Orange warning stripe */}
      <path
        d="M50 74H165V78H50V74Z"
        fill="#FF8C00"
      />
      {/* Cabin Windshield Glass */}
      <path
        d="M72 42C74 39 78 37 82 37H110V52H68L72 42Z"
        fill="#1A428A"
        stroke="#475569"
        strokeWidth="1.5"
      />
      <path
        d="M114 37H136C140 37 144 39 146 42L150 52H114V37Z"
        fill="#1A428A"
        stroke="#475569"
        strokeWidth="1.5"
      />
      {/* Windshield glare */}
      <path d="M78 40L72 50" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
      <path d="M122 40L116 50" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />

      {/* Headlights (Glowing bright) */}
      <circle cx="62" cy="72" r="4.5" fill="#FFE500" />
      <circle cx="62" cy="72" r="2.5" fill="white" />
      <circle cx="152" cy="72" r="4.5" fill="#FFE500" />
      <circle cx="152" cy="72" r="2.5" fill="white" />

      {/* Center rail emblem */}
      <circle cx="107" cy="68" r="6" fill="#1A428A" stroke="white" strokeWidth="1.5" />
      <path d="M104 68H110M107 65V71" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" />

      {/* Speed lines */}
      <path d="M15 48H35M5 60H30M18 72H38" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />

      <defs>
        <linearGradient id="loco-body" x1="50" y1="34" x2="165" y2="82" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E2E8F0" />
          <stop offset="0.4" stopColor="#CBD5E1" />
          <stop offset="0.8" stopColor="#94A3B8" />
          <stop offset="1" stopColor="#64748B" />
        </linearGradient>
      </defs>
    </svg>
  )
}

