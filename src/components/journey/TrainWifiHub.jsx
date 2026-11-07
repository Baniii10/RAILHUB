'use client'

import { useState } from 'react'
import { Wifi, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TrainWifiHub({ trainName = 'RailHub Express' }) {
  const [copied, setCopied] = useState(false)
  const wifiSsid = `RAILHUB-EXPRESS-5G`
  const wifiPassword = 'KERETAAMAN2026'

  async function handleCopyPassword() {
    try {
      await navigator.clipboard.writeText(wifiPassword)
      setCopied(true)
      toast.success('Password Wi-Fi tersalin!', { duration: 2000 })
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Password: ' + wifiPassword)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0b192e 0%, #0f2b54 100%)',
      borderRadius: '16px',
      padding: '0.75rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 4px 16px rgba(5, 17, 36, 0.25)',
      color: '#ffffff',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: 'rgba(56, 189, 248, 0.18)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          display: 'grid',
          placeItems: 'center',
          color: '#38bdf8',
          flexShrink: 0,
        }}>
          <Wifi size={17} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>Wi-Fi Kabin:</span>
            <code style={{ fontSize: '0.78rem', color: '#38bdf8', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 4, fontFamily: 'var(--font-mono, monospace)' }}>
              {wifiSsid}
            </code>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.7)' }}>Password:</span>
            <strong style={{ fontSize: '0.8rem', color: '#facc15', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.04em' }}>
              {wifiPassword}
            </strong>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCopyPassword}
        style={{
          background: copied ? '#10b981' : '#2563eb',
          color: '#ffffff',
          border: 'none',
          padding: '0.4rem 0.8rem',
          borderRadius: 8,
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.15s ease',
        }}
        title="Salin password ke clipboard"
      >
        {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
        <span>{copied ? 'Tersalin' : 'Salin'}</span>
      </button>
    </div>
  )
}
