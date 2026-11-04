'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, Check } from 'lucide-react'
import { useLang } from '@/contexts/LangContext'

export default function MobileTrainIllustration() {
  const { lang, toggleLang } = useLang()
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const handleSelectLang = (selectedLang) => {
    if (selectedLang !== lang) {
      toggleLang()
    }
    setLangMenuOpen(false)
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 290,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #32115f 0%, #4c1d95 38%, #5b21b6 70%, #6d28d9 100%)',
        userSelect: 'none',
      }}
      aria-label="Ilustrasi Kereta Api Mobile RAILHUB"
    >
      {/* Top Floating Action Bar: Back Button & Language Selector */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 16,
          right: 16,
          zIndex: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        {/* Back to Home Button */}
        <Link
          href="/"
          aria-label={lang === 'en' ? 'Back to home' : 'Kembali ke beranda'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 38,
            height: 38,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            color: '#1e293b',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            transition: 'all 0.2s ease',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.backgroundColor = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)'
          }}
        >
          <ArrowLeft size={18} strokeWidth={2.4} />
        </Link>

        {/* Language Selector Pill (Matching the exact look from Access by KAI screenshot: '🇺🇸 EN v') */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            aria-expanded={langMenuOpen}
            aria-label="Pilih Bahasa / Select Language"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px 6px 10px',
              borderRadius: 24,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              color: '#0f172a',
              fontSize: '0.8125rem',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)')}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>
              {lang === 'id' ? '🇮🇩' : '🇺🇸'}
            </span>
            <span style={{ letterSpacing: '0.04em' }}>
              {lang === 'id' ? 'ID' : 'EN'}
            </span>
            <ChevronDown
              size={14}
              style={{
                color: '#475569',
                transform: langMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {/* Dropdown Menu */}
          {langMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                backgroundColor: '#ffffff',
                borderRadius: 14,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                padding: '6px',
                minWidth: 130,
                zIndex: 30,
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <button
                type="button"
                onClick={() => handleSelectLang('id')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: lang === 'id' ? '#f1f5f9' : 'transparent',
                  color: '#0f172a',
                  fontSize: '0.8125rem',
                  fontWeight: lang === 'id' ? 700 : 500,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🇮🇩</span> Bahasa ID
                </span>
                {lang === 'id' && <Check size={14} color="#2563eb" strokeWidth={3} />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectLang('en')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: lang === 'en' ? '#f1f5f9' : 'transparent',
                  color: '#0f172a',
                  fontSize: '0.8125rem',
                  fontWeight: lang === 'en' ? 700 : 500,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🇺🇸</span> English (EN)
                </span>
                {lang === 'en' && <Check size={14} color="#2563eb" strokeWidth={3} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Embedded CSS Animations for High Performance Vector Action */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rhTrainChug {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-1.5px); }
        }
        @keyframes rhPinBobBig {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1.5deg); }
        }
        @keyframes rhPinShadowBig {
          0%, 100% { transform: scale(1); opacity: 0.45; }
          50% { transform: scale(0.78); opacity: 0.22; }
        }
        @keyframes rhPinBobSmall {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes rhLightGlow {
          0%, 100% { opacity: 0.85; filter: drop-shadow(0 0 10px rgba(254, 240, 138, 0.8)); }
          50% { opacity: 1; filter: drop-shadow(0 0 18px rgba(253, 224, 71, 1)); }
        }
        @keyframes rhSteamPuff {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
          30% { opacity: 0.7; }
          100% { transform: translate(-35px, -30px) scale(1.6); opacity: 0; }
        }
        @keyframes rhStarTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.95; transform: scale(1.2); }
        }
        .rh-anim-train {
          animation: rhTrainChug 1.4s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .rh-anim-pin-big {
          animation: rhPinBobBig 2.6s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .rh-anim-pin-shadow {
          animation: rhPinShadowBig 2.6s ease-in-out infinite;
          transform-origin: 322px 238px;
        }
        .rh-anim-pin-small {
          animation: rhPinBobSmall 3s ease-in-out infinite;
          animation-delay: 0.6s;
          transform-origin: center bottom;
        }
        .rh-anim-headlight {
          animation: rhLightGlow 2s ease-in-out infinite;
        }
        .rh-anim-steam-1 {
          animation: rhSteamPuff 3.2s ease-out infinite;
          transform-origin: 220px 80px;
        }
        .rh-anim-steam-2 {
          animation: rhSteamPuff 3.2s ease-out infinite;
          animation-delay: 1.6s;
          transform-origin: 220px 80px;
        }
        .rh-anim-star {
          animation: rhStarTwinkle 2.5s ease-in-out infinite;
        }
      ` }} />

      {/* Scalable SVG Canvas (ViewBox: 0 0 420 280) */}
      <svg
        viewBox="0 0 420 280"
        preserveAspectRatio="xMidYMid slice"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      >
        <defs>
          {/* Sky Gradient */}
          <linearGradient id="rhSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c0c59" />
            <stop offset="42%" stopColor="#4c1d95" />
            <stop offset="78%" stopColor="#6722c2" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>

          {/* Station Building Gradient */}
          <linearGradient id="rhStationGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(237, 233, 254, 0.32)" />
            <stop offset="100%" stopColor="rgba(196, 181, 253, 0.12)" />
          </linearGradient>

          {/* Locomotive Body Gradient (Vivid Tangerine Orange) */}
          <linearGradient id="rhTrainBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffb300" />
            <stop offset="35%" stopColor="#ff7a00" />
            <stop offset="85%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          {/* Locomotive Nose Gradient */}
          <linearGradient id="rhTrainNoseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff9800" />
            <stop offset="100%" stopColor="#d94e00" />
          </linearGradient>

          {/* Locomotive Roof Gradient (Deep Midnight Indigo) */}
          <linearGradient id="rhTrainRoofGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="60%" stopColor="#2e1065" />
            <stop offset="100%" stopColor="#3b0764" />
          </linearGradient>

          {/* Cabin Windshield Glass Gradient */}
          <linearGradient id="rhGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="85%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          {/* Red Cowcatcher / Front Plow Gradient */}
          <linearGradient id="rhCowcatcherGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="70%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          {/* 3D Map Pin Main Gradient (Glossy Magenta / Coral Pink) */}
          <linearGradient id="rhPinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff5a7e" />
            <stop offset="45%" stopColor="#f43f5e" />
            <stop offset="85%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>

          {/* 3D Map Pin Bevel Gradient */}
          <linearGradient id="rhPinBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Pin Top Specular Highlight */}
          <linearGradient id="rhPinSpecGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.75)" />
            <stop offset="60%" stopColor="rgba(255, 255, 255, 0.1)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>

          {/* Headlight Radial Cone */}
          <radialGradient id="rhHeadlightRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="35%" stopColor="#fef08a" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#facc15" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
          </radialGradient>

          {/* Headlight Beam Cone Spread */}
          <linearGradient id="rhLightBeam" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.75" />
            <stop offset="30%" stopColor="#facc15" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
          </linearGradient>

          {/* Railway Bed Gradient */}
          <linearGradient id="rhTrackBed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4c1d95" />
            <stop offset="100%" stopColor="#2e1065" />
          </linearGradient>

          {/* Track Rail Specular */}
          <linearGradient id="rhRailSteel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c7d2fe" />
            <stop offset="50%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#a5b4fc" />
          </linearGradient>
        </defs>

        {/* 1. Sky Backdrop */}
        <rect width="420" height="280" fill="url(#rhSkyGrad)" />

        {/* 2. Twinkling Stars in twilight sky */}
        <g opacity="0.6">
          <circle cx="50" cy="50" r="1.5" fill="#f8fafc" className="rh-anim-star" style={{ animationDelay: '0.2s' }} />
          <circle cx="110" cy="35" r="1.2" fill="#ffffff" className="rh-anim-star" style={{ animationDelay: '1.2s' }} />
          <circle cx="160" cy="65" r="2" fill="#e0e7ff" className="rh-anim-star" style={{ animationDelay: '0.8s' }} />
          <circle cx="280" cy="40" r="1.5" fill="#ffffff" className="rh-anim-star" style={{ animationDelay: '1.8s' }} />
          <circle cx="370" cy="70" r="1.8" fill="#f8fafc" className="rh-anim-star" style={{ animationDelay: '0.5s' }} />
        </g>

        {/* 3. Neoclassical Train Station Silhouette (Grand Station Facade) */}
        <g id="rhStationBackground" fill="url(#rhStationGrad)" opacity="0.85">
          {/* Main Central Station Pediment & Clock Tower */}
          <polygon points="120,62 170,30 220,62" />
          <rect x="156" y="16" width="28" height="15" rx="3" />
          {/* Central Clock Circle */}
          <circle cx="170" cy="48" r="9" fill="rgba(255, 255, 255, 0.45)" />
          <circle cx="170" cy="48" r="7" fill="rgba(76, 29, 149, 0.25)" />

          {/* Grand Arch Station Vaulting */}
          <path d="M 80,140 Q 170,55 260,140 Z" fill="rgba(237, 233, 254, 0.16)" />
          <path d="M 100,140 Q 170,72 240,140 Z" fill="rgba(76, 29, 149, 0.18)" />

          {/* Classical Colonnade Pillars */}
          <rect x="92" y="80" width="8" height="60" rx="1.5" />
          <rect x="116" y="75" width="8" height="65" rx="1.5" />
          <rect x="140" y="70" width="8" height="70" rx="1.5" />
          <rect x="192" y="70" width="8" height="70" rx="1.5" />
          <rect x="216" y="75" width="8" height="65" rx="1.5" />
          <rect x="240" y="80" width="8" height="60" rx="1.5" />

          {/* Entablature Horizontal Beams */}
          <rect x="75" y="70" width="190" height="7" rx="1.5" />
          <rect x="85" y="60" width="170" height="6" rx="1" />

          {/* Arched Windows with warm amber inner tint */}
          <path d="M 104,100 Q 108,92 112,100 L 112,118 L 104,118 Z" fill="rgba(254, 240, 138, 0.28)" />
          <path d="M 128,95 Q 132,87 136,95 L 136,118 L 128,118 Z" fill="rgba(254, 240, 138, 0.35)" />
          <path d="M 204,95 Q 208,87 212,95 L 212,118 L 204,118 Z" fill="rgba(254, 240, 138, 0.35)" />
          <path d="M 228,100 Q 232,92 236,100 L 236,118 L 228,118 Z" fill="rgba(254, 240, 138, 0.28)" />

          {/* Left & Right Extended Platform Wings */}
          <rect x="20" y="105" width="60" height="40" rx="2" />
          <rect x="260" y="105" width="130" height="40" rx="2" />
          {/* Wing Roof Line */}
          <line x1="15" y1="105" x2="395" y2="105" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="3" />
        </g>

        {/* 4. Railroad Track Bed & Rails */}
        <g id="rhTracks">
          {/* Ground ballast slope */}
          <polygon points="0,175 420,175 420,240 0,240" fill="url(#rhTrackBed)" />

          {/* Track Sleepers (Ties) angled in railway perspective */}
          <g fill="#2e1065" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1">
            <rect x="15" y="186" width="390" height="4.5" rx="1" />
            <rect x="10" y="194" width="400" height="5" rx="1" />
            <rect x="5" y="202" width="410" height="5.5" rx="1.2" />
            <rect x="0" y="211" width="420" height="6" rx="1.5" />
          </g>

          {/* Continuous Steel Rails with Gleam */}
          <line x1="0" y1="188" x2="420" y2="188" stroke="url(#rhRailSteel)" strokeWidth="3" />
          <line x1="0" y1="205" x2="420" y2="205" stroke="url(#rhRailSteel)" strokeWidth="3.5" />
          {/* Rail Polish Highlight */}
          <line x1="0" y1="187" x2="420" y2="187" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
          <line x1="0" y1="204" x2="420" y2="204" stroke="#ffffff" strokeWidth="1" opacity="0.9" />
        </g>

        {/* 5. Locomotive Steam Exhaust Wisps */}
        <g id="rhSteam">
          <circle cx="218" cy="82" r="10" fill="rgba(255, 255, 255, 0.25)" className="rh-anim-steam-1" />
          <circle cx="222" cy="80" r="14" fill="rgba(255, 255, 255, 0.2)" className="rh-anim-steam-2" />
        </g>

        {/* 6. The Locomotive (CC206 Style Modern Diesel Engine) */}
        <g id="rhLocomotive" className="rh-anim-train">
          {/* Locomotive Soft Track Shadow */}
          <ellipse cx="160" cy="192" rx="135" ry="8" fill="rgba(15, 6, 30, 0.65)" />

          {/* Under-chassis & Bogies */}
          <g id="rhBogieAndWheels">
            {/* Dark heavy chassis beam */}
            <rect x="35" y="172" width="225" height="12" rx="2" fill="#1e1b4b" />
            {/* Front buffer beam */}
            <rect x="250" y="170" width="22" height="14" rx="2" fill="#312e81" />

            {/* Wheels & Suspension Units */}
            {/* Wheel 1 */}
            <g transform="translate(60, 184)">
              <circle cx="0" cy="0" r="11" fill="#0f172a" />
              <circle cx="0" cy="0" r="8.5" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="3.5" fill="#0f172a" />
            </g>
            {/* Wheel 2 */}
            <g transform="translate(95, 184)">
              <circle cx="0" cy="0" r="11" fill="#0f172a" />
              <circle cx="0" cy="0" r="8.5" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="3.5" fill="#0f172a" />
            </g>
            {/* Wheel 3 */}
            <g transform="translate(170, 184)">
              <circle cx="0" cy="0" r="11" fill="#0f172a" />
              <circle cx="0" cy="0" r="8.5" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="3.5" fill="#0f172a" />
            </g>
            {/* Wheel 4 */}
            <g transform="translate(205, 184)">
              <circle cx="0" cy="0" r="11" fill="#0f172a" />
              <circle cx="0" cy="0" r="8.5" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="3.5" fill="#0f172a" />
            </g>

            {/* Coil Springs & Brake Shoes */}
            <rect x="73" y="178" width="8" height="5" rx="1" fill="#64748b" />
            <rect x="183" y="178" width="8" height="5" rx="1" fill="#64748b" />
          </g>

          {/* Locomotive Body (Long Hood & Machinery Room) */}
          <rect x="35" y="100" width="130" height="74" rx="4" fill="url(#rhTrainBodyGrad)" />

          {/* Long Hood Radiator Grill Louvers (3D depth) */}
          <g fill="#9a3412" stroke="#ea580c" strokeWidth="0.8">
            <rect x="44" y="112" width="22" height="42" rx="2" />
            <line x1="45" y1="118" x2="65" y2="118" />
            <line x1="45" y1="124" x2="65" y2="124" />
            <line x1="45" y1="130" x2="65" y2="130" />
            <line x1="45" y1="136" x2="65" y2="136" />
            <line x1="45" y1="142" x2="65" y2="142" />
            <line x1="45" y1="148" x2="65" y2="148" />

            <rect x="74" y="112" width="22" height="42" rx="2" />
            <line x1="75" y1="118" x2="95" y2="118" />
            <line x1="75" y1="124" x2="95" y2="124" />
            <line x1="75" y1="130" x2="95" y2="130" />
            <line x1="75" y1="136" x2="95" y2="136" />
            <line x1="75" y1="142" x2="95" y2="142" />
            <line x1="75" y1="148" x2="95" y2="148" />
          </g>

          {/* Side Inspection Doors & Handles */}
          <rect x="106" y="112" width="26" height="52" rx="2" fill="none" stroke="#b45309" strokeWidth="1.2" />
          <circle cx="126" cy="138" r="1.5" fill="#fef3c7" />

          {/* Forward Driver Cabin (Tall, modern CC206 style) */}
          <path
            d="M 160,174 L 160,94 Q 160,88 166,88 L 222,88 Q 232,88 238,98 L 248,122 L 248,174 Z"
            fill="url(#rhTrainBodyGrad)"
          />

          {/* Cabin Roof Cap (Midnight Indigo) */}
          <path
            d="M 158,94 Q 158,86 166,86 L 224,86 Q 236,86 242,94 L 244,98 L 158,98 Z"
            fill="url(#rhTrainRoofGrad)"
          />

          {/* Roof Exhaust Fan & Horn */}
          <rect x="180" y="82" width="16" height="5" rx="1.5" fill="#1e1b4b" />
          <polygon points="214,84 226,81 226,87" fill="#fbbf24" />

          {/* Cabin Windshield (Forward Angled Glass with Reflection) */}
          {/* Main Front Windshield */}
          <polygon
            points="220,95 238,95 244,124 220,124"
            fill="url(#rhGlassGrad)"
            stroke="#1e1b4b"
            strokeWidth="1.8"
          />
          {/* Windshield Reflection Streak */}
          <polygon
            points="224,96 230,96 226,122 222,122"
            fill="rgba(255, 255, 255, 0.45)"
          />

          {/* Cabin Side Window */}
          <rect
            x="172"
            y="96"
            width="40"
            height="28"
            rx="3"
            fill="url(#rhGlassGrad)"
            stroke="#1e1b4b"
            strokeWidth="1.8"
          />
          {/* Side Glass Diagonal Glare */}
          <polygon
            points="178,97 186,97 194,123 186,123"
            fill="rgba(255, 255, 255, 0.4)"
          />

          {/* Cabin Crew Door */}
          <rect x="166" y="128" width="22" height="44" rx="2" fill="none" stroke="#c2410c" strokeWidth="1" />
          <circle cx="184" cy="148" r="1.5" fill="#fef3c7" />

          {/* Locomotive Forward Nose (Short Hood) */}
          <path
            d="M 244,120 L 264,122 Q 272,123 274,130 L 276,174 L 244,174 Z"
            fill="url(#rhTrainNoseGrad)"
          />
          {/* Nose Accent Stripe */}
          <path d="M 244,142 L 275,144" stroke="#ffffff" strokeWidth="2.5" />
          <path d="M 244,147 L 275,149" stroke="#1d4ed8" strokeWidth="2" />

          {/* RAILHUB Locomotive ID Plate */}
          <rect x="250" y="152" width="20" height="9" rx="1.5" fill="#0f172a" />
          <text x="260" y="158.5" fontSize="5" fontWeight="bold" fill="#38bdf8" textAnchor="middle" letterSpacing="0.5">
            RH-206
          </text>

          {/* Red Cowcatcher / Front Plow (Bold KAI Red Style) */}
          <path
            d="M 264,172 L 286,172 L 292,185 L 260,185 Z"
            fill="url(#rhCowcatcherGrad)"
            stroke="#7f1d1d"
            strokeWidth="1"
          />
          {/* Cowcatcher Teeth */}
          <line x1="268" y1="174" x2="267" y2="183" stroke="#ffffff" strokeWidth="1" />
          <line x1="275" y1="174" x2="275" y2="183" stroke="#ffffff" strokeWidth="1" />
          <line x1="282" y1="174" x2="283" y2="183" stroke="#ffffff" strokeWidth="1" />

          {/* Heavy Center Coupler / Hook */}
          <rect x="286" y="174" width="8" height="5" rx="1" fill="#334155" />

          {/* Headlights: Twin High-Intensity Rail Lamps */}
          <g id="rhHeadlights" className="rh-anim-headlight">
            {/* Headlight Housing on Nose */}
            <circle cx="266" cy="133" r="5" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="0.8" />
            <circle cx="266" cy="133" r="3.6" fill="#fef08a" />
            <circle cx="266" cy="133" r="2" fill="#ffffff" />

            <circle cx="273" cy="134" r="5" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="0.8" />
            <circle cx="273" cy="134" r="3.6" fill="#fef08a" />
            <circle cx="273" cy="134" r="2" fill="#ffffff" />

            {/* Glowing Light Beam Casting Forward onto Track */}
            <polygon
              points="276,132 390,120 405,195 276,140"
              fill="url(#rhLightBeam)"
              opacity="0.45"
              style={{ mixBlendMode: 'screen' }}
            />
          </g>
        </g>

        {/* 7. Floating 3D Map Pin 1 (Left background/middle ground) */}
        <g id="rhMapPinSmall" className="rh-anim-pin-small">
          {/* Drop shadow */}
          <ellipse cx="85" cy="180" rx="9" ry="3" fill="rgba(15, 6, 30, 0.4)" />

          {/* Pin Body (Tilted 3D look) */}
          <g transform="translate(73, 138) scale(0.68)">
            {/* 3D Extrusion bevel */}
            <path
              d="M 17,0 C 7.6,0 0,7.6 0,17 C 0,29 17,44 17,44 C 17,44 34,29 34,17 C 34,7.6 26.4,0 17,0 Z"
              fill="url(#rhPinBevelGrad)"
              transform="translate(2, 3)"
            />
            {/* Front Pin Face */}
            <path
              d="M 17,0 C 7.6,0 0,7.6 0,17 C 0,29 17,44 17,44 C 17,44 34,29 34,17 C 34,7.6 26.4,0 17,0 Z"
              fill="url(#rhPinGrad)"
            />
            {/* Inner Center Cutout Hole */}
            <circle cx="17" cy="16" r="6" fill="#4c1d95" opacity="0.9" />
            {/* Specular curved highlight */}
            <path
              d="M 6,13 C 7,8 11,4 17,4"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
          </g>
        </g>

        {/* 8. Floating 3D Map Pin 2 (Prominent Foreground Right - Exact Match to Screenshot!) */}
        <g id="rhMapPinBig">
          {/* Synchronized Ground Shadow */}
          <ellipse
            cx="326"
            cy="236"
            rx="24"
            ry="7.5"
            fill="rgba(15, 6, 30, 0.55)"
            className="rh-anim-pin-shadow"
          />

          {/* 3D Giant Floating Marker */}
          <g className="rh-anim-pin-big" transform="translate(300, 118)">
            {/* 3D Extrusion Depth/Bevel (Left & Bottom shadow) */}
            <path
              d="M 28,0 C 12.5,0 0,12.5 0,28 C 0,48 28,72 28,72 C 28,72 56,48 56,28 C 56,12.5 43.5,0 28,0 Z"
              fill="url(#rhPinBevelGrad)"
              transform="translate(4, 5)"
            />

            {/* Main Front Pin Face */}
            <path
              d="M 28,0 C 12.5,0 0,12.5 0,28 C 0,48 28,72 28,72 C 28,72 56,48 56,28 C 56,12.5 43.5,0 28,0 Z"
              fill="url(#rhPinGrad)"
            />

            {/* Inner Hollow Center Ring */}
            {/* Hole Depth shadow */}
            <circle cx="28" cy="27" r="11" fill="url(#rhPinBevelGrad)" />
            {/* Hole Center Showing Purple Background */}
            <circle cx="28" cy="26" r="9.5" fill="#5b21b6" />

            {/* Specular Curved Gloss Rim on Top Left */}
            <path
              d="M 10,22 C 12,12 19,6 28,6"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
            {/* Small glossy bead */}
            <circle cx="34" cy="8" r="2" fill="#ffffff" opacity="0.6" />
          </g>
        </g>
      </svg>
    </div>
  )
}

