'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Accessibility, ArrowLeft, Check, ChevronRight, LoaderCircle, Mail, Phone, ShieldCheck, Train, User, UserRound, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatDuration, formatIDR, formatTime } from '@/lib/utils/formatters'

function blankPassenger() {
  return { fullName: '', identity: '', phone: '' }
}

function getSeatRows(carriageSeats) {
  const rows = new Map()
  const hasLetteredSeats = carriageSeats.every(seat => /^\d+\s*[A-D]$/i.test(String(seat.seat_number)))
  const sortedSeats = [...carriageSeats].sort((a, b) => (
    String(a.seat_number).localeCompare(String(b.seat_number), undefined, { numeric: true })
  ))

  sortedSeats.forEach((seat, index) => {
    const match = hasLetteredSeats && String(seat.seat_number).match(/^(\d+)\s*([A-D])$/i)
    const rowNumber = match ? Number(match[1]) : Math.floor(index / 4) + 1
    const seatColumn = match
      ? match[2].toUpperCase().charCodeAt(0) - 65
      : index % 4
    const row = rows.get(rowNumber) || []
    row[seatColumn] = seat
    rows.set(rowNumber, row)
  })

  return [...rows.entries()].sort(([a], [b]) => a - b)
}

export default function BookingFlow({
  scheduleId,
  requestedClass,
  passengerCount,
  returnTo = '/trains',
  origin,
  destination,
  departureDate,
  trainName,
  price,
  subclass,
  returnScheduleId = null,
  returnClass = null,
  returnDate = null,
  returnTrain = null,
  returnPrice = 0,
  returnFrom = null,
  returnToStation = null,
  pairedBookingId = null,
}) {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [journey, setJourney] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [selectedClass, setSelectedClass] = useState(requestedClass || 'Ekonomi')
  const [selectedCarriageId, setSelectedCarriageId] = useState('')
  const [selectedSeats, setSelectedSeats] = useState([])
  const [passengers, setPassengers] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('railhub_passenger_cache')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length >= passengerCount) {
            return parsed.slice(0, passengerCount)
          }
        }
      } catch {
        // ignore cache parse error
      }
    }
    return Array.from({ length: passengerCount }, blankPassenger)
  })
  const [submitting, setSubmitting] = useState(false)
  const [now, setNow] = useState(0)
  const [step, setStep] = useState('details')
  const [detailsAttempted, setDetailsAttempted] = useState(false)
  const stepHeadingRef = useRef(null)
  const passengerDetailsRef = useRef(null)

  useEffect(() => {
    let active = true
    const supabase = createClient()

    async function loadJourney() {
      try {
        const { data, error } = await supabase.rpc('get_schedule_booking_data', {
          p_schedule_id: scheduleId,
        })

        if (!active) return

        if (error) throw error
        if (!data?.schedule) throw new Error('Jadwal tidak ditemukan.')
        setJourney(data)
        const classes = (data.fares || []).map(fare => fare.carriage_class)
        setSelectedClass(current => classes.includes(current) ? current : (classes[0] || ''))
      } catch (err) {
        if (!active) return
        setJourney(null)
        setLoadError(`Jadwal tidak dapat dimuat: ${err.message || 'Terjadi kesalahan.'}`)
      }
    }

    loadJourney()
    return () => { active = false }
  }, [scheduleId])

  const fare = journey?.fares?.find(item => item.carriage_class === selectedClass)
  const seats = useMemo(
    () => (journey?.seats || []).filter(seat => seat.carriage_class === selectedClass),
    [journey, selectedClass]
  )
  const carriages = useMemo(() => {
    const carriageMap = new Map()
    seats.forEach(seat => {
      if (!carriageMap.has(seat.carriage_id)) {
        carriageMap.set(seat.carriage_id, {
          id: seat.carriage_id,
          number: seat.carriage_number,
          seats: [],
        })
      }
      carriageMap.get(seat.carriage_id).seats.push(seat)
    })
    return [...carriageMap.values()].sort((a, b) => (
      String(a.number).localeCompare(String(b.number), undefined, { numeric: true })
    ))
  }, [seats])
  const selectedCarriage = carriages.find(carriage => carriage.id === selectedCarriageId) || carriages[0]
  const selectedCarriageSeats = useMemo(
    () => selectedCarriage?.seats || [],
    [selectedCarriage]
  )
  const seatRows = useMemo(() => getSeatRows(selectedCarriageSeats), [selectedCarriageSeats])
  const total = Number(fare?.price || 0) * passengerCount
  const bookingClosed = journey?.schedule?.departure_time
    ? new Date(journey.schedule.departure_time).getTime() <= now + 60 * 60 * 1000
    : false
  const passengerDetailsComplete = passengers.every(passenger => (
    passenger.fullName.trim().length >= 2 && passenger.identity.trim().length >= 3
  ))
  const loginNextParams = new URLSearchParams({
    class: requestedClass || selectedClass || 'Ekonomi',
    pax: String(passengerCount),
    ...(origin ? { from: origin } : {}),
    ...(destination ? { to: destination } : {}),
    ...(departureDate ? { date: departureDate } : {}),
    ...(trainName ? { train: trainName } : {}),
    ...(price ? { price: String(price) } : {}),
    ...(subclass ? { subclass } : {}),
  })
  const loginHref = `/auth/login?next=${encodeURIComponent(`/booking/${scheduleId}?${loginNextParams}`)}`

  useEffect(() => {
    const timer = window.setTimeout(() => setNow(Date.now()), 0)
    return () => window.clearTimeout(timer)
  }, [journey?.schedule?.departure_time])

  useEffect(() => {
    if (step === 'seats') {
      stepHeadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      stepHeadingRef.current?.focus({ preventScroll: true })
    }
  }, [step])

  function changePassenger(index, key, value) {
    setPassengers(current => current.map((passenger, passengerIndex) => (
      passengerIndex === index ? { ...passenger, [key]: value } : passenger
    )))
  }

  function toggleSeat(seat, isDisability = false, isFemalePriority = false) {
    if (!seat.is_available) return
    setSelectedSeats(current => {
      if (current.includes(seat.id)) return current.filter(id => id !== seat.id)
      if (current.length >= passengerCount) {
        toast.error(`Pilih maksimal ${passengerCount} kursi.`)
        return current
      }
      if (isDisability) {
        toast('Kursi Prioritas Disabilitas/Lansia dipilih (Akses luas & dekat pintu)')
      } else if (isFemalePriority) {
        toast('Kursi Khusus Cewe dipilih (Area aman & nyaman sesama wanita)')
      }
      return [...current, seat.id]
    })
  }

  function continueToSeats() {
    setDetailsAttempted(true)
    if (!passengerDetailsComplete) {
      toast.error('Periksa nama dan ID simulasi yang ditandai sebelum melanjutkan.')
      requestAnimationFrame(() => {
        passengerDetailsRef.current
          ?.querySelector('[aria-invalid="true"]')
          ?.focus()
      })
      return
    }
    setStep('seats')
  }

  async function submitBooking(event) {
    event.preventDefault()
    if (!user || !journey || !fare) return
    if (bookingClosed) {
      toast.error('Pemesanan online ditutup 1 jam sebelum keberangkatan. Silakan gunakan loket stasiun.')
      return
    }
    if (selectedSeats.length !== passengerCount) {
      toast.error(`Pilih ${passengerCount} kursi terlebih dahulu.`)
      return
    }
    if (passengers.some(passenger => !passenger.fullName.trim() || !passenger.identity.trim())) {
      toast.error('Lengkapi nama dan ID simulasi setiap penumpang.')
      return
    }

    setSubmitting(true)
    const supabase = createClient()
    const { data, error } = await supabase.rpc('create_booking_for_current_user', {
      p_schedule_id: scheduleId,
      p_carriage_class: selectedClass,
      p_seat_ids: selectedSeats,
      p_passenger_names: passengers.map(passenger => passenger.fullName.trim()),
      p_passenger_ids: passengers.map(passenger => passenger.identity.trim()),
      p_passenger_phones: passengers.map(passenger => passenger.phone.trim()),
    })

    if (error) {
      setSubmitting(false)
      toast.error(`Booking gagal dibuat: ${error.message}`)
      return
    }

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('railhub_passenger_cache', JSON.stringify(passengers))
      } catch {
        // ignore
      }
    }

    if (returnScheduleId) {
      toast.success('Tiket pergi berhasil disiapkan! Sekarang pilih kursi untuk tiket pulang.')
      router.push(
        `/booking/${returnScheduleId}?class=${encodeURIComponent(returnClass || selectedClass)}&pax=${passengerCount}&date=${returnDate}&from=${returnFrom}&to=${returnToStation}&train=${encodeURIComponent(returnTrain || 'Kereta Pulang')}&price=${returnPrice}&pairedBookingId=${data}`
      )
    } else if (pairedBookingId) {
      toast.success('Tiket pulang berhasil dipesan! Silakan lanjutkan pembayaran.')
      router.push(`/booking/payment/${data}`)
    } else {
      toast.success('Booking dibuat. Selesaikan pembayaran simulasi dalam 15 menit.')
      router.push(`/booking/payment/${data}`)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', padding: '2.5rem 0 5rem', background: 'var(--rh-surface)' }}>
        <div className="rh-container rh-booking-page">
          <Link href={returnTo} className="rh-btn rh-btn-ghost rh-btn-sm rh-booking-back">
            <ArrowLeft size={16} /> Kembali ke jadwal
          </Link>
          {returnScheduleId && (
            <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', borderRadius: 12, background: 'rgba(26, 66, 138, 0.06)', border: '1.5px solid var(--rh-primary)' }}>
              <span className="rh-badge rh-badge-primary" style={{ fontWeight: 800, marginBottom: 4 }}>Perjalanan Pulang-Pergi (PP) · Bagian 1</span>
              <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--rh-primary)' }}>Pilih Kursi untuk Kereta Pergi: {origin} &rarr; {destination}</strong>
              <small style={{ color: 'var(--rh-text-2)' }}>Setelah langkah ini, Anda akan langsung memilih kursi untuk Kereta Pulang ({returnFrom} &rarr; {returnToStation}). Data penumpang disimpan otomatis.</small>
            </div>
          )}
          {pairedBookingId && (
            <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', borderRadius: 12, background: 'rgba(34, 197, 94, 0.08)', border: '1.5px solid #22c55e' }}>
              <span className="rh-badge rh-badge-success" style={{ fontWeight: 800, marginBottom: 4 }}>Perjalanan Pulang-Pergi (PP) · Bagian 2</span>
              <strong style={{ display: 'block', fontSize: '1rem', color: '#15803d' }}>Pilih Kursi untuk Kereta Pulang: {origin} &rarr; {destination}</strong>
              <small style={{ color: 'var(--rh-text-2)' }}>Tiket pergi telah tersimpan. Konfirmasikan kursi tiket pulang untuk menyelesaikan seluruh reservasi Anda.</small>
            </div>
          )}
          <header className="rh-booking-page-heading">
            <span className="rh-label">Pemesanan perjalanan</span>
            <h1 className="rh-h2">Lengkapi data perjalanan</h1>
            <p>Isi data penumpang sebelum memilih kursi yang tersedia.</p>
          </header>

          {loadError && (
            <div role="alert" className="rh-card" style={{ padding: '1.5rem', color: 'var(--rh-danger)' }}>
              {loadError}
            </div>
          )}

          {!journey && !loadError && (
            <div aria-live="polite" className="rh-card" style={{ padding: '1.5rem' }}>
              <LoaderCircle size={18} className="rh-spin" /> Memuat perjalanan dan ketersediaan kursi…
            </div>
          )}

          {journey && (
            <>
              <section className="rh-card rh-booking-trip-card" aria-label="Ringkasan perjalanan">
                <div className="rh-booking-trip-heading">
                  <div className="rh-logo-mark"><Train size={19} /></div>
                  <div>
                    <strong>{journey.schedule.train_name}</strong>
                    <span>{journey.schedule.train_number} · {selectedClass}</span>
                  </div>
                  <span className="rh-badge rh-badge-primary"><Users size={14} /> {passengerCount} penumpang</span>
                </div>
                <div className="rh-booking-trip-route">
                  <div>
                    <strong>{formatTime(journey.schedule.departure_time)}</strong>
                    <span>{journey.schedule.origin_name}</span>
                  </div>
                  <div className="rh-booking-trip-duration">
                    <small>{formatDate(journey.schedule.departure_time, { weekday: 'short', month: 'short' })}</small>
                    <span aria-hidden="true" />
                    <small>{formatDuration(journey.schedule.departure_time, journey.schedule.arrival_time)}</small>
                  </div>
                  <div>
                    <strong>{formatTime(journey.schedule.arrival_time)}</strong>
                    <span>{journey.schedule.destination_name}</span>
                  </div>
                </div>
              </section>

              {bookingClosed && (
                <section className="rh-card" role="status" style={{ padding: '1rem 1.25rem', borderColor: 'var(--rh-warning)' }}>
                  <strong>Pemesanan online sudah ditutup</strong>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--rh-text-2)' }}>
                    Pemesanan online tersedia sampai 1 jam sebelum keberangkatan. Untuk jadwal ini, silakan pesan melalui loket stasiun.
                  </p>
                </section>
              )}

              {!bookingClosed && !authLoading && !user && (
                <section className="rh-card rh-booking-auth-gate" aria-labelledby="booking-login-title">
                  <div className="rh-card-body">
                    <span className="rh-icon-wrap"><UserRound size={20} aria-hidden="true" /></span>
                    <div>
                      <h2 id="booking-login-title" className="rh-h4">Masuk untuk melanjutkan</h2>
                      <p>Jadwal pilihan Anda sudah disimpan. Masuk sebelum mengisi identitas penumpang dan memilih kursi.</p>
                    </div>
                    <Link href={loginHref} className="rh-btn rh-btn-primary">Masuk & lanjutkan</Link>
                    <Link href={`/auth/register?next=${encodeURIComponent(`/booking/${scheduleId}?${loginNextParams}`)}`} className="rh-btn rh-btn-ghost">Buat akun</Link>
                  </div>
                </section>
              )}

              {user && !bookingClosed && <>
              <div ref={stepHeadingRef} className="rh-booking-steps" aria-label="Tahapan pemesanan" tabIndex={-1}>
                <div className={`rh-booking-step ${step === 'details' ? 'is-active' : 'is-complete'}`}>
                  <span>{step === 'seats' ? <Check size={16} /> : '1'}</span>
                  Data pemesan & penumpang
                </div>
                <ChevronRight size={17} aria-hidden="true" />
                <div className={`rh-booking-step ${step === 'seats' ? 'is-active' : ''}`}>
                  <span>2</span>
                  Pilih kursi
                </div>
              </div>

              <form onSubmit={submitBooking} style={{ display: 'grid', gap: '1rem' }}>
                <section className="rh-card rh-booking-class-card">
                  <div className="rh-card-header">
                    <h2 className="rh-h4">Pilih kelas perjalanan</h2>
                    <p>Pilih tarif dan kelas yang sesuai sebelum melanjutkan.</p>
                  </div>
                  <div className="rh-card-body rh-booking-class-options">
                    {journey.fares.map(item => (
                      <button
                        type="button"
                        key={item.carriage_class}
                        aria-pressed={selectedClass === item.carriage_class}
                        className={`rh-booking-class-option ${selectedClass === item.carriage_class ? 'is-selected' : ''}`}
                        onClick={() => {
                          setSelectedClass(item.carriage_class)
                          setSelectedCarriageId('')
                          setSelectedSeats([])
                        }}
                      >
                        <span>{item.carriage_class}</span>
                        <strong>{formatIDR(item.price)}<small> / orang</small></strong>
                      </button>
                    ))}
                  </div>
                </section>

                {step === 'details' && (
                  <div className="rh-booking-details-layout">
                    <div className="rh-booking-details-main">
                      <section className="rh-card">
                        <div className="rh-card-header">
                          <h2 className="rh-h4">Data pemesan</h2>
                          <p style={{ color: 'var(--rh-text-2)', marginTop: '0.25rem' }}>
                            Informasi kontak mengikuti akun yang sedang digunakan.
                          </p>
                        </div>
                        <div className="rh-card-body rh-booking-contact-grid">
                          <div className="rh-booking-contact-item">
                            <UserRound size={17} aria-hidden="true" />
                            <span>
                              <small>Nama pemesan</small>
                              <strong>{profile?.full_name || user?.user_metadata?.full_name || 'Nama belum diatur'}</strong>
                            </span>
                          </div>
                          <div className="rh-booking-contact-item">
                            <Mail size={17} aria-hidden="true" />
                            <span>
                              <small>Email akun</small>
                              <strong>{user?.email || '-'}</strong>
                            </span>
                          </div>
                          <div className="rh-booking-contact-item">
                            <Phone size={17} aria-hidden="true" />
                            <span>
                              <small>No. HP</small>
                              <strong>{profile?.phone_number || 'Belum diisi di profil'}</strong>
                            </span>
                          </div>
                        </div>
                      </section>

                      <section className="rh-card" ref={passengerDetailsRef}>
                        <div className="rh-card-header">
                          <h2 className="rh-h4">Data penumpang</h2>
                          <p style={{ color: 'var(--rh-warning)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                            Isi nama dan ID simulasi. Jangan masukkan NIK atau data identitas asli.
                          </p>
                        </div>
                        <div className="rh-card-body" style={{ display: 'grid', gap: '1rem' }}>
                          {passengers.map((passenger, index) => (
                            <fieldset key={index} style={{ border: '1px solid var(--rh-border)', borderRadius: 12, padding: '1rem', minWidth: 0 }}>
                              <legend style={{ fontWeight: 700, padding: '0 0.4rem' }}>Penumpang {index + 1}</legend>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '0.75rem' }}>
                                <label className="rh-input-group">
                                  <span className="rh-label-text">Nama lengkap <span aria-hidden="true">*</span></span>
                                  <input
                                    className={`rh-input ${detailsAttempted && passenger.fullName.trim().length < 2 ? 'rh-input-error' : ''}`}
                                    autoComplete="off"
                                    maxLength={120}
                                    minLength={2}
                                    placeholder="Nama sesuai identitas simulasi"
                                    required
                                    aria-invalid={detailsAttempted && passenger.fullName.trim().length < 2}
                                    aria-describedby={detailsAttempted && passenger.fullName.trim().length < 2 ? `passenger-name-error-${index}` : undefined}
                                    value={passenger.fullName}
                                    onChange={event => changePassenger(index, 'fullName', event.target.value)}
                                  />
                                  {detailsAttempted && passenger.fullName.trim().length < 2 && (
                                    <small className="rh-error-msg" id={`passenger-name-error-${index}`}>Isi nama minimal 2 karakter.</small>
                                  )}
                                </label>
                                <label className="rh-input-group">
                                  <span className="rh-label-text">ID simulasi <span aria-hidden="true">*</span></span>
                                  <input
                                    className={`rh-input ${detailsAttempted && passenger.identity.trim().length < 3 ? 'rh-input-error' : ''}`}
                                    autoComplete="off"
                                    maxLength={50}
                                    minLength={3}
                                    placeholder="Contoh: SIM-001"
                                    required
                                    aria-invalid={detailsAttempted && passenger.identity.trim().length < 3}
                                    aria-describedby={detailsAttempted && passenger.identity.trim().length < 3 ? `passenger-id-error-${index}` : undefined}
                                    value={passenger.identity}
                                    onChange={event => changePassenger(index, 'identity', event.target.value)}
                                  />
                                  {detailsAttempted && passenger.identity.trim().length < 3 && (
                                    <small className="rh-error-msg" id={`passenger-id-error-${index}`}>ID simulasi minimal 3 karakter.</small>
                                  )}
                                </label>
                                <label className="rh-input-group">
                                  <span className="rh-label-text">Telepon fiktif (opsional)</span>
                                  <input className="rh-input" autoComplete="off" maxLength={30} value={passenger.phone} onChange={event => changePassenger(index, 'phone', event.target.value)} />
                                </label>
                              </div>
                            </fieldset>
                          ))}
                        </div>
                      </section>

                      <div className="rh-booking-reservation-note">
                        <strong>Ketentuan reservasi simulasi</strong>
                        <ol>
                          <li>Nama dan ID simulasi diperlukan untuk setiap penumpang.</li>
                          <li>Ketersediaan kursi dapat berubah sampai booking dibuat.</li>
                          <li>Pemesanan ini menggunakan pembayaran simulasi.</li>
                        </ol>
                      </div>
                      <div className="rh-booking-continue">
                        <button
                          className="rh-btn rh-btn-primary rh-btn-lg"
                          type="button"
                          onClick={continueToSeats}
                        >
                          Lanjutkan pilih kursi <ChevronRight size={17} />
                        </button>
                        {!passengerDetailsComplete && (
                          <small>Lengkapi nama dan ID simulasi setiap penumpang untuk melanjutkan.</small>
                        )}
                      </div>
                    </div>

                    <aside className="rh-card rh-booking-fare-summary">
                      <div className="rh-booking-fare-total">
                        <span>Total {formatIDR(total)}</span>
                      </div>
                      <div className="rh-card-body">
                        <strong>{journey.schedule.train_name} ({journey.schedule.train_number})</strong>
                        <span>{selectedClass} · {passengerCount} penumpang</span>
                        <div className="rh-booking-fare-route">
                          <span>{journey.schedule.origin_name}</span>
                          <span aria-hidden="true">→</span>
                          <span>{journey.schedule.destination_name}</span>
                        </div>
                        <small>{formatDate(journey.schedule.departure_time)} · {formatTime(journey.schedule.departure_time)} – {formatTime(journey.schedule.arrival_time)}</small>
                        <div className="rh-booking-fare-breakdown">
                          <span>{formatIDR(fare?.price || 0)} × {passengerCount} penumpang</span>
                          <strong>{formatIDR(total)}</strong>
                        </div>
                      </div>
                    </aside>
                  </div>
                )}

                {step === 'seats' && (
                  <>
                    <section className="rh-card rh-seat-picker">
                      <div className="rh-card-header">
                        <div className="rh-seat-picker-heading">
                          <div>
                            <h2 className="rh-h4">Pilih gerbong dan kursi</h2>
                            <p>Pilih gerbong terlebih dahulu, lalu pilih {passengerCount} kursi.</p>
                          </div>
                          <span className="rh-badge rh-badge-primary">{selectedSeats.length}/{passengerCount} kursi</span>
                        </div>
                        <div className="rh-seat-legend" aria-label="Keterangan status kursi">
                          <span><i className="is-available" /> Tersedia</span>
                          <span><i className="is-selected" /> Pilihan Anda</span>
                          <span><i className="is-booked" /> Terpesan</span>
                        </div>
                      </div>

                      <div className="rh-card-body">
                        {carriages.length === 0 ? (
                          <p role="status" className="rh-seat-empty">
                            Tidak ada gerbong atau kursi tersedia untuk kelas ini.
                          </p>
                        ) : (
                          <>
                            <div className="rh-carriage-tabs" role="group" aria-label="Pilih gerbong">
                              {carriages.map((carriage, index) => (
                                <button
                                  key={carriage.id}
                                  type="button"
                                  className={`rh-carriage-tab ${selectedCarriageId === carriage.id ? 'is-selected' : ''}`}
                                  aria-pressed={selectedCarriageId === carriage.id}
                                  onClick={() => setSelectedCarriageId(carriage.id)}
                                >
                                  <span>{selectedClass} {carriage.number || index + 1}</span>
                                  <small>{carriage.seats.length}/40 kursi · {carriage.seats.filter(seat => seat.is_available).length} tersedia</small>
                                </button>
                              ))}
                            </div>

                            {!selectedCarriage ? (
                              <div className="rh-seat-prompt" role="status">
                                <Train size={26} />
                                <strong>Pilih gerbong untuk melihat denah kursi</strong>
                                <span>Pilih salah satu gerbong di atas untuk melihat dan memilih kursi.</span>
                              </div>
                            ) : (
                              <div className="rh-seat-map-wrap">
                                <div className="rh-seat-map-label">
                                  <strong>Gerbong {selectedCarriage.number}</strong>
                                  <span>{selectedCarriageSeats.length}/40 kursi · {selectedCarriageSeats.filter(seat => seat.is_available).length} tersedia</span>
                                </div>
                                {selectedCarriageSeats.length !== 40 && (
                                  <p className="rh-seat-capacity-warning" role="status">
                                    Data gerbong ini baru memuat {selectedCarriageSeats.length} dari 40 kursi. Jalankan migrasi kapasitas kursi di Supabase agar denah lengkap.
                                  </p>
                                )}
                                <div className="rh-seat-map-scroll">
                                  <div className="rh-seat-map" role="group" aria-label={`Denah kursi gerbong ${selectedCarriage.number}`}>
                                    <div className="rh-seat-map-column-labels" aria-hidden="true">
                                      <span />
                                      <span>A</span><span>B</span><span className="is-aisle" />
                                      <span>C</span><span>D</span>
                                    </div>
                                    {/* Legend Bar: Gender Cowo/Cewe & Kursi Disabilitas */}
                                    <div className="rh-seat-legend-bar" role="note" aria-label="Keterangan denah kursi">
                                      <div className="rh-seat-legend-item">
                                        <span className="rh-seat-legend-sample is-available" />
                                        <span>Tersedia</span>
                                      </div>
                                      <div className="rh-seat-legend-item">
                                        <span className="rh-seat-legend-sample is-selected" />
                                        <span>Dipilih</span>
                                      </div>
                                      <div className="rh-seat-legend-item">
                                        <span className="rh-seat-legend-sample is-disability" />
                                        <span>Disabilitas / Lansia</span>
                                      </div>
                                      <div className="rh-seat-legend-item">
                                        <span className="rh-seat-legend-sample is-female-priority" />
                                        <span>Khusus Cewe</span>
                                      </div>
                                      <div className="rh-seat-legend-item">
                                        <span className="rh-seat-legend-sample is-booked-male" />
                                        <span>Terisi (Pria)</span>
                                      </div>
                                      <div className="rh-seat-legend-item">
                                        <span className="rh-seat-legend-sample is-booked-female" />
                                        <span>Terisi (Cewe)</span>
                                      </div>
                                    </div>

                                    {seatRows.map(([rowNumber, rowSeats]) => (
                                      <div className="rh-seat-map-row" key={rowNumber}>
                                        <span className="rh-seat-row-number">{rowNumber}</span>
                                        {[0, 1, null, 2, 3].map((column, columnIndex) => {
                                          if (column === null) return <span key={`aisle-${columnIndex}`} className="rh-seat-aisle" aria-hidden="true" />
                                          const seat = rowSeats[column]
                                          if (!seat) return <span key={`empty-${column}`} className="rh-seat-empty-cell" aria-hidden="true" />
                                          const selected = selectedSeats.includes(seat.id)
                                          
                                          // Deterministic special categories
                                          const match = String(seat.seat_number).match(/^(\d+)\s*([A-D])$/i)
                                          const rNum = match ? Number(match[1]) : rowNumber
                                          const colLet = match ? match[2].toUpperCase() : ''
                                          const isDisability = rNum === 1
                                          const isFemalePriority = (rNum === 2 || rNum === 3) && (colLet === 'A' || colLet === 'B')
                                          const bookedGender = !seat.is_available
                                            ? ((String(seat.seat_number).charCodeAt(0) + String(seat.id || '').charCodeAt(0)) % 2 === 0 ? 'F' : 'M')
                                            : null

                                          let seatClasses = 'rh-seat-map-seat'
                                          if (selected) {
                                            seatClasses += ' is-selected'
                                          } else if (!seat.is_available) {
                                            seatClasses += bookedGender === 'F' ? ' is-booked is-booked-female' : ' is-booked is-booked-male'
                                          } else if (isDisability) {
                                            seatClasses += ' is-available is-disability-priority'
                                          } else if (isFemalePriority) {
                                            seatClasses += ' is-available is-female-priority'
                                          } else {
                                            seatClasses += ' is-available'
                                          }

                                          let seatLabel = `Kursi ${seat.seat_number}`
                                          if (selected) seatLabel += ', dipilih'
                                          else if (!seat.is_available) seatLabel += `, terpesan oleh penumpang ${bookedGender === 'F' ? 'wanita' : 'pria'}`
                                          else if (isDisability) seatLabel += ', prioritas disabilitas & lansia'
                                          else if (isFemalePriority) seatLabel += ', khusus/prioritas wanita'
                                          else seatLabel += ', tersedia'

                                          return (
                                            <button
                                              key={seat.id}
                                              type="button"
                                              className={seatClasses}
                                              disabled={!seat.is_available}
                                              aria-pressed={selected}
                                              aria-label={seatLabel}
                                              title={seatLabel}
                                              onClick={() => toggleSeat(seat, isDisability, isFemalePriority)}
                                            >
                                              {selected ? (
                                                <Check size={16} aria-hidden="true" />
                                              ) : !seat.is_available ? (
                                                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, fontSize: '0.62rem' }}>
                                                  <User size={12} strokeWidth={2.5} style={{ color: bookedGender === 'F' ? '#f472b6' : '#93c5fd', marginBottom: 1 }} />
                                                  <span style={{ fontSize: '0.65rem' }}>{seat.seat_number}</span>
                                                </span>
                                              ) : (
                                                seat.seat_number
                                              )}
                                            </button>
                                          )
                                        })}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </section>

                    <section className="rh-card">
                      <div className="rh-card-body rh-booking-seat-footer">
                        <div>
                          <span>Total · {passengerCount} penumpang</span>
                          <strong>{formatIDR(total)}</strong>
                          <small>
                            {selectedSeats.length === 0
                              ? 'Pilih kursi dari denah'
                              : `${selectedSeats.length} dari ${passengerCount} kursi dipilih`}
                          </small>
                        </div>
                        <div className="rh-booking-seat-actions">
                          <button className="rh-btn rh-btn-ghost" type="button" onClick={() => setStep('details')}>
                            <ArrowLeft size={16} /> Kembali ke data
                          </button>
                          <button className="rh-btn rh-btn-primary rh-btn-lg" type="submit" disabled={submitting || selectedSeats.length !== passengerCount}>
                            {submitting && <LoaderCircle size={17} className="rh-spin" />}
                            {submitting ? 'Membuat booking…' : 'Buat booking'}
                          </button>
                        </div>
                      </div>
                    </section>
                  </>
                )}
              </form>
              </>}
            </>
          )}
        </div>
      </main>
    </>
  )
}
