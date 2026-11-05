'use client'

import React from 'react'

/**
 * Authentic Indonesian Payment Method Logos
 * Standardized vector SVGs for QRIS, E-Wallets (GoPay, OVO, DANA, ShopeePay),
 * and National Banks (BCA, Mandiri, BNI, BRI).
 */

// 1. QRIS (Quick Response Code Indonesian Standard)
export function QrisLogo({ height = 24, className = '', ...props }) {
  return (
    <svg
      height={height}
      viewBox="0 0 100 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="QRIS Logo"
      {...props}
    >
      <rect width="100" height="32" rx="4" fill="#ffffff" />
      {/* Red accent mark */}
      <path d="M6 6H16V10H6V6Z" fill="#ED1C24" />
      <path d="M6 10H10V22H6V10Z" fill="#ED1C24" />
      <path d="M12 12H16V16H12V12Z" fill="#ED1C24" />
      {/* QRIS Wordmark */}
      {/* Q */}
      <path
        d="M26 8C22.686 8 20 10.686 20 14V18C20 21.314 22.686 24 26 24C27.5 24 28.87 23.45 29.93 22.54L31.46 24.07C31.85 24.46 32.48 24.46 32.88 24.07C33.27 23.68 33.27 23.05 32.88 22.65L31.35 21.12C31.76 20.18 32 19.12 32 18V14C32 10.686 29.314 8 26 8ZM28.5 18C28.5 19.38 27.38 20.5 26 20.5C24.62 20.5 23.5 19.38 23.5 18V14C23.5 12.62 24.62 11.5 26 11.5C27.38 11.5 28.5 12.62 28.5 14V18Z"
        fill="#1E1E1E"
      />
      {/* R */}
      <path
        d="M36 8.5H43C45.21 8.5 47 10.29 47 12.5C47 14.15 45.99 15.57 44.55 16.17L47.5 23.5H43.6L41 17H39.5V23.5H36V8.5ZM39.5 14H42.5C43.33 14 44 13.33 44 12.5C44 11.67 43.33 11 42.5 11H39.5V14Z"
        fill="#1E1E1E"
      />
      {/* I */}
      <path d="M51 8.5H54.5V23.5H51V8.5Z" fill="#1E1E1E" />
      {/* S */}
      <path
        d="M60.5 18.2C60.5 19.47 61.53 20.5 62.8 20.5H66.2C67.47 20.5 68.5 21.53 68.5 22.8C68.5 24.07 67.47 25.1 66.2 25.1H59.5V22.2H66.2C66.37 22.2 66.5 22.07 66.5 21.9C66.5 21.73 66.37 21.6 66.2 21.6H62.8C60.98 21.6 59.5 20.12 59.5 18.3C59.5 16.48 60.98 15 62.8 15H69V17.9H62.8C61.53 17.9 60.5 18.93 60.5 20.2V18.2Z"
        fill="#1E1E1E"
      />
      {/* Small GPN Flag Tag */}
      <rect x="73" y="10" width="22" height="12" rx="2" fill="#ED1C24" />
      <text x="75" y="19" fill="#ffffff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
        GPN
      </text>
    </svg>
  )
}

// 2. GoPay
export function GopayLogo({ height = 24, className = '', ...props }) {
  return (
    <svg
      height={height}
      viewBox="0 0 100 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="GoPay Logo"
      {...props}
    >
      <rect width="100" height="30" rx="6" fill="#00AED6" />
      {/* GoPay Coin Icon */}
      <circle cx="17" cy="15" r="8" fill="#ffffff" />
      <circle cx="17" cy="15" r="4.2" fill="#00AED6" />
      <circle cx="17" cy="13.2" r="1.6" fill="#ffffff" />
      {/* "gopay" text */}
      <text
        x="30"
        y="21"
        fill="#ffffff"
        fontSize="16"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-0.5px"
      >
        gopay
      </text>
    </svg>
  )
}

