'use client'

import React from 'react'

export default function TrainSceneryVector() {
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

        .rh-anim-star-1 { animation: rhStarTwinkle 3s ease-in-out infinite; }
        .rh-anim-star-2 { animation: rhStarTwinkle 4.2s ease-in-out 1s infinite; }
        .rh-anim-star-3 { animation: rhStarTwinkle 3.6s ease-in-out 2s infinite; }
        .rh-anim-cloud-1 { animation: rhCloudDrift 32s ease-in-out infinite; }
        .rh-anim-cloud-2 { animation: rhCloudDriftReverse 40s ease-in-out infinite; }
        .rh-anim-headlight { animation: rhHeadlightPulse 2.4s ease-in-out infinite; }
        .rh-anim-signal { animation: rhSignalGlow 2.5s ease-in-out infinite; }
        .rh-anim-spark { animation: rhSparkGlow 1.8s ease-in-out infinite; }
        .rh-anim-speedline { animation: rhSpeedLine 3s linear infinite; stroke-dasharray: 20, 10; }
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
          background: 'radial-gradient(ellipse at 50% 20%, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.1) 45%, transparent 70%)',
          filter: 'blur(35px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 320,
          background: 'radial-gradient(ellipse at 50% 100%, rgba(29, 78, 216, 0.35) 0%, rgba(10, 25, 47, 0) 75%)',
          filter: 'blur(25px)',
        }}
      />

      {/* Panoramic Vector Canvas */}
      <svg
        viewBox="0 0 1440 680"
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
            <stop offset="0%" stopColor="#061325" />
            <stop offset="30%" stopColor="#0a2246" />
            <stop offset="60%" stopColor="#113872" />
            <stop offset="85%" stopColor="#174f9d" />
            <stop offset="100%" stopColor="#1d63c6" />
          </linearGradient>

          <linearGradient id="mountainFar" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#183c72" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0a1e3b" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="mountainMid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1c4889" />
            <stop offset="100%" stopColor="#081834" />
          </linearGradient>

          <linearGradient id="hillsNear" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#123060" />
            <stop offset="100%" stopColor="#040e20" />
          </linearGradient>

          <linearGradient id="viaductGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1d427d" />
            <stop offset="50%" stopColor="#112952" />
            <stop offset="100%" stopColor="#061226" />
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
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>

          <linearGradient id="windshieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="45%" stopColor="#38bdf8" />
            <stop offset="85%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>

          <linearGradient id="lightBeamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
            <stop offset="25%" stopColor="#facc15" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.15" />
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
        </defs>

        {/* 1. Starry Night Sky Elements */}
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

        {/* 2. Luminous Travel Moon */}
        <g transform="translate(1220, 45)" opacity="0.9">
          <circle cx="28" cy="28" r="42" fill="url(#moonGlow)" />
          <circle cx="28" cy="28" r="20" fill="#f8fafc" />
          <circle cx="35" cy="23" r="18" fill="#0c234a" />
        </g>

        {/* 3. Floating Misty Clouds */}
        <g className="rh-anim-cloud-1" opacity="0.3" fill="#93c5fd">
          <path d="M60 170 Q110 145 170 170 Q220 150 260 175 Q290 190 240 200 Q160 205 90 195 Z" />
          <path d="M680 150 Q730 125 790 150 Q840 135 880 158 Q900 175 850 182 Q780 185 710 178 Z" />
        </g>
        <g className="rh-anim-cloud-2" opacity="0.22" fill="#60a5fa">
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
        <g fill="#0e244d" opacity="0.6">
          <path d="M140 395 L144 380 L148 395 M152 393 L156 375 L160 393 M164 396 L168 384 L172 396" stroke="#0e244d" strokeWidth="2" />
          <path d="M440 382 L444 368 L448 382 M452 380 L456 364 L460 380 M464 383 L468 371 L472 383" stroke="#0e244d" strokeWidth="2" />
          <path d="M960 362 L964 348 L968 362 M972 360 L976 344 L980 360 M984 363 L988 351 L992 363" stroke="#0e244d" strokeWidth="2" />
          <path d="M1300 365 L1304 350 L1308 365 M1312 363 L1316 347 L1320 363 M1324 366 L1328 354 L1332 366" stroke="#0e244d" strokeWidth="2" />
        </g>

        {/* High Elevation Railway Signal Mast (Sinyal Hijau) */}
        <g transform="translate(680, 340)" className="rh-anim-signal">
          <line x1="0" y1="0" x2="0" y2="40" stroke="#475569" strokeWidth="2.5" />
          <circle cx="0" cy="5" r="4.5" fill="#22c55e" />
          <circle cx="0" cy="5" r="2" fill="#ffffff" />
        </g>

        {/* 6. Layer 3: Near Hills & Valley Base */}
        <path
          d="M0 580 L0 470 Q200 450 400 480 Q600 445 800 470 Q1000 440 1200 465 Q1340 450 1440 470 L1440 580 Z"
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
          <g fill="#07152b" opacity="0.95">
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
          <line x1="0" y1="497" x2="1440" y2="497" stroke="rgba(147, 197, 253, 0.4)" strokeWidth="1.6" />
        </g>

        {/* 8. Electrification Catenary Masts & Power Lines */}
        <g id="catenaryWires" stroke="rgba(191, 219, 254, 0.5)" strokeWidth="1">
          {/* Messenger & Contact wires */}
          <path d="M0 442 Q360 432 720 434 Q1080 432 1440 442" fill="none" strokeWidth="0.9" />
          <path d="M0 460 Q360 450 720 452 Q1080 450 1440 460" fill="none" strokeWidth="1.3" stroke="rgba(224, 242, 254, 0.65)" />

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
          <g stroke="#1d4ed8" strokeWidth="2.6" strokeLinecap="round">
            <line x1="110" y1="425" x2="110" y2="506" />
            <line x1="100" y1="430" x2="126" y2="430" strokeWidth="2" stroke="#60a5fa" />
            <line x1="380" y1="420" x2="380" y2="502" />
            <line x1="370" y1="425" x2="396" y2="425" strokeWidth="2" stroke="#60a5fa" />
            <line x1="650" y1="418" x2="650" y2="500" />
            <line x1="640" y1="423" x2="666" y2="423" strokeWidth="2" stroke="#60a5fa" />
            <line x1="920" y1="418" x2="920" y2="500" />
            <line x1="910" y1="423" x2="936" y2="423" strokeWidth="2" stroke="#60a5fa" />
            <line x1="1190" y1="420" x2="1190" y2="502" />
            <line x1="1180" y1="425" x2="1206" y2="425" strokeWidth="2" stroke="#60a5fa" />
          </g>
        </g>

        {/* 9. Modern Streamlined High-Speed Express Train */}
        <g id="railhubExpressTrain" transform="translate(140, 48)">
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
            {/* Passenger windows glowing warm yellow */}
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
            <rect x="174" y="420" width="155" height="26" rx="5" fill="url(#trainBodyGrad)" />
            <rect x="174" y="430" width="155" height="4.5" fill="url(#trainStripeBlue)" />
            <rect x="174" y="435" width="155" height="2.5" fill="url(#trainStripeOrange)" />
            {/* Windows */}
            <rect x="188" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="210" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="232" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="254" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="276" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="298" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />
            {/* Roof Pantograph with subtle spark */}
            <path d="M242 420 L256 408 L270 420 M250 408 L274 408" stroke="#94a3b8" strokeWidth="1.8" fill="none" />
            <line x1="246" y1="408" x2="278" y2="408" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx="262" cy="408" r="3" fill="#67e8f9" className="rh-anim-spark" />
            {/* Wheels */}
            <rect x="188" y="446" width="30" height="4.5" rx="2" fill="#0f172a" />
            <rect x="282" y="446" width="30" height="4.5" rx="2" fill="#0f172a" />
            <circle cx="195" cy="450" r="4" fill="#334155" />
            <circle cx="211" cy="450" r="4" fill="#334155" />
            <circle cx="289" cy="450" r="4" fill="#334155" />
            <circle cx="305" cy="450" r="4" fill="#334155" />
          </g>

          {/* Flexible Gangway Coupler */}
          <rect x="329" y="424" width="9" height="20" rx="1.5" fill="#1e293b" />

          {/* Second Mid Coach */}
          <g id="carMid2">
            <rect x="338" y="420" width="155" height="26" rx="5" fill="url(#trainBodyGrad)" />
            <rect x="338" y="430" width="155" height="4.5" fill="url(#trainStripeBlue)" />
            <rect x="338" y="435" width="155" height="2.5" fill="url(#trainStripeOrange)" />
            <rect x="352" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="374" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="396" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="418" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="440" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="462" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />
            {/* Wheels */}
            <rect x="352" y="446" width="30" height="4.5" rx="2" fill="#0f172a" />
            <rect x="446" y="446" width="30" height="4.5" rx="2" fill="#0f172a" />
            <circle cx="359" cy="450" r="4" fill="#334155" />
            <circle cx="375" cy="450" r="4" fill="#334155" />
            <circle cx="453" cy="450" r="4" fill="#334155" />
            <circle cx="469" cy="450" r="4" fill="#334155" />
          </g>

          {/* Flexible Gangway Coupler */}
          <rect x="493" y="424" width="9" height="20" rx="1.5" fill="#1e293b" />

          {/* Aerodynamic Locomotive / Lead Car */}
          <g id="carLead">
            {/* Streamlined Bullet Nose Body */}
            <path
              d="M502 420 L640 420 Q680 420 705 429 Q730 439 746 446 L502 446 Z"
              fill="url(#trainBodyGrad)"
            />
            {/* Blue Speed Livery */}
            <path
              d="M502 430 L640 430 Q675 430 698 436 Q718 442 735 446 L724 446 Q708 441 692 437 Q670 433 640 433 L502 433 Z"
              fill="url(#trainStripeBlue)"
            />
            {/* Dynamic Orange Speed Livery */}
            <path
              d="M502 435 L640 435 Q670 435 690 439 Q705 443 718 446 L707 446 Q695 442 682 439 Q665 436 640 436 L502 436 Z"
              fill="url(#trainStripeOrange)"
            />

            {/* Aerodynamic Cockpit Windshield */}
            <path
              d="M648 422 L680 422 Q700 424 712 430 L654 430 Z"
              fill="url(#windshieldGrad)"
            />

            {/* Passenger Windows */}
            <rect x="516" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="538" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="560" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="582" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />
            <rect x="604" y="422" width="16" height="7" rx="2" fill="url(#windowGlow)" />

            {/* Bright Dual LED Headlights */}
            <ellipse cx="740" cy="442" rx="4" ry="3" fill="#fef08a" className="rh-anim-headlight" />
            <ellipse cx="740" cy="442" rx="1.8" ry="1.5" fill="#ffffff" />
            <circle cx="724" cy="433" r="2.2" fill="#fef08a" />

            {/* Wheels */}
            <rect x="518" y="446" width="30" height="4.5" rx="2" fill="#0f172a" />
            <rect x="626" y="446" width="30" height="4.5" rx="2" fill="#0f172a" />
            <circle cx="525" cy="450" r="4" fill="#334155" />
            <circle cx="541" cy="450" r="4" fill="#334155" />
            <circle cx="633" cy="450" r="4" fill="#334155" />
            <circle cx="649" cy="450" r="4" fill="#334155" />

            {/* Aerodynamic Speed Lines */}
            <g stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round">
              <line x1="755" y1="438" x2="790" y2="438" className="rh-anim-speedline" />
              <line x1="748" y1="445" x2="775" y2="445" className="rh-anim-speedline" />
              <line x1="720" y1="422" x2="748" y2="422" className="rh-anim-speedline" />
            </g>
          </g>
        </g>

        {/* 10. Foreground Twin Steel Rails & Sleepers */}
        <g id="foregroundTracks">
          {/* Ballast Bed */}
          <path
            d="M0 498 Q360 492 720 494 Q1080 492 1440 498 L1440 512 Q1080 506 720 508 Q360 506 0 512 Z"
            fill="#1e293b"
            opacity="0.9"
          />

          {/* Railway Sleepers / Bantalan Rel */}
          <g stroke="#334155" strokeWidth="2.8" opacity="0.95">
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
          x="0"
          y="580"
          width="1440"
          height="100"
          fill="url(#hillsNear)"
          opacity="0.98"
        />
      </svg>
    </div>
  )
}
