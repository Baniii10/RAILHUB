'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import PageHeader from '@/components/layout/PageHeader'
import toast from 'react-hot-toast'
import {
  CheckCircle2,
  ChevronDown,
  Frown,
  Heart,
  Laugh,
  Mail,
  MapPin,
  Meh,
  MessageCircle,
  Search,
  Send,
  Smile,
} from 'lucide-react'

const FAQ_CATEGORIES = [
  { id: 'all', label: 'Semua' },
  { id: 'booking', label: 'Pemesanan' },
  { id: 'payment', label: 'Pembayaran' },
  { id: 'boarding', label: 'E-Boarding' },
  { id: 'onboard', label: 'Layanan Kereta' },
]

const FAQ_ITEMS = [
  {
    category: 'booking',
    q: 'Berapa maksimal penumpang dalam satu transaksi?',
    a: 'Hingga 6 penumpang dewasa dalam satu transaksi dan Anda dapat memilih kursi langsung di denah gerbong.',
  },
  {
    category: 'booking',
    q: 'Apakah kursi yang sama bisa dipesan ganda?',
    a: 'Tidak. Kursi terkunci secara atomik saat booking dibuat sehingga tidak dapat dipesan pengguna lain.',
  },
  {
    category: 'payment',
    q: 'Metode pembayaran apa saja yang tersedia?',
    a: 'Simulasi pembayaran instan via QRIS, E-Wallet, dan Transfer Bank. Tiket QR terbit otomatis setelah konfirmasi.',
  },
  {
    category: 'payment',
    q: 'Bagaimana ketentuan reschedule atau pembatalan?',
    a: 'Reschedule dan pembatalan dapat dilakukan minimal 2 jam sebelum keberangkatan melalui menu Tiket Saya.',
  },
  {
    category: 'boarding',
    q: 'Kapan E-Boarding Pass & informasi peron muncul?',
    a: 'Nomor gerbong dan peron tampil di detail tiket, dan E-Boarding Pass aktif mulai 2 jam sebelum berangkat.',
  },
  {
    category: 'onboard',
    q: 'Bagaimana cara memesan makanan di kereta?',
    a: 'Buka menu Pesanan Kuliner pada tiket aktif yang sudah dibayar, lalu hidangan diantar langsung ke kursi Anda.',
  },
]

const STATION_DESKS = [
  { code: 'GMR', name: 'Gambir', hours: '24 Jam' },
  { code: 'BD', name: 'Bandung', hours: '24 Jam' },
  { code: 'YK', name: 'Yogyakarta', hours: '24 Jam' },
  { code: 'SLO', name: 'Solo Balapan', hours: '05.00–23.00' },
  { code: 'SGU', name: 'Surabaya Gubeng', hours: '24 Jam' },
]

const EMOT_SCALE = [
  { val: 1, icon: Frown, label: 'Kurang' },
  { val: 2, icon: Meh, label: 'Cukup' },
  { val: 3, icon: Smile, label: 'Baik' },
  { val: 4, icon: Laugh, label: 'Puas' },
  { val: 5, icon: Heart, label: 'Sangat Puas' },
]

