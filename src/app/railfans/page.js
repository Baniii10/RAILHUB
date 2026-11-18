'use client'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import DiscordCommunityBanner from '@/components/railfans/DiscordCommunityBanner'
import Locomotive3DViewer from '@/components/railfans/Locomotive3DViewer'
import RailwayHistorySection from '@/components/railfans/RailwayHistorySection'
import GalleryMarqueeSection from '@/components/railfans/GalleryMarqueeSection'
import ScrollReveal from '@/components/ui/ScrollReveal'

export default function RailfansPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--rh-bg)]">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Clean Editorial Header */}
        <section className="bg-[#0b1626] text-white border-b border-white/10" style={{ padding: '4.5rem 0 3rem' }}>
          <div className="rh-container">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/60 mb-3">
              <Link href="/" style={{ color: 'rgba(255,255,255,0.75)' }} className="no-underline hover:text-white">
                Beranda
              </Link>
              <span>/</span>
              <span className="text-[var(--rh-orange)] font-semibold">Komunitas Railfans</span>
            </nav>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight m-0">
              Komunitas Railfans RAILHUB
            </h1>
            <p className="text-sm sm:text-base text-white/75 m-0 mt-2 max-w-xl">
              Sejarah perkeretaapian Indonesia, showroom 3D lokomotif, galeri spotting, dan komunitas Discord.
            </p>
          </div>
        </section>

        {/* Unified Single-Page Flow */}
        <div className="rh-container pt-8 sm:pt-10 space-y-12">
          {/* 1. Sejarah (Compact Preview + Baca Selengkapnya) */}
          <ScrollReveal direction="up">
            <RailwayHistorySection />
          </ScrollReveal>

          {/* 2. Showroom 3D Lokomotif */}
          <ScrollReveal direction="left">
            <section aria-labelledby="showroom-3d-heading" className="space-y-4">
              <div className="pb-3 border-b border-[var(--rh-border)]">
                <h2 id="showroom-3d-heading" className="text-xl sm:text-2xl font-extrabold text-[var(--rh-blue)] m-0">
                  Showroom 3D Lokomotif
                </h2>
                <p className="text-xs sm:text-sm text-[var(--rh-text)] opacity-80 m-0 mt-0.5">
                  Putar 360°, nyalakan lampu sorot, dan bandingkan 4 seri lokomotif legendaris Indonesia.
                </p>
              </div>
              <Locomotive3DViewer />
            </section>
          </ScrollReveal>

          {/* 3. Galeri Foto Minimalis Sliding ke Kanan */}
          <ScrollReveal direction="right">
            <GalleryMarqueeSection />
          </ScrollReveal>

          {/* 4. Discord Bumper Chat + Invite */}
          <ScrollReveal direction="up">
            <DiscordCommunityBanner />
          </ScrollReveal>
        </div>
      </main>
    </div>
  )
}
