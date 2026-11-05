'use client'

import { useState } from 'react'
import { X, Send } from 'lucide-react'

export default function WhatsAppBubble() {
  const [isOpen, setIsOpen] = useState(false)
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
        {/* Tooltip saat kursor hover di desktop */}
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

      {/* ── MOBILE VIEW (Setengah Lingkaran Menempel di Kanan Bawah di Atas Navbar) ─ */}
      <div className="rh-wa-mobile">
        {/* Popup Card yang Muncul Saat Setengah Lingkaran Dipencet */}
        {isOpen && (
          <>
            <div
              className="rh-wa-mobile-backdrop"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <div className="rh-wa-mobile-card animate-scale-in" role="dialog" aria-label="Customer Service WhatsApp">
              <div className="rh-wa-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="rh-wa-avatar">
                    <svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor">
                      <path d="M16 2C8.268 2 2 8.268 2 16c0 2.68.75 5.25 2.188 7.472L2.062 30l6.732-2.072A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.59a11.53 11.53 0 0 1-6.196-1.782l-.443-.264-4.598 1.416 1.45-4.47-.29-.462A11.572 11.572 0 0 1 4.41 16c0-6.39 5.2-11.59 11.59-11.59 6.39 0 11.59 5.2 11.59 11.59 0 6.39-5.2 11.59-11.59 11.59zm6.65-8.683c-.365-.183-2.158-1.066-2.493-1.188-.335-.122-.578-.183-.822.183-.243.365-.944 1.188-1.157 1.432-.213.243-.426.274-.792.091-.365-.183-1.542-.568-2.937-1.813-1.085-.968-1.818-2.164-2.031-2.53-.213-.365-.023-.562.16-.744.164-.164.365-.426.548-.639.183-.213.243-.365.365-.609.122-.243.061-.456-.03-.639-.091-.183-.822-1.98-1.127-2.712-.296-.713-.598-.616-.822-.628l-.701-.012c-.243 0-.639.091-.974.456-.335.365-1.278 1.25-1.278 3.048s1.309 3.534 1.492 3.778c.183.243 2.574 3.931 6.236 5.513.871.376 1.552.601 2.082.77.876.278 1.674.239 2.304.145.702-.105 2.158-.882 2.463-1.734.305-.852.305-1.583.213-1.735-.091-.152-.335-.243-.7-.426z" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                      Customer Service
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#dcfce7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                      Online 24 Jam
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Tutup popup bantuan"
                  className="rh-wa-close-btn"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="rh-wa-card-body">
                <div className="rh-wa-speech-bubble">
                  Halo! Butuh bantuan terkait jadwal, tiket, atau kendala di stasiun? Hubungi Customer Service RAILHUB langsung lewat WhatsApp.
                </div>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="rh-wa-chat-link"
                >
                  <Send size={15} />
                  <span>Chat WhatsApp (0858-7554-5245)</span>
                </a>
              </div>
            </div>
          </>
        )}

        {/* Tombol Setengah Lingkaran Menempel di Pojok Kanan Layar di Atas Navbar Bawah */}
        <button
          type="button"
          onClick={() => setIsOpen(v => !v)}
          aria-expanded={isOpen}
          aria-label="Buka bantuan WhatsApp Customer Service"
          className="rh-wa-semi-circle-btn"
        >
          <svg viewBox="0 0 32 32" width="24" height="24" fill="currentColor">
            <path d="M16 2C8.268 2 2 8.268 2 16c0 2.68.75 5.25 2.188 7.472L2.062 30l6.732-2.072A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.59a11.53 11.53 0 0 1-6.196-1.782l-.443-.264-4.598 1.416 1.45-4.47-.29-.462A11.572 11.572 0 0 1 4.41 16c0-6.39 5.2-11.59 11.59-11.59 6.39 0 11.59 5.2 11.59 11.59 0 6.39-5.2 11.59-11.59 11.59zm6.65-8.683c-.365-.183-2.158-1.066-2.493-1.188-.335-.122-.578-.183-.822.183-.243.365-.944 1.188-1.157 1.432-.213.243-.426.274-.792.091-.365-.183-1.542-.568-2.937-1.813-1.085-.968-1.818-2.164-2.031-2.53-.213-.365-.023-.562.16-.744.164-.164.365-.426.548-.639.183-.213.243-.365.365-.609.122-.243.061-.456-.03-.639-.091-.183-.822-1.98-1.127-2.712-.296-.713-.598-.616-.822-.628l-.701-.012c-.243 0-.639.091-.974.456-.335.365-1.278 1.25-1.278 3.048s1.309 3.534 1.492 3.778c.183.243 2.574 3.931 6.236 5.513.871.376 1.552.601 2.082.77.876.278 1.674.239 2.304.145.702-.105 2.158-.882 2.463-1.734.305-.852.305-1.583.213-1.735-.091-.152-.335-.243-.7-.426z" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        /* ── DESKTOP STYLING ── */
        .rh-wa-desktop {
          display: none;
        }

        @media (min-width: 641px) {
          .rh-wa-desktop {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 9990;
            display: flex;
            align-items: center;
            gap: 0.625rem;
          }

          .rh-wa-tooltip {
            background: #ffffff;
            color: #1e293b;
            font-size: 0.8125rem;
            font-weight: 600;
            padding: 0.5rem 0.875rem;
            border-radius: 9999px;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
            border: 1px solid #e2e8f0;
            white-space: nowrap;
            opacity: 0;
            transform: translateX(8px);
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .rh-wa-tooltip.is-visible {
            opacity: 1;
            transform: translateX(0);
          }

          .rh-wa-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #22c55e;
            display: inline-block;
          }

          .rh-wa-btn-desktop {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background-color: #25D366;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 18px rgba(37, 211, 102, 0.4);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            text-decoration: none;
          }

          .rh-wa-btn-desktop:hover {
            transform: scale(1.08) translateY(-2px);
            box-shadow: 0 8px 22px rgba(37, 211, 102, 0.5);
          }
        }

        /* ── MOBILE STYLING (Setengah Lingkaran di Atas Navbar Bawah) ── */
        .rh-wa-mobile {
          display: block;
        }

        @media (min-width: 641px) {
          .rh-wa-mobile {
            display: none;
          }
        }

        /* Tombol Setengah Lingkaran Menempel di Kanan Layar */
        .rh-wa-semi-circle-btn {
          position: fixed;
          right: 0;
          bottom: calc(4.75rem + env(safe-area-inset-bottom, 0px));
          z-index: 95;
          width: 44px;
          height: 48px;
          border-top-left-radius: 28px;
          border-bottom-left-radius: 28px;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          background-color: #25D366;
          color: #ffffff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: 6px;
          box-shadow: -3px 4px 14px rgba(37, 211, 102, 0.45);
          cursor: pointer;
          touch-action: manipulation;
          transition: transform 0.15s ease, background-color 0.15s ease;
        }

        .rh-wa-semi-circle-btn:active {
          transform: scale(0.95);
          background-color: #1ebd5a;
        }

        /* Mobile Backdrop */
        .rh-wa-mobile-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.35);
          backdrop-filter: blur(2px);
          z-index: 96;
        }

        /* Popup Card */
        .rh-wa-mobile-card {
          position: fixed;
          right: 0.85rem;
          bottom: calc(4.75rem + env(safe-area-inset-bottom, 0px) + 56px);
          width: calc(100vw - 1.7rem);
          max-width: 320px;
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          z-index: 97;
          border: 1px solid #e2e8f0;
        }

        .rh-wa-card-header {
          background: #075e54;
          padding: 0.85rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rh-wa-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #25D366;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
        }

        .rh-wa-close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: #ffffff;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .rh-wa-card-body {
          padding: 1rem;
          background: #efeae2;
        }

        .rh-wa-speech-bubble {
          background: #ffffff;
          color: #1e293b;
          font-size: 0.8125rem;
          line-height: 1.45;
          padding: 0.65rem 0.85rem;
          border-radius: 12px;
          border-top-left-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          margin-bottom: 0.85rem;
        }

        .rh-wa-chat-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          background: #25D366;
          color: #ffffff;
          font-size: 0.8125rem;
          font-weight: 700;
          padding: 0.65rem 0.75rem;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.35);
        }

        .rh-wa-chat-link:active {
          background: #1ebd5a;
        }
      `}</style>
    </>
  )
}