export default function HelpContactPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [openIndex, setOpenIndex] = useState(0)

  // Contact form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [contactSent, setContactSent] = useState(false)

  // Kritik & Saran (like Home FeedbackSection)
  const [rating, setRating] = useState(4)
  const [feedback, setFeedback] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    return matchesCat && matchesSearch
  })

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281234567890'
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Halo layanan RAILHUB, saya butuh bantuan terkait perjalanan.'
  )}`

  function handleContactSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Lengkapi nama, email, dan pesan.')
      return
    }
    setContactSent(true)
    toast.success('Pesan berhasil dikirim!')
  }

  function handleFeedbackSubmit(e) {
    e.preventDefault()
    if (!feedback.trim()) {
      toast.error('Tuliskan kritik atau saran Anda.')
      return
    }
    setFeedbackSent(true)
    toast.success('Terima kasih! Kritik & saran Anda terkirim.')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--rh-bg)]">
      <Navbar />

      <main className="flex-1 pb-20">
        <PageHeader
          title="Bantuan & Kontak"
          subtitle="Jawaban cepat, layanan pelanggan, serta kritik dan saran."
          breadcrumbLabel="Bantuan & Kontak"
        />

        <div className="rh-container pt-12 sm:pt-14 space-y-14" style={{ maxWidth: 960 }}>
          {/* 1. FAQ Ringkas (Minimalist, tanpa box bertumpuk) */}
          <section aria-labelledby="faq-heading" className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--rh-border)]">
              <h2 id="faq-heading" className="text-xl font-extrabold text-[var(--rh-blue)] m-0">
                Pertanyaan Umum
              </h2>
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--rh-text-3)]" />
                <input
                  type="search"
                  className="rh-input"
                  style={{ paddingLeft: 36, height: 38, fontSize: '0.85rem' }}
                  placeholder="Cari topik…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {FAQ_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id)
                    setOpenIndex(0)
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-[var(--rh-blue)] text-white'
                      : 'bg-white text-[var(--rh-text-2)] border border-[var(--rh-border)] hover:border-[var(--rh-blue)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="divide-y divide-[var(--rh-border)] border-y border-[var(--rh-border)] bg-white rounded-2xl px-5 sm:px-6">
              {filteredFaqs.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--rh-text-3)] m-0">
                  Tidak ada pertanyaan yang cocok.
                </p>
              ) : (
                filteredFaqs.map((item, idx) => {
                  const isOpen = openIndex === idx
                  return (
                    <div key={item.q}>
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                        aria-expanded={isOpen}
                        className="w-full py-4 flex items-center justify-between gap-4 text-left bg-transparent border-0 cursor-pointer"
                      >
                        <span className="text-sm sm:text-base font-bold text-[var(--rh-text)]">
                          {item.q}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-[var(--rh-text-3)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isOpen && (
                        <p className="pb-4 pt-0 text-sm text-[var(--rh-text-2)] leading-relaxed m-0">
                          {item.a}
                        </p>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </section>

          {/* 2. Kontak & Kritik Saran (Minimalist 2-kolom) */}
          <section id="kontak" aria-labelledby="contact-heading" className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
            {/* Left: Direct Channels + Stations (No box slop) */}
            <div className="space-y-6">
              <div className="pb-3 border-b border-[var(--rh-border)]">
                <h2 id="contact-heading" className="text-xl font-extrabold text-[var(--rh-blue)] m-0">
                  Hubungi Kami
                </h2>
              </div>

              <div className="space-y-3 text-sm">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-2.5 border-b border-[var(--rh-border)] text-[var(--rh-text)] no-underline hover:text-[var(--rh-blue)]"
                >
                  <span className="inline-flex items-center gap-2.5 font-semibold">
                    <MessageCircle size={17} className="text-[#16a34a]" />
                    WhatsApp Layanan 24/7
                  </span>
                  <span className="text-xs font-bold text-[var(--rh-blue)]">Chat &rarr;</span>
                </a>

                <div className="flex items-center justify-between py-2.5 border-b border-[var(--rh-border)] text-[var(--rh-text)]">
                  <span className="inline-flex items-center gap-2.5 font-semibold">
                    <Mail size={17} className="text-[var(--rh-blue)]" />
                    Email Operasional
                  </span>
                  <span className="text-xs font-mono text-[var(--rh-text-2)]">support@railhub.id</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--rh-text-3)]">
                  <MapPin size={14} /> Meja Layanan Stasiun
                </div>
                <ul className="list-none p-0 m-0 divide-y divide-[var(--rh-border)] text-sm">
                  {STATION_DESKS.map((st) => (
                    <li key={st.code} className="py-2 flex items-center justify-between">
                      <span className="font-semibold text-[var(--rh-text)]">
                        <span className="font-mono text-xs text-[var(--rh-blue)] mr-2">{st.code}</span>
                        {st.name}
                      </span>
                      <span className="text-xs text-[var(--rh-text-3)]">{st.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Pesan Bantuan + Kritik & Saran */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl border border-[var(--rh-border)] p-5 sm:p-6 space-y-4">
                <h3 className="text-base font-extrabold text-[var(--rh-blue)] m-0">Kirim Pesan Bantuan</h3>
                {contactSent ? (
                  <div className="flex items-center justify-between gap-3 py-3 text-sm text-[#15803d]">
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <CheckCircle2 size={18} /> Pesan Anda telah diterima tim layanan.
                    </span>
                    <button
                      type="button"
                      className="rh-btn rh-btn-ghost rh-btn-sm"
                      onClick={() => {
                        setContactSent(false)
                        setMessage('')
                      }}
                    >
                      Kirim lagi
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="grid gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        className="rh-input"
                        placeholder="Nama lengkap"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <input
                        className="rh-input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <textarea
                      className="rh-input"
                      rows={3}
                      placeholder="Tulis kendala atau pertanyaan Anda…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      style={{ resize: 'vertical' }}
                    />
                    <button type="submit" className="rh-btn rh-btn-primary rh-btn-sm justify-self-start">
                      <Send size={14} /> Kirim Pesan
                    </button>
                  </form>
                )}
              </div>

              {/* Kritik & Saran (seperti Home) */}
              <div id="kritik-saran" className="bg-[var(--rh-primary)] text-white rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold m-0">Kritik & Saran</h3>
                    <p className="text-xs text-white/75 m-0 mt-0.5">Nilai pengalaman Anda menggunakan RAILHUB.</p>
                  </div>
                  <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating pengalaman">
                    {EMOT_SCALE.map(({ val, icon: Icon, label }) => {
                      const active = rating === val
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setRating(val)}
                          aria-label={label}
                          aria-pressed={active}
                          className={`w-9 h-9 rounded-full flex items-center justify-center border-0 cursor-pointer transition-transform ${
                            active ? 'bg-white text-[var(--rh-primary)] scale-110' : 'bg-white/15 text-white/80 hover:bg-white/25'
                          }`}
                        >
                          <Icon size={17} />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {feedbackSent ? (
                  <div className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <CheckCircle2 size={18} /> Terima kasih atas masukan Anda!
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackSent(false)
                        setFeedback('')
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/15 text-white text-xs font-bold border-0 cursor-pointer hover:bg-white/25"
                    >
                      Tulis lagi
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      className="flex-1 rounded-xl px-3.5 py-2.5 text-sm text-[var(--rh-text)] bg-white border-0 outline-none"
                      placeholder="Tulis kritik atau saran untuk RAILHUB…"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-[var(--rh-accent)] text-[var(--rh-navy)] font-extrabold text-sm border-0 cursor-pointer hover:brightness-105 shrink-0"
                    >
                      Kirim Saran
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
