'use client'

import { useState } from 'react'
import { Wifi, Copy, Check, ShieldCheck, Zap, Signal, Info, Smartphone } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TrainWifiHub({ trainName = 'RailHub Express' }) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'guide'

  const wifiSsid = `RAILHUB-EXPRESS-5G (${trainName.replace(/\s*\(simulasi\)\s*/i, '')})`
  const wifiPassword = 'KERETAAMAN2026'

  async function handleCopyPassword() {
    try {
      await navigator.clipboard.writeText(wifiPassword)
      setCopied(true)
      toast.success('Password Wi-Fi berhasil disalin ke clipboard!', {
        style: { borderRadius: '10px', background: '#0f172a', color: '#fff' }
      })
      setTimeout(() => setCopied(false), 3000)
    } catch {
      toast.error('Gagal menyalin, password: ' + wifiPassword)
    }
  }

  return (
    <div className="rh-card rh-wifi-hub-card" style={{
      background: 'linear-gradient(135deg, #0b192e 0%, #0f2b54 60%, #153e78 100%)',
      color: '#ffffff',
      borderRadius: '20px',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 12px 36px rgba(5, 17, 36, 0.35)',
    }}>
      {/* Decorative ambient glowing radar orb */}
      <div style={{
        position: 'absolute',
        top: -40,
        right: -40,
        width: 160,
        height: 160,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(56, 189, 248, 0.18)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            display: 'grid',
            placeItems: 'center',
            color: '#38bdf8',
            flexShrink: 0,
          }}>
            <Wifi size={24} className="animate-pulse" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
                display: 'inline-block'
              }} />
              <strong style={{ fontSize: '1.05rem', letterSpacing: '-0.01em', color: '#ffffff' }}>
                Wi-Fi Kabin Kereta Aktif
              </strong>
            </div>
            <small style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.78rem' }}>
              Didukung Satelit Starlink RailNet · Gratis di Semua Gerbong
            </small>
          </div>
        </div>

        {/* Speed Badge */}
        <div style={{
          padding: '0.35rem 0.75rem',
          borderRadius: 999,
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#38bdf8',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0,
        }}>
          <Zap size={13} />
          <span>85 Mbps</span>
        </div>
      </div>

      {/* Network Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: '0.85rem',
        marginBottom: '1.25rem',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* SSID Box */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.28)',
          borderRadius: 14,
          padding: '0.85rem 1rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>
            Nama Jaringan (SSID)
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Signal size={15} style={{ color: '#38bdf8', flexShrink: 0 }} />
            <strong style={{ fontSize: '0.88rem', color: '#ffffff', wordBreak: 'break-all' }}>
              {wifiSsid}
            </strong>
          </div>
        </div>

        {/* Password Box with 1-Click Copy */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          borderRadius: 14,
          padding: '0.85rem 1rem',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>
              Password Wi-Fi
            </span>
            <strong style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '1.1rem',
              color: '#facc15',
              letterSpacing: '0.08em'
            }}>
              {wifiPassword}
            </strong>
          </div>

          <button
            type="button"
            onClick={handleCopyPassword}
            className="rh-btn rh-btn-sm"
            style={{
              background: copied ? '#10b981' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 0.85rem',
              borderRadius: 10,
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.15s ease',
            }}
            title="Salin password ke clipboard"
          >
            {copied ? (
              <>
                <Check size={14} strokeWidth={3} />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Perks & Guide Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        fontSize: '0.78rem',
        color: 'rgba(255, 255, 255, 0.8)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            <span>Enkripsi WPA3 Aman</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Zap size={14} style={{ color: '#facc15' }} />
            <span>Streaming Netflix/YouTube OK</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab(t => t === 'guide' ? 'info' : 'guide')}
          style={{
            background: 'none',
            border: 'none',
            color: '#38bdf8',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.78rem',
            textDecoration: 'underline',
          }}
        >
          {activeTab === 'guide' ? 'Tutup Panduan' : 'Cara Konek Wi-Fi?'}
        </button>
      </div>

      {/* Expandable 3-step connection guide */}
      {activeTab === 'guide' && (
        <div style={{
          marginTop: '0.85rem',
          padding: '0.85rem 1rem',
          borderRadius: 12,
          background: 'rgba(0, 0, 0, 0.35)',
          fontSize: '0.8rem',
          lineHeight: 1.5,
          color: 'rgba(255, 255, 255, 0.9)',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <strong style={{ display: 'block', color: '#ffffff', marginBottom: '0.35rem' }}>
            <Smartphone size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} /> 3 Langkah Mudah Terhubung:
          </strong>
          <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'grid', gap: '0.25rem' }}>
            <li>Buka pengaturan Wi-Fi di ponsel atau laptop Anda.</li>
            <li>Pilih nama SSID: <code style={{ color: '#38bdf8', background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 4 }}>{wifiSsid}</code></li>
            <li>Masukkan password <code style={{ color: '#facc15', background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 4 }}>{wifiPassword}</code> (klik tombol &quot;Salin&quot; di atas).</li>
          </ol>
        </div>
      )}
    </div>
  )
}

