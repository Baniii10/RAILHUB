'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Camera, Download, ArrowLeft, Filter, Sparkles, Heart, Eye, Check, X, Shield, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const PHOTO_CATEGORIES = [
  { id: 'all', label: 'Semua Koleksi' },
  { id: 'cc206', label: 'CC 206' },
  { id: 'cc201', label: 'CC 201' },
  { id: 'cc203', label: 'CC 203' },
  { id: 'cc300', label: 'CC 300 INKA' },
  { id: 'interior', label: 'Kabin & Interior' },
]

const GALLERY_PHOTOS = [
  {
    id: 'p1',
    category: 'cc206',
    title: 'Lokomotif CC 206 Melintas Tikungan Lembah Jawa Barat',
    loco: 'CC 206 13 55',
    location: 'Jembatan Cisomang, Jawa Barat',
    photographer: 'Arsip Railfans RAILHUB',
    image: '/images/gallery-train-hero.jpg',
    resolution: '1920 x 1080 HD',
    likes: 248,
    tags: ['CC 206', 'Jembatan', 'Argo Parahyangan'],
  },
  {
    id: 'p2',
    category: 'cc201',
    title: 'CC 201 Hidung Miring Berdinas Lintas Utara Sore Hari',
    loco: 'CC 201 83 25',
    location: 'Lintas Cirebon – Semarang',
    photographer: 'Komunitas Spotter Jawa',
    image: '/images/gallery-train-speed.jpg',
    resolution: '1920 x 1080 HD',
    likes: 312,
    tags: ['CC 201', 'Golden Hour', 'Kereta Campuran'],
  },
  {
    id: 'p3',
    category: 'cc203',
    title: 'CC 203 Moncong Miring Aerodinamis Menembus Pegunungan',
    loco: 'CC 203 98 01',
    location: 'Lintas Jalur Selatan, Priangan Timur',
    photographer: 'Railfans Indonesia',
    image: '/images/kelas-eksekutif.jpg',
    resolution: '1920 x 1080 HD',
    likes: 195,
    tags: ['CC 203', 'Pegunungan', 'Eksekutif Argo'],
  },
  {
    id: 'p4',
    category: 'cc300',
    title: 'Lokomotif CC 300 Diesel Hidrolik Uji Lintas PT INKA',
    loco: 'CC 300 12 01',
    location: 'Stasiun Madiun, Jawa Timur',
    photographer: 'Dokumentasi Industri Kereta',
    image: '/images/kelas-luxury.jpg',
    resolution: '1920 x 1080 HD',
    likes: 284,
    tags: ['CC 300', 'Merah Putih', 'PT INKA Madiun'],
  },
  {
    id: 'p5',
    category: 'interior',
    title: 'Suasana Kabin Eksekutif Luxury Sleeper Panoramic',
    loco: 'Kereta Luxury Gen-3',
    location: 'Armada KA Taksaka Luxury',
    photographer: 'RAILHUB Media Center',
    image: '/images/kelas-luxury.webp',
    resolution: '1920 x 1080 HD',
    likes: 420,
    tags: ['Luxury', 'Interior', 'Sleeper'],
  },
  {
    id: 'p6',
    category: 'interior',
    title: 'Pemandangan Jendela Penumpang Menatap Hamparan Sawah',
    loco: 'KA Argo Wilis',
    location: 'Lintas Kroya – Kutoarjo',
    photographer: 'Dokumentasi Penumpang',
    image: '/images/gallery-passenger-window.jpg',
    resolution: '1920 x 1080 HD',
    likes: 350,
    tags: ['Jendela', 'Sawah', 'Perjalanan'],
  },
  {
    id: 'p7',
    category: 'cc206',
    title: 'Armada CC 206 Siap Berangkat dari Jalur Utama',
    loco: 'CC 206 15 08',
    location: 'Stasiun Gambir, Jakarta',
    photographer: 'Tim Dokumentasi Stasiun',
    image: '/images/promo railhub.png',
    resolution: '2048 x 768 Panorama HD',
    likes: 275,
    tags: ['CC 206', 'Gambir', 'Keberangkatan'],
  },
  {
    id: 'p8',
    category: 'cc201',
    title: 'Tarif Reduksi & Lokomotif Dinas Jawa',
    loco: 'CC 201 Series',
    location: 'Lintas Yogyakarta – Solo',
    photographer: 'Arsip Komunitas',
    image: '/images/Railhub Tarif Reduksi Kereta.png',
    resolution: '2048 x 768 Panorama HD',
    likes: 198,
    tags: ['CC 201', 'Arsip', 'Sejarah'],
  },
]