// 3. OVO
export function OvoLogo({ height = 24, className = '', ...props }) {
  return (
    <svg
      height={height}
      viewBox="0 0 84 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="OVO Logo"
      {...props}
    >
      <rect width="84" height="30" rx="6" fill="#4C2A86" />
      <text
        x="42"
        y="21.5"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="17"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="2.5px"
      >
        OVO
      </text>
    </svg>
  )
}

// 4. DANA
export function DanaLogo({ height = 24, className = '', ...props }) {
  return (
    <svg
      height={height}
      viewBox="0 0 92 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="DANA Logo"
      {...props}
    >
      <rect width="92" height="30" rx="6" fill="#118EEA" />
      <text
        x="46"
        y="21"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="16"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="1px"
      >
        DANA
      </text>
    </svg>
  )
}

// 5. ShopeePay
export function ShopeepayLogo({ height = 24, className = '', ...props }) {
  return (
    <svg
      height={height}
      viewBox="0 0 110 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ShopeePay Logo"
      {...props}
    >
      <rect width="110" height="30" rx="6" fill="#EE4D2D" />
      {/* Bag Icon */}
      <path
        d="M14 11V10C14 7.79 15.79 6 18 6C20.21 6 22 7.79 22 10V11H24.5C25.05 11 25.5 11.45 25.5 12L24.5 23C24.5 23.55 24.05 24 23.5 24H12.5C11.95 24 11.5 23.55 11.5 23L10.5 12C10.5 11.45 10.95 11 11.5 11H14ZM16 11H20V10C20 8.9 19.1 8 18 8C16.9 8 16 8.9 16 10V11Z"
        fill="#ffffff"
      />
      <text
        x="31"
        y="20.5"
        fill="#ffffff"
        fontSize="12.5"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        ShopeePay
      </text>
    </svg>
  )
}

// 6. BCA (Bank Central Asia)
export function BcaLogo({ height = 24, className = '', ...props }) {
  return (
    <svg
      height={height}
      viewBox="0 0 88 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="BCA Logo"
      {...props}
    >
      <rect width="88" height="30" rx="6" fill="#005BAA" />
      <text
        x="44"
        y="21.5"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="17"
        fontWeight="900"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="1px"
      >
        BCA
      </text>
    </svg>
  )
}

// 7. Bank Mandiri
export function MandiriLogo({ height = 24, className = '', ...props }) {
  return (
    <svg
      height={height}
      viewBox="0 0 100 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Mandiri Logo"
      {...props}
    >
      <rect width="100" height="30" rx="6" fill="#002D62" />
      {/* Mandiri Golden Ribbon */}
      <path
        d="M13 18C15 13 18 10 23 10C26 10 28 12 28 12C28 12 26 14 24 14C20 14 17 17 15 21L13 18Z"
        fill="#FFB700"
      />
      <text
        x="33"
        y="20.5"
        fill="#ffffff"
        fontSize="13.5"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        mandiri
      </text>
    </svg>
  )
}

// 8. BNI (Bank Negara Indonesia)
export function BniLogo({ height = 24, className = '', ...props }) {
  return (
    <svg
      height={height}
      viewBox="0 0 88 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="BNI Logo"
      {...props}
    >
      <rect width="88" height="30" rx="6" fill="#005E6A" />
      {/* Orange 46 Accent */}
      <rect x="7" y="6" width="18" height="18" rx="4" fill="#F15A24" />
      <text x="10" y="19.5" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
        46
      </text>
      <text
        x="34"
        y="21"
        fill="#ffffff"
        fontSize="16"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="1px"
      >
        BNI
      </text>
    </svg>
  )
}

// 9. BRI (Bank Rakyat Indonesia)
export function BriLogo({ height = 24, className = '', ...props }) {
  return (
    <svg
      height={height}
      viewBox="0 0 88 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="BRI Logo"
      {...props}
    >
      <rect width="88" height="30" rx="6" fill="#00529B" />
      <text
        x="44"
        y="21.5"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="17"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="1.5px"
      >
        BRI
      </text>
    </svg>
  )
}

