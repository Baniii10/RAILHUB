'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, Sparkles, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

function DiscordIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

export default function DiscordCommunityBanner() {
  const router = useRouter()
  const { user } = useAuth()
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_URL || 'https://discord.gg/railhub'

  const handleJoinClick = (e) => {
    if (!user) {
      e.preventDefault()
      toast('Silakan login terlebih dahulu untuk verifikasi badge keanggotaan Railfans Discord!', {
        icon: '🔒',
        duration: 3500,
      })
      router.push('/auth/login?next=%2Frailfans')
      return
    }

    toast.success('Mengalihkan ke server Discord Komunitas Railfans...', {
      icon: '🚆',
      duration: 3000,
    })
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #5865F2 0%, #4752C4 50%, #353ca3 100%)',
        color: '#ffffff',
        borderRadius: 20,
        padding: 'clamp(1.25rem, 3vw, 1.75rem)',
        boxShadow: '0 12px 35px rgba(88, 101, 242, 0.32)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        marginBottom: '2.5rem',
      }}
    >
      {/* Background Watermark */}
      <div
        style={{
          position: 'absolute',
          right: '-25px',
          bottom: '-35px',
          opacity: 0.12,
          pointerEvents: 'none',
          color: '#ffffff',
        }}
      >
        <DiscordIcon size={210} />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '0.25rem 0.75rem',
              borderRadius: 999,
              fontSize: '0.78rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            <Sparkles size={14} color="#FDE047" />
            <span>Server Resmi Komunitas Railfans Indonesia</span>
          </div>

          <h3
            style={{
              fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)',
              fontWeight: 800,
              margin: '0 0 0.35rem',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <span>Gabung Komunitas Discord Railfans</span>
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: 620,
              lineHeight: 1.55,
            }}
          >
            Diskusikan spot hunting kereta terbaik, bagikan foto dan jadwal lokomotif dinas (CC 206, CC 201, CC 203, CC 300), serta dapatkan teman perjalanan sesama pecinta kereta api.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              marginTop: '0.85rem',
              fontSize: '0.82rem',
              color: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
              <span><strong>1.480+</strong> Railfans Online</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="#FDE047" />
              <span>Verifikasi Akun Resmi</span>
            </div>
          </div>
        </div>

        <div>
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleJoinClick}
            className="rh-btn"
            style={{
              background: '#FFFFFF',
              color: '#5865F2',
              fontWeight: 800,
              fontSize: '0.92rem',
              padding: '0.75rem 1.6rem',
              borderRadius: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.2)',
              textDecoration: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            <DiscordIcon size={20} />
            <span>Join Discord Railfans</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  )
}

