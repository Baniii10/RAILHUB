'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Compass, Train, Award, ArrowRight, Camera, Sparkles } from 'lucide-react'

const HISTORY_ERAS = [
  {
    id: 'era-all',
    label: 'Semua Era',
  },
  {
    id: 'era-kolonial',
    label: '1864 - 1942 (Kolonial)',
  },
  {
    id: 'era-kemerdekaan',
    label: '1945 - 1980 (Kemerdekaan & Diesel)',
  },
  {
    id: 'era-modern',
    label: '1990 - Sekarang (Argo & Modern)',
  },
]

const HISTORY_EVENTS = [
  {
    id: 'h1',
    year: '1864 - 1867',
    era: 'era-kolonial',
    title: 'Peletakan Rel Pertama di Tanah Jawa',
    subtitle: 'Rute Semarang (Kemijen) – Tanggung (25 KM)',
    description:
      'Pembangunan jalur rel pertama di Indonesia dipimpin oleh perusahaan Nederlandsch-Indische Spoorweg Maatschappij (NIS). Cangkulan pertama dilakukan oleh Gubernur Jenderal Baron Sloet van de Beele pada 17 Juni 1864, membuka babak baru modernisasi transportasi di Hindia Belanda.',
    badge: 'Kelahiran Rel',
    image: '/images/gallery-train-hero.jpg',
    highlights: ['Lebar sepur standar 1.435 mm (NIS)', 'Lokomotif uap generasi pertama', 'Awal mula angkutan komoditas gula & kopi'],
  },
  {
    id: 'h2',
    year: '1925',
    era: 'era-kolonial',
    title: 'Elektrifikasi Jalur Kereta Batavia',
    subtitle: 'Rute Tanjung Priok – Meester Cornelis (Jatinegara)',
    description:
      'Indonesia menjadi salah satu pelopor elektrifikasi kereta api di Asia Tenggara pada tahun 1925 saat perayaan 50 tahun Staatsspoorwegen (SS). Jalur lingkar Batavia dialiri listrik aliran atas dengan lokomotif listrik seri ESS 3200 "Bonbon".',
    badge: 'Inovasi Listrik',
    image: '/images/gallery-train-speed.jpg',
    highlights: ['Jaringan listrik aliran atas 1500V DC', 'Lokomotif listrik legendaris Bonbon', 'Menghubungkan pelabuhan dengan pusat kota'],
  },
  {
    id: 'h3',
    year: '28 September 1945',
    era: 'era-kemerdekaan',
    title: 'Pengambilalihan DKARI & Hari Kereta Api',
    subtitle: 'Nasionalisasi Balai Besar Kereta Api Bandung',
    description:
      'Hanya sebulan setelah proklamasi kemerdekaan, para pegawai kereta api Indonesia yang tergabung dalam Angkatan Pemuda Kereta Api (AMKA) berhasil mengambil alih Balai Besar Kereta Api di Bandung dari kekuasaan Jepang. Momen heroik ini kini diperingati setiap tahun sebagai Hari Kereta Api Nasional.',
    badge: 'Hari Kereta Api',
    image: '/images/gallery-passenger-window.jpg',
    highlights: ['Lahirnya Djawatan Kereta Api RI (DKARI)', 'Kereta Luar Biasa (KLB) Presiden Soekarno ke Yogyakarta', 'Simbol kedaulatan transportasi nasional'],
  },
  {
    id: 'h4',
    year: '1953 - 1977',
    era: 'era-kemerdekaan',
    title: 'Revolusi Traksi Diesel & Lahirnya CC 201',
    subtitle: 'Peralihan Lokomotif Uap ke Diesel Elektrik Modern',
    description:
      'Pemerintah Indonesia mulai mendatangkan lokomotif diesel elektrik pertama CC 200 dari Amerika Serikat, disusul oleh armada pekerja keras legendaris CC 201 buatan General Electric (GE U18C) pada tahun 1977. Lokomotif ini mampu melahap jalur pegunungan terjal Jawa Barat dan Jawa Tengah.',
    badge: 'Era Diesel',
    image: '/images/kelas-eksekutif.jpg',
    highlights: ['Lokomotif diesel CC 200 & CC 201', 'Efisiensi waktu tempuh antarkota', 'Pensiun bertahap lokomotif uap'],
  },
  {
    id: 'h5',
    year: '1995',
    era: 'era-modern',
    title: 'Lahirnya Armada Prestisius ARGO & CC 203',
    subtitle: 'KA Argo Bromo & Argo Gede Menembus Kecepatan',
    description:
      'Menyambut 50 Tahun Kemerdekaan RI, diluncurkan kereta api super eksekutif pertama berkode JB-250 (Jakarta-Bandung 2 Jam, Jakarta-Surabaya 500 km/hari): KA Argo Bromo dan KA Argo Gede. Peluncuran ini disertai lokomotif moncong miring aerodinamis CC 203 buatan GE yang dirakit di PT INKA Madiun.',
    badge: 'Era Argo',
    image: '/images/kelas-luxury.jpg',
    highlights: ['Peluncuran KA Argo Bromo & Argo Gede', 'Kecepatan dinas hingga 120 km/jam', 'Fasilitas kabin eksekutif premium'],
  },
  {
    id: 'h6',
    year: '2012 - Sekarang',
    era: 'era-modern',
    title: 'Transformasi Digital & Kemandirian Industri',
    subtitle: 'CC 206 Double Cab, CC 300 INKA, & E-Ticketing RAILHUB',
    description:
      'Perkeretaapian Indonesia mengalami revolusi layanan terbesar: sterilisasi stasiun, sistem pemesanan online modern, kedatangan 150 unit lokomotif kabin ganda CC 206, inovasi lokomotif diesel hidrolik CC 300 karya PT INKA Madiun, hingga kereta api cepat modern.',
    badge: 'Era Masa Kini',
    image: '/images/gallery-train-hero.jpg',
    highlights: ['Lokomotif CC 206 & CC 300 buatan INKA', 'Pemesanan tiket digital instan', 'Standar keamanan & kenyamanan kelas dunia'],
  },
]