export default function RailfansGaleriPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activePhotoModal, setActivePhotoModal] = useState(null)
  const [likedPhotos, setLikedPhotos] = useState({})

  const filteredPhotos =
    selectedCategory === 'all'
      ? GALLERY_PHOTOS
      : GALLERY_PHOTOS.filter((p) => p.category === selectedCategory)

  // Download Handler (Safe check with passenger login requirement)
  const handleDownload = (photo, e) => {
    if (e) e.stopPropagation()

    if (!user) {
      toast('Silakan login dengan akun Penumpang untuk mengunduh koleksi foto resolusi penuh!', {
        icon: '🔒',
        duration: 3500,
      })
      router.push('/auth/login?next=%2Frailfans%2Fgaleri')
      return
    }

    try {
      const link = document.createElement('a')
      link.href = photo.image
      link.download = `RAILHUB-Photo-${photo.loco.replace(/\s+/g, '-')}-${photo.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Mengunduh foto ${photo.loco} (${photo.resolution})...`, {
        icon: '📥',
        duration: 3000,
      })
    } catch {
      toast.error('Gagal mengunduh foto.')
    }
  }

  const toggleLike = (photoId, e) => {
    if (e) e.stopPropagation()
    setLikedPhotos((prev) => ({
      ...prev,
      [photoId]: !prev[photoId],
    }))
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--rh-bg, #f8fafc)' }}>
      <Navbar />

      <main style={{ flex: 1, paddingBottom: '4rem' }}>
        {/* Header Hero */}
        <section
          style={{
            background: 'linear-gradient(180deg, #07162C 0%, #0F2D59 100%)',
            color: '#ffffff',
            paddingTop: '3rem',
            paddingBottom: '2.5rem',
            position: 'relative',
          }}
        >
          <div className="rh-container">
            {/* Breadcrumb & Back Link */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Link
                href="/railfans"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.1)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 999,
                }}
              >
                <ArrowLeft size={14} />
                <span>Kembali ke Komunitas</span>
              </Link>
            </div>

            <div style={{ maxWidth: 680 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(249, 115, 22, 0.2)',
                  color: '#FDBA74',
                  padding: '0.3rem 0.75rem',
                  borderRadius: 999,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  marginBottom: '0.85rem',
                }}
              >
                <Camera size={14} />
                <span>Koleksi Wallpaper & Arsip Kereta Api HD</span>
              </div>

              <h1
                className="rh-h1"
                style={{
                  color: '#ffffff',
                  fontSize: 'clamp(1.8rem, 3.8vw, 2.6rem)',
                  fontWeight: 800,
                  margin: '0 0 0.75rem',
                }}
              >
                Galeri Foto Lokomotif & Spotting
              </h1>

              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.86)',
                  fontSize: '0.96rem',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Simpan dan unduh foto-foto terbaik lokomotif legendaris Indonesia: CC 206, CC 201, CC 203, CC 300, serta lanskap panorama jalur kereta api Pulau Jawa.
              </p>
            </div>
          </div>
        </section>

        {/* Gallery Content Area */}
        <div className="rh-container" style={{ marginTop: '2rem' }}>
          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.75rem',
              marginBottom: '1.75rem',
            }}
          >
            {PHOTO_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '0.5rem 1.15rem',
                    borderRadius: 999,
                    border: isActive ? '1px solid var(--rh-primary)' : '1px solid var(--rh-border)',
                    background: isActive ? 'var(--rh-primary)' : 'var(--rh-surface, #ffffff)',
                    color: isActive ? '#ffffff' : 'var(--rh-text-1)',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Photo Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredPhotos.map((photo) => {
              const isLiked = likedPhotos[photo.id]
              return (
                <article
                  key={photo.id}
                  className="rh-card"
                  onClick={() => setActivePhotoModal(photo)}
                  style={{
                    padding: 0,
                    borderRadius: 18,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid var(--rh-border)',
                    boxShadow: '0 8px 24px rgba(7, 26, 56, 0.08)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Photo Thumbnail */}
                  <div style={{ position: 'relative', width: '100%', height: 220, background: '#0a1628' }}>
                    <Image
                      src={photo.image}
                      alt={photo.title}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 400px"
                      style={{ objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: 'rgba(7, 22, 44, 0.75)',
                        backdropFilter: 'blur(8px)',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 8,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#ffffff',
                      }}
                    >
                      {photo.loco}
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'rgba(7, 22, 44, 0.75)',
                        backdropFilter: 'blur(8px)',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 8,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#38BDF8',
                      }}
                    >
                      {photo.resolution}
                    </div>
                  </div>

                  {/* Card Description */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3
                        style={{
                          fontSize: '1.02rem',
                          fontWeight: 800,
                          color: 'var(--rh-navy)',
                          margin: '0 0 0.35rem',
                          lineHeight: 1.4,
                        }}
                      >
                        {photo.title}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--rh-text-2)', marginBottom: '0.75rem' }}>
                        📍 {photo.location}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--rh-border)',
                        paddingTop: '0.85rem',
                        marginTop: '0.5rem',
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => toggleLike(photo.id, e)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: 'transparent',
                          border: 'none',
                          color: isLiked ? '#EF4444' : 'var(--rh-text-2)',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                        }}
                      >
                        <Heart size={16} fill={isLiked ? '#EF4444' : 'none'} />
                        <span>{photo.likes + (isLiked ? 1 : 0)}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDownload(photo, e)}
                        className="rh-btn rh-btn-sm"
                        style={{
                          background: 'var(--rh-primary)',
                          color: '#ffffff',
                          borderRadius: 10,
                          padding: '0.45rem 0.95rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <Download size={14} />
                        <span>Ambil Foto</span>
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </main>

      {/* Expanded Photo Preview Modal */}
      {activePhotoModal && (
        <div
          onClick={() => setActivePhotoModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#07162C',
              color: '#ffffff',
              borderRadius: 24,
              overflow: 'hidden',
              maxWidth: 880,
              width: '100%',
              boxShadow: '0 24px 70px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            {/* Modal Image Display */}
            <div style={{ position: 'relative', width: '100%', height: 'clamp(280px, 50vh, 460px)', background: '#000' }}>
              <Image
                src={activePhotoModal.image}
                alt={activePhotoModal.title}
                fill
                unoptimized
                style={{ objectFit: 'contain' }}
              />
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  background: 'rgba(0,0,0,0.6)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Info Footer */}
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', background: '#F97316', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: 6, fontWeight: 700 }}>
                  {activePhotoModal.loco}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.5rem 0 0.25rem', color: '#ffffff' }}>
                  {activePhotoModal.title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                  📍 {activePhotoModal.location} • 📷 {activePhotoModal.photographer} • 📐 {activePhotoModal.resolution}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={(e) => handleDownload(activePhotoModal, e)}
                  style={{
                    background: '#10B981',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    padding: '0.75rem 1.5rem',
                    borderRadius: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <Download size={18} />
                  <span>Unduh Foto Resolusi Penuh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

