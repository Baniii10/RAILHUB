'use client'

import Navbar from '@/components/layout/Navbar'
import PageHeader from '@/components/layout/PageHeader'
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
        <PageHeader
          title="Komunitas Railfans"
          subtitle="Sejarah rel, showroom 3D lokomotif, dan galeri spotting."
          breadcrumbLabel="Komunitas Railfans"
        />

        {/* Unified Single-Page Flow */}
        <div className="rh-container pt-12 sm:pt-14 space-y-12">
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
