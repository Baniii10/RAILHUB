'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { Download, ArrowLeft, Heart, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const PHOTO_CATEGORIES = [
  { id: 'all', label: 'Semua' },
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
    title: 'CC 206 Melintas Tikungan Lembah Jawa Barat',
    loco: 'CC 206 13 55',
    location: 'Jembatan Cisomang, Jawa Barat',
    photographer: 'Arsip Railfans RAILHUB',
    image: '/images/gallery-train-hero.jpg',
    resolution: '1920 x 1080',
    likes: 248,
  },
  {
    id: 'p2',
    category: 'cc201',
    title: 'CC 201 Hidung Miring Lintas Utara',
    loco: 'CC 201 83 25',
    location: 'Lintas Cirebon – Semarang',
    photographer: 'Komunitas Spotter Jawa',
    image: '/images/gallery-train-speed.jpg',
    resolution: '1920 x 1080',
    likes: 312,
  },
  {
    id: 'p3',
    category: 'cc203',
    title: 'CC 203 Moncong Miring Jalur Selatan',
    loco: 'CC 203 98 01',
    location: 'Priangan Timur, Jawa Barat',
    photographer: 'Railfans Indonesia',
    image: '/images/gallery-train-hero.jpg',
    resolution: '1920 x 1080',
    likes: 195,
  },
  {
    id: 'p4',
    category: 'cc300',
    title: 'CC 300 Diesel Hidrolik Uji Lintas',
    loco: 'CC 300 12 01',
    location: 'Stasiun Madiun, Jawa Timur',
    photographer: 'Dokumentasi Industri Kereta',
    image: '/images/loco-cc300-inka.jpg',
    resolution: '1920 x 1080',
    likes: 284,
  },
  {
    id: 'p5',
    category: 'interior',
    title: 'Kabin Eksekutif Luxury Sleeper',
    loco: 'Luxury Gen-3',
    location: 'KA Taksaka Luxury',
    photographer: 'RAILHUB Media',
    image: '/images/kelas-luxury.webp',
    resolution: '1920 x 1080',
    likes: 420,
  },
  {
    id: 'p6',
    category: 'interior',
    title: 'Panorama Jendela Lintas Selatan',
    loco: 'KA Argo Wilis',
    location: 'Lintas Kroya – Kutoarjo',
    photographer: 'Dokumentasi Penumpang',
    image: '/images/gallery-passenger-window.jpg',
    resolution: '1920 x 1080',
    likes: 350,
  },
  {
    id: 'p7',
    category: 'cc206',
    title: 'Arsip Lokomotif Uap NIS 1864 (Heritage)',
    loco: 'Heritage 1864',
    location: 'Semarang Kemijen',
    photographer: 'Arsip Sejarah RAILHUB',
    image: '/images/history-1864-steam.jpg',
    resolution: '1920 x 1080',
    likes: 275,
  },
  {
    id: 'p8',
    category: 'cc201',
    title: 'Dokumentasi Balai Besar KA Bandung 1945',
    loco: 'DKARI 1945',
    location: 'Bandung, Jawa Barat',
    photographer: 'Arsip Sejarah RAILHUB',
    image: '/images/history-1945-dkari.jpg',
    resolution: '1920 x 1080',
    likes: 198,
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

  const handleDownload = (photo, e) => {
    if (e) e.stopPropagation()

    if (!user) {
      toast('Silakan login untuk mengunduh foto resolusi penuh.')
      router.push('/auth/login?next=%2Frailfans%2Fgaleri')
      return
    }

    try {
      const link = document.createElement('a')
      link.href = photo.image
      link.download = `RAILHUB-${photo.loco.replace(/\s+/g, '-')}-${photo.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`Mengunduh ${photo.loco}`)
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
    <div className="min-h-screen flex flex-col bg-[var(--rh-bg)]">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Compact Dark Header */}
        <section className="bg-[#0b1626] text-white border-b border-white/10" style={{ padding: '4.5rem 0 3rem' }}>
          <div className="rh-container">
            <Link
              href="/railfans"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/75 no-underline hover:text-white mb-4"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Komunitas</span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
              Galeri Foto Railfans
            </h1>
            <p className="text-sm text-white/75 m-0 mt-1.5 max-w-xl">
              Arsip dokumentasi lokomotif CC 206, CC 201, CC 203, CC 300, dan perjalanan lintas Jawa.
            </p>
          </div>
        </section>

        {/* Filter + Grid */}
        <div className="rh-container pt-6 sm:pt-8 space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--rh-border)]">
            {PHOTO_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[var(--rh-blue)] text-white'
                      : 'bg-white text-[var(--rh-text)] border border-[var(--rh-border)] hover:border-[var(--rh-blue)]'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => {
              const isLiked = likedPhotos[photo.id]
              return (
                <article
                  key={photo.id}
                  onClick={() => setActivePhotoModal(photo)}
                  className="group bg-white border border-[var(--rh-border)] rounded-xl overflow-hidden cursor-pointer flex flex-col hover:border-[var(--rh-blue)] transition-colors"
                >
                  <div className="relative w-full aspect-[16/10] bg-[#0b1626] overflow-hidden">
                    <Image
                      src={photo.image}
                      alt={photo.title}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-[var(--rh-orange)] mb-1">
                        <span>{photo.loco}</span>
                        <span className="text-[var(--rh-text-3)] font-medium">{photo.resolution}</span>
                      </div>
                      <h2 className="text-sm sm:text-base font-bold text-[var(--rh-blue)] m-0 leading-snug">
                        {photo.title}
                      </h2>
                      <div className="text-xs text-[var(--rh-text-3)] mt-1">
                        {photo.location}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--rh-border)]">
                      <button
                        type="button"
                        onClick={(e) => toggleLike(photo.id, e)}
                        aria-label="Sukai foto"
                        className={`inline-flex items-center gap-1.5 text-xs font-bold bg-transparent border-0 cursor-pointer p-0 ${
                          isLiked ? 'text-[var(--rh-orange)]' : 'text-[var(--rh-text-3)] hover:text-[var(--rh-blue)]'
                        }`}
                      >
                        <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
                        <span>{photo.likes + (isLiked ? 1 : 0)}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDownload(photo, e)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--rh-blue)] text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity border-0"
                      >
                        <Download size={13} />
                        <span>Unduh</span>
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </main>

      {/* Clean Lightbox Modal */}
      {activePhotoModal && (
        <div
          onClick={() => setActivePhotoModal(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0b1626] text-white rounded-xl overflow-hidden max-w-3xl w-full border border-white/15"
          >
            <div className="relative w-full h-[260px] sm:h-[420px] bg-black">
              <Image
                src={activePhotoModal.image}
                alt={activePhotoModal.title}
                fill
                unoptimized
                className="object-contain"
              />
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                aria-label="Tutup pratinjau"
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 text-white border-0 flex items-center justify-center cursor-pointer hover:bg-black"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/10">
              <div>
                <span className="text-xs font-bold text-[var(--rh-orange)]">
                  {activePhotoModal.loco} · {activePhotoModal.resolution}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white m-0 mt-0.5">
                  {activePhotoModal.title}
                </h3>
                <div className="text-xs text-white/65 mt-1">
                  {activePhotoModal.location} · {activePhotoModal.photographer}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleDownload(activePhotoModal, e)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--rh-orange)] text-white text-xs sm:text-sm font-bold border-0 cursor-pointer hover:opacity-90 transition-opacity shrink-0"
              >
                <Download size={16} />
                <span>Unduh Resolusi Penuh</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
