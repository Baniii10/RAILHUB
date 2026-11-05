'use client'

import { useState } from 'react'

export default function WhatsAppBubble() {
  const [isHovered, setIsHovered] = useState(false)

  // Nomor WhatsApp Customer Service: 085875545245 (format internasional: 6285875545245)
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6285875545245'
  const message = encodeURIComponent(
    'Halo Customer Service RAILHUB, saya butuh bantuan terkait pemesanan tiket / layanan kereta.'
  )
  const waUrl = `https://wa.me/${phone}?text=${message}`

  return (
    <>
      {/* ── DESKTOP VIEW (Floating Button Bottom-Right) ────────────────── */}
      <div className="rh-wa-desktop">
        <div
          className={`rh-wa-tooltip ${isHovered ? 'is-visible' : ''}`}
          aria-hidden="true"
        >
          <span className="rh-wa-dot" />
          <span>Chat CS RAILHUB</span>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Hubungi Customer Service RAILHUB via WhatsApp"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="rh-wa-btn-desktop"
        >
          <svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor">
            <path d="M16 2C8.268 2 2 8.268 2 16c0 2.68.75 5.25 2.188 7.472L2.062 30l6.732-2.072A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.59a11.53 11.53 0 0 1-6.196-1.782l-.443-.264-4.598 1.416 1.45-4.47-.29-.462A11.572 11.572 0 0 1 4.41 16c0-6.39 5.2-11.59 11.59-11.59 6.39 0 11.59 5.2 11.59 11.59 0 6.39-5.2 11.59-11.59 11.59zm6.65-8.683c-.365-.183-2.158-1.066-2.493-1.188-.335-.122-.578-.183-.822.183-.243.365-.944 1.188-1.157 1.432-.213.243-.426.274-.792.091-.365-.183-1.542-.568-2.937-1.813-1.085-.968-1.818-2.164-2.031-2.53-.213-.365-.023-.562.16-.744.164-.164.365-.426.548-.639.183-.213.243-.365.365-.609.122-.243.061-.456-.03-.639-.091-.183-.822-1.98-1.127-2.712-.296-.713-.598-.616-.822-.628l-.701-.012c-.243 0-.639.091-.974.456-.335.365-1.278 1.25-1.278 3.048s1.309 3.534 1.492 3.778c.183.243 2.574 3.931 6.236 5.513.871.376 1.552.601 2.082.77.876.278 1.674.239 2.304.145.702-.105 2.158-.882 2.463-1.734.305-.852.305-1.583.213-1.735-.091-.152-.335-.243-.7-.426z" />
          </svg>
        </a>
      </div>

      {/* ── MOBILE VIEW (Floating Action Button Direct to WhatsApp) ───── */}
      <div className="rh-wa-mobile">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Hubungi Customer Service RAILHUB via WhatsApp"
          className="rh-wa-btn-mobile"
        >
          <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor">
            <path d="M16 2C8.268 2 2 8.268 2 16c0 2.68.75 5.25 2.188 7.472L2.062 30l6.732-2.072A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.59a11.53 11.53 0 0 1-6.196-1.782l-.443-.264-4.598 1.416 1.45-4.47-.29-.462A11.572 11.572 0 0 1 4.41 16c0-6.39 5.2-11.59 11.59-11.59 6.39 0 11.59 5.2 11.59 11.59 0 6.39-5.2 11.59-11.59 11.59zm6.65-8.683c-.365-.183-2.158-1.066-2.493-1.188-.335-.122-.578-.183-.822.183-.243.365-.944 1.188-1.157 1.432-.213.243-.426.274-.792.091-.365-.183-1.542-.568-2.937-1.813-1.085-.968-1.818-2.164-2.031-2.53-.213-.365-.023-.562.16-.744.164-.164.365-.426.548-.639.183-.213.243-.365.365-.609.122-.243.061-.456-.03-.639-.091-.183-.822-1.98-1.127-2.712-.296-.713-.598-.616-.822-.628l-.701-.012c-.243 0-.639.091-.974.456-.335.365-1.278 1.25-1.278 3.048s1.309 3.534 1.492 3.778c.183.243 2.574 3.931 6.236 5.513.871.376 1.552.601 2.082.77.876.278 1.674.239 2.304.145.702-.105 2.158-.882 2.463-1.734.305-.852.305-1.583.213-1.735-.091-.152-.335-.243-.7-.426z" />
          </svg>
        </a>
      </div>
    </>
  )
}
