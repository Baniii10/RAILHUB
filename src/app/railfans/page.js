'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DiscordCommunityBanner from '@/components/railfans/DiscordCommunityBanner'
import Locomotive3DViewer from '@/components/railfans/Locomotive3DViewer'
import RailwayHistorySection from '@/components/railfans/RailwayHistorySection'
import { Train, History, Camera, Compass, Sparkles, ChevronRight, Share2, Layers } from 'lucide-react'
import { useLang } from '@/contexts/LangContext'

export default function RailfansPage() {
  const { lang } = useLang()
  const [activeTab, setActiveTab] = useState('3d') // '3d' | 'sejarah'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--rh-bg, #f8fafc)' }}>
      <Navbar />

      <main style={{ flex: 1, paddingBottom: '4rem' }}>
        {/* Hero Section */}
        <section
          style={{
            background: 'linear-gradient(180deg, #07162C 0%, #0B244A 60%, #0F2D59 100%)',
            color: '#ffffff',
            paddingTop: '3.5rem',
            paddingBottom: '3rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Grid Pattern Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              opacity: 0.4,
              pointerEvents: 'none',
            }}
          />

          <div className="rh-container" style={{ position: 'relative', zIndex: 1 }}>
            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.25rem' }}>
              <Link href="/" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
                Beranda
              </Link>
              <span>/</span>
              <span style={{ color: '#F97316', fontWeight: 700 }}>Komunitas Railfans</span>
            </nav>

            <div style={{ maxWidth: 760 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(249, 115, 22, 0.2)',
                  color: '#FDBA74',
                  border: '1px solid rgba(249, 115, 22, 0.35)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 999,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                }}
              >
                <Sparkles size={14} color="#F97316" />
                <span>Portal Resmi Pecinta Kereta Api Indonesia</span>
              </div>

              <h1
                className="rh-h1"
                style={{
                  color: '#ffffff',
                  fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  marginBottom: '1rem',
                }}
              >
                Ruang Komunitas Railfans RAILHUB
              </h1>

              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.88)',
                  fontSize: 'clamp(0.95rem, 1.8vw, 1.12rem)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Tempat berkumpulnya para pecinta kereta api se-Nusantara. Eksplorasi sejarah panjang perkeretaapian Indonesia, jelajahi model 3D lokomotif legendaris interaktif, unduh koleksi foto HD, dan bergabung dalam diskusi komunitas di Discord.
              </p>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="rh-container" style={{ marginTop: '-1.5rem', position: 'relative', zIndex: 10 }}>
          {/* Discord Banner di Bagian Paling Atas */}
          <DiscordCommunityBanner />

          {/* Navigasi Pilihan Tab / Menu */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
              background: 'var(--rh-surface, #ffffff)',
              padding: '0.85rem 1.25rem',
              borderRadius: 18,
              boxShadow: '0 6px 20px rgba(7, 26, 56, 0.06)',
              border: '1px solid var(--rh-border, #e2e8f0)',
            }}
          >
            {/* Tab Switches: 3D Simulator vs Sejarah */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActiveTab('3d')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.15rem',
                  borderRadius: 12,
                  border: activeTab === '3d' ? '1px solid var(--rh-primary)' : '1px solid transparent',
                  background: activeTab === '3d' ? 'var(--rh-primary)' : 'transparent',
                  color: activeTab === '3d' ? '#ffffff' : 'var(--rh-text-1)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Train size={16} />
                <span>Model 3D Lokomotif</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sejarah')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.15rem',
                  borderRadius: 12,
                  border: activeTab === 'sejarah' ? '1px solid var(--rh-primary)' : '1px solid transparent',
                  background: activeTab === 'sejarah' ? 'var(--rh-primary)' : 'transparent',
                  color: activeTab === 'sejarah' ? '#ffffff' : 'var(--rh-text-1)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <History size={16} />
                <span>Sejarah Kereta Api</span>
              </button>
            </div>

            {/* Shortcut Button to Dedicated Photo Gallery */}
            <Link
              href="/railfans/galeri"
              className="rh-btn rh-btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#F97316',
                color: '#ffffff',
                fontWeight: 700,
                padding: '0.6rem 1.25rem',
                borderRadius: 12,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
              }}
            >
              <Camera size={16} />
              <span>Buka Galeri Foto Kereta</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          {/* Tab 1: 3D Locomotive Viewer */}
          {activeTab === '3d' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 className="rh-h3" style={{ margin: '0 0 0.35rem', color: 'var(--rh-navy)', fontWeight: 800 }}>
                  Showroom 3D Lokomotif Interaktif
                </h2>
                <p style={{ margin: 0, color: 'var(--rh-text-2)', fontSize: '0.92rem' }}>
                  Pilih seri lokomotif (CC 206, CC 201, CC 203, CC 300), putar 360°, nyalakan lampu sorot, pelajari spesifikasi teknisnya, dan gunakan tombol &apos;Ambil Foto 3D&apos; untuk mengunduh snapshot.
                </p>
              </div>

              {/* Three.js Interactive Locomotive Viewer */}
              <Locomotive3DViewer />

              {/* Sejarah preview card under 3D */}
              <div
                style={{
                  marginTop: '2.5rem',
                  background: 'var(--rh-surface, #ffffff)',
                  borderRadius: 20,
                  padding: '1.75rem',
                  border: '1px solid var(--rh-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--rh-navy)' }}>
                    Tertarik Mengetahui Sejarah di Balik Lokomotif Ini?
                  </h3>
                  <p style={{ margin: 0, color: 'var(--rh-text-2)', fontSize: '0.88rem' }}>
                    Telusuri jejak rel pertama di Kemijen 1864 hingga modernisasi armada PT Kereta Api Indonesia.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('sejarah')}
                  className="rh-btn rh-btn-primary rh-btn-sm"
                  style={{ borderRadius: 12, fontWeight: 700 }}
                >
                  <History size={16} />
                  <span>Baca Sejarah Kereta Api</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Railway History Timeline */}
          {activeTab === 'sejarah' && (
            <div>
              <RailwayHistorySection />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

