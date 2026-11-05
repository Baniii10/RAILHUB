'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatDuration, formatIDR, formatTime } from '@/lib/utils/formatters'
import { getStationByCode } from '@/lib/data/stationsCatalog'
import { RailHubTrainLogo } from '@/components/ui/VectorLogos'
import { TrainTrackLoader, ScheduleCardSkeleton } from '@/components/ui/RailLoader'
import SearchWidget from '@/components/booking/SearchWidget'
import {
  ArrowLeft,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Info,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Train,
  Users,
  Utensils,
  Wifi,
  X,
  Zap,
} from 'lucide-react'

// Helper for date calculations
function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  return [
    dt.getUTCFullYear(),
    String(dt.getUTCMonth() + 1).padStart(2, '0'),
    String(dt.getUTCDate()).padStart(2, '0'),
  ].join('-')
}

function getDayLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  const today = new Date()
  const todayStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  const dayName = dt.toLocaleDateString('id-ID', { weekday: 'short' })
  const dateFormatted = dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

  if (dateStr === todayStr) {
    return { dayName: 'Hari ini', dateFormatted, isToday: true }
  }
  return { dayName, dateFormatted, isToday: false }
}

export default function TrainSearchResults({ origin, destination, date, returnDate = null, passengers }) {
  const router = useRouter()
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [classFilter, setClassFilter] = useState('Semua')
  const [sortBy, setSortBy] = useState('departure') // 'departure' | 'price' | 'duration' | 'arrival'
  const [timeFilter, setTimeFilter] = useState('all') // 'all' | 'morning' | 'noon' | 'afternoon' | 'night'
  const [expandedId, setExpandedId] = useState(null)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showSortModal, setShowSortModal] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [activeLeg, setActiveLeg] = useState('outbound') // 'outbound' | 'inbound'
  const [selectedOutbound, setSelectedOutbound] = useState(null)

  const originStation = useMemo(() => getStationByCode(origin) || { code: origin, name: origin, city: 'Indonesia' }, [origin])
  const destinationStation = useMemo(() => getStationByCode(destination) || { code: destination, name: destination, city: 'Indonesia' }, [destination])

  // Keep the date strip compact: one day before and three days after.
  const dateTabs = useMemo(() => {
    const tabs = []
    for (let offset = -1; offset <= 3; offset++) {
      const effectiveDate = activeLeg === 'inbound' && returnDate ? returnDate : date
      const tabDate = addDays(effectiveDate, offset)
      const { dayName, dateFormatted, isToday } = getDayLabel(tabDate)
      tabs.push({
        date: tabDate,
        dayName,
        dateFormatted,
        isToday,
        isActive: tabDate === (activeLeg === 'inbound' && returnDate ? returnDate : date),
      })
    }
    return tabs
  }, [date])

  // Fetch bookable schedules from the database.
  useEffect(() => {
    let active = true
    async function loadData() {
      setLoading(true)
      setError('')

      try {
        const supabase = createClient()
        // 1. Attempt Supabase query
        const currentOrigin = activeLeg === 'inbound' ? destination : origin
        const currentDestination = activeLeg === 'inbound' ? origin : destination
        const currentDate = activeLeg === 'inbound' && returnDate ? returnDate : date

        const { data: dbData, error: dbError } = await supabase.rpc('search_train_schedules', {
          p_origin_code: currentOrigin,
          p_destination_code: currentDestination,
          p_departure_date: currentDate,
          p_passengers: passengers,
        })

        if (!active) return
        if (dbError) throw dbError

        const results = (dbData || []).map(row => ({
            ...row,
            subclass: 'CA',
            class_label: `${row.carriage_class} (CA)`,
            departure_time_label: formatTime(row.departure_time),
            arrival_time_label: formatTime(row.arrival_time),
            duration: formatDuration(row.departure_time, row.arrival_time),
            is_next_day: new Date(row.arrival_time).getUTCDate() !== new Date(row.departure_time).getUTCDate(),
            badges: row.price < 350000 ? ['termurah'] : ['rekomendasi'],
          }))

        setRows(results)
      } catch (err) {
        if (!active) return
        setRows([])
        setError(`Jadwal tidak dapat dimuat: ${err.message || 'Terjadi kesalahan.'}`)
      } finally {
        if (active) {
          // Subtle polish timeout for smooth animation
          setTimeout(() => setLoading(false), 300)
        }
      }
    }

    loadData()
    return () => { active = false }
  }, [origin, destination, date, returnDate, activeLeg, passengers, reloadKey])

  // Available classes for filter chips
  const classOptions = useMemo(() => {
    const classes = ['Semua']
    const unique = [...new Set(rows.map(r => r.carriage_class))]
    unique.forEach(c => {
      if (c && !classes.includes(c)) classes.push(c)
    })
    return classes
  }, [rows])

  // Filter & Sort
  const filteredAndSortedRows = useMemo(() => {
    let result = [...rows]

    // Class filter
    if (classFilter !== 'Semua') {
      result = result.filter(r => r.carriage_class === classFilter)
    }

    // Departure time window filter
    if (timeFilter !== 'all') {
      result = result.filter(r => {
        const depDate = new Date(r.departure_time)
        const hour = depDate.getUTCHours() + 7 // Asia/Jakarta
        const h = (hour + 24) % 24
        if (timeFilter === 'morning') return h >= 0 && h < 6
        if (timeFilter === 'noon') return h >= 6 && h < 12
        if (timeFilter === 'afternoon') return h >= 12 && h < 18
        if (timeFilter === 'night') return h >= 18 && h < 24
        return true
      })
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'price') return Number(a.price) - Number(b.price)
      if (sortBy === 'duration') {
        const durA = new Date(a.arrival_time) - new Date(a.departure_time)
        const durB = new Date(b.arrival_time) - new Date(b.departure_time)
        return durA - durB
      }
      if (sortBy === 'arrival') {
        return new Date(a.arrival_time) - new Date(b.arrival_time)
      }
      // default: departure time
      return new Date(a.departure_time) - new Date(b.departure_time)
    })

    return result
  }, [rows, classFilter, timeFilter, sortBy])

  function handleSelectDate(newDate) {
    if (newDate === date) return
    const params = new URLSearchParams({
      from: origin,
      to: destination,
      date: newDate,
      pax: String(passengers),
    })
    router.push(`/trains?${params.toString()}`)
  }

  function toggleExpand(id) {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <div className="rh-trains-results" style={{ maxWidth: 840, margin: '0 auto', width: '100%', paddingBottom: '1rem' }}>
      {/* ============================================================
          TOP APP HEADER BAR (Matches Screenshot 2 Blue Header)
          ============================================================ */}
      <header
        style={{
          background: 'var(--rh-primary)',
          color: '#ffffff',
          borderRadius: 12,
          padding: '0.875rem 1rem',
          marginBottom: '0.5rem',
          boxShadow: '0 4px 14px rgba(26, 66, 138, 0.2)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <button
            type="button"
            onClick={() => router.back()}
            className="rh-btn rh-btn-ghost"
            style={{
              color: '#ffffff',
              padding: '0.4rem',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
            }}
            aria-label="Kembali"
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                margin: 0,
                color: '#ffffff',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {originStation.name} <span style={{ opacity: 0.8 }}>–</span> {destinationStation.name}
            </h1>
            <p
              style={{
                fontSize: '0.825rem',
                color: 'rgba(255, 255, 255, 0.85)',
                margin: '0.2rem 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <span>{formatDate(`${date}T12:00:00`, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span>•</span>
              <span>{passengers} Dewasa, 0 Bayi</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSearchModal(v => !v)}
            className="rh-btn rh-btn-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: 20,
              padding: '0.4rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              gap: '0.35rem',
              backdropFilter: 'blur(8px)',
              whiteSpace: 'nowrap',
            }}
          >
            <Search size={14} /> Ganti Rute
          </button>
        </div>

        {/* Inline Search Modal/Collapse */}
        {showSearchModal && (
          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <div style={{ background: '#ffffff', borderRadius: 14, padding: '1.25rem', color: 'var(--rh-charcoal)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--rh-navy)' }}>Ubah Pencarian Tiket</strong>
                <button
                  type="button"
                  onClick={() => setShowSearchModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rh-text-3)' }}
                >
                  <X size={18} />
                </button>
              </div>
              <SearchWidget
                compact={true}
                initialOrigin={origin}
                initialDestination={destination}
                initialDate={date}
                initialPax={passengers}
                onSearch={() => setShowSearchModal(false)}
              />
            </div>
          </div>
        )}
      </header>

      {/* ============================================================
          HORIZONTAL DATE CAROUSEL (Matches Screenshot 2 Date Strip)
          ============================================================ */}
      <section
        aria-label="Pilih tanggal keberangkatan"
        style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid var(--rh-border)',
          padding: '0.25rem',
          marginBottom: '0.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '0.25rem',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            padding: 0,
          }}
        >
          {dateTabs.map(tab => (
            <button
              key={tab.date}
              type="button"
              onClick={() => handleSelectDate(tab.date)}
              style={{
                flex: '0 0 auto',
                minWidth: '76px',
                padding: '0.45rem 0.4rem',
                borderRadius: 10,
                border: tab.isActive ? '2px solid var(--rh-accent)' : '1px solid transparent',
                background: tab.isActive ? 'rgba(255, 140, 0, 0.08)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: tab.isActive ? 800 : 600,
                  color: tab.isActive ? 'var(--rh-accent-dark)' : 'var(--rh-text)',
                  lineHeight: 1.2,
                }}
              >
                {tab.dateFormatted}
              </div>
              <div
                style={{
                  fontSize: '0.725rem',
                  fontWeight: tab.isActive ? 700 : 500,
                  color: tab.isActive ? 'var(--rh-accent)' : 'var(--rh-text-3)',
                  marginTop: '0.2rem',
                }}
              >
                {tab.dayName}
              </div>
              {tab.isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    left: '25%',
                    right: '25%',
                    height: 3,
                    background: 'var(--rh-accent)',
                    borderRadius: 2,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </section>

      <aside
        aria-label="Filter dan urutkan jadwal"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1px 1fr',
          alignItems: 'center',
          marginBottom: '0.5rem',
          border: '1px solid var(--rh-border)',
          borderRadius: 12,
          background: '#ffffff',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <button
          type="button"
          onClick={() => setShowSortModal(true)}
          style={{
            display: 'flex',
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            border: 0,
            background: 'transparent',
            color: 'var(--rh-navy)',
            fontSize: '0.8rem',
            fontWeight: 750,
            cursor: 'pointer',
          }}
        >
          <ArrowUpDown size={15} style={{ color: 'var(--rh-accent)' }} />
          Urutkan
        </button>

        <span style={{ width: 1, height: 24, background: 'var(--rh-border)' }} />

        <button
          type="button"
          onClick={() => setShowFilterModal(true)}
          style={{
            display: 'flex',
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            border: 0,
            background: 'transparent',
            color: 'var(--rh-navy)',
            fontSize: '0.8rem',
            fontWeight: 750,
            cursor: 'pointer',
          }}
        >
          <Filter size={15} style={{ color: 'var(--rh-accent)' }} />
          Filter
          {(classFilter !== 'Semua' || timeFilter !== 'all') && (
            <span aria-label="Filter aktif" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--rh-accent)' }} />
          )}
        </button>
      </aside>

      {/* ============================================================
          CLASS FILTER PILLS (Matches Screenshot 2 Filter Chips)
          ============================================================ */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.125rem',
          marginBottom: '0.625rem',
          scrollbarWidth: 'none',
        }}
      >
        {classOptions.map(cls => {
          const isSelected = classFilter === cls
          return (
            <button
              key={cls}
              type="button"
              onClick={() => setClassFilter(cls)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 9999,
                fontSize: '0.85rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                border: isSelected ? '1.5px solid var(--rh-accent)' : '1px solid var(--rh-border)',
                background: isSelected ? 'rgba(255, 140, 0, 0.12)' : '#ffffff',
                color: isSelected ? 'var(--rh-accent-dark)' : 'var(--rh-text-2)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 2px 8px rgba(255, 140, 0, 0.2)' : 'none',
              }}
            >
              {cls}
            </button>
          )
        })}
      </div>

      {/* ============================================================
          LOADING STATE (Custom RailHub Palette Loader)
          ============================================================ */}
      {loading && (
        <div>
          <div className="rh-card" style={{ marginBottom: '1rem', background: '#ffffff', borderRadius: 16 }}>
            <TrainTrackLoader
              text="Mencari jadwal kereta terbaik…"
              subtext={`Menghubungkan stasiun ${origin} menuju ${destination}`}
            />
          </div>
          <ScheduleCardSkeleton />
          <ScheduleCardSkeleton />
          <ScheduleCardSkeleton />
        </div>
      )}

      {/* ============================================================
          ERROR OR EMPTY STATE
          ============================================================ */}
      {!loading && filteredAndSortedRows.length === 0 && (
        <div className="rh-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', background: '#ffffff', borderRadius: 16 }}>
          <Train size={36} style={{ color: 'var(--rh-primary)', margin: '0 auto 1rem', opacity: 0.7 }} />
          <h2 className="rh-h3" style={{ margin: 0 }}>Tidak ada jadwal ditemukan</h2>
          <p style={{ color: 'var(--rh-text-2)', margin: '0.5rem auto 1.5rem', maxWidth: 440, fontSize: '0.9rem' }}>
            {error || <>Tidak ada kereta yang sesuai dengan filter kelas <strong>{classFilter}</strong> untuk tanggal ini. Coba pilih kelas &quot;Semua&quot; atau tanggal keberangkatan lain.</>}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="rh-btn rh-btn-primary"
              onClick={() => { setClassFilter('Semua'); setTimeFilter('all') }}
            >
              Reset Semua Filter
            </button>
            <button
              type="button"
              className="rh-btn rh-btn-secondary"
              onClick={() => setShowSearchModal(true)}
            >
              Ganti Rute Stasiun
            </button>
          </div>
        </div>
      )}

      {/* Pulang-Pergi (PP) Progress Stepper Banner */}
      {returnDate && (
        <div style={{
          marginBottom: '1rem',
          padding: '1rem 1.25rem',
          borderRadius: 14,
          background: activeLeg === 'outbound' ? 'rgba(26, 66, 138, 0.06)' : 'rgba(34, 197, 94, 0.08)',
          border: `1.5px solid ${activeLeg === 'outbound' ? 'var(--rh-primary)' : '#22c55e'}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 4 }}>
              <span className={`rh-badge ${activeLeg === 'outbound' ? 'rh-badge-primary' : 'rh-badge-success'}`} style={{ fontWeight: 800 }}>
                {activeLeg === 'outbound' ? 'Langkah 1 dari 2' : 'Langkah 2 dari 2'}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: activeLeg === 'outbound' ? 'var(--rh-primary)' : '#15803d' }}>
                {activeLeg === 'outbound' ? 'Perjalanan Pergi' : 'Perjalanan Pulang'}
              </span>
            </div>
            <strong style={{ fontSize: '1.05rem', display: 'block', color: 'var(--rh-text-1)' }}>
              {activeLeg === 'outbound'
                ? `Pilih Kereta Pergi: ${originStation.name} (${origin}) → ${destinationStation.name} (${destination})`
                : `Pilih Kereta Pulang: ${destinationStation.name} (${destination}) → ${originStation.name} (${origin})`}
            </strong>
            <small style={{ color: 'var(--rh-text-2)' }}>
              {activeLeg === 'outbound'
                ? `Tanggal Berangkat: ${formatDate(date)} • Tanggal Pulang: ${formatDate(returnDate)}`
                : `Tanggal Pulang: ${formatDate(returnDate)} • Kereta Pergi: ${selectedOutbound?.train_name} (${selectedOutbound?.carriage_class})`}
            </small>
          </div>

          {activeLeg === 'inbound' && (
            <button
              type="button"
              onClick={() => {
                setActiveLeg('outbound')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="rh-btn rh-btn-ghost rh-btn-sm"
              style={{ border: '1px solid #86efac', color: '#15803d' }}
            >
              &larr; Ganti Kereta Pergi
            </button>
          )}
        </div>
      )}

      {/* ============================================================
          SCHEDULE RESULTS LIST (Matches Screenshot 2 Exact Cards)
          ============================================================ */}
      {!loading && filteredAndSortedRows.length > 0 && (
        <div style={{ display: 'grid', gap: '0.625rem' }}>
          {filteredAndSortedRows.map(row => {
            const isExpanded = expandedId === row.schedule_id
            const bookingUrl = user
              ? `/booking/${row.schedule_id}?class=${encodeURIComponent(row.carriage_class)}&subclass=${encodeURIComponent(row.subclass || 'CA')}&from=${row.origin_code}&to=${row.destination_code}&date=${date}&pax=${passengers}&train=${encodeURIComponent(row.train_name)}&price=${row.price}`
              : `/auth/login?next=${encodeURIComponent(`/booking/${row.schedule_id}?class=${encodeURIComponent(row.carriage_class)}&subclass=${encodeURIComponent(row.subclass || 'CA')}&from=${row.origin_code}&to=${row.destination_code}&date=${date}&pax=${passengers}&train=${encodeURIComponent(row.train_name)}&price=${row.price}`)}`

            return (
              <article
                key={`${row.schedule_id}-${row.subclass || row.carriage_class}`}
                className="rh-card"
                style={{
                  background: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid var(--rh-border)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                }}
              >
                <div style={{ padding: '1rem 1rem 0.75rem' }}>
                  {/* Card Header: Train Name & Subclass (Left) + Logo & Price (Right) */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          color: 'var(--rh-navy)',
                          margin: 0,
                          lineHeight: 1.2,
                        }}
                      >
                        {row.train_name}
                      </h2>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--rh-text-3)',
                          fontWeight: 500,
                          marginTop: '0.15rem',
                        }}
                      >
                        {row.carriage_class} ({row.subclass || 'CA'})
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <RailHubTrainLogo height={20} />
                      <div
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          color: 'var(--rh-accent-dark)',
                          marginTop: '0.25rem',
                          lineHeight: 1.2,
                        }}
                      >
                        {formatIDR(row.price)}
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--rh-text-3)', marginLeft: 3 }}>
                          /Org
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feature Badges Row (Terlaris, Harga Termurah, Rekomendasi) */}
                  {row.badges && row.badges.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      {row.badges.includes('terlaris') && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 6,
                            background: 'var(--rh-secondary-light)',
                            color: 'var(--rh-secondary)',
                            border: '1px solid #FFD9D1',
                          }}
                        >
                          Terlaris
                        </span>
                      )}
                      {row.badges.includes('termurah') && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 6,
                            background: 'var(--rh-warning-light)',
                            color: 'var(--rh-accent-dark)',
                            border: '1px solid #FDE68A',
                          }}
                        >
                          Harga Termurah
                        </span>
                      )}
                      {row.badges.includes('rekomendasi') && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 6,
                            background: 'var(--rh-primary-light)',
                            color: 'var(--rh-primary)',
                            border: '1px solid #BFDBFE',
                          }}
                        >
                          Rekomendasi
                        </span>
                      )}
                      {row.badges.includes('tercepat') && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 6,
                            background: 'var(--rh-primary-light)',
                            color: 'var(--rh-primary)',
                            border: '1px solid #A7F3D0',
                          }}
                        >
                          Tercepat
                        </span>
                      )}
                    </div>
                  )}

                  {/* Journey Times & Route (Screenshot 2 exact structure) */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.25rem 0',
                    }}
                  >
                    {/* Origin */}
                    <div>
                      <div
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          color: 'var(--rh-navy)',
                          lineHeight: 1,
                        }}
                      >
                        {row.departure_time_label || formatTime(row.departure_time)}
                      </div>
                      <div
                        style={{
                          fontSize: '0.825rem',
                          color: 'var(--rh-text-2)',
                          fontWeight: 600,
                          marginTop: '0.2rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {row.origin_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--rh-text-3)' }}>
                        ({row.origin_code})
                      </div>
                    </div>

                    {/* Duration Track */}
                    <div style={{ textAlign: 'center', padding: '0 0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--rh-text-3)',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {row.duration}
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          width: '80px',
                        }}
                      >
                        <div style={{ height: 1.5, flex: 1, background: 'var(--rh-border)' }} />
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--rh-primary)',
                          }}
                        />
                        <div style={{ height: 1.5, flex: 1, background: 'var(--rh-border)' }} />
                      </div>
                    </div>

                    {/* Destination */}
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'flex-end',
                          gap: '0.35rem',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '1.2rem',
                            fontWeight: 800,
                            color: 'var(--rh-navy)',
                            lineHeight: 1,
                          }}
                        >
                          {row.arrival_time_label || formatTime(row.arrival_time)}
                        </span>
                        {row.is_next_day && (
                          <span
                            style={{
                              fontSize: '0.675rem',
                              fontWeight: 700,
                              color: 'var(--rh-accent)',
                              background: 'rgba(255, 140, 0, 0.1)',
                              padding: '0.1rem 0.35rem',
                              borderRadius: 4,
                            }}
                          >
                            +1 hari
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '0.825rem',
                          color: 'var(--rh-text-2)',
                          fontWeight: 600,
                          marginTop: '0.2rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {row.destination_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--rh-text-3)' }}>
                        ({row.destination_code})
                      </div>
                    </div>
                  </div>

                  {/* Actions & Accordion Button */}
                  <div
                    style={{
                      borderTop: '1px solid var(--rh-border)',
                      marginTop: '0.5rem',
                      paddingTop: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(row.schedule_id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--rh-primary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.25rem 0',
                      }}
                    >
                      {isExpanded ? (
                        <>Sembunyikan detail <ChevronUp size={16} /></>
                      ) : (
                        <>Detail & fasilitas <ChevronDown size={16} /></>
                      )}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--rh-text-3)' }}>
                        <span className="rh-hide-mobile">Tersedia </span>{row.available_seats} kursi
                      </span>
                      {returnDate && activeLeg === 'outbound' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOutbound(row)
                            setActiveLeg('inbound')
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                            toast.success(`Kereta pergi ${row.train_name} dipilih. Silakan pilih kereta pulang!`)
                          }}
                          className="rh-btn rh-btn-primary rh-btn-sm"
                          style={{ borderRadius: 8, padding: '0.45rem 1.15rem', fontWeight: 700 }}
                        >
                          Pilih Kereta Pergi &rarr;
                        </button>
                      ) : returnDate && activeLeg === 'inbound' && selectedOutbound ? (
                        <Link
                          href={user
                            ? `/booking/${selectedOutbound.schedule_id}?class=${encodeURIComponent(selectedOutbound.carriage_class)}&from=${selectedOutbound.origin_code}&to=${selectedOutbound.destination_code}&date=${date}&pax=${passengers}&train=${encodeURIComponent(selectedOutbound.train_name)}&price=${selectedOutbound.price}&returnScheduleId=${row.schedule_id}&returnClass=${encodeURIComponent(row.carriage_class)}&returnDate=${returnDate}&returnTrain=${encodeURIComponent(row.train_name)}&returnPrice=${row.price}&returnFrom=${destination}&returnTo=${origin}`
                            : `/auth/login?next=${encodeURIComponent(`/booking/${selectedOutbound.schedule_id}?class=${encodeURIComponent(selectedOutbound.carriage_class)}&from=${selectedOutbound.origin_code}&to=${selectedOutbound.destination_code}&date=${date}&pax=${passengers}&train=${encodeURIComponent(selectedOutbound.train_name)}&price=${selectedOutbound.price}&returnScheduleId=${row.schedule_id}&returnClass=${encodeURIComponent(row.carriage_class)}&returnDate=${returnDate}&returnTrain=${encodeURIComponent(row.train_name)}&returnPrice=${row.price}&returnFrom=${destination}&returnTo=${origin}`)}`
                          }
                          className="rh-btn rh-btn-primary rh-btn-sm"
                          style={{ borderRadius: 8, padding: '0.45rem 1.15rem', fontWeight: 700, background: '#16a34a', borderColor: '#16a34a' }}
                        >
                          Pilih & Lanjut Booking PP &rarr;
                        </Link>
                      ) : (
                        <Link
                          href={bookingUrl}
                          className="rh-btn rh-btn-primary rh-btn-sm"
                          style={{
                            borderRadius: 8,
                            padding: '0.45rem 1.15rem',
                            fontWeight: 700,
                          }}
                        >
                          Pilih
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inline Expandable Details Accordion */}
                {isExpanded && (
                  <div
                    style={{
                      background: 'var(--rh-surface)',
                      borderTop: '1px solid var(--rh-border)',
                      padding: '1rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      <div>
                        <strong style={{ color: 'var(--rh-navy)', display: 'block', marginBottom: '0.35rem' }}>
                          Fasilitas Gerbong {row.carriage_class}:
                        </strong>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {(row.amenities || ['AC', 'Reclining Seat', 'Stopkontak', 'Restorasi']).map((amenity, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                background: '#ffffff',
                                border: '1px solid var(--rh-border)',
                                padding: '0.25rem 0.6rem',
                                borderRadius: 6,
                                fontSize: '0.78rem',
                                color: 'var(--rh-text-2)',
                              }}
                            >
                              <Check size={13} style={{ color: 'var(--rh-accent)' }} /> {amenity}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ borderTop: '1px dashed var(--rh-border)', paddingTop: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--rh-text-2)', fontSize: '0.8rem' }}>
                          <span>Nomor KA: <strong>{row.train_number}</strong></span>
                          <span>Kelas Tarif: <strong>Subclass {row.subclass || 'CA'}</strong></span>
                          <span>Bagasi Gratis: <strong>Maks. 20 Kg</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {/* ============================================================
          SORT MODAL / BOTTOM SHEET
          ============================================================ */}
      {showSortModal && (
        <div
          role="presentation"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setShowSortModal(false)}
        >
          <div
            role="dialog"
            aria-label="Urutkan Jadwal"
            style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: 540,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: '1.5rem',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--rh-navy)', margin: 0 }}>
                Urutkan Jadwal Berdasarkan
              </h2>
              <button
                type="button"
                onClick={() => setShowSortModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rh-text-3)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {[
                { id: 'departure', label: 'Waktu Keberangkatan Paling Awal' },
                { id: 'price', label: 'Harga Termurah' },
                { id: 'duration', label: 'Durasi Tercepat' },
                { id: 'arrival', label: 'Waktu Kedatangan Paling Awal' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { setSortBy(opt.id); setShowSortModal(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: 12,
                    border: sortBy === opt.id ? '2px solid var(--rh-accent)' : '1px solid var(--rh-border)',
                    background: sortBy === opt.id ? 'rgba(255, 140, 0, 0.08)' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: sortBy === opt.id ? 700 : 500,
                    color: sortBy === opt.id ? 'var(--rh-accent-dark)' : 'var(--rh-text)',
                  }}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.id && <Check size={18} style={{ color: 'var(--rh-accent)' }} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          FILTER MODAL / BOTTOM SHEET
          ============================================================ */}
      {showFilterModal && (
        <div
          role="presentation"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setShowFilterModal(false)}
        >
          <div
            role="dialog"
            aria-label="Filter Jadwal"
            style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: 540,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: '1.5rem',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--rh-navy)', margin: 0 }}>
                Filter Jadwal Kereta
              </h2>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rh-text-3)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Waktu Keberangkatan */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--rh-navy)', display: 'block', marginBottom: '0.625rem' }}>
                Waktu Keberangkatan
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'all', label: 'Semua Waktu' },
                  { id: 'morning', label: 'Dini Hari (00:00 - 06:00)' },
                  { id: 'noon', label: 'Pagi - Siang (06:00 - 12:00)' },
                  { id: 'afternoon', label: 'Siang - Sore (12:00 - 18:00)' },
                  { id: 'night', label: 'Malam (18:00 - 24:00)' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTimeFilter(item.id)}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: 10,
                      border: timeFilter === item.id ? '2px solid var(--rh-accent)' : '1px solid var(--rh-border)',
                      background: timeFilter === item.id ? 'rgba(255, 140, 0, 0.08)' : '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: timeFilter === item.id ? 700 : 500,
                      color: timeFilter === item.id ? 'var(--rh-accent-dark)' : 'var(--rh-text-2)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Kelas Kereta */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--rh-navy)', display: 'block', marginBottom: '0.625rem' }}>
                Kelas Kereta
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {classOptions.map(cls => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setClassFilter(cls)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 9999,
                      border: classFilter === cls ? '2px solid var(--rh-accent)' : '1px solid var(--rh-border)',
                      background: classFilter === cls ? 'rgba(255, 140, 0, 0.08)' : '#ffffff',
                      fontSize: '0.82rem',
                      fontWeight: classFilter === cls ? 700 : 500,
                      color: classFilter === cls ? 'var(--rh-accent-dark)' : 'var(--rh-text-2)',
                      cursor: 'pointer',
                    }}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="rh-btn rh-btn-secondary"
                style={{ flex: 1 }}
                onClick={() => { setTimeFilter('all'); setClassFilter('Semua') }}
              >
                Reset
              </button>
              <button
                type="button"
                className="rh-btn rh-btn-primary"
                style={{ flex: 2 }}
                onClick={() => setShowFilterModal(false)}
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
