'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp } from 'lucide-react'

const HISTORY_ERAS = [
  { id: 'era-all', label: 'Semua' },
  { id: 'era-kolonial', label: '1864–1942' },
  { id: 'era-kemerdekaan', label: '1945–1980' },
  { id: 'era-modern', label: '1990–Sekarang' },
]

const HISTORY_EVENTS = [
  {
    id: 'h1',
    year: '1864',
    era: 'era-kolonial',
    title: 'Rel Pertama di Tanah Jawa',
    location: 'Semarang Kemijen – Tanggung (25 km)',
    description:
      'Nederlandsch-Indische Spoorweg Maatschappij (NIS) membuka jalur kereta api pertama di Indonesia untuk angkutan komoditas.',
    image: '/images/history-1864-steam.jpg',
  },
  {
    id: 'h2',
    year: '1925',
    era: 'era-kolonial',
    title: 'Elektrifikasi Jalur Batavia',
    location: 'Tanjung Priok – Jatinegara',
    description:
      'Staatsspoorwegen mengoperasikan lokomotif listrik seri ESS 3200 "Bonbon" bertegangan 1500V DC sebagai pelopor di Asia Tenggara.',
    image: '/images/history-1945-dkari.jpg',
  },
  {
    id: 'h3',
    year: '28 Sep 1945',
    era: 'era-kemerdekaan',
    title: 'Lahirnya DKARI & Hari Kereta Api',
    location: 'Balai Besar Kereta Api, Bandung',
    description:
      'Angkatan Pemuda Kereta Api mengambil alih operasional perkeretaapian nasional dan membentuk Djawatan Kereta Api Republik Indonesia.',
    image: '/images/history-1945-dkari.jpg',
  },
  {
    id: 'h4',
    year: '1977',
    era: 'era-kemerdekaan',
    title: 'Era Diesel Elektrik & CC 201',
    location: 'Lintas Jawa & Sumatera',
    description:
      'Kehadiran lokomotif General Electric U18C (CC 201) menggantikan traksi uap di jalur pegunungan terjal Jawa Barat dan Tengah.',
    image: '/images/gallery-train-speed.jpg',
  },
  {
    id: 'h5',
    year: '1995',
    era: 'era-modern',
    title: 'Lahirnya KA Argo & CC 203',
    location: 'Jakarta – Bandung & Surabaya',
    description:
      'Peluncuran layanan eksekutif berkecepatan 120 km/jam dengan lokomotif moncong miring aerodinamis CC 203.',
    image: '/images/gallery-train-hero.jpg',
  },
  {
    id: 'h6',
    year: '2012–Kini',
    era: 'era-modern',
    title: 'Modernisasi CC 206 & CC 300 INKA',
    location: 'Seluruh Jaringan KAI',
    description:
      'Pengoperasian 150 unit lokomotif kabin ganda CC 206, inovasi diesel hidrolik CC 300 karya PT INKA Madiun, dan tiket digital terpadu.',
    image: '/images/loco-cc300-inka.jpg',
  },
]

export default function RailwayHistorySection() {
  const [expanded, setExpanded] = useState(false)
  const [selectedEra, setSelectedEra] = useState('era-all')

  const filteredEvents =
    selectedEra === 'era-all'
      ? HISTORY_EVENTS
      : HISTORY_EVENTS.filter((e) => e.era === selectedEra)

  const visibleEvents = expanded ? filteredEvents : HISTORY_EVENTS.slice(0, 2)

  return (
    <section id="sejarah" className="space-y-4">
      {/* Header + Era Filter (only shown when expanded) */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-3 border-b border-[var(--rh-border)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--rh-blue)] m-0">
            Sejarah Rel Indonesia
          </h2>
          <p className="text-xs sm:text-sm text-[var(--rh-text)] opacity-80 m-0 mt-0.5">
            Jejak jalur pertama Kemijen 1864 hingga armada modern.
          </p>
        </div>

        {expanded && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {HISTORY_ERAS.map((era) => {
              const isActive = selectedEra === era.id
              return (
                <button
                  key={era.id}
                  type="button"
                  onClick={() => setSelectedEra(era.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[var(--rh-blue)] text-white'
                      : 'bg-white text-[var(--rh-text)] border border-[var(--rh-border)] hover:border-[var(--rh-blue)]'
                  }`}
                >
                  {era.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Timeline Preview / Full List */}
      <div className="divide-y divide-[var(--rh-border)]">
        {visibleEvents.map((event) => (
          <article
            key={event.id}
            className="py-4 first:pt-1 grid grid-cols-1 md:grid-cols-[105px_210px_1fr] gap-3 md:gap-5 items-start"
          >
            <div className="text-sm font-extrabold text-[var(--rh-orange)] tracking-wide">
              {event.year}
            </div>

            <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-[#0b1626]">
              <Image
                src={event.image}
                alt={event.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 210px"
                className="object-cover"
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[var(--rh-blue)] m-0">
                {event.title}
              </h3>
              <div className="text-xs font-semibold text-[var(--rh-text-3)]">
                {event.location}
              </div>
              <p className="text-xs sm:text-sm text-[var(--rh-text)] opacity-85 m-0 leading-relaxed max-w-2xl">
                {event.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Expand / Collapse Toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => {
            setExpanded((prev) => !prev)
            if (expanded) setSelectedEra('era-all')
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--rh-border)] bg-white text-xs sm:text-sm font-bold text-[var(--rh-blue)] cursor-pointer hover:border-[var(--rh-blue)] transition-colors"
        >
          <span>{expanded ? 'Tutup Linimasa Lengkap' : `Baca Selengkapnya (${HISTORY_EVENTS.length - 2} Era Lainnya)`}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
    </section>
  )
}
