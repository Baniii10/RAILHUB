'use client'

import React, { useState, useEffect } from 'react'

export default function TrainSceneryVector({ isDay = false }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <div
      className="rh-scenery-wrapper"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'all 0.6s ease',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rhStarTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes rhCloudDrift {
          0% { transform: translateX(0px); }
          50% { transform: translateX(45px); }
          100% { transform: translateX(0px); }
        }
        @keyframes rhCloudDriftReverse {
          0% { transform: translateX(0px); }
          50% { transform: translateX(-35px); }
          100% { transform: translateX(0px); }
        }
        @keyframes rhHeadlightPulse {
          0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 10px rgba(254, 240, 138, 0.6)); }
          50% { opacity: 1; filter: drop-shadow(0 0 18px rgba(253, 224, 71, 0.95)); }
        }
        @keyframes rhSignalGlow {
          0%, 100% { opacity: 0.7; filter: drop-shadow(0 0 4px #22c55e); }
          50% { opacity: 1; filter: drop-shadow(0 0 10px #4ade80); }
        }
        @keyframes rhSparkGlow {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.95; transform: scale(1.3); }
        }
        @keyframes rhSpeedLine {
          0% { stroke-dashoffset: 60; opacity: 0.2; }
          50% { opacity: 0.8; }
          100% { stroke-dashoffset: 0; opacity: 0.2; }
        }
        @keyframes rhSunRaysRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rhBirdFlap {
          0%, 100% { transform: translateY(0px) scaleY(1); }
          50% { transform: translateY(-4px) scaleY(0.85); }
        }

        .rh-anim-star-1 { animation: rhStarTwinkle 3s ease-in-out infinite; }
        .rh-anim-star-2 { animation: rhStarTwinkle 4.2s ease-in-out 1s infinite; }
        .rh-anim-star-3 { animation: rhStarTwinkle 3.6s ease-in-out 2s infinite; }
        .rh-anim-cloud-1 { animation: rhCloudDrift 32s ease-in-out infinite; }
        .rh-anim-cloud-2 { animation: rhCloudDriftReverse 40s ease-in-out infinite; }
        .rh-anim-headlight { animation: rhHeadlightPulse 2.4s ease-in-out infinite; }
        .rh-anim-signal { animation: rhSignalGlow 2.5s ease-in-out infinite; }
        .rh-anim-spark { animation: rhSparkGlow 1.8s ease-in-out infinite; }
        .rh-anim-speedline { animation: rhSpeedLine 3s linear infinite; stroke-dasharray: 20, 10; }
        .rh-anim-sun-rays { transform-origin: 36px 36px; animation: rhSunRaysRotate 60s linear infinite; }
        .rh-anim-bird { animation: rhBirdFlap 3s ease-in-out infinite; }
        @keyframes rhExpressTrainRide {
          0% {
            transform: translate(-1200px, 48px);
          }
          100% {
            transform: translate(1500px, 48px);
          }
        }
        .rh-anim-express-train {
          animation: rhExpressTrainRide 14s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .rh-anim-express-train {
            animation: none;
            transform: translate(140px, 48px);
          }
        }
      ` }} />

      {/* Atmospheric Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 1200,
          height: 380,
          background: isDay
            ? 'radial-gradient(ellipse at 50% 20%, rgba(254, 240, 138, 0.45) 0%, rgba(56, 189, 248, 0.22) 50%, transparent 70%)'
            : 'radial-gradient(ellipse at 50% 20%, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.1) 45%, transparent 70%)',
          filter: 'blur(35px)',
          transition: 'background 0.6s ease',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 320,
          background: isDay
            ? 'radial-gradient(ellipse at 50% 100%, rgba(34, 197, 94, 0.3) 0%, rgba(56, 189, 248, 0) 75%)'
            : 'radial-gradient(ellipse at 50% 100%, rgba(29, 78, 216, 0.35) 0%, rgba(10, 25, 47, 0) 75%)',
          filter: 'blur(25px)',
          transition: 'background 0.6s ease',
        }}
      />

      {/* Panoramic Vector Canvas */}
      <svg
        viewBox={isMobile ? "200 0 1040 680" : "0 0 1440 680"}
        preserveAspectRatio="xMidYBottom slice"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100%',
          minHeight: '520px',
          display: 'block',
        }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="scenerySky" x1="0%" y1="0%" x2="0%" y2="100%">
            {isDay ? (
              <>
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="30%" stopColor="#60a5fa" />
                <stop offset="60%" stopColor="#93c5fd" />
                <stop offset="85%" stopColor="#bfdbfe" />
                <stop offset="100%" stopColor="#e0f2fe" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#061325" />
                <stop offset="30%" stopColor="#0a2246" />
                <stop offset="60%" stopColor="#113872" />
                <stop offset="85%" stopColor="#174f9d" />
                <stop offset="100%" stopColor="#1d63c6" />
              </>
            )}
          </linearGradient>

          <linearGradient id="mountainFar" x1="0%" y1="0%" x2="0%" y2="100%">
            {isDay ? (
              <>
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.95" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#183c72" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0a1e3b" stopOpacity="0.95" />
              </>
            )}
          </linearGradient>

          <linearGradient id="mountainMid" x1="0%" y1="0%" x2="0%" y2="100%">
            {isDay ? (
              <>
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#047857" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#1c4889" />
                <stop offset="100%" stopColor="#081834" />
              </>
            )}
          </linearGradient>

          <linearGradient id="hillsNear" x1="0%" y1="0%" x2="0%" y2="100%">
            {isDay ? (
              <>
                <stop offset="0%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#14532d" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#123060" />
                <stop offset="100%" stopColor="#040e20" />
              </>
            )}
          </linearGradient>

          <linearGradient id="viaductGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            {isDay ? (
              <>
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="50%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#334155" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#1d427d" />
                <stop offset="50%" stopColor="#112952" />
                <stop offset="100%" stopColor="#061226" />
              </>
            )}
          </linearGradient>

          <linearGradient id="trainBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#f8fafc" />
            <stop offset="75%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          <linearGradient id="trainStripeBlue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id="trainStripeOrange" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          <linearGradient id="windowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            {isDay ? (
              <>
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#38bdf8" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#fde047" />
              </>
            )}
          </linearGradient>

          <linearGradient id="windshieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="45%" stopColor="#38bdf8" />
            <stop offset="85%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>

          <linearGradient id="lightBeamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity={isDay ? "0.45" : "0.85"} />
            <stop offset="25%" stopColor="#facc15" stopOpacity={isDay ? "0.2" : "0.45"} />
            <stop offset="70%" stopColor="#60a5fa" stopOpacity={isDay ? "0.08" : "0.15"} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="railSilver" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="40%" stopColor="#ffffff" />
            <stop offset="80%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#dbeafe" stopOpacity="0.6" />
            <stop offset="65%" stopColor="#93c5fd" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbeb" stopOpacity="1" />
            <stop offset="35%" stopColor="#fef08a" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#facc15" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Starry Night Sky (Night Only) */}
        {!isDay && (
          <g opacity="0.8">
            <circle cx="95" cy="90" r="1.5" fill="#ffffff" className="rh-anim-star-1" />
            <circle cx="170" cy="55" r="1.2" fill="#dbeafe" className="rh-anim-star-2" />
            <circle cx="280" cy="110" r="2" fill="#ffffff" className="rh-anim-star-3" />
            <circle cx="390" cy="45" r="1.4" fill="#bfdbfe" className="rh-anim-star-1" />
            <circle cx="510" cy="80" r="1.6" fill="#ffffff" className="rh-anim-star-2" />
            <circle cx="670" cy="60" r="1.8" fill="#dbeafe" className="rh-anim-star-3" />
            <circle cx="830" cy="95" r="1.3" fill="#ffffff" className="rh-anim-star-1" />
            <circle cx="980" cy="50" r="2.2" fill="#dbeafe" className="rh-anim-star-2" />
            <circle cx="1120" cy="85" r="1.5" fill="#ffffff" className="rh-anim-star-3" />
            <circle cx="1260" cy="40" r="1.3" fill="#bfdbfe" className="rh-anim-star-1" />
            <circle cx="1360" cy="75" r="1.7" fill="#ffffff" className="rh-anim-star-2" />

            {/* Star Cluster Constellation */}
            <path d="M1210 65 L1218 80 L1235 84 L1222 95 L1226 112 L1210 102" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" strokeDasharray="3,3" />
          </g>
        )}

        {/* 2. Celestial Body: Luminous Moon (Night) OR Radiant Golden Sun (Day) */}
        {!isDay ? (
          <g transform={isMobile ? "translate(790, 45)" : "translate(1220, 45)"} opacity="0.9">
            <circle cx="28" cy="28" r="42" fill="url(#moonGlow)" />
            <circle cx="28" cy="28" r="20" fill="#f8fafc" />
            <circle cx="35" cy="23" r="18" fill="#0c234a" />
          </g>
        ) : (
          <g transform={isMobile ? "translate(780, 40)" : "translate(1180, 40)"}>
            <circle cx="36" cy="36" r="62" fill="url(#sunGlow)" />
            <circle cx="36" cy="36" r="26" fill="#fbbf24" />
            <circle cx="36" cy="36" r="20" fill="#fffbeb" />
            <g className="rh-anim-sun-rays" stroke="#fde047" strokeWidth="2.5" opacity="0.75" strokeLinecap="round">
              <line x1="36" y1="-8" x2="36" y2="4" />
              <line x1="36" y1="68" x2="36" y2="80" />
              <line x1="-8" y1="36" x2="4" y2="36" />
              <line x1="68" y1="36" x2="80" y2="36" />
              <line x1="5" y1="5" x2="14" y2="14" />
              <line x1="58" y1="58" x2="67" y2="67" />
              <line x1="5" y1="67" x2="14" y2="58" />
              <line x1="58" y1="14" x2="67" y2="5" />
            </g>
          </g>
        )}

        {/* Soaring Birds (Day Only) */}
        {isDay && (
          <g className="rh-anim-bird" stroke="#1e3a8a" strokeWidth="1.6" fill="none" opacity="0.65" strokeLinecap="round">
            <path d="M220 95 Q228 86 236 95 Q244 86 252 95" />
            <path d="M260 110 Q266 103 272 110 Q278 103 284 110" />
            <path d="M420 80 Q427 74 434 80 Q441 74 448 80" />
            <path d="M780 100 Q786 94 792 100 Q798 94 804 100" />
          </g>
        )}

        {/* 3. Floating Misty Clouds */}
        <g className="rh-anim-cloud-1" opacity={isDay ? "0.8" : "0.3"} fill={isDay ? "#ffffff" : "#93c5fd"}>
          <path d="M60 170 Q110 145 170 170 Q220 150 260 175 Q290 190 240 200 Q160 205 90 195 Z" />
          <path d="M680 150 Q730 125 790 150 Q840 135 880 158 Q900 175 850 182 Q780 185 710 178 Z" />
        </g>
        <g className="rh-anim-cloud-2" opacity={isDay ? "0.65" : "0.22"} fill={isDay ? "#ffffff" : "#60a5fa"}>
          <path d="M340 185 Q390 160 450 185 Q500 168 540 190 Q560 205 510 212 Q440 215 370 208 Z" />
          <path d="M1040 165 Q1090 145 1150 165 Q1190 152 1230 172 Q1250 188 1200 194 Q1130 198 1070 190 Z" />
        </g>

        {/* 4. Layer 1: Majestic Mountain Peaks (Far Range) */}
        <path
          d="M0 480 L0 360 Q90 320 180 280 Q260 240 330 310 Q420 260 510 200 Q590 260 690 315 Q790 250 890 190 Q980 260 1080 290 Q1180 220 1280 170 Q1370 240 1440 290 L1440 480 Z"
          fill="url(#mountainFar)"
        />

        {/* Crisp Peak Snow / Ridge Highlights */}
        <path d="M510 200 L492 230 Q510 220 532 232 Z" fill="rgba(255,255,255,0.22)" />
        <path d="M890 190 L870 222 Q890 212 914 224 Z" fill="rgba(255,255,255,0.25)" />
        <path d="M1280 170 L1258 205 Q1280 195 1305 208 Z" fill="rgba(255,255,255,0.28)" />

        {/* 5. Layer 2: Mid-Range Rolling Hills & Forest Silhouettes */}
        <path
          d="M0 520 L0 410 Q140 370 280 420 Q420 360 560 400 Q700 350 840 390 Q980 340 1120 380 Q1260 345 1440 390 L1440 520 Z"
          fill="url(#mountainMid)"
        />

        {/* Tree Silhouettes on Ridges */}
        <g fill={isDay ? "#065f46" : "#0e244d"} opacity={isDay ? "0.75" : "0.6"}>
          <path d="M140 395 L144 380 L148 395 M152 393 L156 375 L160 393 M164 396 L168 384 L172 396" stroke={isDay ? "#065f46" : "#0e244d"} strokeWidth="2" />
          <path d="M440 382 L444 368 L448 382 M452 380 L456 364 L460 380 M464 383 L468 371 L472 383" stroke={isDay ? "#065f46" : "#0e244d"} strokeWidth="2" />
          <path d="M960 362 L964 348 L968 362 M972 360 L976 344 L980 360 M984 363 L988 351 L992 363" stroke={isDay ? "#065f46" : "#0e244d"} strokeWidth="2" />
          <path d="M1300 365 L1304 350 L1308 365 M1312 363 L1316 347 L1320 363 M1324 366 L1328 354 L1332 366" stroke={isDay ? "#065f46" : "#0e244d"} strokeWidth="2" />
        </g>

        {/* High Elevation Railway Signal Mast (Sinyal Hijau) */}
        <g transform="translate(680, 340)" className="rh-anim-signal">
          <line x1="0" y1="0" x2="0" y2="40" stroke="#475569" strokeWidth="2.5" />
          <circle cx="0" cy="5" r="4.5" fill="#22c55e" />
          <circle cx="0" cy="5" r="2" fill="#ffffff" />
        </g>

        {/* 6. Layer 3: Near Hills & Valley Base */}
        <path
          d="M-300 1400 L-300 470 Q200 450 400 480 Q600 445 800 470 Q1000 440 1200 465 Q1340 450 1740 470 L1740 1400 Z"
          fill="url(#hillsNear)"
        />

        {/* 7. Scenic Curved Railway Viaduct (Jembatan Viaduk Kereta Api) */}
        <g id="railViaduct">
          {/* Solid Bridge Deck */}
          <path
            d="M0 500 Q360 490 720 492 Q1080 490 1440 500 L1440 522 Q1080 512 720 514 Q360 512 0 522 Z"
            fill="url(#viaductGrad)"
          />

          {/* Viaduct Arch Piers */}
          <g fill={isDay ? "#475569" : "#07152b"} opacity="0.95">
            <path d="M60 518 L60 605 Q115 560 170 605 L170 518 Z" />
            <path d="M210 516 L210 605 Q265 560 320 605 L320 516 Z" />
            <path d="M360 515 L360 605 Q415 558 470 605 L470 515 Z" />
            <path d="M510 514 L510 605 Q565 556 620 605 L620 514 Z" />
            <path d="M660 514 L660 605 Q715 556 770 605 L770 514 Z" />
            <path d="M810 514 L810 605 Q865 556 920 605 L920 514 Z" />
            <path d="M960 515 L960 605 Q1015 558 1070 605 L1070 515 Z" />
            <path d="M1110 516 L1110 605 Q1165 560 1220 605 L1220 516 Z" />
            <path d="M1260 518 L1260 605 Q1315 560 1370 605 L1370 518 Z" />
          </g>

          {/* Safety Balustrade Railing */}
          <line x1="0" y1="497" x2="1440" y2="497" stroke={isDay ? "rgba(255, 255, 255, 0.7)" : "rgba(147, 197, 253, 0.4)"} strokeWidth="1.6" />
        </g>

        {/* 8. Electrification Catenary Masts & Power Lines */}
        <g id="catenaryWires" stroke={isDay ? "rgba(100, 116, 139, 0.6)" : "rgba(191, 219, 254, 0.5)"} strokeWidth="1">
          {/* Messenger & Contact wires */}
          <path d="M0 442 Q360 432 720 434 Q1080 432 1440 442" fill="none" strokeWidth="0.9" />
          <path d="M0 460 Q360 450 720 452 Q1080 450 1440 460" fill="none" strokeWidth="1.3" stroke={isDay ? "rgba(71, 85, 105, 0.8)" : "rgba(224, 242, 254, 0.65)"} />

          {/* Droppers */}
          <line x1="160" y1="440" x2="160" y2="457" strokeWidth="0.7" />
          <line x1="300" y1="437" x2="300" y2="454" strokeWidth="0.7" />
          <line x1="440" y1="435" x2="440" y2="452" strokeWidth="0.7" />
          <line x1="580" y1="434" x2="580" y2="451" strokeWidth="0.7" />
          <line x1="720" y1="435" x2="720" y2="452" strokeWidth="0.7" />
          <line x1="860" y1="434" x2="860" y2="451" strokeWidth="0.7" />
          <line x1="1000" y1="435" x2="1000" y2="452" strokeWidth="0.7" />
          <line x1="1140" y1="437" x2="1140" y2="454" strokeWidth="0.7" />
          <line x1="1280" y1="440" x2="1280" y2="457" strokeWidth="0.7" />

          {/* Steel Electrification Masts */}
          <g stroke={isDay ? "#1e40af" : "#1d4ed8"} strokeWidth="2.6" strokeLinecap="round">
            <line x1="110" y1="425" x2="110" y2="506" />
            <line x1="100" y1="430" x2="126" y2="430" strokeWidth="2" stroke={isDay ? "#3b82f6" : "#60a5fa"} />
            <line x1="380" y1="420" x2="380" y2="502" />
            <line x1="370" y1="425" x2="396" y2="425" strokeWidth="2" stroke={isDay ? "#3b82f6" : "#60a5fa"} />
            <line x1="650" y1="418" x2="650" y2="500" />
            <line x1="640" y1="423" x2="666" y2="423" strokeWidth="2" stroke={isDay ? "#3b82f6" : "#60a5fa"} />
            <line x1="920" y1="418" x2="920" y2="500" />
            <line x1="910" y1="423" x2="936" y2="423" strokeWidth="2" stroke={isDay ? "#3b82f6" : "#60a5fa"} />
            <line x1="1190" y1="420" x2="1190" y2="502" />
            <line x1="1180" y1="425" x2="1206" y2="425" strokeWidth="2" stroke={isDay ? "#3b82f6" : "#60a5fa"} />
          </g>
        </g>

        {/* 9. Modern Streamlined High-Speed Express Train */}
        <g id="railhubExpressTrain" className="rh-anim-express-train" transform="translate(140, 48)">
          {/* Luminous Headlight Beam illuminating the track */}
          <polygon
            points="725,432 1180,410 1200,470 725,444"
            fill="url(#lightBeamGrad)"
            className="rh-anim-headlight"
          />

          {/* Rear Passenger Car */}
          <g id="carRear">
            <rect x="20" y="420" width="145" height="26" rx="5" fill="url(#trainBodyGrad)" />
            <rect x="20" y="430" width="145" height="4.5" fill="url(#trainStripeBlue)" />
            <rect x="20" y="435" width="145" height="2.5" fill="url(#trainStripeOrange)" />
            {/* Passenger windows */}
            <rect x="32" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="52" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="72" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="92" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="112" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="132" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            {/* Red rear tail marker light */}
            <circle cx="23" cy="433" r="2.5" fill="#ef4444" />
            {/* Wheels / Bogies */}
            <rect x="34" y="446" width="30" height="4.5" rx="2" fill="#0f172a" />
            <rect x="118" y="446" width="30" height="4.5" rx="2" fill="#0f172a" />
            <circle cx="41" cy="450" r="4" fill="#334155" />
            <circle cx="57" cy="450" r="4" fill="#334155" />
            <circle cx="125" cy="450" r="4" fill="#334155" />
            <circle cx="141" cy="450" r="4" fill="#334155" />
          </g>

          {/* Flexible Gangway Coupler */}
          <rect x="165" y="424" width="9" height="20" rx="1.5" fill="#1e293b" />

          {/* Mid Dining / Executive Coach */}
          <g id="carMid">
            <rect x="174" y="420" width="150" height="26" rx="5" fill="url(#trainBodyGrad)" />
            <rect x="174" y="430" width="150" height="4.5" fill="url(#trainStripeBlue)" />
            <rect x="174" y="435" width="150" height="2.5" fill="url(#trainStripeOrange)" />
            {/* Windows */}
            <rect x="186" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="206" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="226" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="246" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="266" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="286" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="306" y="422" width="10" height="7" rx="2" fill="url(#windowGlow)" />
            {/* Roof Air Conditioner hump */}
            <rect x="210" y="417" width="75" height="3" rx="1.5" fill="#cbd5e1" />
            {/* Wheels / Bogies */}
            <rect x="188" y="446" width="30" height="4.5" rx="2" fill="#0f172a" />
            <rect x="280" y="446" width="30" height="4.5" rx="2" fill="#0f172a" />
            <circle cx="195" cy="450" r="4" fill="#334155" />
            <circle cx="211" cy="450" r="4" fill="#334155" />
            <circle cx="287" cy="450" r="4" fill="#334155" />
            <circle cx="303" cy="450" r="4" fill="#334155" />
          </g>

          {/* Flexible Gangway Coupler */}
          <rect x="324" y="424" width="9" height="20" rx="1.5" fill="#1e293b" />

          {/* Second Passenger / Business Coach with Pantograph */}
          <g id="carPantograph">
            <rect x="333" y="420" width="150" height="26" rx="5" fill="url(#trainBodyGrad)" />
            <rect x="333" y="430" width="150" height="4.5" fill="url(#trainStripeBlue)" />
            <rect x="333" y="435" width="150" height="2.5" fill="url(#trainStripeOrange)" />
            {/* Windows */}
            <rect x="345" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="365" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="385" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="405" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="425" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="445" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="465" y="422" width="10" height="7" rx="2" fill="url(#windowGlow)" />
            {/* High-speed Single-Arm Pantograph touching catenary contact wire */}
            <g stroke={isDay ? "#0284c7" : "#38bdf8"} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="395" y1="420" x2="410" y2="408" />
              <line x1="410" y1="408" x2="425" y2="395" />
              <line x1="415" y1="395" x2="435" y2="395" strokeWidth="2.4" stroke={isDay ? "#f97316" : "#fb923c"} />
            </g>
            {/* Blue spark on overhead contact */}
            <circle cx="425" cy="395" r="3.5" fill="#67e8f9" className="rh-anim-spark" />
            {/* Wheels / Bogies */}
            <rect x="347" y="446" width="30" height="4.5" rx="2" fill="#0f172a" />
            <rect x="439" y="446" width="30" height="4.5" rx="2" fill="#0f172a" />
            <circle cx="354" cy="450" r="4" fill="#334155" />
            <circle cx="370" cy="450" r="4" fill="#334155" />
            <circle cx="446" cy="450" r="4" fill="#334155" />
            <circle cx="462" cy="450" r="4" fill="#334155" />
          </g>

          {/* Flexible Gangway Coupler */}
          <rect x="483" y="424" width="9" height="20" rx="1.5" fill="#1e293b" />

          {/* Lead Aerodynamic Bullet Locomotive */}
          <g id="locoLead">
            {/* Sleek Bullet Nose Profile */}
            <path
              d="M492 420 H660 Q700 422 725 436 Q732 440 735 444 L732 446 H492 Z"
              fill="url(#trainBodyGrad)"
            />
            {/* Dynamic Swept Livery Stripes */}
            <path
              d="M492 430 H655 Q690 432 715 440 L710 444.5 H492 Z"
              fill="url(#trainStripeBlue)"
            />
            <path
              d="M492 435 H650 Q680 436 705 442.5 L702 445 H492 Z"
              fill="url(#trainStripeOrange)"
            />
            {/* Passenger windows */}
            <rect x="504" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="524" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="544" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="564" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="584" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="604" y="422" width="15" height="7" rx="2" fill="url(#windowGlow)" />
            {/* Aerodynamic Cockpit Windshield */}
            <path
              d="M665 423 L700 431 Q704 433 695 436 L660 434 Z"
              fill="url(#windshieldGrad)"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="0.8"
            />
            {/* Twin High-Intensity LED Headlights */}
            <circle cx="726" cy="438" r="3.2" fill="#fef08a" className="rh-anim-headlight" />
            <circle cx="729" cy="442" r="3" fill="#ffffff" className="rh-anim-headlight" />
            <circle cx="726" cy="438" r="1.5" fill="#ffffff" />
            {/* Wheels / Bogies */}
            <rect x="506" y="446" width="30" height="4.5" rx="2" fill="#0f172a" />
            <rect x="635" y="446" width="35" height="4.5" rx="2" fill="#0f172a" />
            <circle cx="513" cy="450" r="4" fill="#334155" />
            <circle cx="529" cy="450" r="4" fill="#334155" />
            <circle cx="643" cy="450" r="4" fill="#334155" />
            <circle cx="661" cy="450" r="4" fill="#334155" />
          </g>

          {/* Aerodynamic High Speed Trails */}
          <g stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.2" className="rh-anim-speedline">
            <line x1="740" y1="438" x2="840" y2="438" />
            <line x1="735" y1="443" x2="815" y2="443" />
            <line x1="720" y1="447" x2="860" y2="447" strokeWidth="1.6" stroke={isDay ? "rgba(2, 132, 199, 0.5)" : "rgba(56, 189, 248, 0.55)"} />
          </g>
        </g>

        {/* 10. Railway Track Ballast, Sleepers & Steel Rails */}
        <g id="railwayTracks">
          {/* Granite Crushed Stone Ballast */}
          <path
            d="M0 498 Q360 492 720 494 Q1080 492 1440 498 L1440 508 Q1080 502 720 504 Q360 502 0 508 Z"
            fill={isDay ? "#64748b" : "#1e293b"}
            opacity="0.9"
          />

          {/* Railway Sleepers / Bantalan Rel */}
          <g stroke={isDay ? "#475569" : "#334155"} strokeWidth="2.8" opacity="0.95">
            {Array.from({ length: 48 }).map((_, i) => {
              const x = i * 31 + 6
              return <line key={i} x1={x} y1="495" x2={x + 3} y2="504" />
            })}
          </g>

          {/* Twin Steel Rails */}
          <path
            d="M0 496 Q360 490 720 492 Q1080 490 1440 496"
            fill="none"
            stroke="url(#railSilver)"
            strokeWidth="2.4"
          />
          <path
            d="M0 501 Q360 495 720 497 Q1080 495 1440 501"
            fill="none"
            stroke="url(#railSilver)"
            strokeWidth="2"
            opacity="0.9"
          />
        </g>

        {/* 11. Anchoring Bottom Gradient Bed */}
        <rect
          x="-600"
          y="560"
          width="2640"
          height="1400"
          fill="url(#hillsNear)"
          opacity="1"
        />
      </svg>
    </div>
  )
}
