'use client'

import React from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

export function PwaPromoBumper(props = {}) {
  let frame = 0
  let fps = 30
  let width = 760
  let height = 460

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    frame = useCurrentFrame()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const config = useVideoConfig()
    fps = config.fps || 30
    width = config.width || 760
    height = config.height || 460
  } catch {
    frame = typeof props.frame === 'number' ? props.frame : 36
    fps = props.fps || 30
    width = props.width || 760
    height = props.height || 460
  }

  const isCompact = width < 520 || height < 360

  // 3 scenes x 100 frames = 300 frames (10s seamless loop at 30fps)
  const sceneIndex = Math.floor(frame / 100) % 3
  const localFrame = frame % 100

  // Smooth fade in/out for each scene
  const sceneOpacity = interpolate(localFrame, [0, 10, 88, 100], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Spring entrance for hero visual
  const pop = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 130, mass: 0.8 },
  })

  const popDelayed = spring({
    frame: Math.max(0, localFrame - 10),
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.85 },
  })

  // Gentle floating motion
  const floatY = Math.sin((frame / 18) * Math.PI) * 4

  // Scene 2: Tap install animation
  const isTapped = sceneIndex === 1 && localFrame >= 44
  const tapRippleScale = sceneIndex === 1
    ? interpolate(localFrame, [40, 60], [0.4, 2.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0
  const tapRippleOpacity = sceneIndex === 1
    ? interpolate(localFrame, [40, 46, 60], [0, 0.55, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0

  // Scene 3: QR laser scan sweep
  const scanY = interpolate(localFrame % 50, [0, 25, 50], [6, 76, 6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Scene copy
  const scenes = [
    {
      pill: 'RESPONSIF MULTI-PERANGKAT',
      title: 'Nyaman di HP & Desktop',
      sub: 'Tampilan adaptif & ringan di semua ukuran layar',
    },
    {
      pill: 'INSTALASI 1-KLIK PWA',
      title: 'Pasang Langsung ke Layar',
      sub: 'Tanpa Play Store · Hemat memori & langsung jalan',
    },
    {
      pill: 'SIAP OFFLINE & LIVE',
      title: 'E-Boarding QR & Tracking',
      sub: 'Akses tiket cepat dan pantau posisi kereta kapan saja',
    },
  ]

  const activeCopy = scenes[sceneIndex]

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(145deg, #ffffff 0%, #eff6ff 55%, #fff7ed 100%)',
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: 'var(--font-montserrat), system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isCompact ? '18px 16px 16px' : '24px 26px 20px',
        boxSizing: 'border-box',
      }}
    >
      {/* Subtle Bright Decorative Grid & Soft Light Orbs (No Heavy Blur) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(26, 66, 138, 0.08) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -60,
          right: -50,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.14) 0%, rgba(37, 99, 235, 0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -70,
          left: -40,
          width: 210,
          height: 210,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234, 88, 12, 0.12) 0%, rgba(234, 88, 12, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* TOP BAR: Logo + Scene Progress Pills */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src="/images/Fix logo railhub.png"
            alt="RAILHUB"
            style={{
              height: isCompact ? 20 : 24,
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <span
            style={{
              fontSize: isCompact ? 10 : 11,
              fontWeight: 800,
              color: '#1a428a',
              background: '#dbeafe',
              padding: '3px 8px',
              borderRadius: 999,
              letterSpacing: '0.04em',
            }}
          >
            PWA
          </span>
        </div>

        {/* 3-Segment Progress Indicator */}
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {[0, 1, 2].map((idx) => {
            const fillPct =
              idx < sceneIndex
                ? 100
                : idx === sceneIndex
                  ? Math.min(100, (localFrame / 100) * 100)
                  : 0
            return (
              <div
                key={idx}
                style={{
                  width: idx === sceneIndex ? 28 : 14,
                  height: 5,
                  borderRadius: 999,
                  background: 'rgba(26, 66, 138, 0.14)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${fillPct}%`,
                    height: '100%',
                    background: idx === sceneIndex ? '#ea580c' : '#1a428a',
                    borderRadius: 999,
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* CENTER ANIMATED VISUAL STAGE */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: sceneOpacity,
          margin: isCompact ? '8px 0' : '10px 0',
        }}
      >
        {/* ── SCENE 1: RESPONSIVE DESKTOP + MOBILE MORPH ── */}
        {sceneIndex === 0 && (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              width: '100%',
              maxWidth: isCompact ? 320 : 440,
              transform: `translateY(${floatY}px)`,
            }}
          >
            {/* Sleek Light Desktop / Laptop Window */}
            <div
              style={{
                width: isCompact ? 235 : 320,
                background: '#ffffff',
                borderRadius: 14,
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 14px 30px rgba(26, 66, 138, 0.12)',
                overflow: 'hidden',
                transform: `translateY(${(1 - pop) * 24}px) scale(${0.92 + pop * 0.08})`,
              }}
            >
              {/* Browser Top Bar */}
              <div
                style={{
                  height: 22,
                  background: '#f1f5f9',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '0 10px',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f87171' }} />
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fbbf24' }} />
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399' }} />
                <div
                  style={{
                    marginLeft: 8,
                    height: 11,
                    flex: 1,
                    maxWidth: 130,
                    borderRadius: 99,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                  }}
                />
              </div>

              {/* Desktop App UI Preview */}
              <div style={{ padding: isCompact ? 10 : 13 }}>
                <div
                  style={{
                    borderRadius: 10,
                    background: 'linear-gradient(120deg, #1a428a 0%, #2563eb 100%)',
                    padding: isCompact ? '9px 10px' : '11px 13px',
                    color: '#ffffff',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: 9, opacity: 0.85, fontWeight: 600 }}>CARI TIKET CEPAT</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                    <strong style={{ fontSize: isCompact ? 13 : 15 }}>GMR → YK</strong>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        background: '#ea580c',
                        padding: '3px 7px',
                        borderRadius: 6,
                      }}
                    >
                      Cari KA
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 8px' }}>
                    <div style={{ fontSize: 8, color: '#64748b', fontWeight: 700 }}>EKSEKUTIF</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a' }}>Rp 420.000</div>
                  </div>
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '6px 8px' }}>
                    <div style={{ fontSize: 8, color: '#b45309', fontWeight: 700 }}>LUXURY</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#78350f' }}>Rp 780.000</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlapping Sleek Mobile Phone Frame */}
            <div
              style={{
                width: isCompact ? 96 : 120,
                background: '#0f172a',
                borderRadius: 20,
                padding: 5,
                marginLeft: isCompact ? -36 : -44,
                marginBottom: -6,
                boxShadow: '0 16px 32px rgba(15, 23, 42, 0.22)',
                transform: `translateY(${(1 - popDelayed) * 32}px) scale(${0.9 + popDelayed * 0.1})`,
                zIndex: 4,
              }}
            >
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 15,
                  padding: '8px 7px',
                  overflow: 'hidden',
                }}
              >
                {/* Notch */}
                <div style={{ width: 28, height: 4, borderRadius: 99, background: '#0f172a', margin: '0 auto 7px' }} />
                {/* Mobile Mini Card */}
                <div
                  style={{
                    background: '#eff6ff',
                    borderRadius: 8,
                    padding: '6px 6px',
                    marginBottom: 6,
                    border: '1px solid #bfdbfe',
                  }}
                >
                  <div style={{ fontSize: 7.5, fontWeight: 800, color: '#1a428a' }}>GMR → BD</div>
                  <div style={{ fontSize: 7, color: '#64748b', marginTop: 1 }}>Argo Parahyangan</div>
                </div>
                <div
                  style={{
                    background: '#ea580c',
                    color: '#ffffff',
                    fontSize: 8,
                    fontWeight: 800,
                    textAlign: 'center',
                    padding: '5px 4px',
                    borderRadius: 6,
                  }}
                >
                  Pilih Kursi
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 7 }}>
                  <span style={{ width: 10, height: 3, borderRadius: 99, background: '#1a428a' }} />
                  <span style={{ width: 10, height: 3, borderRadius: 99, background: '#cbd5e1' }} />
                  <span style={{ width: 10, height: 3, borderRadius: 99, background: '#cbd5e1' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SCENE 2: 1-TAP PWA INSTALL EXPERIENCE ── */}
        {sceneIndex === 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isCompact ? 14 : 22,
              transform: `translateY(${floatY * 0.7}px)`,
            }}
          >
            {/* App Icon Tile */}
            <div
              style={{
                width: isCompact ? 78 : 96,
                height: isCompact ? 78 : 96,
                borderRadius: 22,
                background: 'linear-gradient(145deg, #1a428a 0%, #2563eb 100%)',
                boxShadow: '0 14px 28px rgba(26, 66, 138, 0.28)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                transform: `scale(${0.8 + pop * 0.2})`,
                position: 'relative',
              }}
            >
              <img
                src="/images/Fix logo railhub.png"
                alt="RAILHUB"
                style={{ width: '74%', height: 'auto', objectFit: 'contain' }}
              />
              {isTapped && (
                <div
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '2.5px solid #ffffff',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  ✓
                </div>
              )}
            </div>

            {/* Simulated Install Prompt Card */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: 16,
                padding: isCompact ? '12px 14px' : '15px 18px',
                boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
                minWidth: isCompact ? 165 : 210,
                transform: `translateX(${(1 - popDelayed) * 24}px)`,
                position: 'relative',
              }}
            >
              <div style={{ fontSize: isCompact ? 12 : 14, fontWeight: 800, color: '#0f172a' }}>
                RAILHUB App
              </div>
              <div style={{ fontSize: isCompact ? 10 : 11, color: '#64748b', marginTop: 2, marginBottom: 10 }}>
                railhub-indonesia.vercel.app
              </div>

              <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                <div
                  style={{
                    background: isTapped ? '#10b981' : '#1a428a',
                    color: '#ffffff',
                    fontSize: isCompact ? 11 : 12,
                    fontWeight: 800,
                    padding: '8px 14px',
                    borderRadius: 10,
                    textAlign: 'center',
                    transform: localFrame >= 40 && localFrame <= 46 ? 'scale(0.95)' : 'scale(1)',
                  }}
                >
                  {isTapped ? 'Terpasang di Layar ✓' : 'Pasang Aplikasi'}
                </div>

                {/* Tap Ripple Effect */}
                {tapRippleOpacity > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: 28,
                      height: 28,
                      marginLeft: -14,
                      marginTop: -14,
                      borderRadius: '50%',
                      border: '2.5px solid #ea580c',
                      transform: `scale(${tapRippleScale})`,
                      opacity: tapRippleOpacity,
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── SCENE 3: PERFORATED E-BOARDING TICKET + QR SCAN ── */}
        {sceneIndex === 2 && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1.5px solid #cbd5e1',
              boxShadow: '0 14px 30px rgba(26, 66, 138, 0.12)',
              display: 'flex',
              alignItems: 'center',
              padding: isCompact ? '12px 14px' : '16px 20px',
              gap: isCompact ? 14 : 20,
              maxWidth: isCompact ? 310 : 390,
              width: '100%',
              transform: `translateY(${(1 - pop) * 24 + floatY * 0.6}px)`,
              position: 'relative',
            }}
          >
            {/* Left Ticket Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: '#059669',
                  background: '#ecfdf5',
                  padding: '3px 7px',
                  borderRadius: 6,
                  marginBottom: 6,
                }}
              >
                E-BOARDING SIAP
              </span>
              <div style={{ fontSize: isCompact ? 15 : 18, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                GMR → SGU
              </div>
              <div style={{ fontSize: isCompact ? 10 : 11.5, color: '#64748b', fontWeight: 600, marginTop: 2 }}>
                Argo Bromo · Kursi 4A
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#1a428a', marginTop: 6 }}>
                08:20 WIB · Live Tracking
              </div>
            </div>

            {/* Dashed Vertical Tear Line */}
            <div
              style={{
                width: 1,
                alignSelf: 'stretch',
                borderLeft: '1.5px dashed #cbd5e1',
              }}
            />

            {/* Right QR Code with Animated Scan Line */}
            <div style={{ position: 'relative', width: isCompact ? 68 : 82, height: isCompact ? 68 : 82, flexShrink: 0 }}>
              <svg viewBox="0 0 84 84" width="100%" height="100%" style={{ display: 'block', borderRadius: 8 }}>
                <rect width="84" height="84" fill="#f8fafc" rx="8" />
                <rect x="6" y="6" width="22" height="22" fill="#0f172a" rx="3" />
                <rect x="10" y="10" width="14" height="14" fill="#ffffff" rx="1.5" />
                <rect x="13" y="13" width="8" height="8" fill="#1a428a" rx="1" />

                <rect x="56" y="6" width="22" height="22" fill="#0f172a" rx="3" />
                <rect x="60" y="10" width="14" height="14" fill="#ffffff" rx="1.5" />
                <rect x="63" y="13" width="8" height="8" fill="#1a428a" rx="1" />

                <rect x="6" y="56" width="22" height="22" fill="#0f172a" rx="3" />
                <rect x="10" y="60" width="14" height="14" fill="#ffffff" rx="1.5" />
                <rect x="13" y="63" width="8" height="8" fill="#1a428a" rx="1" />

                <rect x="34" y="10" width="6" height="6" fill="#0f172a" />
                <rect x="44" y="16" width="6" height="12" fill="#0f172a" />
                <rect x="34" y="34" width="16" height="16" fill="#ea580c" rx="3" />
                <circle cx="42" cy="42" r="3.5" fill="#ffffff" />
                <rect x="56" y="36" width="8" height="8" fill="#0f172a" />
                <rect x="68" y="42" width="10" height="6" fill="#0f172a" />
                <rect x="34" y="58" width="8" height="8" fill="#0f172a" />
                <rect x="48" y="64" width="10" height="8" fill="#0f172a" />
                <rect x="64" y="56" width="12" height="16" fill="#0f172a" />
              </svg>
              {/* Animated Orange Scan Bar */}
              <div
                style={{
                  position: 'absolute',
                  left: 4,
                  right: 4,
                  top: `${scanY}%`,
                  height: 2.5,
                  borderRadius: 99,
                  background: '#ea580c',
                  boxShadow: '0 0 8px rgba(234, 88, 12, 0.7)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM COPY BLOCK */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          opacity: sceneOpacity,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: isCompact ? 9.5 : 10.5,
            fontWeight: 800,
            letterSpacing: '0.1em',
            color: '#ea580c',
            marginBottom: 4,
          }}
        >
          {activeCopy.pill}
        </span>
        <div
          style={{
            fontSize: isCompact ? 18 : 22,
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          {activeCopy.title}
        </div>
        <div
          style={{
            fontSize: isCompact ? 11.5 : 13,
            color: '#475569',
            fontWeight: 500,
            marginTop: 4,
          }}
        >
          {activeCopy.sub}
        </div>
      </div>
    </div>
  )
}
