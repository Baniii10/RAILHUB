'use client'

import React from 'react'

/**
 * DonutProgress - SVG circular radial gauge
 */
export function DonutProgress({
  percent = 0,
  size = 120,
  strokeWidth = 10,
  color = '#059669',
  trackColor = '#e2e8f0',
  title = '',
  subtitle = '',
}) {
  const safePercent = Math.min(100, Math.max(0, Math.round(percent || 0)))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (safePercent / 100) * circumference

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <strong style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {safePercent}%
          </strong>
        </div>
      </div>
      <div>
        {title && (
          <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0f172a', lineHeight: 1.3 }}>
            {title}
          </strong>
        )}
        {subtitle && (
          <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * HorizontalBarChart - Clean bars with percentage and values
 */
export function HorizontalBarChart({
  items = [],
  title = '',
  maxVal = null,
}) {
  const computedMax = maxVal || Math.max(...items.map((i) => i.value || 0), 1)

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
          {title}
        </div>
      )}
      <div style={{ display: 'grid', gap: '0.65rem' }}>
        {items.map((item, idx) => {
          const val = item.value || 0
          const pct = Math.min(100, Math.round((val / computedMax) * 100))
          const barColor = item.color || '#2563eb'

          return (
            <div key={idx} style={{ fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.label}</span>
                <span style={{ fontWeight: 700, color: barColor, fontVariantNumeric: 'tabular-nums' }}>
                  {item.displayValue || val}
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  width: '100%',
                  background: '#f1f5f9',
                  borderRadius: 999,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: barColor,
                    borderRadius: 999,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * SegmentedStatusBar - Multi-segment stacked bar with legend
 */
export function SegmentedStatusBar({
  segments = [],
  totalLabel = '',
  totalValue = '',
}) {
  const sum = segments.reduce((acc, s) => acc + (s.value || 0), 0) || 1

  return (
    <div style={{ width: '100%' }}>
      {(totalLabel || totalValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>{totalLabel}</span>
          <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{totalValue}</strong>
        </div>
      )}

      {/* Stacked Bar */}
      <div
        style={{
          height: 10,
          width: '100%',
          background: '#f1f5f9',
          borderRadius: 999,
          display: 'flex',
          overflow: 'hidden',
          marginBottom: '0.65rem',
        }}
      >
        {segments.map((seg, idx) => {
          const pct = Math.max(0, ((seg.value || 0) / sum) * 100)
          if (pct === 0) return null
          return (
            <div
              key={idx}
              title={`${seg.label}: ${seg.value}`}
              style={{
                height: '100%',
                width: `${pct}%`,
                background: seg.color || '#2563eb',
                transition: 'width 0.4s ease',
              }}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', fontSize: '0.75rem' }}>
        {segments.map((seg, idx) => (
          <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color || '#2563eb', flexShrink: 0 }} />
            <span style={{ color: '#475569' }}>{seg.label}:</span>
            <strong style={{ color: '#0f172a' }}>{seg.displayValue || seg.value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
