'use client'

import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import PageHeader from '@/components/layout/PageHeader'
import AboutNetworkBumperPlayer from '@/components/about/AboutNetworkBumperPlayer'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { ArrowRight } from 'lucide-react'

const KEY_STATS = [
  { value: '50', label: 'Stasiun Jawa' },
  { value: '5', label: 'Armada Utama' },
  { value: '3', label: 'Role Terpadu' },
  { value: 'RLS', label: 'Keamanan Data' },
]

const FLEET_HIGHLIGHTS = [
  {
    code: 'KA 1 · Argo Bromo Anggrek',
    corridor: 'Gambir – Surabaya Gubeng',
    image: '/images/gallery-train-hero.jpg',
  },
  {
    code: 'KA 34 · Argo Parahyangan',
    corridor: 'Gambir – Bandung',
    image: '/images/kelas-eksekutif.jpg',
  },
  {
    code: 'KA 68 · Taksaka Luxury',
    corridor: 'Gambir – Yogyakarta',
    image: '/images/kelas-luxury.webp',
  },
]

const TEAM_MEMBERS = [
  {
    name: 'Bagas Permana Putra',
    nim: '2404140046',
    role: 'System Architect & Full-Stack Developer',
  },
  {
    name: 'Meca Rabbani Arianto',
    nim: '24041400xx',
    role: 'Lead UI/UX & Frontend Engineer',
  },
  {
    name: 'Fawaz Zayana Atha Rasendriya',
    nim: '24041400xx',
    role: 'Operations & Backend Engineer',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--rh-bg)]">
      <Navbar />

      <main className="flex-1 pb-20">
        <PageHeader
          title="Tentang RAILHUB"
          subtitle="Platform reservasi dan informasi perjalanan kereta api Pulau Jawa."
          breadcrumbLabel="Tentang RAILHUB"
        />

        <div className="rh-container pt-12 sm:pt-16 space-y-14">
          {/* 1. Mission + Single Remotion Bumper */}
          <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-12 items-center">
            <ScrollReveal direction="left">
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--rh-blue)] m-0">
                    Arsitektur Perjalanan Digital
                  </h2>
                  <p className="text-sm sm:text-base text-[var(--rh-text)] opacity-85 m-0 leading-relaxed">
                    RAILHUB menghubungkan alur kerja Penumpang, Petugas Kondektur, dan Admin secara real-time dengan penguncian kursi transaksional agar tidak terjadi kursi ganda.
                  </p>
                </div>

                {/* Hairline Stats Row (No boxes) */}
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-[var(--rh-border)] m-0">
                  {KEY_STATS.map((stat) => (
                    <div key={stat.label}>
                      <dt className="text-xl sm:text-2xl font-extrabold text-[var(--rh-blue)]">{stat.value}</dt>
                      <dd className="text-xs text-[var(--rh-text-3)] m-0 mt-0.5">{stat.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.06}>
              <AboutNetworkBumperPlayer />
            </ScrollReveal>
          </section>

          {/* 2. Armada Utama (Clean Image Strip, No Box Slop) */}
          <ScrollReveal direction="up">
            <section className="space-y-5">
            <div className="flex items-end justify-between gap-4 pb-3 border-b border-[var(--rh-border)]">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--rh-blue)] m-0">
                  Armada & Koridor Utama
                </h2>
                <p className="text-xs sm:text-sm text-[var(--rh-text)] opacity-80 m-0 mt-0.5">
                  Rangkaian kereta antarkota dengan konfigurasi gerbong dan kelas layanan lengkap.
                </p>
              </div>

              <Link
                href="/trains"
                style={{ color: 'var(--rh-orange)' }}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold no-underline hover:underline shrink-0"
              >
                <span>Cari Jadwal</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FLEET_HIGHLIGHTS.map((item) => (
                <article key={item.code} className="space-y-2.5">
                  <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#0b1626]">
                    <Image
                      src={item.image}
                      alt={item.code}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-[var(--rh-blue)] m-0">
                      {item.code}
                    </h3>
                    <div className="text-xs text-[var(--rh-text-3)] mt-0.5">{item.corridor}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>
          </ScrollReveal>

          {/* 3. Tim Penyusun & Keamanan (Minimalist Editorial Grid) */}
          <ScrollReveal direction="up" delay={0.05}>
          <section className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-[var(--rh-border)]">
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-[var(--rh-blue)] m-0">
                Tim Penyusun · Kelompok 14
              </h2>
              <div className="divide-y divide-[var(--rh-border)]">
                {TEAM_MEMBERS.map((m) => (
                  <div key={m.name} className="py-3 first:pt-1 flex items-baseline justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-[var(--rh-blue)]">{m.name}</div>
                      <div className="text-xs text-[var(--rh-text-3)] mt-0.5">{m.role}</div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-[var(--rh-orange)] shrink-0">
                      {m.nim}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-[var(--rh-blue)] m-0">
                Keamanan & Simulasi Edukasi
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-[var(--rh-text)] opacity-85 leading-relaxed">
                <p className="m-0">
                  Data identitas dan riwayat perjalanan dilindungi Row Level Security (RLS) berbasis role. Validasi tiket QR hanya dapat diakses oleh akun petugas yang terautentikasi.
                </p>
                <p className="m-0">
                  RAILHUB merupakan proyek simulasi edukasi mahasiswa dan bukan situs resmi PT Kereta Api Indonesia.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/trains"
                  style={{ color: '#ffffff' }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--rh-orange)] text-white text-xs sm:text-sm font-bold no-underline hover:opacity-90 transition-opacity"
                >
                  <span>Mulai Cari Jadwal</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>
          </ScrollReveal>
        </div>
      </main>
    </div>
  )
}
