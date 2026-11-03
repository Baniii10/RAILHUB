'use client'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Compass,
  Cpu,
  Globe,
  Layers,
  MapPin,
  Lock,
  Shield,
  Sparkles,
  Train,
  Users,
  Wifi,
  Utensils,
  Zap,
} from 'lucide-react'

const TIMELINE = [
  {
    year: 'Fase 1 — Inisiasi & Riset',
    title: 'Perancangan Arsitektur Perkeretaapian Digital',
    desc: 'Memetakan jaringan 50 stasiun antarkota terverifikasi di Pulau Jawa serta menyusun model basis data relasional untuk jadwal, gerbong, kursi, dan tiket.',
  },
  {
    year: 'Fase 2 — Sistem Booking & Kursi Atomik',
    title: 'Pencegahan Kursi Ganda & E-Boarding QR',
    desc: 'Mengembangkan mesin reservasi kursi secara real-time dengan penguncian transaksi agar kursi pada jadwal yang sama tidak pernah terjual ganda.',
  },
  {
    year: 'Fase 3 — Sinergi Penumpang, Petugas & Admin',
    title: 'Operasional Langsung & Layanan Di Atas Kereta',
    desc: 'Menghubungkan pelacakan status kereta, validasi tiket oleh kondektur bertugas, pemesanan makanan onboard, hingga pelaporan barang hilang.',
  },
  {
    year: 'Fase 4 — Ekosistem Mobile-First',
    title: 'Pengalaman Aplikasi Modern Se-Pulau Jawa',
    desc: 'Menghadirkan antarmuka responsif bergaya aplikasi mobile dengan hitung mundur keberangkatan, informasi peron, dan program loyalitas penumpang.',
  },
]

const TEAM_MEMBERS = [
  {
    name: 'Bagas Permana Putra',
    nim: '2404140046',
    role: 'System Architect & Full-Stack Developer',
    focus: 'Arsitektur database Supabase, alur pemesanan tiket atomik, dan integrasi pembayaran.',
  },
  {
    name: 'Meca Rabbani Arianto',
    nim: '24041400xx',
    role: 'Lead UI/UX & Frontend Engineer',
    focus: 'Desain antarmuka mobile-first, pengalaman pengguna penumpang, dan pelacakan perjalanan.',
  },
  {
    name: 'Fawaz Zayana Atha Rasendriya',
    nim: '24041400xx',
    role: 'Operations & Backend Engineer',
    focus: 'Manajemen operasional admin, penugasan petugas, validasi QR, dan layanan onboard.',
  },
]

const FLEET_PORTFOLIO = [
  {
    code: 'KA 1',
    name: 'Argo Bromo Anggrek',
    corridor: 'Gambir (GMR) — Surabaya Gubeng (SGU)',
    classes: 'Eksekutif & Luxury Sleeper',
    highlights: ['Kursi rebah 140° ergonomis', 'Layar hiburan personal', 'Restorasi bistro modern', 'WiFi berkecepatan tinggi'],
  },
  {
    code: 'KA 34',
    name: 'Argo Parahyangan',
    corridor: 'Gambir (GMR) — Bandung (BD)',
    classes: 'Eksekutif & Ekonomi New Generation',
    highlights: ['Jendela panoramik jalur Priangan', 'Stopkontak di setiap kursi', 'Kabin kedap suara', 'Layanan antar makanan ke kursi'],
  },
  {
    code: 'KA 68',
    name: 'Taksaka',
    corridor: 'Gambir (GMR) — Yogyakarta (YK)',
    classes: 'Eksekutif & Luxury',
    highlights: ['Kabin Hype Trip ramah kerja', 'Lampu baca individual', 'Toilet vakum higienis', 'Ruang bagasi kabin luas'],
  },
  {
    code: 'KA 6',
    name: 'Argo Wilis',
    corridor: 'Bandung (BD) — Surabaya Gubeng (SGU)',
    classes: 'Eksekutif',
    highlights: ['Rute lintas selatan eksotis', 'Kursi captain seat putar', 'Sajian kuliner khas Nusantara', 'Pendingin udara adaptif'],
  },
  {
    code: 'KA 92',
    name: 'Lodaya',
    corridor: 'Bandung (BD) — Solo Balapan (SLO)',
    classes: 'Eksekutif & Ekonomi',
    highlights: ['Aksesibilitas ramah keluarga', 'Informasi stasiun digital', 'Layanan bantuan petugas sigap', 'Harga kompetitif'],
  },
]

