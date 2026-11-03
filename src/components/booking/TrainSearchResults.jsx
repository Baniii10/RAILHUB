'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatDuration, formatIDR, formatTime } from '@/lib/utils/formatters'
import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  MapPin,
  PlugZap,
  RefreshCw,
  Snowflake,
  Train,
  Utensils,
  Users,
  X,
} from 'lucide-react'

const interiorPhotos = [
  {
    src: '/images/interior-eksekutif.jpg',
    alt: 'Contoh interior kelas eksekutif kereta Argo Dwipangga',
    title: 'Contoh interior kelas eksekutif',
    creator: 'Lavie Lengkey',
    source: 'https://commons.wikimedia.org/wiki/File:Interior_KA_Argo_Dwipangga.JPG',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
  },
  {
    src: '/images/interior-ekonomi.jpg',
    alt: 'Contoh interior kelas ekonomi kereta Kamandaka',
    title: 'Contoh interior kelas ekonomi',
    creator: 'Aldio Yudha Trisandy',
    source: 'https://commons.wikimedia.org/wiki/File:Kamandaka-Int01.JPG',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
]

function TrainDetailsDialog({ row, date, onClose, closeButtonRef }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [closeButtonRef])

  function handleDialogKeyDown(event) {
    if (event.key === 'Escape') {
      onClose()
      return
    }

    if (event.key !== 'Tab') return

    const focusableElements = dialogRef.current?.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (!focusableElements?.length) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  return (
    <div
      className="rh-train-details-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        className="rh-train-details-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="train-details-title"
        onKeyDown={handleDialogKeyDown}
      >
        <div className="rh-train-details-heading">
          <div>
            <span className="rh-badge rh-badge-primary">Detail perjalanan</span>
            <h2 id="train-details-title" className="rh-h3">{row.train_name}</h2>
            <p>{row.train_number} · {row.carriage_class}</p>
          </div>
          <button
            ref={closeButtonRef}
            className="rh-btn rh-btn-ghost rh-btn-icon"
            type="button"
            aria-label="Tutup detail perjalanan"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="rh-train-details-route">
          <div>
            <span className="rh-train-details-label">Berangkat</span>
            <strong>{formatTime(row.departure_time)}</strong>
            <span>{row.origin_name}</span>
            <small>{row.origin_code} · {row.origin_city || 'Indonesia'}</small>
          </div>
          <div className="rh-train-details-route-line" aria-hidden="true">→</div>
          <div>
            <span className="rh-train-details-label">Tiba</span>
            <strong>{formatTime(row.arrival_time)}</strong>
            <span>{row.destination_name}</span>
            <small>{row.destination_code} · {row.destination_city || 'Indonesia'}</small>
          </div>
        </div>

        <dl className="rh-train-details-facts">
          <div><dt>Tanggal</dt><dd>{formatDate(`${date}T12:00:00`)}</dd></div>
          <div><dt>Durasi</dt><dd>{formatDuration(row.departure_time, row.arrival_time)}</dd></div>
          <div><dt>Jarak</dt><dd>{row.distance_km ? `${row.distance_km} km` : 'Antarkota'}</dd></div>
          <div><dt>Kursi tersedia</dt><dd>{row.available_seats}</dd></div>
          <div><dt>Status</dt><dd>{row.status === 'delayed' ? 'Tertunda' : row.status === 'boarding' ? 'Boarding' : 'Terjadwal'}</dd></div>
          <div><dt>Tarif per penumpang</dt><dd>{formatIDR(row.price)}</dd></div>
        </dl>

        <div className="rh-train-details-section">
          <h3 className="rh-h4">Contoh fasilitas umum</h3>
          <p>Fasilitas berikut merupakan gambaran umum dan bukan konfirmasi perlengkapan pada perjalanan ini.</p>
          <div className="rh-train-amenities">
            <span><Snowflake size={17} /> Pendingin udara</span>
            <span><PlugZap size={17} /> Stop kontak</span>
            <span><BriefcaseBusiness size={17} /> Rak bagasi</span>
            <span><Utensils size={17} /> Layanan makan</span>
          </div>
        </div>

        <div className="rh-train-details-section">
          <h3 className="rh-h4">Foto interior referensi</h3>
          <p>Foto adalah contoh interior dari layanan kereta lain, bukan foto pasti armada pada jadwal ini.</p>
          <div className="rh-train-interior-gallery">
            {interiorPhotos.map(photo => (
              <figure key={photo.src}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={800}
                  height={500}
                  sizes="(max-width: 560px) 100vw, 50vw"
                  loading="eager"
                  unoptimized
                />
                <figcaption>
                  <strong>{photo.title}</strong>
                  <span>
                    Foto: {photo.creator} ·{' '}
                    <a href={photo.source} target="_blank" rel="noreferrer">Sumber Wikimedia Commons</a>
                    {' '}· <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function SearchError({ message, onRetry }) {
  return (
    <div role="alert" className="rh-card" style={{ padding: '1.5rem', borderColor: 'var(--rh-danger)' }}>
      <h2 className="rh-h4" style={{ color: 'var(--rh-danger)' }}>Jadwal belum dapat dimuat</h2>
      <p style={{ color: 'var(--rh-text-2)', margin: '0.5rem 0 1rem' }}>{message}</p>
      <button type="button" className="rh-btn rh-btn-primary" onClick={onRetry}>
        <RefreshCw size={16} /> Coba lagi
      </button>
    </div>
  )
}

export default function TrainSearchResults({ origin, destination, date, passengers }) {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sort, setSort] = useState('departure')
  const [classFilter, setClassFilter] = useState('all')
  const [reloadKey, setReloadKey] = useState(0)
  const [detailRow, setDetailRow] = useState(null)
  const detailTriggerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const bookingSearch = new URLSearchParams({
    from: origin,
    to: destination,
    date,
    pax: String(passengers),
  }).toString()

  const closeDetails = useCallback(() => {
    setDetailRow(null)
    detailTriggerRef.current?.focus()
  }, [])

  useEffect(() => {
    let active = true
    const supabase = createClient()

    async function loadResults() {
      setLoading(true)
      setError('')
      const { data, error: queryError } = await supabase.rpc('search_train_schedules', {
        p_origin_code: origin,
        p_destination_code: destination,
        p_departure_date: date,
        p_passengers: passengers,
      })

      if (!active) return
      if (queryError) {
        setError(`Pencarian jadwal gagal. Pastikan migrasi pencarian RAILHUB sudah diterapkan di Supabase. Detail: ${queryError.message}`)
        setRows([])
      } else {
        setRows(data ?? [])
      }
      setLoading(false)
    }

    loadResults()
    return () => { active = false }
  }, [origin, destination, date, passengers, reloadKey])

  const availableClasses = useMemo(
    () => [...new Set(rows.map(row => row.carriage_class))].sort(),
    [rows]
  )

  const filteredRows = useMemo(() => {
    const filtered = rows.filter(row => classFilter === 'all' || row.carriage_class === classFilter)
    return filtered.sort((a, b) => {
      if (sort === 'price') return Number(a.price) - Number(b.price)
      if (sort === 'duration') {
        return new Date(a.arrival_time) - new Date(a.departure_time)
          - (new Date(b.arrival_time) - new Date(b.departure_time))
      }
      return new Date(a.departure_time) - new Date(b.departure_time)
    })
  }, [rows, sort, classFilter])

  return (
    <section>
      <div style={{ marginBottom: '1.75rem' }}>
        <span className="rh-badge rh-badge-primary" style={{ marginBottom: '0.75rem' }}>
          <CalendarDays size={13} /> {formatDate(`${date}T12:00:00`)}
        </span>
        <h1 className="rh-h2">Pilih perjalanan Anda</h1>
        <p style={{ color: 'var(--rh-text-2)', marginTop: '0.5rem' }}>
          {origin} <span aria-hidden="true">→</span> {destination}
          <span style={{ marginLeft: '1rem' }}>
            <Users size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {passengers} penumpang
          </span>
        </p>
      </div>

      <div className="rh-card" style={{ marginBottom: '1rem' }}>
        <div className="rh-card-body" style={{
          display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'end',
        }}>
          <label style={{ display: 'grid', gap: '0.375rem', minWidth: 190 }}>
            <span className="rh-label-text">Urutkan berdasarkan</span>
            <select className="rh-input" value={sort} onChange={event => setSort(event.target.value)}>
              <option value="departure">Waktu keberangkatan</option>
              <option value="price">Harga terendah</option>
              <option value="duration">Durasi tercepat</option>
            </select>
          </label>
          <label style={{ display: 'grid', gap: '0.375rem', minWidth: 190 }}>
            <span className="rh-label-text">Kelas kereta</span>
            <select className="rh-input" value={classFilter} onChange={event => setClassFilter(event.target.value)}>
              <option value="all">Semua kelas</option>
              {availableClasses.map(trainClass => (
                <option key={trainClass} value={trainClass}>{trainClass}</option>
              ))}
            </select>
          </label>
          <span aria-live="polite" style={{ marginLeft: 'auto', color: 'var(--rh-text-2)', fontSize: '0.9rem' }}>
            {loading ? 'Memuat jadwal...' : `${filteredRows.length} pilihan kelas tersedia`}
          </span>
        </div>
      </div>

      {error && <SearchError message={error} onRetry={() => setReloadKey(key => key + 1)} />}

      {loading && !error && (
        <div aria-live="polite" className="rh-card" style={{ padding: '2rem', color: 'var(--rh-text-2)' }}>
          Memuat jadwal dari database...
        </div>
      )}

      {!loading && !error && filteredRows.length === 0 && (
        <div className="rh-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <Train size={30} style={{ color: 'var(--rh-text-3)', marginBottom: '0.75rem' }} />
          <h2 className="rh-h4">Tidak ada jadwal yang cocok</h2>
          <p style={{ color: 'var(--rh-text-2)', marginTop: '0.5rem' }}>
            Coba tanggal atau rute lain. Jadwal yang ditampilkan berasal dari data simulasi yang tersedia.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {filteredRows.map(row => (
          <article key={`${row.schedule_id}-${row.carriage_class}`} className="rh-card">
            <div className="rh-card-body" style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div className="rh-logo-mark"><Train size={18} /></div>
                <div>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{row.train_name}</h2>
                  <p style={{ color: 'var(--rh-text-2)', fontSize: '0.875rem', margin: 0 }}>
                    {row.train_number} · {row.carriage_class}
                  </p>
                </div>
                <span className="rh-badge rh-badge-primary" style={{ marginLeft: 'auto' }}>
                  {row.status === 'delayed' ? 'Tertunda' : row.status === 'boarding' ? 'Boarding' : 'Terjadwal'}
                </span>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center',
              }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.25rem' }}>{formatTime(row.departure_time)}</strong>
                  <span style={{ fontWeight: 600 }}>{row.origin_name}</span>
                  <small style={{ display: 'block', color: 'var(--rh-text-3)' }}>{row.origin_code} · {row.origin_city || 'Indonesia'}</small>
                </div>
                <div style={{ textAlign: 'center', color: 'var(--rh-text-3)', minWidth: 95 }}>
                  <span style={{ display: 'block', fontSize: '0.8125rem' }}>
                    {formatDuration(row.departure_time, row.arrival_time)}
                  </span>
                  <span aria-hidden="true">────────</span>
                  <span style={{ display: 'block' }}><MapPin size={14} style={{ verticalAlign: 'middle' }} /></span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ display: 'block', fontSize: '1.25rem' }}>{formatTime(row.arrival_time)}</strong>
                  <span style={{ fontWeight: 600 }}>{row.destination_name}</span>
                  <small style={{ display: 'block', color: 'var(--rh-text-3)' }}>{row.destination_code} · {row.destination_city || 'Indonesia'}</small>
                </div>
              </div>

              <div style={{
                borderTop: '1px solid var(--rh-border)', paddingTop: '1rem',
                display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
                gap: '1rem', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: 'var(--rh-text-2)', fontSize: '0.875rem' }}>
                  <span><Clock3 size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {row.distance_km ? `${row.distance_km} km` : 'Perjalanan antarkota'}</span>
                  <span><Users size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {row.available_seats} kursi tersedia</span>
                </div>
                <div className="rh-train-result-actions">
                  <div style={{ textAlign: 'right' }}>
                    <small style={{ display: 'block', color: 'var(--rh-text-3)' }}>Mulai dari / penumpang</small>
                    <strong style={{ color: 'var(--rh-primary)', fontSize: '1.2rem' }}>{formatIDR(row.price)}</strong>
                  </div>
                  <div className="rh-train-result-buttons">
                    <button
                      type="button"
                      className="rh-btn rh-btn-secondary"
                      onClick={event => {
                        detailTriggerRef.current = event.currentTarget
                        setDetailRow(row)
                      }}
                    >
                      Lihat detail
                    </button>
                    <Link
                      href={user
                        ? `/booking/${row.schedule_id}?class=${encodeURIComponent(row.carriage_class)}&${bookingSearch}`
                        : `/auth/login?next=${encodeURIComponent(`/booking/${row.schedule_id}?class=${encodeURIComponent(row.carriage_class)}&${bookingSearch}`)}`}
                      className="rh-btn rh-btn-primary"
                      aria-label={`${user ? 'Pesan tiket' : 'Masuk untuk memesan'} ${row.train_name}`}
                    >
                      {user ? 'Pesan tiket' : 'Masuk untuk memesan'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      {detailRow && (
        <TrainDetailsDialog
          row={detailRow}
          date={date}
          onClose={closeDetails}
          closeButtonRef={closeButtonRef}
        />
      )}
    </section>
  )
}
