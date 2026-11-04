'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrainFront, Calendar, ArrowUpDown, ChevronDown, Search, X, Check, Plus, Minus, ArrowLeft } from 'lucide-react'
import { useLang } from '@/contexts/LangContext'
import { createClient } from '@/lib/supabase/client'
import { STATIONS_CATALOG } from '@/lib/data/stationsCatalog'
import toast from 'react-hot-toast'

function formatLocalDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function formatDisplayDate(dateStr, lang = 'id') {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr + 'T00:00:00')
    if (isNaN(d.getTime())) return dateStr
    if (lang === 'en') {
      return d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    }
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function PassengerSeatIcon({ size = 22, color = '#475569', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      <circle cx="8" cy="6" r="2.5" />
      <path d="M7 13h5a2 2 0 0 1 2 2v5" />
      <path d="M8.5 13V9.5a2 2 0 0 1 2-2h2" />
      <path d="M4 20h16" />
    </svg>
  )
}

const POPULAR_CODES = ['PSE', 'GMR', 'BD', 'YK', 'SGU', 'SMT', 'ML']

export default function SearchWidget({ compact = false }) {
  const { lang, t } = useLang()
  const router = useRouter()

  const [stations, setStations] = useState(STATIONS_CATALOG)
  const [stationsLoading, setStationsLoading] = useState(false)
  const [stationError, setStationError] = useState('')

  // Form State
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return formatLocalDate(tomorrow)
  })
  const [isRoundTrip, setIsRoundTrip] = useState(false)
  const [returnDate, setReturnDate] = useState(() => {
    const after = new Date()
    after.setDate(after.getDate() + 3)
    return formatLocalDate(after)
  })
  const [adults, setAdults] = useState(1)
  const [infants, setInfants] = useState(0)
  const [loading, setLoading] = useState(false)

  // Pickers modal/popover states
  const [activePicker, setActivePicker] = useState(null) // 'origin' | 'destination' | null
  const [stationQuery, setStationQuery] = useState('')
  const [passengerOpen, setPassengerOpen] = useState(false)

  const dateInputRef = useRef(null)
  const returnDateInputRef = useRef(null)
  const searchInputRef = useRef(null)
  const passengerRef = useRef(null)

  // Fetch Supabase stations
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

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (!activePicker) return
    const timer = window.setTimeout(() => {
      setStationQuery('')
      searchInputRef.current?.focus()
    }, 60)
    return () => window.clearTimeout(timer)
  }, [activePicker])

  // Close passenger popover on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (passengerRef.current && !passengerRef.current.contains(e.target)) {
        setPassengerOpen(false)
      }
    }
    if (passengerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [passengerOpen])

  function handleSwap(e) {
    e.stopPropagation()
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
  }

  function handleSelectStation(code) {
    if (typeof document !== 'undefined' && document.activeElement) {
      document.activeElement.blur()
    }
    if (activePicker === 'origin') {
      setOrigin(code)
      if (destination === code) setDestination('')
    } else if (activePicker === 'destination') {
      setDestination(code)
      if (origin === code) setOrigin('')
    }
    setActivePicker(null)
    setStationQuery('')
  }

  function handleSearch(e) {
    e.preventDefault()
    if (!origin) {
      toast.error(lang === 'en' ? 'Please select origin station' : 'Pilih stasiun keberangkatan')
      setActivePicker('origin')
      return
    }
    if (!destination) {
      toast.error(lang === 'en' ? 'Please select destination station' : 'Pilih stasiun tujuan')
      setActivePicker('destination')
      return
    }
    if (origin === destination) {
      toast.error(lang === 'en' ? 'Origin and destination must be different' : 'Stasiun keberangkatan dan tujuan harus berbeda')
      return
    }
    if (!date) {
      toast.error(lang === 'en' ? 'Please select departure date' : 'Pilih tanggal keberangkatan')
      return
    }
    const todayStr = formatLocalDate(new Date())
    if (date < todayStr) {
      toast.error(lang === 'en' ? 'Departure date cannot be in the past' : 'Tanggal keberangkatan tidak boleh lewat')
      return
    }

    setLoading(true)
    const params = new URLSearchParams({
      from: origin,
      to: destination,
      date,
      pax: adults,
    })
    if (isRoundTrip && returnDate) {
      params.append('returnDate', returnDate)
    }
    router.push(`/trains?${params.toString()}`)
  }

  const originStation = stations.find(s => s.code === origin)
  const destinationStation = stations.find(s => s.code === destination)

  // Filter stations for picker modal
  const normQuery = stationQuery.trim().toLocaleLowerCase('id')
  const filteredStations = stations.filter(s => {
    if (!normQuery) return true
    return (
      s.code?.toLocaleLowerCase('id').includes(normQuery) ||
      s.name?.toLocaleLowerCase('id').includes(normQuery) ||
      s.city?.toLocaleLowerCase('id').includes(normQuery)
    )
  })

  return (
    <div className="rh-detail-journey-container">
      {!compact && (
        <h2 className="rh-detail-journey-heading">
          {lang === 'en' ? 'Journey Details' : 'Detail Perjalanan'}
        </h2>
      )}

      <form onSubmit={handleSearch}>
        {/* ── CARD 1: ORIGIN & DESTINATION (UNIFIED BOX) ── */}
        <div className="rh-detail-box rh-detail-box-stations">
          {/* Keberangkatan */}
          <button
            type="button"
            className="rh-detail-row-btn"
            onClick={() => setActivePicker('origin')}
            aria-label={lang === 'en' ? 'Select departure station' : 'Pilih stasiun keberangkatan'}
          >
            <TrainFront size={22} className="rh-detail-icon" />
            <div className="rh-detail-text-col">
              <span className="rh-detail-label">
                {lang === 'en' ? 'Departure' : 'Keberangkatan'}
              </span>
              <div className="rh-detail-val">
                {originStation ? (
                  <span className="rh-detail-selected-text">
                    <strong>{originStation.name}</strong> ({originStation.code})
                    <span className="rh-detail-city-hint"> - {originStation.city}</span>
                  </span>
                ) : (
                  <span className="rh-detail-placeholder">
                    {lang === 'en' ? 'Select station or city' : 'Pilih stasiun atau kota'}
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Divider with Swap Button */}
          <div className="rh-detail-divider-wrapper">
            <div className="rh-detail-divider-line" />
            <button
              type="button"
              onClick={handleSwap}
              className="rh-detail-swap-btn"
              title={lang === 'en' ? 'Swap stations' : 'Tukar stasiun'}
              aria-label={lang === 'en' ? 'Swap departure and destination' : 'Tukar stasiun keberangkatan dan tujuan'}
            >
              <ArrowUpDown size={17} strokeWidth={2.4} />
            </button>
          </div>

          {/* Tujuan */}
          <button
            type="button"
            className="rh-detail-row-btn"
            onClick={() => setActivePicker('destination')}
            aria-label={lang === 'en' ? 'Select destination station' : 'Pilih stasiun tujuan'}
          >
            <TrainFront size={22} className="rh-detail-icon" />
            <div className="rh-detail-text-col">
              <span className="rh-detail-label">
                {lang === 'en' ? 'Destination' : 'Tujuan'}
              </span>
              <div className="rh-detail-val">
                {destinationStation ? (
                  <span className="rh-detail-selected-text">
                    <strong>{destinationStation.name}</strong> ({destinationStation.code})
                    <span className="rh-detail-city-hint"> - {destinationStation.city}</span>
                  </span>
                ) : (
                  <span className="rh-detail-placeholder">
                    {lang === 'en' ? 'Select station or city' : 'Pilih stasiun atau kota'}
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* ── CARD 2: DATE & ROUND TRIP TOGGLE ── */}
        <div className="rh-detail-box rh-detail-box-date">
          <div className="rh-detail-date-row">
            {/* Left: Date Display & Native Picker Trigger */}
            <div className="rh-detail-date-col">
              <Calendar size={20} className="rh-detail-icon" />
              <div className="rh-detail-text-col">
                <span className="rh-detail-label">
                  {lang === 'en' ? 'Departure Date' : 'Tanggal Berangkat'}
                </span>
                <span className="rh-detail-val-bold">
                  {formatDisplayDate(date, lang)}
                </span>
              </div>
              <input
                ref={dateInputRef}
                type="date"
                value={date}
                min={formatLocalDate(new Date())}
                onChange={e => {
                  setDate(e.target.value)
                  if (isRoundTrip && returnDate < e.target.value) {
                    setReturnDate(e.target.value)
                  }
                }}
                className="rh-detail-hidden-date-input"
                aria-label={lang === 'en' ? 'Select departure date' : 'Pilih tanggal keberangkatan'}
              />
            </div>

            {/* Right: Round Trip Toggle */}
            <div className="rh-detail-toggle-col">
              <span
                className="rh-detail-toggle-label"
                onClick={() => setIsRoundTrip(prev => !prev)}
              >
                {lang === 'en' ? 'Round Trip?' : 'Pulang Pergi?'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isRoundTrip}
                onClick={() => setIsRoundTrip(prev => !prev)}
                className={`rh-detail-toggle-switch ${isRoundTrip ? 'is-active' : ''}`}
                aria-label={lang === 'en' ? 'Toggle round trip' : 'Aktifkan pulang pergi'}
              >
                <span className="rh-detail-toggle-thumb" />
              </button>
            </div>
          </div>

          {/* Optional Return Date Row when Round Trip is active */}
          {isRoundTrip && (
            <div className="rh-detail-return-row">
              <div className="rh-detail-date-col" style={{ flex: 1 }}>
                <Calendar size={20} style={{ color: 'var(--rh-primary)' }} />
                <div className="rh-detail-text-col">
                  <span className="rh-detail-label" style={{ color: 'var(--rh-primary)', fontWeight: 600 }}>
                    {lang === 'en' ? 'Return Date' : 'Tanggal Pulang'}
                  </span>
                  <span className="rh-detail-val-bold">
                    {formatDisplayDate(returnDate, lang)}
                  </span>
                </div>
                <input
                  ref={returnDateInputRef}
                  type="date"
                  value={returnDate}
                  min={date || formatLocalDate(new Date())}
                  onChange={e => setReturnDate(e.target.value)}
                  className="rh-detail-hidden-date-input"
                  aria-label={lang === 'en' ? 'Select return date' : 'Pilih tanggal pulang'}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── CARD 3: PASSENGERS ── */}
        <div className="rh-detail-box-passenger-wrapper" ref={passengerRef}>
          <div
            className="rh-detail-box rh-detail-box-passenger"
            onClick={() => setPassengerOpen(prev => !prev)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPassengerOpen(v => !v) } }}
            aria-expanded={passengerOpen}
            aria-label={lang === 'en' ? 'Select passengers' : 'Pilih jumlah penumpang'}
          >
            <div className="rh-detail-passenger-left">
              <PassengerSeatIcon size={22} color="#475569" />
              <div className="rh-detail-text-col">
                <span className="rh-detail-label">
                  {lang === 'en' ? 'Passengers' : 'Penumpang'}
                </span>
                <span className="rh-detail-val-bold">
                  {lang === 'en'
                    ? `${adults} Adult${adults > 1 ? 's' : ''}, ${infants} Infant${infants > 1 ? 's' : ''}`
                    : `${adults} Dewasa, ${infants} Bayi`}
                </span>
              </div>
            </div>

            <ChevronDown
              size={20}
              className={`rh-detail-chevron ${passengerOpen ? 'is-open' : ''}`}
            />
          </div>

          {/* Passenger Stepper Popover */}
          {passengerOpen && (
            <>
              <div
                className="rh-passenger-mobile-backdrop rh-show-mobile-only"
                onClick={() => setPassengerOpen(false)}
                aria-hidden="true"
              />
              <div className="rh-passenger-popover" role="dialog" aria-label="Jumlah Penumpang">
                <div className="rh-bottom-sheet-handle" aria-hidden="true" />
                <div className="rh-passenger-popover-header">
                <strong>{lang === 'en' ? 'Select Passengers' : 'Jumlah Penumpang'}</strong>
                <button
                  type="button"
                  className="rh-passenger-close-btn"
                  onClick={() => setPassengerOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Adults Counter */}
              <div className="rh-passenger-row">
                <div>
                  <div className="rh-passenger-type-title">{lang === 'en' ? 'Adults' : 'Dewasa'}</div>
                  <div className="rh-passenger-type-desc">{lang === 'en' ? 'Age 3+ years' : 'Usia 3 tahun ke atas'}</div>
                </div>
                <div className="rh-passenger-stepper">
                  <button
                    type="button"
                    disabled={adults <= 1}
                    onClick={() => {
                      const next = Math.max(1, adults - 1)
                      setAdults(next)
                      if (infants > next) setInfants(next)
                    }}
                    className="rh-stepper-btn"
                    aria-label="Kurangi dewasa"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="rh-stepper-count">{adults}</span>
                  <button
                    type="button"
                    disabled={adults >= 6}
                    onClick={() => setAdults(prev => Math.min(6, prev + 1))}
                    className="rh-stepper-btn"
                    aria-label="Tambah dewasa"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* Infants Counter */}
              <div className="rh-passenger-row">
                <div>
                  <div className="rh-passenger-type-title">{lang === 'en' ? 'Infants' : 'Bayi'}</div>
                  <div className="rh-passenger-type-desc">{lang === 'en' ? 'Under 3 years (no seat)' : 'Di bawah 3 th (tanpa kursi)'}</div>
                </div>
                <div className="rh-passenger-stepper">
                  <button
                    type="button"
                    disabled={infants <= 0}
                    onClick={() => setInfants(prev => Math.max(0, prev - 1))}
                    className="rh-stepper-btn"
                    aria-label="Kurangi bayi"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="rh-stepper-count">{infants}</span>
                  <button
                    type="button"
                    disabled={infants >= adults}
                    onClick={() => setInfants(prev => Math.min(adults, prev + 1))}
                    className="rh-stepper-btn"
                    aria-label="Tambah bayi"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="rh-passenger-done-btn"
                onClick={() => setPassengerOpen(false)}
              >
                {lang === 'en' ? 'Done' : 'Selesai'}
              </button>
            </div>
          </>
          )}
        </div>

        {/* ── ACTION BUTTON: CARI KERETA ── */}
        <button
          type="submit"
          disabled={loading || stationsLoading}
          className="rh-detail-submit-btn"
        >
          {loading ? (
            <span className="rh-spinner rh-spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
          ) : (
            lang === 'en' ? 'Search Trains' : 'Cari Kereta'
          )}
        </button>
      </form>

      {/* ── STATION PICKER MODAL (FULL SCREEN SHEET) ── */}
      {activePicker && (
        <div className="rh-station-modal-backdrop" onClick={() => setActivePicker(null)}>
          <div
            className="rh-station-modal-content"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={activePicker === 'origin' ? 'Pilih Stasiun Keberangkatan' : 'Pilih Stasiun Tujuan'}
          >
            {/* Sheet Handle for Mobile */}
            <div className="rh-bottom-sheet-handle" aria-hidden="true" />

            {/* Modal Header */}
            <div className="rh-station-modal-header">
              <div className="rh-station-modal-title">
                {activePicker === 'origin'
                  ? (lang === 'en' ? 'Departure Station' : 'Pilih Stasiun Keberangkatan')
                  : (lang === 'en' ? 'Destination Station' : 'Pilih Stasiun Tujuan')}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (typeof document !== 'undefined' && document.activeElement) {
                    document.activeElement.blur()
                  }
                  setActivePicker(null)
                }}
                className="rh-station-modal-close"
                aria-label="Tutup"
              >
                <ArrowLeft size={20} className="rh-show-mobile-only" />
                <X size={20} className="rh-hide-mobile" />
              </button>
            </div>

            {/* Search Input */}
            <div className="rh-station-modal-search">
              <Search size={18} className="rh-station-search-icon" />
              <input
                ref={searchInputRef}
                type="search"
                value={stationQuery}
                onChange={e => setStationQuery(e.target.value)}
                placeholder={lang === 'en' ? 'Search station name, city, or code...' : 'Cari nama stasiun, kota, atau kode (misal: PSE, Gambir)...'}
                className="rh-station-modal-input"
                style={{ paddingRight: stationQuery ? '2.5rem' : '1rem' }}
              />
              {stationQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setStationQuery('')
                    searchInputRef.current?.focus()
                  }}
                  style={{
                    position: 'absolute',
                    right: '1.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label="Hapus kata kunci"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Quick Popular Pills */}
            <div className="rh-station-popular-section">
              <span className="rh-station-popular-label">{lang === 'en' ? 'Popular:' : 'Populer:'}</span>
              <div className="rh-station-popular-pills">
                {POPULAR_CODES.map(code => {
                  const s = stations.find(item => item.code === code)
                  if (!s) return null
                  const isCurrent = (activePicker === 'origin' ? origin : destination) === s.code
                  return (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => handleSelectStation(s.code)}
                      className={`rh-station-pill ${isCurrent ? 'is-selected' : ''}`}
                    >
                      {s.name} ({s.code})
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Station List */}
            <div className="rh-station-modal-list" role="listbox">
              {filteredStations.map(s => {
                const isSelected = (activePicker === 'origin' ? origin : destination) === s.code
                return (
                  <button
                    key={s.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectStation(s.code)}
                    className={`rh-station-item ${isSelected ? 'is-selected' : ''}`}
                  >
                    <div className="rh-station-item-code">{s.code}</div>
                    <div className="rh-station-item-info">
                      <div className="rh-station-item-name">{s.name}</div>
                      <div className="rh-station-item-sub">{s.city}{s.province ? `, ${s.province}` : ''}</div>
                    </div>
                    {isSelected && (
                      <Check size={18} className="rh-station-item-check" />
                    )}
                  </button>
                )
              })}

              {filteredStations.length === 0 && (
                <div className="rh-station-empty-state">
                  <p>{lang === 'en' ? 'No station found.' : 'Stasiun tidak ditemukan.'}</p>
                  <span>{lang === 'en' ? 'Try typing another city name or station code.' : 'Coba ketik kata kunci kota atau kode lainnya.'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {stationError && (
        <p role="alert" style={{ margin: '0.75rem 0 0', color: 'var(--rh-danger)', fontSize: '0.8rem' }}>
          Data stasiun Supabase offline, menggunakan katalog cadangan resmi.
        </p>
      )}
    </div>
  )
}