export default function RailwayHistorySection() {
  const [selectedEra, setSelectedEra] = useState('era-all')

  const filteredEvents =
    selectedEra === 'era-all'
      ? HISTORY_EVENTS
      : HISTORY_EVENTS.filter((e) => e.era === selectedEra)

  return (
    <section id="sejarah" style={{ marginTop: '3.5rem', marginBottom: '3.5rem' }}>
      {/* Header Title */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(2, 132, 199, 0.1)',
            color: 'var(--rh-primary)',
            padding: '0.4rem 1rem',
            borderRadius: 999,
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          <Compass size={16} />
          <span>Linimasa Perjalanan Bangsa</span>
        </div>

        <h2
          className="rh-h2"
          style={{
            fontSize: 'clamp(1.5rem, 3.8vw, 2.35rem)',
            fontWeight: 800,
            color: 'var(--rh-navy)',
            margin: '0 0 0.75rem',
          }}
        >
          Sejarah Jalur Rel & Kereta Api Indonesia
        </h2>

        <p
          style={{
            maxWidth: 680,
            margin: '0 auto',
            color: 'var(--rh-text-2)',
            fontSize: '0.96rem',
            lineHeight: 1.6,
          }}
        >
          Dari dentuman lokomotif uap pertama di Kemijen pada tahun 1864 hingga era armada diesel elektrik modern dan kereta api cepat berteknologi mutakhir.
        </p>
      </div>

      {/* Era Filter Pills */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {HISTORY_ERAS.map((era) => {
          const isActive = selectedEra === era.id
          return (
            <button
              key={era.id}
              type="button"
              onClick={() => setSelectedEra(era.id)}
              className="rh-btn rh-btn-sm"
              style={{
                borderRadius: 999,
                padding: '0.5rem 1.15rem',
                fontSize: '0.84rem',
                fontWeight: isActive ? 800 : 600,
                background: isActive ? 'var(--rh-primary)' : 'var(--rh-surface)',
                color: isActive ? '#ffffff' : 'var(--rh-text-1)',
                border: isActive ? '1px solid var(--rh-primary)' : '1px solid var(--rh-border)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {era.label}
            </button>
          )
        })}
      </div>

      {/* Interactive Timeline Grid */}
      <div style={{ display: 'grid', gap: '2rem' }}>
        {filteredEvents.map((event, index) => {
          const isEven = index % 2 === 0
          return (
            <article
              key={event.id}
              className="rh-card"
              style={{
                padding: 0,
                borderRadius: 20,
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                border: '1px solid var(--rh-border)',
                boxShadow: '0 8px 24px rgba(7, 26, 56, 0.08)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {/* Photo Illustration */}
              <div
                style={{
                  position: 'relative',
                  minHeight: 260,
                  order: isEven ? 1 : 2,
                  background: '#07162C',
                }}
              >
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 500px"
                  style={{ objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(7,22,44,0.1) 0%, rgba(7,22,44,0.7) 100%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    right: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.92)',
                      color: 'var(--rh-navy)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: 999,
                      fontSize: '0.78rem',
                      fontWeight: 800,
                    }}
                  >
                    {event.badge}
                  </span>
                  <span
                    style={{
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                    }}
                  >
                    Arsip Foto RAILHUB
                  </span>
                </div>
              </div>

              {/* Text Information Content */}
              <div
                style={{
                  padding: 'clamp(1.5rem, 3vw, 2.25rem)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  order: isEven ? 2 : 1,
                  background: 'var(--rh-surface)',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: '#F97316',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <Calendar size={16} />
                  <span>{event.year}</span>
                </div>

                <h3
                  style={{
                    fontSize: 'clamp(1.2rem, 2.2vw, 1.45rem)',
                    fontWeight: 800,
                    color: 'var(--rh-navy)',
                    margin: '0 0 0.35rem',
                  }}
                >
                  {event.title}
                </h3>

                <h4
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--rh-primary)',
                    margin: '0 0 0.85rem',
                  }}
                >
                  {event.subtitle}
                </h4>

                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--rh-text-2)',
                    lineHeight: 1.6,
                    margin: '0 0 1.25rem',
                  }}
                >
                  {event.description}
                </p>

                {/* Highlights List */}
                <div style={{ display: 'grid', gap: '0.4rem', borderTop: '1px solid var(--rh-border)', paddingTop: '1rem' }}>
                  {event.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--rh-text-1)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F97316' }} />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* Direct CTA to Photo Gallery */}
      <div
        style={{
          marginTop: '3rem',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          borderRadius: 20,
          padding: '2rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 12px 30px rgba(2, 132, 199, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Camera size={14} />
            <span>Koleksi Foto & Wallpaper HD</span>
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.35rem', color: '#ffffff' }}>
            Ingin Mengoleksi Foto Lokomotif & Suasana Kereta Api?
          </h3>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.88)', maxWidth: 580 }}>
            Kunjungi sub-halaman galeri foto kami untuk melihat dan mengunduh foto resolusi tinggi lokomotif CC 206, CC 201, CC 203, CC 300, serta lanskap jalur kereta di Pulau Jawa.
          </p>
        </div>

        <Link
          href="/railfans/galeri"
          className="rh-btn"
          style={{
            background: '#ffffff',
            color: 'var(--rh-primary)',
            fontWeight: 800,
            padding: '0.75rem 1.5rem',
            borderRadius: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}
        >
          <span>Buka Galeri Foto</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}

