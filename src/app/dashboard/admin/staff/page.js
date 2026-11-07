'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw, ShieldCheck, UserRound, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { useConfirm } from '@/contexts/ConfirmDialogContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTime } from '@/lib/utils/formatters'

function jakartaDateInputValue(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function jakartaDateStart(dateValue) {
  return new Date(`${dateValue}T00:00:00+07:00`).toISOString()
}

function assignableScheduleId(schedules, currentId) {
  if (schedules.some(schedule => schedule.id === currentId && schedule.status !== 'cancelled')) return currentId
  return schedules.find(schedule => schedule.status !== 'cancelled')?.id || ''
}

export default function AdminStaffPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const { confirm } = useConfirm()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [staff, setStaff] = useState([])
  const [passengersList, setPassengersList] = useState([])
  const [selectedPromoteUser, setSelectedPromoteUser] = useState('')
  const [selectedStaffType, setSelectedStaffType] = useState('conductor')
  const [selectedStation, setSelectedStation] = useState('')
  const [stations, setStations] = useState([])
  const [promoting, setPromoting] = useState(false)
  const [schedules, setSchedules] = useState([])
  const [assignments, setAssignments] = useState([])
  const [selectedStaff, setSelectedStaff] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [scheduleSearch, setScheduleSearch] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?next=%2Fdashboard%2Fadmin%2Fstaff')
    } else if (!authLoading && profile?.role && profile.role !== 'admin') {
      router.replace((profile.role === 'conductor' || profile.role === 'gate' || profile.role === 'staff' || profile.staff_type) ? '/dashboard/staff' : '/dashboard/passenger')
    }
  }, [authLoading, profile?.role, profile?.staff_type, router, user])

  const loadStaffData = useCallback(async () => {
    if (!user || profile?.role !== 'admin') return

    setLoading(true)
    setError('')
    const supabase = createClient()
    const [staffResult, scheduleResult, assignmentResult, passengersResult, stationsResult] = await Promise.all([
      supabase.from('profiles')
        .select('*')
        .eq('role', 'conductor')
        .order('full_name'),
      supabase.from('schedules')
        .select('id, status, departure_time, trains(name, train_number), routes(name)')
        .gte('departure_time', jakartaDateStart(jakartaDateInputValue()))
        .order('departure_time')
        .limit(1000),
      supabase.from('staff_assignments')
        .select('id, staff_id, schedule_id, profiles!staff_assignments_staff_id_fkey(full_name, email), schedules(departure_time, trains(name, train_number), routes(name))')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase.from('profiles')
        .select('id, full_name, email, role')
        .eq('role', 'passenger')
        .order('full_name')
        .limit(200),
      supabase.from('stations').select('id, name, code').eq('operational_status', 'active').order('name'),
    ])

    const failure = [staffResult, scheduleResult, assignmentResult].find(result => result.error)
    if (failure) {
      setError(`Data pengelolaan petugas tidak dapat dimuat: ${failure.error.message}`)
      setLoading(false)
      return
    }

    const stationRows = stationsResult?.data || []
    const stationsById = new Map(stationRows.map(station => [station.id, station]))
    const staffRows = (staffResult.data || []).map(person => ({
      ...person,
      staff_type: person.staff_type || 'conductor',
      stations: stationsById.get(person.station_id) || null,
    }))
    const scheduleRows = scheduleResult.data || []
    setStaff(staffRows)
    setPassengersList(passengersResult?.data || [])
    setStations(stationRows)
    setSchedules(scheduleRows)
    setAssignments(assignmentResult.data || [])
    const conductors = staffRows.filter(person => person.staff_type !== 'gate')
    setSelectedStaff(current => conductors.some(person => person.id === current) ? current : conductors[0]?.id || '')
    setSelectedSchedule(current => assignableScheduleId(scheduleRows, current))
    setLoading(false)
  }, [user, profile?.role])

  useEffect(() => {
    const timer = window.setTimeout(() => loadStaffData(), 0)
    return () => window.clearTimeout(timer)
  }, [loadStaffData, reloadKey])

  async function handlePromoteSubmit(event) {
    event.preventDefault()
    if (!selectedPromoteUser || promoting || (selectedStaffType === 'gate' && !selectedStation)) return
    setPromoting(true)
    const supabase = createClient()
    const { error: err } = await supabase.rpc('admin_set_staff_role', {
      p_user_id: selectedPromoteUser,
      p_staff_type: selectedStaffType,
      p_station_id: selectedStaffType === 'gate' ? selectedStation : null,
    })
    setPromoting(false)
    if (err) {
      toast.error(`Gagal mempromosikan petugas: ${err.message}`)
      return
    }
    toast.success(`Pengguna berhasil dijadikan ${selectedStaffType === 'gate' ? 'Petugas Gerbang' : 'Kondektur'}!`)
    setSelectedPromoteUser('')
    setReloadKey(k => k + 1)
  }

  async function demoteFromStaff(userId) {
    const ok = await confirm({
      title: 'Nonaktifkan Status Petugas',
      message: 'Apakah Anda yakin ingin menghapus status petugas akun ini dan mengembalikannya menjadi penumpang biasa?',
      confirmText: 'Ya, Nonaktifkan Petugas',
      cancelText: 'Batal',
      variant: 'danger',
    })
    if (!ok) return
    const supabase = createClient()
    const { error: err } = await supabase.rpc('admin_set_user_role', {
      p_user_id: userId,
      p_role: 'passenger',
    })
    if (err) {
      toast.error(`Gagal menghapus status petugas: ${err.message}`)
      return
    }
    toast.success('Status petugas dinonaktifkan.')
    setReloadKey(k => k + 1)
  }

  async function assignStaff(event) {
    event.preventDefault()
    if (!selectedStaff || !selectedSchedule || submitting) return
    setSubmitting(true)
    const supabase = createClient()
    const { error: assignmentError } = await supabase.rpc('admin_assign_staff', {
      p_staff_id: selectedStaff,
      p_schedule_id: selectedSchedule,
    })
    setSubmitting(false)
    if (assignmentError) {
      toast.error(`Penugasan gagal: ${assignmentError.message}`)
      return
    }
    toast.success('Petugas berhasil ditugaskan.')
    setReloadKey(key => key + 1)
  }

  async function removeAssignment(assignmentId) {
    const ok = await confirm({
      title: 'Hapus Penugasan Petugas',
      message: 'Apakah Anda yakin ingin menghapus penugasan petugas ini dari jadwal perjalanan kereta?',
      confirmText: 'Ya, Hapus Penugasan',
      cancelText: 'Batal',
      variant: 'danger',
    })
    if (!ok) return
    const supabase = createClient()
    const { error: removeError } = await supabase.rpc('admin_remove_staff_assignment', {
      p_assignment_id: assignmentId,
    })
    if (removeError) {
      toast.error(`Penugasan tidak dapat dihapus: ${removeError.message}`)
      return
    }
    toast.success('Penugasan dihapus.')
    setAssignments(current => current.filter(assignment => assignment.id !== assignmentId))
  }

  const assignableSchedules = schedules.filter(schedule => schedule.status !== 'cancelled')
  const conductors = staff.filter(person => person.staff_type !== 'gate')
  const filteredSchedules = useMemo(() => {
    const search = scheduleSearch.trim().toLocaleLowerCase('id-ID')
    return assignableSchedules.filter(schedule => {
      const departureDate = jakartaDateInputValue(new Date(schedule.departure_time))
      const matchesDate = !scheduleDate || departureDate === scheduleDate
      const matchesSearch = !search || [
        schedule.trains?.name,
        schedule.trains?.train_number,
        schedule.routes?.name,
        departureDate,
        formatDate(schedule.departure_time),
      ].some(value => value?.toLocaleLowerCase('id-ID').includes(search))
      return matchesDate && matchesSearch
    })
  }, [assignableSchedules, scheduleDate, scheduleSearch])
  const selectedScheduleDetails = assignableSchedules.find(schedule => schedule.id === selectedSchedule)

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', padding: '2rem 0 5rem', background: 'var(--rh-surface)' }}>
        <div className="rh-container">
          <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <a href="/dashboard/admin" className="rh-back-btn" aria-label="Kembali ke ringkasan admin" title="Kembali ke ringkasan admin">
                <ArrowLeft size={18} />
              </a>
              <div>
                <span className="rh-badge rh-badge-primary">Operasional</span>
                <h1 className="rh-h2" style={{ margin: '0.2rem 0 0' }}><Users size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Pengelolaan petugas</h1>
              </div>
            </div>
            <button type="button" className="rh-btn rh-btn-ghost" onClick={() => setReloadKey(key => key + 1)} disabled={loading}>
              <RefreshCw size={16} /> Muat ulang
            </button>
          </header>

          {error && <div role="alert" className="rh-card" style={{ padding: '1.25rem', color: 'var(--rh-danger)', marginBottom: '1rem' }}>{error}</div>}
          {loading && <div aria-live="polite" className="rh-card" style={{ padding: '1rem', marginBottom: '1rem' }}>Memuat data petugas dan penugasan…</div>}

          {/* Card: Promosikan Akun Menjadi Petugas */}
          <section className="rh-card" style={{ marginBottom: '1.5rem' }}>
            <div className="rh-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h2 className="rh-h4"><ShieldCheck size={18} style={{ verticalAlign: 'middle', marginRight: 7, color: 'var(--rh-primary)' }} />Daftar Akun Petugas ({staff.length})</h2>
                <p style={{ color: 'var(--rh-text-2)', marginTop: '0.25rem', fontSize: '0.88rem' }}>
                  Pilih akun pengguna yang sudah terdaftar untuk dijadikan Petugas Kondektur aktif.
                </p>
              </div>
            </div>
            <div className="rh-card-body">
              <form onSubmit={handlePromoteSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end', marginBottom: staff.length > 0 ? '1.25rem' : 0 }}>
                <label className="rh-input-group" style={{ flex: '1 1 280px', margin: 0 }}>
                  <span className="rh-label-text">Pilih Akun Terdaftar untuk Dijadikan Petugas</span>
                  <select
                    className="rh-input"
                    value={selectedPromoteUser}
                    onChange={e => setSelectedPromoteUser(e.target.value)}
                    required
                  >
                    <option value="">-- Pilih Akun Penumpang ({passengersList.length} terdaftar) --</option>
                    {passengersList.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.full_name || 'Tanpa Nama'} ({p.email})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="rh-input-group" style={{ flex: '0 1 210px', margin: 0 }}>
                  <span className="rh-label-text">Peran operasional</span>
                  <select className="rh-input" value={selectedStaffType} onChange={event => setSelectedStaffType(event.target.value)}>
                    <option value="conductor">Kondektur kereta</option>
                    <option value="gate">Petugas gerbang</option>
                  </select>
                </label>
                {selectedStaffType === 'gate' && <label className="rh-input-group" style={{ flex: '1 1 250px', margin: 0 }}>
                  <span className="rh-label-text">Stasiun tugas</span>
                  <select className="rh-input" value={selectedStation} onChange={event => setSelectedStation(event.target.value)} required>
                    <option value="">Pilih stasiun</option>
                    {stations.map(station => <option key={station.id} value={station.id}>{station.name} ({station.code})</option>)}
                  </select>
                </label>}
                <button type="submit" className="rh-btn rh-btn-primary" disabled={promoting || !selectedPromoteUser || (selectedStaffType === 'gate' && !selectedStation)}>
                  {promoting ? 'Memproses…' : '+ Jadikan Petugas'}
                </button>
              </form>

              {staff.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {staff.map(person => (
                    <div
                      key={person.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '0.4rem 0.8rem',
                        background: 'var(--rh-surface)',
                        border: '1px solid var(--rh-border)',
                        borderRadius: 8,
                        fontSize: '0.88rem',
                      }}
                    >
                      <UserRound size={15} color="var(--rh-primary)" />
                      <span><strong>{person.full_name}</strong> · {person.staff_type === 'gate' ? `Gerbang ${person.stations?.name || 'tanpa stasiun'}` : 'Kondektur'} ({person.email})</span>
                      <button
                        type="button"
                        onClick={() => demoteFromStaff(person.id)}
                        className="rh-btn rh-btn-ghost rh-btn-sm"
                        style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem', color: 'var(--rh-danger)' }}
                        title="Kembalikan ke Penumpang"
                      >
                        Hapus Status
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rh-card" style={{ marginBottom: '1.5rem' }}>
            <div className="rh-card-header">
              <h2 className="rh-h4"><UserRound size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />Tugaskan petugas</h2>
              <p style={{ color: 'var(--rh-text-2)', marginTop: '0.25rem' }}>Cari perjalanan berdasarkan nama kereta, nomor, rute, atau tanggal, lalu pilih dari daftar.</p>
            </div>
            <div className="rh-card-body">
              {conductors.length === 0 ? (
                <p style={{ color: 'var(--rh-text-2)' }}>Belum ada profil ber-role petugas. Buat/promosikan akun petugas secara aman terlebih dahulu.</p>
              ) : assignableSchedules.length === 0 ? (
                <p style={{ color: 'var(--rh-text-2)' }}>Tidak ada jadwal mendatang yang dapat ditugaskan.</p>
              ) : (
                <form onSubmit={assignStaff} style={{ display: 'grid', gap: '1rem' }}>
                  <label className="rh-input-group" style={{ flex: '1 1 240px' }}>
                    <span className="rh-label-text">Petugas</span>
                    <select className="rh-input" value={selectedStaff} onChange={event => setSelectedStaff(event.target.value)} required>
                      {conductors.map(person => <option key={person.id} value={person.id}>{person.full_name} · {person.email}</option>)}
                    </select>
                  </label>
                  <div>
                    <span className="rh-label-text" style={{ display: 'block', marginBottom: '0.5rem' }}>Perjalanan</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <label className="rh-input-group" style={{ flex: '1 1 260px' }}>
                        <span className="rh-label-text">Cari kereta, rute, atau tanggal</span>
                        <input
                          className="rh-input"
                          type="search"
                          value={scheduleSearch}
                          onChange={event => setScheduleSearch(event.target.value)}
                          placeholder="Contoh: Argo, Gambir, atau 2026-11-05"
                        />
                      </label>
                      <label className="rh-input-group" style={{ flex: '0 1 210px' }}>
                        <span className="rh-label-text">Filter tanggal</span>
                        <input className="rh-input" type="date" value={scheduleDate} onChange={event => setScheduleDate(event.target.value)} />
                      </label>
                      {(scheduleSearch || scheduleDate) && (
                        <button className="rh-btn rh-btn-ghost" type="button" onClick={() => { setScheduleSearch(''); setScheduleDate('') }}>
                          Hapus filter
                        </button>
                      )}
                    </div>

                    <p aria-live="polite" style={{ color: 'var(--rh-text-2)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      {filteredSchedules.length} perjalanan cocok. Jadwal terdekat ditampilkan lebih dulu.
                    </p>
                    <div role="radiogroup" aria-label="Pilih perjalanan untuk petugas" style={{ display: 'grid', gap: '0.5rem', maxHeight: 320, overflowY: 'auto', padding: '0.15rem' }}>
                      {filteredSchedules.slice(0, 50).map(schedule => (
                        <label
                          key={schedule.id}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            border: `1px solid ${selectedSchedule === schedule.id ? 'var(--rh-primary)' : 'var(--rh-border)'}`,
                            borderRadius: 12,
                            padding: '0.85rem 1rem',
                            background: selectedSchedule === schedule.id ? 'var(--rh-primary-light)' : 'var(--rh-white)',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name="staff-assignment-schedule"
                            value={schedule.id}
                            checked={selectedSchedule === schedule.id}
                            onChange={() => setSelectedSchedule(schedule.id)}
                            style={{ marginTop: 4, accentColor: 'var(--rh-primary)' }}
                          />
                          <span style={{ minWidth: 0 }}>
                            <strong style={{ display: 'block' }}>{schedule.trains?.name || 'Kereta'} · {schedule.trains?.train_number || '-'}</strong>
                            <span style={{ display: 'block', color: 'var(--rh-text-2)', fontSize: '0.9rem' }}>{schedule.routes?.name || 'Rute tidak tersedia'}</span>
                            <small style={{ display: 'block', marginTop: '0.25rem', color: 'var(--rh-text-2)' }}>
                              {formatDate(schedule.departure_time)} · {formatTime(schedule.departure_time)} WIB
                            </small>
                          </span>
                        </label>
                      ))}
                      {filteredSchedules.length === 0 && (
                        <p style={{ color: 'var(--rh-text-2)', padding: '1rem', textAlign: 'center' }}>Tidak ada perjalanan yang cocok. Coba ubah pencarian atau tanggal.</p>
                      )}
                    </div>
                    {filteredSchedules.length > 50 && (
                      <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--rh-text-2)' }}>
                        Menampilkan 50 dari {filteredSchedules.length} perjalanan. Persempit pencarian untuk menemukan jadwal lainnya.
                      </small>
                    )}
                    {selectedScheduleDetails && (
                      <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                        Dipilih: <strong>{selectedScheduleDetails.trains?.name} · {selectedScheduleDetails.routes?.name}</strong>
                      </p>
                    )}
                  </div>
                  <div>
                    <button className="rh-btn rh-btn-primary" type="submit" disabled={submitting || loading || !selectedSchedule}>
                      {submitting && <RefreshCw size={15} className="rh-spin" />}
                      {submitting ? 'Menyimpan…' : 'Tugaskan petugas'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          <section id="active-assignments" className="rh-card" style={{ scrollMarginTop: 96 }}>
            <div className="rh-card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="var(--rh-primary)" />
              <h2 className="rh-h4" style={{ margin: 0 }}>Daftar penugasan</h2>
              <span className="rh-badge" style={{ marginLeft: 'auto' }}>{assignments.length}</span>
            </div>
            <div className="rh-card-body">
              {assignments.length === 0 && !loading && <p style={{ color: 'var(--rh-text-2)' }}>Belum ada penugasan petugas.</p>}
              <div style={{ display: 'grid', gap: '0.65rem' }}>
                {assignments.map(assignment => (
                  <article key={assignment.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.8rem', border: '1px solid var(--rh-border)', borderRadius: 12, padding: '0.85rem 1rem' }}>
                    <div style={{ flex: '1 1 210px' }}>
                      <strong style={{ display: 'block' }}>{assignment.profiles?.full_name || 'Petugas'}</strong>
                      <small style={{ color: 'var(--rh-text-2)' }}>{assignment.profiles?.email}</small>
                    </div>
                    <div style={{ flex: '2 1 270px' }}>
                      <strong style={{ display: 'block' }}>{assignment.schedules?.trains?.name || 'Kereta'} · {assignment.schedules?.routes?.name || 'Rute tidak tersedia'}</strong>
                      <small style={{ color: 'var(--rh-text-2)' }}>{assignment.schedules?.departure_time ? `${formatDate(assignment.schedules.departure_time)} · ${formatTime(assignment.schedules.departure_time)}` : ''}</small>
                    </div>
                    <button className="rh-btn rh-btn-ghost rh-btn-sm" type="button" onClick={() => removeAssignment(assignment.id)}>Hapus penugasan</button>
                  </article>
                ))}
              </div>
              {assignments.length === 100 && <small style={{ display: 'block', marginTop: '0.75rem', color: 'var(--rh-text-2)' }}>Menampilkan maksimal 100 penugasan terbaru.</small>}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
