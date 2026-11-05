'use client'

import { useState } from 'react'

export default function WhatsAppBubble() {
  const [isHovered, setIsHovered] = useState(false)

  // Nomor WA CS RAILHUB: 085875545245 (format internasional: 6285875545245)
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6285875545245'
  const message = encodeURIComponent(
    'Halo Customer Service RAILHUB, saya butuh bantuan terkait pemesanan tiket / layanan kereta.'
  )
  const waUrl = `https://wa.me/${phone}?text=${message}`

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.75rem',
        right: '1.75rem',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        pointerEvents: 'auto',
      }}
    >
      {/* Tooltip / Label saat hover atau di desktop */}
      <div
        style={{
          background: '#ffffff',
          color: '#1e293b',
          fontSize: '0.8125rem',
          fontWeight: 600,
          padding: '0.5rem 0.875rem',
          borderRadius: '9999px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          whiteSpace: 'nowrap',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateX(0)' : 'translateX(8px)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#22c55e',
            display: 'inline-block',
          }}
        />
        <span>Chat CS RAILHUB</span>
      </div>

      {/* Floating Button with WhatsApp SVG */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi Customer Service RAILHUB via WhatsApp"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(37, 211, 102, 0.42), 0 2px 8px rgba(0, 0, 0, 0.12)',
          transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease',
          transform: isHovered ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
          textDecoration: 'none',
          position: 'relative',
        }}
      >
        {/* Subtle Online Pulse Ring */}
        <span
          style={{
            position: 'absolute',
            inset: '-3px',
            borderRadius: '50%',
            border: '2px solid rgba(37, 211, 102, 0.55)',
            animation: 'rhWaPulse 2.4s infinite ease-out',
            pointerEvents: 'none',
          }}
        />

        {/* WhatsApp Official Vector Icon */}
        <svg
          viewBox="0 0 32 32"
          width="32"
          height="32"
          fill="currentColor"
          style={{ display: 'block' }}
        >
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.68.75 5.25 2.188 7.472L2.062 30l6.732-2.072A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.59a11.53 11.53 0 0 1-6.196-1.782l-.443-.264-4.598 1.416 1.45-4.47-.29-.462A11.572 11.572 0 0 1 4.41 16c0-6.39 5.2-11.59 11.59-11.59 6.39 0 11.59 5.2 11.59 11.59 0 6.39-5.2 11.59-11.59 11.59zm6.65-8.683c-.365-.183-2.158-1.066-2.493-1.188-.335-.122-.578-.183-.822.183-.243.365-.944 1.188-1.157 1.432-.213.243-.426.274-.792.091-.365-.183-1.542-.568-2.937-1.813-1.085-.968-1.818-2.164-2.031-2.53-.213-.365-.023-.562.16-.744.164-.164.365-.426.548-.639.183-.213.243-.365.365-.609.122-.243.061-.456-.03-.639-.091-.183-.822-1.98-1.127-2.712-.296-.713-.598-.616-.822-.628l-.701-.012c-.243 0-.639.091-.974.456-.335.365-1.278 1.25-1.278 3.048s1.309 3.534 1.492 3.778c.183.243 2.574 3.931 6.236 5.513.871.376 1.552.601 2.082.77.876.278 1.674.239 2.304.145.702-.105 2.158-.882 2.463-1.734.305-.852.305-1.583.213-1.735-.091-.152-.335-.243-.7-.426z" />
        </svg>
      </a>

      <style jsx global>{`
        @keyframes rhWaPulse {
          0% {
            transform: scale(0.96);
            opacity: 0.8;
          }
          70% {
            transform: scale(1.35);
            opacity: 0;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

