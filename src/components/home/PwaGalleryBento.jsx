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
        
        {/* Section Header (Craft-Floor: No banned kickers, balanced readable line length <= 58ch) */}
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 2.5rem' }}>
          <h2 className="rh-h2" style={{ margin: '0 0 0.85rem', color: 'var(--rh-navy)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.25 }}>
            {lang === 'en' ? 'Travel Experience in the Palm of Your Hand' : 'Pengalaman Perjalanan Terlengkap di Genggaman'}
          </h2>
          <p style={{ margin: '0 auto', maxWidth: '52ch', color: '#475569', fontSize: '0.95rem', lineHeight: 1.65, textWrap: 'balance' }}>
            {lang === 'en'
              ? 'Book tickets in seconds, access offline QR boarding passes, and enjoy seamless rail travel from western to eastern Java.'
              : 'Pesan tiket dalam hitungan detik, simpan e-boarding pass QR secara offline, dan nikmati perjalanan kereta api tanpa antre di seluruh rute Nusantara.'}
          </p>
        </div>

        {/* BENTO GRID (Screenshot layout: 3 Columns) */}
        <div className="rh-bento-grid">
          
          {/* CARD 1: PWA / Mobile App Showcase with iPhone 16 Frame (Left) */}
          <div className="rh-bento-card rh-bento-card-app">
            <div className="rh-bento-app-content">
              <h3 className="rh-bento-title-dark">
                {lang === 'en' ? 'Our app for every step of your journey!' : 'Aplikasi RailHub untuk setiap langkah perjalanan Anda!'}
              </h3>
              
              <p className="rh-bento-desc-dark">
                {lang === 'en'
                  ? 'Our top-rated PWA makes trip planning easy wherever you are. Install the app directly to your home screen without heavy store downloads!'
                  : 'Aplikasi web progresif (PWA) resmi kami memudahkan pemesanan tiket di mana pun. Pasang langsung ke layar utama ponsel Anda, hemat kuota tanpa instalasi berat!'}
              </p>

              {/* Install PWA Interactive CTA Button (Clean without chip label) */}
              <button
                type="button"
                onClick={handleInstallClick}
                className="rh-bento-install-btn"
                title="Pasang Aplikasi RailHub ke HP / PC"
              >
                <Download size={18} />
                <span>{installed ? (lang === 'en' ? 'App Installed ✓' : 'Aplikasi Terpasang ✓') : (lang === 'en' ? 'Pasang Aplikasi RailHub (PWA)' : 'Pasang Aplikasi RailHub (PWA)')}</span>
              </button>

              {/* QR Code (Clean & Minimalist, No Label Below) */}
              <div className="rh-bento-qr-store-wrap">
                <div className="rh-bento-qr-box" onClick={() => setShowModal(true)} title="Pindai atau klik untuk panduan pasang PWA">
                  {/* High Quality Crisp SVG QR Code */}
                  <svg viewBox="0 0 100 100" width="88" height="88" style={{ display: 'block', borderRadius: 6 }}>
                    <rect width="100" height="100" fill="#ffffff" />
                    {/* Corner Squares */}
                    <rect x="6" y="6" width="28" height="28" fill="#0f172a" rx="4" />
                    <rect x="10" y="10" width="20" height="20" fill="#ffffff" rx="2" />
                    <rect x="14" y="14" width="12" height="12" fill="#1a428a" rx="2" />

                    <rect x="66" y="6" width="28" height="28" fill="#0f172a" rx="4" />
                    <rect x="70" y="10" width="20" height="20" fill="#ffffff" rx="2" />
                    <rect x="74" y="14" width="12" height="12" fill="#1a428a" rx="2" />

                    <rect x="6" y="66" width="28" height="28" fill="#0f172a" rx="4" />
                    <rect x="10" y="70" width="20" height="20" fill="#ffffff" rx="2" />
                    <rect x="14" y="74" width="12" height="12" fill="#1a428a" rx="2" />

                    {/* Data Pattern Modules */}
                    <rect x="38" y="10" width="6" height="6" fill="#0f172a" />
                    <rect x="48" y="14" width="6" height="12" fill="#0f172a" />
                    <rect x="14" y="40" width="6" height="6" fill="#0f172a" />
                    <rect x="24" y="46" width="10" height="6" fill="#0f172a" />
                    <rect x="40" y="38" width="20" height="20" fill="#ea580c" rx="3" />
                    <circle cx="50" cy="48" r="4" fill="#ffffff" />
                    <rect x="68" y="42" width="6" height="10" fill="#0f172a" />
                    <rect x="78" y="38" width="12" height="6" fill="#0f172a" />
                    <rect x="38" y="68" width="8" height="8" fill="#0f172a" />
                    <rect x="52" y="74" width="10" height="6" fill="#0f172a" />
                    <rect x="68" y="68" width="6" height="18" fill="#0f172a" />
                    <rect x="78" y="78" width="14" height="10" fill="#0f172a" />
                  </svg>
                </div>

              </div>
            </div>

            {/* iPhone 16 Frame Mockup (Screen image to be filled via /images/pwa-mobile-preview.webp) */}
            <div className="rh-bento-phone-col">
              <div className="rh-iphone16-frame">
                {/* Physical Titanium Hardware Buttons */}
                <span className="rh-iphone16-btn rh-iphone16-btn-action" title="Action Button" />
                <span className="rh-iphone16-btn rh-iphone16-btn-vol-up" />
                <span className="rh-iphone16-btn rh-iphone16-btn-vol-down" />
                <span className="rh-iphone16-btn rh-iphone16-btn-power" />
                <span className="rh-iphone16-btn rh-iphone16-btn-camera" title="Camera Control" />

                {/* iPhone 16 Display Screen */}
                <div className="rh-iphone16-screen">
                  {/* Dynamic Island pill notch with camera lens */}
                  <div className="rh-iphone16-island">
                    <span className="rh-iphone16-sensor" />
                    <span className="rh-iphone16-lens" />
                  </div>

                  {/* Top Status Bar (09:41, Cellular, Wi-Fi, Battery) */}
                  <div className="rh-iphone16-statusbar">
                    <span className="rh-iphone16-time">09:41</span>
                    <div className="rh-iphone16-status-icons">
                      <svg width="13" height="9" viewBox="0 0 17 11" fill="currentColor"><path d="M1 9h2V2H1v7zm4 0h2V0H5v9zm4 0h2V4H9v5zm4 0h2V6h-2v3z"/></svg>
                      <svg width="12" height="9" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.5a10.9 10.9 0 0 1 7.2 2.7l-1.3 1.5A9 9 0 0 0 8 4.5a9 9 0 0 0-5.9 2.2L.8 5.2A10.9 10.9 0 0 1 8 2.5zm0 4a6.9 6.9 0 0 1 4.5 1.7l-1.3 1.5A5 5 0 0 0 8 8.5a5 5 0 0 0-3.2 1.2L3.5 8.2A6.9 6.9 0 0 1 8 6.5zm0 4a2.9 2.9 0 0 1 1.8.7L8 13l-1.8-1.8A2.9 2.9 0 0 1 8 10.5z"/></svg>
                      <div className="rh-iphone16-battery"><div className="rh-iphone16-battery-fill" /></div>
                    </div>
                  </div>

                  {/* Screen Content: User can put screenshot image in /images/pwa-mobile-preview.webp */}
                  {!imgErrors.mobilePreview ? (
                    <img
                      src="/images/pwa-mobile-preview.webp"
                      alt="Preview Aplikasi RailHub di iPhone 16"
                      className="rh-iphone16-img"
                      onError={() => handleImgError('mobilePreview')}
                    />
                  ) : (
                    /* Fallback UI when user image is not yet placed in public/images/ */
                    <div className="rh-iphone16-fallback-content">
                      <div className="rh-mock-logo-row">
                        <Train size={13} style={{ color: '#ea580c' }} />
                        <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.04em' }}>RAILHUB</span>
                        <span className="rh-mock-live-chip">LIVE</span>
                      </div>

                      <div className="rh-mock-ticket-box">
                        <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Kereta Anda berikutnya:</div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', marginTop: 1 }}>KA 2 Argo Bromo Anggrek</div>
                        <div style={{ fontSize: '0.58rem', color: '#cbd5e1' }}>Berangkat dalam 20 jam &bull; Gambir</div>
                      </div>

                      <div className="rh-mock-form">
                        <div className="rh-mock-input">
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                          <span>Gambir (GMR)</span>
                        </div>
                        <div className="rh-mock-input">
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                          <span>Surabaya Gubeng (SGU)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#94a3b8', padding: '0 2px' }}>
                          <span>1 Penumpang</span>
                          <span style={{ color: '#38bdf8' }}>+ Jadwal Pulang</span>
                        </div>
                        <Link href="/trains" className="rh-mock-cta">
                          Cari Tiket Kereta &rarr;
                        </Link>
                      </div>

                      <div className="rh-mock-drop-hint">
                        <span>Foto cover iPhone 16:</span>
                        <code>/images/pwa-mobile-preview.webp</code>
                      </div>
                    </div>
                  )}

                  {/* iPhone 16 Home Indicator Bar */}
                  <div className="rh-iphone16-homebar" />
                </div>
              </div>
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

            {/* Card Content Overlay */}
            <div className="rh-bento-center-content">
              <h3 className="rh-bento-title-white">
                {lang === 'en'
                  ? 'From Express to High-Speed – Book Any Intercity Train'
                  : 'Dari Lintas Pantura ke Lintas Selatan – Jelajahi Nusantara dengan Kereta Api Modern'}
              </h3>

              <p className="rh-bento-desc-white">
                {lang === 'en'
                  ? 'Argo Bromo Anggrek, Gajayana, Taksaka, Lodaya, to Whoosh Fast Train - book tickets across the most advanced rail network in Indonesia, all from our seamless online service.'
                  : 'Argo Bromo Anggrek, Argo Lawu, Taksaka Hype Trip, Gajayana, hingga Kereta Cepat Whoosh - nikmati kemudahan reservasi tiket seluruh jalur kereta api utama Indonesia tanpa biaya tersembunyi.'}
              </p>

              
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
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.3, textShadow: '0 2px 8px rgba(0,0,0,0.85)' }}>
                  {lang === 'en' ? 'Explore Indonesia with Premium Comfort' : 'Jelajahi Indonesia dengan Kenyamanan Penuh'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#f8fafc', lineHeight: 1.55, textShadow: '0 1px 4px rgba(0,0,0,0.85)' }}>
                  {lang === 'en'
                    ? 'Book tickets and travel in total comfort across Java, Bali ferry connections, and Sumatra in just a few steps.'
                    : 'Pesan tiket dan nikmati pemandangan sawah, bukit, dan pesisir pulau Jawa dalam ketenangan kabin ber-AC.'}
                </p>
                <div style={{ marginTop: '0.95rem' }}>
                  <Link href="/about" style={{ fontSize: '0.8125rem', color: '#fed7aa', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                    {lang === 'en' ? 'Learn more about amenities' : 'Pelajari fasilitas kabin'} &rarr;
                  </Link>
                </div>
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
