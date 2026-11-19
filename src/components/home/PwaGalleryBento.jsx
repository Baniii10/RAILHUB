'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Download,
  Smartphone,
  Check,
  Copy,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Train,
  Share2,
  PlusSquare,
  Zap
} from 'lucide-react'
import { useLang } from '@/contexts/LangContext'
import PwaPromoBumperPlayer from '@/components/home/PwaPromoBumperPlayer'

export default function PwaGalleryBento() {
  const { lang } = useLang()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedDeviceTab, setSelectedDeviceTab] = useState('android')
  const [imgErrors, setImgErrors] = useState({})

  useEffect(() => {
    // Listen for PWA install prompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Check if already in standalone PWA mode
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setInstalled(true)
        setDeferredPrompt(null)
      }
    } else {
      setShowModal(true)
    }
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.origin)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  const handleImgError = (key) => {
    setImgErrors(prev => ({ ...prev, [key]: true }))
  }

  return (
    <section className="rh-section rh-pwa-gallery-bento" style={{ background: '#f8fafc', paddingTop: '3rem', paddingBottom: '3.5rem', borderTop: '1px solid #e2e8f0' }}>
      <div className="rh-container">
        
        {/* Minimal Section Header */}
        <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto 1.75rem' }}>
          <h2 className="rh-h2" style={{ margin: 0, color: 'var(--rh-navy)', fontSize: 'clamp(1.35rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.25 }}>
            {lang === 'en' ? 'RailHub in Your Hand' : 'RailHub di Genggaman Anda'}
          </h2>
        </div>

        {/* BENTO GRID (Visual-first, minimal text) */}
        <div className="rh-bento-grid">
          
          {/* CARD 1: Light-Themed Remotion PWA Marketing Bumper (Responsive Desktop & Mobile) */}
          <div className="rh-bento-card rh-bento-card-app rh-bento-card-app-bumper">
            <div className="rh-pwa-bumper-viewport">
              <PwaPromoBumperPlayer />
            </div>

            <div className="rh-pwa-bumper-cta-bar">
              <button
                type="button"
                onClick={handleInstallClick}
                className="rh-pwa-bumper-install-btn"
                title="Pasang Aplikasi RailHub ke HP / Desktop"
              >
                <Download size={17} />
                <span>
                  {installed
                    ? (lang === 'en' ? 'Installed ✓' : 'Sudah Terpasang ✓')
                    : (lang === 'en' ? 'Install RailHub (PWA)' : 'Pasang Aplikasi (PWA)')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="rh-pwa-bumper-guide-btn"
              >
                <Smartphone size={15} />
                <span>{lang === 'en' ? 'Guide' : 'Cara Pasang'}</span>
              </button>
            </div>
          </div>

          {/* CARD 2: Large Center Train Showcase Card (matches screenshot 2 center) */}
          <div className="rh-bento-card rh-bento-card-center" style={{ backgroundColor: '#070d18' }}>
            {/* Background image / gradient fallback */}
            <div
              className="rh-bento-card-bg"
              style={{
                backgroundImage: imgErrors.hero ? 'none' : 'url("/images/gallery-train-hero.webp")',
                backgroundColor: '#070d18',
              }}
            >
              <img
                src="/images/gallery-train-hero.webp"
                alt="Kereta Api Modern Indonesia"
                style={{ display: 'none' }}
                onError={() => handleImgError('hero')}
              />
              <div className="rh-bento-card-overlay" />
            </div>

            {/* Minimal Caption Overlay so the train photo stays unobstructed */}
            <div className="rh-bento-center-content">
              <h3 className="rh-bento-title-white" style={{ margin: 0, fontSize: 'clamp(1.05rem, 2vw, 1.35rem)' }}>
                {lang === 'en'
                  ? 'Intercity Express Across Java'
                  : 'Lintas Jawa & Ekspres Modern'}
              </h3>
            </div>
          </div>

          {/* COLUMN 3: Right Stacked Cards (Top & Bottom) */}
          <div className="rh-bento-col-right">
            
            {/* CARD 3: Speeding Train Photo (Top) */}
            <div className="rh-bento-card rh-bento-card-speed" style={{ backgroundColor: '#070d18' }}>
              <div
                className="rh-bento-card-bg"
                style={{
                  backgroundImage: imgErrors.speed ? 'none' : 'url("/images/gallery-train-speed.webp")',
                  backgroundColor: '#070d18',
                }}
              >
                <img
                  src="/images/gallery-train-speed.webp"
                  alt="Laju Kereta Cepat"
                  style={{ display: 'none' }}
                  onError={() => handleImgError('speed')}
                />
                <div className="rh-bento-card-overlay-subtle" />
              </div>

              
            </div>

            {/* CARD 4: Passenger Lifestyle (Bottom) */}
            <div className="rh-bento-card rh-bento-card-passenger" style={{ backgroundColor: '#070d18' }}>
              <div
                className="rh-bento-card-bg"
                style={{
                  backgroundImage: imgErrors.passenger ? 'none' : 'url("/images/gallery-passenger-window.webp")',
                  backgroundColor: '#070d18',
                }}
              >
                <img
                  src="/images/gallery-passenger-window.webp"
                  alt="Penumpang Menikmati Perjalanan"
                  style={{ display: 'none' }}
                  onError={() => handleImgError('passenger')}
                />
                <div className="rh-bento-card-overlay-dark" />
              </div>

              <div className="rh-bento-passenger-content">
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25, textShadow: '0 2px 8px rgba(0,0,0,0.85)' }}>
                  {lang === 'en' ? 'Premium Cabin Comfort' : 'Kenyamanan Kabin'}
                </h4>
                <Link href="/about" style={{ fontSize: '0.8rem', color: '#fed7aa', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  {lang === 'en' ? 'Amenities' : 'Fasilitas kabin'} &rarr;
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* PWA INSTALL INSTRUCTION MODAL */}
      {showModal && (
        <div className="rh-pwa-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="rh-pwa-modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--rh-primary-light)', display: 'grid', placeItems: 'center', color: 'var(--rh-primary)' }}>
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--rh-navy)' }}>
                    Pasang Aplikasi RailHub
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--rh-text-2)' }}>
                    Progressive Web App (PWA) tanpa instalasi berat
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rh-text-3)', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Platform selector tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setSelectedDeviceTab('android')}
                style={{
                  padding: '0.6rem 0.5rem',
                  borderRadius: 10,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: selectedDeviceTab === 'android' ? '2px solid var(--rh-primary)' : '1px solid #e2e8f0',
                  background: selectedDeviceTab === 'android' ? 'rgba(26,66,138,0.06)' : '#ffffff',
                  color: selectedDeviceTab === 'android' ? 'var(--rh-primary)' : '#64748b',
                }}
              >
                Android / Chrome
              </button>
              <button
                type="button"
                onClick={() => setSelectedDeviceTab('ios')}
                style={{
                  padding: '0.6rem 0.5rem',
                  borderRadius: 10,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: selectedDeviceTab === 'ios' ? '2px solid var(--rh-primary)' : '1px solid #e2e8f0',
                  background: selectedDeviceTab === 'ios' ? 'rgba(26,66,138,0.06)' : '#ffffff',
                  color: selectedDeviceTab === 'ios' ? 'var(--rh-primary)' : '#64748b',
                }}
              >
                iPhone / iPad (iOS)
              </button>
              <button
                type="button"
                onClick={() => setSelectedDeviceTab('desktop')}
                style={{
                  padding: '0.6rem 0.5rem',
                  borderRadius: 10,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: selectedDeviceTab === 'desktop' ? '2px solid var(--rh-primary)' : '1px solid #e2e8f0',
                  background: selectedDeviceTab === 'desktop' ? 'rgba(26,66,138,0.06)' : '#ffffff',
                  color: selectedDeviceTab === 'desktop' ? 'var(--rh-primary)' : '#64748b',
                }}
              >
                Laptop / PC
              </button>
            </div>

            {/* Instruction content based on active device */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              {selectedDeviceTab === 'android' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--rh-primary)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>1</div>
                    <div>Buka browser <strong>Google Chrome</strong> di ponsel Android Anda.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--rh-primary)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>2</div>
                    <div>Ketuk ikon <strong>titik tiga (⋮)</strong> di pojok kanan atas browser.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--rh-primary)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>3</div>
                    <div>Pilih menu <strong>&quot;Install app&quot;</strong> atau <strong>&quot;Tambahkan ke Layar Utama&quot;</strong>.</div>
                  </div>
                </div>
              )}

              {selectedDeviceTab === 'ios' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--rh-primary)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>1</div>
                    <div>Buka link ini di browser <strong>Safari</strong> (bukan in-app browser).</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--rh-primary)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>2</div>
                    <div>Ketuk tombol <strong>Share (ikon kotak tanda panah ke atas <Share2 size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />)</strong> di bilah bawah.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--rh-primary)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>3</div>
                    <div>Geser ke bawah lalu ketuk <strong>&quot;Add to Home Screen&quot; (<PlusSquare size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Tambah ke Layar Utama)</strong>.</div>
                  </div>
                </div>
              )}

              {selectedDeviceTab === 'desktop' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--rh-primary)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>1</div>
                    <div>Buka situs RailHub di browser <strong>Chrome</strong> atau <strong>Microsoft Edge</strong>.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--rh-primary)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>2</div>
                    <div>Perhatikan ikon <strong>Install (⊕ komputer/panah ke bawah)</strong> di ujung kanan address bar.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--rh-primary)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>3</div>
                    <div>Klik <strong>&quot;Install&quot;</strong> untuk membuka RailHub sebagai aplikasi desktop mandiri.</div>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons inside modal */}
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1rem',
                  borderRadius: 10,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: copied ? '#10b981' : 'var(--rh-primary)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Tautan Disalin!' : 'Salin Tautan Web'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: 10,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: '#e2e8f0',
                  color: '#334155',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
