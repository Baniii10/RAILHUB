'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ChevronDown, ChevronRight, HelpCircle, Search, ShieldCheck, Ticket, Train, Utensils, Wallet } from 'lucide-react'

const FAQ_CATEGORIES = [
  { id: 'all', label: 'Semua Topik', icon: HelpCircle },
  { id: 'booking', label: 'Pemesanan & Kursi', icon: Ticket },
  { id: 'payment', label: 'Pembayaran & Refund', icon: Wallet },
  { id: 'boarding', label: 'E-Boarding & Peron', icon: Train },
  { id: 'onboard', label: 'Makanan & Layanan', icon: Utensils },
  { id: 'account', label: 'Akun & Verifikasi', icon: ShieldCheck },
]

const FAQ_ITEMS = [
  {
    category: 'booking',
    q: 'Bagaimana cara memesan tiket untuk lebih dari satu penumpang dalam satu akun?',
    a: 'Saat mencari jadwal di halaman Beranda atau Pesan Tiket, pilih jumlah penumpang (hingga 6 orang dalam 1 transaksi). Anda dapat memilih kursi terpisah di gerbong yang sama dan mengisi identitas masing-masing penumpang.',
  },
  {
    category: 'booking',
    q: 'Apakah kursi yang sama bisa terjual ganda pada jadwal perjalanan yang sama?',
    a: 'Tidak. Sistem database RAILHUB mengunci kursi secara atomik pada saat booking dibuat (status pending/paid), sehingga kursi yang sama pada perjalanan yang sama dijamin tidak dapat dipesan ganda.',
  },
  {
    category: 'payment',
    q: 'Metode pembayaran apa saja yang didukung?',
    a: 'RAILHUB menyediakan simulasi pembayaran instan menggunakan QRIS, E-Wallet, dan Transfer Bank. Segera setelah dikonfirmasi, tiket digital dan kode QR langsung diterbitkan tanpa memproses uang sungguhan.',
  },
  {
    category: 'payment',
    q: 'Apa ketentuan Reschedule (ubah jadwal) dan Pembatalan tiket?',
    a: 'Tiket yang sudah dibayar dapat di-reschedule atau dibatalkan minimal 24 jam sebelum waktu keberangkatan. Reschedule mengenakan biaya 20% atas selisih tarif positif, sedangkan pembatalan mencatat biaya administrasi 20% dan pengembalian dana simulasi 80%.',
  },
  {
    category: 'boarding',
    q: 'Kapan E-Boarding Pass dan QR Code dapat dibuka?',
    a: 'Tiket digital langsung terbit setelah pembayaran dikonfirmasi, sedangkan E-Boarding Pass interaktif akan terbuka mulai 2 jam sebelum jadwal keberangkatan beserta informasi nomor gerbong dan peron keberangkatan.',
  },
  {
    category: 'boarding',
    q: 'Bagaimana cara mengetahui lokasi peron keberangkatan kereta saya?',
    a: 'Informasi nomor peron (misalnya Peron 1 hingga Peron 4) dan nomor gerbong ditampilkan langsung pada kartu Tiket Saya, halaman detail pembayaran/tiket, serta tab My Journey di Dashboard Penumpang.',
  },
  {
    category: 'onboard',
    q: 'Bagaimana cara memesan makanan dan minuman saat di dalam kereta?',
    a: 'Buka tiket perjalanan Anda yang berstatus Terbayar atau masuk ke menu Onboard Services di Dashboard Penumpang, pilih menu kuliner restorasi kereta, konfirmasi metode pembayaran simulasi, dan petugas kereta akan mengantarkannya langsung ke nomor kursi Anda.',
  },
  {
    category: 'onboard',
    q: 'Bagaimana jika ada barang tertinggal atau membutuhkan bantuan petugas?',
    a: 'Gunakan fitur My Reports (Laporan Bantuan & Lost and Found) pada tiket aktif Anda. Laporan Anda langsung masuk ke meja layanan petugas kondektur yang bertugas di jadwal kereta tersebut.',
  },
  {
    category: 'account',
    q: 'Bagaimana cara memverifikasi identitas KTP/NIK pada akun saya?',
    a: 'Verifikasi dokumen identitas belum tersedia. RAILHUB tidak meminta unggahan KTP sampai penyimpanan aman dan proses verifikasi resmi siap digunakan.',
  },
]

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [openIndex, setOpenIndex] = useState(0)

  const filteredFaqs = FAQ_ITEMS.filter(item => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    return matchesCat && matchesSearch
  })

  return (
    <div>
      <Navbar />

      <section className="rh-hero" style={{ padding: '4rem 0 3.5rem' }}>
        <div className="rh-container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="rh-badge" style={{ background: 'rgba(255,255,255,0.12)', color: 'var(--rh-accent)', border: '1px solid rgba(255,255,255,0.18)', marginBottom: '1rem' }}>
            <HelpCircle size={14} /> Pusat Informasi Penumpang
          </span>
          <h1 className="rh-h1" style={{ color: 'white', marginBottom: '0.75rem' }}>
            Pertanyaan yang Sering Diajukan (FAQ)
          </h1>
          <p className="rh-body-lg" style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 620 }}>
            Temukan jawaban lengkap mengenai pemesanan tiket, pemilihan kursi, e-boarding pass, reschedule, hingga layanan makanan di atas kereta.
          </p>
        </div>
      </section>

      <section className="rh-section" style={{ background: 'var(--rh-surface)' }}>
        <div className="rh-container" style={{ maxWidth: 880 }}>
          <div className="rh-card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--rh-text-3)' }} />
              <input
                type="search"
                className="rh-input"
                style={{ paddingLeft: 42 }}
                placeholder="Cari topik pertanyaan (mis. peron, reschedule, QR, makanan)…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.85rem' }}>
              {FAQ_CATEGORIES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveCategory(id)}
                  className={`rh-btn rh-btn-sm ${activeCategory === id ? 'rh-btn-primary' : 'rh-btn-ghost'}`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {filteredFaqs.map((item, idx) => {
              const isOpen = openIndex === idx
              return (
                <article key={item.q} className="rh-card">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '1.25rem 1.5rem',
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                    }}
                    aria-expanded={isOpen}
                  >
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--rh-text)' }}>{item.q}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        color: 'var(--rh-primary)',
                        flexShrink: 0,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 1.5rem 1.25rem', color: 'var(--rh-text-2)', lineHeight: 1.7, borderTop: '1px solid var(--rh-border)', paddingTop: '1rem' }}>
                      {item.a}
                    </div>
                  )}
                </article>
              )
            })}
            {filteredFaqs.length === 0 && (
              <div className="rh-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--rh-text-2)' }}>
                Tidak ada pertanyaan yang cocok dengan kata kunci tersebut.
              </div>
            )}
          </div>

          <div className="rh-card" style={{ marginTop: '2rem', padding: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <strong style={{ fontSize: '1.05rem', display: 'block' }}>Masih punya pertanyaan lain?</strong>
              <span style={{ color: 'var(--rh-text-2)', fontSize: '0.9rem' }}>Tim layanan pelanggan RAILHUB siap membantu Anda 24/7.</span>
            </div>
            <Link href="/contact" className="rh-btn rh-btn-primary">
              Hubungi Contact Service <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

