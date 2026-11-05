'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import toast from 'react-hot-toast'
import { CheckCircle2, Clock, Headphones, Mail, MapPin, MessageCircle, Phone, Send, Train } from 'lucide-react'

const STATION_DESKS = [
  { code: 'GMR', name: 'Stasiun Gambir', city: 'Jakarta Pusat', desk: 'Hall Selatan Lantai 1 · Peron 1–4', hours: '24 Jam' },
  { code: 'BD', name: 'Stasiun Bandung', city: 'Kota Bandung', desk: 'Lobby Utara Pintu Kebon Kawung', hours: '24 Jam' },
  { code: 'YK', name: 'Stasiun Yogyakarta', city: 'Kota Yogyakarta', desk: 'Pintu Timur Malioboro · Customer Desk', hours: '24 Jam' },
  { code: 'SLO', name: 'Stasiun Solo Balapan', city: 'Kota Surakarta', desk: 'Zona Layanan Terpadu Lantai Dasar', hours: '05.00 – 23.00 WIB' },
  { code: 'SGU', name: 'Stasiun Surabaya Gubeng', city: 'Kota Surabaya', desk: 'Terminal Baru Sisi Timur', hours: '24 Jam' },
]

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [bookingCode, setBookingCode] = useState('')
  const [topic, setTopic] = useState('Perubahan Jadwal / Reschedule')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Mohon lengkapi nama, email, dan isi pesan.')
      return
    }
    setSubmitted(true)
    toast.success('Pesan layanan pelanggan berhasil dikirim!')
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281234567890'
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Halo Contact Service RAILHUB, saya membutuhkan informasi terkait perjalanan kereta api.`
  )}`

  return (
    <div>
      <Navbar />

      <section className="rh-hero" style={{ padding: '4rem 0 3.5rem' }}>
        <div className="rh-container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="rh-badge" style={{ background: 'rgba(255,255,255,0.12)', color: 'var(--rh-accent)', border: '1px solid rgba(255,255,255,0.18)', marginBottom: '1rem' }}>
            <Headphones size={14} /> Contact Service 24/7
          </span>
          <h1 className="rh-h1" style={{ color: 'white', marginBottom: '0.75rem' }}>
            Pusat Bantuan & Layanan Pelanggan
          </h1>
          <p className="rh-body-lg" style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 620 }}>
            Hubungi tim operasional RAILHUB untuk bantuan tiket, informasi peron, kendala perjalanan, maupun pelaporan barang tertinggal di rangkaian kereta.
          </p>
        </div>
      </section>

      <section className="rh-section" style={{ background: 'var(--rh-surface)' }}>
        <div className="rh-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            <div className="rh-card">
              <div className="rh-card-header">
                <h2 className="rh-h3" style={{ margin: 0 }}>Kirim Pesan Bantuan</h2>
                <p style={{ color: 'var(--rh-text-2)', margin: '0.35rem 0 0' }}>
                  Sampaikan pertanyaan atau kendala Anda kepada tim layanan pelanggan RAILHUB.
                </p>
              </div>
              <div className="rh-card-body">
                {submitted ? (
                  <div style={{ padding: '1.5rem', borderRadius: 12, background: 'var(--rh-success-light)', color: 'var(--rh-success)', display: 'grid', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem' }}>
                      <CheckCircle2 size={20} /> Tiket Bantuan Diterima
                    </div>
                    <p style={{ margin: 0, color: 'var(--rh-text)' }}>
                      Terima kasih, <strong>{name}</strong>. Permintaan Anda terkait <strong>{topic}</strong> telah tercatat dan akan ditindaklanjuti oleh petugas layanan pelanggan.
                    </p>
                    <button
                      type="button"
                      className="rh-btn rh-btn-primary rh-btn-sm"
                      style={{ justifySelf: 'start' }}
                      onClick={() => {
                        setSubmitted(false)
                        setMessage('')
                      }}
                    >
                      Kirim Pesan Lainnya
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    <label className="rh-input-group">
                      <span className="rh-label-text">Nama Lengkap</span>
                      <input className="rh-input" value={name} onChange={e => setName(e.target.value)} placeholder="Nama sesuai identitas" required />
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                      <label className="rh-input-group">
                        <span className="rh-label-text">Email</span>
                        <input className="rh-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" required />
                      </label>
                      <label className="rh-input-group">
                        <span className="rh-label-text">Kode Booking (Opsional)</span>
                        <input className="rh-input rh-mono" value={bookingCode} onChange={e => setBookingCode(e.target.value)} placeholder="RH-…" />
                      </label>
                    </div>
                    <label className="rh-input-group">
                      <span className="rh-label-text">Topik Layanan</span>
                      <select className="rh-input" value={topic} onChange={e => setTopic(e.target.value)}>
                        <option>Perubahan Jadwal / Reschedule</option>
                        <option>Konfirmasi Pembayaran & E-Tiket</option>
                        <option>Laporan Barang Tertinggal (Lost & Found)</option>
                        <option>Layanan Makanan & Restorasi Kereta</option>
                        <option>Masukan & Saran Layanan</option>
                      </select>
                    </label>
                    <label className="rh-input-group">
                      <span className="rh-label-text">Rincian Pesan</span>
                      <textarea
                        className="rh-input"
                        rows={4}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Tuliskan detail perjalanan, nomor kereta, atau pertanyaan Anda…"
                        required
                      />
                    </label>
                    <button type="submit" className="rh-btn rh-btn-primary">
                      <Send size={16} /> Kirim ke Contact Service
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div className="rh-card">
                <div className="rh-card-body" style={{ display: 'grid', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Saluran Kontak Cepat</h3>
                  <div style={{ display: 'grid', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--rh-primary-light)', color: 'var(--rh-primary)', display: 'grid', placeItems: 'center' }}>
                        <Phone size={18} />
                      </div>
                      <div>
                        <small style={{ color: 'var(--rh-text-2)', display: 'block' }}>Call Center 24 Jam</small>
                        <strong>121 / +62 812-3456-7890</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--rh-success-light)', color: 'var(--rh-success)', display: 'grid', placeItems: 'center' }}>
                        <MessageCircle size={18} />
                      </div>
                      <div>
                        <small style={{ color: 'var(--rh-text-2)', display: 'block' }}>WhatsApp Resmi</small>
                        <a href={whatsappHref} target="_blank" rel="noreferrer" style={{ color: 'var(--rh-primary)', fontWeight: 700 }}>
                          Chat Customer Care RAILHUB
                        </a>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--rh-info-light)', color: 'var(--rh-info)', display: 'grid', placeItems: 'center' }}>
                        <Mail size={18} />
                      </div>
                      <div>
                        <small style={{ color: 'var(--rh-text-2)', display: 'block' }}>Surat Elektronik</small>
                        <strong>support@railhub.id</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rh-card">
                <div className="rh-card-header">
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Pos Layanan Stasiun Utama</h3>
                </div>
                <div className="rh-card-body" style={{ display: 'grid', gap: '0.75rem' }}>
                  {STATION_DESKS.map(st => (
                    <div key={st.code} style={{ padding: '0.75rem 0.9rem', borderRadius: 10, border: '1px solid var(--rh-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.92rem' }}>{st.name} ({st.code})</strong>
                        <small style={{ color: 'var(--rh-text-2)', display: 'block' }}>{st.desk}</small>
                      </div>
                      <span className="rh-badge rh-badge-primary" style={{ whiteSpace: 'nowrap' }}>
                        <Clock size={12} /> {st.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

