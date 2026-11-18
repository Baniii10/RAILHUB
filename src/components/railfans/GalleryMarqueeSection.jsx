'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Download, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const MARQUEE_PHOTOS = [
  {
    id: 'p1',
    loco: 'CC 206 13 55',
    title: 'CC 206 Melintas Tikungan Lembah Jawa Barat',
    location: 'Jembatan Cisomang',
    image: '/images/gallery-train-hero.jpg',
  },
  {
    id: 'p2',
    loco: 'CC 201 83 25',
    title: 'CC 201 Hidung Miring Lintas Utara',
    location: 'Cirebon – Semarang',
    image: '/images/gallery-train-speed.jpg',
  },
  {
    id: 'p3',
    loco: 'CC 203 98 01',
    title: 'CC 203 Moncong Hiu Jalur Selatan',
    location: 'Priangan Timur',
    image: '/images/gallery-train-hero.jpg',
  },
  {
    id: 'p4',
    loco: 'CC 300 12 01',
    title: 'CC 300 Diesel Hidrolik PT INKA',
    location: 'Stasiun Madiun',
    image: '/images/loco-cc300-inka.jpg',
  },
  {
    id: 'p5',
    loco: 'Luxury Gen-3',
    title: 'Kabin Eksekutif Luxury Sleeper',
    location: 'KA Taksaka Luxury',
    image: '/images/kelas-luxury.webp',
  },
  {
    id: 'p6',
    loco: 'KA Argo Wilis',
    title: 'Panorama Jendela Lintas Selatan',
    location: 'Kroya – Kutoarjo',
    image: '/images/gallery-passenger-window.jpg',
  },
]

export default function GalleryMarqueeSection() {
  const router = useRouter()
  const { user } = useAuth()
  const scrollRef = useRef(null)
  const isPausedRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragScrollLeftRef = useRef(0)
  const isDraggingRef = useRef(false)
  const movedRef = useRef(false)

  const [activePhoto, setActivePhoto] = useState(null)

  // Smooth auto-slide + seamless infinite loop while keeping native finger swipe & mouse drag
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    let animId
    let lastTime = performance.now()

    const step = (now) => {
      const dt = Math.min(now - lastTime, 50)
      lastTime = now

      if (!isPausedRef.current && !isDraggingRef.current && el) {
        const halfWidth = el.scrollWidth / 2
        if (halfWidth > 0) {
          el.scrollLeft += dt * 0.045
          if (el.scrollLeft >= halfWidth) {
            el.scrollLeft -= halfWidth
          }
        }
      }
      animId = requestAnimationFrame(step)
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [])

  const handlePointerDown = (e) => {
    const el = scrollRef.current
    if (!el) return
    isDraggingRef.current = true
    movedRef.current = false
    dragStartXRef.current = e.pageX
    dragScrollLeftRef.current = el.scrollLeft
  }

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !scrollRef.current) return
    const dx = e.pageX - dragStartXRef.current
    if (Math.abs(dx) > 8) movedRef.current = true
    scrollRef.current.scrollLeft = dragScrollLeftRef.current - dx
  }

  const handlePointerUp = () => {
    isDraggingRef.current = false
  }

  const handleDownload = (photo, e) => {
    if (e) e.stopPropagation()
    if (!user) {
      toast('Silakan login untuk mengunduh foto resolusi penuh.')
      router.push('/auth/login?next=%2Frailfans')
      return
    }
    try {
      const link = document.createElement('a')
      link.href = photo.image
      link.download = `RAILHUB-${photo.loco.replace(/\s+/g, '-')}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`Mengunduh ${photo.loco}`)
    } catch {
      toast.error('Gagal mengunduh foto.')
    }
  }

  const trackItems = [...MARQUEE_PHOTOS, ...MARQUEE_PHOTOS]

  return (
    <section aria-labelledby="galeri-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-4 pb-3 border-b border-[var(--rh-border)]">
        <div>
          <h2 id="galeri-heading" className="text-xl sm:text-2xl font-extrabold text-[var(--rh-blue)] m-0">
            Galeri Spotting Railfans
          </h2>
          <p className="text-xs sm:text-sm text-[var(--rh-text)] opacity-80 m-0 mt-0.5">
            Geser atau klik foto untuk pratinjau penuh dan unduh arsip HD.
          </p>
        </div>

        <Link
          href="/railfans/galeri"
          style={{ color: 'var(--rh-blue)' }}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold no-underline hover:underline shrink-0"
        >
          <span>Semua Foto</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Auto-sliding + Finger-swipeable Horizontal Track */}
      <div
        ref={scrollRef}
        onMouseEnter={() => { isPausedRef.current = true }}
        onMouseLeave={() => {
          isPausedRef.current = false
          isDraggingRef.current = false
        }}
        onTouchStart={() => { isPausedRef.current = true }}
        onTouchEnd={() => {
          setTimeout(() => { isPausedRef.current = false }, 1200)
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="flex gap-4 overflow-x-auto touch-pan-x select-none py-1 cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {trackItems.map((photo, idx) => (
          <button
            key={`${photo.id}-${idx}`}
            type="button"
            onClick={() => {
              if (!movedRef.current) setActivePhoto(photo)
            }}
            className="group text-left bg-transparent border-0 p-0 cursor-pointer w-[240px] sm:w-[290px] shrink-0"
          >
            <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-[#0b1626] pointer-events-none">
              <Image
                src={photo.image}
                alt={photo.title}
                fill
                unoptimized
                sizes="290px"
                className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
              />
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <span className="text-xs font-extrabold text-[var(--rh-orange)]">{photo.loco}</span>
              <span className="text-[11px] text-[var(--rh-text-3)] truncate">{photo.location}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Inline Lightbox Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0b1626] text-white rounded-xl overflow-hidden max-w-2xl w-full border border-white/15"
          >
            <div className="relative w-full h-[240px] sm:h-[380px] bg-black">
              <Image
                src={activePhoto.image}
                alt={activePhoto.title}
                fill
                unoptimized
                className="object-contain"
              />
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                aria-label="Tutup pratinjau"
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 text-white border-0 flex items-center justify-center cursor-pointer hover:bg-black"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/10">
              <div>
                <span className="text-xs font-bold text-[var(--rh-orange)]">{activePhoto.loco}</span>
                <h3 className="text-base font-bold text-white m-0 mt-0.5">{activePhoto.title}</h3>
                <div className="text-xs text-white/65 mt-0.5">{activePhoto.location}</div>
              </div>

              <button
                type="button"
                onClick={(e) => handleDownload(activePhoto, e)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--rh-orange)] text-white text-xs sm:text-sm font-bold border-0 cursor-pointer hover:opacity-90 shrink-0"
              >
                <Download size={15} />
                <span>Unduh HD</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