export default function AboutPage() {
  return (
    <div>
      <Navbar />

      <section className="rh-hero" style={{ padding: '4.5rem 0 4rem' }}>
        <div className="rh-pattern-dots" style={{ position: 'absolute', inset: 0, opacity: 0.35 }} />
        <div className="rh-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 720 }}>
            <span className="rh-badge" style={{ background: 'rgba(255,255,255,0.12)', color: 'var(--rh-accent)', border: '1px solid rgba(255,255,255,0.18)', marginBottom: '1.25rem' }}>
              <Train size={14} /> Portofolio & Sejarah RAILHUB
            </span>
            <h1 className="rh-h1" style={{ color: 'white', marginBottom: '1rem' }}>
              Membangun Standar Baru Sistem Informasi Kereta Api
            </h1>
            <p className="rh-body-lg" style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.7 }}>
              RAILHUB adalah platform simulasi perjalanan kereta api terpadu di Pulau Jawa yang menyatukan pemesanan tiket, status perjalanan terjadwal, layanan restorasi di atas kereta, serta alur kerja Penumpang, Petugas, dan Admin.
            </p>
          </div>
        </div>
      </section>

      <section className="rh-section" style={{ background: 'var(--rh-white)' }}>
        <div className="rh-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '3.5rem' }}>
            {[
              { icon: MapPin, value: '50 Stasiun', label: 'Katalog stasiun antarkota terverifikasi di Pulau Jawa' },
              { icon: Train, value: '5 Armada Utama', label: 'Rangkaian kereta unggulan dengan konfigurasi gerbong & kursi lengkap' },
              { icon: Shield, value: '100% RLS', label: 'Keamanan Row Level Security Supabase berdasarkan role & kepemilikan' },
              { icon: Zap, value: '3 Role Terpadu', label: 'Sinergi langsung antara Penumpang, Petugas Kondektur, dan Admin' },
            ].map(({ icon: Icon, value, label }) => (
              <article key={value} className="rh-card">
                <div className="rh-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--rh-primary-light)', color: 'var(--rh-primary)', display: 'grid', placeItems: 'center' }}>
                    <Icon size={20} />
                  </div>
                  <strong style={{ fontSize: '1.35rem', color: 'var(--rh-text)' }}>{value}</strong>
                  <span style={{ color: 'var(--rh-text-2)', fontSize: '0.9rem' }}>{label}</span>
                </div>
              </article>
            ))}
          </div>

          <div style={{ maxWidth: 680, marginBottom: '2.25rem' }}>
            <span className="rh-badge rh-badge-primary" style={{ marginBottom: '0.6rem' }}>Sejarah & Evolusi</span>
            <h2 className="rh-h2">Perjalanan Pengembangan RAILHUB</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {TIMELINE.map((item, idx) => (
              <article key={item.year} className="rh-card" style={{ borderTop: '4px solid var(--rh-primary)' }}>
                <div className="rh-card-body">
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--rh-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    0{idx + 1} · {item.year}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--rh-text)' }}>{item.title}</h3>
                  <p style={{ color: 'var(--rh-text-2)', fontSize: '0.9rem', margin: 0, lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rh-section" style={{ background: 'var(--rh-surface)' }}>
        <div className="rh-container">
          <div style={{ maxWidth: 680, marginBottom: '2.25rem' }}>
            <span className="rh-badge rh-badge-primary" style={{ marginBottom: '0.6rem' }}>Portofolio Armada & Fasilitas</span>
            <h2 className="rh-h2">Standar Kenyamanan Rangkaian Kereta</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {FLEET_PORTFOLIO.map(train => (
              <article key={train.code} className="rh-card">
                <div className="rh-card-body" style={{ display: 'grid', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="rh-badge rh-badge-primary rh-mono">{train.code}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--rh-text-2)' }}>{train.classes}</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{train.name}</h3>
                    <span style={{ fontSize: '0.875rem', color: 'var(--rh-text-2)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                      <MapPin size={14} /> {train.corridor}
                    </span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.45rem' }}>
                    {train.highlights.map(feat => (
                      <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--rh-text-2)' }}>
                        <CheckCircle2 size={15} style={{ color: 'var(--rh-success)', flexShrink: 0 }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rh-section" style={{ background: 'var(--rh-white)' }}>
        <div className="rh-container">
          <div style={{ maxWidth: 680, marginBottom: '2.25rem' }}>
            <span className="rh-badge rh-badge-primary" style={{ marginBottom: '0.6rem' }}>Kelompok 14</span>
            <h2 className="rh-h2">Tim Penyusun RAILHUB</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {TEAM_MEMBERS.map(member => (
              <article key={member.name} className="rh-card">
                <div className="rh-card-body" style={{ display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: 'linear-gradient(135deg, var(--rh-primary), hsl(215,90%,38%))',
                      color: 'white', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '1.1rem',
                    }}>
                      {member.name[0]}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{member.name}</h3>
                      <span className="rh-mono" style={{ fontSize: '0.8rem', color: 'var(--rh-primary)', fontWeight: 700 }}>NIM: {member.nim}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--rh-text)' }}>{member.role}</div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--rh-text-2)', lineHeight: 1.6 }}>{member.focus}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="rh-card" style={{ marginTop: '2.5rem', padding: '2rem', background: 'var(--rh-navy)', color: 'white', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'white' }}>Siap Mencoba Simulasi Perjalanan RAILHUB?</h3>
              <p style={{ margin: '0.35rem 0 0', color: 'rgba(255,255,255,0.75)' }}>Cari jadwal kereta, pilih kursi di gerbong pilihan Anda, dan terbitkan e-boarding pass QR.</p>
            </div>
            <Link href="/trains" className="rh-btn rh-btn-accent">
              Cari Jadwal Sekarang <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── KEBIJAKAN PRIVASI, KEAMANAN & SYARAT KETENTUAN ── */}
      <section className="rh-section" style={{ background: 'var(--rh-surface)', borderTop: '1px solid var(--rh-border)', paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="rh-container">
          <div style={{ maxWidth: 700, marginBottom: '2rem' }}>
            <span className="rh-badge rh-badge-primary" style={{ marginBottom: '0.6rem' }}>
              <Shield size={13} /> Keamanan & Regulasi
            </span>
            <h2 className="rh-h2">Kebijakan Privasi & Keamanan Sistem</h2>
            <p className="rh-body-lg" style={{ color: 'var(--rh-text-2)', marginTop: '0.5rem' }}>
              RAILHUB menggunakan autentikasi, pembatasan akses berbasis role, dan kebijakan kepemilikan data untuk melindungi akun serta tiket pengguna.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="rh-card" style={{ padding: '1.5rem', background: '#ffffff' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(26, 66, 138, 0.1)', color: 'var(--rh-primary)', display: 'grid', placeItems: 'center', marginBottom: '1rem' }}>
                <Shield size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--rh-navy)', marginBottom: '0.5rem' }}>
                Transaksi & Pembayaran
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--rh-text-2)', lineHeight: 1.6, margin: 0 }}>
                Pembayaran yang terhubung ke gateway diproses melalui endpoint server. RAILHUB tidak meminta atau menyimpan nomor kartu pada formulir aplikasi ini.
              </p>
            </div>

            <div className="rh-card" style={{ padding: '1.5rem', background: '#ffffff' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'grid', placeItems: 'center', marginBottom: '1rem' }}>
                <CheckCircle2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--rh-navy)', marginBottom: '0.5rem' }}>
                Validasi QR E-Boarding
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--rh-text-2)', lineHeight: 1.6, margin: 0 }}>
                Kode tiket diperiksa terhadap data tiket dan status validasi. Akses menu validasi dibatasi untuk akun petugas yang terautentikasi.
              </p>
            </div>

            <div className="rh-card" style={{ padding: '1.5rem', background: '#ffffff' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255, 140, 0, 0.1)', color: 'var(--rh-accent)', display: 'grid', placeItems: 'center', marginBottom: '1rem' }}>
                <Lock size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--rh-navy)', marginBottom: '0.5rem' }}>
                Perlindungan Data Penumpang
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--rh-text-2)', lineHeight: 1.6, margin: 0 }}>
                Nomor identitas (NIK/KTP/Paspor), email, dan riwayat perjalanan penumpang disimpan dalam vault database terlindungi RLS (Row Level Security). Data tidak pernah diperjualbelikan kepada pihak ketiga.
              </p>
            </div>

            <div className="rh-card" style={{ padding: '1.5rem', background: '#ffffff' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(56, 189, 248, 0.1)', color: '#0284C7', display: 'grid', placeItems: 'center', marginBottom: '1rem' }}>
                <Cpu size={22} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--rh-navy)', marginBottom: '0.5rem' }}>
                Simulasi Edukasi Kereta Api
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--rh-text-2)', lineHeight: 1.6, margin: 0 }}>
                RAILHUB merupakan proyek simulasi komputasi web edukasi mahasiswa Kelompok 14. Jadwal, nama armada, dan simulasi e-boarding pass dibuat untuk mendemonstrasikan sistem reservasi pulau Jawa modern.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

