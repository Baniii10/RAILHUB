'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Users, ArrowLeftRight, Search } from 'lucide-react'
import { useLang } from '@/contexts/LangContext'
import { createClient } from '@/lib/supabase/client'
import { STATIONS_CATALOG } from '@/lib/data/stationsCatalog'
import toast from 'react-hot-toast'

function StationSelect({ label, value, onChange, exclude, placeholder, icon: Icon, stations, loading }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchInputRef = useRef(null)
  const normalizedQuery = query.trim().toLocaleLowerCase('id')
  const filtered = stations.filter(station => (
    station.code !== exclude
    && (!normalizedQuery || [
      station.name,
      station.code,
      station.city,
      station.province,
    ].some(value => value?.toLocaleLowerCase('id').includes(normalizedQuery)))
  ))
  const selected = stations.find(s => s.code === value)

  useEffect(() => {
    if (open) searchInputRef.current?.focus()
  }, [open])

  function closePicker() {
    setOpen(false)
    setQuery('')
  }

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rh-text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.375rem' }}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => {
          setQuery('')
          setOpen(v => !v)
        }}
        disabled={loading}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.875rem 1rem', background: 'var(--rh-surface)',
          border: open ? '2px solid var(--rh-primary)' : '2px solid var(--rh-border)',
          borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
          transition: 'all 0.15s',
          boxShadow: open ? '0 0 0 3px rgba(26,66,138,0.12)' : 'none',
        }}
      >
        <Icon size={16} style={{ color: selected ? 'var(--rh-primary)' : 'var(--rh-text-3)', flexShrink: 0 }} />
        {selected ? (
          <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--rh-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selected.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--rh-text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selected.city}</div>
          </div>
        ) : (
          <span style={{ fontSize: '0.9375rem', color: 'var(--rh-text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {loading ? 'Memuat stasiun…' : placeholder}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'white', borderRadius: 12, border: '1px solid var(--rh-border)',
          boxShadow: 'var(--shadow-xl)', zIndex: 100, overflow: 'hidden',
        }}>
          <div style={{ padding: '0.625rem', borderBottom: '1px solid var(--rh-border)' }}>
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Escape') {
                  event.stopPropagation()
                  closePicker()
                }
              }}
              placeholder="Cari nama, kode, atau kota…"
              aria-label={`Cari ${label.toLocaleLowerCase('id')}`}
              className="rh-input"
              style={{ width: '100%', minWidth: 0, padding: '0.625rem 0.75rem' }}
            />
          </div>
          <div role="listbox" aria-label={`Daftar ${label.toLocaleLowerCase('id')}`} style={{ maxHeight: 230, overflowY: 'auto' }}>
            {filtered.map(s => (
              <button
                key={s.code}
                type="button"
                role="option"
                aria-selected={value === s.code}
                onClick={() => { onChange(s.code); closePicker() }}
                style={{
                  width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center',
                  gap: '0.75rem', background: value === s.code ? 'var(--rh-primary-light)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  borderBottom: '1px solid var(--rh-surface)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (value !== s.code) e.currentTarget.style.background = 'var(--rh-surface)' }}
                onMouseLeave={e => { if (value !== s.code) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: value === s.code ? 'var(--rh-primary)' : 'var(--rh-surface-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6875rem', fontWeight: 800,
                  color: value === s.code ? 'white' : 'var(--rh-text-3)',
                  flexShrink: 0, fontFamily: 'var(--font-mono)',
                }}>
                  {s.code}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--rh-text)' }}>{s.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--rh-text-3)' }}>{s.city}</div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p style={{ padding: '0.875rem 1rem', color: 'var(--rh-text-2)', fontSize: '0.875rem' }}>
                {loading ? 'Memuat stasiun…' : query ? 'Stasiun tidak ditemukan.' : 'Tidak ada stasiun yang tersedia.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function formatLocalDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export default function SearchWidget({ compact = false }) {
  const { t } = useLang()
  const router = useRouter()
  const [stations, setStations] = useState(STATIONS_CATALOG)
  const [stationsLoading, setStationsLoading] = useState(false)
  const [stationError, setStationError] = useState('')

  const [origin,      setOrigin]      = useState('PSE')
  const [destination, setDestination] = useState('SGU')
  const [date,        setDate]        = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return formatLocalDate(tomorrow)
  })
  const [passengers,  setPassengers]  = useState(1)
  const [loading,     setLoading]     = useState(false)

  useEffect(() => {
    let active = true
    const supabase = createClient()

    async function loadStations() {
      const { data, error } = await supabase
        .from('stations')
        .select('code, name, city')
        .eq('is_bookable_in_simulation', true)
        .eq('operational_status', 'active')
        .order('name')

      if (!active) return

      if (error) {
        setStationError(error.message)
      } else if (data && data.length > 0) {
        // Merge with curated 50 stations catalog
        const existingCodes = new Set(data.map(s => s.code))
        const combined = [...data]
        STATIONS_CATALOG.forEach(catStation => {
          if (!existingCodes.has(catStation.code)) {
            combined.push(catStation)
          }
        })
        setStations(combined.sort((a, b) => a.name.localeCompare(b.name)))
      }
      setStationsLoading(false)
    }

    loadStations()
    return () => { active = false }
  }, [])

  function handleSwap() {
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
  }

  function handleSearch(e) {
    e.preventDefault()
    if (!origin)      { toast.error('Pilih stasiun asal'); return }
    if (!destination) { toast.error('Pilih stasiun tujuan'); return }
    if (origin === destination) { toast.error('Stasiun asal dan tujuan harus berbeda'); return }
    if (!date)        { toast.error('Pilih tanggal keberangkatan'); return }
    if (date < formatLocalDate(new Date())) { toast.error('Tanggal keberangkatan tidak boleh lewat'); return }

    setLoading(true)
    const params = new URLSearchParams({ from: origin, to: destination, date, pax: passengers })
    router.push(`/trains?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch}>
      <div className="rh-search-grid">
        {/* Origin + Swap + Destination */}
        <div className="rh-search-stations-row">
          <StationSelect
            label={t.hero.origin}
            value={origin}
            onChange={setOrigin}
            exclude={destination}
            placeholder="Pilih stasiun asal"
            icon={MapPin}
            stations={stations}
            loading={stationsLoading}
          />

          <button
            type="button"
            onClick={handleSwap}
            title={t.hero.swap}
            className="rh-search-swap-btn"
          >
            <ArrowLeftRight size={16} />
          </button>

          <StationSelect
            label={t.hero.destination}
            value={destination}
            onChange={setDestination}
            exclude={origin}
            placeholder="Pilih stasiun tujuan"
            icon={MapPin}
            stations={stations}
            loading={stationsLoading}
          />
        </div>

        {/* Date + Passengers row for seamless mobile scaling */}
        <div className="rh-search-meta-row">
          {/* Date */}
          <div style={{ flex: '1 1 140px', minWidth: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rh-text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.375rem' }}>
              {t.hero.date}
            </label>
            <div style={{ position: 'relative' }}>
              <Calendar size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--rh-primary)', pointerEvents: 'none' }} />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="rh-input"
                style={{ paddingLeft: '2.5rem', width: '100%' }}
              />
            </div>
          </div>

          {/* Passengers */}
          <div style={{ flex: '1 1 100px', minWidth: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rh-text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '0.375rem' }}>
              {t.hero.passengers}
            </label>
            <div style={{ position: 'relative' }}>
              <Users size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--rh-primary)', pointerEvents: 'none' }} />
              <input
                type="number"
                min={1}
                max={6}
                value={passengers}
                onChange={e => setPassengers(Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                className="rh-input"
                style={{ paddingLeft: '2.5rem', width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div style={{ flex: '1 0 100%', maxWidth: '100%' }}>
          <button
            type="submit"
            className="rh-btn rh-btn-primary rh-btn-lg rh-search-submit-btn"
            disabled={loading || stationsLoading || !date}
            style={{ height: 50, paddingInline: '2rem', gap: '0.5rem', width: '100%' }}
          >
            {loading ? (
              <span className="rh-spinner rh-spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
            ) : (
              <Search size={18} />
            )}
            {t.hero.search}
          </button>
        </div>
      </div>
      {stationError && (
        <p role="alert" style={{ margin: '0.75rem 0 0', color: 'var(--rh-danger)', fontSize: '0.875rem' }}>
          Data stasiun belum tersedia. Jalankan skema dasar dan seed Supabase terlebih dahulu. Detail: {stationError}
        </p>
      )}
    </form>
  )
}
